#!/usr/bin/env bash
# OpenClaw Service Setup
#
# Installs the OpenClaw gateway as an always-on service so it starts at
# login/boot and restarts automatically if it crashes:
#
#   macOS              → launchd agent (KeepAlive)
#   Linux (systemd)    → systemd user service (Restart=always)
#   Linux (no systemd) → cron job running the watchdog every minute
#
# Usage:
#   setup-service.sh              # install + start the service
#   setup-service.sh --uninstall  # remove the service
#   setup-service.sh --status     # show service state

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WATCHDOG="$SCRIPT_DIR/openclaw-watchdog.sh"
LOG_DIR="${OPENCLAW_LOG_DIR:-$HOME/.openclaw/logs}"
LABEL="com.openclaw.gateway"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
UNIT_DIR="$HOME/.config/systemd/user"
UNIT="$UNIT_DIR/openclaw-gateway.service"
CRON_TAG="# openclaw-watchdog"

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
success() { printf "  ${GREEN}✓${NC} %s\n" "$*"; }
failure() { printf "  ${RED}✗${NC} %s\n" "$*"; }
info()    { printf "  ${BLUE}·${NC} %s\n" "$*"; }

find_openclaw() {
  if command -v openclaw &>/dev/null; then
    command -v openclaw
    return 0
  fi
  # Try npm's global bin even if it isn't in PATH
  if command -v npm &>/dev/null; then
    local bin
    bin="$(npm config get prefix 2>/dev/null)/bin/openclaw"
    if [[ -x "$bin" ]]; then
      echo "$bin"
      return 0
    fi
  fi
  return 1
}

# ── macOS: launchd ───────────────────────────────────────────────────────────
install_launchd() {
  local openclaw_bin="$1"
  mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"

  cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$openclaw_bin</string>
    <string>gateway</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>10</integer>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/gateway.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/gateway.err.log</string>
</dict>
</plist>
EOF

  launchctl unload "$PLIST" 2>/dev/null || true
  launchctl load "$PLIST"
  success "launchd agent installed: $PLIST"
  success "Gateway will start at login and restart automatically if it crashes"
  info "Logs: $LOG_DIR/gateway.log"
}

uninstall_launchd() {
  if [[ -f "$PLIST" ]]; then
    launchctl unload "$PLIST" 2>/dev/null || true
    rm -f "$PLIST"
    success "launchd agent removed"
  else
    info "No launchd agent installed"
  fi
}

status_launchd() {
  if launchctl list 2>/dev/null | grep -q "$LABEL"; then
    success "launchd agent loaded ($LABEL)"
  else
    failure "launchd agent not loaded"
  fi
}

# ── Linux: systemd user service ──────────────────────────────────────────────
install_systemd() {
  local openclaw_bin="$1"
  mkdir -p "$UNIT_DIR" "$LOG_DIR"

  cat > "$UNIT" <<EOF
[Unit]
Description=OpenClaw Gateway
After=network-online.target

[Service]
ExecStart=$openclaw_bin gateway
Restart=always
RestartSec=5
StandardOutput=append:$LOG_DIR/gateway.log
StandardError=append:$LOG_DIR/gateway.err.log

[Install]
WantedBy=default.target
EOF

  systemctl --user daemon-reload
  systemctl --user enable --now openclaw-gateway.service
  success "systemd user service installed and started: openclaw-gateway"
  success "Gateway will restart automatically if it crashes"
  info "Logs: $LOG_DIR/gateway.log  (or: journalctl --user -u openclaw-gateway)"

  if command -v loginctl &>/dev/null && ! loginctl show-user "$USER" 2>/dev/null | grep -q "Linger=yes"; then
    info "To keep the gateway running when you're logged out, run:"
    info "  sudo loginctl enable-linger $USER"
  fi
}

uninstall_systemd() {
  if [[ -f "$UNIT" ]]; then
    systemctl --user disable --now openclaw-gateway.service 2>/dev/null || true
    rm -f "$UNIT"
    systemctl --user daemon-reload
    success "systemd service removed"
  else
    info "No systemd service installed"
  fi
}

status_systemd() {
  systemctl --user status openclaw-gateway.service --no-pager || true
}

# ── Fallback: cron-driven watchdog ───────────────────────────────────────────
install_cron() {
  mkdir -p "$LOG_DIR"
  local line="* * * * * $WATCHDOG --once >/dev/null 2>&1 $CRON_TAG"
  ( crontab -l 2>/dev/null | grep -vF "$CRON_TAG"; echo "$line" ) | crontab -
  success "cron watchdog installed (checks the gateway every minute)"
  info "Logs: $LOG_DIR/watchdog.log"
}

uninstall_cron() {
  if crontab -l 2>/dev/null | grep -qF "$CRON_TAG"; then
    crontab -l 2>/dev/null | grep -vF "$CRON_TAG" | crontab -
    success "cron watchdog removed"
  else
    info "No cron watchdog installed"
  fi
}

status_cron() {
  if crontab -l 2>/dev/null | grep -qF "$CRON_TAG"; then
    success "cron watchdog installed"
  else
    failure "cron watchdog not installed"
  fi
}

# ── Main ─────────────────────────────────────────────────────────────────────
ACTION="${1:-install}"
OS="$(uname -s)"

case "$ACTION" in
  --uninstall)
    case "$OS" in
      Darwin) uninstall_launchd ;;
      Linux)
        if command -v systemctl &>/dev/null && systemctl --user show-environment &>/dev/null; then
          uninstall_systemd
        fi
        uninstall_cron
        ;;
    esac
    exit 0
    ;;
  --status)
    case "$OS" in
      Darwin) status_launchd ;;
      Linux)
        if command -v systemctl &>/dev/null && systemctl --user show-environment &>/dev/null; then
          status_systemd
        else
          status_cron
        fi
        ;;
    esac
    exit 0
    ;;
  install|"") ;;
  *)
    echo "Usage: setup-service.sh [--uninstall|--status]" >&2
    exit 1
    ;;
esac

if ! OPENCLAW_BIN="$(find_openclaw)"; then
  failure "openclaw not found — run install.sh first"
  exit 1
fi
info "Using openclaw at: $OPENCLAW_BIN"

case "$OS" in
  Darwin)
    install_launchd "$OPENCLAW_BIN"
    ;;
  Linux)
    if command -v systemctl &>/dev/null && systemctl --user show-environment &>/dev/null; then
      install_systemd "$OPENCLAW_BIN"
    else
      info "systemd user session not available — falling back to cron watchdog"
      install_cron
    fi
    ;;
  *)
    failure "Unsupported OS: $OS"
    info "You can still run the watchdog loop manually:"
    info "  nohup $WATCHDOG &"
    exit 1
    ;;
esac
