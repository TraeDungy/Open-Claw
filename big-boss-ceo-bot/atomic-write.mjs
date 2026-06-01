/**
 * Atomic JSON file write — write to .tmp then rename.
 * Prevents corruption if process is killed mid-write.
 */
import { writeFileSync, renameSync } from 'fs';

export function atomicWriteJSON(filePath, data) {
  const tmp = filePath + '.tmp';
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, filePath);
}
