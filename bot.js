const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ BOT_TOKEN غير موجود');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const CHANNEL_USERNAME = 'Pubg_Libya_Store';

// تخزين الحسابات
const accounts = [];

let nextAccountNumber = 1;

// تجميع صور الألبوم
const mediaGroups = new Map();

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
// إنشاء رقم الحساب
// ========================================

function createAccountNumber() {
  const number = String(nextAccountNumber).padStart(3, '0');
  return `#${number}`;
}

// ========================================
// البحث عن الحساب بالرقم
// ========================================

function findAccountByNumber(input) {
  if (!input) return null;

  let search = String(input).trim().toLowerCase();

  search = search.replace('#', '');

  const number = parseInt(search, 10);

  if (isNaN(number)) {
    return null;
  }

  const formatted = String(number).padStart(3, '0');

  return accounts.find(
    account =>
      account.number.replace('#', '') === formatted
  ) || null;
}

// ========================================
// إرسال الحساب مع جميع الصور
// ========================================

async function sendSelectedAccount(chatId, account) {
  if (!account) {
    return bot.sendMessage(
      chatId,
      `❌ هذا الحساب غير موجود.`,
      keyboard
    );
  }

  // إذا عندنا صور محفوظة
  if (
    account.photos &&
    account.photos.length > 0
  ) {
    try {
      const media = account.photos.map(
        (photo, index) => {
          const item = {
            type: 'photo',
            media: photo
          };

          // نضع بيانات الحساب على أول صورة فقط
          if (index === 0) {
            item.caption =
              `🧾 رقم الحساب: ${account.number}\n\n` +
              account.text;
          }

          return item;
        }
      );

      // تيليجرام يسمح بحد أقصى 10 صور في الألبوم
      await bot.sendMediaGroup(
        chatId,
        media.slice(0, 10)
      );

      return;
    } catch (error) {
      console.log(
        'تعذر إرسال الصور كألبوم:',
        error.message
      );
    }
  }

  // إذا ما فيش صور
  return bot.sendMessage(
    chatId,
    `🧾 رقم الحساب: ${account.number}

${account.text}

━━━━━━━━━━━━━━`,
    keyboard
  );
}

// ========================================
// حفظ حساب جديد
// ========================================

async function saveAccount(messages) {
  try {
    if (!messages || messages.length === 0) {
      return;
    }

    // ترتيب رسائل الألبوم
    messages.sort(
      (a, b) => a.message_id - b.message_id
    );

    const firstMessage = messages[0];

    const text =
      firstMessage.text ||
      firstMessage.caption ||
      '';

    // نتأكد أن المنشور خاص بببجي
    if (
      !text.includes('ببجي') &&
      !text.includes('بـبـجي') &&
      !text.toLowerCase().includes('pubg')
    ) {
      return;
    }

    // منع تكرار الحساب
    const alreadyExists = accounts.find(
      account =>
        account.messageId === firstMessage.message_id
    );

    if (alreadyExists) {
      return;
    }

    // رقم الحساب
    const accountNumber =
      createAccountNumber();

    // استخراج جميع الصور
    const photos = [];

    messages.forEach(message => {
      if (
        message.photo &&
        message.photo.length > 0
      ) {
        const lastPhoto =
          message.photo[
            message.photo.length - 1
          ];

        photos.push(lastPhoto.file_id);
      }
    });

    const account = {
      number: accountNumber,
      messageId: firstMessage.message_id,
      text: text,
      photos: photos,
      date: Date.now()
    };

    accounts.push(account);

    nextAccountNumber++;

    console.log(
      `✅ تم حفظ الحساب ${accountNumber} | الصور: ${photos.length}`
    );

    // إضافة رقم الحساب للمنشور
    if (!text.includes('🧾 رقم الحساب:')) {
      const newText =
        `🧾 رقم الحساب: ${accountNumber}\n\n` +
        text;

      try {
        if (firstMessage.caption !== undefined) {
          await bot.editMessageCaption(
            newText,
            {
              chat_id: firstMessage.chat.id,
              message_id:
                firstMessage.message_id
            }
          );
        } else if (firstMessage.text) {
          await bot.editMessageText(
            newText,
            {
              chat_id: firstMessage.chat.id,
              message_id:
                firstMessage.message_id
            }
          );
        }

        account.text = newText;

      } catch (error) {
        console.log(
          'تعذر إضافة رقم الحساب للمنشور:',
          error.message
        );
      }
    }

  } catch (error) {
    console.log(
      '❌ خطأ أثناء حفظ الحساب:',
      error.message
    );
  }
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

    // ====================================
    // إذا المنشور عبارة عن ألبوم صور
    // ====================================

    if (msg.media_group_id) {

      if (!mediaGroups.has(msg.media_group_id)) {
        mediaGroups.set(
          msg.media_group_id,
          []
        );
      }

      const group =
        mediaGroups.get(msg.media_group_id);

      group.push(msg);

      // إلغاء المؤقت السابق
      if (group.timer) {
        clearTimeout(group.timer);
      }

      // ننتظر حتى تصل كل صور الألبوم
      group.timer = setTimeout(
        async () => {
          const messages =
            mediaGroups.get(
              msg.media_group_id
            );

          mediaGroups.delete(
            msg.media_group_id
          );

          if (messages) {
            await saveAccount(messages);
          }
        },
        2000
      );

      return;
    }

    // ====================================
    // منشور عادي بدون ألبوم
    // ====================================

    await saveAccount([msg]);

  } catch (error) {
    console.log(
      '❌ خطأ في منشور القناة:',
      error.message
    );
  }
});

// ========================================
// رسائل المستخدمين
// ========================================

bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text === '/start') {
      return;
    }

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

      const latest =
        accounts
          .slice(-10)
          .reverse();

      const buttons = [];

      latest.forEach(account => {
        buttons.push([
          {
            text:
              `🧾 ${account.number}`,
            callback_data:
              `account_${account.number.replace('#', '')}`
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
    // البحث
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
    // البحث المباشر بالرقم
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

    const search =
      text.trim().toLowerCase();

    if (search.length > 0) {

      const results =
        accounts.filter(account => {
          return (
            account.number
              .toLowerCase()
              .includes(search) ||
            account.text
              .toLowerCase()
              .includes(search)
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

      // حساب واحد
      if (results.length === 1) {
        return sendSelectedAccount(
          chatId,
          results[0]
        );
      }

      // أكثر من حساب
      const buttons = [];

      results
        .slice(0, 10)
        .forEach(account => {
          buttons.push([
            {
              text:
                `🧾 ${account.number}`,
              callback_data:
                `account_${account.number.replace('#', '')}`
            }
          ]);
        });

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
// أزرار الحسابات
// ========================================

bot.on('callback_query', async (query) => {
  try {
    const chatId =
      query.message.chat.id;

    const data = query.data;

    await bot.answerCallbackQuery(
      query.id
    );

    // القائمة الرئيسية
    if (data === 'main_menu') {
      return bot.sendMessage(
        chatId,
        `🔥 مرحبًا بك في بوت BRAND Libya

👇 اختر الخدمة التي تريدها من الأزرار بالأسفل`,
        keyboard
      );
    }

    // اختيار حساب
    if (data.startsWith('account_')) {

      const number =
        data.replace(
          'account_',
          ''
        );

      const account =
        findAccountByNumber(number);

      if (!account) {
        return bot.sendMessage(
          chatId,
          `❌ هذا الحساب غير موجود.`,
          keyboard
        );
      }

      return sendSelectedAccount(
        chatId,
        account
      );
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

bot.on('polling_error', error => {
  console.log(
    '❌ Polling Error:',
    error.message
  );
});

console.log(
  '================================'
);

console.log(
  '🔥 BRAND Libya Bot يعمل الآن'
);

console.log(
  '📡 القناة:',
  CHANNEL_USERNAME
);

console.log(
  '================================'
);
