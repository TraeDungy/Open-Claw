import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _files = null;
let _frequencies = null;

export function loadFiles() {
  if (!_files) {
    _files = JSON.parse(readFileSync(join(__dirname, "data/files.json"), "utf8"));
  }
  return _files;
}

export function loadFrequencies() {
  if (!_frequencies) {
    _frequencies = JSON.parse(readFileSync(join(__dirname, "data/frequencies.json"), "utf8"));
  }
  return _frequencies;
}

export function invalidateCache() {
  _files = null;
  _frequencies = null;
}

export function resolveEntry(source) {
  const { page, tab, index } = source;
  const data = page === "files" ? loadFiles() : loadFrequencies();
  const arr = data[tab];
  if (!arr || index >= arr.length) return null;
  return arr[index];
}

export function generateContentCalendar() {
  const files = loadFiles();
  const freq = loadFrequencies();
  const calendar = [];

  const addAll = (source, tab, type) => {
    const data = source === "files" ? files : freq;
    for (let i = 0; i < (data[tab]?.length || 0); i++) {
      calendar.push({ type, page: source, tab, index: i, entry: data[tab][i] });
    }
  };

  addAll("files", "declassified", "spotlight");
  addAll("frequencies", "solfeggio", "deep-dive");
  addAll("files", "individuals", "profile");
  addAll("files", "schools", "institute");
  addAll("files", "studies", "study");
  addAll("frequencies", "ancient", "deep-dive");
  addAll("frequencies", "tibetan", "deep-dive");
  addAll("frequencies", "science", "deep-dive");
  addAll("files", "disclosure", "spotlight");
  addAll("frequencies", "organs", "deep-dive");

  return calendar;
}
