const { loadLocalSubscriptions } = require('../lib/db');

module.exports = async (req, res) => {
  try {
    const { id, nid } = req.query;
    const data = await loadLocalSubscriptions();
    let foundReport = null;
    for (const user of Object.values(data.subscriptions)) {
      if (user.reports) {
        const report = user.reports.find(r => r.id === id && r.nationalId === nid);
        if (report) { foundReport = report; break; }
      }
    }
    if (foundReport) {
      res.status(200).json({ success: true, report: foundReport });
    } else {
      res.status(200).json({ success: false, error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
