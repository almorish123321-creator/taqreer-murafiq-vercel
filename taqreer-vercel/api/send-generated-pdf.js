const { getBot } = require('../lib/bot');
const { loadLocalSubscriptions, saveLocalSubscriptions } = require('../lib/db');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { chatId, pdfBase64, filename, reportId } = req.body;
    if (!chatId || !pdfBase64) return res.status(400).json({ success: false, error: 'Missing data' });

    const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',').pop() : pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    const bot = getBot(process.env.TELEGRAM_BOT_TOKEN);
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '';

    const message = await bot.sendDocument(chatId, pdfBuffer, {
      caption: 'تم إصدار التقرير بنجاح ✅'
    }, {
      filename: filename || 'sickLeaves.pdf',
      contentType: 'application/pdf'
    });

    const fileId = message.document?.file_id;

    if (fileId && reportId) {
      const data = await loadLocalSubscriptions();
      const userSub = data.subscriptions[chatId.toString()];
      if (userSub && userSub.reports) {
        const report = userSub.reports.find(r => r.id === reportId);
        if (report) {
          report.fileId = fileId;
          userSub.updatedAt = new Date().toISOString();
          await saveLocalSubscriptions(data);
        }
      }
      if (CHANNEL_ID) {
        try { await bot.sendDocument(CHANNEL_ID, fileId); } catch (err) { console.warn('Channel forward failed:', err.message); }
      }
    }

    res.status(200).json({ success: true, fileId });
  } catch (err) {
    console.error('Error sending generated PDF:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
