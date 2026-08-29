/**
 * Turns the declarative project model into drawable geometry.
 *
 * Module-local coordinates: x runs along the container length (0 at the
 * "front" end wall), y runs across the width (0 at the "left" side wall),
 * z runs up from the finished floor. Walls are named front/back (the ends)
 * and left/right (the long sides) so nothing depends on site orientation.
 *
 * This module is pure: no DOM, no node builtins. The browser and the server
 * both import it, so a plan drawn on screen and a plan exported to SVG can
 * never drift apart.
 */

import { ZONE_TYPES, resolveShell } from './containers.mjs';

export const WALL_IDS = ['front', 'back', 'left', 'right'];

/** Length of a given wall in module-local millimetres. */
export function wallLength(shell, wall) {
  return wall === 'left' || wall === 'right' ? shell.usableLength : shell.usableWidth;
}

/**
 * The two endpoints of a wall in module-local coordinates, ordered so that
 * `offset` always runs from p1 towards p2.
 */
export function wallAxis(shell, wall) {
  const { usableLength: L, usableWidth: W } = shell;
  switch (wall) {
    case 'front': return { p1: { x: 0, y: 0 }, p2: { x: 0, y: W }, normal: { x: -1, y: 0 } };
    case 'back': return { p1: { x: L, y: 0 }, p2: { x: L, y: W }, normal: { x: 1, y: 0 } };
    case 'left': return { p1: { x: 0, y: 0 }, p2: { x: L, y: 0 }, normal: { x: 0, y: -1 } };
    case 'right': default: return { p1: { x: 0, y: W }, p2: { x: L, y: W }, normal: { x: 0, y: 1 } };
  }
}

/** Resolve a zone's rectangles (a zone may be split across the width). */
function zoneRects(zone, x0, width) {
  const main = { zoneId: zone.id, type: zone.type, x: x0, y: 0, w: zone.length, h: width, part: 'main' };
  if (!zone.split) return [main];

  const splitWidth = Math.round(width * zone.split.ratio);
  if (zone.split.side === 'left') {
    return [
      { zoneId: zone.id, type: zone.split.type, x: x0, y: 0, w: zone.length, h: splitWidth, part: 'split' },
      { ...main, y: splitWidth, h: width - splitWidth },
    ];
  }
  return [
    { ...main, y: 0, h: width - splitWidth },
    { zoneId: zone.id, type: zone.split.type, x: x0, y: width - splitWidth, w: zone.length, h: splitWidth, part: 'split' },
  ];
}

/**
 * Full geometry for one module.
 * @returns {{module, shell, zones, rects, dividers, openings, loft, area, habitableArea}}
 */
export function moduleGeometry(module, project) {
  const shell = resolveShell(module.container, module.insulation ?? project.insulation, project.floorBuild);
  const rects = [];
  const zones = [];
  const dividers = [];

  let cursor = 0;
  module.zones.forEach((zone, index) => {
    const parts = zoneRects(zone, cursor, shell.usableWidth);
    for (const part of parts) {
      part.area = part.w * part.h;
      part.label = ZONE_TYPES[part.type]?.name ?? part.type;
      rects.push(part);
    }
    zones.push({
      ...zone,
      index,
      x0: cursor,
      x1: cursor + zone.length,
      centerX: cursor + zone.length / 2,
      area: zone.length * shell.usableWidth,
      rects: parts,
    });
    cursor += zone.length;

    const isLast = index === module.zones.length - 1;
    if (!isLast && zone.dividerAfter && zone.dividerAfter.kind !== 'open') {
      const width = Math.min(zone.dividerAfter.width, shell.usableWidth - 200);
      const center = zone.dividerAfter.center ?? shell.usableWidth / 2;
      const clampedCenter = Math.min(Math.max(center, width / 2 + 50), shell.usableWidth - width / 2 - 50);
      dividers.push({
        zoneId: zone.id,
        x: cursor,
        kind: zone.dividerAfter.kind,
        opening: { y0: clampedCenter - width / 2, y1: clampedCenter + width / 2, width },
      });
    } else if (!isLast) {
      dividers.push({ zoneId: zone.id, x: cursor, kind: 'open', opening: null });
    }
  });

  const openings = module.openings.map((opening) => {
    const axis = wallAxis(shell, opening.wall);
    const along = opening.wall === 'left' || opening.wall === 'right'
      ? { x: 1, y: 0 }
      : { x: 0, y: 1 };
    const start = {
      x: axis.p1.x + along.x * opening.offset,
      y: axis.p1.y + along.y * opening.offset,
    };
    const end = {
      x: start.x + along.x * opening.width,
      y: start.y + along.y * opening.width,
    };
    return {
      ...opening,
      start,
      end,
      center: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
      normal: axis.normal,
      along,
      zoneIds: zonesTouchedByOpening(zones, shell, opening),
    };
  });

  const loft = module.loft ? buildLoft(module, zones, shell) : null;

  const area = shell.usableLength * shell.usableWidth;
  const habitableArea = rects
    .filter((rect) => ZONE_TYPES[rect.type]?.habitable)
    .reduce((sum, rect) => sum + rect.area, 0);

  return { module, shell, zones, rects, dividers, openings, loft, area, habitableArea };
}

function zonesTouchedByOpening(zones, shell, opening) {
  if (opening.wall === 'front') return zones.length ? [zones[0].id] : [];
  if (opening.wall === 'back') return zones.length ? [zones[zones.length - 1].id] : [];
  const a = opening.offset;
  const b = opening.offset + opening.width;
  return zones.filter((zone) => zone.x1 > a && zone.x0 < b).map((zone) => zone.id);
}

function buildLoft(module, zones, shell) {
  const covered = zones.filter((zone) => module.loft.overZoneIds.includes(zone.id));
  if (!covered.length) return null;
  const x0 = Math.min(...covered.map((zone) => zone.x0));
  const x1 = Math.max(...covered.map((zone) => zone.x1));
  const floorHeight = module.loft.floorHeight;
  return {
    ...module.loft,
    x0,
    x1,
    y0: 0,
    y1: shell.usableWidth,
    length: x1 - x0,
    width: shell.usableWidth,
    area: (x1 - x0) * shell.usableWidth,
    headroom: shell.usableHeight - floorHeight - 40,
    underHeadroom: floorHeight - 40,
  };
}

/** Rotate a module-local point into world millimetres. */
export function toWorld(module, shell, point) {
  const insetX = (module.exteriorOffsetX ?? 0) + (shell.container.exterior.length - shell.usableLength) / 2;
  const insetY = (module.exteriorOffsetY ?? 0) + (shell.container.exterior.width - shell.usableWidth) / 2;
  const lx = point.x + insetX;
  const ly = point.y + insetY;
  const { exterior } = shell.container;

  switch (module.rotation) {
    case 90: return { x: module.x + exterior.width - ly, y: module.y + lx };
    case 180: return { x: module.x + exterior.length - lx, y: module.y + exterior.width - ly };
    case 270: return { x: module.x + ly, y: module.y + exterior.length - lx };
    default: return { x: module.x + lx, y: module.y + ly };
  }
}

/** World-space axis-aligned footprint of a module's exterior box. */
export function moduleFootprint(module) {
  const shell = resolveShell(module.container, module.insulation);
  const rotated = module.rotation === 90 || module.rotation === 270;
  const w = rotated ? shell.container.exterior.width : shell.container.exterior.length;
  const h = rotated ? shell.container.exterior.length : shell.container.exterior.width;
  return { x: module.x, y: module.y, w, h, x2: module.x + w, y2: module.y + h };
}

/** Geometry + totals for the whole project. */
export function projectGeometry(project) {
  const modules = project.modules.map((module) => moduleGeometry(module, project));
  const footprints = project.modules.map(moduleFootprint);

  const bounds = footprints.reduce(
    (acc, f) => ({
      x: Math.min(acc.x, f.x),
      y: Math.min(acc.y, f.y),
      x2: Math.max(acc.x2, f.x2),
      y2: Math.max(acc.y2, f.y2),
    }),
    { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity },
  );

  const groundModules = project.modules.filter((module) => module.level === 0);
  const groundFootprint = groundModules.reduce((sum, module) => {
    const f = moduleFootprint(module);
    return sum + f.w * f.h;
  }, 0);

  const interiorArea = modules.reduce((sum, geo) => sum + geo.area, 0);
  const habitableArea = modules.reduce((sum, geo) => sum + geo.habitableArea, 0);
  const loftArea = modules.reduce((sum, geo) => sum + (geo.loft?.area ?? 0), 0);
  const levels = Math.max(1, ...project.modules.map((module) => module.level + 1));

  return {
    modules,
    footprints,
    bounds: Number.isFinite(bounds.x) ? bounds : { x: 0, y: 0, x2: 0, y2: 0 },
    interiorArea,
    habitableArea,
    loftArea,
    totalLivingArea: interiorArea + loftArea,
    groundFootprint,
    levels,
    moduleCount: project.modules.length,
  };
}

/** Do two modules on the same level overlap? Used to keep the site plan sane. */
export function modulesOverlap(a, b) {
  if (a.level !== b.level) return false;
  const fa = moduleFootprint(a);
  const fb = moduleFootprint(b);
  return fa.x < fb.x2 && fa.x2 > fb.x && fa.y < fb.y2 && fa.y2 > fb.y;
}

/** Total width of openings cut into one wall — the container shear check. */
export function openingRunByWall(geo) {
  const totals = { front: 0, back: 0, left: 0, right: 0 };
  for (const opening of geo.openings) totals[opening.wall] += opening.width;
  return totals;
}
