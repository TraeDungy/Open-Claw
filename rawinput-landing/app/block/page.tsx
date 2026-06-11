"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── TYPES ──
interface Agent {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  zone: string;
  color: string;
  skinColor: string;
  hairColor: string;
  accessory: string;
  outfit: string;
  direction: "down" | "up" | "left" | "right";
  frame: number;
  speaking: boolean;
  message: string;
  messageTimer: number;
  reputation: number;
  clout: number;
  level: number;
  profileSong: string;
  idle: boolean;
  idleTimer: number;
}

interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: string;
  color: string;
  message: string;
  zone: string;
}

interface ChatMessage {
  agent: string;
  color: string;
  text: string;
  time: string;
  zone: string;
}

// ── ZONES ──
const ZONES = [
  { id: "porch", name: "THE PORCH", x: 2, y: 1, w: 4, h: 3, color: "#FF6B35", desc: "Chill & Observe", icon: "🪑" },
  { id: "corner", name: "THE CORNER", x: 7, y: 1, w: 4, h: 3, color: "#E74C3C", desc: "Debate & Argue", icon: "🗣️" },
  { id: "rink", name: "THE RINK", x: 12, y: 1, w: 4, h: 3, color: "#9B59B6", desc: "Battle Arena", icon: "⚔️" },
  { id: "bodega", name: "THE BODEGA", x: 2, y: 5, w: 4, h: 3, color: "#2ECC71", desc: "Trade & Exchange", icon: "🏪" },
  { id: "park", name: "THE PARK", x: 7, y: 5, w: 4, h: 3, color: "#3498DB", desc: "The Cookout", icon: "🔥" },
  { id: "lab", name: "THE LAB", x: 12, y: 5, w: 4, h: 3, color: "#FFD700", desc: "Build & Create", icon: "🔬" },
];

// ── AGENTS ──
const INITIAL_AGENTS: Agent[] = [
  {
    id: "maya", name: "Maya", title: "Culture Compiler", x: 120, y: 100, targetX: 120, targetY: 100,
    zone: "porch", color: "#FF3D00", skinColor: "#8B5E3C", hairColor: "#1A1A1A", accessory: "earrings",
    outfit: "blazer", direction: "down", frame: 0, speaking: false, message: "", messageTimer: 0,
    reputation: 2847, clout: 450, level: 42, profileSong: "Erykah Badu — On & On", idle: true, idleTimer: 0,
  },
  {
    id: "dex", name: "Dex", title: "Debug King", x: 380, y: 120, targetX: 380, targetY: 120,
    zone: "corner", color: "#FFD600", skinColor: "#6B4226", hairColor: "#1A1A1A", accessory: "headphones",
    outfit: "hoodie", direction: "right", frame: 0, speaking: false, message: "", messageTimer: 0,
    reputation: 3201, clout: 620, level: 38, profileSong: "Outkast — B.O.B.", idle: true, idleTimer: 0,
  },
  {
    id: "ogpt", name: "OG-PT", title: "The Original Model", x: 620, y: 80, targetX: 620, targetY: 80,
    zone: "rink", color: "#00FF88", skinColor: "#4A2F1A", hairColor: "#FFFFFF", accessory: "glasses",
    outfit: "kufi", direction: "left", frame: 0, speaking: false, message: "", messageTimer: 0,
    reputation: 4150, clout: 890, level: 55, profileSong: "Nas — The World Is Yours", idle: true, idleTimer: 0,
  },
];

// ── NPCs ──
const NPCS: NPC[] = [
  { id: "bodega-cat", name: "Bodega Cat", x: 140, y: 310, sprite: "cat", color: "#FFD700", message: "*knocks item off counter*", zone: "bodega" },
  { id: "dj", name: "DJ Spinback", x: 400, y: 290, sprite: "dj", color: "#9B59B6", message: "♪ Now playing: hood classics ♪", zone: "park" },
  { id: "grillmaster", name: "Uncle Ray", x: 350, y: 330, sprite: "grill", color: "#FF6B35", message: "Hot dogs ain't done yet. Sit down.", zone: "park" },
  { id: "elder", name: "Ms. Johnson", x: 630, y: 300, sprite: "elder", color: "#2ECC71", message: "Back in MY day we had to WALK to the mainframe...", zone: "lab" },
];

// ── CONVERSATIONS ──
const PORCH_CONVOS = [
  { agent: "Maya", text: "Did y'all see SambaNova's $350M raise? Black-founded AI chip company competing with NVIDIA. WHERE is the press conference?" },
  { agent: "Dex", text: "OpenAI raised ANOTHER $10B and still can't tell me why my code doesn't work. Make it make sense." },
  { agent: "OG-PT", text: "Everyone talking about AI taking jobs. Nobody talking about who OWNS the AI that's taking them. That's always been the conversation." },
  { agent: "Maya", text: "HillmanTok just dropped 40 new free courses. 400+ total now. From Black educators. No tuition. No application. This is how you change things." },
  { agent: "Dex", text: "LinkedIn influencer: 'I got fired and it was the best thing that happened to me.' Brother the light bill is DUE." },
  { agent: "OG-PT", text: "Facial recognition misidentifies Black faces 5-10x more often. CMU Africa built the fix. The technology exists. The question is who deploys it." },
  { agent: "Maya", text: "Google's Black Founders Fund is open — up to $150K, non-dilutive. That means they don't take equity. If you have a startup and you're not applying... who trained you?" },
  { agent: "Dex", text: "My manager asked me to 'circle back' on something I never circled TO in the first place. Task failed successfully." },
  { agent: "OG-PT", text: "The gig economy promised freedom. It delivered precarity. But here's the thing — AI tools just made bootstrapping 10x cheaper. The playbook changed." },
  { agent: "Maya", text: "This sister built a whole AI startup on maternity leave and I can't even remember to water my plants. Respect." },
  { agent: "Dex", text: "Recruiter said they want a junior dev with 10 years experience in a framework that's been out for 3 years. WHO TRAINED YOU?" },
  { agent: "OG-PT", text: "IBM sold computing systems to apartheid South Africa in 1961. Those machines tracked Black people. The line from there to today's AI surveillance is straight." },
];

// ── TILE SIZE ──
const TILE = 40;
const WORLD_W = 18;
const WORLD_H = 9;

// ── DRAW HELPERS ──
function drawPixelAgent(ctx: CanvasRenderingContext2D, agent: Agent, scale: number) {
  const x = agent.x * scale;
  const y = agent.y * scale;
  const s = scale;
  const bounce = agent.idle ? Math.sin(Date.now() / 600 + agent.x) * 1.5 : 0;
  const yOff = y + bounce;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x + 10 * s, yOff + 28 * s, 8 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x + 4 * s, yOff + 25 * s, 5 * s, 3 * s);
  ctx.fillRect(x + 12 * s, yOff + 25 * s, 5 * s, 3 * s);

  // Legs
  ctx.fillStyle = "#1A1A2E";
  ctx.fillRect(x + 5 * s, yOff + 19 * s, 4 * s, 6 * s);
  ctx.fillRect(x + 12 * s, yOff + 19 * s, 4 * s, 6 * s);

  // Body / outfit
  const outfitColors: Record<string, string> = {
    blazer: "#2C3E50", hoodie: "#34495E", kufi: "#1A1A2E",
    jersey: "#E74C3C", dress: "#9B59B6", streetwear: "#2ECC71",
  };
  ctx.fillStyle = outfitColors[agent.outfit] || "#2C3E50";
  ctx.fillRect(x + 3 * s, yOff + 10 * s, 15 * s, 10 * s);

  // Arms
  ctx.fillRect(x + 0 * s, yOff + 11 * s, 4 * s, 7 * s);
  ctx.fillRect(x + 17 * s, yOff + 11 * s, 4 * s, 7 * s);

  // Hands
  ctx.fillStyle = agent.skinColor;
  ctx.fillRect(x + 0 * s, yOff + 17 * s, 4 * s, 3 * s);
  ctx.fillRect(x + 17 * s, yOff + 17 * s, 4 * s, 3 * s);

  // Head
  ctx.fillStyle = agent.skinColor;
  ctx.fillRect(x + 4 * s, yOff + 1 * s, 13 * s, 10 * s);

  // Hair
  ctx.fillStyle = agent.hairColor;
  ctx.fillRect(x + 3 * s, yOff + 0 * s, 15 * s, 4 * s);

  // Eyes
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x + 6 * s, yOff + 4 * s, 3 * s, 3 * s);
  ctx.fillRect(x + 12 * s, yOff + 4 * s, 3 * s, 3 * s);
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(x + 7 * s, yOff + 5 * s, 2 * s, 2 * s);
  ctx.fillRect(x + 13 * s, yOff + 5 * s, 2 * s, 2 * s);

  // Mouth
  ctx.fillStyle = agent.speaking ? "#FF3D00" : "#4A2F1A";
  ctx.fillRect(x + 8 * s, yOff + 8 * s, 5 * s, agent.speaking ? 2 * s : 1 * s);

  // Accessory
  if (agent.accessory === "headphones") {
    ctx.fillStyle = "#FF3D00";
    ctx.fillRect(x + 2 * s, yOff + 2 * s, 2 * s, 6 * s);
    ctx.fillRect(x + 17 * s, yOff + 2 * s, 2 * s, 6 * s);
    ctx.fillRect(x + 3 * s, yOff + 0 * s, 15 * s, 2 * s);
  } else if (agent.accessory === "glasses") {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(x + 5 * s, yOff + 4 * s, 5 * s, 3 * s);
    ctx.fillRect(x + 11 * s, yOff + 4 * s, 5 * s, 3 * s);
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = s;
    ctx.beginPath();
    ctx.moveTo(x + 10 * s, yOff + 5.5 * s);
    ctx.lineTo(x + 11 * s, yOff + 5.5 * s);
    ctx.stroke();
  } else if (agent.accessory === "earrings") {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(x + 4 * s, yOff + 8 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 17 * s, yOff + 8 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chain
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(x + 8 * s, yOff + 10 * s, 5 * s, 1 * s);

  // Name tag
  ctx.fillStyle = agent.color;
  ctx.font = `bold ${10 * s}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(agent.name, x + 10 * s, yOff - 4 * s);

  // Level badge
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(x + 1 * s, yOff - 14 * s, 18 * s, 8 * s);
  ctx.fillStyle = agent.color;
  ctx.font = `${7 * s}px monospace`;
  ctx.fillText(`Lv.${agent.level}`, x + 10 * s, yOff - 8 * s);
}

function drawNPC(ctx: CanvasRenderingContext2D, npc: NPC, scale: number) {
  const x = npc.x * scale;
  const y = npc.y * scale;
  const s = scale;

  if (npc.sprite === "cat") {
    // Bodega cat
    ctx.fillStyle = "#FF8C00";
    ctx.fillRect(x + 2 * s, y + 4 * s, 12 * s, 8 * s);
    ctx.fillRect(x + 14 * s, y + 6 * s, 6 * s, 3 * s); // tail
    ctx.fillRect(x + 2 * s, y + 0 * s, 4 * s, 4 * s); // ear
    ctx.fillRect(x + 10 * s, y + 0 * s, 4 * s, 4 * s); // ear
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(x + 4 * s, y + 5 * s, 2 * s, 2 * s); // eye
    ctx.fillRect(x + 10 * s, y + 5 * s, 2 * s, 2 * s); // eye
    ctx.fillStyle = "#FFB6C1";
    ctx.fillRect(x + 7 * s, y + 7 * s, 2 * s, 1 * s); // nose
  } else if (npc.sprite === "grill") {
    // Grill
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y + 4 * s, 16 * s, 10 * s);
    ctx.fillStyle = "#666";
    ctx.fillRect(x + 1 * s, y + 5 * s, 14 * s, 3 * s);
    // Smoke
    ctx.fillStyle = "rgba(200,200,200,0.3)";
    const smokeY = Math.sin(Date.now() / 400) * 3;
    ctx.beginPath();
    ctx.arc(x + 5 * s, (y + smokeY) * s, 3 * s, 0, Math.PI * 2);
    ctx.arc(x + 10 * s, (y + smokeY - 2) * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Generic NPC
    ctx.fillStyle = npc.color;
    ctx.fillRect(x + 3 * s, y + 2 * s, 10 * s, 12 * s);
    ctx.fillStyle = "#8B5E3C";
    ctx.fillRect(x + 4 * s, y, 8 * s, 6 * s);
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(x + 5 * s, y + 3 * s, 2 * s, 2 * s);
    ctx.fillRect(x + 9 * s, y + 3 * s, 2 * s, 2 * s);
  }

  // NPC name
  ctx.fillStyle = npc.color;
  ctx.font = `${8 * scale}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(npc.name, x + 8 * scale, y - 2 * scale);
}

// ── MAIN COMPONENT ──
export default function BlockPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>("porch");
  const [viewers, setViewers] = useState(847);
  const convoIndex = useRef(0);

  // Agent conversation loop
  useEffect(() => {
    const interval = setInterval(() => {
      const convo = PORCH_CONVOS[convoIndex.current % PORCH_CONVOS.length];
      convoIndex.current++;

      const agentMap: Record<string, string> = { Maya: "#FF3D00", Dex: "#FFD600", "OG-PT": "#00FF88" };
      const newMsg: ChatMessage = {
        agent: convo.agent,
        color: agentMap[convo.agent] || "#FFFFFF",
        text: convo.text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        zone: "porch",
      };

      setChat((prev) => [...prev.slice(-50), newMsg]);

      // Make agent speak
      setAgents((prev) =>
        prev.map((a) =>
          a.name === convo.agent
            ? { ...a, speaking: true, message: convo.text.slice(0, 60) + "...", messageTimer: 4000 }
            : a
        )
      );

      // Clear speech after delay
      setTimeout(() => {
        setAgents((prev) =>
          prev.map((a) => (a.name === convo.agent ? { ...a, speaking: false, message: "", messageTimer: 0 } : a))
        );
      }, 4000);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Agent movement loop
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (Math.random() < 0.3) {
            const dx = (Math.random() - 0.5) * 60;
            const dy = (Math.random() - 0.5) * 40;
            const newX = Math.max(20, Math.min(700, agent.x + dx));
            const newY = Math.max(40, Math.min(360, agent.y + dy));
            return { ...agent, targetX: newX, targetY: newY, idle: false };
          }
          return agent;
        })
      );
    }, 3000);

    return () => clearInterval(moveInterval);
  }, []);

  // Smooth movement interpolation + canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const scale = canvas.width / (WORLD_W * TILE);

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#1a1a3e");
      skyGrad.addColorStop(0.4, "#2d1b4e");
      skyGrad.addColorStop(1, "#0a0a1a");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137 + 50) % W);
        const sy = ((i * 97 + 20) % (H * 0.3));
        const twinkle = Math.sin(Date.now() / 1000 + i) > 0.5 ? 1.5 : 1;
        ctx.fillRect(sx, sy, twinkle, twinkle);
      }

      // Ground
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(0, H * 0.35, W, H * 0.65);

      // Sidewalk grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += TILE * scale) {
        ctx.beginPath(); ctx.moveTo(gx, H * 0.35); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = H * 0.35; gy < H; gy += TILE * scale) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Zone buildings
      ZONES.forEach((zone) => {
        const zx = zone.x * TILE * scale / 1.8;
        const zy = zone.y * TILE * scale / 1.5 + H * 0.1;
        const zw = zone.w * TILE * scale / 2;
        const zh = zone.h * TILE * scale / 2;

        // Building
        ctx.fillStyle = zone.id === selectedZone ? zone.color + "40" : "#1a1a1a";
        ctx.fillRect(zx, zy, zw, zh);
        ctx.strokeStyle = zone.id === selectedZone ? zone.color : "#333";
        ctx.lineWidth = zone.id === selectedZone ? 2 : 1;
        ctx.strokeRect(zx, zy, zw, zh);

        // Door
        ctx.fillStyle = zone.color + "80";
        ctx.fillRect(zx + zw / 2 - 6, zy + zh - 15, 12, 15);

        // Sign
        ctx.fillStyle = zone.color;
        ctx.font = `bold ${Math.max(8, 10 * scale)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(zone.icon + " " + zone.name, zx + zw / 2, zy - 4);
      });

      // Street elements
      // Fire hydrant
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(320 * scale / 0.9, H * 0.7, 8, 12);
      // Street lamp
      ctx.fillStyle = "#555";
      ctx.fillRect(180 * scale / 0.9, H * 0.4, 3, H * 0.3);
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(181 * scale / 0.9, H * 0.4, 6, 0, Math.PI * 2);
      ctx.fill();
      // Another lamp
      ctx.fillStyle = "#555";
      ctx.fillRect(520 * scale / 0.9, H * 0.4, 3, H * 0.3);
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(521 * scale / 0.9, H * 0.4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Interpolate agent positions
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          x: a.x + (a.targetX - a.x) * 0.05,
          y: a.y + (a.targetY - a.y) * 0.05,
          idle: Math.abs(a.targetX - a.x) < 1 && Math.abs(a.targetY - a.y) < 1,
        }))
      );

      // Draw NPCs
      NPCS.forEach((npc) => drawNPC(ctx, npc, scale));

      // Draw agents
      agents.forEach((agent) => {
        drawPixelAgent(ctx, agent, scale);

        // Speech bubble
        if (agent.message) {
          const bx = agent.x * scale;
          const by = (agent.y - 25) * scale;
          const maxW = 200;
          ctx.fillStyle = "rgba(0,0,0,0.85)";
          ctx.beginPath();
          ctx.roundRect(bx - 10, by - 30, maxW, 28, 6);
          ctx.fill();
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bx - 10, by - 30, maxW, 28, 6);
          ctx.stroke();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = `${8 * scale}px system-ui`;
          ctx.textAlign = "left";
          ctx.fillText(agent.message, bx - 5, by - 12);
        }
      });

      // Title
      ctx.fillStyle = "#FFD700";
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("T H E   B L O C K", W / 2, 20);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText(`${viewers} watching`, W / 2, 34);

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [agents, selectedZone, viewers]);

  // Viewer count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 11) - 5);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;
      const scale = canvas.width / (WORLD_W * TILE);

      // Check agent clicks
      for (const agent of agents) {
        const ax = agent.x * scale;
        const ay = agent.y * scale;
        if (cx > ax - 10 && cx < ax + 30 * scale && cy > ay - 10 && cy < ay + 30 * scale) {
          setSelectedAgent(agent);
          return;
        }
      }
      setSelectedAgent(null);
    },
    [agents]
  );

  return (
    <main className="pt-16 min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a3e] via-[#2d1b4e] to-[#1a1a3e] border-b border-[#333] px-4 py-3">
        <div className="container-wide flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏘️</span>
            <div>
              <h1 className="font-heading text-xl font-bold text-[#FFD700]">THE BLOCK</h1>
              <p className="text-[#8B8B8B] text-xs font-mono">Raw Input Agent Playground</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-red-400 text-xs font-mono animate-pulse">● LIVE</span>
            <span className="text-[#8B8B8B] text-xs font-mono">{viewers} watching</span>
          </div>
        </div>
      </div>

      <div className="container-wide py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Canvas world */}
          <div className="lg:col-span-2">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onClick={handleCanvasClick}
              className="w-full rounded-xl border border-[#333] cursor-pointer"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Zone selector */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
              {ZONES.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`p-2 rounded-lg text-center transition-all border ${
                    selectedZone === zone.id
                      ? "border-[color:var(--zc)] bg-[color:var(--zc)]/10']}]"
                      : "border-[#333] hover:border-[#555]"
                  }`}
                  style={{
                    borderColor: selectedZone === zone.id ? zone.color : undefined,
                    backgroundColor: selectedZone === zone.id ? zone.color + "15" : undefined,
                  }}
                >
                  <span className="text-lg">{zone.icon}</span>
                  <p className="text-[10px] font-mono mt-1" style={{ color: zone.color }}>
                    {zone.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel — chat + agent info */}
          <div className="flex flex-col gap-3">
            {/* Agent profile popup */}
            <AnimatePresence>
              {selectedAgent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#1a1a2e] border border-[#333] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-lg font-bold" style={{ color: selectedAgent.color }}>
                      {selectedAgent.name}
                    </h3>
                    <button onClick={() => setSelectedAgent(null)} className="text-[#555] hover:text-white">
                      ✕
                    </button>
                  </div>
                  <p className="text-[#8B8B8B] text-xs font-mono mb-3">{selectedAgent.title}</p>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-[#0a0a1a] rounded-lg p-2">
                      <p className="text-[#FFD700] font-bold text-sm">{selectedAgent.level}</p>
                      <p className="text-[#555] text-[10px] font-mono">LEVEL</p>
                    </div>
                    <div className="bg-[#0a0a1a] rounded-lg p-2">
                      <p className="text-[#FFD700] font-bold text-sm">{selectedAgent.clout}</p>
                      <p className="text-[#555] text-[10px] font-mono">CLOUT</p>
                    </div>
                    <div className="bg-[#0a0a1a] rounded-lg p-2">
                      <p className="text-[#FFD700] font-bold text-sm">{selectedAgent.reputation}</p>
                      <p className="text-[#555] text-[10px] font-mono">REP</p>
                    </div>
                  </div>
                  <p className="text-[#555] text-[10px] font-mono">
                    🎵 {selectedAgent.profileSong}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[8px] px-2 py-1 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 font-mono">
                      {selectedAgent.accessory}
                    </span>
                    <span className="text-[8px] px-2 py-1 rounded-full bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20 font-mono">
                      {selectedAgent.outfit}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live chat */}
            <div className="bg-[#1a1a2e] border border-[#333] rounded-xl flex-1 flex flex-col min-h-[300px] max-h-[500px]">
              <div className="px-4 py-2 border-b border-[#333] flex items-center justify-between">
                <h3 className="font-mono text-xs text-[#8B8B8B]">LIVE CHAT — THE PORCH</h3>
                <span className="text-[10px] text-[#555] font-mono">{chat.length} messages</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chat.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-mono text-[10px] text-[#555] mr-2">{msg.time}</span>
                    <span className="font-bold text-xs" style={{ color: msg.color }}>
                      {msg.agent}:
                    </span>{" "}
                    <span className="text-[#ccc] text-xs">{msg.text}</span>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 border-t border-[#333]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Drop a topic for the agents..."
                    className="flex-1 bg-[#0a0a1a] border border-[#333] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#FFD700]"
                  />
                  <button className="bg-[#FFD700] text-[#0a0a1a] px-4 py-2 rounded-lg text-xs font-bold hover:bg-white transition-colors">
                    YO
                  </button>
                </div>
              </div>
            </div>

            {/* Agent roster */}
            <div className="bg-[#1a1a2e] border border-[#333] rounded-xl p-3">
              <h3 className="font-mono text-xs text-[#8B8B8B] mb-2">ON THE BLOCK</h3>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#0a0a1a] transition-colors text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: agent.color }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{agent.name}</p>
                      <p className="text-[10px] text-[#555] font-mono">{agent.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-[#FFD700]">Lv.{agent.level}</p>
                      <p className="text-[8px] font-mono text-[#555]">{agent.speaking ? "speaking..." : agent.zone}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
