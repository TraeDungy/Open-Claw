/**
 * Generate 3 TSG email header banners via OpenRouter → Gemini 2.5 Flash Image
 * Style: 70s-80s pulp sci-fi, matching hero-woman aesthetic
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";

const API_KEY = process.env.OPENROUTER_API_KEY || "";
const MODEL = "google/gemini-2.5-flash-image";
const OUT_DIR = "/Users/trialxfire/open claw/tsg-landing/public/assets/banners";

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const STYLE_BASE = `70s-80s pulp science fiction paperback cover painting. Photorealistic but painterly with visible brushwork. Film grain texture. Slightly aged and distressed edges like a vintage print recovered from a warehouse. Color palette strictly: void black (#050505 background), warm amber-gold, ember orange, bone cream. Volumetric golden light. Sacred geometry undertones. Cinematic. Widescreen banner format. Absolutely no text, no words, no letters, no numbers, no typography, no writing of any kind.`;

const banners = [
  {
    name: "banner-third-eye",
    prompt: `${STYLE_BASE} Subject: A powerful Black woman with a natural afro, eyes closed in deep concentration, elegant hands raised to her temples, fingers slightly spread. An intense burst of amber-gold light erupts from her forehead — her third eye — casting dramatic shadows across her face and illuminating her skin with warm golden tones. From the light source, sacred geometry cymatic patterns radiate outward: concentric rings modulated by standing wave interference, creating flower-of-life-like geometric patterns in pure golden light. Thousands of micro gold particles float in the air around her like magnetized dust. The background is absolute void black. Her expression is power, not strain — serene command. Dramatic Rembrandt lighting from the forehead glow only.`,
  },
  {
    name: "banner-frequency-room",
    prompt: `${STYLE_BASE} Subject: A perfectly circular matte black Chladni plate sitting on a vibration apparatus in a dark laboratory. Fine golden sand has collected along the nodal lines of a complex standing wave pattern, creating an intricate symmetric mandala-like geometric figure on the plate surface. The pattern is mathematically precise — nodes where the plate doesn't vibrate hold the sand in sharp geometric lines while antinodes are swept clean. Dramatic side lighting from a single warm amber laboratory lamp illuminates the sand grains, making them glow like gold dust against the dark plate. The surrounding laboratory is barely visible in deep shadow — hints of brass instruments, glass beakers, oscilloscope screens with waveforms. Macro lens detail — individual sand grains visible.`,
  },
  {
    name: "banner-classified-vault",
    prompt: `${STYLE_BASE} Subject: A vast underground government archive vault — endless rows of metal filing cabinets extending into darkness, illuminated by strips of warm amber emergency lighting. One filing cabinet drawer is pulled fully open, brilliant golden light pouring out as if the classified documents inside are radioactive with forbidden knowledge. A single figure in dark silhouette stands at the far end of the row. The polished obsidian floor reflects the amber light. Dust particles caught in the golden light beams. Faint sacred geometry patterns visible in the light — concentric rings, wave interference. The aesthetic is recovered Cold War paranormal research photograph.`,
  },
];

async function generate(banner) {
  console.log(`\nGenerating: ${banner.name}...`);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: `Generate this image: ${banner.prompt}` }],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    console.error(`  HTTP ${res.status}: ${await res.text()}`);
    return false;
  }

  const data = await res.json();
  const msg = data.choices?.[0]?.message;

  // Extract image from the response
  const images = msg?.images || [];
  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const url = img?.image_url?.url || img?.url || "";
      if (url.startsWith("data:image/")) {
        const b64 = url.split(",")[1];
        const buf = Buffer.from(b64, "base64");
        const ext = url.includes("png") ? "png" : "jpg";
        const filepath = `${OUT_DIR}/${banner.name}.${ext}`;
        writeFileSync(filepath, buf);
        console.log(`  Saved: ${filepath} (${(buf.length / 1024).toFixed(0)} KB)`);
        return true;
      }
    }
  }

  // Check if content is multipart with inline images
  const content = msg?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.inline_data) {
        const buf = Buffer.from(part.inline_data.data, "base64");
        const filepath = `${OUT_DIR}/${banner.name}.png`;
        writeFileSync(filepath, buf);
        console.log(`  Saved: ${filepath} (${(buf.length / 1024).toFixed(0)} KB)`);
        return true;
      }
    }
  }

  console.error("  No image found in response. Keys:", JSON.stringify(Object.keys(msg || {})));
  return false;
}

// Generate all 3 sequentially (avoid rate limits)
for (const banner of banners) {
  const ok = await generate(banner);
  if (!ok) console.error(`  FAILED: ${banner.name}`);
  // Small delay between requests
  await new Promise(r => setTimeout(r, 2000));
}

console.log("\n--- Done ---");
console.log("Check:", OUT_DIR);
