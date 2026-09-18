const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// أزرار البوت
const keyboard = {
  reply_markup: {
    keyboard: [
      ['🔥 آخر الحسابات', '🔍 البحث عن حساب'],
      ['📋 طلب نشر حساب', '💎 شحن UC والألعاب'],
      ['⭐ تقييم الخدمة', '📞 التواصل مع الإدارة'],
      ['🎁 المسابقات والسحوبات']
    ],
    resize_keyboard: true,
    persistent: true
  }
};

// أمر البداية
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🔥 مرحبًا بك في بوت BRAND Libya

👇 اختر الخدمة التي تريدها من الأزرار بالأسفل`,
    keyboard
  );
});

// التعامل مع الأزرار
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text === '/start') return;

  // آخر الحسابات
  if (text === '🔥 آخر الحسابات') {
    bot.sendMessage(
      chatId,
      `🔥 آخر الحسابات:

لا توجد حسابات منشورة حاليًا.`,
      keyboard
    );
  }

  // البحث عن حساب
  else if (text === '🔍 البحث عن حساب') {
    bot.sendMessage(
      chatId,
      `🔍 أرسل اسم الحساب أو الـ ID الذي تريد البحث عنه.`,
      keyboard
    );
  }

  // طلب نشر حساب
  else if (text === '📋 طلب نشر حساب') {
    bot.sendMessage(
      chatId,
      `📋 طلب نشر حساب

لإضافة حساب للبيع، أرسل بيانات الحساب وصوره هنا.

📞 للتواصل مع الإدارة:
@ali_alzntane
@natoo_06`,
      keyboard
    );
  }

  // شحن UC
  else if (text === '💎 شحن UC والألعاب') {
    bot.sendMessage(
      chatId,
      `💎 خدمة شحن UC والألعاب متوفرة.

📞 للتفاصيل والتواصل:
@natoo_06`,
      keyboard
    );
  }

  // تقييم الخدمة
  else if (text === '⭐ تقييم الخدمة') {
    bot.sendMessage(
      chatId,
      `⭐ أرسل تقييمك للخدمة من 1 إلى 5، مع ملاحظتك إن وجدت.`,
      keyboard
    );
  }

  // التواصل مع الإدارة
  else if (text === '📞 التواصل مع الإدارة') {
    bot.sendMessage(
      chatId,
      `📞 للتواصل مع الإدارة:

@ali_alzntane
@natoo_06`,
      keyboard
    );
  }

  // المسابقات والسحوبات
  else if (text === '🎁 المسابقات والسحوبات') {
    bot.sendMessage(
      chatId,
      `🎁 لا توجد مسابقات أو سحوبات متاحة حاليًا.`,
      keyboard
    );
  }
});

console.log('Bot is running...');
