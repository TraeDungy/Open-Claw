/**
 * Dependency-free 3D. An axonometric projection with painter's-algorithm
 * sorting is all a container home needs: everything is a box, nothing needs
 * perspective, and a 30 KB renderer beats a 600 KB library you have to babysit.
 *
 * Drag to orbit, wheel to zoom, and the cutaway slider fades the walls between
 * you and the interior — the dollhouse view people actually want.
 */

import { ZONE_TYPES, ROOF_CAP_HEIGHT, resolveShell } from '/lib/containers.mjs';

const DEG = Math.PI / 180;

export function createView3d({ canvas, store }) {
  const ctx = canvas.getContext('2d');
  const camera = { yaw: -35 * DEG, pitch: 34 * DEG, panX: 0, panY: 0 };
  let cutaway = 0.55;
  let spinning = false;
  let dpr = window.devicePixelRatio || 1;
  let frame = null;
  let drag = null;
  let spinFrame = null;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    requestDraw();
  }

  /* ── projection ───────────────────────────────────────── */
  /** Axonometric projection at unit scale; the caller applies zoom and origin. */
  function projectUnit(p) {
    const cy = Math.cos(camera.yaw);
    const sy = Math.sin(camera.yaw);
    const depth = p.x * sy + p.y * cy;
    return {
      x: p.x * cy - p.y * sy,
      y: depth * Math.sin(camera.pitch) - p.z * Math.cos(camera.pitch),
      depth,
    };
  }

  function project(p, view) {
    const unit = projectUnit(p);
    return {
      x: view.originX + unit.x * view.zoom,
      y: view.originY + unit.y * view.zoom,
      depth: unit.depth,
    };
  }

  /**
   * Frame the whole model: project the eight corners of its bounding volume and
   * scale so the result fills the pane, whatever the orbit angle.
   */
  function fitView(rect, bounds, maxZ, shift) {
    const corners = [];
    for (const x of [bounds.x, bounds.x2]) {
      for (const y of [bounds.y, bounds.y2]) {
        for (const z of [0, maxZ]) corners.push(projectUnit({ x: x + shift.x, y: y + shift.y, z }));
      }
    }
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const spanX = Math.max(1, Math.max(...xs) - Math.min(...xs));
    const spanY = Math.max(1, Math.max(...ys) - Math.min(...ys));
    const zoom = 0.82 * Math.min(rect.width / spanX, rect.height / spanY);
    return {
      zoom,
      originX: rect.width / 2 - ((Math.min(...xs) + Math.max(...xs)) / 2) * zoom + camera.panX,
      originY: rect.height / 2 - ((Math.min(...ys) + Math.max(...ys)) / 2) * zoom + camera.panY,
    };
  }

  /** World-space direction from the model towards the viewer, on the ground plane. */
  function viewVector() {
    return { x: -Math.sin(camera.yaw), y: -Math.cos(camera.yaw) };
  }

  /* ── scene building ───────────────────────────────────── */
  function moduleBasis(module) {
    const shell = resolveShell(module.container, module.insulation ?? store.project.insulation, store.project.floorBuild);
    const ext = shell.container.exterior;
    const insetX = (ext.length - shell.usableLength) / 2;
    const insetY = (ext.width - shell.usableWidth) / 2;
    const rotation = module.rotation * DEG;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const originX = module.x + (module.rotation === 90 ? ext.width : module.rotation === 180 ? ext.length : 0);
    const originY = module.y + (module.rotation === 180 ? ext.width : module.rotation === 270 ? ext.length : 0);
    const zBase = module.level * (ext.height + 120);

    return {
      shell,
      ext,
      zBase,
      /** module-local mm -> world mm */
      point(lx, ly, lz) {
        const px = lx + insetX;
        const py = ly + insetY;
        return {
          x: originX + px * cos - py * sin,
          y: originY + px * sin + py * cos,
          z: zBase + lz,
        };
      },
    };
  }

  function buildScene() {
    const faces = [];
    const labels = [];
    const view = viewVector();

    for (const module of store.project.modules) {
      const geo = store.moduleGeo(module.id);
      if (!geo) continue;
      const basis = moduleBasis(module);
      const { usableLength: L, usableWidth: W, usableHeight: H } = geo.shell;
      const P = (x, y, z) => basis.point(x, y, z);

      // Floors, coloured by room.
      for (const rect of geo.rects) {
        faces.push({
          points: [
            P(rect.x, rect.y, 0),
            P(rect.x + rect.w, rect.y, 0),
            P(rect.x + rect.w, rect.y + rect.h, 0),
            P(rect.x, rect.y + rect.h, 0),
          ],
          fill: ZONE_TYPES[rect.type]?.color ?? '#e2e8f0',
          stroke: 'rgba(15,23,42,.18)',
          bias: 400,
        });
        if (rect.w > 1200 && rect.h > 900) {
          labels.push({
            at: P(rect.x + rect.w / 2, rect.y + rect.h / 2, 30),
            text: ZONE_TYPES[rect.type]?.name ?? rect.type,
          });
        }
        if (store.ui.showFurniture) faces.push(...furniture(rect, P));
      }

      // Exterior walls. Each carries an outward normal so we can fade the ones
      // between the camera and the interior.
      const walls = [
        { id: 'left', a: [0, 0], b: [L, 0], normal: { x: 0, y: -1 } },
        { id: 'right', a: [L, W], b: [0, W], normal: { x: 0, y: 1 } },
        { id: 'front', a: [0, W], b: [0, 0], normal: { x: -1, y: 0 } },
        { id: 'back', a: [L, 0], b: [L, W], normal: { x: 1, y: 0 } },
      ];

      for (const wall of walls) {
        const worldNormal = rotateVector(wall.normal, module.rotation * DEG);
        const facing = worldNormal.x * view.x + worldNormal.y * view.y;
        const alpha = facing > 0.05 ? cutaway : 1;
        if (alpha < 0.02) continue;

        faces.push({
          points: [
            P(wall.a[0], wall.a[1], 0),
            P(wall.b[0], wall.b[1], 0),
            P(wall.b[0], wall.b[1], H),
            P(wall.a[0], wall.a[1], H),
          ],
          fill: shade('#e2e8f0', facing),
          stroke: 'rgba(15,23,42,.35)',
          alpha,
        });

        for (const opening of geo.openings.filter((o) => o.wall === wall.id)) {
          const span = wall.id === 'left' || wall.id === 'right' ? L : W;
          const t0 = opening.offset / span;
          const t1 = (opening.offset + opening.width) / span;
          const lerp = (t) => [
            wall.a[0] + (wall.b[0] - wall.a[0]) * t,
            wall.a[1] + (wall.b[1] - wall.a[1]) * t,
          ];
          const [ax, ay] = lerp(t0);
          const [bx, by] = lerp(t1);
          const isDoor = opening.type.startsWith('door');
          faces.push({
            points: [
              P(ax, ay, opening.sill),
              P(bx, by, opening.sill),
              P(bx, by, opening.sill + opening.height),
              P(ax, ay, opening.sill + opening.height),
            ],
            fill: isDoor ? '#7c5c3e' : 'rgba(125,211,252,.72)',
            stroke: '#0f172a',
            alpha: alpha < 0.5 ? alpha : Math.max(alpha, isDoor ? 1 : 0.85),
            bias: -60,
          });
        }
      }

      // Interior partitions.
      for (const divider of geo.dividers) {
        if (divider.kind === 'open') continue;
        const segments = divider.opening
          ? [[0, divider.opening.y0], [divider.opening.y1, W]]
          : [[0, W]];
        for (const [y0, y1] of segments) {
          if (y1 - y0 < 40) continue;
          faces.push({
            points: [
              P(divider.x, y0, 0),
              P(divider.x, y1, 0),
              P(divider.x, y1, H),
              P(divider.x, y0, H),
            ],
            fill: '#f8fafc',
            stroke: 'rgba(15,23,42,.4)',
          });
        }
      }
      for (const zone of geo.zones) {
        if (!zone.split) continue;
        const y = zone.split.side === 'left' ? W * zone.split.ratio : W - W * zone.split.ratio;
        faces.push({
          points: [P(zone.x0, y, 0), P(zone.x1, y, 0), P(zone.x1, y, H), P(zone.x0, y, H)],
          fill: '#f8fafc',
          stroke: 'rgba(15,23,42,.4)',
        });
      }

      // Loft deck + guard.
      if (geo.loft) {
        const l = geo.loft;
        faces.push({
          points: [
            P(l.x0, 0, l.floorHeight),
            P(l.x1, 0, l.floorHeight),
            P(l.x1, W, l.floorHeight),
            P(l.x0, W, l.floorHeight),
          ],
          fill: 'rgba(196,181,253,.82)',
          stroke: '#7c3aed',
        });
        if (l.guard) {
          faces.push({
            points: [
              P(l.x1, 0, l.floorHeight),
              P(l.x1, W, l.floorHeight),
              P(l.x1, W, l.floorHeight + 914),
              P(l.x1, 0, l.floorHeight + 914),
            ],
            fill: 'rgba(124,58,237,.22)',
            stroke: '#7c3aed',
          });
        }
      }

      // Roof cap — only when the box is closed up.
      if (cutaway > 0.92) {
        const ridge = H + ROOF_CAP_HEIGHT;
        faces.push({
          points: [P(-120, -120, H), P(L + 120, -120, H), P(L + 120, W / 2, ridge), P(-120, W / 2, ridge)],
          fill: '#475569',
          stroke: '#1e293b',
        });
        faces.push({
          points: [P(-120, W + 120, H), P(L + 120, W + 120, H), P(L + 120, W / 2, ridge), P(-120, W / 2, ridge)],
          fill: '#334155',
          stroke: '#1e293b',
        });
      }
    }

    return { faces, labels };
  }

  function furniture(rect, P) {
    const out = [];
    const box = (x, y, w, d, h, fill) => out.push(...box3d(P, x, y, w, d, h, fill));
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;

    switch (rect.type) {
      case 'bedroom':
      case 'bunk': {
        const w = Math.min(2000, rect.w - 200);
        const d = Math.min(1400, rect.h - 200);
        box(cx - w / 2, cy - d / 2, w, d, 520, '#cbd5e1');
        break;
      }
      case 'living':
        box(rect.x + 120, rect.y + rect.h - 900, Math.min(1900, rect.w - 240), 780, 680, '#a5b4fc');
        break;
      case 'kitchen':
        box(rect.x + 80, rect.y + 80, rect.w - 160, 600, 900, '#fcd34d');
        break;
      case 'bath':
        box(rect.x + 80, rect.y + 80, Math.min(900, rect.w * 0.45), Math.min(900, rect.h - 160), 1900, 'rgba(186,230,253,.55)');
        box(rect.x + rect.w - 560, rect.y + rect.h - 640, 400, 560, 760, '#e2e8f0');
        break;
      case 'wc':
        box(rect.x + 80, rect.y + rect.h - 620, 380, 540, 760, '#e2e8f0');
        break;
      case 'office':
        box(rect.x + 100, rect.y + 100, Math.min(1500, rect.w - 200), 600, 740, '#bbf7d0');
        break;
      case 'dining':
        box(cx - 500, cy - 400, 1000, 800, 740, '#fde68a');
        break;
      case 'storage':
      case 'utility':
        box(rect.x + 80, rect.y + 80, rect.w - 160, Math.min(600, rect.h - 160), 1600, '#cbd5e1');
        break;
      default:
        break;
    }
    return out;
  }

  function box3d(P, x, y, w, d, h, fill) {
    if (w < 100 || d < 100) return [];
    const top = [P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)];
    return [
      { points: [P(x, y, 0), P(x + w, y, 0), P(x + w, y, h), P(x, y, h)], fill: shade(fill, -0.25), stroke: 'rgba(15,23,42,.25)' },
      { points: [P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x, y + d, h)], fill: shade(fill, -0.25), stroke: 'rgba(15,23,42,.25)' },
      { points: [P(x, y, 0), P(x, y + d, 0), P(x, y + d, h), P(x, y, h)], fill: shade(fill, -0.4), stroke: 'rgba(15,23,42,.25)' },
      { points: [P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x + w, y, h)], fill: shade(fill, -0.4), stroke: 'rgba(15,23,42,.25)' },
      { points: top, fill, stroke: 'rgba(15,23,42,.3)' },
    ];
  }

  function rotateVector(vector, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: vector.x * cos - vector.y * sin, y: vector.x * sin + vector.y * cos };
  }

  function shade(color, amount) {
    if (!color.startsWith('#') || color.length !== 7) return color;
    const factor = 1 + amount * 0.5;
    const channels = [1, 3, 5].map((i) => {
      const value = parseInt(color.slice(i, i + 2), 16) * factor;
      return Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, '0');
    });
    return `#${channels.join('')}`;
  }

  /* ── draw ─────────────────────────────────────────────── */
  function requestDraw() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      draw();
    });
  }

  function draw() {
    if (!store.analysis) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const bounds = store.analysis.geometry.bounds;
    const shift = { x: -(bounds.x + bounds.x2) / 2, y: -(bounds.y + bounds.y2) / 2 };
    const maxZ = Math.max(...store.project.modules.map((module) => {
      const ext = resolveShell(module.container, module.insulation ?? store.project.insulation, store.project.floorBuild).container.exterior;
      return module.level * (ext.height + 120) + ext.height + ROOF_CAP_HEIGHT;
    }));
    const view = fitView(rect, bounds, maxZ, shift);

    const { faces, labels } = buildScene();
    const projected = faces.map((face) => {
      const points = face.points.map((p) => project({ x: p.x + shift.x, y: p.y + shift.y, z: p.z }, view));
      const depth = points.reduce((sum, p) => sum + p.depth, 0) / points.length + (face.bias ?? 0);
      return { ...face, projected: points, depth };
    });
    projected.sort((a, b) => b.depth - a.depth);

    // Ground shadow.
    ctx.fillStyle = 'rgba(2,6,23,.35)';
    ctx.beginPath();
    const shadow = [
      { x: bounds.x + shift.x, y: bounds.y + shift.y, z: 0 },
      { x: bounds.x2 + shift.x, y: bounds.y + shift.y, z: 0 },
      { x: bounds.x2 + shift.x, y: bounds.y2 + shift.y, z: 0 },
      { x: bounds.x + shift.x, y: bounds.y2 + shift.y, z: 0 },
    ].map((p) => project(p, view));
    ctx.moveTo(shadow[0].x, shadow[0].y + 6);
    for (const p of shadow.slice(1)) ctx.lineTo(p.x, p.y + 6);
    ctx.closePath();
    ctx.fill();

    for (const face of projected) {
      ctx.globalAlpha = face.alpha ?? 1;
      ctx.beginPath();
      ctx.moveTo(face.projected[0].x, face.projected[0].y);
      for (const p of face.projected.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.fillStyle = face.fill;
      ctx.fill();
      if (face.stroke) {
        ctx.strokeStyle = face.stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const label of labels) {
      const p = project({ x: label.at.x + shift.x, y: label.at.y + shift.y, z: label.at.z }, view);
      ctx.fillStyle = 'rgba(15,23,42,.62)';
      ctx.fillText(label.text, p.x, p.y);
    }

    ctx.restore();
  }

  /* ── interaction ──────────────────────────────────────── */
  canvas.addEventListener('pointerdown', (event) => {
    canvas.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, yaw: camera.yaw, pitch: camera.pitch };
    spinning = false;
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    camera.yaw = drag.yaw + (event.clientX - drag.x) * 0.007;
    camera.pitch = Math.max(6 * DEG, Math.min(86 * DEG, drag.pitch + (event.clientY - drag.y) * 0.005));
    requestDraw();
  });
  const endDrag = (event) => {
    drag = null;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    camera.panY -= event.deltaY * 0.5;
    requestDraw();
  }, { passive: false });

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  function tickSpin() {
    if (!spinning) {
      spinFrame = null;
      return;
    }
    camera.yaw += 0.006;
    draw();
    spinFrame = requestAnimationFrame(tickSpin);
  }

  return {
    draw: requestDraw,
    setCutaway(value) {
      cutaway = value;
      requestDraw();
    },
    setPitch(degrees) {
      camera.pitch = degrees * DEG;
      requestDraw();
    },
    toggleSpin() {
      spinning = !spinning;
      if (spinning && !spinFrame) spinFrame = requestAnimationFrame(tickSpin);
      return spinning;
    },
    destroy() {
      spinning = false;
      observer.disconnect();
    },
  };
}
