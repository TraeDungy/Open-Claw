module.exports = {
  apps: [{
    name: 'big-boss-ceo-bot',
    script: '/root/big-boss-ceo-bot/bot.mjs',
    env: {
      BOT_TOKEN: '8647858953:AAE9RkyxZd2U7oMv2tlPtgcHUPjKBmHig_E',
      CHAT_ID: '6545893412',
      COMPANY_ID: '2f28832f-6750-4a2e-9f45-32ac3da9c458',
      CEO_AGENT_ID: '010acbc6-304f-4e92-a308-e005d5ea892e',
      PAPERCLIP_CLI: '/root/.npm/_npx/43414d9b790239bb/node_modules/.bin/paperclipai',
      LITELLM_BASE_URL: 'http://127.0.0.1:9000/v1',
      LITELLM_API_KEY: 'sk-openclaw-internal-b6b867c23f470cbaf39562683425cf87',
      LITELLM_MODEL: 'llm-kimi',
      POLL_INTERVAL_MS: '120000',
      CEO_LOOP_INTERVAL_MS: '900000',
      DIGEST_CRON: '0 9 * * *'
    }
  }]
}
