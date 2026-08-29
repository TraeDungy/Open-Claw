/**
 * Wiring: start gallery, rails, canvas views, keyboard, exports.
 *
 * Everything that changes the design goes through `store.commit`, so undo,
 * autosave, the live checks and the budget all stay in step for free.
 */

import { store } from './state.mjs';
import { createPlanView } from './plan.mjs';
import { createView3d } from './view3d.mjs';
import {
  costLinesHtml,
  renderBuild,
  renderChecks,
  renderCost,
  renderInspector,
  renderLevelSwitch,
  renderModuleList,
  renderPalettes,
  renderStats,
  esc,
} from './panels.mjs';

import { CONTAINERS, OPENING_TYPES, ZONE_TYPES } from '/lib/containers.mjs';
import { createProject } from '/lib/project.mjs';
import { buildFromTemplate, templateSummaries } from '/lib/templates.mjs';
import { renderPlanSvg } from '/lib/svg.mjs';
import { renderSpecSheet } from '/lib/spec.mjs';
import { formatLength, parseLength, toSqFt, clamp } from '/lib/units.mjs';

const $ = (selector) => document.querySelector(selector);
const app = $('#app');
const startScreen = $('#start');

const planView = createPlanView({
  canvas: $('#plan-canvas'),
  store,
  onHint: (text) => setHint(text),
});
const view3d = createView3d({ canvas: $('#view-canvas'), store });

const DEFAULT_HINT = 'Drag a wall to resize · click a room to change it · drag a window onto any wall';

/* ── boot ──────────────────────────────────────────────── */
function boot() {
  renderPalettes($('#zone-palette'), $('#opening-palette'));
  wireTopbar();
  wireRails();
  wireStage();
  wireKeyboard();
  wireDragAndDrop();

  store.subscribe(render);

  const restored = store.restore();
  if (restored) {
    store.setProject(restored);
    showApp();
  } else {
    store.setProject(buildFromTemplate('one-bed-40'));
    showStart();
  }
  renderStartScreen();
}

let hasOpenedDesign = false;

function showApp() {
  hasOpenedDesign = true;
  startScreen.hidden = true;
  app.hidden = false;
  requestAnimationFrame(() => {
    planView.fit();
    planView.draw();
    view3d.draw();
  });
}

function showStart() {
  app.hidden = true;
  startScreen.hidden = false;
  $('#start-close').hidden = !hasOpenedDesign;
}

/* ── render ────────────────────────────────────────────── */
function render(_, reason) {
  if (!store.analysis) return;
  renderStats(store, $('#stats'));
  renderInspector(store, $('#inspector'));
  renderChecks(store, { body: $('#checks-body'), badge: $('#checks-badge') });
  renderCost(store, { body: $('#cost-body'), badge: $('#cost-badge') });
  renderBuild(store, { body: $('#build-body'), badge: $('#build-badge') });
  renderModuleList(store, $('#module-list'));
  renderLevelSwitch(store, $('#level-switch'));

  $('#undo').disabled = !store.canUndo();
  $('#redo').disabled = !store.canRedo();
  $('#units-toggle').textContent = store.project.units === 'metric' ? 'm' : 'ft';
  const nameInput = $('#project-name');
  if (document.activeElement !== nameInput) nameInput.value = store.project.name;

  planView.draw();
  view3d.draw();
  if (reason === 'load') planView.fit();
}

function setHint(text) {
  $('#hint').textContent = text ?? DEFAULT_HINT;
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 2200);
}

/* ── start gallery ─────────────────────────────────────── */
function renderStartScreen() {
  const grid = $('#template-grid');
  grid.innerHTML = templateSummaries().map((summary) => `
    <button class="card" data-template="${esc(summary.id)}">
      <div class="card__thumb">${renderPlanSvg(summary.project, { showDimensions: false, showTitleBlock: false })}</div>
      <div class="card__body">
        <div class="card__title"><h3>${esc(summary.name)}</h3><span class="card__area">${summary.sqFt} ft²</span></div>
        <p class="card__tagline">${esc(summary.tagline)}</p>
        <div class="chips">${summary.tags.map((tag) => `<span class="chip">${esc(tag)}</span>`).join('')}</div>
      </div>
    </button>`).join('');

  $('#shell-grid').innerHTML = Object.values(CONTAINERS).map((container) => `
    <button class="shell-card" data-shell="${esc(container.id)}">
      <div class="shell-card__bar" style="width:${Math.min(100, (container.exterior.length / 13716) * 100)}%"></div>
      <h3>${esc(container.name)}</h3>
      <div class="dims">${Math.round(container.exterior.length / 304.8)}′ × ${Math.round(container.exterior.width / 304.8)}′ ·
        ${Math.round(toSqFt(container.interior.length * container.interior.width))} ft² inside</div>
      <p>${esc(container.note)}</p>
    </button>`).join('');

  loadSavedList();
}

async function loadSavedList() {
  const list = $('#saved-list');
  try {
    const response = await fetch('/api/projects');
    const { projects } = await response.json();
    list.innerHTML = projects.length
      ? projects.map((project) => `
        <div class="saved-row">
          <strong>${esc(project.name)}</strong>
          <span>${project.moduleCount} box${project.moduleCount === 1 ? '' : 'es'} · ${new Date(project.updatedAt).toLocaleString()}</span>
          <button class="btn" data-open-project="${esc(project.id)}">Open</button>
          <button class="btn btn--danger" data-delete-project="${esc(project.id)}">Delete</button>
        </div>`).join('')
      : '<div class="empty">Nothing saved yet. Designs autosave in this browser; hit Save to keep one on the server.</div>';
  } catch {
    list.innerHTML = '<div class="empty">Could not reach the server. Your work is still saved in this browser.</div>';
  }
}

startScreen.addEventListener('click', async (event) => {
  const templateBtn = event.target.closest('[data-template]');
  if (templateBtn) {
    store.setProject(buildFromTemplate(templateBtn.dataset.template));
    showApp();
    return;
  }

  const shellBtn = event.target.closest('[data-shell]');
  if (shellBtn) {
    store.setProject(createProject({
      name: `${CONTAINERS[shellBtn.dataset.shell].name} home`,
      modules: [{ container: shellBtn.dataset.shell, name: 'Box', zones: [{ type: 'living', length: 4000 }] }],
    }));
    showApp();
    return;
  }

  const openBtn = event.target.closest('[data-open-project]');
  if (openBtn) {
    const response = await fetch(`/api/projects/${openBtn.dataset.openProject}`);
    if (response.ok) {
      const { project } = await response.json();
      store.setProject(project);
      showApp();
    }
    return;
  }

  const deleteBtn = event.target.closest('[data-delete-project]');
  if (deleteBtn) {
    await fetch(`/api/projects/${deleteBtn.dataset.deleteProject}`, { method: 'DELETE' });
    loadSavedList();
    return;
  }

  const tab = event.target.closest('[data-start-tab]');
  if (tab) {
    for (const button of startScreen.querySelectorAll('[data-start-tab]')) button.classList.toggle('is-active', button === tab);
    for (const panel of startScreen.querySelectorAll('[data-start-panel]')) {
      panel.hidden = panel.dataset.startPanel !== tab.dataset.startTab;
    }
    if (tab.dataset.startTab === 'saved') loadSavedList();
  }

  if (event.target.closest('#start-close')) showApp();
});

/* ── topbar ────────────────────────────────────────────── */
function wireTopbar() {
  $('#project-name').addEventListener('change', (event) => {
    store.commit((draft) => { draft.name = event.target.value.trim() || 'Untitled tiny home'; });
  });

  for (const button of document.querySelectorAll('[data-view]')) {
    button.addEventListener('click', () => setView(button.dataset.view));
  }

  $('#undo').addEventListener('click', () => store.undo());
  $('#redo').addEventListener('click', () => store.redo());
  $('#units-toggle').addEventListener('click', toggleUnits);
  $('#open-start').addEventListener('click', () => { $('#start-close').hidden = false; showStart(); });
  $('#save').addEventListener('click', saveToServer);

  const menu = $('#export-menu');
  $('#export-btn').addEventListener('click', (event) => {
    event.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('click', () => { menu.hidden = true; });
  menu.addEventListener('click', (event) => {
    const button = event.target.closest('[data-export]');
    if (button) exportAs(button.dataset.export);
  });

  $('#help-close').addEventListener('click', () => $('#help').close());
}

function setView(view) {
  store.patchUi({ view });
  const stage = $('#stage');
  stage.classList.toggle('is-split', view === 'split');
  $('#pane-plan').hidden = view === '3d';
  $('#pane-3d').hidden = view === 'plan';
  for (const button of document.querySelectorAll('[data-view]')) {
    button.classList.toggle('is-active', button.dataset.view === view);
  }
  requestAnimationFrame(() => {
    planView.draw();
    view3d.draw();
  });
}

function toggleUnits() {
  store.commit((draft) => { draft.units = draft.units === 'metric' ? 'imperial' : 'metric'; });
}

/* ── stage tools ───────────────────────────────────────── */
function wireStage() {
  $('#zoom-fit').addEventListener('click', () => planView.fit());
  $('#zoom-in').addEventListener('click', () => planView.zoomBy(1.25));
  $('#zoom-out').addEventListener('click', () => planView.zoomBy(0.8));

  const furnitureBtn = $('#toggle-furniture');
  furnitureBtn.classList.toggle('is-active', store.ui.showFurniture);
  furnitureBtn.addEventListener('click', () => {
    store.patchUi({ showFurniture: !store.ui.showFurniture });
    furnitureBtn.classList.toggle('is-active', store.ui.showFurniture);
    planView.draw();
    view3d.draw();
  });

  const dimsBtn = $('#toggle-dims');
  dimsBtn.classList.toggle('is-active', store.ui.showDims);
  dimsBtn.addEventListener('click', () => {
    store.patchUi({ showDims: !store.ui.showDims });
    dimsBtn.classList.toggle('is-active', store.ui.showDims);
    planView.draw();
  });

  $('#cutaway').addEventListener('input', (event) => view3d.setCutaway(Number(event.target.value) / 100));
  $('#pitch').addEventListener('input', (event) => view3d.setPitch(Number(event.target.value)));
  $('#spin').addEventListener('click', (event) => {
    event.currentTarget.classList.toggle('is-active', view3d.toggleSpin());
  });

  $('#level-switch').addEventListener('click', (event) => {
    const button = event.target.closest('[data-level]');
    if (!button) return;
    store.patchUi({ level: Number(button.dataset.level) });
    planView.fit();
  });

  setHint(null);
}

/* ── rails ─────────────────────────────────────────────── */
function wireRails() {
  $('#add-module').addEventListener('click', addModule);

  $('#module-list').addEventListener('click', (event) => {
    const row = event.target.closest('[data-module-row]');
    if (!row) return;
    const module = store.project.modules.find((m) => m.id === row.dataset.moduleRow);
    store.patchUi({ activeModuleId: module.id, level: module.level });
    store.select({ kind: 'module', moduleId: module.id, id: module.id });
    planView.fit();
  });

  const rail = document.querySelector('.rail--right');
  rail.addEventListener('click', onRailClick);
  rail.addEventListener('change', onRailChange);
  rail.addEventListener('input', onRailInput);

  for (const head of document.querySelectorAll('[data-accordion]')) {
    head.addEventListener('click', () => {
      const accordion = head.parentElement;
      accordion.dataset.open = accordion.dataset.open === 'true' ? 'false' : 'true';
    });
  }
}

function selectedZone() {
  const selection = store.ui.selection;
  if (selection?.kind !== 'zone') return null;
  const module = store.project.modules.find((m) => m.id === selection.moduleId);
  return { module, zone: module?.zones.find((z) => z.id === selection.id), selection };
}

function onRailClick(event) {
  const action = event.target.closest('[data-action]')?.dataset.action;

  if (!action) {
    const issue = event.target.closest('[data-issue]');
    if (issue?.dataset.module) {
      const module = store.project.modules.find((m) => m.id === issue.dataset.module);
      if (module) store.patchUi({ activeModuleId: module.id, level: module.level });
      if (issue.dataset.zone) store.select({ kind: 'zone', moduleId: issue.dataset.module, id: issue.dataset.zone });
      else if (issue.dataset.opening) store.select({ kind: 'opening', moduleId: issue.dataset.module, id: issue.dataset.opening });
      else store.select({ kind: 'module', moduleId: issue.dataset.module, id: issue.dataset.module });
      planView.fit();
    }
    return;
  }

  switch (action) {
    case 'zone-type': {
      const type = event.target.closest('[data-type]').dataset.type;
      setZoneType(type);
      break;
    }
    case 'zone-divider': {
      const kind = event.target.closest('[data-kind]').dataset.kind;
      const context = selectedZone();
      if (!context?.zone) break;
      store.commit((draft) => {
        const zone = draft.modules.find((m) => m.id === context.module.id).zones.find((z) => z.id === context.zone.id);
        zone.dividerAfter = kind === 'open' ? null : { kind, width: 813, center: null };
      });
      break;
    }
    case 'zone-duplicate': duplicateZone(); break;
    case 'zone-halve': halveZone(); break;
    case 'zone-delete': deleteZone(); break;
    case 'opening-center': centerOpening(); break;
    case 'opening-delete': deleteOpening(); break;
    case 'module-duplicate': duplicateModule(); break;
    case 'module-delete': deleteModule(); break;
    case 'fix-egress': addEgressWindow(event.target.closest('[data-module]')?.dataset.module); break;
    case 'fix-door': addEntryDoor(event.target.closest('[data-module]')?.dataset.module); break;
    case 'fix-shell': upgradeShell(event.target.closest('[data-module]')?.dataset.module); break;
    case 'show-lines': showCostLines(); break;
    default: break;
  }
}

function onRailChange(event) {
  const action = event.target.dataset.action;
  if (!action) return;
  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  const units = store.project.units;
  const context = selectedZone();
  const selection = store.ui.selection;

  switch (action) {
    case 'zone-length': {
      if (!context?.zone) break;
      const mm = parseLength(value, units);
      if (!mm || mm < 300) break;
      resizeZone(context.module.id, context.zone.id, mm);
      break;
    }
    case 'zone-split-toggle':
      if (!context?.zone) break;
      store.commit((draft) => {
        const zone = draft.modules.find((m) => m.id === context.module.id).zones.find((z) => z.id === context.zone.id);
        zone.split = value ? { type: 'bath', ratio: 0.55, side: 'left' } : null;
      });
      break;
    case 'zone-split-type':
    case 'zone-split-side':
      if (!context?.zone?.split) break;
      store.commit((draft) => {
        const zone = draft.modules.find((m) => m.id === context.module.id).zones.find((z) => z.id === context.zone.id);
        if (action === 'zone-split-type') zone.split.type = value;
        else zone.split.side = value;
      });
      break;
    case 'zone-loft':
      if (!context?.zone) break;
      toggleLoft(context.module.id, context.zone.id, value);
      break;
    case 'opening-type':
    case 'opening-wall':
    case 'opening-offset':
    case 'opening-width':
    case 'opening-height':
    case 'opening-sill':
      updateOpening(selection, action, value);
      break;
    case 'module-name':
    case 'module-container':
    case 'module-rotation':
    case 'module-level':
      updateModule(selection, action, value);
      break;
    case 'set-condition': commitField('condition', value); break;
    case 'set-insulation': commitField('insulation', value); break;
    case 'set-floor': commitField('floorBuild', value); break;
    case 'set-finish': commitField('finishTier', value); break;
    case 'set-foundation': commitField('foundation', value); break;
    case 'set-region': commitField('region', value); break;
    case 'set-offgrid':
      store.commit((draft) => { draft.offGrid.enabled = value; });
      break;
    case 'set-solar':
      store.commit((draft) => { draft.offGrid.solarKw = Number(value); });
      break;
    case 'set-battery':
      store.commit((draft) => { draft.offGrid.batteryKwh = Number(value); });
      break;
    case 'set-water':
      store.commit((draft) => { draft.offGrid.waterTankL = Number(value); });
      break;
    default: break;
  }
}

function onRailInput(event) {
  if (event.target.dataset.action !== 'zone-split-ratio') return;
  const context = selectedZone();
  if (!context?.zone?.split) return;
  const ratio = Number(event.target.value) / 100;
  store.commit((draft) => {
    const zone = draft.modules.find((m) => m.id === context.module.id).zones.find((z) => z.id === context.zone.id);
    zone.split.ratio = ratio;
  }, { coalesce: `split:${context.zone.id}` });
}

function commitField(field, value) {
  store.commit((draft) => { draft[field] = value; });
}

/* ── mutations ─────────────────────────────────────────── */
function setZoneType(type) {
  const context = selectedZone();
  if (!context?.zone) return;
  store.commit((draft) => {
    const zone = draft.modules.find((m) => m.id === context.module.id).zones.find((z) => z.id === context.zone.id);
    zone.type = type;
  });
}

/** Resize one zone and take the difference out of its neighbours. */
function resizeZone(moduleId, zoneId, length) {
  store.commit((draft) => {
    const zones = draft.modules.find((m) => m.id === moduleId).zones;
    const index = zones.findIndex((z) => z.id === zoneId);
    if (index < 0 || zones.length < 2) return;
    const delta = length - zones[index].length;
    const neighbour = index === zones.length - 1 ? index - 1 : index + 1;
    const min = ZONE_TYPES[zones[neighbour].type]?.minLength ?? 600;
    const allowed = clamp(delta, -zones[index].length + 300, zones[neighbour].length - min);
    zones[index].length += allowed;
    zones[neighbour].length -= allowed;
  });
}

function duplicateZone() {
  const context = selectedZone();
  if (!context?.zone) return;
  const newId = `zone_${Math.random().toString(36).slice(2, 9)}`;
  store.commit((draft) => {
    const zones = draft.modules.find((m) => m.id === context.module.id).zones;
    const index = zones.findIndex((z) => z.id === context.zone.id);
    const half = Math.max(600, Math.round(zones[index].length / 2));
    zones[index].length -= half;
    zones.splice(index + 1, 0, { ...structuredClone(zones[index]), id: newId, length: half });
  });
  store.select({ kind: 'zone', moduleId: context.module.id, id: newId });
}

function halveZone() {
  const context = selectedZone();
  if (!context?.zone) return;
  const newId = `zone_${Math.random().toString(36).slice(2, 9)}`;
  store.commit((draft) => {
    const zones = draft.modules.find((m) => m.id === context.module.id).zones;
    const index = zones.findIndex((z) => z.id === context.zone.id);
    const half = Math.round(zones[index].length / 2);
    zones[index].length = zones[index].length - half;
    zones.splice(index + 1, 0, {
      id: newId,
      type: 'storage',
      length: half,
      split: null,
      dividerAfter: { kind: 'door', width: 813, center: null },
    });
  });
  store.select({ kind: 'zone', moduleId: context.module.id, id: newId });
}

function deleteZone() {
  const context = selectedZone();
  if (!context?.zone || context.module.zones.length < 2) {
    toast('A box needs at least one room');
    return;
  }
  store.commit((draft) => {
    const module = draft.modules.find((m) => m.id === context.module.id);
    module.zones = module.zones.filter((zone) => zone.id !== context.zone.id);
    if (module.loft) {
      module.loft.overZoneIds = module.loft.overZoneIds.filter((id) => id !== context.zone.id);
    }
  });
  store.select(null);
}

function toggleLoft(moduleId, zoneId, on) {
  store.commit((draft) => {
    const module = draft.modules.find((m) => m.id === moduleId);
    const current = new Set(module.loft?.overZoneIds ?? []);
    if (on) current.add(zoneId);
    else current.delete(zoneId);
    module.loft = current.size
      ? {
          overZoneIds: [...current],
          floorHeight: module.loft?.floorHeight ?? 1600,
          guard: module.loft?.guard ?? true,
          access: module.loft?.access ?? 'ladder',
        }
      : null;
  });
}

function updateOpening(selection, action, value) {
  if (selection?.kind !== 'opening') return;
  const units = store.project.units;
  store.commit((draft) => {
    const opening = draft.modules.find((m) => m.id === selection.moduleId).openings.find((o) => o.id === selection.id);
    if (!opening) return;
    if (action === 'opening-type') {
      const spec = OPENING_TYPES[value];
      Object.assign(opening, { type: spec.id, width: spec.width, height: spec.height, sill: spec.sill });
    } else if (action === 'opening-wall') {
      opening.wall = value;
      opening.offset = 400;
    } else {
      const mm = parseLength(value, units);
      if (mm == null) return;
      const key = action.replace('opening-', '');
      opening[key] = mm;
    }
  });
}

function updateModule(selection, action, value) {
  if (!selection?.moduleId) return;
  store.commit((draft) => {
    const module = draft.modules.find((m) => m.id === selection.moduleId);
    if (!module) return;
    if (action === 'module-name') module.name = value;
    if (action === 'module-container') module.container = value;
    if (action === 'module-rotation') module.rotation = Number(value);
    if (action === 'module-level') module.level = Number(value);
  });
  if (action === 'module-level') {
    const module = store.project.modules.find((m) => m.id === selection.moduleId);
    store.patchUi({ level: module.level });
    planView.fit();
  }
}

function addModule() {
  const last = store.project.modules[store.project.modules.length - 1];
  const container = last?.container ?? '40HC';
  const id = `mod_${Math.random().toString(36).slice(2, 9)}`;
  store.commit((draft) => {
    const previous = draft.modules[draft.modules.length - 1];
    draft.modules.push({
      id,
      name: `Box ${draft.modules.length + 1}`,
      container,
      x: previous ? previous.x : 0,
      y: previous ? previous.y + CONTAINERS[previous.container].exterior.width + 200 : 0,
      level: 0,
      rotation: previous?.rotation ?? 0,
      zones: [
        { type: 'bedroom', length: 3000, split: null, dividerAfter: { kind: 'door', width: 762, center: null } },
        { type: 'storage', length: 2000, split: null, dividerAfter: null },
      ],
      openings: [{ type: 'window-egress', wall: 'right', offset: 600 }],
      loft: null,
    });
  });
  store.patchUi({ activeModuleId: id, level: 0 });
  store.select({ kind: 'module', moduleId: id, id });
  planView.fit();
  toast('Box added — drag its label to position it');
}

function duplicateModule() {
  const selection = store.ui.selection;
  const source = store.project.modules.find((m) => m.id === selection?.moduleId);
  if (!source) return;
  const id = `mod_${Math.random().toString(36).slice(2, 9)}`;
  store.commit((draft) => {
    const original = draft.modules.find((m) => m.id === source.id);
    const copy = structuredClone(original);
    copy.id = id;
    copy.name = `${original.name} copy`;
    copy.y = original.y + CONTAINERS[original.container].exterior.width + 200;
    copy.zones = copy.zones.map((zone) => ({ ...zone, id: `zone_${Math.random().toString(36).slice(2, 9)}` }));
    copy.openings = copy.openings.map((opening) => ({ ...opening, id: `op_${Math.random().toString(36).slice(2, 9)}` }));
    copy.loft = null;
    draft.modules.push(copy);
  });
  store.select({ kind: 'module', moduleId: id, id });
  planView.fit();
}

function deleteModule() {
  const selection = store.ui.selection;
  if (!selection?.moduleId || store.project.modules.length < 2) return;
  store.commit((draft) => {
    draft.modules = draft.modules.filter((module) => module.id !== selection.moduleId);
  });
  store.select(null);
  planView.fit();
}

function centerOpening() {
  const selection = store.ui.selection;
  if (selection?.kind !== 'opening') return;
  const geo = store.moduleGeo(selection.moduleId);
  store.commit((draft) => {
    const opening = draft.modules.find((m) => m.id === selection.moduleId).openings.find((o) => o.id === selection.id);
    const span = opening.wall === 'left' || opening.wall === 'right' ? geo.shell.usableLength : geo.shell.usableWidth;
    opening.offset = Math.round((span - opening.width) / 2);
  });
}

function deleteOpening() {
  const selection = store.ui.selection;
  if (selection?.kind !== 'opening') return;
  store.commit((draft) => {
    const module = draft.modules.find((m) => m.id === selection.moduleId);
    module.openings = module.openings.filter((opening) => opening.id !== selection.id);
  });
  store.select(null);
}

/** One-click fixes offered next to the code issues that have an obvious answer. */
function addEgressWindow(moduleId) {
  const geo = store.moduleGeo(moduleId);
  if (!geo) return;
  const sleeping = geo.zones.find((zone) => ZONE_TYPES[zone.type]?.sleeping);
  const spec = OPENING_TYPES['window-egress'];
  const id = `op_${Math.random().toString(36).slice(2, 9)}`;
  const wallRun = { left: 0, right: 0 };
  for (const opening of geo.openings) {
    if (opening.wall in wallRun) wallRun[opening.wall] += opening.width;
  }
  const wall = wallRun.left <= wallRun.right ? 'left' : 'right';

  store.commit((draft) => {
    const module = draft.modules.find((m) => m.id === moduleId);
    const center = sleeping ? sleeping.x0 + sleeping.length / 2 : geo.shell.usableLength / 2;
    const loft = geo.loft;
    module.openings.push({
      id,
      type: spec.id,
      wall: sleeping ? wall : 'front',
      offset: clamp(center - spec.width / 2, 300, geo.shell.usableLength - spec.width - 300),
      width: spec.width,
      height: loft && !sleeping ? 900 : spec.height,
      sill: loft && !sleeping ? loft.floorHeight + 100 : spec.sill,
    });
  });
  store.select({ kind: 'opening', moduleId, id });
  toast('Egress window added');
}

function addEntryDoor(moduleId) {
  const geo = store.moduleGeo(moduleId);
  if (!geo) return;
  const spec = OPENING_TYPES['door-entry'];
  const id = `op_${Math.random().toString(36).slice(2, 9)}`;
  store.commit((draft) => {
    draft.modules.find((m) => m.id === moduleId).openings.push({
      id,
      type: spec.id,
      wall: 'front',
      offset: Math.round((geo.shell.usableWidth - spec.width) / 2),
      width: spec.width,
      height: spec.height,
      sill: 0,
    });
  });
  store.select({ kind: 'opening', moduleId, id });
  toast('Entry door added to the end wall');
}

function upgradeShell(moduleId) {
  const module = store.project.modules.find((m) => m.id === moduleId);
  if (!module) return;
  const upgrade = { '10DC': '20HC', '20DC': '20HC', '40DC': '40HC', '20HC': '20HC', '40HC': '40HC', '45HC': '45HC' };
  store.commit((draft) => {
    draft.modules.find((m) => m.id === moduleId).container = upgrade[module.container] ?? '40HC';
  });
  toast('Switched to a high-cube shell');
}

function showCostLines() {
  const dialog = document.createElement('dialog');
  dialog.className = 'help';
  dialog.style.maxWidth = '640px';
  dialog.innerHTML = `<h2>Every line item</h2>${costLinesHtml(store)}<br><button class="btn btn--primary">Close</button>`;
  document.body.appendChild(dialog);
  dialog.querySelector('button').addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });
  dialog.showModal();
}

/* ── palette drag & drop ───────────────────────────────── */
function wireDragAndDrop() {
  let dragging = null;
  let ghost = null;

  const startDrag = (event) => {
    const item = event.target.closest('[data-palette]');
    if (!item) return;
    event.preventDefault();
    dragging = { kind: item.dataset.palette, type: item.dataset.type, moved: false };
    planView.setPayload(dragging);

    ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = dragging.kind === 'zone'
      ? ZONE_TYPES[dragging.type].name
      : OPENING_TYPES[dragging.type].name;
    ghost.style.left = `${event.clientX}px`;
    ghost.style.top = `${event.clientY}px`;
    document.body.appendChild(ghost);

    setHint(dragging.kind === 'zone'
      ? 'Drop on a room to carve a new one where you let go'
      : 'Drop on any wall — it snaps to the nearest one');
  };

  window.addEventListener('pointerdown', startDrag);

  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    dragging.moved = true;
    ghost.style.left = `${event.clientX}px`;
    ghost.style.top = `${event.clientY}px`;
    planView.trackPayloadPointer(event.clientX, event.clientY);
  });

  window.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    const dropped = planView.dropPayload(event.clientX, event.clientY, dragging);
    if (!dropped && !dragging.moved && dragging.kind === 'zone' && store.ui.selection?.kind === 'zone') {
      setZoneType(dragging.type);
    } else if (!dropped && dragging.moved) {
      toast('Drop it on the plan');
    }
    ghost?.remove();
    ghost = null;
    dragging = null;
    planView.setPayload(null);
    setHint(null);
  });
}

/* ── keyboard ──────────────────────────────────────────── */
function wireKeyboard() {
  window.addEventListener('keydown', (event) => {
    const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);
    if (typing) return;

    const meta = event.metaKey || event.ctrlKey;
    if (meta && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) store.redo();
      else store.undo();
      return;
    }
    if (meta && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveToServer();
      return;
    }

    const selection = store.ui.selection;
    const key = event.key.toLowerCase();

    if (/^[1-9]$/.test(event.key) && selection?.kind === 'zone') {
      const type = Object.values(ZONE_TYPES)[Number(event.key) - 1];
      if (type) setZoneType(type.id);
      return;
    }

    switch (key) {
      case 'backspace':
      case 'delete':
        event.preventDefault();
        if (selection?.kind === 'zone') deleteZone();
        else if (selection?.kind === 'opening') deleteOpening();
        break;
      case 'd':
        if (selection?.kind === 'zone') duplicateZone();
        break;
      case 'w': {
        const context = selectedZone();
        if (!context?.zone) break;
        store.commit((draft) => {
          const zone = draft.modules.find((m) => m.id === context.module.id).zones.find((z) => z.id === context.zone.id);
          const current = zone.dividerAfter?.kind ?? 'open';
          zone.dividerAfter = current === 'open' ? { kind: 'door', width: 813, center: null }
            : current === 'door' ? { kind: 'wall', width: 813, center: null }
            : null;
        });
        break;
      }
      case 'f': planView.fit(); break;
      case 'u': toggleUnits(); break;
      case '[': setView(store.ui.view === '3d' ? 'split' : 'plan'); break;
      case ']': setView(store.ui.view === 'plan' ? 'split' : '3d'); break;
      case 'enter': {
        const context = selectedZone();
        if (!context?.zone) break;
        const answer = window.prompt('Room length', formatLength(context.zone.length, store.project.units));
        const mm = parseLength(answer ?? '', store.project.units);
        if (mm) resizeZone(context.module.id, context.zone.id, mm);
        break;
      }
      case '?': $('#help').showModal(); break;
      default: break;
    }
  });
}

/* ── save & export ─────────────────────────────────────── */
async function saveToServer() {
  try {
    const response = await fetch(`/api/projects/${store.project.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project: store.project }),
    });
    if (!response.ok) throw new Error('save failed');
    store.ui.dirty = false;
    toast('Saved');
  } catch {
    toast('Could not reach the server — still saved in this browser');
  }
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function slug() {
  return (store.project.name || 'tiny-home').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tiny-home';
}

async function exportAs(kind) {
  const project = store.project;
  if (kind === 'json') {
    download(`${slug()}.json`, JSON.stringify(project, null, 2), 'application/json');
    return;
  }
  if (kind === 'svg') {
    download(`${slug()}-plan.svg`, renderPlanSvg(project, { estimate: store.analysis.estimate }), 'image/svg+xml');
    return;
  }
  if (kind === 'spec') {
    const html = renderSpecSheet(project);
    const tab = window.open('', '_blank');
    if (!tab) {
      download(`${slug()}-spec.html`, html, 'text/html');
      return;
    }
    tab.document.write(html);
    tab.document.close();
    return;
  }
  if (kind === 'png') {
    const svg = renderPlanSvg(project, { estimate: store.analysis.estimate });
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const image = new Image();
    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${slug()}-plan.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    image.onerror = () => toast('Could not rasterise — export SVG instead');
    image.src = url;
  }
}

window.addEventListener('beforeunload', (event) => {
  if (!store.ui.dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

boot();
