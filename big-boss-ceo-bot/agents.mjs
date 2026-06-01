/**
 * Canonical Agent Registry — single source of truth for all agent UUIDs.
 * Every module that needs agent IDs imports from here. No inline maps elsewhere.
 */

// Display Name → UUID
export const AGENTS = {
  // Command layer
  'Big Boss CEO':            '010acbc6-304f-4e92-a308-e005d5ea892e',
  'Founding Engineer':       '5938656f-445f-4f41-8351-b745d72cbc04',
  'VPS Founding Engineer':   'a1aebd73-da0b-432e-91b6-a1c548825bbf',
  'VPS Ops':                 'adbe4d36-daee-4cff-b188-7d325cc0ca7c',

  // Project managers
  'Empire PM':               'b2a39cff-567d-48c8-a799-983930a28591',
  'Media PM':                '0aa84859-2cad-45c7-99fa-d4aa4bdbdcbc',
  'SaaS PM':                 '4e54548f-2ee2-4d0c-8b34-991d059d30bf',
  'Games PM':                'f5014598-2378-4e27-a897-14c38c7a99e9',
  'Revenue Ops':             '505ac295-5be4-44d6-b0f1-c751c8980251',
  'Velocity PM':             '2d7c772f-2463-4b71-b04c-3253a0ac6c04',
  'Laced Tribe Brand Manager': '2528e917-70b8-49dd-bd60-60b0c8352d77',

  // Builders
  'Goldie':                  'b1719ba8-10e9-4a40-babb-6b956bd74fed',
  'Integration Specialist':  'f0cc5daf-6d1f-4146-8b10-7be414024cb8',
  'Catalog Intelligence':    'aaccba6c-d649-4d63-bd29-d73a56bcd640',
  'NVIDIA Worker':           '49d5f91f-da34-4014-b824-9521920af7de',
  'SaaS Builder':            'd0383a78-c9e6-409e-88af-da0f6c924e34',
  'Game Dev':                'c6fdbc2f-da6d-49c2-8188-56089d7b059c',
  'Poly Strategy':           '8108e142-42a3-4ae0-9fe0-8e081955d4ff',

  // Special / device agents
  'Nano Claw':               '8d0c0062-33e8-4f03-bdcc-d9014f778fdc',
  'Film Plug Operator':      '5c095393-946a-4a15-8294-3f7de1483a1f',
  'Macks iMac Operator':     '84c0f6e7-eede-4496-9639-71872123f2d6',
  'Selene Vale':             '8767955d-87f9-4fa6-a7e5-5a3c24cf6b1c',

  // Creative agency
  'Axiom':                   'fe6752f9-3654-481d-85bc-36783ed0db52',
  'Morrow':                  'e0367d9d-4f16-4a18-b9ac-6b4207b97f0a',
};

export const CEO_AGENT_ID = AGENTS['Big Boss CEO'];

// UUID → Display Name (reverse lookup)
export const AGENT_NAMES = Object.fromEntries(
  Object.entries(AGENTS).map(([name, id]) => [id, name])
);

// Resolve either a UUID or a display name to a UUID
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveAgentId(agentIdOrName) {
  if (!agentIdOrName) return undefined;
  if (UUID_RE.test(agentIdOrName)) return agentIdOrName;
  // Try exact match first (case-insensitive)
  const lower = agentIdOrName.toLowerCase();
  for (const [name, id] of Object.entries(AGENTS)) {
    if (name.toLowerCase() === lower) return id;
  }
  // Partial match fallback
  for (const [name, id] of Object.entries(AGENTS)) {
    if (name.toLowerCase().includes(lower)) return id;
  }
  return agentIdOrName; // pass through if no match
}
