process.env.NTBA_FIX_319 = '1';
const TelegramBot = require('node-telegram-bot-api');

let _bot = null;

/**
 * Returns a TelegramBot instance in webhook (non-polling) mode.
 * On Vercel serverless, we create a new instance per invocation.
 */
function getBot(token) {
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }
  return new TelegramBot(token, {
    polling: false,
    request: { timeout: 30000 }
  });
}

module.exports = { getBot };
