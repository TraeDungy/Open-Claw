# Gemma Boy — Setup Reference (v1.0 Locked)

Two independent Gemma-powered Game Boy chat UIs running on different machines with different backends.

---

## Machine 1: MacBook (TRIALXFIRE-MAC)

| Property | Value |
|---|---|
| **Machine** | MacBook Pro, macOS 12.7, Intel i7-6920HQ, 16GB RAM |
| **Backend** | Ollama (v0.20.4) |
| **Model** | `gemma3:4b` (3.3GB) |
| **UI Server** | `server.mjs` → port 7777 |
| **Ollama Port** | 11434 (default) |
| **URL** | http://localhost:7777 |

### Start Commands (MacBook)

```bash
# 1. Start Ollama (if not running)
ollama serve &

# 2. Start Gemma Boy UI
cd "/Users/trialxfire/open claw/gemma-gameboy"
MACHINE_NAME="TRIALXFIRE-MAC" GEMMA_MODEL="gemma3:4b" node server.mjs
```

### Architecture

```
Browser → localhost:7777 (server.mjs)
  → POST /chat → Ollama API (localhost:11434/api/chat)
  → SSE streaming back to browser
```

---

## Machine 2: Mack's iMac (MACKS-IMAC)

| Property | Value |
|---|---|
| **Machine** | iMac Late 2013, macOS 10.15.7 (Catalina), Intel i5-4260U, 8GB RAM |
| **Backend** | llama.cpp (tag b3962, CPU-only, no Metal) |
| **Model** | `gemma-2-2b-it-Q4_K_M.gguf` (1.6GB) |
| **UI Server** | `server-llamacpp.mjs` → port 7777 |
| **llama-server Port** | 8080 |
| **IP** | 192.168.1.151 |
| **URL** | http://192.168.1.151:7777 |
| **SSH** | `sshpass -p '1234' ssh newowner@192.168.1.151` |

### Why llama.cpp Instead of Ollama

Ollama v0.20.4 requires macOS 14+ (Sonoma). Catalina 10.15 is too old — `dyld: Symbol not found` on launch. Compiled llama.cpp from source instead.

### Start Commands (iMac)

```bash
# 1. Start llama-server with Gemma model
/tmp/llama.cpp/llama-server \
  -m /tmp/models/gemma-2-2b-it-Q4_K_M.gguf \
  --host 0.0.0.0 --port 8080 \
  -c 2048 -t 2 &

# 2. Wait for model to load
# Check: curl http://localhost:8080/health → {"status":"ok"}

# 3. Start Gemma Boy UI
cd /tmp/gemma-gameboy
MACHINE_NAME="MACKS-IMAC" GEMMA_MODEL="gemma-2-2b-it" \
  LLAMA_URL="http://localhost:8080" GEMMA_PORT=7777 \
  node server-llamacpp.mjs
```

### Architecture

```
Browser → 192.168.1.151:7777 (server-llamacpp.mjs)
  → POST /chat → llama.cpp (localhost:8080/v1/chat/completions)
  → SSE streaming back to browser
```

### iMac File Locations

```
/tmp/llama.cpp/llama-server              — compiled binary (b3962, CPU-only)
/tmp/models/gemma-2-2b-it-Q4_K_M.gguf   — model weights
/tmp/gemma-gameboy/index.html            — UI (copied from MacBook)
/tmp/gemma-gameboy/server-llamacpp.mjs   — server (copied from MacBook)
```

**Warning:** iMac files are in `/tmp/` — they will be lost on reboot. Move to a permanent location for persistence.

---

## Key Differences Between Setups

| | MacBook | iMac |
|---|---|---|
| Backend | Ollama | llama.cpp (compiled) |
| Server file | `server.mjs` | `server-llamacpp.mjs` |
| Model | Gemma 3 4B | Gemma 2 2B |
| Model format | Ollama native | GGUF (Q4_K_M) |
| GPU | None (CPU) | None (CPU-only build) |
| API style | Ollama `/api/chat` | OpenAI-compatible `/v1/chat/completions` |
| RAM headroom | ~12GB free | ~6GB free |

---

## UI Features (Shared)

- Retro Game Boy shell with D-pad, A/B buttons, speaker grille, power LED
- 4 color themes: Classic (green), Pocket (blue), Color (pink), Neon (green glow)
- Boot animation with progress bar
- Pixel rain background + CRT scanlines
- Streaming token-by-token responses
- Preset prompts via D-pad left/right

### Controls

| Control | Action |
|---|---|
| A / Enter | Send message |
| B | Clear chat |
| D-pad Left/Right | Cycle preset prompts |
| D-pad Up/Down | Scroll chat |
| SELECT | Change theme |
| START | Show help |

---

## Version

**v1.0** — Locked baseline. Do not modify these files for v1; iterate in new versions.
