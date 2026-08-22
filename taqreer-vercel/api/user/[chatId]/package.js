const { loadLocalSubscriptions, saveLocalSubscriptions, normalizeSubscription, getDaysRemaining } = require('../../../lib/db');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { chatId } = req.query;
    const { points, subscriptionDays } = req.body;

    const data = await loadLocalSubscriptions();
    const chatIdStr = chatId.toString();

    if (!data.subscriptions[chatIdStr]) {
      data.subscriptions[chatIdStr] = {
        points: 0, subscriptionDays: 0, subscriptionExpires: null,
        username: null, reports: [], updatedAt: new Date().toISOString()
      };
    }

    const userSub = data.subscriptions[chatIdStr];
    const normalized = normalizeSubscription(userSub);

    if (subscriptionDays > 0) {
      const now = new Date();
      const baseDate = normalized.subscriptionExpires ? new Date(normalized.subscriptionExpires) : now;
      const start = baseDate > now ? baseDate : now;
      const expires = new Date(start.getTime() + subscriptionDays * 24 * 60 * 60 * 1000);
      normalized.subscriptionExpires = expires.toISOString();
      normalized.subscriptionDays = getDaysRemaining(normalized.subscriptionExpires);
    }

    normalized.points = (normalized.points || 0) + (points || 0);
    normalized.updatedAt = new Date().toISOString();
    data.subscriptions[chatIdStr] = normalized;

    await saveLocalSubscriptions(data);
    res.status(200).json({ success: true, points: normalized.points, subscriptionDays: normalized.subscriptionDays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
