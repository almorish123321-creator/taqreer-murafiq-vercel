process.env.NTBA_FIX_319 = '1';

const { getBot } = require('../../lib/bot');
const { findSubscription, addSubscriptionByUsername, loadLocalSubscriptions, saveLocalSubscriptions } = require('../../lib/db');
const https = require('https');

// Configuration
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;
const WEB_APP_URL_CACHED = WEB_APP_URL ? WEB_APP_URL + '?v=8' : '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '';



module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bot = getBot(TOKEN);

    // ---- Register ALL bot event handlers ----

    // Helper: Configure Chat Menu Button
    const configureChatMenuButton = async (targetChatId = null) => {
      try {
        const sendReq = (chatIdVal = null) => {
          const bodyObj = {
            menu_button: {
              type: 'web_app',
              text: 'Open',
              web_app: { url: WEB_APP_URL_CACHED }
            }
          };
          if (chatIdVal) {
            bodyObj.chat_id = chatIdVal.toString();
          }
          const payload = JSON.stringify(bodyObj);
          return new Promise((resolve) => {
            const r = https.request({
              hostname: 'api.telegram.org',
              path: `/bot${TOKEN}/setChatMenuButton`,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
              }
            }, (resp) => {
              let body = '';
              resp.on('data', chunk => body += chunk);
              resp.on('end', () => { try { JSON.parse(body); } catch {} resolve(); });
            });
            r.on('error', resolve);
            r.write(payload);
            r.end();
          });
        };
        if (targetChatId) await sendReq(targetChatId);
        await sendReq(null);
      } catch (e) {
        console.warn('Could not set ChatMenuButton:', e.message);
      }
    };

    // Helper: Send My Status Message
    const sendMyStatusMessage = async (chatId, username) => {
      const user = await findSubscription(chatId, username);
      const daysLeft = user.subscriptionDays || 0;
      const statusText = daysLeft > 0 ? `فعال (${daysLeft} يوم متبقي)` : 'غير فعال (0 يوم)';
      const subStatusIcon = daysLeft > 0 ? '✅' : '❌';
      const statusMsg = `📊 حالة حسابك في منصة صحة:

${subStatusIcon} حالة الاشتراك: ${statusText}
⏳ الأيام المتبقية: ${daysLeft} يوم

🌑 رصيد النقاط: ${user.points || 0} نقطة
• تكلفة إنشاء التقرير: 5 نقاط

💡 يمكنك استخدام النقاط لإنشاء التقارير دون الحاجة لاشتراك شهري، أو الاشتراك بالباقة اللامحدودة!`;
      await bot.sendMessage(chatId, statusMsg, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏥 فتح التطبيق (إنشاء تقرير)', web_app: { url: WEB_APP_URL_CACHED } }],
            [{ text: '🛒 متجر الباقات', callback_data: 'packages' }, { text: '🔗 برنامج الإحالات', callback_data: 'referrals' }]
          ]
        }
      });
    };

    // Helper: Send Referral Message
    const sendReferralMessage = async (chatId, username) => {
      const user = await findSubscription(chatId, username);
      const botInfo = await bot.getMe();
      const botUsername = botInfo.username || 'zakmmm_1211_bot';
      const referralLink = `https://t.me/${botUsername}?start=ref_${chatId}`;
      const data = await loadLocalSubscriptions();
      let referralsCount = 0;
      for (const sub of Object.values(data.subscriptions)) {
        if (sub.referredBy === chatId) referralsCount++;
      }
      const referralMsg = `🔗 نظام الإحالات والمكافآت (Referral System)

شارك رابط إحالتك الفريد مع أصدقائك، واربح نقاطاً إضافية لإنشاء التقارير في كل مرة يقومون فيها بالاشتراك!

🔗 رابط إحالتك الخاص بك:
${referralLink}

📊 إحصائيات إحالتك:
• عدد الأشخاص المسجلين من خلالك: ${referralsCount} شخص
• رصيدك الحالي من نقاط الإحالة: ${user.referralPoints || 0} نقطة

🎁 كيف تربح النقاط؟
عندما يقوم شخص قمت بإحالته بأي عملية شراء، ستحصل أنت على المكافآت التالية تلقائياً في كل مرة يشتري فيها:
• خطة Month 1 (100.0 ريال) -> تربح 50 نقطة (10 تقارير مجاناً)
• خطة Months 3 (300.0 ريال) -> تربح 150 نقطة (30 تقرير مجاناً)
• خطة Months 6 (500.0 ريال) -> تربح 300 نقطة (60 تقرير مجاناً)
• خطة Year 1 (800.0 ريال) -> تربح 600 نقطة (120 تقرير مجاناً)
• خطة حزمة النقاط الأساسية (30 نقطة) (20.0 ريال) -> تربح 10 نقاط (2 تقرير مجاناً)
• خطة حزمة النقاط الموصى بها (100 نقطة) (50.0 ريال) -> تربح 25 نقاط (5 تقارير مجاناً)
• خطة حزمة النقاط المتقدمة (200 نقطة) (80.0 ريال) -> تربح 50 نقاط (10 تقارير مجاناً)

💡 ملاحظة: لا توجد صلاحية لانتهاء النقاط، ويمكنك استخدامها في أي وقت!`;
      await bot.sendMessage(chatId, referralMsg);
    };

    // Helper: Send Packages Message
    const sendPackagesMessage = async (chatId) => {
      const packagesMsg = `🛒 متجر الباقات والاشتراكات لإنشاء التقارير

شحن وتفعيل الباقات يتم يدوياً عبر الدعم الفني بشكل سهل وآمن وسريع.

⭐ حزم النقاط (بدون صلاحية انتهاء):
• حزمة النقاط الأساسية (30 نقطة): 30 نقطة -> السعر: 20.0 ريال سعودي
• حزمة النقاط الموصى بها (100 نقطة): 100 نقطة -> السعر: 50.0 ريال سعودي
• حزمة النقاط المتقدمة (200 نقطة): 200 نقطة -> السعر: 80.0 ريال سعودي

📅 الاشتراكات اللامحدودة (غير محدودة التقارير):
• خطة 30 يوم -> السعر: 100.0 ريال سعودي
• خطة 90 يوم -> السعر: 300.0 ريال سعودي
• خطة 180 يوم -> السعر: 500.0 ريال سعودي
• خطة 365 يوم -> السعر: 800.0 ريال سعودي

👇 اضغط على الباقة التي تريدها للتواصل وتفعيلها فوراً:`;
      const ownerLink = `https://t.me/${ADMIN_USERNAME}`;
      const inlineKeyboard = [
        [{ text: '📅 خطة 30 يوم (100.0 ريال) ↗️', url: `${ownerLink}?text=${encodeURIComponent('مرحباً، أود تفعيل باقة: خطة 30 يوم (100 ريال) لحسابي.')}` }],
        [{ text: '📅 خطة 90 يوم (300.0 ريال) ↗️', url: `${ownerLink}?text=${encodeURIComponent('مرحباً، أود تفعيل باقة: خطة 90 يوم (300 ريال) لحسابي.')}` }],
        [{ text: '📅 خطة 180 يوم (500.0 ريال) ↗️', url: `${ownerLink}?text=${encodeURIComponent('مرحباً، أود تفعيل باقة: خطة 180 يوم (500 ريال) لحسابي.')}` }],
        [{ text: '📅 خطة 365 يوم (800.0 ريال) ↗️', url: `${ownerLink}?text=${encodeURIComponent('مرحباً، أود تفعيل باقة: خطة 365 يوم (800 ريال) لحسابي.')}` }],
        [{ text: '⭐ حزمة النقاط الأساسية (30 نقطة) (20.0 ريال) ↗️', url: `${ownerLink}?text=${encodeURIComponent('مرحباً، أود تفعيل باقة: حزمة النقاط الأساسية 30 نقطة (20 ريال) لحسابي.')}` }],
        [{ text: '⭐ حزمة النقاط الموصى بها (100 نقطة) (50.0 ريال) ↗️', url: `${ownerLink}?text=${encodeURIComponent('مرحباً، أود تفعيل باقة: حزمة النقاط الموصى بها 100 نقطة (50 ريال) لحسابي.')}` }],
        [{ text: '⭐ حزمة النقاط المتقدمة (200 نقطة) (80.0 ريال) ↗️', url: `${ownerLink}?text=${encodeURIComponent('مرحباً، أود تفعيل باقة: حزمة النقاط المتقدمة 200 نقطة (80 ريال) لحسابي.')}` }]
      ];
      await bot.sendMessage(chatId, packagesMsg, { reply_markup: { inline_keyboard: inlineKeyboard } });
    };

    // ---- /start command ----
    bot.onText(/^\/start(\/verify)?(@\w+)?(\s.*)?$/i, async (msg) => {
      const chatId = msg.chat.id.toString();
      const username = msg.from?.username;
      const displayName = msg.from?.first_name || (username ? `${username}` : 'مستخدم');
      const text = msg.text || '';
      const refMatch = text.match(/\/start\s+ref_(\d+)/i);
      let referrerId = refMatch ? refMatch[1] : null;

      const user = await findSubscription(chatId, username || displayName, referrerId);
      configureChatMenuButton(chatId).catch(err => console.warn('Menu button configure notice:', err.message));

      await bot.sendMessage(chatId, `⚡ تم تفعيل قائمة الوصول السريع أسفل الشاشة!`, {
        reply_markup: {
          keyboard: [
            [{ text: '🏥 فتح التطبيق (إنشاء تقرير)', web_app: { url: WEB_APP_URL_CACHED } }],
            [{ text: '🔗 برنامج الإحالات' }, { text: '🛒 متجر الباقات' }],
            [{ text: '🔗 كسب نقاط (الإحالات)' }],
            [{ text: '📊 حالة حسابي' }]
          ],
          resize_keyboard: true
        }
      });

      const daysLeft = user.subscriptionDays || 0;
      const statusIcon = daysLeft > 0 ? '✅' : '❌';
      const statusText = daysLeft > 0 ? `فعال - متبقي ${daysLeft} يوم` : `غير فعال - متبقي 0 يوم`;
      const welcomeText = `👋 أهلاً بعودتك ${displayName}!

${statusIcon} اشتراكك ${statusText}
🌑 رصيدك الحالي من النقاط: ${user.points || 0} نقطة
• تكلفة التقرير الواحد: 5 نقاط.

💡 يمكنك الاشتراك بالباقة الشهرية لإنشاء غير محدود، أو شحن النقاط للشراء بالتقرير!

اضغط على الأزرار أدناه لفتح التطبيق أو التصفح ⚡`;

      await bot.sendMessage(chatId, welcomeText, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏥 فتح التطبيق مباشرة (إنشاء تقرير)', web_app: { url: WEB_APP_URL_CACHED } }],
            [{ text: 'إصدار تقرير 📄', web_app: { url: WEB_APP_URL_CACHED } }],
            [{ text: 'دعوة صديق 🎁', callback_data: 'referrals' }],
            [{ text: 'باقات الاشتراك 💎', callback_data: 'packages' }],
            [{ text: 'حالة حسابي 📊', callback_data: 'mystatus' }]
          ]
        }
      });
    });

    // ---- /help command ----
    bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await bot.sendMessage(chatId, `مرحباً!\nاستخدم /start للبدء.\nإذا كنت مسؤولاً، يمكنك استخدام /addsub @username <days> لتفعيل الاشتراك.`);
    });

    // ---- /buy command ----
    bot.onText(/\/buy/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await sendPackagesMessage(chatId);
    });

    // ---- /admin command ----
    bot.onText(/\/admin/, async (msg) => {
      const chatId = msg.chat.id.toString();
      const username = msg.from?.username;
      if (!username || username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
        await bot.sendMessage(chatId, 'ليس لديك صلاحية المسؤول.');
        return;
      }
      await bot.sendMessage(chatId, `أوامر المسؤول:\n/addsub @username <days> - تفعيل أو تمديد اشتراك للمستخدم\n/mysub - عرض حالة الاشتراك الخاصة بك`);
    });

    // ---- /addsub command ----
    bot.onText(/\/addsub\s+@?(\w+)\s+(\d+)/i, async (msg, match) => {
      const chatId = msg.chat.id.toString();
      const username = msg.from?.username;
      if (!username || username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
        await bot.sendMessage(chatId, 'ليس لديك صلاحية المسؤول لتنفيذ هذا الأمر.');
        return;
      }
      const targetUsername = match[1];
      const days = parseInt(match[2], 10);
      if (!targetUsername || isNaN(days) || days <= 0) {
        await bot.sendMessage(chatId, 'يرجى استخدام الصيغة الصحيحة: /addsub @username 30');
        return;
      }
      const result = await addSubscriptionByUsername(targetUsername, days, bot);
      await bot.sendMessage(chatId, `✅ تم تفعيل الاشتراك بنجاح للمستخدم @${targetUsername} لمدة ${days} يوم.`);
      if (result.chatId && !result.chatId.startsWith('pending_')) {
        try {
          await bot.sendMessage(result.chatId, `🎉 تم تفعيل اشتراكك لمدة ${days} يوم من قبل المسؤول! يمكنك الآن فتح التطبيق عبر /start.`);
        } catch (e) {
          console.warn('Could not send notification to user:', e.message);
        }
      }
    });

    // ---- /mysub command ----
    bot.onText(/\/mysub/, async (msg) => {
      const chatId = msg.chat.id.toString();
      const username = msg.from?.username || msg.from?.first_name || 'مستخدم';
      const user = await findSubscription(chatId, username);
      const status = user.subscriptionDays > 0 ? `اشتراكك نشط، متبقي ${user.subscriptionDays} يوم.` : 'اشتراكك غير نشط أو انتهى. الرجاء التواصل لتفعيل الاشتراك.';
      await bot.sendMessage(chatId, status);
    });

    // ---- General message handler ----
    bot.on('message', async (msg) => {
      if (!msg.text) return;
      if (/^\/start/i.test(msg.text)) return;
      if (/^\/mysub/i.test(msg.text)) return;
      if (/^\/admin/i.test(msg.text)) return;
      if (/^\/addsub/i.test(msg.text)) return;
      if (/^\/help/i.test(msg.text)) return;
      if (/^\/buy/i.test(msg.text)) return;

      const chatId = msg.chat.id.toString();
      const username = msg.from?.username || msg.from?.first_name || 'مستخدم';

      if (msg.text === '📊 حالة حسابي') {
        const user = await findSubscription(chatId, username);
        const daysLeft = user.subscriptionDays || 0;
        const statusText = daysLeft > 0 ? 'فعال' : 'غير فعال';
        const subStatusIcon = daysLeft > 0 ? '✅' : '❌';
        const statusMsg = `👤 حالة حسابك:\n
${subStatusIcon} الاشتراك الشهري: ${statusText}\n📅 متبقي: ${daysLeft} يوم\n
🌑 رصيد النقاط: ${user.points || 0} نقطة\n• تكلفة التقرير الواحد: 5 نقاط.\n
💡 يمكنك استخدام النقاط لإنشاء التقارير بدون اشتراك شهري، أو تفعيل اشتراك غير محدود عبر الأمر /buy`;
        await bot.sendMessage(chatId, statusMsg);
        return;
      }

      if (msg.text === '🔗 كسب نقاط (الإحالات)') {
        await sendReferralMessage(chatId, username);
        return;
      }

      if (msg.text === '🛒 متجر الباقات') {
        await sendPackagesMessage(chatId);
        return;
      }

      console.log(`Telegram bot message received: "${msg.text}" from ${msg.from?.username || msg.from?.first_name}`);
    });

    // ---- Photo handler ----
    bot.on('photo', async (msg) => {
      const chatId = msg.chat.id.toString();
      const photo = msg.photo[msg.photo.length - 1];
      const fileId = photo.file_id;
      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: "تعيين كشعار وزارة الصحة (MoH)", callback_data: `setlogo_moh_${fileId}` }],
          [{ text: "تعيين كشعار المستشفى", callback_data: `setlogo_hosp_${fileId}` }],
          [{ text: "إلغاء", callback_data: "cancel_logo" }]
        ]
      };
      await bot.sendMessage(chatId, "ماذا تريد أن تفعل بهذه الصورة؟", { reply_markup: inlineKeyboard });
    });

    // ---- Callback Query handlers ----
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id.toString();
      const username = query.from?.username || query.from?.first_name || 'مستخدم';
      const data = query.data;

      if (data === 'cancel_logo') {
        await bot.deleteMessage(chatId, query.message.message_id);
        return;
      }

      if (data === 'referrals') {
        await sendReferralMessage(chatId, username);
        await bot.answerCallbackQuery(query.id);
        return;
      }

      if (data === 'packages') {
        await sendPackagesMessage(chatId);
        await bot.answerCallbackQuery(query.id);
        return;
      }

      if (data === 'mystatus') {
        await sendMyStatusMessage(chatId, username);
        await bot.answerCallbackQuery(query.id);
        return;
      }

      if (data.startsWith('setlogo_')) {
        const parts = data.split('_');
        const type = parts[1];
        const fileId = parts.slice(2).join('_');
        try {
          const fileLink = await bot.getFileLink(fileId);
          const subs = await loadLocalSubscriptions();
          if (!subs.subscriptions[chatId]) {
            subs.subscriptions[chatId] = { points: 0, subscriptionDays: 0, reports: [] };
          }
          if (type === 'moh') {
            subs.subscriptions[chatId].mohLogo = fileLink;
            await bot.answerCallbackQuery(query.id, { text: "تم تعيين شعار وزارة الصحة بنجاح ✅" });
          } else if (type === 'hosp') {
            subs.subscriptions[chatId].hospitalLogo = fileLink;
            await bot.answerCallbackQuery(query.id, { text: "تم تعيين شعار المستشفى بنجاح ✅" });
          }
          await saveLocalSubscriptions(subs);
          await bot.deleteMessage(chatId, query.message.message_id);
          await bot.sendMessage(chatId, "تم حفظ الشعار في حسابك بنجاح! سيتم استخدامه في التقارير القادمة. ✅\nيرجى إعادة فتح التطبيق لتحديث الشعارات.");
        } catch (e) {
          console.error(e);
          await bot.answerCallbackQuery(query.id, { text: "حدث خطأ أثناء حفظ الشعار ❌" });
        }
      }
    });

    // ---- Process the incoming update ----
    bot.processUpdate(req.body);

    // Return 200 immediately
    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
};
