const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🔥 مرحبًا بك في بوت BRAND Libya

اختر الخدمة التي تريدها:

🔥 آخر الحسابات
🔍 البحث عن حساب
📋 طلب نشر حساب
💎 شحن UC والألعاب
⭐ تقييم الخدمة
📞 التواصل مع الإدارة
🎁 المسابقات والسحوبات`
  );
});

console.log("Bot is running...");
