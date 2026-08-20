const https = require('https');

module.exports = async (req, res) => {
  try {
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const WEB_APP_URL = process.env.WEB_APP_URL;
    const WEB_APP_URL_CACHED = WEB_APP_URL + '?v=8';

    // Set webhook
    const setWebhook = () => new Promise((resolve, reject) => {
      const body = JSON.stringify({ url: `${WEB_APP_URL}/api/webhook/telegram` });
      const r = https.request({
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/setWebhook`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ ok: false }); } });
      });
      r.on('error', reject);
      r.write(body);
      r.end();
    });

    // Set menu button
    const setMenuButton = () => new Promise((resolve) => {
      const body = JSON.stringify({
        menu_button: { type: 'web_app', text: 'Open', web_app: { url: WEB_APP_URL_CACHED } }
      });
      const r = https.request({
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/setChatMenuButton`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ ok: false }); } });
      });
      r.on('error', resolve);
      r.write(body);
      r.end();
    });

    const [whResult, mbResult] = await Promise.all([setWebhook(), setMenuButton()]);

    res.status(200).json({
      success: true,
      webhook: whResult,
      menuButton: mbResult,
      webAppUrl: WEB_APP_URL_CACHED
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
