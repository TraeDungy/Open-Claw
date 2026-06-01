#!/usr/bin/env bash
# VPS Unified Health Check — queries PM2 + Docker + systemd + nginx + key endpoints
# Usage: ssh root@5.78.44.176 'bash -s' < scripts/vps-health-check.sh
#    or: scp to VPS and run directly

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok() { echo -e "  ${GREEN}OK${NC}  $1"; }
warn() { echo -e "  ${YELLOW}WARN${NC}  $1"; }
fail() { echo -e "  ${RED}FAIL${NC}  $1"; }

echo "=== VPS Health Check — $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
echo ""

# ── Memory ───────────────────────────────────────────────────────
echo "--- Memory ---"
MEM_AVAIL=$(free -m | awk '/Mem:/ {print $7}')
MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
MEM_PCT=$(( (MEM_TOTAL - MEM_AVAIL) * 100 / MEM_TOTAL ))
if [ "$MEM_PCT" -lt 80 ]; then
  ok "Memory: ${MEM_PCT}% used (${MEM_AVAIL}MB available / ${MEM_TOTAL}MB total)"
elif [ "$MEM_PCT" -lt 90 ]; then
  warn "Memory: ${MEM_PCT}% used (${MEM_AVAIL}MB available)"
else
  fail "Memory: ${MEM_PCT}% used (${MEM_AVAIL}MB available) — CRITICAL"
fi

# ── Disk ─────────────────────────────────────────────────────────
echo ""
echo "--- Disk ---"
DISK_PCT=$(df / --output=pcent | tail -1 | tr -d ' %')
if [ "$DISK_PCT" -lt 80 ]; then
  ok "Disk: ${DISK_PCT}% used"
elif [ "$DISK_PCT" -lt 90 ]; then
  warn "Disk: ${DISK_PCT}% used"
else
  fail "Disk: ${DISK_PCT}% used — CRITICAL"
fi

# ── PM2 Services ─────────────────────────────────────────────────
echo ""
echo "--- PM2 Services ---"
PM2_ONLINE=$(pm2 jlist 2>/dev/null | python3 -c 'import json,sys; d=json.load(sys.stdin); print(sum(1 for p in d if p.get("pm2_env",{}).get("status")=="online"))' 2>/dev/null || echo 0)
PM2_STOPPED=$(pm2 jlist 2>/dev/null | python3 -c 'import json,sys; d=json.load(sys.stdin); print(sum(1 for p in d if p.get("pm2_env",{}).get("status")=="stopped"))' 2>/dev/null || echo 0)
PM2_ERRORED=$(pm2 jlist 2>/dev/null | python3 -c 'import json,sys; d=json.load(sys.stdin); print(sum(1 for p in d if p.get("pm2_env",{}).get("status")=="errored"))' 2>/dev/null || echo 0)
ok "PM2: ${PM2_ONLINE} online, ${PM2_STOPPED} stopped, ${PM2_ERRORED} errored"

# Check critical services
for svc in big-boss-ceo-bot paperclip litellm; do
  STATUS=$(pm2 jlist 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(next((p['pm2_env']['status'] for p in d if p['name']=='$svc'), 'missing'))" 2>/dev/null || echo "error")
  if [ "$STATUS" = "online" ]; then
    ok "  $svc: online"
  else
    fail "  $svc: $STATUS"
  fi
done

# ── Docker ───────────────────────────────────────────────────────
echo ""
echo "--- Docker ---"
DOCKER_RUNNING=$(docker ps -q 2>/dev/null | wc -l)
DOCKER_TOTAL=$(docker ps -aq 2>/dev/null | wc -l)
ok "Docker: ${DOCKER_RUNNING}/${DOCKER_TOTAL} containers running"

for ctr in postiz lightrag-postgres; do
  CTR_STATUS=$(docker inspect --format='{{.State.Status}}' "$ctr" 2>/dev/null || echo "missing")
  if [ "$CTR_STATUS" = "running" ]; then
    ok "  $ctr: running"
  else
    warn "  $ctr: $CTR_STATUS"
  fi
done

# ── systemd ──────────────────────────────────────────────────────
echo ""
echo "--- systemd ---"
for unit in nginx; do
  if systemctl is-active --quiet "$unit" 2>/dev/null; then
    ok "$unit: active"
  else
    fail "$unit: inactive"
  fi
done

# Gateway is a user service
if systemctl --user is-active --quiet openclaw-gateway 2>/dev/null; then
  ok "openclaw-gateway: active"
else
  warn "openclaw-gateway: check with 'systemctl --user status openclaw-gateway'"
fi

# ── Key Endpoints ────────────────────────────────────────────────
echo ""
echo "--- Endpoints ---"
check_endpoint() {
  local name=$1 url=$2
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    ok "$name: HTTP $code"
  elif [ "$code" = "000" ]; then
    fail "$name: connection refused / timeout"
  else
    warn "$name: HTTP $code"
  fi
}

check_endpoint "nginx root"       "http://localhost/"
check_endpoint "Paperclip API"    "http://localhost:3100/api/companies/2f28832f-6750-4a2e-9f45-32ac3da9c458/dashboard"
check_endpoint "LiteLLM"          "http://localhost:9000/health"
check_endpoint "x402-server"      "http://localhost:4200/healthz"
check_endpoint "CEO bot healthz"  "http://localhost:7082/healthz"
check_endpoint "LightRAG"         "http://localhost:9621/health"

# ── CEO Bot Cache Stats ──────────────────────────────────────────
echo ""
echo "--- CEO Bot Cache ---"
CACHE_DATA=$(curl -s --max-time 3 "http://localhost:7082/healthz" 2>/dev/null || echo "{}")
STALE_MS=$(echo "$CACHE_DATA" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("cache",{}).get("staleMs","N/A"))' 2>/dev/null || echo "N/A")
POLL_COUNT=$(echo "$CACHE_DATA" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("cache",{}).get("pollCount","N/A"))' 2>/dev/null || echo "N/A")
if [ "$STALE_MS" != "N/A" ] && [ "$STALE_MS" != "null" ]; then
  STALE_S=$((STALE_MS / 1000))
  if [ "$STALE_S" -lt 120 ]; then
    ok "Cache age: ${STALE_S}s (polls: $POLL_COUNT)"
  else
    warn "Cache stale: ${STALE_S}s since last poll"
  fi
else
  warn "Cache not yet populated"
fi

echo ""
echo "=== Done ==="
