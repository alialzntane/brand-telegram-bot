const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ BOT_TOKEN غير موجود');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const CHANNEL_USERNAME = 'Pubg_Libya_Store';

// تخزين الحسابات التي تصل للبوت
const accounts = [];

let nextAccountNumber = 1;

// أزرار البوت الرئيسية
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

// ========================================
// /start
// ========================================

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🔥 مرحبًا بك في بوت BRAND Libya

👇 اختر الخدمة التي تريدها من الأزرار بالأسفل`,
    keyboard
  );
});

// ========================================
// إضافة رقم للحساب
// ========================================

function createAccountNumber() {
  const number = String(nextAccountNumber).padStart(3, '0');
  return `#${number}`;
}

// ========================================
// البحث عن حساب بالرقم
// ========================================

function findAccountByNumber(input) {
  if (!input) return null;

  let search = String(input).trim().toLowerCase();

  // يقبل:
  // 001
  // #001
  // 1
  // #1

  search = search.replace('#', '');

  const number = parseInt(search, 10);

  if (isNaN(number)) {
    return null;
  }

  const formatted = String(number).padStart(3, '0');

  return accounts.find(
    (account) =>
      account.number.replace('#', '') === formatted
  ) || null;
}

// ========================================
// إرسال الحساب المختار
// ========================================

async function sendSelectedAccount(chatId, account) {
  if (!account) {
    return bot.sendMessage(
      chatId,
      `❌ لم يتم العثور على هذا الحساب.`,
      keyboard
    );
  }

  // نحاول أولاً إعادة إرسال المنشور الأصلي
  // حتى تظهر الصور الموجودة في منشور القناة
  try {
    await bot.forwardMessage(
      chatId,
      `@${CHANNEL_USERNAME}`,
      account.messageId
    );

    return;
  } catch (error) {
    console.log(
      'تعذر إعادة إرسال منشور القناة:',
      error.message
    );
  }

  // إذا فشل الإرسال الأصلي، نرسل بيانات الحساب
  return bot.sendMessage(
    chatId,
    `🧾 رقم الحساب: ${account.number}

${account.text}

━━━━━━━━━━━━━━`,
    keyboard
  );
}

// ========================================
// استقبال منشورات القناة
// ========================================

bot.on('channel_post', async (msg) => {
  try {
    if (!msg.chat.username) return;

    if (
      msg.chat.username.toLowerCase() !==
      CHANNEL_USERNAME.toLowerCase()
    ) {
      return;
    }

    const text = msg.text || msg.caption || '';

    // نتأكد أن المنشور خاص بحساب PUBG
    if (
      !text.includes('ببجي') &&
      !text.includes('بـبـجي') &&
      !text.toLowerCase().includes('pubg')
    ) {
      return;
    }

    // منع حفظ نفس المنشور أكثر من مرة
    const alreadyExists = accounts.find(
      (account) => account.messageId === msg.message_id
    );

    if (alreadyExists) {
      return;
    }

    // رقم تلقائي
    const accountNumber = createAccountNumber();

    const account = {
      number: accountNumber,
      messageId: msg.message_id,
      text: text,
      date: Date.now()
    };

    accounts.push(account);

    nextAccountNumber++;

    console.log(
      `✅ تم حفظ الحساب ${accountNumber}`
    );

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

        // تحديث النص المحفوظ أيضًا
        account.text = newText;

      } catch (error) {
        console.log(
          'تعذر إضافة الرقم للمنشور:',
          error.message
        );
      }
    }

  } catch (error) {
    console.log(
      '❌ خطأ في منشور القناة:',
      error.message
    );
  }
});

// ========================================
// التعامل مع رسائل المستخدمين
// ========================================

bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text === '/start') return;

    // ====================================
    // آخر الحسابات
    // ====================================

    if (text === '🔥 آخر الحسابات') {

      if (accounts.length === 0) {
        return bot.sendMessage(
          chatId,
          `🔥 آخر الحسابات:

لا توجد حسابات منشورة بعد تشغيل البوت.`,
          keyboard
        );
      }

      // آخر 10 حسابات
      const latest = accounts
        .slice(-10)
        .reverse();

      const buttons = [];

      latest.forEach((account) => {
        buttons.push([
          {
            text: `🧾 ${account.number}`,
            callback_data: `account_${account.number.replace('#', '')}`
          }
        ]);
      });

      buttons.push([
        {
          text: '🏠 القائمة الرئيسية',
          callback_data: 'main_menu'
        }
      ]);

      return bot.sendMessage(
        chatId,
        `🔥 آخر الحسابات

اختر رقم الحساب الذي تريد رؤيته 👇`,
        {
          reply_markup: {
            inline_keyboard: buttons
          }
        }
      );
    }

    // ====================================
    // البحث عن حساب
    // ====================================

    if (text === '🔍 البحث عن حساب') {
      return bot.sendMessage(
        chatId,
        `🔍 أرسل رقم الحساب الذي تريد البحث عنه.

مثال:

001

أو:

#001`,
        keyboard
      );
    }

    // ====================================
    // طلب نشر حساب
    // ====================================

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

    // ====================================
    // شحن UC
    // ====================================

    if (text === '💎 شحن UC والألعاب') {
      return bot.sendMessage(
        chatId,
        `💎 خدمة شحن UC والألعاب متوفرة.

📞 للتفاصيل والتواصل:
@natoo_06`,
        keyboard
      );
    }

    // ====================================
    // تقييم الخدمة
    // ====================================

    if (text === '⭐ تقييم الخدمة') {
      return bot.sendMessage(
        chatId,
        `⭐ أرسل تقييمك للخدمة من 1 إلى 5، مع ملاحظتك إن وجدت.`,
        keyboard
      );
    }

    // ====================================
    // التواصل مع الإدارة
    // ====================================

    if (text === '📞 التواصل مع الإدارة') {
      return bot.sendMessage(
        chatId,
        `📞 للتواصل مع الإدارة:

👤 @ali_alzntane
👤 @natoo_06`,
        keyboard
      );
    }

    // ====================================
    // المسابقات والسحوبات
    // ====================================

    if (text === '🎁 المسابقات والسحوبات') {
      return bot.sendMessage(
        chatId,
        `🎁 المسابقات والسحوبات

تابع القناة لمعرفة آخر المسابقات والسحوبات.`,
        keyboard
      );
    }

    // ====================================
    // البحث برقم الحساب
    // ====================================

    const accountByNumber =
      findAccountByNumber(text);

    if (accountByNumber) {
      return sendSelectedAccount(
        chatId,
        accountByNumber
      );
    }

    // ====================================
    // البحث بالكلمة أو الاسم
    // ====================================

    const search = text.trim().toLowerCase();

    if (search.length > 0) {

      const results = accounts.filter(
        (account) => {
          return (
            account.number
              .toLowerCase()
              .includes(search) ||
            account.text
              .toLowerCase()
              .includes(search)
          );
        }
      );

      if (results.length === 0) {
        return bot.sendMessage(
          chatId,
          `❌ لم يتم العثور على حساب مطابق.

جرّب رقم حساب مثل:

#001`,
          keyboard
        );
      }

      // إذا وجد حساب واحد فقط
      if (results.length === 1) {
        return sendSelectedAccount(
          chatId,
          results[0]
        );
      }

      // إذا وجد أكثر من حساب
      const buttons = [];

      results.slice(0, 10).forEach(
        (account) => {
          buttons.push([
            {
              text: `🧾 ${account.number}`,
              callback_data:
                `account_${account.number.replace('#', '')}`
            }
          ]);
        }
      );

      return bot.sendMessage(
        chatId,
        `🔎 تم العثور على ${results.length} حساب.

اختر الحساب الذي تريد رؤيته 👇`,
        {
          reply_markup: {
            inline_keyboard: buttons
          }
        }
      );
    }

  } catch (error) {
    console.log(
      '❌ خطأ في رسالة المستخدم:',
      error.message
    );
  }
});

// ========================================
// التعامل مع أزرار الحسابات
// ========================================

bot.on('callback_query', async (query) => {
  try {
    const chatId = query.message.chat.id;
    const data = query.data;

    // إيقاف علامة التحميل على الزر
    await bot.answerCallbackQuery(
      query.id
    );

    // ====================================
    // القائمة الرئيسية
    // ====================================

    if (data === 'main_menu') {

      return bot.sendMessage(
        chatId,
        `🔥 مرحبًا بك في بوت BRAND Libya

👇 اختر الخدمة التي تريدها من الأزرار بالأسفل`,
        keyboard
      );
    }

    // ====================================
    // اختيار حساب
    // ====================================

    if (data.startsWith('account_')) {

      const number =
        data.replace('account_', '');

      const account =
        findAccountByNumber(number);

      if (!account) {
        return bot.sendMessage(
          chatId,
          `❌ هذا الحساب غير موجود.`,
          keyboard
        );
      }

      await sendSelectedAccount(
        chatId,
        account
      );

      return;
    }

  } catch (error) {
    console.log(
      '❌ خطأ في الزر:',
      error.message
    );
  }
});

// ========================================
// أخطاء البوت
// ========================================

bot.on('polling_error', (error) => {
  console.log(
    '❌ Polling Error:',
    error.message
  );
});

console.log('================================');
console.log('🔥 BRAND Libya Bot يعمل الآن');
console.log('📡 القناة:', CHANNEL_USERNAME);
console.log('================================');
