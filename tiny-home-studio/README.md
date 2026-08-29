# Tiny Home Studio

A Node.js app for designing shipping-container tiny homes. Pick a template, drag two walls, and you have a plan, a 3D cutaway, a code review and a real budget — in about thirty seconds, with nothing to install and nothing to learn.

```bash
cd tiny-home-studio
npm start          # → http://localhost:4310
npm test           # 28 tests, node:test, no dependencies
```

Zero dependencies. Node 20+. The whole app is `node server.mjs`.

---

## Why this instead of a general CAD tool

General floor-plan software gives you an empty grid and a wall tool. That is the wrong starting point for a container home, because a container is not an empty grid — it is a 7'8" wide steel box whose side walls are structural, and almost every real decision is *where the partitions land along its length*.

So the editor models exactly that:

| | General 2D/3D home design | Tiny Home Studio |
|---|---|---|
| Start | Blank canvas, draw walls | Nine complete, buildable templates |
| Room editing | Draw and join wall segments | Drag one wall handle; both rooms resize, the box stays full |
| Sizes | Whatever you draw | Real ISO shells (10′ → 45′ HC), minus your actual insulation build-up |
| Feedback | None until you export | Area, budget and code review update on every drag |
| Code | Not checked | IRC + Appendix Q checked live, with one-click fixes |
| Structure | Not checked | Warns when you cut past a third of a side wall — the shear panel |
| Cost | Not included | Itemised estimate, bill of materials, weight vs. payload |
| Output | Drawing | Drawing + printable spec sheet with schedules and budget |

The design constraint throughout: **every number on screen is derived from the same shared library the exports use**, so what you see and what you hand a builder can never disagree.

---

## What it does

**Nine templates**, each a complete project — micro pod, studio, loft cabin, one-bed, WFH ADU, duplex, L-shape, two-storey stack, off-grid cabin. All ship code-clean.

**Plan editing that matches how the box works**
- Drag the blue handle on any wall — neighbouring rooms give and take, the shell always stays exactly full.
- Click a room to change what it is (or press `1`–`9`).
- Drag a room from the palette onto the plan to **carve a new room where you let go**.
- Drag a window or door onto any wall; it snaps to the nearest one.
- Double-click a wall to cycle it: open → doorway → solid.
- Split a room across its width for a bath-plus-hallway run.
- Drag a box by its label to move it; it snaps flush to its neighbours. Stack boxes on a second level.

**3D cutaway** — orbit by dragging, fade the near walls with the cutaway slider, furniture and openings included. Written from scratch in ~400 lines of canvas 2D; no WebGL library.

**Live buildability review** (2021 IRC + Appendix Q, plus container-specific rules)
- Ceiling height for habitable rooms and wet rooms, against your real build-up
- Emergency escape openings for every sleeping room *and* sleeping loft, with the loft sill measured from the loft floor
- Loft minimum area, minimum dimension, headroom and guards
- Bathroom clearances, hallway widths, minimum room sizes
- **Side-wall shear**: warns past 33% of a side wall cut away, fails past 50% — the single most common container-build mistake
- Corner-post clearances, wide-opening headers, crane and legal-transport height (a 9'6" box plus a roof cap on a gooseneck breaks 13'6")
- Overlapping boxes on the site plan

Most issues are clickable — they select the offending room or opening, and several offer a one-click fix.

**Budget you can argue with** — every line carries its quantity, unit and rate. Finish tier, region, shell condition, insulation, floor build-up, foundation and off-grid kit all move the number. Includes a bill of materials and a gross-weight check against the container's rated payload.

**Exports** — SVG plan, PNG plan, project JSON, and a printable spec sheet with the plan, room schedule, door/window schedule, full code report, itemised budget and materials list.

---

## How the model works

A project is plain JSON. A module is a container shell holding an ordered list of **zones** along its length; each zone can split across the width, and each carries the wall that follows it. Openings attach to a named wall (`left`, `right`, `front`, `back`) at an offset.

```jsonc
{
  "name": "One Bedroom",
  "insulation": "spray-50",        // eats 64 mm per surface
  "floorBuild": "standard",        // eats 50 mm of headroom
  "modules": [{
    "container": "40HC",
    "zones": [
      { "id": "z1", "type": "living",  "length": 3600 },
      { "id": "z3", "type": "hall",    "length": 2200,
        "split": { "type": "bath", "ratio": 0.62, "side": "left" },
        "dividerAfter": { "kind": "door", "width": 762 } },
      { "id": "z4", "type": "bedroom", "length": 3704 }
    ],
    "openings": [{ "type": "window-egress", "wall": "left", "offset": 8600 }]
  }]
}
```

`normalizeProject` is the only place invariants live, and it is idempotent. It rescales zones to fill the shell exactly (so swapping a 20′ for a 40′ stretches a layout instead of breaking it), clamps openings onto their wall and under the ceiling, and repairs anything hostile in the input.

Everything in `src/lib/` is pure — no DOM, no Node builtins — so the browser imports the identical modules over `/lib/*.mjs`. Analysis runs client-side on every edit: no round trip, no spinner, and the server's SVG export is byte-identical to what you see.

```
src/lib/     units · containers · project · geometry · codecheck · estimate · templates · svg · spec
src/server/  api · store (flat JSON files under data/projects)
public/      index.html · css · js (state · plan · view3d · panels · main)
```

## API

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/catalog` | Containers, insulation, room and opening types, tiers, regions |
| `GET` | `/api/templates` | Template catalogue with headline numbers and full projects |
| `POST` | `/api/templates/:id` | Build a project from a template, analysed |
| `POST` | `/api/analyze` | `{ project }` → normalized project + checks + estimate + stats |
| `GET/POST` | `/api/projects` | List / create |
| `GET/PUT/DELETE` | `/api/projects/:id` | Read / save / delete |
| `POST` | `/api/export/plan.svg` | Vector floor plan |
| `POST` | `/api/export/spec.html` | Printable specification |

`PORT`, `HOST` and `TINY_HOME_DATA_DIR` are the only environment variables.

## Shortcuts

`1`–`9` room type · `Enter` type an exact size · `⌫` delete · `D` duplicate · `W` cycle the wall · `F` fit · `[` `]` views · `U` units · `⌘Z` / `⌘⇧Z` undo/redo · `?` help

---

## Honest limits

- **Design-stage tool, not a permit set.** The code checks follow the 2021 IRC and Appendix Q, but adoption varies by jurisdiction and a plans examiner has the final word.
- **Any cut in a container side wall needs a structural engineer.** The app tells you when you are into engineered-header territory; it does not size the header.
- Costs are 2026 US mid-range rates adjusted for region and finish level. They are an estimate, not a quote.
- Rooms run along the length of the box, optionally split across the width. That covers the overwhelming majority of container layouts, but it is not a free-form CAD tool — you cannot draw an angled wall.
- No DWG/DXF import or export yet. SVG out.
