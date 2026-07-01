/**
 * Test setup — shared utilities and a sample blueprint used across tests.
 */
import { compileBlueprint, compileSite, Blueprint, BlueprintNode } from "../compiler.js";

/** A minimal valid blueprint for testing. */
export function makeTestBlueprint(overrides: Partial<Blueprint> = {}): Blueprint {
  return {
    title: "Test Page",
    theme: {
      colors: {
        primary: "#1A2D5A",
        accent: "#E8743B",
        bg: "#FFFFFF",
        surface: "#F6F8FB",
        text: "#1A1A1A",
        muted: "#5B6472",
      },
      radius: { md: "1rem", lg: "1.75rem" },
    },
    tree: [
      { type: "heading", level: 1, text: "Hello World", style: { color: "{colors.primary}" } },
    ],
    ...overrides,
  };
}

/** Count all nodes recursively (including children). */
export function countAllNodes(nodes: Array<{ elements?: unknown[] }>): number {
  let n = 0;
  for (const node of nodes) {
    n += 1;
    if (Array.isArray(node.elements)) n += countAllNodes(node.elements as Array<{ elements?: unknown[] }>);
  }
  return n;
}

/** Check if any value in an object graph contains $$type. */
export function hasAtomicType(obj: unknown): boolean {
  if (obj === null || obj === undefined) return false;
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    if ("$$type" in o) return true;
    for (const v of Object.values(o)) {
      if (hasAtomicType(v)) return true;
    }
  }
  if (Array.isArray(obj)) {
    for (const v of obj) {
      if (hasAtomicType(v)) return true;
    }
  }
  return false;
}

export { compileBlueprint, compileSite };
export type { Blueprint, BlueprintNode };