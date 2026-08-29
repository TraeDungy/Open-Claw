/**
 * ISO shipping container shells, insulation build-ups and the room ("zone")
 * vocabulary the editor works in. All dimensions are millimetres.
 *
 * Exterior/interior figures follow ISO 668 nominal sizes as published by the
 * major lessors. Interior numbers are the usable steel-to-steel box before any
 * insulation; `usable*` on a resolved shell is what is left to live in.
 */

export const CONTAINERS = {
  '10DC': {
    id: '10DC',
    name: "10' Standard",
    short: "10'",
    exterior: { length: 2991, width: 2438, height: 2591 },
    interior: { length: 2831, width: 2352, height: 2393 },
    doorOpening: { width: 2340, height: 2280 },
    tareKg: 1300,
    maxPayloadKg: 8000,
    shellCostUsd: { new: 4200, cargoWorthy: 2900, asIs: 2200 },
    note: 'Compact bolt-on: office, bunk pod or bathroom wing.',
  },
  '20DC': {
    id: '20DC',
    name: "20' Standard",
    short: "20'",
    exterior: { length: 6058, width: 2438, height: 2591 },
    interior: { length: 5898, width: 2352, height: 2393 },
    doorOpening: { width: 2340, height: 2280 },
    tareKg: 2200,
    maxPayloadKg: 28180,
    shellCostUsd: { new: 5400, cargoWorthy: 3200, asIs: 2400 },
    note: 'The workhorse. Cheapest per box, tightest headroom.',
  },
  '20HC': {
    id: '20HC',
    name: "20' High Cube",
    short: "20' HC",
    exterior: { length: 6058, width: 2438, height: 2896 },
    interior: { length: 5898, width: 2352, height: 2698 },
    doorOpening: { width: 2340, height: 2585 },
    tareKg: 2350,
    maxPayloadKg: 28030,
    shellCostUsd: { new: 6100, cargoWorthy: 3900, asIs: 3000 },
    note: 'A foot more headroom for ~$700. Best starter shell.',
  },
  '40DC': {
    id: '40DC',
    name: "40' Standard",
    short: "40'",
    exterior: { length: 12192, width: 2438, height: 2591 },
    interior: { length: 12032, width: 2352, height: 2393 },
    doorOpening: { width: 2340, height: 2280 },
    tareKg: 3750,
    maxPayloadKg: 26630,
    shellCostUsd: { new: 7600, cargoWorthy: 4400, asIs: 3300 },
    note: 'Full one-bedroom in a single box.',
  },
  '40HC': {
    id: '40HC',
    name: "40' High Cube",
    short: "40' HC",
    exterior: { length: 12192, width: 2438, height: 2896 },
    interior: { length: 12032, width: 2352, height: 2698 },
    doorOpening: { width: 2340, height: 2585 },
    tareKg: 3900,
    maxPayloadKg: 26580,
    shellCostUsd: { new: 8400, cargoWorthy: 5200, asIs: 3900 },
    note: 'The default for serious builds. Room for a loft.',
  },
  '45HC': {
    id: '45HC',
    name: "45' High Cube",
    short: "45' HC",
    exterior: { length: 13716, width: 2438, height: 2896 },
    interior: { length: 13556, width: 2352, height: 2698 },
    doorOpening: { width: 2340, height: 2585 },
    tareKg: 4800,
    maxPayloadKg: 27700,
    shellCostUsd: { new: 10200, cargoWorthy: 6400, asIs: 4800 },
    note: 'Rare and pricier to ship, but the longest single span.',
  },
};

export const CONTAINER_IDS = Object.keys(CONTAINERS);

export const CONTAINER_CONDITIONS = {
  new: { id: 'new', name: 'One-trip / new', note: 'Straight walls, clean floors, no prep.' },
  cargoWorthy: { id: 'cargoWorthy', name: 'Cargo worthy', note: 'Wind & watertight, some dents. Best value.' },
  asIs: { id: 'asIs', name: 'As-is / wind & watertight', note: 'Cheapest. Budget for patching and floor replacement.' },
};

/**
 * Wall build-ups. `thickness` is per surface and is subtracted from the raw
 * steel box on both sides (width) and once at the ceiling.
 */
export const INSULATION = {
  'spray-50': {
    id: 'spray-50',
    name: 'Closed-cell spray foam, 2"',
    thickness: 64,
    rValuePerSurface: 13,
    costPerM2: 52,
    note: 'Best R per inch, seals the corrugation, no vapour barrier needed.',
  },
  'rigid-75': {
    id: 'rigid-75',
    name: 'Rigid foam board, 3"',
    thickness: 89,
    rValuePerSurface: 15,
    costPerM2: 36,
    note: 'DIY friendly. Needs careful taping at every seam.',
  },
  'wool-89': {
    id: 'wool-89',
    name: 'Mineral wool in 2x4 studs',
    thickness: 114,
    rValuePerSurface: 15,
    costPerM2: 26,
    note: 'Cheapest, but you lose 9" of width and must detail the vapour control.',
  },
  'exterior-50': {
    id: 'exterior-50',
    name: 'Exterior rigid + rainscreen',
    thickness: 25,
    rValuePerSurface: 14,
    costPerM2: 74,
    note: 'Keeps the full interior width and kills thermal bridging. Costs the most.',
  },
};

/**
 * What goes on top of the container's marine-ply deck. The service floor is the
 * one people forget: run drains inside the box and you lose 6" of headroom.
 */
export const FLOOR_BUILDUPS = {
  minimal: { id: 'minimal', name: 'Finish floor only', thickness: 25, costPerM2: 0, note: 'Vinyl straight onto the sealed container deck.' },
  standard: { id: 'standard', name: 'Sleepers + subfloor', thickness: 50, costPerM2: 18, note: 'Levels the deck and breaks the thermal bridge.' },
  service: { id: 'service', name: 'Raised service floor', thickness: 150, costPerM2: 46, note: 'Drains and PEX inside the envelope — costs 4" of headroom.' },
};

/** Shed cap built over the container roof so it drains. Counts for transport height. */
export const ROOF_CAP_HEIGHT = 300;

/**
 * Zone types. `wet` drives plumbing cost, `sleeping` drives egress checks,
 * `minLength` is the shortest that zone can be dragged to before it stops
 * being a real room.
 */
export const ZONE_TYPES = {
  living: { id: 'living', name: 'Living', color: '#dbeafe', icon: '🛋️', minLength: 1500, habitable: true },
  bedroom: { id: 'bedroom', name: 'Bedroom', color: '#e0e7ff', icon: '🛏️', minLength: 2100, habitable: true, sleeping: true },
  bunk: { id: 'bunk', name: 'Bunk nook', color: '#ede9fe', icon: '🛌', minLength: 1000, habitable: true, sleeping: true },
  kitchen: { id: 'kitchen', name: 'Kitchen', color: '#fef3c7', icon: '🍳', minLength: 1200, habitable: true, wet: true },
  dining: { id: 'dining', name: 'Dining', color: '#fef9c3', icon: '🍽️', minLength: 1200, habitable: true },
  bath: { id: 'bath', name: 'Bathroom', color: '#cffafe', icon: '🚿', minLength: 1200, wet: true, lowCeilingOk: true },
  wc: { id: 'wc', name: 'Half bath', color: '#e0f2fe', icon: '🚽', minLength: 900, wet: true, lowCeilingOk: true },
  entry: { id: 'entry', name: 'Entry / mud', color: '#f1f5f9', icon: '🚪', minLength: 900 },
  hall: { id: 'hall', name: 'Hallway', color: '#f8fafc', icon: '↕️', minLength: 600, circulation: true },
  office: { id: 'office', name: 'Office', color: '#dcfce7', icon: '💻', minLength: 1500, habitable: true },
  storage: { id: 'storage', name: 'Storage', color: '#e2e8f0', icon: '📦', minLength: 600 },
  utility: { id: 'utility', name: 'Utility / mech', color: '#e5e7eb', icon: '⚙️', minLength: 700, wet: true },
  stair: { id: 'stair', name: 'Stair / ladder', color: '#fae8ff', icon: '🪜', minLength: 900, circulation: true },
  deck: { id: 'deck', name: 'Deck', color: '#fed7aa', icon: '🌤️', minLength: 1200, exterior: true },
};

export const ZONE_TYPE_IDS = Object.keys(ZONE_TYPES);

/** Opening catalogue. Sizes are rough-opening millimetres. */
export const OPENING_TYPES = {
  'door-entry': { id: 'door-entry', name: 'Entry door', kind: 'door', width: 914, height: 2032, sill: 0, exterior: true, costUsd: 780 },
  'door-slider': { id: 'door-slider', name: 'Sliding glass door', kind: 'slider', width: 1800, height: 2032, sill: 0, exterior: true, costUsd: 1850 },
  'door-french': { id: 'door-french', name: 'French doors', kind: 'slider', width: 1520, height: 2032, sill: 0, exterior: true, costUsd: 2100 },
  'window-egress': { id: 'window-egress', name: 'Egress window', kind: 'window', width: 1220, height: 1220, sill: 760, exterior: true, costUsd: 640 },
  'window-picture': { id: 'window-picture', name: 'Picture window', kind: 'window', width: 1830, height: 1220, sill: 760, exterior: true, costUsd: 890 },
  'window-standard': { id: 'window-standard', name: 'Standard window', kind: 'window', width: 914, height: 1220, sill: 900, exterior: true, costUsd: 420 },
  'window-awning': { id: 'window-awning', name: 'Awning window', kind: 'window', width: 610, height: 610, sill: 1450, exterior: true, costUsd: 280 },
  'door-interior': { id: 'door-interior', name: 'Interior door', kind: 'door', width: 762, height: 2032, sill: 0, exterior: false, costUsd: 240 },
};

export const OPENING_TYPE_IDS = Object.keys(OPENING_TYPES);

/**
 * Resolve a shell: raw box minus the chosen build-up.
 * @returns {{container: object, insulation: object, usableLength: number, usableWidth: number, usableHeight: number, footprintMm2: number}}
 */
export function resolveShell(containerId, insulationId = 'spray-50', floorBuildId = 'standard') {
  const container = CONTAINERS[containerId];
  if (!container) throw new Error(`Unknown container: ${containerId}`);
  const insulation = INSULATION[insulationId];
  if (!insulation) throw new Error(`Unknown insulation: ${insulationId}`);
  const floorBuild = FLOOR_BUILDUPS[floorBuildId] ?? FLOOR_BUILDUPS.standard;

  const inward = insulation.id === 'exterior-50' ? 0 : insulation.thickness;
  const usableLength = container.interior.length - inward * 2;
  const usableWidth = container.interior.width - inward * 2;
  const usableHeight = container.interior.height - inward - floorBuild.thickness;

  return {
    container,
    insulation,
    floorBuild,
    usableLength,
    usableWidth,
    usableHeight,
    footprintMm2: usableLength * usableWidth,
    exteriorFootprintMm2: container.exterior.length * container.exterior.width,
  };
}
