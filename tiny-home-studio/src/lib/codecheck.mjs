/**
 * Live buildability checks.
 *
 * Two families of rules:
 *  1. Residential code, following the 2021 IRC and Appendix Q (Tiny Houses),
 *     which is the appendix most US jurisdictions adopt for dwellings under
 *     400 sq ft.
 *  2. Container-specific structural and logistics rules that no generic floor
 *     plan tool checks — corrugated side walls are shear panels, and a box
 *     still has to fit under a bridge on the way to site.
 *
 * These are design-stage guardrails, not a substitute for a plan review by a
 * licensed engineer or your building department.
 */

import { ROOF_CAP_HEIGHT, ZONE_TYPES } from './containers.mjs';
import { moduleGeometry, openingRunByWall, modulesOverlap } from './geometry.mjs';
import { inches, feet, toSqFt } from './units.mjs';

export const LIMITS = {
  ceilingHabitable: inches(80), // IRC Q104.1 — 6'8"
  ceilingWetKitchen: inches(76), // 6'4" at bath/toilet/kitchen
  loftMinArea: feet(5) * feet(7), // Q105.1 — 35 sq ft
  loftMinDimension: feet(5),
  loftMinHeadroom: inches(36),
  loftGuardHeight: inches(36),
  loftGuardTrigger: inches(30),
  egressMinArea: 0.53 * 1_000_000, // R310.2.1 — 5.7 sq ft net clear
  egressMinWidth: inches(20),
  egressMinHeight: inches(24),
  egressMaxSill: inches(44),
  exitDoorClearWidth: inches(32),
  exitDoorHeight: inches(78),
  hallwayMinWidth: inches(36),
  wcFrontClearance: inches(21),
  wcSideClearance: inches(15),
  kitchenWalkway: inches(36),
  transportMaxHeight: 4115, // 13'6" legal load height in most US states
  trailerDeckHeight: 1067,
  shearMaxOpeningRatio: 0.5, // total cut length per side wall before a full header
};

const SEVERITY_RANK = { fail: 0, warn: 1, info: 2, pass: 3 };

function issue(severity, code, title, detail, extra = {}) {
  return { severity, code, title, detail, ...extra };
}

/** Every check in one pass. Returns issues sorted worst-first. */
export function runCodeChecks(project) {
  const issues = [];
  const geos = project.modules.map((module) => moduleGeometry(module, project));

  for (const geo of geos) {
    issues.push(...checkCeilings(geo));
    issues.push(...checkEgress(geo));
    issues.push(...checkCirculation(geo));
    issues.push(...checkBathrooms(geo));
    issues.push(...checkLoft(geo));
    issues.push(...checkStructure(geo));
    issues.push(...checkTransport(geo, project));
  }

  issues.push(...checkExitDoor(geos));
  issues.push(...checkProjectWide(project, geos));

  issues.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  return {
    issues,
    failCount: issues.filter((i) => i.severity === 'fail').length,
    warnCount: issues.filter((i) => i.severity === 'warn').length,
    infoCount: issues.filter((i) => i.severity === 'info').length,
    ready: issues.every((i) => i.severity !== 'fail'),
  };
}

function moduleLabel(geo) {
  return geo.module.name || geo.shell.container.short;
}

function checkCeilings(geo) {
  const issues = [];
  const height = geo.shell.usableHeight;
  const habitable = geo.rects.some((rect) => ZONE_TYPES[rect.type]?.habitable);

  if (habitable && height < LIMITS.ceilingHabitable) {
    issues.push(issue(
      'fail',
      'Q104.1',
      'Ceiling too low for habitable rooms',
      `${moduleLabel(geo)} finishes at ${Math.round(height)} mm of headroom. Habitable rooms need 6'8" (2032 mm). Switch to a high-cube shell or move the insulation outboard.`,
      { moduleId: geo.module.id, fix: 'shell' },
    ));
  } else if (habitable && height < LIMITS.ceilingHabitable + 100) {
    issues.push(issue(
      'warn',
      'Q104.1',
      'Ceiling height is at the limit',
      `${Math.round(height)} mm leaves under 100 mm of margin over the 6'8" minimum. Any added floor build-up puts you under.`,
      { moduleId: geo.module.id },
    ));
  }

  const wetOnly = geo.rects.some((rect) => ZONE_TYPES[rect.type]?.lowCeilingOk || ZONE_TYPES[rect.type]?.wet);
  if (wetOnly && height < LIMITS.ceilingWetKitchen) {
    issues.push(issue(
      'fail',
      'Q104.1.1',
      'Ceiling too low at bath/kitchen',
      `Bathrooms, toilet rooms and kitchens need 6'4" (1930 mm). This shell gives ${Math.round(height)} mm.`,
      { moduleId: geo.module.id, fix: 'shell' },
    ));
  }
  return issues;
}

function checkEgress(geo) {
  const issues = [];
  const sleepingZones = geo.zones.filter((zone) => {
    if (ZONE_TYPES[zone.type]?.sleeping) return true;
    return Boolean(zone.split && ZONE_TYPES[zone.split.type]?.sleeping);
  });

  for (const zone of sleepingZones) {
    const served = geo.openings.filter((opening) => opening.zoneIds.includes(zone.id));
    const qualifying = served.filter(isEgressCompliant);
    if (!qualifying.length) {
      const near = served.find((opening) => opening.kind !== 'door');
      issues.push(issue(
        'fail',
        'R310.2',
        `${ZONE_TYPES[zone.type]?.name ?? 'Sleeping room'} has no emergency escape opening`,
        near
          ? `The window serving this room is ${Math.round(near.width)} × ${Math.round(near.height)} mm at a ${Math.round(near.sill)} mm sill. An escape opening needs 5.7 sq ft net clear, at least 20" wide, 24" tall, sill no higher than 44".`
          : 'Every sleeping room needs an egress window or a door directly outside. Drop an egress window on a long wall next to this room.',
        { moduleId: geo.module.id, zoneId: zone.id, fix: 'add-egress' },
      ));
    }
  }

  return issues;
}

/** A dwelling needs one compliant exit — not one per box, since boxes join. */
function checkExitDoor(geos) {
  const doors = geos.flatMap((geo) =>
    geo.openings
      .filter((opening) => opening.type.startsWith('door'))
      .map((opening) => ({ opening, geo })),
  );
  const compliant = doors.some(
    ({ opening }) => opening.width >= LIMITS.exitDoorClearWidth + inches(2) && opening.height >= LIMITS.exitDoorHeight,
  );
  if (compliant) return [];
  return [issue(
    doors.length ? 'warn' : 'fail',
    'R311.2',
    'No compliant exit door',
    doors.length
      ? 'The exit door needs 32" of clear width (a 36" door) and 78" of height.'
      : 'Every dwelling needs at least one side-hinged exterior door. Add an entry door.',
    { moduleId: geos[0]?.module.id, fix: 'add-door' },
  )];
}

export function isEgressCompliant(opening) {
  if (opening.type === 'door-entry' || opening.type === 'door-slider' || opening.type === 'door-french') return true;
  const netArea = opening.width * opening.height * 0.85; // sash and frame eat the net clear
  return (
    netArea >= LIMITS.egressMinArea &&
    opening.width >= LIMITS.egressMinWidth &&
    opening.height >= LIMITS.egressMinHeight &&
    opening.sill <= LIMITS.egressMaxSill
  );
}

function checkCirculation(geo) {
  const issues = [];
  for (const zone of geo.zones) {
    const meta = ZONE_TYPES[zone.type];
    if (!meta) continue;

    if (zone.length < meta.minLength) {
      issues.push(issue(
        'warn',
        'design',
        `${meta.name} is under ${meta.minLength} mm`,
        `At ${Math.round(zone.length)} mm this zone stops working as a ${meta.name.toLowerCase()}. Drag the divider or merge it into a neighbour.`,
        { moduleId: geo.module.id, zoneId: zone.id },
      ));
    }

    if (meta.circulation && !zone.split && geo.shell.usableWidth < LIMITS.hallwayMinWidth) {
      issues.push(issue('warn', 'R311.6', 'Hallway below 36"', 'Corridors serving habitable rooms want 36" clear.', {
        moduleId: geo.module.id,
        zoneId: zone.id,
      }));
    }

    if (zone.split) {
      const splitWidth = geo.shell.usableWidth * zone.split.ratio;
      const remainder = geo.shell.usableWidth - splitWidth;
      const passage = Math.min(splitWidth, remainder);
      if (passage < inches(28)) {
        issues.push(issue(
          'warn',
          'design',
          'Side-by-side split leaves a pinch point',
          `The narrow side of this split is ${Math.round(passage)} mm. Under 28" you cannot walk past a person, and appliances will not fit through.`,
          { moduleId: geo.module.id, zoneId: zone.id },
        ));
      }
    }

    if (zone.type === 'kitchen' && geo.shell.usableWidth - inches(25) < LIMITS.kitchenWalkway) {
      issues.push(issue(
        'info',
        'design',
        'Galley kitchen will be single-run',
        `With ${Math.round(geo.shell.usableWidth)} mm of width you can only run counters down one side and still keep a 36" walkway.`,
        { moduleId: geo.module.id, zoneId: zone.id },
      ));
    }
  }
  return issues;
}

function checkBathrooms(geo) {
  const issues = [];
  const baths = geo.rects.filter((rect) => rect.type === 'bath' || rect.type === 'wc');
  for (const bath of baths) {
    const shortSide = Math.min(bath.w, bath.h);
    if (shortSide < LIMITS.wcSideClearance * 2) {
      issues.push(issue(
        'fail',
        'R307.1',
        'Bathroom too narrow for a toilet',
        `A water closet needs 15" from its centreline to each side, so 30" minimum between finished faces. This one is ${Math.round(shortSide)} mm.`,
        { moduleId: geo.module.id, zoneId: bath.zoneId },
      ));
    } else if (Math.max(bath.w, bath.h) < LIMITS.wcFrontClearance + inches(28)) {
      issues.push(issue(
        'warn',
        'R307.1',
        'Tight clearance in front of the toilet',
        'You need 21" of clear floor in front of a water closet, measured from the front of the bowl.',
        { moduleId: geo.module.id, zoneId: bath.zoneId },
      ));
    }
    if (toSqFt(bath.area) < 18 && bath.type === 'bath') {
      issues.push(issue(
        'info',
        'design',
        'Full bath under 18 sq ft',
        'It fits, but plan on a wet-room layout with the shower draining to the floor rather than a separate pan.',
        { moduleId: geo.module.id, zoneId: bath.zoneId },
      ));
    }
  }
  return issues;
}

function checkLoft(geo) {
  const issues = [];
  const loft = geo.loft;
  if (!loft) return issues;

  if (loft.area < LIMITS.loftMinArea) {
    issues.push(issue(
      'fail',
      'Q105.1',
      'Loft below the 35 sq ft minimum',
      `This loft is ${Math.round(toSqFt(loft.area))} sq ft. Appendix Q sets 35 sq ft with no horizontal dimension under 5 ft.`,
      { moduleId: geo.module.id, fix: 'loft' },
    ));
  }
  if (Math.min(loft.length, loft.width) < LIMITS.loftMinDimension) {
    issues.push(issue('fail', 'Q105.1', 'Loft is too narrow', 'No horizontal dimension of a loft may be under 5 ft (1524 mm).', {
      moduleId: geo.module.id,
      fix: 'loft',
    }));
  }
  if (loft.headroom < LIMITS.loftMinHeadroom) {
    issues.push(issue(
      'warn',
      'Q105.2',
      'Not enough headroom in the loft',
      `${Math.round(loft.headroom)} mm above the loft floor. Under 36" you cannot sit up, and it stops counting as sleeping area.`,
      { moduleId: geo.module.id, fix: 'loft' },
    ));
  }
  if (loft.underHeadroom < LIMITS.ceilingWetKitchen) {
    issues.push(issue(
      'info',
      'Q104.1.1',
      'Low ceiling under the loft',
      `${Math.round(loft.underHeadroom)} mm underneath. Keep storage, a desk or a bathroom there rather than a habitable room.`,
      { moduleId: geo.module.id },
    ));
  }
  if (!loft.guard && loft.floorHeight > LIMITS.loftGuardTrigger) {
    issues.push(issue('fail', 'Q105.4', 'Loft needs a guard', 'Lofts more than 30" above the floor need a 36" guard on open sides.', {
      moduleId: geo.module.id,
      fix: 'loft',
    }));
  }
  // A loft is a sleeping area, so it needs its own escape opening. The sill is
  // measured from the loft floor, not from the floor below.
  const loftWindows = geo.openings.filter((opening) => {
    const minX = Math.min(opening.start.x, opening.end.x);
    const maxX = Math.max(opening.start.x, opening.end.x);
    return maxX >= loft.x0 && minX <= loft.x1;
  });
  const loftEgress = loftWindows.some((opening) =>
    isEgressCompliant({ ...opening, sill: opening.sill - loft.floorHeight }) && opening.sill + opening.height > loft.floorHeight,
  );
  if (!loftEgress) {
    issues.push(issue(
      'warn',
      'Q105.5',
      'Loft has no escape opening',
      'A sleeping loft needs an egress window at loft level: 5.7 sq ft net clear, at least 24" tall, with the sill no more than 44" above the loft floor.',
      { moduleId: geo.module.id, fix: 'add-egress' },
    ));
  }

  const hasAccessZone = geo.zones.some((zone) => zone.type === 'stair');
  if (!hasAccessZone && loft.access !== 'ladder') {
    issues.push(issue(
      'warn',
      'Q105.3',
      'No floor area reserved for loft access',
      'A stair or alternating-tread device needs its own footprint. Add a stair zone, or set the access to a ladder.',
      { moduleId: geo.module.id, fix: 'loft' },
    ));
  }
  return issues;
}

function checkStructure(geo) {
  const issues = [];
  const runs = openingRunByWall(geo);
  const sideLength = geo.shell.usableLength;

  for (const wall of ['left', 'right']) {
    const ratio = runs[wall] / sideLength;
    if (ratio > LIMITS.shearMaxOpeningRatio) {
      issues.push(issue(
        'fail',
        'container',
        `${wall === 'left' ? 'Left' : 'Right'} wall is cut past 50%`,
        `${Math.round(runs[wall])} mm of openings in a ${Math.round(sideLength)} mm wall. The corrugated side is the shear panel — past half you are effectively building a moment frame and need an engineered full-length header and posts.`,
        { moduleId: geo.module.id, fix: 'openings' },
      ));
    } else if (ratio > 0.33) {
      issues.push(issue(
        'warn',
        'container',
        `${wall === 'left' ? 'Left' : 'Right'} wall needs reinforcement`,
        `Openings total ${Math.round(runs[wall])} mm. Every cut in a side wall needs tube steel welded around it; at this much removal have an engineer size the header.`,
        { moduleId: geo.module.id },
      ));
    }
  }

  const wideOpenings = geo.openings.filter((opening) => opening.width > 2400 && (opening.wall === 'left' || opening.wall === 'right'));
  for (const opening of wideOpenings) {
    issues.push(issue(
      'warn',
      'container',
      'Wide side-wall opening',
      `A ${Math.round(opening.width)} mm opening in a side wall needs a welded steel header sized by an engineer — this is the single most common container-build failure.`,
      { moduleId: geo.module.id, openingId: opening.id },
    ));
  }

  const cornerClash = geo.openings.filter((opening) => {
    const length = opening.wall === 'left' || opening.wall === 'right' ? geo.shell.usableLength : geo.shell.usableWidth;
    return opening.offset < 300 || opening.offset + opening.width > length - 300;
  });
  for (const opening of cornerClash) {
    issues.push(issue(
      'warn',
      'container',
      'Opening too close to a corner post',
      'Keep at least 300 mm between an opening and the corner casting — that post carries the stack load.',
      { moduleId: geo.module.id, openingId: opening.id, fix: 'openings' },
    ));
  }
  return issues;
}

function checkTransport(geo, project) {
  const issues = [];
  const height = geo.shell.container.exterior.height + ROOF_CAP_HEIGHT;
  if (project.foundation === 'trailer') {
    const loaded = height + LIMITS.trailerDeckHeight;
    if (loaded > LIMITS.transportMaxHeight) {
      issues.push(issue(
        'fail',
        'transport',
        'Over legal height on a trailer',
        `${geo.shell.container.short} plus a roof cap on a gooseneck deck stands ${Math.round(loaded)} mm — over the 13'6" limit. Drop to a standard-height box, or accept an oversize permit for every move.`,
        { moduleId: geo.module.id, fix: 'shell' },
      ));
    }
  }
  if (geo.module.level > 0) {
    issues.push(issue(
      'info',
      'logistics',
      'Stacked module needs a crane',
      'Budget a day of crane time and confirm the lower box\'s corner castings line up — never land a box mid-span.',
      { moduleId: geo.module.id },
    ));
  }
  return issues;
}

function checkProjectWide(project, geos) {
  const issues = [];

  for (let i = 0; i < project.modules.length; i += 1) {
    for (let j = i + 1; j < project.modules.length; j += 1) {
      if (modulesOverlap(project.modules[i], project.modules[j])) {
        issues.push(issue(
          'fail',
          'site',
          'Modules overlap',
          `${project.modules[i].name || 'Module'} and ${project.modules[j].name || 'Module'} occupy the same ground. Move one on the site plan or stack it to a second level.`,
          { moduleId: project.modules[j].id, fix: 'site' },
        ));
      }
    }
  }

  const hasKitchen = geos.some((geo) => geo.rects.some((rect) => rect.type === 'kitchen'));
  const hasBath = geos.some((geo) => geo.rects.some((rect) => rect.type === 'bath' || rect.type === 'wc'));
  const hasSleeping = geos.some((geo) =>
    geo.rects.some((rect) => ZONE_TYPES[rect.type]?.sleeping) || geo.loft,
  );

  if (!hasKitchen) {
    issues.push(issue('warn', 'R304', 'No kitchen', 'A dwelling unit needs cooking facilities to be permitted as a residence.'));
  }
  if (!hasBath) {
    issues.push(issue('fail', 'R306.1', 'No bathroom', 'Every dwelling needs a water closet, lavatory and bathing fixture.'));
  }
  if (!hasSleeping) {
    issues.push(issue('info', 'design', 'No dedicated sleeping area', 'Add a bedroom zone or a loft, or plan on a convertible sofa.'));
  }

  const totalSqFt = geos.reduce((sum, geo) => sum + toSqFt(geo.area + (geo.loft?.area ?? 0)), 0);
  if (totalSqFt > 400) {
    issues.push(issue(
      'info',
      'Q101',
      'Over 400 sq ft — Appendix Q no longer applies',
      `At ${Math.round(totalSqFt)} sq ft this is a normal dwelling under the full IRC: no loft allowances, and stairs must meet R311 in full.`,
    ));
  }

  const alarms = geos.length;
  issues.push(issue(
    'info',
    'R314/R315',
    'Alarms required',
    `Plan on ${alarms + 1} interconnected smoke alarms (one per sleeping area, one outside each, one per level) plus a CO alarm if you install any fuel-burning appliance.`,
  ));

  return issues;
}
