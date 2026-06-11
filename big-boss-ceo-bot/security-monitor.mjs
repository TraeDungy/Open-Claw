/**
 * Security monitor — watches for signs of a compromised bot token or
 * unauthorized access:
 *
 *   1. 409 polling conflicts — another process is polling Telegram with this
 *      bot token (the classic sign of a stolen token)
 *   2. A webhook set on the bot while we run in polling mode (hijack vector;
 *      auto-cleared, since polling can't work with a webhook anyway)
 *   3. Messages from chats other than the owner's
 *
 * Every event is logged; Telegram alerts are throttled/deduped.
 */

const CHAT_ID = process.env.CHAT_ID;
const WEBHOOK_CHECK_MS = 10 * 60 * 1000;
const CONFLICT_ALERT_THROTTLE_MS = 30 * 60 * 1000;

export function startSecurityMonitor(bot, sendFn) {
  let lastConflictAlert = 0;
  const reportedChats = new Set();

  // 1. Another client polling with this token → Telegram returns 409
  bot.on('polling_error', async (err) => {
    const msg = err?.message || String(err);
    if (!/409|conflict|terminated by other/i.test(msg)) return;
    console.error('[security] polling conflict — another client is using this bot token:', msg);
    const now = Date.now();
    if (now - lastConflictAlert < CONFLICT_ALERT_THROTTLE_MS) return;
    lastConflictAlert = now;
    await sendFn(
      '🚨 SECURITY: another process is polling Telegram with this bot token (409 conflict). ' +
      'If that is not you (a second bot instance), the token is compromised — ' +
      'rotate it via @BotFather and run scripts/rotate-secrets.sh on the VPS.'
    );
  });

  // 2. Messages from unknown chats (alert once per chat, log every message)
  bot.on('message', async (msg) => {
    const id = String(msg.chat.id);
    if (id === CHAT_ID) return;
    const from = msg.from?.username ? `@${msg.from.username}` : (msg.from?.first_name || 'unknown');
    console.warn(`[security] message from unknown chat ${id} (${from}): ${(msg.text || '(non-text)').slice(0, 100)}`);
    if (reportedChats.has(id)) return;
    reportedChats.add(id);
    await sendFn([
      '🚨 SECURITY: message from an unknown chat.',
      `Chat ID: ${id}`,
      `From: ${from}`,
      `Text: ${(msg.text || '(non-text)').slice(0, 120)}`,
      '',
      'Commands from unknown chats are blocked. If this keeps happening, rotate the bot token.',
    ].join('\n'));
  });

  // 3. Webhook hijack check — in polling mode no webhook should ever be set
  async function checkWebhook() {
    try {
      const info = await bot.getWebHookInfo();
      if (info?.url) {
        console.error('[security] webhook unexpectedly set:', info.url);
        await bot.deleteWebHook().catch(() => {});
        await sendFn(
          `🚨 SECURITY: a webhook was set on this bot (${info.url}) while it runs in polling mode. ` +
          'Someone with the token may have hijacked it. The webhook has been cleared — ' +
          'rotate the token via @BotFather and run scripts/rotate-secrets.sh.'
        );
      }
    } catch (err) {
      console.error('[security] webhook check failed:', err.message);
    }
  }
  setTimeout(checkWebhook, 15000);
  setInterval(checkWebhook, WEBHOOK_CHECK_MS);

  console.log('[security] monitor active (polling conflicts, webhook hijack, unknown chats)');
}
