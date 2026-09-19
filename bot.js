const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const CHANNEL_USERNAME = 'Pubg_Libya_Store';

// تخزين الحسابات التي تصل للبوت
const accounts = [];

let nextAccountNumber = 1;

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

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🔥 مرحبًا بك في بوت BRAND Libya

👇 اختر الخدمة التي تريدها من الأزرار بالأسفل`,
    keyboard
  );
});

// استقبال منشورات القناة
bot.on('channel_post', async (msg) => {
  try {
    if (!msg.chat.username) return;

    if (msg.chat.username.toLowerCase() !== CHANNEL_USERNAME.toLowerCase()) {
      return;
    }

    const text = msg.text || msg.caption || '';

    // نتأكد أن المنشور خاص بحساب PUBG
    if (!text.includes('ببجي') && !text.includes('بـبـجي')) {
      return;
    }

    // رقم تلقائي
    const number = String(nextAccountNumber).padStart(3, '0');
    const accountNumber = `#${number}`;

    const account = {
      number: accountNumber,
      messageId: msg.message_id,
      text: text,
      date: Date.now()
    };

    accounts.push(account);

    nextAccountNumber++;

    console.log(`تم حفظ الحساب ${accountNumber}`);

    // إضافة رقم الحساب تلقائيًا للمنشور
    if (!text.includes('🧾 رقم الحساب:')) {
      const newText =
        `🧾 رقم الحساب: ${accountNumber}\n\n` +
        text;

      try {
        if (msg.caption !== undefined) {
          await bot.editMessageCaption(newText, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
          });
        } else {
          await bot.editMessageText(newText, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
          });
        }
      } catch (error) {
        console.log('تعذر إضافة الرقم للمنشور:', error.message);
      }
    }

  } catch (error) {
    console.log('خطأ في منشور القناة:', error.message);
  }
});

// التعامل مع رسائل المستخدمين
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text === '/start') return;

  // آخر الحسابات
  if (text === '🔥 آخر الحسابات') {

    if (accounts.length === 0) {
      return bot.sendMessage(
        chatId,
        `🔥 آخر الحسابات:

لا توجد حسابات منشورة بعد تشغيل البوت.`,
        keyboard
      );
    }

    const latest = accounts.slice(-5).reverse();

    let response = `🔥 آخر الحسابات:\n\n`;

    latest.forEach((account) => {
      response += `🧾 رقم الحساب: ${account.number}\n`;
      response += `${account.text}\n`;
      response += `━━━━━━━━━━━━━━\n\n`;
    });

    return bot.sendMessage(chatId, response, keyboard);
  }

  // بدء البحث
  if (text === '🔍 البحث عن حساب') {
    return bot.sendMessage(
      chatId,
      `🔍 أرسل رقم الحساب أو الاسم الذي تريد البحث عنه.

مثال:
001
أو
#001`,
      keyboard
    );
  }

  // البحث
  if (
    !text.startsWith('🔥') &&
    !text.startsWith('📋') &&
    !text.startsWith('💎') &&
    !text.startsWith('⭐') &&
    !text.startsWith('📞') &&
    !text.startsWith('🎁')
  ) {

    const search = text.trim().toLowerCase();

    const results = accounts.filter((account) => {
      return (
        account.number.toLowerCase().includes(search) ||
        account.text.toLowerCase().includes(search)
      );
    });

    if (results.length === 0) {
      return bot.sendMessage(
        chatId,
        `❌ لم يتم العثور على حساب مطابق.

جرّب رقم حساب مثل:
#001`,
        keyboard
      );
    }

    let response = `🔎 نتائج البحث: ${results.length}\n\n`;

    results.forEach((account) => {
      response += `🧾 رقم الحساب: ${account.number}\n`;
      response += `${account.text}\n`;
      response += `━━━━━━━━━━━━━━\n\n`;
    });

    return bot.sendMessage(chatId, response, keyboard);
  }

  // طلب نشر حساب
  if (text === '📋 طلب نشر حساب') {
    return bot.sendMessage(
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
  if (text === '💎 شحن UC والألعاب') {
    return bot.sendMessage(
      chatId,
      `💎 خدمة شحن UC والألعاب متوفرة.

📞 للتفاصيل والتواصل:
@natoo_06`,
      keyboard
    );
  }

  // تقييم
  if (text === '⭐ تقييم الخدمة') {
    return bot.sendMessage(
      chatId,
      `⭐ أرسل تقييمك للخدمة من 1 إلى 5، مع ملاحظتك إن وجدت.`,
      keyboard
    );
  }

  // التواصل
  if (text === '📞 التواصل مع الإدارة') {
    return bot.sendMessage(
      chatId,
      `📞 للتواصل
