/**
 * Vector floor-plan export. Pure string building so it runs identically in the
 * browser (download) and on the server (`GET /api/export/plan.svg`).
 *
 * Draws the true site arrangement: every module in world coordinates, walls at
 * real thickness, doors with swings, windows as breaks in the wall, zone areas
 * and an overall dimension string.
 */

import { ZONE_TYPES, OPENING_TYPES } from './containers.mjs';
import { moduleGeometry, moduleFootprint, projectGeometry, toWorld } from './geometry.mjs';
import { formatArea, formatLength, formatMoney, toSqFt } from './units.mjs';

const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

/**
 * @param {object} project
 * @param {{scale?: number, showDimensions?: boolean, showFurniture?: boolean, estimate?: object, level?: number|null}} options
 * @returns {string} standalone SVG document
 */
export function renderPlanSvg(project, options = {}) {
  const { showDimensions = true, showTitleBlock = true, estimate = null } = options;
  const geo = projectGeometry(project);
  const levels = [...new Set(project.modules.map((module) => module.level))].sort((a, b) => a - b);
  const targetLevels = options.level == null ? levels : [options.level];

  const margin = 900; // mm of white space around the drawing
  const bounds = geo.bounds;
  const planWidth = bounds.x2 - bounds.x + margin * 2;
  const planHeightSingle = bounds.y2 - bounds.y + margin * 2;
  const gap = 1200;
  const planHeight = planHeightSingle * targetLevels.length + gap * (targetLevels.length - 1);

  const scale = options.scale ?? Math.min(1400 / planWidth, 1000 / planHeight, 0.09);
  const titleBlockHeight = showTitleBlock ? 150 : 0;
  const width = Math.round(planWidth * scale);
  const height = Math.round(planHeight * scale) + titleBlockHeight;

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif">`);
  parts.push(`<rect width="${width}" height="${height}" fill="#ffffff"/>`);
  parts.push(gridPattern());

  targetLevels.forEach((level, levelIndex) => {
    const offsetY = levelIndex * (planHeightSingle + gap);
    const tx = (-bounds.x + margin) * scale;
    const ty = (-bounds.y + margin + offsetY) * scale;
    parts.push(`<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale})">`);
    parts.push(`<rect x="${bounds.x - margin}" y="${bounds.y - margin}" width="${planWidth}" height="${planHeightSingle}" fill="url(#grid)"/>`);

    if (targetLevels.length > 1) {
      parts.push(text(bounds.x, bounds.y - 380, level === 0 ? 'GROUND FLOOR' : `LEVEL ${level + 1}`, {
        size: 260, weight: 700, fill: '#0f172a', spacing: 40,
      }));
    }

    for (const module of project.modules.filter((m) => m.level === level)) {
      parts.push(renderModule(module, project, { showDimensions }));
    }
    parts.push('</g>');
  });

  if (showTitleBlock) parts.push(titleBlock({ project, geo, estimate, width, y: height - titleBlockHeight }));
  parts.push('</svg>');
  return parts.join('\n');
}

function gridPattern() {
  return `<defs>
  <pattern id="grid" width="1000" height="1000" patternUnits="userSpaceOnUse">
    <path d="M 1000 0 L 0 0 0 1000" fill="none" stroke="#e2e8f0" stroke-width="12"/>
  </pattern>
  <marker id="tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 2 8 L 8 2" stroke="#334155" stroke-width="2"/>
  </marker>
</defs>`;
}

function renderModule(module, project, { showDimensions }) {
  const geo = moduleGeometry(module, project);
  const shell = geo.shell;
  const out = [];
  const p = (point) => toWorld(module, shell, point);

  const corners = [
    p({ x: 0, y: 0 }),
    p({ x: shell.usableLength, y: 0 }),
    p({ x: shell.usableLength, y: shell.usableWidth }),
    p({ x: 0, y: shell.usableWidth }),
  ];
  const f = moduleFootprint(module);
  const wallThickness = (shell.container.exterior.width - shell.usableWidth) / 2;

  // Exterior steel box.
  out.push(`<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="#94a3b8" stroke="#0f172a" stroke-width="24"/>`);

  // Zone fills.
  for (const rect of geo.rects) {
    const a = p({ x: rect.x, y: rect.y });
    const b = p({ x: rect.x + rect.w, y: rect.y + rect.h });
    const meta = ZONE_TYPES[rect.type];
    out.push(`<rect x="${Math.min(a.x, b.x)}" y="${Math.min(a.y, b.y)}" width="${Math.abs(b.x - a.x)}" height="${Math.abs(b.y - a.y)}" fill="${meta?.color ?? '#f1f5f9'}" stroke="#cbd5e1" stroke-width="8"/>`);
    const center = p({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });
    if (rect.w > 900 && rect.h > 700) {
      const name = meta?.name ?? rect.type;
      const fitted = name.length * 115 > rect.w ? name.split(/ *\/ */)[0] : name;
      out.push(text(center.x, center.y - 40, fitted, { size: 210, anchor: 'middle', weight: 600, fill: '#0f172a' }));
      out.push(text(center.x, center.y + 190, formatArea(rect.area, project.units), { size: 170, anchor: 'middle', fill: '#475569' }));
    }
  }

  // Interior face of the shell.
  out.push(`<polygon points="${corners.map((c) => `${c.x},${c.y}`).join(' ')}" fill="none" stroke="#0f172a" stroke-width="18"/>`);

  // Partitions between zones.
  for (const divider of geo.dividers) {
    if (divider.kind === 'open') continue;
    const a = p({ x: divider.x, y: 0 });
    const b = p({ x: divider.x, y: shell.usableWidth });
    if (divider.opening) {
      const o1 = p({ x: divider.x, y: divider.opening.y0 });
      const o2 = p({ x: divider.x, y: divider.opening.y1 });
      out.push(`<line x1="${a.x}" y1="${a.y}" x2="${o1.x}" y2="${o1.y}" stroke="#0f172a" stroke-width="90" stroke-linecap="butt"/>`);
      out.push(`<line x1="${o2.x}" y1="${o2.y}" x2="${b.x}" y2="${b.y}" stroke="#0f172a" stroke-width="90" stroke-linecap="butt"/>`);
      if (divider.kind === 'door') {
        out.push(doorSwing(
          { x: divider.x, y: divider.opening.y1 },
          { x: divider.x, y: divider.opening.y0 },
          { x: 1, y: 0 },
          p,
        ));
      }
    } else {
      out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#0f172a" stroke-width="90"/>`);
    }
  }

  // Splits run the length of their zone.
  for (const zone of geo.zones) {
    if (!zone.split) continue;
    const y = zone.split.side === 'left'
      ? shell.usableWidth * zone.split.ratio
      : shell.usableWidth - shell.usableWidth * zone.split.ratio;
    const a = p({ x: zone.x0, y });
    const b = p({ x: zone.x1, y });
    out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#0f172a" stroke-width="90"/>`);
  }

  // Openings: erase the wall, then draw glazing or a swing.
  for (const opening of geo.openings) {
    const a = p(opening.start);
    const b = p(opening.end);
    const spec = OPENING_TYPES[opening.type];
    out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#ffffff" stroke-width="${wallThickness * 2.2}" stroke-linecap="butt"/>`);
    if (spec?.kind === 'window') {
      out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#0284c7" stroke-width="34"/>`);
      out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#0f172a" stroke-width="10" stroke-dasharray="60 60"/>`);
    } else {
      out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#0f172a" stroke-width="30"/>`);
      out.push(doorSwing(opening.start, opening.end, INWARD[opening.wall], p));
    }
  }

  if (module.loft) {
    const l = geo.loft;
    const a = p({ x: l.x0, y: l.y0 });
    const b = p({ x: l.x1, y: l.y1 });
    out.push(`<rect x="${Math.min(a.x, b.x)}" y="${Math.min(a.y, b.y)}" width="${Math.abs(b.x - a.x)}" height="${Math.abs(b.y - a.y)}" fill="none" stroke="#7c3aed" stroke-width="26" stroke-dasharray="220 160"/>`);
    const mid = p({ x: (l.x0 + l.x1) / 2, y: l.y1 - 320 });
    out.push(text(mid.x, mid.y, `LOFT ABOVE — ${Math.round(toSqFt(l.area))} sq ft`, { size: 170, anchor: 'middle', fill: '#7c3aed', weight: 600 }));
  }

  if (showDimensions) {
    out.push(dimension(
      { x: f.x, y: f.y2 + 260 },
      { x: f.x2, y: f.y2 + 260 },
      formatLength(f.w, project.units),
    ));
    out.push(dimension(
      { x: f.x2 + 260, y: f.y },
      { x: f.x2 + 260, y: f.y2 },
      formatLength(f.h, project.units),
      true,
    ));
  }

  const label = `${module.name || 'Module'} · ${shell.container.short}`;
  out.push(text(f.x + 120, f.y - 120, label, { size: 200, weight: 700, fill: '#0f172a' }));
  return out.join('\n');
}

/**
 * A door swing drawn the way a plan draws it: hinged at one jamb, sweeping from
 * the closed leaf (along the wall) to the open leaf (perpendicular, into the
 * room). Everything is computed in module-local space then mapped to world, so
 * a rotated box gets a correctly rotated swing.
 */
function doorSwing(hingeLocal, jambLocal, inwardLocal, p) {
  const radius = Math.hypot(jambLocal.x - hingeLocal.x, jambLocal.y - hingeLocal.y);
  if (radius < 1) return '';
  const openLocal = {
    x: hingeLocal.x + inwardLocal.x * radius,
    y: hingeLocal.y + inwardLocal.y * radius,
  };
  const hinge = p(hingeLocal);
  const from = p(jambLocal);
  const to = p(openLocal);
  const cross = (from.x - hinge.x) * (to.y - hinge.y) - (from.y - hinge.y) * (to.x - hinge.x);
  const sweep = cross > 0 ? 1 : 0;
  return `<line x1="${hinge.x}" y1="${hinge.y}" x2="${to.x}" y2="${to.y}" stroke="#94a3b8" stroke-width="20"/>`
    + `<path d="M ${from.x} ${from.y} A ${radius} ${radius} 0 0 ${sweep} ${to.x} ${to.y}" fill="none" stroke="#94a3b8" stroke-width="14" stroke-dasharray="90 70"/>`;
}

const INWARD = {
  left: { x: 0, y: 1 },
  right: { x: 0, y: -1 },
  front: { x: 1, y: 0 },
  back: { x: -1, y: 0 },
};

function dimension(a, b, label, vertical = false) {
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const tick = 130;
  const ticks = vertical
    ? `<line x1="${a.x - tick}" y1="${a.y}" x2="${a.x + tick}" y2="${a.y}" stroke="#334155" stroke-width="14"/>
       <line x1="${b.x - tick}" y1="${b.y}" x2="${b.x + tick}" y2="${b.y}" stroke="#334155" stroke-width="14"/>`
    : `<line x1="${a.x}" y1="${a.y - tick}" x2="${a.x}" y2="${a.y + tick}" stroke="#334155" stroke-width="14"/>
       <line x1="${b.x}" y1="${b.y - tick}" x2="${b.x}" y2="${b.y + tick}" stroke="#334155" stroke-width="14"/>`;
  const labelEl = vertical
    ? text(mid.x + 190, mid.y, label, { size: 180, anchor: 'middle', fill: '#334155', rotate: 90 })
    : text(mid.x, mid.y + 260, label, { size: 180, anchor: 'middle', fill: '#334155' });
  return `<g><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#334155" stroke-width="14"/>${ticks}${labelEl}</g>`;
}

function text(x, y, content, options = {}) {
  const { size = 160, anchor = 'start', fill = '#0f172a', weight = 400, rotate = 0, spacing = 0 } = options;
  const transform = rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : '';
  const letterSpacing = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-weight="${weight}"${letterSpacing}${transform}>${esc(content)}</text>`;
}

function titleBlock({ project, geo, estimate, width, y }) {
  const rows = [
    ['Living area', formatArea(geo.totalLivingArea, project.units)],
    ['Footprint', formatArea(geo.groundFootprint, project.units)],
    ['Boxes', `${geo.moduleCount} · ${project.modules.map((m) => m.container).join(' + ')}`],
  ];
  if (estimate) rows.push(['Budget estimate', `${formatMoney(estimate.total)} (${formatMoney(estimate.perSqFt)}/sq ft)`]);

  const cells = rows.map((row, index) => {
    const cellX = 24 + index * (width / rows.length - 8);
    return `${text(cellX, y + 52, row[0].toUpperCase(), { size: 13, fill: '#64748b', weight: 600, spacing: 1.2 })}
${text(cellX, y + 84, row[1], { size: 21, fill: '#0f172a', weight: 700 })}`;
  }).join('\n');

  return `<g>
  <line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#cbd5e1" stroke-width="2"/>
  ${text(24, y + 122, `${project.name} — drawn with Tiny Home Studio. Design-stage drawing, not for construction.`, { size: 13, fill: '#94a3b8' })}
  ${cells}
</g>`;
}
