import { readFile, writeFile } from "node:fs/promises";
import { compileBlueprint } from "./dist/compiler.js";

const BP = "C:/Users/Smech/OneDrive/Desktop/HTTP Blocks for SIMPLYHR/output/simplyhr-home.blueprint.json";
const OUT = "C:/Users/Smech/OneDrive/Desktop/HTTP Blocks for SIMPLYHR/output/simplyhr-home.json";

function countNodes(nodes) {
  let n = 0;
  for (const node of nodes) {
    n += 1;
    if (Array.isArray(node.elements)) n += countNodes(node.elements);
  }
  return n;
}

const blueprint = JSON.parse(await readFile(BP, "utf-8"));
const doc = compileBlueprint(blueprint);
await writeFile(OUT, JSON.stringify(doc), "utf-8");
console.log(`Wrote ${OUT}`);
console.log(`Title: "${doc.title}" | top-level sections: ${doc.content.length} | total elements: ${countNodes(doc.content)}`);
