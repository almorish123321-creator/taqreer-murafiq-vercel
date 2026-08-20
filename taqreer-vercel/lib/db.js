const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

// On Vercel, use /tmp for writable storage. Fall back to public/data for initial read.
const DATA_DIR = '/tmp/taqreer-data';
const subscriptionsPath = path.join(DATA_DIR, 'subscriptions.json');
const FALLBACK_PATH = path.join(process.cwd(), 'public', 'data', 'subscriptions.json');

// Ensure /tmp data dir exists
if (!fsSync.existsSync(DATA_DIR)) {
  fsSync.mkdirSync(DATA_DIR, { recursive: true });
}

// On cold start, seed from fallback if /tmp is empty
async function ensureData() {
  try {
    await fs.access(subscriptionsPath);
  } catch {
    try {
      const fallback = await fs.readFile(FALLBACK_PATH, 'utf-8');
      await fs.writeFile(subscriptionsPath, fallback, 'utf-8');
    } catch {
      await fs.writeFile(subscriptionsPath, JSON.stringify({ subscriptions: {} }, null, 2), 'utf-8');
    }
  }
}

const getDaysRemaining = (expiresAt) => {
  if (!expiresAt) return 0;
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const normalizeSubscription = (user) => {
  if (!user) return null;
  const now = new Date();
  if (user.subscriptionDays > 0 && !user.subscriptionExpires) {
    const expires = new Date(now.getTime() + user.subscriptionDays * 24 * 60 * 60 * 1000);
    user.subscriptionExpires = expires.toISOString();
  }
  user.subscriptionDays = getDaysRemaining(user.subscriptionExpires);
  return user;
};

const loadLocalSubscriptions = async () => {
  await ensureData();
  try {
    const data = await fs.readFile(subscriptionsPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { subscriptions: {} };
  }
};

const saveLocalSubscriptions = async (data) => {
  try {
    await fs.writeFile(subscriptionsPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing subscriptions.json:', e.message);
  }
};

const findSubscription = async (chatId, username, referrerId = null) => {
  const data = await loadLocalSubscriptions();
  const chatIdStr = chatId.toString();
  const cleanedUsername = username ? username.replace(/^@/, '').toLowerCase() : null;

  let userSub = null;
  let foundChatId = chatIdStr;

  if (cleanedUsername) {
    for (const [cid, sub] of Object.entries(data.subscriptions)) {
      if (sub.username && sub.username.toLowerCase() === cleanedUsername) {
        userSub = sub;
        foundChatId = cid;
        break;
      }
    }
  }

  if (!userSub && data.subscriptions[chatIdStr]) {
    userSub = data.subscriptions[chatIdStr];
  }

  if (userSub) {
    userSub = normalizeSubscription(userSub);
    if (cleanedUsername && userSub.username !== cleanedUsername) {
      userSub.username = cleanedUsername;
    }
    if (foundChatId !== chatIdStr) {
      delete data.subscriptions[foundChatId];
      data.subscriptions[chatIdStr] = userSub;
    }
    data.subscriptions[chatIdStr].updatedAt = new Date().toISOString();
    await saveLocalSubscriptions(data);
  } else {
    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    userSub = {
      points: 0,
      subscriptionDays: 365,
      subscriptionExpires: expires.toISOString(),
      username: cleanedUsername,
      reports: [],
      referredBy: referrerId ? referrerId.toString() : null,
      referralsCount: 0,
      referralPoints: 0,
      updatedAt: now.toISOString()
    };
    if (referrerId) {
      const rId = referrerId.toString();
      if (data.subscriptions[rId]) {
        data.subscriptions[rId].referralsCount = (data.subscriptions[rId].referralsCount || 0) + 1;
        data.subscriptions[rId].updatedAt = now.toISOString();
      }
    }
    data.subscriptions[chatIdStr] = userSub;
    await saveLocalSubscriptions(data);
  }

  return { chatId: chatIdStr, ...userSub };
};

const addSubscriptionByUsername = async (username, days, bot) => {
  const data = await loadLocalSubscriptions();
  const cleaned = username.replace(/^@/, '').toLowerCase();

  let foundChatId = null;
  let userSub = null;

  for (const [cid, sub] of Object.entries(data.subscriptions)) {
    if (sub.username && sub.username.toLowerCase() === cleaned) {
      userSub = sub;
      foundChatId = cid;
      break;
    }
  }

  const now = new Date();
  let baseDate = now;

  if (userSub) {
    userSub = normalizeSubscription(userSub);
    if (userSub.subscriptionExpires) {
      const currentExpires = new Date(userSub.subscriptionExpires);
      if (currentExpires > now) {
        baseDate = currentExpires;
      }
    }
  } else {
    userSub = {
      points: 0,
      subscriptionDays: 0,
      subscriptionExpires: null,
      username: cleaned,
      reports: [],
      referredBy: null,
      referralsCount: 0,
      referralPoints: 0,
      updatedAt: now.toISOString()
    };
    foundChatId = `pending_${cleaned}`;
  }

  const expires = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
  userSub.subscriptionExpires = expires.toISOString();
  userSub.subscriptionDays = getDaysRemaining(userSub.subscriptionExpires);
  userSub.updatedAt = now.toISOString();

  // Referral rewards
  if (userSub.referredBy && !userSub.referralAwarded) {
    const referrerId = userSub.referredBy.toString();
    if (data.subscriptions[referrerId]) {
      let rewardPoints = 0;
      if (days === 30) rewardPoints = 50;
      else if (days === 90) rewardPoints = 150;
      else if (days === 180) rewardPoints = 300;
      else if (days >= 365) rewardPoints = 600;

      if (rewardPoints > 0 && bot) {
        data.subscriptions[referrerId].referralPoints = (data.subscriptions[referrerId].referralPoints || 0) + rewardPoints;
        data.subscriptions[referrerId].points = (data.subscriptions[referrerId].points || 0) + rewardPoints;
        data.subscriptions[referrerId].updatedAt = now.toISOString();
        userSub.referralAwarded = true;

        try {
          await bot.sendMessage(referrerId, `\uD83C\uDF81 لقد حصلت على ${rewardPoints} نقطة مجانية كمكافأة لأن المستخدم @${username} الذي قمت بدعوته قام بالاشتراك!`);
        } catch (e) {
          console.warn('Could not notify referrer:', e.message);
        }
      }
    }
  }

  data.subscriptions[foundChatId] = userSub;
  await saveLocalSubscriptions(data);

  return { chatId: foundChatId, ...userSub };
};

module.exports = {
  getDaysRemaining,
  normalizeSubscription,
  loadLocalSubscriptions,
  saveLocalSubscriptions,
  findSubscription,
  addSubscriptionByUsername,
  ensureData,
  subscriptionsPath
};
