# MCP Server Design Best Practices — Research Report

## 1. Stdio vs HTTP Transport Tradeoffs

### Current: StdioServerTransport (from @modelcontextprotocol/sdk)

**Strengths:**
- **Zero configuration** — no ports, no CORS, no auth. The MCP client spawns the server as a child process and communicates over stdin/stdout.
- **Simple lifecycle** — process start = server start, process exit = server exit. No health checks needed.
- **Secure by default** — no network surface. The server can only be reached by the client that launched it.
- **Ideal for local tooling** — Claude Desktop, Claude Code, VS Code extensions all use stdio.
- **Stderr for logging** — `console.error()` goes to stderr (visible to the user), stdout is the MCP protocol channel.

**Weaknesses:**
- **No remote access** — the server can't be called from another machine or shared across clients.
- **Process-per-client** — each client spawns its own server process. No connection pooling.
- **No streaming for large payloads** — the entire response must fit in one JSON-RPC message. For the Elementor server, `build_site` returns a text summary, but the actual file output is written to disk (side-stepping this limit).
- **No HTTP caching, load balancing, or middleware** — you get none of the web ecosystem.

### HTTP Transport (SSE / Streamable HTTP)

**Strengths:**
- **Remote access** — one server can serve many clients over the network.
- **Connection pooling** — single process handles all requests.
- **Standard web infrastructure** — can put behind nginx, add auth middleware, rate limiting, logging.
- **Better for long-running operations** — SSE supports streaming responses.

**Weaknesses:**
- **Configuration burden** — need to choose port, handle CORS, implement auth.
- **Security surface** — must validate origins, tokens, rate-limit.
- **More complex deployment** — needs process management (PM2, systemd, Docker).

### Recommendation for Elementor MCP

**Keep stdio as the primary transport.** The server is a local development tool that writes files to disk. HTTP would add complexity without benefit. However, consider adding an optional HTTP/SSE mode for:
- A future "Elementor Cloud" service where the MCP server runs on a remote WordPress host
- Multi-user scenarios where a team shares one server instance

The SDK supports both transports; the architecture should abstract transport selection behind a factory:

```typescript
const transport = useHttp
  ? new HttpServerTransport({ port: 3100 })
  : new StdioServerTransport();
await server.connect(transport);
```

---

## 2. Tool Definition Structure — Naming, Schemas, Descriptions

### Naming Conventions (from the spec and SDK examples)

**Best practices observed in the existing server:**
- **`snake_case`** — `list_widgets`, `get_widget_schema`, `build_page`, `build_site`, `generate_theme`, `learn_from_export`. This is the MCP convention.
- **Verb-noun pattern** — `list_*` for discovery, `get_*` for single items, `build_*` for creation, `generate_*` for derived output, `validate_*` for checks.
- **Consistent prefix grouping** — all Elementor-related tools start with domain-specific verbs.

**What the spec says:**
- Tool names should be unique within a server
- Use `snake_case` (not camelCase or kebab-case)
- Group related tools with consistent prefixes
- Avoid overly generic names that could conflict with other MCP servers

### Input Schema Best Practices

**Current server patterns (good):**
- Uses `zod` for schema definition — provides runtime validation AND TypeScript types
- `z.any()` for complex nested objects (blueprint, site, seo) — necessary because MCP clients may serialize structured input as JSON strings
- `z.enum()` for constrained choices (categories, formats, personalities)
- `z.string().optional()` for optional parameters
- `.describe()` on every field — critical for the LLM to understand what to pass

**The `coerceObject` pattern** (lines 60-67 in server.ts) is a best practice for handling the ambiguity of how MCP clients serialize structured data:

```typescript
function coerceObject<T>(v: T | string): T {
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "") return v as T;
    return JSON.parse(trimmed) as T;
  }
  return v;
}
```

**Improvements needed:**
- Some tools use `z.any()` where a more specific schema would help the LLM (e.g., `generate_seo`'s `seo` parameter, `build_page`'s `blueprint` parameter)
- Consider using `z.object()` with nested schemas for the blueprint/site types instead of `z.any()`
- The `build_site` tool's `site` parameter is `z.any()` — a structured schema would help the LLM understand the expected shape

### Description Best Practices

**Current server (excellent):**
- Descriptions are detailed and actionable — they tell the LLM *when* to call the tool, *what* it does, and *what to do with the result*
- Example: `generate_theme` description says "Run after intake so the palette is built around the client's brand, not a generic template."
- Descriptions include workflow guidance: "Read this before building", "Run first", "Call before using an unfamiliar widget"

**Key pattern — descriptions as workflow instructions:**
The descriptions effectively encode a multi-step workflow (intake → theme → build → SEO) that guides the LLM through the correct sequence. This is a best practice for MCP servers that have a required call order.

---

## 3. Resource Definitions vs Tools

### Current server: No resources defined

The server only exposes tools. This is appropriate for a code-generation server, but resources could add value.

### MCP Spec Distinction

| Aspect | Tools | Resources |
|--------|-------|-----------|
| **Purpose** | Actions that do things (create, transform, compute) | Data that can be read (documents, schemas, state) |
| **Idempotent** | No — tools can have side effects | Yes — reading a resource should not change state |
| **Parameters** | Required — tools need input | Optional — resources have a URI |
| **Return** | Arbitrary content (text, JSON, files) | Structured content with MIME type |
| **Use case** | "Build a page", "Generate a theme" | "Get the widget catalog", "Read the design playbook" |

### What could be Resources in Elementor MCP

Currently, `get_design_playbook`, `list_widgets`, `get_widget_schema`, `list_templates`, `get_template`, and `get_intake_brief` are tools that *read data* — they could be resources instead:

```typescript
server.resource(
  "design-playbook",
  "elementor://design-playbook",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: await readFile(designPlaybookPath, "utf-8"),
      mimeType: "text/markdown",
    }]
  })
);
```

**Why keep them as tools for now:**
- Resources use URI-based addressing, which is less ergonomic for LLMs than named tools
- Tools can accept parameters (e.g., `get_widget_schema` needs a `type` parameter)
- The MCP client ecosystem has better tool discovery than resource discovery
- Resources are better for static content that doesn't need parameters

**Recommendation:** Keep discovery endpoints as tools for now. Add resources only for truly static reference data (e.g., the design playbook could be both a tool AND a resource).

---

## 4. Prompt Templates

### Current server: No prompt templates defined

The MCP spec supports `Prompts` — pre-defined templates that guide the LLM's behavior. The server doesn't use them.

### What prompts could add

```typescript
server.prompt(
  "build-landing-page",
  { industry: z.string(), brandColor: z.string() },
  ({ industry, brandColor }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Build a landing page for a ${industry} company with brand color ${brandColor}.
Follow this workflow:
1. Call get_intake_brief to gather requirements
2. Call generate_theme with the brand color
3. Read the design playbook
4. Design a blueprint with hero, features, CTA, and contact sections
5. Call build_page to compile it`
      }
    }]
  })
);
```

**Benefits:**
- Encodes the multi-step workflow directly into the MCP protocol
- Reduces the need for verbose tool descriptions to guide the LLM
- Provides a "starter template" for common tasks

**Recommendation:** Add prompt templates for the common workflows:
- `build-landing-page` — full landing page from scratch
- `build-site` — multi-page site with header/footer
- `learn-widget` — teach the server a new widget from an export

---

## 5. Error Handling Patterns

### Current server patterns

**1. Try/catch with `fail()` helper:**
```typescript
function fail(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true };
}
```
The `isError: true` flag is critical — it tells the MCP client that the tool call failed, so the LLM can retry or report the error.

**2. Input validation at the top of handlers:**
```typescript
if (!input || !input.title) return fail("seo.title is required.");
if (!s || !Array.isArray(s.pages) || s.pages.length === 0) {
  return fail("Site must have a non-empty `pages` array.");
}
```

**3. Error messages include actionable information:**
```typescript
return fail(`Unknown type "${type}". Call list_widgets to see options.`);
return fail(`Unknown template "${name}". Call list_templates to see options.`);
```

**4. Structured error responses:**
The `fail()` function returns `{ content: [...], isError: true }` — this is the MCP standard error format.

### Best practices for improvement

**1. Add error codes / categories:**
```typescript
function fail(text: string, code?: string) {
  return {
    content: [{ type: "text", text: code ? `[${code}] ${text}` : text }],
    isError: true,
  };
}
```

**2. Separate validation from execution:**
The `validate_blueprint` tool already does this — it compiles in memory without writing. This is a great pattern. Consider adding validation to `build_page` and `build_site` as a pre-check before writing.

**3. Handle file system errors gracefully:**
The `build_page` tool creates the output directory if it doesn't exist (`mkdir(dir, { recursive: true })`), but doesn't handle the case where the directory can't be created (permissions, disk full). Add try/catch around file writes.

**4. Return partial results on failure:**
For `build_site`, if one page fails, the others should still be written. Currently, a single failure aborts the entire build.

---

## 6. CRUD Operations for a Content Management System

### Current architecture

The Elementor MCP server uses a **compile-only** model — it takes a blueprint and produces Elementor JSON. There's no CRUD because there's no persistent state. The server is a compiler, not a database.

### If adding CRUD (e.g., for managing templates, widgets, or site configurations)

**Recommended patterns:**

**1. Resource naming:**
```
list_templates      → GET /templates
get_template        → GET /templates/{name}
create_template     → POST /templates
update_template     → PUT /templates/{name}
delete_template     → DELETE /templates/{name}
```

**2. Consistent parameter patterns:**
```typescript
// CREATE
server.registerTool("create_template", {
  inputSchema: {
    name: z.string(),
    description: z.string(),
    params: z.any(),
    example: z.any(),
  },
}, async ({ name, description, params, example }) => { ... });

// READ (single)
server.registerTool("get_template", {
  inputSchema: { name: z.string() },
}, async ({ name }) => { ... });

// READ (list)
server.registerTool("list_templates", {
  inputSchema: {
    category: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  },
}, async ({ category, limit, offset }) => { ... });

// UPDATE
server.registerTool("update_template", {
  inputSchema: {
    name: z.string(),
    description: z.string().optional(),
    params: z.any().optional(),
  },
}, async ({ name, ...updates }) => { ... });

// DELETE
server.registerTool("delete_template", {
  inputSchema: { name: z.string() },
}, async ({ name }) => { ... });
```

**3. Idempotency for updates:**
Use PUT (replace entire resource) rather than PATCH (partial update) for simplicity. The LLM can always send the full object.

**4. Soft deletes for safety:**
```typescript
server.registerTool("delete_template", {
  inputSchema: { name: z.string(), permanent: z.boolean().optional() },
}, async ({ name, permanent }) => {
  if (permanent) {
    // Hard delete
  } else {
    // Soft delete (mark as deleted)
  }
});
```

### Current server's CRUD-like operations

The `learn_from_export` tool is essentially a CREATE/UPDATE operation on the widget schema registry. It:
1. Reads an Elementor export
2. Extracts widget schemas
3. Merges them into a persistent JSON file (`reference/widget-schemas.json`)
4. Returns a summary

This is a good pattern for a self-improving system.

---

## 7. Pagination Patterns for Large Result Sets

### Current server: No pagination

The `list_widgets` tool returns all widgets at once (currently ~40 items). The `list_templates` tool returns all templates. This is fine for small datasets.

### When pagination is needed

If the server grows to support:
- Listing all pages in a site (potentially hundreds)
- Searching widgets by name/type
- Browsing the learned schema registry
- Listing templates with filtering

### Recommended pagination pattern

```typescript
server.registerTool("list_widgets", {
  inputSchema: {
    category: z.string().optional(),
    limit: z.number().min(1).max(100).optional().default(20),
    offset: z.number().min(0).optional().default(0),
    search: z.string().optional(),
  },
}, async ({ category, limit, offset, search }) => {
  let filtered = WIDGETS;
  if (category) filtered = filtered.filter(w => w.category === category);
  if (search) filtered = filtered.filter(w =>
    w.type.includes(search) || w.description.includes(search)
  );
  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  return ok(JSON.stringify({
    items: page,
    total,
    limit,
    offset,
    hasMore,
    nextOffset: hasMore ? offset + limit : undefined,
  }));
});
```

**Key design decisions:**
- **Offset-based pagination** — simpler for LLMs than cursor-based. The LLM can reason about "page 2" more naturally than "after this opaque cursor."
- **Include `total` and `hasMore`** — so the LLM knows if there are more results to fetch.
- **Return JSON, not formatted text** — the LLM can parse JSON more reliably than text for structured data.
- **Default limit of 20** — keeps responses manageable. The LLM can request more if needed.

### Alternative: Cursor-based pagination

For very large datasets or real-time data:

```typescript
server.registerTool("list_widgets", {
  inputSchema: {
    cursor: z.string().optional(),
    limit: z.number().optional().default(20),
  },
}, async ({ cursor, limit }) => {
  const { items, nextCursor } = await getPage(cursor, limit);
  return ok(JSON.stringify({ items, nextCursor }));
});
```

**Recommendation:** Use offset-based for the Elementor server. It's simpler and the datasets are small enough that offset-based pagination is fine.

---

## 8. File Output from MCP Tools

### Current approach

The server writes files to disk and returns a text summary with the file path:

```typescript
return ok(`Wrote ${file}\nTitle: "${doc.title}" • sections: ${doc.content.length} • elements: ${count}${seoLine}\nImport the .json into Elementor...`);
```

**This is the correct pattern for stdio-based MCP servers.** The MCP protocol doesn't have a native "file attachment" mechanism — all responses are text content. Writing to disk and returning the path is the standard workaround.

### Best practices for file output

**1. Configurable output directory:**
```typescript
const outputDir = process.env.ELEMENTOR_MCP_OUT || path.join(process.cwd(), "output");
```
This lets the user control where files go. The current server does this well.

**2. Create directories automatically:**
```typescript
if (!existsSync(dir)) await mkdir(dir, { recursive: true });
```
The current server does this. Good.

**3. Return the full path, not just the filename:**
The current server returns `Wrote ${file}` where `file` is the full path. This is correct — the user needs to know exactly where the file is.

**4. Include metadata in the response:**
The current server includes element count, section count, and SEO sidecar info. This helps the LLM confirm the output is correct.

**5. Sidecar files for related data:**
The SEO sidecar pattern (`page.seo.json` alongside `page.json`) is excellent — it keeps the main output clean while providing related data.

**6. Manifest files for batch operations:**
The `site-manifest.json` written by `build_site` is a best practice — it gives the user a single entry point for multi-file output.

### Alternative: Return file content inline

For small files, you could return the content inline:

```typescript
return {
  content: [
    { type: "text", text: `File: ${name}.json` },
    { type: "text", text: JSON.stringify(doc) },
  ],
};
```

**Tradeoff:** This works for small files but breaks for large Elementor exports (which can be 10MB+). The MCP protocol has no streaming for large payloads. Writing to disk is more reliable.

### Recommendation for improvement

Add a `dryRun` option to `build_page` and `build_site` that returns the compiled JSON inline without writing:

```typescript
server.registerTool("build_page", {
  inputSchema: {
    blueprint: z.any(),
    outputDir: z.string().optional(),
    dryRun: z.boolean().optional().describe("If true, return the compiled JSON inline without writing to disk."),
  },
}, async ({ blueprint, outputDir, dryRun }) => {
  const doc = compileBlueprint(coerceObject(blueprint));
  if (dryRun) {
    return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
  }
  // ... write to disk as before
});
```

---

## Summary: Architecture Evaluation

### What the server does well

1. **Clean separation of concerns** — compiler logic is separate from MCP transport
2. **Excellent tool descriptions** — detailed, actionable, workflow-aware
3. **Consistent error handling** — `ok()`/`fail()` pattern with `isError` flag
4. **Good naming conventions** — `snake_case`, verb-noun, domain-specific
5. **Self-improving design** — `learn_from_export` lets the server grow without code changes
6. **Proper file output** — writes to configurable directory, returns full paths
7. **Validation before execution** — `validate_blueprint` tool
8. **Token resolution** — `{colors.primary}` pattern is elegant
9. **Template expansion** — section templates reduce boilerplate
10. **Comprehensive test suite** — `selftest.ts` validates the full compilation pipeline

### What could be improved

1. **Add prompt templates** — encode the intake→theme→build→SEO workflow as reusable prompts
2. **Add pagination** — to `list_widgets` and `list_templates` for future scalability
3. **Add `dryRun` option** — to `build_page` and `build_site` for preview without file writes
4. **Add resources** — for static reference data (design playbook, widget catalog)
5. **Improve input schemas** — replace `z.any()` with structured `z.object()` schemas where feasible
6. **Add error codes** — to help LLMs distinguish error types
7. **Add HTTP transport option** — for future remote access scenarios
8. **Add CRUD operations** — for managing templates, widget schemas, and site configurations
9. **Add pagination metadata** — to list operations (total count, hasMore, nextOffset)
10. **Add workflow prompts** — `build-landing-page`, `build-site`, `learn-widget` as reusable prompt templates
