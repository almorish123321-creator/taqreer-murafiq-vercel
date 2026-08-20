// In-memory logs (ephemeral on serverless)
const appLogs = [];

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    if (req.query.msg) {
      appLogs.push(`[${new Date().toISOString()}] CLIENT LOG: ${req.query.msg}`);
      if (appLogs.length > 50) appLogs.shift();
    }
    return res.status(200).json(appLogs);
  }
  res.status(405).json({ error: 'Method not allowed' });
};
