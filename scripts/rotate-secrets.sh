#!/usr/bin/env bash
# Rotate the BIG BOSS CEO bot secrets after exposure.
#
# Run this ON THE VPS after getting the new token:
#   1. In Telegram, message @BotFather → /revoke → select the bot.
#      BotFather invalidates the old token and gives you a new one.
#   2. Run: ./rotate-secrets.sh
#      It validates the new token, updates .env, generates a new LiteLLM
#      key, and restarts the bot.
#
# Environment:
#   CEO_ENV_FILE   Path to the bot's .env (default: /root/big-boss-ceo-bot/.env)

set -euo pipefail

ENV_FILE="${CEO_ENV_FILE:-/root/big-boss-ceo-bot/.env}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
success() { printf "  ${GREEN}✓${NC} %s\n" "$*"; }
failure() { printf "  ${RED}✗${NC} %s\n" "$*"; }
info()    { printf "  ${BLUE}·${NC} %s\n" "$*"; }
warn()    { printf "  ${YELLOW}!${NC} %s\n" "$*"; }

if [[ ! -f "$ENV_FILE" ]]; then
  warn "$ENV_FILE does not exist — creating it from scratch"
  touch "$ENV_FILE"
fi
chmod 600 "$ENV_FILE"

# Update or append KEY=VALUE in the .env (awk avoids sed escaping pitfalls)
set_env_var() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    awk -v k="$key" -v v="$val" -F= 'BEGIN{OFS="="} $1==k {print k"="v; next} {print}' \
      "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$val" >> "$ENV_FILE"
  fi
  chmod 600 "$ENV_FILE"
}

# ── Backup ───────────────────────────────────────────────────────────────────
backup="$ENV_FILE.bak.$(date +%Y%m%d-%H%M%S)"
cp "$ENV_FILE" "$backup"
chmod 600 "$backup"
success "Backed up current .env to $backup"

# ── 1. Telegram bot token ────────────────────────────────────────────────────
printf "\n"
info "Paste the NEW bot token from @BotFather (input hidden):"
read -rs NEW_BOT_TOKEN
printf "\n"

if [[ -z "$NEW_BOT_TOKEN" ]]; then
  warn "Empty input — skipping bot token rotation"
else
  info "Validating token against the Telegram API..."
  me="$(curl -fsS --max-time 15 "https://api.telegram.org/bot${NEW_BOT_TOKEN}/getMe" 2>/dev/null || true)"
  if [[ "$me" == *'"ok":true'* ]]; then
    bot_user="$(printf '%s' "$me" | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)"
    success "Token is valid (bot: @${bot_user:-unknown})"
    set_env_var BOT_TOKEN "$NEW_BOT_TOKEN"
    success "BOT_TOKEN updated in $ENV_FILE"
  else
    failure "Token validation FAILED — .env not changed. Check the token and re-run."
    exit 1
  fi
fi

# ── 2. LiteLLM key ───────────────────────────────────────────────────────────
printf "\n"
info "Rotate the LiteLLM key too? A new random key will be generated. [y/N]"
read -r rotate_llm
if [[ "$rotate_llm" =~ ^[Yy] ]]; then
  NEW_LLM_KEY="sk-openclaw-internal-$(openssl rand -hex 16)"
  set_env_var LITELLM_API_KEY "$NEW_LLM_KEY"
  success "LITELLM_API_KEY updated in $ENV_FILE"
  printf "\n"
  warn "The SAME key must now be set everywhere it is used:"
  warn "  1. LiteLLM proxy config (master/virtual key), then restart it:"
  warn "       pm2 restart litellm"
  warn "  2. Any other service calling LiteLLM with the old key"
  warn "     (e.g. /root/error-triage/ceo-layer.mjs config)"
  printf "\n"
  info "New key (also in $ENV_FILE): $NEW_LLM_KEY"
else
  info "LiteLLM key left unchanged"
fi

# ── 3. Restart + verify ──────────────────────────────────────────────────────
printf "\n"
if command -v pm2 &>/dev/null && pm2 describe big-boss-ceo-bot &>/dev/null; then
  info "Restarting big-boss-ceo-bot..."
  pm2 restart big-boss-ceo-bot --update-env >/dev/null
  sleep 4
  if pm2 describe big-boss-ceo-bot 2>/dev/null | grep -q "online"; then
    success "big-boss-ceo-bot is online"
    info "Watch the logs for the boot message: pm2 logs big-boss-ceo-bot --lines 20"
  else
    failure "Bot is not online after restart — check: pm2 logs big-boss-ceo-bot"
    exit 1
  fi
else
  warn "pm2 process 'big-boss-ceo-bot' not found — restart the bot manually"
fi

printf "\n"
success "Rotation complete."
warn "Reminder: the old secrets remain in git history — treat them as burned."
warn "If you have not already, also rotate anything else committed to the repo"
warn "(the gateway token in CLAUDE.md is exposed the same way)."
