import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeProject } from '../src/lib/project.mjs';
import { runCodeChecks, isEgressCompliant, LIMITS } from '../src/lib/codecheck.mjs';
import { estimateProject } from '../src/lib/estimate.mjs';
import { TEMPLATES, buildFromTemplate, templateSummaries } from '../src/lib/templates.mjs';
import { renderPlanSvg } from '../src/lib/svg.mjs';
import { renderSpecSheet } from '../src/lib/spec.mjs';
import { analyze } from '../src/server/api.mjs';

const codes = (result) => result.issues.map((issue) => issue.code);
const titles = (result) => result.issues.map((issue) => issue.title);

test('egress: a bedroom without a qualifying window fails', () => {
  const project = normalizeProject({
    modules: [{
      container: '40HC',
      zones: [
        { id: 'a', type: 'living', length: 4000 },
        { id: 'b', type: 'bath', length: 2000 },
        { id: 'c', type: 'bedroom', length: 5000 },
      ],
      openings: [
        { id: 'd1', type: 'door-entry', wall: 'front', offset: 655 },
        { id: 'w1', type: 'window-awning', wall: 'left', offset: 9000 },
      ],
    }],
  });
  const result = runCodeChecks(project);
  assert.ok(codes(result).includes('R310.2'), 'expected an egress failure');

  const fixed = normalizeProject({
    ...project,
    modules: [{
      ...project.modules[0],
      openings: [
        { id: 'd1', type: 'door-entry', wall: 'front', offset: 655 },
        { id: 'w1', type: 'window-egress', wall: 'left', offset: 9000 },
      ],
    }],
  });
  assert.equal(codes(runCodeChecks(fixed)).includes('R310.2'), false, 'an egress window clears it');
});

test('egress: the numeric rule matches IRC R310.2.1', () => {
  assert.equal(isEgressCompliant({ type: 'window-egress', width: 1220, height: 1220, sill: 760 }), true);
  assert.equal(isEgressCompliant({ type: 'window-awning', width: 610, height: 610, sill: 1450 }), false, 'too small and too high');
  assert.equal(
    isEgressCompliant({ type: 'window-egress', width: 1220, height: 1220, sill: LIMITS.egressMaxSill + 10 }),
    false,
    'sill above 44" disqualifies it',
  );
  assert.equal(isEgressCompliant({ type: 'door-slider', width: 1800, height: 2032, sill: 0 }), true);
});

test('ceilings: stud walls plus a raised service floor eat a standard box\'s headroom', () => {
  const tight = normalizeProject({
    insulation: 'wool-89',
    floorBuild: 'service',
    modules: [{ container: '20DC', zones: [{ id: 'a', type: 'bedroom', length: 5000 }] }],
  });
  assert.ok(codes(runCodeChecks(tight)).includes('Q104.1'), 'expected the ceiling-height rule to bite');

  const highCube = normalizeProject({ ...tight, modules: [{ ...tight.modules[0], container: '20HC' }] });
  assert.equal(
    codes(runCodeChecks(highCube)).includes('Q104.1'),
    false,
    'a high cube buys back the headroom',
  );

  const thinFloor = normalizeProject({ ...tight, floorBuild: 'minimal' });
  assert.equal(codes(runCodeChecks(thinFloor)).includes('Q104.1'), false, 'so does dropping the service floor');
});

test('structure: cutting past half the side wall fails the shear check', () => {
  const project = normalizeProject({
    modules: [{
      container: '20HC',
      zones: [{ id: 'a', type: 'living', length: 5000 }],
      openings: [
        { id: 'o1', type: 'door-slider', wall: 'left', offset: 400, width: 1800 },
        { id: 'o2', type: 'window-picture', wall: 'left', offset: 2400, width: 1830 },
      ],
    }],
  });
  const result = runCodeChecks(project);
  assert.ok(titles(result).some((title) => title.includes('cut past 50%')), 'expected the shear-panel failure');
});

test('structure: an opening jammed against a corner post warns', () => {
  const project = normalizeProject({
    modules: [{
      container: '40HC',
      zones: [{ id: 'a', type: 'living', length: 11000 }],
      openings: [{ id: 'o1', type: 'window-standard', wall: 'left', offset: 120 }],
    }],
  });
  assert.ok(titles(runCodeChecks(project)).some((title) => title.includes('corner post')));
});

test('lofts: undersized lofts fail and compliant ones do not', () => {
  const tiny = normalizeProject({
    modules: [{
      container: '20HC',
      zones: [{ id: 'a', type: 'living', length: 1200 }, { id: 'b', type: 'kitchen', length: 4000 }],
      loft: { overZoneIds: ['a'], floorHeight: 1600, guard: true, access: 'ladder' },
    }],
  });
  assert.ok(codes(runCodeChecks(tiny)).includes('Q105.1'), 'a 1.2 m loft is under 35 sq ft');

  const good = normalizeProject({
    modules: [{
      container: '20HC',
      zones: [{ id: 'a', type: 'living', length: 2600 }, { id: 'b', type: 'kitchen', length: 2600 }],
      loft: { overZoneIds: ['a'], floorHeight: 1600, guard: true, access: 'ladder' },
      openings: [{ id: 'o1', type: 'window-egress', wall: 'front', offset: 500, sill: 1700 }],
    }],
  });
  const goodIssues = runCodeChecks(good).issues.filter((issue) => issue.code.startsWith('Q105'));
  assert.deepEqual(goodIssues.map((issue) => issue.code), [], 'a compliant loft raises no Q105 issues');
});

test('transport: a high cube on a gooseneck trailer is over legal height', () => {
  const highCube = normalizeProject({
    foundation: 'trailer',
    modules: [{ container: '40HC', zones: [{ id: 'a', type: 'living', length: 11000 }] }],
  });
  assert.ok(codes(runCodeChecks(highCube)).includes('transport'), '9\'6" box + roof cap + deck breaks 13\'6"');

  const standard = normalizeProject({ ...highCube, modules: [{ ...highCube.modules[0], container: '40DC' }] });
  assert.equal(codes(runCodeChecks(standard)).includes('transport'), false, 'a standard-height box stays legal');

  const onPiers = normalizeProject({ ...highCube, foundation: 'piers' });
  assert.equal(codes(runCodeChecks(onPiers)).includes('transport'), false, 'height only matters on a trailer');
});

test('site: two boxes on the same ground overlap', () => {
  const project = normalizeProject({
    modules: [
      { id: 'm1', container: '20HC', x: 0, y: 0, zones: [{ id: 'a', type: 'living', length: 5000 }] },
      { id: 'm2', container: '20HC', x: 1000, y: 0, zones: [{ id: 'b', type: 'living', length: 5000 }] },
    ],
  });
  assert.ok(codes(runCodeChecks(project)).includes('site'));
});

test('estimate: line items reconcile to the total', () => {
  const project = buildFromTemplate('one-bed-40');
  const estimate = estimateProject(project);
  const sum = estimate.lines.reduce((acc, line) => acc + line.total, 0);
  assert.ok(Math.abs(sum - estimate.subtotal) < 1, 'lines must add up to the subtotal');
  assert.ok(Math.abs(estimate.subtotal * (1 + estimate.contingencyRate) - estimate.total) < 1);
  assert.ok(estimate.perSqFt > 50 && estimate.perSqFt < 1500, `sanity: got ${estimate.perSqFt}/sq ft`);
  assert.ok(estimate.lines.every((line) => line.qty >= 0 && line.total >= 0));
});

test('estimate: finish tier and region move the number in the right direction', () => {
  const base = buildFromTemplate('one-bed-40');
  const budget = estimateProject({ ...base, finishTier: 'budget' }).total;
  const standard = estimateProject({ ...base, finishTier: 'standard' }).total;
  const premium = estimateProject({ ...base, finishTier: 'premium' }).total;
  assert.ok(budget < standard && standard < premium);

  const south = estimateProject({ ...base, region: 'us-south' }).total;
  const west = estimateProject({ ...base, region: 'us-west' }).total;
  assert.ok(south < west);
});

test('estimate: weight stays inside the container payload', () => {
  const estimate = estimateProject(buildFromTemplate('one-bed-40'));
  assert.ok(estimate.weight.buildKg < estimate.weight.payloadKg, 'a fit-out cannot exceed the rated payload');
  assert.ok(estimate.weight.grossKg > estimate.weight.tareKg);
});

test('templates: every template builds, fills its shell and prices out', () => {
  for (const template of TEMPLATES) {
    const project = buildFromTemplate(template.id);
    assert.ok(project.modules.length >= 1, `${template.id} has modules`);

    const estimate = estimateProject(project);
    assert.ok(estimate.total > 10000, `${template.id} should cost something real`);

    const checks = runCodeChecks(project);
    const fails = checks.issues.filter((issue) => issue.severity === 'fail');
    assert.deepEqual(
      fails.map((issue) => `${template.id}: ${issue.code} ${issue.title}`),
      [],
      `${template.id} must ship without code failures`,
    );
  }
});

test('templates: the picker summary reports believable headline numbers', () => {
  const summaries = templateSummaries();
  assert.equal(summaries.length, TEMPLATES.length);
  for (const summary of summaries) {
    assert.ok(summary.sqFt > 50 && summary.sqFt < 1600, `${summary.id} is ${summary.sqFt} sq ft`);
    assert.ok(summary.shells.length === summary.moduleCount);
  }
});

test('export: SVG and spec sheet render for every template', () => {
  for (const template of TEMPLATES) {
    const project = buildFromTemplate(template.id);
    const svg = renderPlanSvg(project, { estimate: estimateProject(project) });
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.ok(svg.includes('</svg>'));
    assert.equal(svg.includes('NaN'), false, `${template.id} SVG must not contain NaN coordinates`);

    const spec = renderSpecSheet(project);
    assert.ok(spec.startsWith('<!doctype html>'));
    assert.ok(spec.includes(project.name));
  }
});

test('export: a project name with markup cannot escape into the document', () => {
  const project = buildFromTemplate('studio-20', { name: '<script>alert(1)</script>' });
  const spec = renderSpecSheet(project);
  assert.equal(spec.includes('<script>alert(1)</script>'), false);
  assert.ok(spec.includes('&lt;script&gt;'));
});

test('analyze: returns a normalized project plus checks, estimate and stats', () => {
  const result = analyze(buildFromTemplate('duplex-2x20'));
  assert.equal(result.project.modules.length, 2);
  assert.ok(result.stats.totalLivingArea > 0);
  assert.ok(Array.isArray(result.checks.issues));
  assert.ok(result.estimate.total > 0);
  assert.equal(typeof result.checks.ready, 'boolean');
});

test('analyze: survives hostile input without throwing', () => {
  const junk = analyze({
    name: 42,
    units: 'furlongs',
    condition: '../../etc/passwd',
    modules: [{ container: 'not-a-box', zones: 'nope', openings: [{ wall: 'up' }] }],
  });
  assert.equal(junk.project.units, 'imperial');
  assert.equal(junk.project.modules.length, 1);
  assert.ok(junk.project.modules[0].zones.length >= 1);
});
