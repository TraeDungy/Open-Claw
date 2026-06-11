// Secrets live in /root/big-boss-ceo-bot/.env (loaded by env.mjs) — never
// commit them here. See .env.example for the required keys.
module.exports = {
  apps: [{
    name: 'big-boss-ceo-bot',
    script: '/root/big-boss-ceo-bot/bot.mjs',
    env: {
      POLL_INTERVAL_MS: '120000',
      CEO_LOOP_INTERVAL_MS: '900000',
      DIGEST_CRON: '0 9 * * *',
    },
  }],
};
