#!/usr/bin/env bash
# OpenClaw Doctor
#
# Diagnoses an OpenClaw installation end to end: runtime, CLI, PATH,
# gateway health, keep-alive service, and network connectivity. Every
# failed check prints the command that fixes it.
#
# Usage: doctor.sh

set -uo pipefail

MIN_NODE_MAJOR=22
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${OPENCLAW_LOG_DIR:-$HOME/.openclaw/logs}"
STATUS_CMD="${OPENCLAW_STATUS_CMD:-openclaw gateway status}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'
BOLD='\033[1m'; NC='\033[0m'

PASS=0; WARNINGS=0; FAILS=0
ok()   { printf "  ${GREEN}✓${NC} %s\n" "$*"; PASS=$((PASS + 1)); }
bad()  { printf "  ${RED}✗${NC} %s\n" "$*"; FAILS=$((FAILS + 1)); }
meh()  { printf "  ${YELLOW}!${NC} %s\n" "$*"; WARNINGS=$((WARNINGS + 1)); }
fix()  { printf "      ${BLUE}fix:${NC} %s\n" "$*"; }

printf "\n  ${BOLD}🦞 OpenClaw Doctor${NC}\n\n"

# ── 1. Node.js ───────────────────────────────────────────────────────────────
printf "  ${BOLD}Runtime${NC}\n"
if command -v node &>/dev/null; then
  NODE_VER="$(node --version 2>/dev/null || echo "")"
  NODE_MAJOR="$(echo "$NODE_VER" | sed 's/^v//' | cut -d. -f1)"
  if [[ -n "$NODE_MAJOR" ]] && (( NODE_MAJOR >= MIN_NODE_MAJOR )); then
    ok "Node.js $NODE_VER (need v${MIN_NODE_MAJOR}+)"
  else
    bad "Node.js $NODE_VER is too old (need v${MIN_NODE_MAJOR}+)"
    fix "re-run install.sh, or: nvm install $MIN_NODE_MAJOR"
  fi
else
  bad "Node.js not found"
  fix "re-run install.sh"
fi

if command -v npm &>/dev/null; then
  ok "npm $(npm --version 2>/dev/null)"
else
  bad "npm not found"
  fix "re-run install.sh"
fi

# ── 2. OpenClaw CLI ──────────────────────────────────────────────────────────
printf "\n  ${BOLD}OpenClaw CLI${NC}\n"
OPENCLAW_BIN=""
if command -v openclaw &>/dev/null; then
  OPENCLAW_BIN="$(command -v openclaw)"
  ok "openclaw $(openclaw --version 2>/dev/null || echo '(version unknown)') at $OPENCLAW_BIN"
elif command -v npm &>/dev/null && [[ -x "$(npm config get prefix 2>/dev/null)/bin/openclaw" ]]; then
  OPENCLAW_BIN="$(npm config get prefix)/bin/openclaw"
  meh "openclaw installed at $OPENCLAW_BIN but not in PATH"
  fix "export PATH=\"$(npm config get prefix)/bin:\$PATH\"  (add to your shell profile)"
else
  bad "openclaw not installed"
  fix "run ./install.sh"
fi

# ── 3. Gateway health ────────────────────────────────────────────────────────
printf "\n  ${BOLD}Gateway${NC}\n"
GATEWAY_UP=0
if [[ -n "$OPENCLAW_BIN" ]]; then
  if $STATUS_CMD &>/dev/null; then
    ok "gateway is up ($STATUS_CMD)"
    GATEWAY_UP=1
  elif pgrep -f 'openclaw[ /].*gateway' &>/dev/null; then
    meh "gateway process is running but '$STATUS_CMD' did not report healthy"
    fix "check logs: $LOG_DIR/gateway.log"
    GATEWAY_UP=1
  else
    bad "gateway is not running"
    fix "openclaw gateway start   (or install the keep-alive service: $SCRIPT_DIR/setup-service.sh)"
  fi
else
  meh "skipping gateway check (openclaw not installed)"
fi

# ── 4. Keep-alive service (the loop) ────────────────────────────────────────
printf "\n  ${BOLD}Keep-alive service${NC}\n"
SERVICE_FOUND=0
case "$(uname -s)" in
  Darwin)
    if launchctl list 2>/dev/null | grep -q "com.openclaw.gateway"; then
      ok "launchd agent loaded (auto-restart enabled)"
      SERVICE_FOUND=1
    fi
    ;;
  Linux)
    if command -v systemctl &>/dev/null \
       && systemctl --user is-enabled openclaw-gateway.service &>/dev/null; then
      if systemctl --user is-active openclaw-gateway.service &>/dev/null; then
        ok "systemd service active (auto-restart enabled)"
      else
        meh "systemd service installed but not active"
        fix "systemctl --user restart openclaw-gateway"
      fi
      SERVICE_FOUND=1
    elif crontab -l 2>/dev/null | grep -q "openclaw-watchdog"; then
      ok "cron watchdog installed (checks every minute)"
      SERVICE_FOUND=1
    fi
    ;;
esac
if (( SERVICE_FOUND == 0 )); then
  if [[ -f "$LOG_DIR/watchdog.pid" ]] \
     && kill -0 "$(cat "$LOG_DIR/watchdog.pid" 2>/dev/null)" 2>/dev/null; then
    ok "watchdog loop running (PID $(cat "$LOG_DIR/watchdog.pid"))"
  else
    meh "no keep-alive service — the gateway won't restart after a crash or reboot"
    fix "$SCRIPT_DIR/setup-service.sh"
  fi
fi

# ── 5. Network ───────────────────────────────────────────────────────────────
printf "\n  ${BOLD}Network${NC}\n"
if command -v curl &>/dev/null \
   && curl --tlsv1.2 -fsSL --max-time 10 -o /dev/null https://github.com 2>/dev/null; then
  ok "TLS 1.2+ connectivity to GitHub"
elif command -v curl &>/dev/null \
     && curl -fsSL --max-time 10 -o /dev/null https://github.com 2>/dev/null; then
  meh "connectivity works but TLS 1.2 flag unsupported by this curl"
else
  bad "cannot reach https://github.com securely"
  fix "see the SSL section of install.sh output, or update curl/OpenSSL"
fi

# ── 6. Recent watchdog activity ──────────────────────────────────────────────
if [[ -f "$LOG_DIR/watchdog.log" ]]; then
  printf "\n  ${BOLD}Recent watchdog log${NC} ($LOG_DIR/watchdog.log)\n"
  tail -n 5 "$LOG_DIR/watchdog.log" | sed 's/^/      /'
fi

# ── Summary ──────────────────────────────────────────────────────────────────
printf "\n  ${BOLD}Summary:${NC} ${GREEN}$PASS passed${NC}, ${YELLOW}$WARNINGS warnings${NC}, ${RED}$FAILS failed${NC}\n\n"
if (( FAILS > 0 )); then
  exit 1
fi
exit 0
