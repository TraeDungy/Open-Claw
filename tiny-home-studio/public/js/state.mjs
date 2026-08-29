/**
 * App state: one project object, one analysis derived from it, and a simple
 * subscribe/commit loop.
 *
 * Analysis runs in the browser against the same modules the server uses
 * (`/lib/*.mjs`), so dragging a wall updates the area, the code checks and the
 * budget on the next frame — no round trip, no spinner.
 */

import { createProject, normalizeProject } from '/lib/project.mjs';
import { projectGeometry } from '/lib/geometry.mjs';
import { runCodeChecks } from '/lib/codecheck.mjs';
import { estimateProject } from '/lib/estimate.mjs';

const STORAGE_KEY = 'tinyhome.studio.project';
const HISTORY_LIMIT = 60;

function analyse(project) {
  return {
    geometry: projectGeometry(project),
    checks: runCodeChecks(project),
    estimate: estimateProject(project),
  };
}

export const store = {
  project: createProject(),
  analysis: null,
  ui: {
    view: 'plan',
    level: 0,
    activeModuleId: null,
    selection: null, // { kind: 'zone'|'opening'|'module'|'loft', moduleId, id }
    showFurniture: true,
    showDims: true,
    dirty: false,
  },

  _listeners: new Set(),
  _undo: [],
  _redo: [],
  _coalesceKey: null,

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  },

  emit(reason = 'update') {
    for (const listener of this._listeners) listener(this, reason);
  },

  /** Recompute everything derived from the project. */
  refresh(reason = 'update') {
    this.analysis = analyse(this.project);
    if (!this.project.modules.some((module) => module.id === this.ui.activeModuleId)) {
      this.ui.activeModuleId = this.project.modules[0]?.id ?? null;
    }
    const levels = new Set(this.project.modules.map((module) => module.level));
    if (!levels.has(this.ui.level)) this.ui.level = Math.min(...levels);
    this.emit(reason);
  },

  /**
   * Mutate the project through a producer. Snapshots go on the undo stack;
   * passing the same `coalesce` key in consecutive commits (a drag) keeps them
   * as a single undo step.
   */
  commit(mutator, { coalesce = null, reason = 'update' } = {}) {
    const before = JSON.stringify(this.project);
    const draft = JSON.parse(before);
    const result = mutator(draft);
    const next = normalizeProject(result ?? draft);

    if (JSON.stringify(stripVolatile(next)) === JSON.stringify(stripVolatile(JSON.parse(before)))) return;

    if (!coalesce || coalesce !== this._coalesceKey) {
      this._undo.push(before);
      if (this._undo.length > HISTORY_LIMIT) this._undo.shift();
      this._redo.length = 0;
    }
    this._coalesceKey = coalesce;

    this.project = next;
    this.ui.dirty = true;
    this.persist();
    this.refresh(reason);
  },

  endCoalesce() {
    this._coalesceKey = null;
  },

  setProject(project, { resetHistory = true, select = true } = {}) {
    this.project = normalizeProject(project);
    if (resetHistory) {
      this._undo.length = 0;
      this._redo.length = 0;
    }
    this._coalesceKey = null;
    if (select) {
      this.ui.selection = null;
      this.ui.activeModuleId = this.project.modules[0]?.id ?? null;
      this.ui.level = Math.min(...this.project.modules.map((module) => module.level));
    }
    this.persist();
    this.refresh('load');
  },

  patchUi(patch, reason = 'ui') {
    Object.assign(this.ui, patch);
    this.emit(reason);
  },

  select(selection) {
    this.ui.selection = selection;
    if (selection?.moduleId) this.ui.activeModuleId = selection.moduleId;
    this.emit('select');
  },

  canUndo() { return this._undo.length > 0; },
  canRedo() { return this._redo.length > 0; },

  undo() {
    const previous = this._undo.pop();
    if (!previous) return;
    this._redo.push(JSON.stringify(this.project));
    this.project = normalizeProject(JSON.parse(previous));
    this._coalesceKey = null;
    this.persist();
    this.refresh('undo');
  },

  redo() {
    const next = this._redo.pop();
    if (!next) return;
    this._undo.push(JSON.stringify(this.project));
    this.project = normalizeProject(JSON.parse(next));
    this._coalesceKey = null;
    this.persist();
    this.refresh('redo');
  },

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.project));
    } catch {
      // Private mode or a full quota: the design still lives in memory.
    }
  },

  restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalizeProject(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  /** Convenience accessors used all over the UI. */
  activeModule() {
    return this.project.modules.find((module) => module.id === this.ui.activeModuleId) ?? this.project.modules[0];
  },

  moduleGeo(moduleId) {
    return this.analysis?.geometry.modules.find((geo) => geo.module.id === moduleId) ?? null;
  },
};

/** Ignore fields that change on every normalize when diffing for no-ops. */
function stripVolatile(project) {
  const { updatedAt, ...rest } = project;
  return rest;
}
