const { findSubscription } = require('../../../lib/db');

module.exports = async (req, res) => {
  try {
    const { chatId } = req.query;
    const username = req.query.username;
    const user = await findSubscription(chatId, username);
    res.status(200).json({ success: true, user, reports: user.reports || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
