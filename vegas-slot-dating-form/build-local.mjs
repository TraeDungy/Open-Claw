/* Build a single-file, no-server POLY SWIPE: poly-swipe-local.html
 *
 * Inlines styles, app code, fonts, and SVG assets into one HTML file that
 * works opened directly (file://). Submissions download as a one-row CSV
 * in the canonical 180-column schema, plus a localStorage backup.
 *
 * Run:  node build-local.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HEADER } from './schema.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => readFile(path.join(__dirname, f));
const b64 = async (f) => (await read(f)).toString('base64');

let html = (await read('index.html')).toString('utf8');
let css = (await read('styles.css')).toString('utf8');
const js = (await read('app.js')).toString('utf8');

// inline fonts into the CSS
for (const font of ['titan-one-latin', 'nunito-latin', 'yellowtail-latin']) {
  css = css.replace(`url('fonts/${font}.woff2')`,
    `url('data:font/woff2;base64,${await b64(`fonts/${font}.woff2`)}')`);
}

// inline SVG assets referenced from the HTML
for (const svg of ['swipe-right', 'swipe-left']) {
  html = html.replaceAll(`assets/${svg}.svg`,
    `data:image/svg+xml;base64,${await b64(`assets/${svg}.svg`)}`);
}

// drop font preloads, inline the stylesheet and the app
// (replacer functions: literal replacements would mangle $' / $& in the code)
html = html
  .replace(/<link rel="preload"[^>]*>\s*/g, '')
  .replace('<link rel="stylesheet" href="styles.css" />', () => `<style>\n${css}\n</style>`)
  .replace('<script src="app.js"></script>',
    () => `<script>\nwindow.PS_LOCAL = { header: ${JSON.stringify(HEADER)} };\n${js}\n</script>`);

const out = path.join(__dirname, 'poly-swipe-local.html');
await writeFile(out, html);
console.log(`built ${out} (${(html.length / 1024).toFixed(0)} KB, ${HEADER.length}-column schema embedded)`);
