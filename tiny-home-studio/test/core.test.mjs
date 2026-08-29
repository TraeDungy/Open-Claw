import test from 'node:test';
import assert from 'node:assert/strict';

import { CONTAINERS, resolveShell } from '../src/lib/containers.mjs';
import { createProject, fitZonesToShell, normalizeProject } from '../src/lib/project.mjs';
import { moduleGeometry, projectGeometry, modulesOverlap, openingRunByWall } from '../src/lib/geometry.mjs';
import { formatFeetInches, parseLength, toSqFt, inches } from '../src/lib/units.mjs';

test('units: parses the ways people actually type lengths', () => {
  assert.equal(Math.round(parseLength(`8'6"`)), 2591);
  assert.equal(Math.round(parseLength('8 ft 6 in')), 2591);
  assert.equal(parseLength('2438mm'), 2438);
  assert.equal(parseLength('2.4m'), 2400);
  assert.equal(Math.round(parseLength('96"')), 2438);
  assert.equal(parseLength('96', 'metric'), 96);
  assert.equal(parseLength('not a length'), null);
});

test('units: feet-and-inches formatting rounds to the half inch', () => {
  assert.equal(formatFeetInches(2438), `8' 0"`);
  assert.equal(formatFeetInches(inches(30.5)), `2' 6½"`);
});

test('containers: insulation eats the box from the inside', () => {
  const bare = resolveShell('40HC', 'exterior-50');
  const sprayed = resolveShell('40HC', 'spray-50');
  const wool = resolveShell('40HC', 'wool-89');

  assert.equal(bare.usableWidth, CONTAINERS['40HC'].interior.width);
  assert.ok(sprayed.usableWidth < bare.usableWidth);
  assert.ok(wool.usableWidth < sprayed.usableWidth, 'studs cost more width than spray foam');
  assert.ok(sprayed.usableHeight > 2032, 'a high cube still clears 6\'8" after build-up');
});

test('project: zones always sum to the usable length', () => {
  for (const containerId of Object.keys(CONTAINERS)) {
    const project = normalizeProject({
      modules: [{
        container: containerId,
        zones: [
          { id: 'a', type: 'living', length: 3000 },
          { id: 'b', type: 'kitchen', length: 1500 },
          { id: 'c', type: 'bath', length: 1200 },
        ],
      }],
    });
    const shell = resolveShell(containerId, project.insulation);
    const total = project.modules[0].zones.reduce((sum, zone) => sum + zone.length, 0);
    assert.equal(total, shell.usableLength, `${containerId} zones must fill the shell exactly`);
  }
});

test('project: normalize is idempotent', () => {
  const once = normalizeProject(createProject());
  const twice = normalizeProject(structuredClone(once));
  assert.deepEqual(
    { ...once, updatedAt: null },
    { ...twice, updatedAt: null },
  );
});

test('project: proportions survive a shell swap', () => {
  const zones = [
    { id: 'a', type: 'living', length: 3000 },
    { id: 'b', type: 'kitchen', length: 1000 },
  ];
  const shell = resolveShell('40HC', 'spray-50');
  const fitted = fitZonesToShell(zones, shell.usableLength);
  const ratio = fitted[0].length / fitted[1].length;
  assert.ok(Math.abs(ratio - 3) < 0.02, `expected the 3:1 ratio to hold, got ${ratio}`);
});

test('project: openings are clamped inside their wall and under the ceiling', () => {
  const project = normalizeProject({
    modules: [{
      container: '20HC',
      zones: [{ id: 'a', type: 'living', length: 5000 }],
      openings: [
        { id: 'o1', type: 'window-picture', wall: 'front', offset: 9000 },
        { id: 'o2', type: 'window-egress', wall: 'left', offset: 200, sill: 2400 },
      ],
    }],
  });
  const shell = resolveShell('20HC', project.insulation);
  const [wide, high] = project.modules[0].openings;
  assert.ok(wide.offset + wide.width <= shell.usableWidth, 'front-wall opening stays on the wall');
  assert.ok(high.sill + high.height <= shell.usableHeight, 'opening cannot poke through the roof');
});

test('geometry: zone rectangles tile the floor with no gaps or overlaps', () => {
  const project = normalizeProject({
    modules: [{
      container: '40HC',
      zones: [
        { id: 'a', type: 'living', length: 4000 },
        { id: 'b', type: 'hall', length: 2000, split: { type: 'bath', ratio: 0.6, side: 'left' } },
        { id: 'c', type: 'bedroom', length: 3000 },
      ],
    }],
  });
  const geo = moduleGeometry(project.modules[0], project);
  const covered = geo.rects.reduce((sum, rect) => sum + rect.area, 0);
  assert.equal(covered, geo.area);

  for (let i = 0; i < geo.rects.length; i += 1) {
    for (let j = i + 1; j < geo.rects.length; j += 1) {
      const a = geo.rects[i];
      const b = geo.rects[j];
      const overlaps = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      assert.equal(overlaps, false, 'zone rectangles must not overlap');
    }
  }
});

test('geometry: openings resolve to the right wall and report their run', () => {
  const project = normalizeProject({
    modules: [{
      container: '40HC',
      zones: [{ id: 'a', type: 'living', length: 6000 }, { id: 'b', type: 'bedroom', length: 5000 }],
      openings: [
        { id: 'o1', type: 'window-egress', wall: 'left', offset: 8000 },
        { id: 'o2', type: 'door-entry', wall: 'front', offset: 600 },
      ],
    }],
  });
  const geo = moduleGeometry(project.modules[0], project);
  const egress = geo.openings.find((o) => o.id === 'o1');
  assert.equal(egress.start.y, 0, 'left wall sits at y = 0');
  assert.ok(egress.zoneIds.includes('b'), 'the window at 8 m serves the bedroom');

  const runs = openingRunByWall(geo);
  assert.equal(runs.left, egress.width);
  assert.equal(runs.right, 0);
});

test('geometry: stacking is not an overlap, sharing ground is', () => {
  const project = normalizeProject({
    modules: [
      { id: 'm1', container: '40HC', level: 0, x: 0, y: 0 },
      { id: 'm2', container: '40HC', level: 1, x: 0, y: 0 },
      { id: 'm3', container: '20HC', level: 0, x: 0, y: 0 },
    ],
  });
  const [ground, upper, clash] = project.modules;
  assert.equal(modulesOverlap(ground, upper), false);
  assert.equal(modulesOverlap(ground, clash), true);
});

test('geometry: project totals count the loft as living area', () => {
  const project = normalizeProject({
    modules: [{
      container: '20HC',
      zones: [{ id: 'a', type: 'living', length: 3000 }, { id: 'b', type: 'kitchen', length: 2000 }],
      loft: { overZoneIds: ['a'], floorHeight: 1600, guard: true, access: 'ladder' },
    }],
  });
  const geo = projectGeometry(project);
  assert.ok(geo.loftArea > 0);
  assert.equal(geo.totalLivingArea, geo.interiorArea + geo.loftArea);
  assert.ok(toSqFt(geo.totalLivingArea) > toSqFt(geo.interiorArea));
});
