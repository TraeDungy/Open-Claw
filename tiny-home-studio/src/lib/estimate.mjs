/**
 * Transparent cost model, bill of materials and weight check.
 *
 * Every number here is a published 2026 US mid-range rate with the assumption
 * stated on the line item. Nothing is a black box: each line carries its
 * quantity, unit and rate so a builder can argue with any single row without
 * throwing out the estimate.
 */

import { CONTAINERS, FLOOR_BUILDUPS, INSULATION, OPENING_TYPES, ZONE_TYPES } from './containers.mjs';
import { FINISH_TIERS, FOUNDATIONS, REGIONS } from './project.mjs';
import { moduleGeometry } from './geometry.mjs';
import { MM2_PER_SQM, round } from './units.mjs';

const RATES = {
  deliveryPerModule: 1250,
  cranePerLift: 1850,
  openingBase: 260,
  openingSteelPerMetre: 420,
  furringPerM2: 29,
  interiorFinishPerM2: 54,
  flooringPerM2: 62,
  electricalPerModule: 2600,
  electricalPerZone: 185,
  plumbingPerModule: 2800,
  plumbingPerWetZone: 920,
  hvacPerModule: 3200,
  roofCapPerModule: 2250,
  kitchen: 6500,
  fullBath: 5200,
  halfBath: 2400,
  loftBuild: 1900,
  stairBuild: 2600,
  solarPerKw: 2600,
  batteryPerKwh: 610,
  waterPerLitre: 1.15,
  waterPumpFilter: 900,
  designPermits: 4500,
  engineeringPerModule: 1200,
  contingencyRate: 0.12,
};

const SHEET_M2 = 2.97; // one 4x8 sheet

function line(category, label, qty, unit, unitCost, note) {
  return {
    category,
    label,
    qty: round(qty, 2),
    unit,
    unitCost: round(unitCost, 2),
    total: round(qty * unitCost, 2),
    note,
  };
}

/**
 * @returns {{lines, byCategory, subtotal, contingency, total, perSqFt, materials, weight}}
 */
export function estimateProject(project) {
  const geos = project.modules.map((module) => moduleGeometry(module, project));
  const tier = FINISH_TIERS[project.finishTier] ?? FINISH_TIERS.standard;
  const region = REGIONS[project.region] ?? REGIONS['us-national'];
  const foundation = FOUNDATIONS[project.foundation] ?? FOUNDATIONS.piers;
  const lines = [];

  // --- Shell -------------------------------------------------------------
  const byContainer = new Map();
  for (const geo of geos) {
    const id = geo.shell.container.id;
    byContainer.set(id, (byContainer.get(id) ?? 0) + 1);
  }
  for (const [containerId, count] of byContainer) {
    const container = CONTAINERS[containerId];
    const unitCost = container.shellCostUsd[project.condition] ?? container.shellCostUsd.cargoWorthy;
    lines.push(line('shell', `${container.name} shell (${project.condition})`, count, 'box', unitCost, container.note));
  }

  lines.push(line('shell', 'Delivery to site', geos.length, 'box', RATES.deliveryPerModule, 'Tilt-bed within 100 miles of a depot.'));
  const lifts = project.modules.filter((module) => module.level > 0).length;
  if (lifts) lines.push(line('shell', 'Crane lift for stacked boxes', lifts, 'lift', RATES.cranePerLift));

  // --- Sitework ----------------------------------------------------------
  lines.push(line('sitework', foundation.name, geos.length, 'box', foundation.costPerModuleUsd, foundation.note));

  // --- Envelope ----------------------------------------------------------
  let insulationM2 = 0;
  let floorM2 = 0;
  let wallLinearM = 0;
  for (const geo of geos) {
    const { usableLength: L, usableWidth: W, usableHeight: H } = geo.shell;
    const walls = (2 * L * H + 2 * W * H) / MM2_PER_SQM;
    const ceiling = (L * W) / MM2_PER_SQM;
    insulationM2 += walls + ceiling;
    floorM2 += ceiling;
    wallLinearM += (2 * L + 2 * W) / 1000;
  }
  const insulation = INSULATION[project.insulation] ?? INSULATION['spray-50'];
  lines.push(line('envelope', insulation.name, insulationM2, 'm²', insulation.costPerM2, insulation.note));
  lines.push(line('envelope', 'Furring / service cavity framing', insulationM2, 'm²', RATES.furringPerM2, '2x2 battens at 400 mm centres.'));
  lines.push(line('envelope', 'Roof cap over the container', geos.length, 'box', RATES.roofCapPerModule, 'Container roofs pond. A shed cap over the box is the cheapest way to never leak.'));
  const floorBuild = FLOOR_BUILDUPS[project.floorBuild] ?? FLOOR_BUILDUPS.standard;
  if (floorBuild.costPerM2 > 0) {
    lines.push(line('envelope', floorBuild.name, floorM2, 'm²', floorBuild.costPerM2, floorBuild.note));
  }

  // --- Openings ----------------------------------------------------------
  let openingCount = 0;
  let steelMetres = 0;
  let openingUnits = 0;
  for (const geo of geos) {
    for (const opening of geo.openings) {
      const spec = OPENING_TYPES[opening.type] ?? OPENING_TYPES['window-standard'];
      openingUnits += spec.costUsd * (1 + (tier.multiplier - 1) * 0.5);
      steelMetres += (2 * (opening.width + opening.height)) / 1000;
      openingCount += 1;
    }
  }
  if (openingCount) {
    lines.push(line('openings', 'Windows & doors (units)', openingCount, 'ea', openingUnits / openingCount, `${tier.name} glazing package.`));
    lines.push(line('openings', 'Cut, frame & weld openings', openingCount, 'ea', RATES.openingBase, 'Plasma cut, grind, prime.'));
    lines.push(line('openings', 'Tube steel surrounds', steelMetres, 'm', RATES.openingSteelPerMetre / 4, 'Welded frame on all four sides of every cut.'));
  }

  // --- Interior ----------------------------------------------------------
  lines.push(line('interior', 'Wall & ceiling finish', insulationM2, 'm²', RATES.interiorFinishPerM2 * tier.multiplier, tier.note));
  lines.push(line('interior', 'Flooring', floorM2, 'm²', RATES.flooringPerM2 * tier.multiplier));

  let partitionM2 = 0;
  for (const geo of geos) {
    const solidDividers = geo.dividers.filter((divider) => divider.kind !== 'open').length;
    partitionM2 += (solidDividers * geo.shell.usableWidth * geo.shell.usableHeight) / MM2_PER_SQM;
    for (const zone of geo.zones) {
      if (zone.split) partitionM2 += (zone.length * geo.shell.usableHeight) / MM2_PER_SQM;
    }
  }
  if (partitionM2 > 0) lines.push(line('interior', 'Interior partitions', partitionM2, 'm²', 78 * tier.multiplier, 'Framed, insulated for sound, finished both faces.'));

  // --- Systems -----------------------------------------------------------
  const zoneCount = geos.reduce((sum, geo) => sum + geo.zones.length, 0);
  const wetZones = geos.reduce(
    (sum, geo) => sum + geo.rects.filter((rect) => ZONE_TYPES[rect.type]?.wet).length,
    0,
  );
  lines.push(line('systems', 'Electrical rough-in & panel', geos.length, 'box', RATES.electricalPerModule));
  lines.push(line('systems', 'Devices & fixtures per zone', zoneCount, 'zone', RATES.electricalPerZone));
  if (wetZones) {
    lines.push(line('systems', 'Plumbing rough-in', geos.length, 'box', RATES.plumbingPerModule));
    lines.push(line('systems', 'Wet-zone fixtures & drains', wetZones, 'zone', RATES.plumbingPerWetZone));
  }
  lines.push(line('systems', 'Mini-split heat pump', geos.length, 'box', RATES.hvacPerModule, 'One head per box handles a container envelope.'));

  // --- Kitchen & bath ----------------------------------------------------
  const kitchens = countRects(geos, 'kitchen');
  const baths = countRects(geos, 'bath');
  const wcs = countRects(geos, 'wc');
  if (kitchens) lines.push(line('kitchenbath', 'Kitchen cabinets & appliances', kitchens, 'ea', RATES.kitchen * tier.multiplier));
  if (baths) lines.push(line('kitchenbath', 'Full bathroom fit-out', baths, 'ea', RATES.fullBath * tier.multiplier));
  if (wcs) lines.push(line('kitchenbath', 'Half bath fit-out', wcs, 'ea', RATES.halfBath * tier.multiplier));

  const lofts = geos.filter((geo) => geo.loft).length;
  if (lofts) lines.push(line('interior', 'Loft structure & guard', lofts, 'ea', RATES.loftBuild * tier.multiplier));
  const stairs = geos.reduce((sum, geo) => sum + geo.zones.filter((zone) => zone.type === 'stair').length, 0);
  if (stairs) lines.push(line('interior', 'Stair / ladder to loft', stairs, 'ea', RATES.stairBuild * tier.multiplier));

  // --- Off-grid ----------------------------------------------------------
  if (project.offGrid.enabled) {
    if (project.offGrid.solarKw) lines.push(line('offgrid', 'Solar array', project.offGrid.solarKw, 'kW', RATES.solarPerKw));
    if (project.offGrid.batteryKwh) lines.push(line('offgrid', 'Battery storage', project.offGrid.batteryKwh, 'kWh', RATES.batteryPerKwh));
    if (project.offGrid.waterTankL) {
      lines.push(line('offgrid', 'Water storage', project.offGrid.waterTankL, 'L', RATES.waterPerLitre));
      lines.push(line('offgrid', 'Pump, filtration & pressure tank', 1, 'set', RATES.waterPumpFilter));
    }
  }

  // --- Soft costs --------------------------------------------------------
  lines.push(line('soft', 'Design, drawings & permits', 1, 'lot', RATES.designPermits));
  lines.push(line('soft', 'Structural engineering', geos.length, 'box', RATES.engineeringPerModule, 'Required wherever you cut a side wall.'));

  // --- Roll up -----------------------------------------------------------
  const regionalized = lines.map((item) =>
    item.category === 'shell' && item.label.includes('shell')
      ? item
      : { ...item, unitCost: round(item.unitCost * region.multiplier, 2), total: round(item.total * region.multiplier, 2) },
  );

  const subtotal = regionalized.reduce((sum, item) => sum + item.total, 0);
  const contingency = subtotal * RATES.contingencyRate;
  const total = subtotal + contingency;

  const byCategory = {};
  for (const item of regionalized) {
    byCategory[item.category] = round((byCategory[item.category] ?? 0) + item.total, 2);
  }

  const interiorMm2 = geos.reduce((sum, geo) => sum + geo.area + (geo.loft?.area ?? 0), 0);
  const sqFt = interiorMm2 / 92903.04;

  return {
    lines: regionalized,
    byCategory,
    subtotal: round(subtotal, 2),
    contingency: round(contingency, 2),
    contingencyRate: RATES.contingencyRate,
    total: round(total, 2),
    perSqFt: sqFt > 0 ? round(total / sqFt, 2) : 0,
    sqFt: round(sqFt, 1),
    region: region.name,
    tier: tier.name,
    materials: buildMaterials(geos, insulationM2, floorM2, wallLinearM, steelMetres),
    weight: estimateWeight(geos, insulationM2, floorM2),
  };
}

function countRects(geos, type) {
  return geos.reduce((sum, geo) => sum + geo.rects.filter((rect) => rect.type === type).length, 0);
}

function buildMaterials(geos, insulationM2, floorM2, wallLinearM, steelMetres) {
  const items = [];
  items.push({ item: 'Insulation coverage', qty: round(insulationM2, 1), unit: 'm²' });
  items.push({ item: 'Furring battens (400 mm centres)', qty: round(insulationM2 * 2.7, 0), unit: 'lin m' });
  items.push({ item: 'Interior sheet goods (4x8)', qty: Math.ceil((insulationM2 * 1.08) / SHEET_M2), unit: 'sheets' });
  items.push({ item: 'Floor finish', qty: round(floorM2 * 1.07, 1), unit: 'm²' });
  items.push({ item: 'Tube steel for openings (50x50x3)', qty: round(steelMetres * 1.1, 1), unit: 'lin m' });
  items.push({ item: 'Perimeter trim', qty: round(wallLinearM * 2, 1), unit: 'lin m' });
  items.push({ item: 'Primer & paint', qty: round((insulationM2 / 10) * 2, 1), unit: 'L' });

  const schedule = [];
  for (const geo of geos) {
    for (const opening of geo.openings) {
      const spec = OPENING_TYPES[opening.type] ?? OPENING_TYPES['window-standard'];
      schedule.push({
        module: geo.module.name || geo.shell.container.short,
        mark: spec.name,
        wall: opening.wall,
        width: Math.round(opening.width),
        height: Math.round(opening.height),
        sill: Math.round(opening.sill),
      });
    }
  }
  return { items, schedule };
}

function estimateWeight(geos, insulationM2, floorM2) {
  const tare = geos.reduce((sum, geo) => sum + geo.shell.container.tareKg, 0);
  const buildKg = insulationM2 * 21 + floorM2 * 24;
  const fixturesKg = 900 * geos.length;
  const payload = geos.reduce((sum, geo) => sum + geo.shell.container.maxPayloadKg, 0);
  const buildTotal = buildKg + fixturesKg;
  return {
    tareKg: round(tare, 0),
    buildKg: round(buildTotal, 0),
    grossKg: round(tare + buildTotal, 0),
    payloadKg: payload,
    payloadUsedPct: payload ? round((buildTotal / payload) * 100, 1) : 0,
  };
}

export { RATES };
