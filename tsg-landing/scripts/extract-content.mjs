/**
 * Extract archive data from TSX page files into standalone JSON.
 * Run once: node scripts/extract-content.mjs
 *
 * Strategy: Read each TSX file, find all `const NAME = [` blocks,
 * extract the array content, eval it in a safe context, write as JSON.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function extractArrays(filePath, arrayNames) {
  const src = readFileSync(filePath, "utf8");
  const result = {};

  for (const name of arrayNames) {
    // Find `const NAME = [`
    const startPattern = `const ${name} = [`;
    const startIdx = src.indexOf(startPattern);
    if (startIdx === -1) {
      console.warn(`  ⚠ Array "${name}" not found in ${filePath}`);
      continue;
    }

    // Find the matching closing `];` by counting brackets
    let depth = 0;
    let arrayStart = startIdx + startPattern.length - 1; // position of `[`
    let i = arrayStart;
    do {
      if (src[i] === "[") depth++;
      else if (src[i] === "]") depth--;
      i++;
    } while (depth > 0 && i < src.length);

    const arrayStr = src.slice(arrayStart, i);

    // Evaluate the array in an isolated context
    try {
      const fn = new Function(`return ${arrayStr}`);
      result[name] = fn();
      console.log(`  ✓ ${name}: ${result[name].length} entries`);
    } catch (err) {
      console.error(`  ✗ Failed to parse "${name}":`, err.message);
    }
  }

  return result;
}

// Extract files page data
console.log("Extracting files/page.tsx...");
const filesData = extractArrays(
  join(ROOT, "app/files/page.tsx"),
  ["declassified", "disclosure", "studies", "individuals", "schools", "timeline", "media"]
);

// Extract frequencies page data
console.log("\nExtracting frequencies/page.tsx...");
const freqData = extractArrays(
  join(ROOT, "app/frequencies/page.tsx"),
  ["solfeggio", "organs", "ancient", "tibetan", "science", "brainwaves", "timeline", "media"]
);

// Write JSON files
writeFileSync(join(ROOT, "data/files.json"), JSON.stringify(filesData, null, 2));
console.log(`\n✓ data/files.json written (${Object.keys(filesData).length} arrays)`);

writeFileSync(join(ROOT, "data/frequencies.json"), JSON.stringify(freqData, null, 2));
console.log(`✓ data/frequencies.json written (${Object.keys(freqData).length} arrays)`);

// Summary
let totalFiles = 0, totalFreq = 0;
for (const arr of Object.values(filesData)) totalFiles += arr.length;
for (const arr of Object.values(freqData)) totalFreq += arr.length;
console.log(`\nTotal: ${totalFiles} file entries + ${totalFreq} frequency entries = ${totalFiles + totalFreq} content items`);
