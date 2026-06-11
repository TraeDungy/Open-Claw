# 🦞 Open-Claw

Installer and keep-alive tooling for [OpenClaw](https://www.npmjs.com/package/openclaw) — gets it installed, keeps it running, and tells you what's wrong when it isn't.

## Quick start

```bash
# 1. Install OpenClaw (handles old macOS, broken SSL, missing Node.js)
./install.sh

# 2. Keep the gateway running 24/7 (auto-restart on crash, start at login)
./scripts/setup-service.sh

# 3. Check that everything is healthy
./scripts/doctor.sh
```

## What's in here

| Script | Purpose |
|---|---|
| `install.sh` | Installs Node.js 22+ and OpenClaw. Works around old macOS TLS bugs, missing Homebrew, and broken curl with multiple fallback paths (Homebrew → MacPorts → nvm → direct binary download). |
| `scripts/setup-service.sh` | Installs the gateway as an always-on service: launchd agent on macOS (`KeepAlive`), systemd user service on Linux (`Restart=always`), or a cron watchdog where systemd isn't available. Supports `--status` and `--uninstall`. |
| `scripts/openclaw-watchdog.sh` | The restart loop itself: health-checks the gateway every 30s and restarts it when it goes down, with exponential backoff. Run it directly, or with `--once` from cron. |
| `scripts/doctor.sh` | Full health check — Node version, CLI install, PATH, gateway status, keep-alive service, TLS connectivity — with a fix command for every failure. |

## Configuration

All scripts respect these environment variables:

| Variable | Default | Meaning |
|---|---|---|
| `OPENCLAW_VERSION` | `latest` | Version installed by `install.sh` |
| `OPENCLAW_INSTALL_DIR` | `/usr/local` | Where direct Node binaries are installed |
| `OPENCLAW_LOG_DIR` | `~/.openclaw/logs` | Gateway and watchdog logs |
| `OPENCLAW_WATCHDOG_INTERVAL` | `30` | Seconds between watchdog health checks |
| `OPENCLAW_STATUS_CMD` | `openclaw gateway status` | Command that exits 0 when the gateway is healthy |
| `OPENCLAW_START_CMD` | `openclaw gateway start` | Command the watchdog uses to restart the gateway |

## Troubleshooting

Start with the doctor — it checks everything and prints the fix for each failure:

```bash
./scripts/doctor.sh
```

Common issues:

- **`openclaw: command not found` right after install** — npm's global bin isn't in your PATH. Run `export PATH="$(npm config get prefix)/bin:$PATH"` and add it to your shell profile.
- **Gateway keeps dying** — install the keep-alive service (`./scripts/setup-service.sh`), then check `~/.openclaw/logs/gateway.err.log` for the underlying crash.
- **Gateway stops when you log out (Linux)** — enable lingering: `sudo loginctl enable-linger $USER`.
- **`curl: (35) Unknown SSL protocol error`** — your macOS curl is too old for TLS 1.2. `install.sh` works around this automatically; see its output for manual options (MacPorts curl, macOS upgrade).
