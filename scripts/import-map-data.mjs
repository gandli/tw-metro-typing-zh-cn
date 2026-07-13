import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TAIWAN_URL = "https://taiwan.md/assets/geo/taiwan-country.topo.json";

const response = await fetch(TAIWAN_URL);
if (!response.ok)
  throw new Error(`Taiwan map data download failed: ${response.status}`);

const topology = await response.json();
const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, "../public/data");

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "taiwan-counties.topo.json"),
  `${JSON.stringify(topology)}\n`,
);

console.log("Updated public/data/taiwan-counties.topo.json.");
