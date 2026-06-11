#!/usr/bin/env bash
# OpenClaw Watchdog Loop
#
# Keeps the OpenClaw gateway alive: checks its health on an interval and
# restarts it when it goes down, with exponential backoff so a crash-looping
# gateway doesn't burn CPU.
#
# Usage:
#   openclaw-watchdog.sh           # run the loop in the foreground
#   openclaw-watchdog.sh --once    # single health check + restart if needed
#
# Environment variables:
#   OPENCLAW_WATCHDOG_INTERVAL  Seconds between health checks (default: 30)
#   OPENCLAW_STATUS_CMD         Command that exits 0 when healthy
#                               (default: "openclaw gateway status")
#   OPENCLAW_START_CMD          Command to (re)start the gateway
#                               (default: "openclaw gateway start")
#   OPENCLAW_LOG_DIR            Log directory (default: ~/.openclaw/logs)

set -uo pipefail  # no -e: the loop must survive failed health checks

INTERVAL="${OPENCLAW_WATCHDOG_INTERVAL:-30}"
STATUS_CMD="${OPENCLAW_STATUS_CMD:-openclaw gateway status}"
START_CMD="${OPENCLAW_START_CMD:-openclaw gateway start}"
LOG_DIR="${OPENCLAW_LOG_DIR:-$HOME/.openclaw/logs}"
LOG_FILE="$LOG_DIR/watchdog.log"
PID_FILE="$LOG_DIR/watchdog.pid"
MAX_LOG_BYTES=$((1024 * 1024))
MAX_BACKOFF=300

mkdir -p "$LOG_DIR"

log() {
  printf '%s [watchdog] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG_FILE"
  # Simple rotation: keep one previous generation
  local size
  size="$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)"
  if (( size > MAX_LOG_BYTES )); then
    mv -f "$LOG_FILE" "$LOG_FILE.1"
  fi
}

gateway_healthy() {
  # Primary check: the CLI's own status command
  if $STATUS_CMD &>/dev/null; then
    return 0
  fi
  # Fallback: is a gateway process running at all? (Covers CLIs where the
  # status subcommand is unavailable or errors for unrelated reasons.)
  pgrep -f 'openclaw[ /].*gateway' &>/dev/null
}

restart_gateway() {
  log "Gateway down — starting: $START_CMD"
  if $START_CMD >> "$LOG_FILE" 2>&1; then
    log "Gateway start command succeeded"
    return 0
  fi
  log "Gateway start command FAILED (see $LOG_FILE)"
  return 1
}

check_once() {
  if gateway_healthy; then
    return 0
  fi
  restart_gateway
  sleep 3
  if gateway_healthy; then
    log "Gateway recovered"
    return 0
  fi
  return 1
}

# ── Single-shot mode (for cron) ──────────────────────────────────────────────
if [[ "${1:-}" == "--once" ]]; then
  check_once
  exit $?
fi

# ── Loop mode ────────────────────────────────────────────────────────────────
# Refuse to run two loops at once
if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE" 2>/dev/null)" 2>/dev/null; then
  echo "Watchdog already running (PID $(cat "$PID_FILE")). Exiting." >&2
  exit 1
fi
echo $$ > "$PID_FILE"
trap 'rm -f "$PID_FILE"' EXIT

log "Watchdog started (interval: ${INTERVAL}s, status: '$STATUS_CMD')"

failures=0
while true; do
  if check_once; then
    failures=0
    sleep "$INTERVAL"
  else
    failures=$((failures + 1))
    backoff=$(( INTERVAL * (1 << (failures < 5 ? failures : 4)) ))
    (( backoff > MAX_BACKOFF )) && backoff=$MAX_BACKOFF
    log "Gateway still down after restart attempt #$failures — retrying in ${backoff}s"
    sleep "$backoff"
  fi
done
