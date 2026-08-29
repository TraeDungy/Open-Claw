/**
 * Starting points. Nobody wants a blank canvas — they want "the 40 ft one
 * bedroom" and then to move two walls. Every template is a complete, buildable
 * project: shell, zones, openings, loft and off-grid defaults included.
 *
 * Zone lengths are written to sum to the usable length of the chosen shell.
 * `normalizeProject` rescales them anyway, so swapping shells never breaks a
 * template — it just stretches it.
 */

import { normalizeProject } from './project.mjs';
import { resolveShell } from './containers.mjs';
import { toSqFt } from './units.mjs';
import { projectGeometry } from './geometry.mjs';

const zone = (id, type, length, extra = {}) => ({
  id,
  type,
  length,
  split: null,
  dividerAfter: null,
  ...extra,
});

const opening = (id, type, wall, offset, extra = {}) => ({ id, type, wall, offset, ...extra });

const split = (type, ratio = 0.55, side = 'left') => ({ type, ratio, side });

const door = (kind = 'door', width = 813) => ({ kind, width, center: null });

function mod(id, container, zones, openings, extra = {}) {
  return { id, name: extra.name ?? 'Module', container, x: 0, y: 0, level: 0, rotation: 0, zones, openings, loft: null, ...extra };
}

export const TEMPLATES = [
  {
    id: 'micro-office-10',
    name: 'Micro pod',
    tagline: "10' office, guest room or studio",
    tags: ['10 ft', 'backyard', 'no permit in many places'],
    build: () => ({
      name: 'Micro pod',
      insulation: 'spray-50',
      foundation: 'screwpile',
      modules: [
        mod('m1', '10DC',
          [
            zone('m1z1', 'office', 1603, { dividerAfter: door('pocket', 762) }),
            zone('m1z2', 'wc', 1100),
          ],
          [
            opening('m1o1', 'door-entry', 'front', 655),
            opening('m1o2', 'window-awning', 'left', 900),
            opening('m1o3', 'window-awning', 'right', 1500),
          ],
          { name: 'Pod' }),
      ],
    }),
  },
  {
    id: 'studio-20',
    name: 'The Studio',
    tagline: "20' high cube, everything on one floor",
    tags: ['20 ft HC', 'starter', 'one box'],
    build: () => ({
      name: 'The Studio',
      modules: [
        mod('m1', '20HC',
          [
            zone('m1z1', 'living', 2670),
            zone('m1z2', 'kitchen', 1600, { dividerAfter: door('open') }),
            zone('m1z3', 'bath', 1500, { dividerAfter: door('door', 762) }),
          ],
          [
            opening('m1o1', 'door-entry', 'left', 700),
            opening('m1o2', 'window-picture', 'right', 800),
            opening('m1o3', 'window-standard', 'left', 2900),
            opening('m1o4', 'window-awning', 'back', 800),
          ],
          { name: 'Studio' }),
      ],
    }),
  },
  {
    id: 'loft-20',
    name: 'Loft Cabin',
    tagline: "20' high cube with a sleeping loft over the living room",
    tags: ['20 ft HC', 'loft', 'sleeps 2'],
    build: () => ({
      name: 'Loft Cabin',
      modules: [
        mod('m1', '20HC',
          [
            zone('m1z1', 'living', 2400),
            zone('m1z2', 'stair', 900),
            zone('m1z3', 'kitchen', 1250, { dividerAfter: door('open') }),
            zone('m1z4', 'bath', 1220, { dividerAfter: door('door', 762) }),
          ],
          [
            opening('m1o1', 'door-entry', 'left', 3400),
            opening('m1o2', 'window-standard', 'left', 500),
            opening('m1o3', 'window-egress', 'right', 600, { sill: 1700 }),
            opening('m1o4', 'window-awning', 'back', 800),
          ],
          {
            name: 'Cabin',
            loft: { overZoneIds: ['m1z1', 'm1z2'], floorHeight: 1600, guard: true, access: 'alternating' },
          }),
      ],
    }),
  },
  {
    id: 'one-bed-40',
    name: 'One Bedroom',
    tagline: "40' high cube — real bedroom, real bathroom, real kitchen",
    tags: ['40 ft HC', 'ADU', 'sleeps 2'],
    build: () => ({
      name: 'One Bedroom',
      modules: [
        mod('m1', '40HC',
          [
            zone('m1z1', 'living', 3600),
            zone('m1z2', 'kitchen', 2400),
            zone('m1z3', 'hall', 2200, { split: split('bath', 0.62, 'left'), dividerAfter: door('door', 762) }),
            zone('m1z4', 'bedroom', 3704),
          ],
          [
            opening('m1o1', 'door-entry', 'front', 655),
            opening('m1o2', 'door-slider', 'left', 800),
            opening('m1o3', 'window-picture', 'right', 3900),
            opening('m1o4', 'window-awning', 'right', 6400),
            opening('m1o5', 'window-egress', 'left', 8600),
            opening('m1o6', 'window-standard', 'back', 655),
          ],
          { name: 'Main' }),
      ],
    }),
  },
  {
    id: 'adu-40-office',
    name: 'Work-From-Home ADU',
    tagline: "40' HC with a separate-entrance office at the front",
    tags: ['40 ft HC', 'ADU', 'home office'],
    build: () => ({
      name: 'Work-From-Home ADU',
      finishTier: 'premium',
      modules: [
        mod('m1', '40HC',
          [
            zone('m1z1', 'office', 2900, { dividerAfter: door('door', 813) }),
            zone('m1z2', 'living', 2900),
            zone('m1z3', 'kitchen', 2000),
            zone('m1z4', 'hall', 2000, { split: split('bath', 0.6, 'right'), dividerAfter: door('door', 762) }),
            zone('m1z5', 'bedroom', 2104),
          ],
          [
            opening('m1o1', 'door-entry', 'front', 655),
            opening('m1o2', 'window-standard', 'left', 600),
            opening('m1o3', 'door-slider', 'left', 3400),
            opening('m1o4', 'window-picture', 'right', 6300),
            opening('m1o5', 'window-egress', 'back', 500),
            opening('m1o6', 'window-awning', 'right', 8600),
          ],
          { name: 'Main' }),
      ],
    }),
  },
  {
    id: 'duplex-2x20',
    name: 'Side-by-Side Duplex',
    tagline: "Two 20' high cubes joined down the middle",
    tags: ['2 boxes', 'two bedrooms', 'rental'],
    build: () => ({
      name: 'Side-by-Side Duplex',
      modules: [
        mod('m1', '20HC',
          [
            zone('m1z1', 'living', 3170),
            zone('m1z2', 'kitchen', 2600),
          ],
          [
            opening('m1o1', 'door-entry', 'front', 655),
            opening('m1o2', 'door-slider', 'left', 700),
            opening('m1o3', 'window-standard', 'back', 655),
          ],
          { name: 'Day box' }),
        mod('m2', '20HC',
          [
            zone('m2z1', 'bedroom', 2100, { dividerAfter: door('door', 762) }),
            zone('m2z2', 'bath', 1400, { dividerAfter: door('door', 762) }),
            zone('m2z3', 'bedroom', 2270),
          ],
          [
            opening('m2o1', 'window-egress', 'right', 600),
            opening('m2o2', 'window-awning', 'right', 3200),
            opening('m2o3', 'window-egress', 'back', 500),
          ],
          { name: 'Night box', x: 0, y: 2438 }),
      ],
    }),
  },
  {
    id: 'l-shape-40-20',
    name: 'L-Shape Family',
    tagline: "40' living wing plus a 20' bedroom wing",
    tags: ['2 boxes', 'courtyard', 'sleeps 4'],
    build: () => ({
      name: 'L-Shape Family',
      modules: [
        mod('m1', '40HC',
          [
            zone('m1z1', 'deck', 2400),
            zone('m1z2', 'living', 4200),
            zone('m1z3', 'kitchen', 2900),
            zone('m1z4', 'hall', 2404, { split: split('bath', 0.6, 'left'), dividerAfter: door('door', 762) }),
          ],
          [
            opening('m1o1', 'door-slider', 'left', 3000),
            opening('m1o2', 'window-picture', 'right', 3200),
            opening('m1o3', 'door-entry', 'front', 655),
            opening('m1o4', 'window-standard', 'right', 7600),
            opening('m1o5', 'window-awning', 'left', 9800),
          ],
          { name: 'Living wing' }),
        mod('m2', '20HC',
          [
            zone('m2z1', 'bedroom', 3000, { dividerAfter: door('door', 762) }),
            zone('m2z2', 'bedroom', 2770),
          ],
          [
            opening('m2o1', 'window-egress', 'left', 800),
            opening('m2o2', 'window-egress', 'back', 500),
            opening('m2o3', 'window-awning', 'right', 3600),
          ],
          { name: 'Bedroom wing', x: 9754, y: 2438, rotation: 90 }),
      ],
    }),
  },
  {
    id: 'stack-2x40',
    name: 'Two-Storey Stack',
    tagline: "Two 40' high cubes stacked — living down, bedrooms up",
    tags: ['2 boxes', 'two storey', 'sleeps 4'],
    build: () => ({
      name: 'Two-Storey Stack',
      foundation: 'slab',
      modules: [
        mod('m1', '40HC',
          [
            zone('m1z1', 'entry', 1500),
            zone('m1z2', 'living', 4400),
            zone('m1z3', 'kitchen', 3000),
            zone('m1z4', 'stair', 1500),
            zone('m1z5', 'wc', 1504, { dividerAfter: door('door', 762) }),
          ],
          [
            opening('m1o1', 'door-entry', 'front', 655),
            opening('m1o2', 'door-slider', 'left', 2200),
            opening('m1o3', 'window-picture', 'right', 2600),
            opening('m1o4', 'window-standard', 'right', 6200),
            opening('m1o5', 'window-awning', 'left', 9600),
          ],
          { name: 'Ground floor' }),
        mod('m2', '40HC',
          [
            zone('m2z1', 'bedroom', 3400, { dividerAfter: door('door', 762) }),
            zone('m2z2', 'hall', 2200, { split: split('bath', 0.62, 'right'), dividerAfter: door('door', 762) }),
            zone('m2z3', 'office', 2600, { dividerAfter: door('door', 762) }),
            zone('m2z4', 'bedroom', 3704),
          ],
          [
            opening('m2o1', 'window-egress', 'left', 800),
            opening('m2o2', 'window-picture', 'right', 900),
            opening('m2o3', 'window-awning', 'right', 4400),
            opening('m2o4', 'window-standard', 'left', 6200),
            opening('m2o5', 'window-egress', 'left', 8800),
            opening('m2o6', 'window-standard', 'back', 655),
          ],
          { name: 'Upper floor', level: 1 }),
      ],
    }),
  },
  {
    id: 'offgrid-20',
    name: 'Off-Grid Cabin',
    tagline: "20' HC sized around a 4 kW array and 1,500 L of water",
    tags: ['20 ft HC', 'off grid', 'solar'],
    build: () => ({
      name: 'Off-Grid Cabin',
      finishTier: 'budget',
      foundation: 'screwpile',
      insulation: 'exterior-50',
      offGrid: { enabled: true, solarKw: 4, batteryKwh: 15, waterTankL: 1500 },
      modules: [
        mod('m1', '20HC',
          [
            zone('m1z1', 'living', 2500),
            zone('m1z2', 'kitchen', 1500),
            zone('m1z3', 'bath', 1300, { dividerAfter: door('door', 762) }),
            zone('m1z4', 'utility', 750),
          ],
          [
            opening('m1o1', 'door-entry', 'left', 600),
            opening('m1o2', 'window-standard', 'right', 500),
            opening('m1o3', 'window-awning', 'right', 3200),
            opening('m1o4', 'window-egress', 'front', 500, { sill: 1700 }),
          ],
          {
            name: 'Cabin',
            loft: { overZoneIds: ['m1z1'], floorHeight: 1600, guard: true, access: 'ladder' },
          }),
      ],
    }),
  },
];

/** Build a full, normalized project from a template id. */
export function buildFromTemplate(templateId, overrides = {}) {
  const template = TEMPLATES.find((entry) => entry.id === templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  return normalizeProject({ ...template.build(), templateId, ...overrides });
}

/** Lightweight catalogue for the picker: no geometry, just headline numbers. */
export function templateSummaries() {
  return TEMPLATES.map((template) => {
    const project = buildFromTemplate(template.id);
    const geo = projectGeometry(project);
    const shells = project.modules.map((module) => resolveShell(module.container, project.insulation).container.short);
    const bedrooms = project.modules.reduce(
      (count, module) => count + module.zones.filter((z) => z.type === 'bedroom' || z.split?.type === 'bedroom').length,
      0,
    );
    const lofts = project.modules.filter((module) => module.loft).length;
    return {
      id: template.id,
      name: template.name,
      tagline: template.tagline,
      tags: template.tags,
      shells,
      moduleCount: project.modules.length,
      sqFt: Math.round(toSqFt(geo.totalLivingArea)),
      bedrooms: bedrooms + lofts,
      hasLoft: lofts > 0,
      levels: geo.levels,
      project,
    };
  });
}
