const { loadLocalSubscriptions, saveLocalSubscriptions, normalizeSubscription, findSubscription } = require('../../lib/db');

// Handles:
// POST /api/report/:chatId
// DELETE /api/report/:chatId/:id
module.exports = async (req, res) => {
  try {
    const slug = req.query.slug; // slug is an array of path segments
    const chatId = slug[0];
    const id = slug[1] || null;
    const method = req.method;

    if (method === 'POST') {
      const reportData = req.body.report;
      const data = await loadLocalSubscriptions();
      const chatIdStr = chatId.toString();

      if (!data.subscriptions[chatIdStr]) {
        await findSubscription(chatIdStr, null);
      }

      const data2 = await loadLocalSubscriptions();
      const userSub = data2.subscriptions[chatIdStr];
      const normalized = normalizeSubscription(userSub);

      if (normalized.subscriptionDays <= 0) {
        return res.status(403).json({ success: false, error: 'Subscription required' });
      }

      if (!userSub.reports) userSub.reports = [];
      const index = userSub.reports.findIndex(r => r.id === reportData.id);
      if (index >= 0) {
        userSub.reports[index] = reportData;
      } else {
        userSub.reports.push(reportData);
      }
      userSub.updatedAt = new Date().toISOString();
      await saveLocalSubscriptions(data2);
      return res.status(200).json({ success: true });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'Report ID required' });
      const data = await loadLocalSubscriptions();
      const chatIdStr = chatId.toString();

      if (data.subscriptions[chatIdStr] && data.subscriptions[chatIdStr].reports) {
        data.subscriptions[chatIdStr].reports = data.subscriptions[chatIdStr].reports.filter(r => r.id !== id);
        data.subscriptions[chatIdStr].updatedAt = new Date().toISOString();
        await saveLocalSubscriptions(data);
        return res.status(200).json({ success: true });
      }
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
