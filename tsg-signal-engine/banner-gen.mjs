/**
 * TSG Banner Generator — GPT Image API
 * Generates a unique 70s-80s pulp sci-fi banner per newsletter issue.
 *
 * Style: hero-woman aesthetic — painterly, golden amber, sacred geometry,
 * textured grain, aged edges, third eye radiance. Looks like a paperback
 * sci-fi novel cover from 1978 that was never published.
 */
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANNER_DIR = join(__dirname, "banners");

// Locked style prompt — every banner inherits this DNA
const STYLE_BASE = `70s-80s pulp science fiction paperback cover art. Photorealistic but painterly, like a lost Syd Mead or John Harris painting recovered from a warehouse. Color palette strictly: void black (#050505), warm amber-gold, ember orange, bone cream, with rare flashes of phosphor green. Film grain texture. Slightly aged and distressed edges like a vintage print. Volumetric golden light radiating from a central source point. Sacred geometry undertones — concentric rings, cymatic wave patterns, radial symmetry. The aesthetic sits where the oscilloscope meets the mandala. Shot on medium format film. No text. No typography. Cinematic. Widescreen 3:1 banner format.`;

// Content-specific prompt modifiers per content type
const CONTENT_PROMPTS = {
  declassified: "A dimly lit 1970s government research laboratory desk. Manila folders stamped CLASSIFIED in faded red. A reel-to-reel tape recorder mid-spin under a warm amber desk lamp. Scattered documents with redacted black bars. A glass of water with an impossible subtle ripple. The aesthetic of recovered Cold War paranormal research footage.",

  frequency: "A perfectly circular matte black Chladni plate on a vibration apparatus in a dark laboratory. Fine golden sand collected along the nodal lines of a complex standing wave pattern, forming an intricate symmetric mandala. Macro detail — individual sand grains glow like gold dust. A single warm amber lamp illuminates the scene. Scientific beauty as sacred ritual.",

  individual: "A powerful figure in dramatic Rembrandt lighting, amber-gold light emanating from the forehead region — the third eye. Concentric cymatic rings of golden light radiate outward. The background is absolute void black. The expression is concentrated power, not strain — serene command. Equal parts sacred ritual and declassified government research photograph.",

  institute: "An aerial view of a research campus at twilight, brutalist architecture, satellite dishes pointed at the sky, amber light spilling from windows. The building sits at the intersection of a ley line pattern visible only from above — golden geometric lines extending to the horizon. A single signal pulse radiates from the central tower.",

  study: "A laboratory filled with analog instrumentation — oscilloscopes with amber waveforms, a random number generator with glowing vacuum tubes, EEG leads trailing from a subject seated in the distance. Charts and graphs pinned to cork boards show statistical distributions with anomalous peaks circled in red. Clinical precision rendered as painting.",

  disclosure: "A vast underground archive — rows of filing cabinets extending into darkness, illuminated by strips of amber emergency lighting. One drawer is open, golden light pouring out as if the documents inside are radioactive. A single figure in silhouette stands at the end of the row. The floor reflects the amber light like polished obsidian.",

  "deep-dive": "Concentric golden rings expanding outward from a central point of brilliant amber light, like sonar pulses traveling through deep space. Cymatic wave interference patterns create flower-of-life geometry in the rings. Micro particles of golden dust drift through the scene. The background is infinite void. A single frequency made visible.",

  profile: "Close-up portrait in dramatic chiaroscuro — face half-lit by amber light, half in void shadow. The subject's eyes are intense, knowing. Behind them, faint geometric patterns pulse at low opacity — coordinates, frequency readings, classification stamps barely visible. The aesthetic of a dossier photograph that was never meant to be seen.",

  default: "A vast cosmic expanse with a single luminous amber signal at center — concentric golden rings radiating outward through deep space nebula. Sacred geometry patterns emerge in the interference of the rings. The void is not empty but charged with potential. A transmission from somewhere that doesn't appear on any map.",
};

/**
 * Generate a banner image for a newsletter issue
 * @param {string} contentType - declassified|frequency|individual|institute|study|disclosure|deep-dive|profile
 * @param {string} title - Article title (used for unique details)
 * @param {string} issueNum - Issue number for filename
 * @returns {string|null} Path to generated banner, or null on failure
 */
export async function generateBanner(contentType, title, issueNum) {
  if (!existsSync(BANNER_DIR)) mkdirSync(BANNER_DIR, { recursive: true });

  const filename = `banner-${issueNum || Date.now()}.png`;
  const filepath = join(BANNER_DIR, filename);

  // Skip if already generated for this issue
  if (existsSync(filepath)) {
    console.log(`Banner already exists: ${filename}`);
    return filepath;
  }

  const contentPrompt = CONTENT_PROMPTS[contentType] || CONTENT_PROMPTS.default;
  const fullPrompt = `${STYLE_BASE}\n\nSubject: ${contentPrompt}\n\nInspired by the article: "${title}". Widescreen banner format, 1536x512 pixels.`;

  // Try OpenRouter GPT Image first (cheapest), fall back to direct OpenAI
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  const apiUrl = process.env.OPENROUTER_API_KEY
    ? "https://openrouter.ai/api/v1/images/generations"
    : "https://api.openai.com/v1/images/generations";

  if (!apiKey) {
    console.warn("No OPENAI_API_KEY or OPENROUTER_API_KEY — skipping banner generation");
    return null;
  }

  try {
    console.log(`Generating banner for issue ${issueNum}: ${contentType} — "${title}"`);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: fullPrompt,
        n: 1,
        size: "1536x1024",
        quality: "high",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Banner gen failed (${res.status}):`, err);
      return null;
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    const url = data.data?.[0]?.url;

    if (b64) {
      writeFileSync(filepath, Buffer.from(b64, "base64"));
      console.log(`Banner saved: ${filename} (base64)`);
      return filepath;
    } else if (url) {
      // Download from URL
      const imgRes = await fetch(url);
      const imgBuf = Buffer.from(await imgRes.arrayBuffer());
      writeFileSync(filepath, imgBuf);
      console.log(`Banner saved: ${filename} (url download)`);
      return filepath;
    }

    console.warn("Banner gen returned no image data");
    return null;
  } catch (err) {
    console.error("Banner gen error:", err.message);
    return null;
  }
}

/**
 * Get the URL for a banner (for use in email templates)
 * If banner doesn't exist, falls back to hero-woman.png
 */
export function getBannerUrl(issueNum) {
  const siteUrl = process.env.SITE_URL || "http://5.78.44.176/tsg";
  const filename = `banner-${issueNum}.png`;
  const filepath = join(BANNER_DIR, filename);

  if (existsSync(filepath)) {
    return `${siteUrl}/banners/${filename}`;
  }

  // Fallback to hero image
  return `${siteUrl}/assets/hero-woman.png`;
}

/**
 * Map content calendar entry types to banner content types
 */
export function calendarTypeToBannerType(calType) {
  const map = {
    "spotlight": "declassified",
    "deep-dive": "deep-dive",
    "profile": "profile",
    "institute": "institute",
    "study": "study",
  };
  return map[calType] || "default";
}
