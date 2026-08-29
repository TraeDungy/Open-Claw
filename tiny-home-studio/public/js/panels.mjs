/**
 * Right rail and left rail rendering. Plain template strings plus one delegated
 * event listener per rail — no framework, no virtual DOM, and the whole UI
 * re-renders in well under a frame.
 */

import {
  CONTAINERS,
  CONTAINER_CONDITIONS,
  FLOOR_BUILDUPS,
  INSULATION,
  OPENING_TYPES,
  ZONE_TYPES,
  resolveShell,
} from '/lib/containers.mjs';
import { FINISH_TIERS, FOUNDATIONS, REGIONS } from '/lib/project.mjs';
import { isEgressCompliant } from '/lib/codecheck.mjs';
import { formatArea, formatLength, formatMoney, formatWeight, toSqFt } from '/lib/units.mjs';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

const options = (table, selected) => Object.values(table)
  .map((entry) => `<option value="${esc(entry.id)}"${entry.id === selected ? ' selected' : ''}>${esc(entry.name)}</option>`)
  .join('');

const CATEGORY_COLORS = {
  shell: '#38bdf8',
  sitework: '#a78bfa',
  envelope: '#34d399',
  openings: '#fbbf24',
  interior: '#fb7185',
  systems: '#60a5fa',
  kitchenbath: '#f472b6',
  offgrid: '#4ade80',
  soft: '#94a3b8',
};

/* ── stats strip ───────────────────────────────────────── */
export function renderStats(store, el) {
  const { geometry, estimate, checks } = store.analysis;
  const units = store.project.units;
  const badge = checks.failCount ? 'fail' : checks.warnCount ? 'warn' : 'ok';
  const badgeText = checks.failCount
    ? `${checks.failCount} to fix`
    : checks.warnCount ? `${checks.warnCount} to check` : 'Code clear';

  el.innerHTML = `
    <div class="stat">
      <div class="stat__label">Living area</div>
      <div class="stat__value">${esc(formatArea(geometry.totalLivingArea, units))}</div>
    </div>
    <div class="stat">
      <div class="stat__label">Estimate</div>
      <div class="stat__value">${esc(formatMoney(estimate.total))} <small>${esc(formatMoney(estimate.perSqFt))}/ft²</small></div>
    </div>
    <div class="stat">
      <div class="stat__label">Boxes · levels</div>
      <div class="stat__value">${geometry.moduleCount} <small>· ${geometry.levels} level${geometry.levels === 1 ? '' : 's'}</small></div>
    </div>
    <div class="stat">
      <div class="stat__label">Status</div>
      <div class="stat__value"><span class="badge badge--${badge}">${esc(badgeText)}</span></div>
    </div>`;
}

/* ── inspector ─────────────────────────────────────────── */
export function renderInspector(store, el) {
  const selection = store.ui.selection;
  if (!selection) {
    el.innerHTML = `<div class="insp">
      <div class="insp__head"><h3>Nothing selected</h3></div>
      <p class="muted">Click a room to change what it is. Drag the blue handle on any wall to resize.
      Drop a window from the left onto any wall. Double-click a wall to cycle it between open, doorway and solid.</p>
    </div>`;
    return;
  }
  if (selection.kind === 'zone') return renderZoneInspector(store, el, selection);
  if (selection.kind === 'opening') return renderOpeningInspector(store, el, selection);
  return renderModuleInspector(store, el, selection);
}

function renderZoneInspector(store, el, selection) {
  const module = store.project.modules.find((m) => m.id === selection.moduleId);
  const geo = store.moduleGeo(selection.moduleId);
  const zone = module?.zones.find((z) => z.id === selection.id);
  const zoneGeo = geo?.zones.find((z) => z.id === selection.id);
  if (!zone || !zoneGeo) {
    el.innerHTML = '';
    return;
  }
  const meta = ZONE_TYPES[zone.type];
  const units = store.project.units;
  const inLoft = module.loft?.overZoneIds.includes(zone.id) ?? false;

  const typeButtons = Object.values(ZONE_TYPES).map((type, index) => `
    <button class="type-btn${type.id === zone.type ? ' is-active' : ''}" data-action="zone-type" data-type="${type.id}" title="${esc(type.name)}${index < 9 ? ` (${index + 1})` : ''}">
      ${type.icon}<i>${esc(type.name.split(' ')[0])}</i>
    </button>`).join('');

  el.innerHTML = `<div class="insp">
    <div class="insp__head">
      <span class="dot" style="background:${meta.color}"></span>
      <h3>${esc(meta.name)}</h3>
      <span class="badge">${esc(formatArea(zoneGeo.area, units))}</span>
    </div>

    <div class="field">
      <label>Room type</label>
      <div class="type-grid">${typeButtons}</div>
    </div>

    <div class="field-row">
      <div class="field">
        <label>Length</label>
        <input type="text" data-action="zone-length" value="${esc(formatLength(zone.length, units))}">
      </div>
      <div class="field">
        <label>Width (fixed by the box)</label>
        <input type="text" value="${esc(formatLength(geo.shell.usableWidth, units))}" disabled>
      </div>
    </div>

    <div class="field">
      <label>Wall at the far end</label>
      <div class="segmented" style="width:100%">
        ${['open', 'door', 'wall'].map((kind) => `
          <button class="segmented__btn${(zone.dividerAfter?.kind ?? 'open') === kind ? ' is-active' : ''}" style="flex:1"
            data-action="zone-divider" data-kind="${kind}">${kind === 'open' ? 'Open' : kind === 'door' ? 'Doorway' : 'Solid'}</button>`).join('')}
      </div>
    </div>

    <div class="switch">
      <label for="zone-split">Split this room across the width</label>
      <input id="zone-split" type="checkbox" data-action="zone-split-toggle"${zone.split ? ' checked' : ''}>
    </div>
    ${zone.split ? `
      <div class="field-row">
        <div class="field">
          <label>Second room</label>
          <select data-action="zone-split-type">${options(ZONE_TYPES, zone.split.type)}</select>
        </div>
        <div class="field">
          <label>Side</label>
          <select data-action="zone-split-side">
            <option value="left"${zone.split.side === 'left' ? ' selected' : ''}>Left</option>
            <option value="right"${zone.split.side === 'right' ? ' selected' : ''}>Right</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Share of the width — ${Math.round(zone.split.ratio * 100)}%</label>
        <input type="range" min="20" max="80" value="${Math.round(zone.split.ratio * 100)}" data-action="zone-split-ratio" style="width:100%">
      </div>` : ''}

    <div class="switch">
      <label for="zone-loft">Loft above this room</label>
      <input id="zone-loft" type="checkbox" data-action="zone-loft"${inLoft ? ' checked' : ''}>
    </div>

    <div class="insp__actions">
      <button class="btn" data-action="zone-duplicate">Duplicate</button>
      <button class="btn" data-action="zone-halve">Split in half</button>
      <button class="btn btn--danger" data-action="zone-delete">Delete</button>
    </div>
  </div>`;
}

function renderOpeningInspector(store, el, selection) {
  const module = store.project.modules.find((m) => m.id === selection.moduleId);
  const geo = store.moduleGeo(selection.moduleId);
  const opening = module?.openings.find((o) => o.id === selection.id);
  if (!opening) {
    el.innerHTML = '';
    return;
  }
  const units = store.project.units;
  const spec = OPENING_TYPES[opening.type];
  const egress = isEgressCompliant(opening);

  el.innerHTML = `<div class="insp">
    <div class="insp__head">
      <span class="dot" style="background:${spec.kind === 'window' ? '#0ea5e9' : '#0f172a'}"></span>
      <h3>${esc(spec.name)}</h3>
      <span class="badge badge--${egress ? 'ok' : 'warn'}">${egress ? 'Egress OK' : 'Not egress'}</span>
    </div>

    <div class="field">
      <label>Type</label>
      <select data-action="opening-type">${options(OPENING_TYPES, opening.type)}</select>
    </div>

    <div class="field-row">
      <div class="field">
        <label>Wall</label>
        <select data-action="opening-wall">
          ${['left', 'right', 'front', 'back'].map((wall) => `<option value="${wall}"${opening.wall === wall ? ' selected' : ''}>${wall[0].toUpperCase()}${wall.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>From the corner</label>
        <input type="text" data-action="opening-offset" value="${esc(formatLength(opening.offset, units))}">
      </div>
    </div>

    <div class="field-row">
      <div class="field"><label>Width</label><input type="text" data-action="opening-width" value="${esc(formatLength(opening.width, units))}"></div>
      <div class="field"><label>Height</label><input type="text" data-action="opening-height" value="${esc(formatLength(opening.height, units))}"></div>
      <div class="field"><label>Sill</label><input type="text" data-action="opening-sill" value="${esc(formatLength(opening.sill, units))}"></div>
    </div>

    <p class="muted">Cut into the ${opening.wall === 'left' || opening.wall === 'right' ? 'side wall — needs a welded tube-steel frame' : 'end wall — the cheapest place to cut'}.
    Ceiling here is ${esc(formatLength(geo.shell.usableHeight, units))}.</p>

    <div class="insp__actions">
      <button class="btn" data-action="opening-center">Centre on wall</button>
      <button class="btn btn--danger" data-action="opening-delete">Delete</button>
    </div>
  </div>`;
}

function renderModuleInspector(store, el, selection) {
  const module = store.project.modules.find((m) => m.id === selection.moduleId);
  const geo = store.moduleGeo(selection.moduleId);
  if (!module || !geo) {
    el.innerHTML = '';
    return;
  }
  const units = store.project.units;

  el.innerHTML = `<div class="insp">
    <div class="insp__head"><h3>${esc(module.name || 'Box')}</h3><span class="badge">${esc(geo.shell.container.short)}</span></div>

    <div class="field"><label>Name</label><input type="text" data-action="module-name" value="${esc(module.name)}"></div>

    <div class="field">
      <label>Shell</label>
      <select data-action="module-container">${options(CONTAINERS, module.container)}</select>
    </div>

    <div class="field-row">
      <div class="field">
        <label>Rotation</label>
        <select data-action="module-rotation">
          ${[0, 90, 180, 270].map((deg) => `<option value="${deg}"${module.rotation === deg ? ' selected' : ''}>${deg}°</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Level</label>
        <select data-action="module-level">
          ${[0, 1, 2].map((level) => `<option value="${level}"${module.level === level ? ' selected' : ''}>${level === 0 ? 'Ground' : `Level ${level + 1}`}</option>`).join('')}
        </select>
      </div>
    </div>

    <p class="muted">
      Usable inside: ${esc(formatLength(geo.shell.usableLength, units))} × ${esc(formatLength(geo.shell.usableWidth, units))},
      ceiling ${esc(formatLength(geo.shell.usableHeight, units))}.
      ${geo.zones.length} room${geo.zones.length === 1 ? '' : 's'}, ${geo.openings.length} opening${geo.openings.length === 1 ? '' : 's'}.
    </p>

    <div class="insp__actions">
      <button class="btn" data-action="module-duplicate">Duplicate box</button>
      <button class="btn btn--danger" data-action="module-delete"${store.project.modules.length < 2 ? ' disabled' : ''}>Delete box</button>
    </div>
  </div>`;
}

/* ── checks ────────────────────────────────────────────── */
export function renderChecks(store, { body, badge }) {
  const { checks } = store.analysis;
  badge.className = `badge badge--${checks.failCount ? 'fail' : checks.warnCount ? 'warn' : 'ok'}`;
  badge.textContent = checks.failCount
    ? `${checks.failCount} blocking`
    : checks.warnCount ? `${checks.warnCount} warnings` : 'All clear';

  if (!checks.issues.length) {
    body.innerHTML = '<p class="muted">Nothing flagged. Keep in mind a plans examiner still has the final word.</p>';
    return;
  }

  body.innerHTML = checks.issues.map((issue, index) => `
    <div class="issue issue--${issue.severity}" data-issue="${index}"${issue.moduleId ? ` data-module="${esc(issue.moduleId)}"` : ''}${issue.zoneId ? ` data-zone="${esc(issue.zoneId)}"` : ''}${issue.openingId ? ` data-opening="${esc(issue.openingId)}"` : ''}>
      <b>${esc(issue.title)}</b>
      <code>${esc(issue.code)}</code>
      <p>${esc(issue.detail)}</p>
      ${issue.fix === 'add-egress' && issue.moduleId ? '<button class="btn fixbtn" data-action="fix-egress">Add an egress window</button>' : ''}
      ${issue.fix === 'add-door' && issue.moduleId ? '<button class="btn fixbtn" data-action="fix-door">Add an entry door</button>' : ''}
      ${issue.fix === 'shell' && issue.moduleId ? '<button class="btn fixbtn" data-action="fix-shell">Switch to a high cube</button>' : ''}
    </div>`).join('');
}

/* ── budget ────────────────────────────────────────────── */
export function renderCost(store, { body, badge }) {
  const { estimate } = store.analysis;
  badge.textContent = formatMoney(estimate.total);

  const entries = Object.entries(estimate.byCategory).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;

  body.innerHTML = `
    <div class="costbar">
      ${entries.map(([key, value]) => `<span style="width:${(value / total) * 100}%;background:${CATEGORY_COLORS[key] ?? '#64748b'}" title="${esc(key)}"></span>`).join('')}
    </div>
    ${entries.map(([key, value]) => `
      <div class="cost-row">
        <span><i style="background:${CATEGORY_COLORS[key] ?? '#64748b'}"></i>${esc(labelForCategory(key))}</span>
        <span>${esc(formatMoney(value))}</span>
      </div>`).join('')}
    <div class="cost-row"><span>Contingency (${Math.round(estimate.contingencyRate * 100)}%)</span><span>${esc(formatMoney(estimate.contingency))}</span></div>
    <div class="cost-total"><span>Total</span><span>${esc(formatMoney(estimate.total))}</span></div>
    <p class="muted" style="margin-top:8px">
      ${esc(formatMoney(estimate.perSqFt))} per sq ft · ${esc(estimate.tier)} finish · ${esc(estimate.region)}.
      Gross weight ${esc(formatWeight(estimate.weight.grossKg, store.project.units))}, using ${estimate.weight.payloadUsedPct}% of the rated payload.
    </p>
    <button class="linkish" data-action="show-lines">See every line item</button>`;
}

function labelForCategory(key) {
  return {
    shell: 'Containers & delivery',
    sitework: 'Foundation & site',
    envelope: 'Insulation & roof',
    openings: 'Windows & doors',
    interior: 'Interior build',
    systems: 'Electrical, plumbing, HVAC',
    kitchenbath: 'Kitchen & bath',
    offgrid: 'Off-grid systems',
    soft: 'Design & permits',
  }[key] ?? key;
}

/* ── build spec ────────────────────────────────────────── */
export function renderBuild(store, { body, badge }) {
  const project = store.project;
  const shell = resolveShell(project.modules[0].container, project.insulation, project.floorBuild);
  badge.textContent = `R-${shell.insulation.rValuePerSurface}`;

  body.innerHTML = `
    <div class="field"><label>Shell condition</label><select data-action="set-condition">${options(CONTAINER_CONDITIONS, project.condition)}</select></div>
    <div class="field"><label>Insulation</label><select data-action="set-insulation">${options(INSULATION, project.insulation)}</select></div>
    <div class="field"><label>Floor build-up</label><select data-action="set-floor">${options(FLOOR_BUILDUPS, project.floorBuild)}</select></div>
    <div class="field"><label>Finish level</label><select data-action="set-finish">${options(FINISH_TIERS, project.finishTier)}</select></div>
    <div class="field"><label>Foundation</label><select data-action="set-foundation">${options(FOUNDATIONS, project.foundation)}</select></div>
    <div class="field"><label>Pricing region</label><select data-action="set-region">${options(REGIONS, project.region)}</select></div>

    <div class="switch">
      <label for="offgrid">Off-grid package</label>
      <input id="offgrid" type="checkbox" data-action="set-offgrid"${project.offGrid.enabled ? ' checked' : ''}>
    </div>
    ${project.offGrid.enabled ? `
      <div class="field-row">
        <div class="field"><label>Solar kW</label><input type="number" min="0" max="20" step="0.5" data-action="set-solar" value="${project.offGrid.solarKw}"></div>
        <div class="field"><label>Battery kWh</label><input type="number" min="0" max="60" step="1" data-action="set-battery" value="${project.offGrid.batteryKwh}"></div>
        <div class="field"><label>Water L</label><input type="number" min="0" max="10000" step="100" data-action="set-water" value="${project.offGrid.waterTankL}"></div>
      </div>` : ''}

    <p class="muted">${esc(shell.insulation.note)} ${esc(shell.floorBuild.note)}<br>
    Leaves ${esc(formatLength(shell.usableWidth, project.units))} of usable width and ${esc(formatLength(shell.usableHeight, project.units))} of headroom.</p>`;
}

/* ── left rail ─────────────────────────────────────────── */
export function renderPalettes(zoneEl, openingEl) {
  zoneEl.innerHTML = Object.values(ZONE_TYPES).map((type) => `
    <button class="pal" data-palette="zone" data-type="${type.id}" title="Drag onto the plan, or click with a room selected">
      <span class="pal__icon">${type.icon}</span>
      <span>${esc(type.name)}</span>
      <span class="pal__swatch" style="background:${type.color}"></span>
    </button>`).join('');

  openingEl.innerHTML = Object.values(OPENING_TYPES).filter((type) => type.exterior).map((type) => `
    <button class="pal" data-palette="opening" data-type="${type.id}" title="Drag onto any wall">
      <span class="pal__icon">${type.kind === 'window' ? '🪟' : '🚪'}</span>
      <span>${esc(type.name)}</span>
    </button>`).join('');
}

export function renderModuleList(store, el) {
  el.innerHTML = store.project.modules.map((module) => {
    const geo = store.moduleGeo(module.id);
    return `<button class="module-row${module.id === store.ui.activeModuleId ? ' is-active' : ''}" data-module-row="${esc(module.id)}">
      <strong>${esc(module.name || 'Box')}</strong>
      <span>${esc(CONTAINERS[module.container].short)} · ${geo ? Math.round(toSqFt(geo.area)) : '—'} ft²${module.level ? ` · L${module.level + 1}` : ''}</span>
    </button>`;
  }).join('');
}

export function renderLevelSwitch(store, el) {
  const levels = [...new Set(store.project.modules.map((module) => module.level))].sort((a, b) => a - b);
  if (levels.length < 2) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.innerHTML = levels.map((level) => `
    <button class="icon-btn${store.ui.level === level ? ' is-active' : ''}" data-level="${level}" title="${level === 0 ? 'Ground floor' : `Level ${level + 1}`}">${level + 1}</button>`).join('');
}

/* ── cost detail dialog ────────────────────────────────── */
export function costLinesHtml(store) {
  const { estimate } = store.analysis;
  return `<table style="width:100%;border-collapse:collapse;font-size:12.5px">
    <thead><tr>
      <th style="text-align:left;color:#94a3b8;font-weight:600;padding:4px 6px">Item</th>
      <th style="text-align:right;color:#94a3b8;font-weight:600;padding:4px 6px">Qty</th>
      <th style="text-align:right;color:#94a3b8;font-weight:600;padding:4px 6px">Rate</th>
      <th style="text-align:right;color:#94a3b8;font-weight:600;padding:4px 6px">Total</th>
    </tr></thead>
    <tbody>${estimate.lines.map((item) => `
      <tr>
        <td style="padding:4px 6px;border-top:1px solid #24344f">${esc(item.label)}</td>
        <td style="padding:4px 6px;border-top:1px solid #24344f;text-align:right">${item.qty} ${esc(item.unit)}</td>
        <td style="padding:4px 6px;border-top:1px solid #24344f;text-align:right">${esc(formatMoney(item.unitCost))}</td>
        <td style="padding:4px 6px;border-top:1px solid #24344f;text-align:right">${esc(formatMoney(item.total))}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

export { esc };
