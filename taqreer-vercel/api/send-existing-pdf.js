const { getBot } = require('../lib/bot');
const { loadLocalSubscriptions } = require('../lib/db');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { chatId, reportId } = req.body;
    const data = await loadLocalSubscriptions();
    const userSub = data.subscriptions[chatId.toString()];
    if (!userSub || !userSub.reports) {
      return res.status(404).json({ success: false, error: 'User or reports not found' });
    }
    const report = userSub.reports.find(r => r.id === reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    if (!report.fileId) {
      return res.status(400).json({ success: false, error: 'No PDF generated for this report yet.' });
    }
    const bot = getBot(process.env.TELEGRAM_BOT_TOKEN);
    await bot.sendDocument(chatId, report.fileId);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending existing PDF:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
