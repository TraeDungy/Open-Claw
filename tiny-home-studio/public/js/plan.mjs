/**
 * The 2D plan: a canvas that draws the project in real millimetres and lets you
 * grab the things you would grab in real life — a wall, a window, a whole box.
 *
 * Drawing happens twice per frame: shapes in module-local millimetres (so a
 * rotated box needs no maths), then labels in screen pixels (so text stays
 * upright and legible at any zoom).
 */

import { OPENING_TYPES, ZONE_TYPES, resolveShell } from '/lib/containers.mjs';
import { moduleFootprint } from '/lib/geometry.mjs';
import { formatArea, formatLength, clamp } from '/lib/units.mjs';

const GRID_MM = 500;
const HANDLE_PX = 11;
const SNAP_MM = 50;

export function createPlanView({ canvas, store, onHint }) {
  const ctx = canvas.getContext('2d');
  const camera = { scale: 0.06, x: 0, y: 0 };
  let dpr = window.devicePixelRatio || 1;
  let pointer = { x: 0, y: 0, world: { x: 0, y: 0 }, over: null };
  let drag = null;
  let payload = null; // palette item being dragged over the canvas
  let frame = null;

  /* ── transforms ───────────────────────────────────────── */
  const toScreen = (wx, wy) => ({ x: wx * camera.scale + camera.x, y: wy * camera.scale + camera.y });
  const toWorldPoint = (sx, sy) => ({ x: (sx - camera.x) / camera.scale, y: (sy - camera.y) / camera.scale });

  function moduleTransform(module) {
    const shell = resolveShell(module.container, module.insulation ?? store.project.insulation, store.project.floorBuild);
    const ext = shell.container.exterior;
    const insetX = (ext.length - shell.usableLength) / 2;
    const insetY = (ext.width - shell.usableWidth) / 2;
    return { shell, ext, insetX, insetY };
  }

  /** World point -> module-local millimetres (inverse of geometry.toWorld). */
  function worldToLocal(module, world) {
    const { ext, insetX, insetY } = moduleTransform(module);
    const dx = world.x - module.x;
    const dy = world.y - module.y;
    let lx;
    let ly;
    switch (module.rotation) {
      case 90: lx = dy; ly = ext.width - dx; break;
      case 180: lx = ext.length - dx; ly = ext.width - dy; break;
      case 270: lx = ext.length - dy; ly = dx; break;
      default: lx = dx; ly = dy;
    }
    return { x: lx - insetX, y: ly - insetY };
  }

  function localToWorld(module, local) {
    const { ext, insetX, insetY } = moduleTransform(module);
    const lx = local.x + insetX;
    const ly = local.y + insetY;
    switch (module.rotation) {
      case 90: return { x: module.x + ext.width - ly, y: module.y + lx };
      case 180: return { x: module.x + ext.length - lx, y: module.y + ext.width - ly };
      case 270: return { x: module.x + ly, y: module.y + ext.length - lx };
      default: return { x: module.x + lx, y: module.y + ly };
    }
  }

  function applyModuleTransform(module) {
    const { ext, insetX, insetY } = moduleTransform(module);
    ctx.translate(module.x, module.y);
    if (module.rotation === 90) { ctx.translate(ext.width, 0); ctx.rotate(Math.PI / 2); }
    else if (module.rotation === 180) { ctx.translate(ext.length, ext.width); ctx.rotate(Math.PI); }
    else if (module.rotation === 270) { ctx.translate(0, ext.length); ctx.rotate(-Math.PI / 2); }
    ctx.translate(insetX, insetY);
  }

  const visibleModules = () => store.project.modules.filter((module) => module.level === store.ui.level);

  /* ── camera ───────────────────────────────────────────── */
  let lastRect = null;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    // Keep whatever was in the middle of the pane in the middle of the pane,
    // so switching to split view does not throw the drawing off screen.
    if (lastRect && lastRect.width > 0 && rect.width > 0) {
      const before = toWorldPoint(lastRect.width / 2, lastRect.height / 2);
      camera.x += rect.width / 2 - (before.x * camera.scale + camera.x);
      camera.y += rect.height / 2 - (before.y * camera.scale + camera.y);
    }
    lastRect = { width: rect.width, height: rect.height };
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    requestDraw();
  }

  function fit() {
    const modules = visibleModules();
    if (!modules.length) return;
    const boxes = modules.map(moduleFootprint);
    const minX = Math.min(...boxes.map((b) => b.x));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxX = Math.max(...boxes.map((b) => b.x2));
    const maxY = Math.max(...boxes.map((b) => b.y2));
    const rect = canvas.getBoundingClientRect();
    const pad = 90;
    const scale = Math.min(
      (rect.width - pad * 2) / Math.max(1, maxX - minX),
      (rect.height - pad * 2) / Math.max(1, maxY - minY),
    );
    camera.scale = clamp(scale, 0.004, 0.6);
    camera.x = rect.width / 2 - ((minX + maxX) / 2) * camera.scale;
    camera.y = rect.height / 2 - ((minY + maxY) / 2) * camera.scale;
    requestDraw();
  }

  function zoomBy(factor, anchor) {
    const rect = canvas.getBoundingClientRect();
    const px = anchor?.x ?? rect.width / 2;
    const py = anchor?.y ?? rect.height / 2;
    const before = toWorldPoint(px, py);
    camera.scale = clamp(camera.scale * factor, 0.004, 0.6);
    const after = toWorldPoint(px, py);
    camera.x += (after.x - before.x) * camera.scale;
    camera.y += (after.y - before.y) * camera.scale;
    requestDraw();
  }

  /* ── hit testing ──────────────────────────────────────── */
  function hitTest(screen) {
    const world = toWorldPoint(screen.x, screen.y);
    const tolerance = HANDLE_PX / camera.scale;

    for (const module of [...visibleModules()].reverse()) {
      const geo = store.moduleGeo(module.id);
      if (!geo) continue;
      const local = worldToLocal(module, world);
      const { shell } = geo;

      // Module chip: drawn in screen space just above the box, so test it there.
      const corner = toScreen(moduleFootprint(module).x, moduleFootprint(module).y);
      const chipWidth = `${module.name || 'Box'} · ${shell.container.short}`.length * 6.4 + 22;
      if (screen.x >= corner.x - 6 && screen.x <= corner.x + chipWidth
        && screen.y >= corner.y - 30 && screen.y <= corner.y - 3) {
        return { kind: 'module', moduleId: module.id, id: module.id };
      }

      const inside = local.x >= -300 && local.x <= shell.usableLength + 300
        && local.y >= -300 && local.y <= shell.usableWidth + 300;
      if (!inside) continue;

      // Openings live on the walls: test proximity to their segment.
      for (const opening of geo.openings) {
        const onLongWall = opening.wall === 'left' || opening.wall === 'right';
        const along = onLongWall ? local.x : local.y;
        const across = onLongWall ? local.y : local.x;
        const wallAt = { left: 0, right: shell.usableWidth, front: 0, back: shell.usableLength }[opening.wall];
        if (Math.abs(across - wallAt) > tolerance * 1.3) continue;
        if (along >= opening.offset - tolerance && along <= opening.offset + opening.width + tolerance) {
          return { kind: 'opening', moduleId: module.id, id: opening.id, opening };
        }
      }

      // Dividers between zones.
      for (const divider of geo.dividers) {
        if (Math.abs(local.x - divider.x) <= tolerance && local.y >= -60 && local.y <= shell.usableWidth + 60) {
          return { kind: 'divider', moduleId: module.id, id: divider.zoneId, x: divider.x };
        }
      }

      // Zones (and their side splits).
      for (const rect of geo.rects) {
        if (local.x >= rect.x && local.x <= rect.x + rect.w && local.y >= rect.y && local.y <= rect.y + rect.h) {
          return { kind: 'zone', moduleId: module.id, id: rect.zoneId, part: rect.part };
        }
      }
      return { kind: 'module', moduleId: module.id, id: module.id };
    }
    return null;
  }

  /** Nearest wall to a world point, for dropping openings. */
  function nearestWall(world) {
    let best = null;
    for (const module of visibleModules()) {
      const geo = store.moduleGeo(module.id);
      if (!geo) continue;
      const local = worldToLocal(module, world);
      const { usableLength: L, usableWidth: W } = geo.shell;
      if (local.x < -900 || local.x > L + 900 || local.y < -900 || local.y > W + 900) continue;
      const candidates = [
        { wall: 'left', distance: Math.abs(local.y), along: local.x, span: L },
        { wall: 'right', distance: Math.abs(W - local.y), along: local.x, span: L },
        { wall: 'front', distance: Math.abs(local.x), along: local.y, span: W },
        { wall: 'back', distance: Math.abs(L - local.x), along: local.y, span: W },
      ];
      for (const candidate of candidates) {
        if (candidate.along < -200 || candidate.along > candidate.span + 200) continue;
        if (!best || candidate.distance < best.distance) {
          best = { ...candidate, moduleId: module.id, geo };
        }
      }
    }
    return best;
  }

  /* ── drawing ──────────────────────────────────────────── */
  function requestDraw() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      draw();
    });
  }

  function draw() {
    if (!store.analysis) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawGrid(rect);

    const selection = store.ui.selection;
    const ghostLevels = store.project.modules.filter((module) => module.level === store.ui.level - 1);

    // Boxes on the level below show as a faint outline so stacking makes sense.
    for (const module of ghostLevels) {
      const f = moduleFootprint(module);
      const a = toScreen(f.x, f.y);
      const b = toScreen(f.x2, f.y2);
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
      ctx.setLineDash([]);
    }

    for (const module of visibleModules()) {
      const geo = store.moduleGeo(module.id);
      if (!geo) continue;
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);
      applyModuleTransform(module);
      drawModuleShapes(module, geo, selection);
      ctx.restore();
    }

    for (const module of visibleModules()) {
      const geo = store.moduleGeo(module.id);
      if (geo) drawModuleLabels(module, geo, selection);
    }

    drawPayloadPreview();
    ctx.restore();
  }

  function drawGrid(rect) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);
    const step = GRID_MM * camera.scale;
    if (step < 6) return;
    const major = step * 2;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = camera.x % step; x < rect.width; x += step) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, rect.height);
    }
    for (let y = camera.y % step; y < rect.height; y += step) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(rect.width, Math.round(y) + 0.5);
    }
    ctx.stroke();
    if (major > 26) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      for (let x = camera.x % major; x < rect.width; x += major) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, rect.height);
      }
      for (let y = camera.y % major; y < rect.height; y += major) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(rect.width, Math.round(y) + 0.5);
      }
      ctx.stroke();
    }
  }

  function drawModuleShapes(module, geo, selection) {
    const { shell } = geo;
    const { insetX, insetY } = moduleTransform(module);
    const L = shell.usableLength;
    const W = shell.usableWidth;

    // Steel box (drawn behind the interior, in local coords offset by the inset).
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-insetX, -insetY, L + insetX * 2, W + insetY * 2);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 26;
    ctx.strokeRect(-insetX, -insetY, L + insetX * 2, W + insetY * 2);

    // Corrugation, so it reads as a container rather than a generic room.
    ctx.strokeStyle = 'rgba(51,65,85,.28)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    for (let x = 0; x < L; x += 300) {
      ctx.moveTo(x, -insetY + 20);
      ctx.lineTo(x, -insetY + insetY * 0.75);
      ctx.moveTo(x, W + insetY - 20);
      ctx.lineTo(x, W + insetY * 0.25);
    }
    ctx.stroke();

    // Zones.
    for (const rect of geo.rects) {
      const meta = ZONE_TYPES[rect.type];
      ctx.fillStyle = meta?.color ?? '#f1f5f9';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      if (store.ui.showFurniture) drawFurniture(rect);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 10;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }

    // Selection wash.
    if (selection?.kind === 'zone' && selection.moduleId === module.id) {
      for (const rect of geo.rects.filter((r) => r.zoneId === selection.id)) {
        ctx.fillStyle = 'rgba(56,189,248,.22)';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 34;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }
    }

    // Loft footprint.
    if (geo.loft) {
      ctx.save();
      ctx.setLineDash([260, 170]);
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 26;
      ctx.strokeRect(geo.loft.x0 + 60, 60, geo.loft.length - 120, W - 120);
      ctx.restore();
    }

    // Interior walls.
    ctx.lineCap = 'butt';
    for (const divider of geo.dividers) {
      if (divider.kind === 'open') continue;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 90;
      ctx.beginPath();
      if (divider.opening) {
        ctx.moveTo(divider.x, 0);
        ctx.lineTo(divider.x, divider.opening.y0);
        ctx.moveTo(divider.x, divider.opening.y1);
        ctx.lineTo(divider.x, W);
      } else {
        ctx.moveTo(divider.x, 0);
        ctx.lineTo(divider.x, W);
      }
      ctx.stroke();
      if (divider.kind === 'door' && divider.opening) {
        drawSwing(divider.x, divider.opening.y1, divider.opening.width, 'y');
      }
    }

    for (const zone of geo.zones) {
      if (!zone.split) continue;
      const y = zone.split.side === 'left' ? W * zone.split.ratio : W - W * zone.split.ratio;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 90;
      ctx.beginPath();
      ctx.moveTo(zone.x0 + 40, y);
      ctx.lineTo(zone.x1 - 40, y);
      ctx.stroke();
    }

    // Exterior interior face.
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 60;
    ctx.strokeRect(0, 0, L, W);

    // Openings.
    for (const opening of geo.openings) {
      const selected = selection?.kind === 'opening' && selection.id === opening.id;
      drawOpening(opening, shell, selected);
    }

    // Divider grab handles.
    for (const divider of geo.dividers) {
      ctx.fillStyle = '#0284c7';
      const handle = HANDLE_PX / camera.scale;
      ctx.fillRect(divider.x - handle / 2, W / 2 - handle * 1.6, handle, handle * 3.2);
    }
  }

  function drawOpening(opening, shell, selected) {
    const spec = OPENING_TYPES[opening.type];
    const horizontal = opening.wall === 'left' || opening.wall === 'right';
    const wallAt = { left: 0, right: shell.usableWidth, front: 0, back: shell.usableLength }[opening.wall];
    const a = horizontal ? { x: opening.offset, y: wallAt } : { x: wallAt, y: opening.offset };
    const b = horizontal
      ? { x: opening.offset + opening.width, y: wallAt }
      : { x: wallAt, y: opening.offset + opening.width };

    ctx.save();
    ctx.lineCap = 'butt';
    // Erase the wall through the opening.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 150;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    if (spec?.kind === 'window') {
      ctx.strokeStyle = selected ? '#0284c7' : '#0ea5e9';
      ctx.lineWidth = selected ? 60 : 40;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    } else {
      ctx.strokeStyle = selected ? '#0284c7' : '#0f172a';
      ctx.lineWidth = selected ? 60 : 36;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const inward = opening.wall === 'right' || opening.wall === 'back' ? -1 : 1;
      if (horizontal) drawSwing(a.x, a.y, opening.width * inward, 'x', inward);
      else drawSwing(a.x, a.y, opening.width * inward, 'y-door', inward);
    }
    ctx.restore();
  }

  function drawSwing(x, y, size, axis, inward = 1) {
    ctx.save();
    ctx.strokeStyle = 'rgba(100,116,139,.75)';
    ctx.lineWidth = 16;
    ctx.setLineDash([90, 70]);
    ctx.beginPath();
    const radius = Math.abs(size);
    if (axis === 'y') {
      ctx.moveTo(x, y);
      ctx.arc(x, y - radius, radius, Math.PI / 2, 0, true);
    } else if (axis === 'x') {
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, (Math.PI / 2) * inward, inward < 0);
    } else {
      ctx.moveTo(x, y + radius);
      ctx.arc(x, y, radius, Math.PI / 2, 0, true);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ── furniture glyphs ─────────────────────────────────── */
  function drawFurniture(rect) {
    const pad = 140;
    const x = rect.x + pad;
    const y = rect.y + pad;
    const w = rect.w - pad * 2;
    const h = rect.h - pad * 2;
    if (w < 500 || h < 500) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(15,23,42,.34)';
    ctx.fillStyle = 'rgba(15,23,42,.07)';
    ctx.lineWidth = 22;

    const box = (bx, by, bw, bh) => {
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();
    };
    const circle = (cx, cy, r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };

    switch (rect.type) {
      case 'bedroom':
      case 'bunk': {
        const bedW = Math.min(1400, h - 100);
        const bedL = Math.min(2000, w - 100);
        const bx = x + (w - bedL) / 2;
        const by = y + (h - bedW) / 2;
        box(bx, by, bedL, bedW);
        box(bx + 60, by + 60, 300, bedW - 120); // pillows
        break;
      }
      case 'living': {
        const sofaL = Math.min(1900, w - 200);
        box(x, y + h - 850, sofaL, 800);
        box(x + sofaL + 200, y + h - 700, 700, 500);
        break;
      }
      case 'kitchen': {
        box(x, y, w, 600); // counter run
        circle(x + w * 0.3, y + 300, 190); // sink
        circle(x + w * 0.62, y + 190, 110);
        circle(x + w * 0.62, y + 420, 110);
        circle(x + w * 0.78, y + 190, 110);
        circle(x + w * 0.78, y + 420, 110);
        break;
      }
      case 'bath': {
        box(x, y, Math.min(900, w * 0.45), Math.min(900, h)); // shower
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.min(900, w * 0.45), y + Math.min(900, h));
        ctx.stroke();
        circle(x + w - 250, y + 250, 220); // basin
        box(x + w - 700, y + h - 600, 400, 550); // wc
        break;
      }
      case 'wc': {
        box(x, y + h - 600, 380, 520);
        circle(x + w - 220, y + 220, 190);
        break;
      }
      case 'office': {
        box(x, y, Math.min(1500, w), 600);
        circle(x + 600, y + 950, 250);
        break;
      }
      case 'dining': {
        box(x + w / 2 - 500, y + h / 2 - 400, 1000, 800);
        circle(x + w / 2 - 800, y + h / 2, 200);
        circle(x + w / 2 + 800, y + h / 2, 200);
        break;
      }
      case 'stair': {
        const treads = Math.max(3, Math.floor(w / 260));
        for (let i = 0; i < treads; i += 1) {
          const tx = x + (i * w) / treads;
          ctx.beginPath();
          ctx.moveTo(tx, y);
          ctx.lineTo(tx, y + h);
          ctx.stroke();
        }
        break;
      }
      case 'storage':
      case 'utility': {
        box(x, y, w, Math.min(600, h));
        break;
      }
      case 'deck': {
        ctx.strokeStyle = 'rgba(15,23,42,.22)';
        for (let i = 0; i < w; i += 220) {
          ctx.beginPath();
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i, y + h);
          ctx.stroke();
        }
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  /* ── labels & dimensions (screen space) ───────────────── */
  function drawModuleLabels(module, geo, selection) {
    const units = store.project.units;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const rect of geo.rects) {
      const center = localToWorld(module, { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });
      const screen = toScreen(center.x, center.y);
      const pxW = rect.w * camera.scale;
      const pxH = rect.h * camera.scale;
      if (pxW < 54 || pxH < 34) continue;
      const meta = ZONE_TYPES[rect.type];
      ctx.fillStyle = '#0f172a';
      ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(meta?.name ?? rect.type, screen.x, screen.y - 8);
      if (pxH > 52) {
        ctx.fillStyle = '#64748b';
        ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
        ctx.fillText(formatArea(rect.area, units), screen.x, screen.y + 9);
      }
    }

    if (geo.loft) {
      const center = localToWorld(module, { x: (geo.loft.x0 + geo.loft.x1) / 2, y: geo.shell.usableWidth - 260 });
      const screen = toScreen(center.x, center.y);
      ctx.fillStyle = '#7c3aed';
      ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`LOFT ABOVE · ${formatArea(geo.loft.area, units)}`, screen.x, screen.y);
    }

    // Module chip — grab it to move the whole box. Positioned in screen space
    // so it never collides with the dimension strings at any zoom.
    const footprint = moduleFootprint(module);
    const chipCorner = toScreen(footprint.x, footprint.y);
    const chip = { x: chipCorner.x, y: chipCorner.y - 16 };
    const label = `${module.name || 'Box'} · ${geo.shell.container.short}`;
    ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
    const chipWidth = ctx.measureText(label).width + 18;
    const active = store.ui.activeModuleId === module.id;
    ctx.fillStyle = active ? '#0284c7' : '#475569';
    roundRect(chip.x - 4, chip.y - 11, chipWidth, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(label, chip.x + 5, chip.y + 1);
    ctx.textAlign = 'center';

    if (store.ui.showDims) drawDimensions(module, geo, selection);
    ctx.restore();
  }

  function drawDimensions(module, geo, selection) {
    const units = store.project.units;
    const f = moduleFootprint(module);
    const a = toScreen(f.x, f.y2);
    const b = toScreen(f.x2, f.y2);
    dimensionLine(a, b, formatLength(f.w, units), 26);

    const c = toScreen(f.x2, f.y);
    const d = toScreen(f.x2, f.y2);
    dimensionLine(c, d, formatLength(f.h, units), 26, true);

    if (selection?.kind === 'zone' && selection.moduleId === module.id) {
      const zone = geo.zones.find((z) => z.id === selection.id);
      if (zone) {
        const p1 = localToWorld(module, { x: zone.x0, y: -40 });
        const p2 = localToWorld(module, { x: zone.x1, y: -40 });
        dimensionLine(toScreen(p1.x, p1.y), toScreen(p2.x, p2.y), formatLength(zone.length, units), -38, false, '#0284c7');
      }
    }
  }

  function dimensionLine(a, b, label, offset, vertical = false, color = '#475569') {
    const ax = vertical ? a.x + offset : a.x;
    const ay = vertical ? a.y : a.y + offset;
    const bx = vertical ? b.x + offset : b.x;
    const by = vertical ? b.y : b.y + offset;
    if (Math.hypot(bx - ax, by - ay) < 34) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    if (vertical) {
      ctx.moveTo(ax - 4, ay); ctx.lineTo(ax + 4, ay);
      ctx.moveTo(bx - 4, by); ctx.lineTo(bx + 4, by);
    } else {
      ctx.moveTo(ax, ay - 4); ctx.lineTo(ax, ay + 4);
      ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by + 4);
    }
    ctx.stroke();

    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
    const width = ctx.measureText(label).width + 10;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(mx - width / 2, my - 8, width, 16);
    ctx.fillStyle = color;
    ctx.fillText(label, mx, my + 1);
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ── drop previews ────────────────────────────────────── */
  function drawPayloadPreview() {
    if (!payload || !pointer.over) return;
    const world = pointer.world;

    if (payload.kind === 'opening') {
      const wall = nearestWall(world);
      if (!wall) return;
      const spec = OPENING_TYPES[payload.type];
      const module = store.project.modules.find((m) => m.id === wall.moduleId);
      const offset = clamp(wall.along - spec.width / 2, 100, wall.span - spec.width - 100);
      const horizontal = wall.wall === 'left' || wall.wall === 'right';
      const wallAt = { left: 0, right: wall.geo.shell.usableWidth, front: 0, back: wall.geo.shell.usableLength }[wall.wall];
      const p1 = localToWorld(module, horizontal ? { x: offset, y: wallAt } : { x: wallAt, y: offset });
      const p2 = localToWorld(module, horizontal
        ? { x: offset + spec.width, y: wallAt }
        : { x: wallAt, y: offset + spec.width });
      const s1 = toScreen(p1.x, p1.y);
      const s2 = toScreen(p2.x, p2.y);
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 7;
      ctx.setLineDash([9, 7]);
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const hit = hitTest(pointer);
    if (hit?.kind !== 'zone' && hit?.kind !== 'divider') return;
    const module = store.project.modules.find((m) => m.id === hit.moduleId);
    const geo = store.moduleGeo(hit.moduleId);
    const zone = geo?.zones.find((z) => z.id === hit.id);
    if (!module || !zone) return;

    const local = worldToLocal(module, world);
    const canSplit = zone.length > (ZONE_TYPES[payload.type]?.minLength ?? 900) * 2;
    ctx.save();
    if (canSplit) {
      const p1 = localToWorld(module, { x: local.x, y: 0 });
      const p2 = localToWorld(module, { x: local.x, y: geo.shell.usableWidth });
      const s1 = toScreen(p1.x, p1.y);
      const s2 = toScreen(p2.x, p2.y);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
    } else {
      for (const rect of geo.rects.filter((r) => r.zoneId === zone.id)) {
        const c1 = localToWorld(module, { x: rect.x, y: rect.y });
        const c2 = localToWorld(module, { x: rect.x + rect.w, y: rect.y + rect.h });
        const s1 = toScreen(c1.x, c1.y);
        const s2 = toScreen(c2.x, c2.y);
        ctx.fillStyle = 'rgba(2,132,199,.28)';
        ctx.fillRect(Math.min(s1.x, s2.x), Math.min(s1.y, s2.y), Math.abs(s2.x - s1.x), Math.abs(s2.y - s1.y));
      }
    }
    ctx.restore();
  }

  /* ── interactions ─────────────────────────────────────── */
  function localPointer(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event) {
    canvas.setPointerCapture(event.pointerId);
    const screen = localPointer(event);
    const hit = hitTest(screen);
    pointer = { ...screen, world: toWorldPoint(screen.x, screen.y), over: true };

    if (hit?.kind === 'opening') {
      store.select({ kind: 'opening', moduleId: hit.moduleId, id: hit.id });
      drag = { type: 'opening', ...hit, startWorld: pointer.world, startOffset: hit.opening.offset };
    } else if (hit?.kind === 'divider') {
      const geo = store.moduleGeo(hit.moduleId);
      const index = geo.zones.findIndex((zone) => zone.id === hit.id);
      drag = {
        type: 'divider',
        moduleId: hit.moduleId,
        index,
        startLocal: worldToLocal(store.project.modules.find((m) => m.id === hit.moduleId), pointer.world),
        lengths: geo.zones.map((zone) => zone.length),
      };
    } else if (hit?.kind === 'module') {
      store.select({ kind: 'module', moduleId: hit.moduleId, id: hit.moduleId });
      const module = store.project.modules.find((m) => m.id === hit.moduleId);
      drag = { type: 'module', moduleId: hit.moduleId, startWorld: pointer.world, origin: { x: module.x, y: module.y }, moved: false };
    } else if (hit?.kind === 'zone') {
      store.select({ kind: 'zone', moduleId: hit.moduleId, id: hit.id, part: hit.part });
      drag = { type: 'pan', start: screen, camera: { x: camera.x, y: camera.y }, moved: false };
    } else {
      store.select(null);
      drag = { type: 'pan', start: screen, camera: { x: camera.x, y: camera.y }, moved: false };
    }
    requestDraw();
  }

  function onPointerMove(event) {
    const screen = localPointer(event);
    pointer = { ...screen, world: toWorldPoint(screen.x, screen.y), over: true };

    if (!drag) {
      const hit = hitTest(screen);
      canvas.style.cursor = !hit ? 'grab'
        : hit.kind === 'divider' ? 'col-resize'
        : hit.kind === 'opening' ? 'grab'
        : hit.kind === 'module' ? 'move'
        : 'pointer';
      if (payload) requestDraw();
      return;
    }

    if (drag.type === 'pan') {
      camera.x = drag.camera.x + (screen.x - drag.start.x);
      camera.y = drag.camera.y + (screen.y - drag.start.y);
      drag.moved = true;
      requestDraw();
      return;
    }

    if (drag.type === 'opening') {
      const module = store.project.modules.find((m) => m.id === drag.moduleId);
      const local = worldToLocal(module, pointer.world);
      const geo = store.moduleGeo(drag.moduleId);
      const opening = geo.openings.find((o) => o.id === drag.id);
      const horizontal = opening.wall === 'left' || opening.wall === 'right';
      const span = horizontal ? geo.shell.usableLength : geo.shell.usableWidth;
      const raw = (horizontal ? local.x : local.y) - opening.width / 2;
      const offset = clamp(Math.round(raw / SNAP_MM) * SNAP_MM, 100, span - opening.width - 100);
      store.commit((draft) => {
        const target = draft.modules.find((m) => m.id === drag.moduleId).openings.find((o) => o.id === drag.id);
        target.offset = offset;
      }, { coalesce: `opening:${drag.id}` });
      onHint?.(`Opening at ${formatLength(offset, store.project.units)} from the corner`);
      return;
    }

    if (drag.type === 'divider') {
      const module = store.project.modules.find((m) => m.id === drag.moduleId);
      const local = worldToLocal(module, pointer.world);
      const delta = Math.round((local.x - drag.startLocal.x) / SNAP_MM) * SNAP_MM;
      const lengths = [...drag.lengths];
      const i = drag.index;
      const minA = ZONE_TYPES[store.project.modules.find((m) => m.id === drag.moduleId).zones[i].type]?.minLength ?? 600;
      const minB = ZONE_TYPES[store.project.modules.find((m) => m.id === drag.moduleId).zones[i + 1].type]?.minLength ?? 600;
      const bounded = clamp(delta, -(lengths[i] - Math.min(minA, lengths[i])), lengths[i + 1] - Math.min(minB, lengths[i + 1]));
      lengths[i] += bounded;
      lengths[i + 1] -= bounded;
      store.commit((draft) => {
        const zones = draft.modules.find((m) => m.id === drag.moduleId).zones;
        zones.forEach((zone, index) => { zone.length = lengths[index]; });
      }, { coalesce: `divider:${drag.moduleId}:${drag.index}` });
      const units = store.project.units;
      onHint?.(`${formatLength(lengths[i], units)}  ·  ${formatLength(lengths[i + 1], units)}`);
      return;
    }

    if (drag.type === 'module') {
      const dx = pointer.world.x - drag.startWorld.x;
      const dy = pointer.world.y - drag.startWorld.y;
      if (Math.abs(dx) > 60 || Math.abs(dy) > 60) drag.moved = true;
      const others = store.project.modules.filter((m) => m.id !== drag.moduleId).map(moduleFootprint);
      let x = Math.round((drag.origin.x + dx) / 100) * 100;
      let y = Math.round((drag.origin.y + dy) / 100) * 100;
      const self = moduleFootprint({ ...store.project.modules.find((m) => m.id === drag.moduleId), x, y });
      // Snap flush to a neighbouring box — how boxes actually get joined.
      for (const other of others) {
        for (const [a, b] of [[self.x, other.x2], [self.x, other.x], [self.x2, other.x], [self.x2, other.x2]]) {
          if (Math.abs(a - b) < 400) x += b - a;
        }
        for (const [a, b] of [[self.y, other.y2], [self.y, other.y], [self.y2, other.y], [self.y2, other.y2]]) {
          if (Math.abs(a - b) < 400) y += b - a;
        }
      }
      store.commit((draft) => {
        const target = draft.modules.find((m) => m.id === drag.moduleId);
        target.x = x;
        target.y = y;
      }, { coalesce: `module:${drag.moduleId}` });
      return;
    }
  }

  function onPointerUp(event) {
    if (drag?.type === 'module' && !drag.moved) {
      store.patchUi({ activeModuleId: drag.moduleId });
    }
    drag = null;
    store.endCoalesce();
    canvas.releasePointerCapture?.(event.pointerId);
    onHint?.(null);
    requestDraw();
  }

  function onWheel(event) {
    event.preventDefault();
    const screen = localPointer(event);
    if (event.ctrlKey || event.metaKey) {
      zoomBy(Math.exp(-event.deltaY * 0.01), screen);
    } else if (event.shiftKey) {
      camera.x -= event.deltaY;
      requestDraw();
    } else {
      zoomBy(Math.exp(-event.deltaY * 0.0022), screen);
    }
  }

  function onDoubleClick(event) {
    const hit = hitTest(localPointer(event));
    if (hit?.kind === 'opening') {
      store.commit((draft) => {
        const module = draft.modules.find((m) => m.id === hit.moduleId);
        module.openings = module.openings.filter((opening) => opening.id !== hit.id);
      });
      store.select(null);
    } else if (hit?.kind === 'divider') {
      // Double-clicking a wall cycles it: open ➝ doorway ➝ solid.
      store.commit((draft) => {
        const zone = draft.modules.find((m) => m.id === hit.moduleId).zones.find((z) => z.id === hit.id);
        const current = zone.dividerAfter?.kind ?? 'open';
        zone.dividerAfter = current === 'open'
          ? { kind: 'door', width: 813, center: null }
          : current === 'door'
            ? { kind: 'wall', width: 813, center: null }
            : { kind: 'open', width: 813, center: null };
      });
    }
  }

  /* ── payload drops from the palette ───────────────────── */
  function setPayload(next) {
    payload = next;
    requestDraw();
  }

  function pointerIsOver(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  function trackPayloadPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const screen = { x: clientX - rect.left, y: clientY - rect.top };
    pointer = { ...screen, world: toWorldPoint(screen.x, screen.y), over: pointerIsOver(clientX, clientY) };
    requestDraw();
  }

  function dropPayload(clientX, clientY, item) {
    if (!pointerIsOver(clientX, clientY)) return false;
    trackPayloadPointer(clientX, clientY);
    const world = pointer.world;

    if (item.kind === 'opening') {
      const wall = nearestWall(world);
      if (!wall) return false;
      const spec = OPENING_TYPES[item.type];
      const offset = clamp(wall.along - spec.width / 2, 100, Math.max(100, wall.span - spec.width - 100));
      const id = `op_${Math.random().toString(36).slice(2, 9)}`;
      store.commit((draft) => {
        draft.modules.find((m) => m.id === wall.moduleId).openings.push({
          id,
          type: spec.id,
          wall: wall.wall,
          offset,
          width: spec.width,
          height: spec.height,
          sill: spec.sill,
        });
      });
      store.select({ kind: 'opening', moduleId: wall.moduleId, id });
      return true;
    }

    const hit = hitTest(pointer);
    if (!hit || (hit.kind !== 'zone' && hit.kind !== 'divider')) return false;
    const module = store.project.modules.find((m) => m.id === hit.moduleId);
    const geo = store.moduleGeo(hit.moduleId);
    const zone = geo.zones.find((z) => z.id === hit.id);
    if (!zone) return false;

    const local = worldToLocal(module, world);
    const minLength = ZONE_TYPES[item.type]?.minLength ?? 900;
    const newId = `zone_${Math.random().toString(36).slice(2, 9)}`;

    store.commit((draft) => {
      const zones = draft.modules.find((m) => m.id === hit.moduleId).zones;
      const index = zones.findIndex((z) => z.id === zone.id);
      if (zone.length > minLength * 2) {
        const cut = clamp(local.x - zone.x0, minLength, zone.length - minLength);
        const before = { ...zones[index], length: zone.length - cut };
        const created = {
          id: newId,
          type: item.type,
          length: cut,
          split: null,
          dividerAfter: { kind: 'door', width: 813, center: null },
        };
        zones.splice(index, 1, created, before);
      } else {
        zones[index] = { ...zones[index], type: item.type };
      }
    });
    store.select({ kind: 'zone', moduleId: hit.moduleId, id: zone.length > minLength * 2 ? newId : zone.id });
    return true;
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', () => { pointer.over = false; });
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('dblclick', onDoubleClick);

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return {
    draw: requestDraw,
    fit,
    zoomBy,
    setPayload,
    trackPayloadPointer,
    dropPayload,
    destroy() {
      observer.disconnect();
    },
  };
}
