#!/usr/bin/env node
/**
 * CLI script to run learnFromDoc on one or more Elementor export JSON files.
 * Usage: node dist/learn-cli.js <file1.json> [file2.json ...]
 */
import { readFile } from "node:fs/promises";
import { learnFromDoc } from "./learn.js";

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: node dist/learn-cli.js <file1.json> [file2.json ...]");
    process.exit(1);
  }
  for (const file of files) {
    try {
      const json = JSON.parse(await readFile(file, "utf-8"));
      if (!json || !Array.isArray(json.content)) {
        console.error(`Skipping ${file}: not a valid Elementor export (missing content array)`);
        continue;
      }
      const { summary } = await learnFromDoc(json, file.split("/").pop() ?? file);
      console.log(summary);
      console.log("");
    } catch (e) {
      console.error(`Error learning from ${file}: ${(e as Error).message}`);
    }
  }
  console.log("Learning complete.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});