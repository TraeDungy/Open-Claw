import { writeFileSync, renameSync } from "fs";

export function atomicWriteJSON(path, data) {
  const tmp = path + ".tmp";
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, path);
}
