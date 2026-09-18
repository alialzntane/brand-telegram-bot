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

اختر الخدمة التي تريدها من الأزرار بالأسفل 👇`,
    keyboard
  );
});

// التعامل مع الأزرار
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text === '/start') return;

  if (text === '🔥 آخر الحسابات') {
    bot.sendMessage(
      chatId,
      '🔥 آخر الحسابات:\n\nلا توجد حسابات منشورة حاليًا.',
      keyboard
    );
  }

  else if (text === '🔍 البحث عن حساب') {
    bot.sendMessage(
      chatId,
      '🔍 أرسل اسم الحساب أو الـ ID الذي تريد البحث عنه.',
      keyboard
    );
  }

  else if (text === '📋 طلب نشر حساب') {
    bot.sendMessage(
      chatId,
      '📋 لإضافة حساب للبيع، أرسل بيانات الحساب وصوره هنا.',
      keyboard
    );
  }

  else if (text === '💎 شحن UC والألعاب') {
    bot.sendMessage(
      chatId,
      '💎 خدمة شحن UC والألعاب متوفرة.\n📞 للتفاصيل تواصل مع الإدارة.',
      keyboard
    );
  }

  else if (text === '⭐ تقييم الخدمة') {
    bot.sendMessage(
      chatId,
      '⭐ أرسل تقييمك للخدمة من 1 إلى 5، مع ملاحظتك إن وجدت.',
      keyboard
    );
  }

  else if (text === '📞 التواصل مع الإدارة') {
    bot.sendMessage(
      chatId,
      '📞 للتواصل مع الإدارة:\n@ali_alzntane',
      keyboard
    );
  }

  else if (text === '🎁 المسابقات والسحوبات') {
    bot.sendMessage(
      chatId,
      '🎁 لا توجد مسابقات أو سحوبات متاحة حاليًا.',
      keyboard
    );
  }
});

console.log('Bot is running...');
