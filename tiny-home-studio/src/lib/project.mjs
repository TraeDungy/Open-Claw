/**
 * Project schema: creation, cloning, normalisation and structural repair.
 *
 * A project is plain JSON so it round-trips through the API, localStorage and
 * a file on disk without any adapters. `normalizeProject` is the single place
 * that guarantees the invariants the rest of the app relies on — most
 * importantly that a module's zone lengths always sum to its usable length.
 */

import {
  CONTAINERS,
  CONTAINER_CONDITIONS,
  FLOOR_BUILDUPS,
  INSULATION,
  OPENING_TYPES,
  ZONE_TYPES,
  resolveShell,
} from './containers.mjs';
import { clamp } from './units.mjs';

export const SCHEMA_VERSION = 1;

export const FINISH_TIERS = {
  budget: { id: 'budget', name: 'Budget / DIY', multiplier: 0.72, note: 'Ply walls, vinyl plank, flat-pack cabinets.' },
  standard: { id: 'standard', name: 'Standard', multiplier: 1, note: 'Painted drywall, engineered floor, stock cabinets.' },
  premium: { id: 'premium', name: 'Premium', multiplier: 1.48, note: 'Millwork, tile, stone counters, designer fixtures.' },
};

export const REGIONS = {
  'us-national': { id: 'us-national', name: 'US national average', multiplier: 1 },
  'us-northeast': { id: 'us-northeast', name: 'US Northeast', multiplier: 1.18 },
  'us-south': { id: 'us-south', name: 'US South', multiplier: 0.92 },
  'us-midwest': { id: 'us-midwest', name: 'US Midwest', multiplier: 0.96 },
  'us-west': { id: 'us-west', name: 'US West', multiplier: 1.24 },
};

export const FOUNDATIONS = {
  piers: { id: 'piers', name: 'Concrete piers', costPerModuleUsd: 2400, note: 'Most common. Four to six pads per box.' },
  slab: { id: 'slab', name: 'Concrete slab', costPerModuleUsd: 5200, note: 'Permanent, best for cold climates.' },
  trailer: { id: 'trailer', name: 'Gooseneck trailer', costPerModuleUsd: 9800, note: 'Keeps it a THOW — no permanent foundation.' },
  screwpile: { id: 'screwpile', name: 'Helical screw piles', costPerModuleUsd: 3600, note: 'Fast, reversible, good on slopes.' },
};

let idCounter = 0;
export function makeId(prefix = 'id') {
  idCounter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${rand}`;
}

export function createProject(overrides = {}) {
  const now = new Date().toISOString();
  return normalizeProject({
    schema: SCHEMA_VERSION,
    id: makeId('proj'),
    name: 'Untitled tiny home',
    units: 'imperial',
    createdAt: now,
    updatedAt: now,
    templateId: null,
    condition: 'cargoWorthy',
    insulation: 'spray-50',
    floorBuild: 'standard',
    finishTier: 'standard',
    region: 'us-national',
    foundation: 'piers',
    offGrid: { enabled: false, solarKw: 3, batteryKwh: 10, waterTankL: 1500 },
    modules: [],
    ...overrides,
  });
}

export function createModule(containerId = '40HC', overrides = {}) {
  return {
    id: makeId('mod'),
    name: 'Module',
    container: containerId,
    x: 0,
    y: 0,
    level: 0,
    rotation: 0,
    zones: [],
    openings: [],
    loft: null,
    ...overrides,
  };
}

export function createZone(type = 'living', length = 2400, overrides = {}) {
  return { id: makeId('zone'), type, length, split: null, dividerAfter: null, ...overrides };
}

export function createOpening(typeId, wall, offset, overrides = {}) {
  const spec = OPENING_TYPES[typeId] ?? OPENING_TYPES['window-standard'];
  return {
    id: makeId('op'),
    type: spec.id,
    wall,
    offset,
    width: spec.width,
    height: spec.height,
    sill: spec.sill,
    ...overrides,
  };
}

const WALLS = new Set(['left', 'right', 'front', 'back']);

function pickKey(value, table, fallback) {
  return Object.prototype.hasOwnProperty.call(table, value) ? value : fallback;
}

function normalizeZone(rawZone) {
  const zone = { ...createZone(), ...rawZone };
  zone.type = pickKey(zone.type, ZONE_TYPES, 'living');
  zone.length = Math.max(1, Number(zone.length) || 0);

  if (zone.split && typeof zone.split === 'object') {
    zone.split = {
      type: pickKey(zone.split.type, ZONE_TYPES, 'bath'),
      ratio: clamp(Number(zone.split.ratio) || 0.5, 0.2, 0.8),
      side: zone.split.side === 'right' ? 'right' : 'left',
    };
  } else {
    zone.split = null;
  }

  if (zone.dividerAfter && typeof zone.dividerAfter === 'object') {
    const kind = ['open', 'door', 'pocket', 'wall'].includes(zone.dividerAfter.kind)
      ? zone.dividerAfter.kind
      : 'open';
    zone.dividerAfter = {
      kind,
      width: Math.max(500, Number(zone.dividerAfter.width) || 813),
      center: Number.isFinite(zone.dividerAfter.center) ? Number(zone.dividerAfter.center) : null,
    };
  } else {
    zone.dividerAfter = null;
  }
  return zone;
}

/**
 * Rescale zone lengths so they exactly fill the shell. Zones keep their
 * relative proportions, which is what makes swapping a 20' shell for a 40' one
 * feel instant rather than destructive.
 */
export function fitZonesToShell(zones, usableLength) {
  if (!zones.length) return [];
  const total = zones.reduce((sum, zone) => sum + zone.length, 0);
  if (total <= 0) {
    const even = usableLength / zones.length;
    return zones.map((zone) => ({ ...zone, length: even }));
  }
  const scale = usableLength / total;
  const scaled = zones.map((zone) => ({ ...zone, length: Math.round(zone.length * scale) }));
  // Push the rounding remainder into the largest zone so the sum is exact.
  const drift = usableLength - scaled.reduce((sum, zone) => sum + zone.length, 0);
  if (drift !== 0) {
    let largest = 0;
    for (let i = 1; i < scaled.length; i += 1) {
      if (scaled[i].length > scaled[largest].length) largest = i;
    }
    scaled[largest] = { ...scaled[largest], length: scaled[largest].length + drift };
  }
  return scaled;
}

function normalizeModule(rawModule, project) {
  const base = createModule();
  const module = { ...base, ...rawModule };
  module.container = pickKey(module.container, CONTAINERS, '40HC');
  module.x = Number(module.x) || 0;
  module.y = Number(module.y) || 0;
  module.level = Math.max(0, Math.round(Number(module.level) || 0));
  module.rotation = [0, 90, 180, 270].includes(Number(module.rotation)) ? Number(module.rotation) : 0;

  const shell = resolveShell(module.container, module.insulation ?? project.insulation, project.floorBuild);

  let zones = Array.isArray(module.zones) ? module.zones.map(normalizeZone) : [];
  if (!zones.length) zones = [normalizeZone(createZone('living', shell.usableLength))];
  module.zones = fitZonesToShell(zones, shell.usableLength);

  const wallLength = { left: shell.usableLength, right: shell.usableLength, front: shell.usableWidth, back: shell.usableWidth };
  module.openings = (Array.isArray(module.openings) ? module.openings : [])
    .map((rawOpening) => {
      const spec = OPENING_TYPES[rawOpening?.type] ?? OPENING_TYPES['window-standard'];
      const wall = WALLS.has(rawOpening?.wall) ? rawOpening.wall : 'left';
      const width = clamp(Number(rawOpening?.width) || spec.width, 300, wallLength[wall] - 200);
      const maxOffset = Math.max(100, wallLength[wall] - width - 100);
      // Sill first, then height, so an opening can never poke through the roof.
      const sill = clamp(Number(rawOpening?.sill ?? spec.sill), 0, Math.max(0, shell.usableHeight - 400));
      return {
        id: rawOpening?.id ?? makeId('op'),
        type: spec.id,
        wall,
        width,
        height: clamp(Number(rawOpening?.height) || spec.height, 300, shell.usableHeight - sill),
        sill,
        offset: clamp(Number(rawOpening?.offset) || 100, 100, maxOffset),
      };
    })
    .filter((opening) => opening.width > 0);

  if (module.loft && typeof module.loft === 'object') {
    const zoneIds = new Set(module.zones.map((zone) => zone.id));
    const overZoneIds = (module.loft.overZoneIds ?? []).filter((id) => zoneIds.has(id));
    module.loft = overZoneIds.length
      ? {
          overZoneIds,
          floorHeight: clamp(Number(module.loft.floorHeight) || 1520, 900, Math.max(1000, shell.usableHeight - 900)),
          guard: module.loft.guard !== false,
          access: ['ladder', 'stair', 'alternating'].includes(module.loft.access) ? module.loft.access : 'ladder',
        }
      : null;
  } else {
    module.loft = null;
  }

  return module;
}

/** Idempotent: normalize(normalize(p)) === normalize(p). */
export function normalizeProject(rawProject) {
  const project = { ...createDefaults(), ...rawProject };
  project.schema = SCHEMA_VERSION;
  project.id = project.id || makeId('proj');
  project.name = String(project.name || 'Untitled tiny home').slice(0, 120);
  project.units = project.units === 'metric' ? 'metric' : 'imperial';
  project.condition = pickKey(project.condition, CONTAINER_CONDITIONS, 'cargoWorthy');
  project.insulation = pickKey(project.insulation, INSULATION, 'spray-50');
  project.floorBuild = pickKey(project.floorBuild, FLOOR_BUILDUPS, 'standard');
  project.finishTier = pickKey(project.finishTier, FINISH_TIERS, 'standard');
  project.region = pickKey(project.region, REGIONS, 'us-national');
  project.foundation = pickKey(project.foundation, FOUNDATIONS, 'piers');

  const offGrid = project.offGrid ?? {};
  project.offGrid = {
    enabled: Boolean(offGrid.enabled),
    solarKw: clamp(Number(offGrid.solarKw) || 3, 0, 20),
    batteryKwh: clamp(Number(offGrid.batteryKwh) || 10, 0, 60),
    waterTankL: clamp(Number(offGrid.waterTankL) || 1500, 0, 10000),
  };

  const modules = Array.isArray(project.modules) ? project.modules : [];
  project.modules = modules.slice(0, 8).map((module) => normalizeModule(module, project));
  if (!project.modules.length) {
    project.modules = [normalizeModule(createModule('40HC'), project)];
  }
  project.updatedAt = new Date().toISOString();
  return project;
}

function createDefaults() {
  const now = new Date().toISOString();
  return {
    schema: SCHEMA_VERSION,
    name: 'Untitled tiny home',
    units: 'imperial',
    createdAt: now,
    updatedAt: now,
    templateId: null,
    condition: 'cargoWorthy',
    insulation: 'spray-50',
    floorBuild: 'standard',
    finishTier: 'standard',
    region: 'us-national',
    foundation: 'piers',
    offGrid: { enabled: false, solarKw: 3, batteryKwh: 10, waterTankL: 1500 },
    modules: [],
  };
}

export function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}
