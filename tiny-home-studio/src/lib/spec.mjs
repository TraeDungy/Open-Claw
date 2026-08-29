/**
 * The "hand this to a builder" document: a single printable HTML page with the
 * plan drawing, room and opening schedules, the code report, the budget and the
 * bill of materials. Print to PDF from the browser and it paginates cleanly.
 */

import { CONTAINER_CONDITIONS, FLOOR_BUILDUPS, INSULATION, OPENING_TYPES, ZONE_TYPES } from './containers.mjs';
import { FINISH_TIERS, FOUNDATIONS, REGIONS } from './project.mjs';
import { projectGeometry } from './geometry.mjs';
import { runCodeChecks } from './codecheck.mjs';
import { estimateProject } from './estimate.mjs';
import { renderPlanSvg } from './svg.mjs';
import { formatArea, formatLength, formatMoney, formatWeight } from './units.mjs';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

export function renderSpecSheet(project) {
  const geo = projectGeometry(project);
  const checks = runCodeChecks(project);
  const estimate = estimateProject(project);
  const plan = renderPlanSvg(project, { estimate });
  const units = project.units;

  const summary = [
    ['Living area', formatArea(geo.totalLivingArea, units)],
    ['Ground footprint', formatArea(geo.groundFootprint, units)],
    ['Boxes', project.modules.map((m) => m.container).join(' + ')],
    ['Levels', String(geo.levels)],
    ['Shell condition', CONTAINER_CONDITIONS[project.condition].name],
    ['Insulation', INSULATION[project.insulation].name],
    ['Floor build-up', FLOOR_BUILDUPS[project.floorBuild].name],
    ['Finish level', FINISH_TIERS[project.finishTier].name],
    ['Foundation', FOUNDATIONS[project.foundation].name],
    ['Region basis', REGIONS[project.region].name],
    ['Gross weight', formatWeight(estimate.weight.grossKg, units)],
  ];

  const rooms = [];
  for (const moduleGeo of geo.modules) {
    for (const rect of moduleGeo.rects) {
      rooms.push({
        module: moduleGeo.module.name || moduleGeo.shell.container.short,
        name: ZONE_TYPES[rect.type]?.name ?? rect.type,
        size: `${formatLength(rect.w, units)} × ${formatLength(rect.h, units)}`,
        area: formatArea(rect.area, units),
        ceiling: formatLength(moduleGeo.shell.usableHeight, units),
      });
    }
    if (moduleGeo.loft) {
      rooms.push({
        module: moduleGeo.module.name || moduleGeo.shell.container.short,
        name: 'Loft',
        size: `${formatLength(moduleGeo.loft.length, units)} × ${formatLength(moduleGeo.loft.width, units)}`,
        area: formatArea(moduleGeo.loft.area, units),
        ceiling: formatLength(moduleGeo.loft.headroom, units),
      });
    }
  }

  const openings = [];
  for (const moduleGeo of geo.modules) {
    moduleGeo.openings.forEach((opening, index) => {
      openings.push({
        mark: `${(moduleGeo.module.name || 'M').slice(0, 1).toUpperCase()}${index + 1}`,
        module: moduleGeo.module.name || moduleGeo.shell.container.short,
        type: OPENING_TYPES[opening.type]?.name ?? opening.type,
        wall: opening.wall,
        size: `${formatLength(opening.width, units)} × ${formatLength(opening.height, units)}`,
        sill: formatLength(opening.sill, units),
      });
    });
  }

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(project.name)} — specification</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px; font: 14px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f8fafc; }
  main { max-width: 1000px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; }
  h1 { font-size: 30px; margin: 0 0 4px; letter-spacing: -0.02em; }
  h2 { font-size: 17px; margin: 34px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #0f172a; text-transform: uppercase; letter-spacing: 0.08em; }
  .sub { color: #64748b; margin: 0 0 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; border-bottom: 1px solid #cbd5e1; padding: 6px 8px; }
  td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .kv { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
  .kv dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 0; }
  .kv dd { margin: 2px 0 0; font-size: 16px; font-weight: 650; }
  .issue { border-left: 4px solid #cbd5e1; padding: 8px 12px; margin-bottom: 8px; background: #f8fafc; border-radius: 0 6px 6px 0; }
  .issue.fail { border-color: #dc2626; background: #fef2f2; }
  .issue.warn { border-color: #d97706; background: #fffbeb; }
  .issue.info { border-color: #0284c7; background: #f0f9ff; }
  .issue b { display: block; }
  .issue span { color: #475569; font-size: 13px; }
  .plan { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; overflow: auto; }
  .plan svg { max-width: 100%; height: auto; }
  .total { display: flex; justify-content: space-between; font-size: 20px; font-weight: 700; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 10px; }
  footer { margin-top: 32px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  @media print {
    body { padding: 0; background: #fff; }
    main { border: 0; padding: 0; max-width: none; }
    h2 { break-after: avoid; }
    table, .plan { break-inside: avoid; }
  }
</style></head>
<body><main>
  <h1>${esc(project.name)}</h1>
  <p class="sub">Container tiny home · ${esc(formatArea(geo.totalLivingArea, units))} · ${geo.moduleCount} box${geo.moduleCount === 1 ? '' : 'es'} · generated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>

  <h2>Plan</h2>
  <div class="plan">${plan}</div>

  <h2>Summary</h2>
  <div class="grid">
    ${summary.map(([label, value]) => `<dl class="kv"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></dl>`).join('')}
  </div>

  <h2>Room schedule</h2>
  <table><thead><tr><th>Module</th><th>Room</th><th>Size</th><th class="num">Area</th><th class="num">Ceiling</th></tr></thead><tbody>
    ${rooms.map((room) => `<tr><td>${esc(room.module)}</td><td>${esc(room.name)}</td><td>${esc(room.size)}</td><td class="num">${esc(room.area)}</td><td class="num">${esc(room.ceiling)}</td></tr>`).join('')}
  </tbody></table>

  <h2>Door &amp; window schedule</h2>
  <table><thead><tr><th>Mark</th><th>Module</th><th>Type</th><th>Wall</th><th>Rough opening</th><th class="num">Sill</th></tr></thead><tbody>
    ${openings.map((o) => `<tr><td>${esc(o.mark)}</td><td>${esc(o.module)}</td><td>${esc(o.type)}</td><td>${esc(o.wall)}</td><td>${esc(o.size)}</td><td class="num">${esc(o.sill)}</td></tr>`).join('')}
  </tbody></table>

  <h2>Code &amp; buildability review</h2>
  ${checks.issues.length
    ? checks.issues.map((issue) => `<div class="issue ${esc(issue.severity)}"><b>${esc(issue.code)} — ${esc(issue.title)}</b><span>${esc(issue.detail)}</span></div>`).join('')
    : '<p>No issues found.</p>'}

  <h2>Budget estimate — ${esc(estimate.tier)}, ${esc(estimate.region)}</h2>
  <table><thead><tr><th>Scope</th><th>Item</th><th class="num">Qty</th><th>Unit</th><th class="num">Rate</th><th class="num">Total</th></tr></thead><tbody>
    ${estimate.lines.map((item) => `<tr><td>${esc(item.category)}</td><td>${esc(item.label)}</td><td class="num">${esc(item.qty)}</td><td>${esc(item.unit)}</td><td class="num">${esc(formatMoney(item.unitCost))}</td><td class="num">${esc(formatMoney(item.total))}</td></tr>`).join('')}
    <tr><td colspan="5">Contingency (${Math.round(estimate.contingencyRate * 100)}%)</td><td class="num">${esc(formatMoney(estimate.contingency))}</td></tr>
  </tbody></table>
  <div class="total"><span>Total</span><span>${esc(formatMoney(estimate.total))} · ${esc(formatMoney(estimate.perSqFt))}/sq ft</span></div>

  <h2>Bill of materials</h2>
  <table><thead><tr><th>Item</th><th class="num">Quantity</th><th>Unit</th></tr></thead><tbody>
    ${estimate.materials.items.map((item) => `<tr><td>${esc(item.item)}</td><td class="num">${esc(item.qty)}</td><td>${esc(item.unit)}</td></tr>`).join('')}
  </tbody></table>

  <footer>
    Design-stage document produced by Tiny Home Studio. Cost rates are 2026 US mid-range figures adjusted for the selected region and finish level; they are an estimate, not a quote.
    Code checks follow the 2021 IRC and Appendix Q. Any cut in a container side wall needs a structural engineer, and every jurisdiction has the final word.
  </footer>
</main></body></html>`;
}
