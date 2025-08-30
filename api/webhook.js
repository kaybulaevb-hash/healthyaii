const MealBot = require('../../lib/bot');

let botInstance = null;

async function initializeBot() {
  if (!botInstance) {
    botInstance = new MealBot();
    await botInstance.initialize();
  }
  return botInstance;
}

export default async function handler(req, res) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверяем секретный токен для защиты webhook
  const secretToken = req.headers['x-telegram-bot-api-secret-token'];
  if (secretToken !== process.env.TG_SECRET) {
    console.error('Неверный секретный токен webhook');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Инициализируем бота
    const bot = await initializeBot();
    const telegrafBot = bot.getBot();

    // Обрабатываем обновление от Telegram
    const update = req.body;
    console.log('Получено обновление от Telegram:', JSON.stringify(update, null, 2));

    // Передаем обновление в бота
    await telegrafBot.handleUpdate(update);

    // Отвечаем успехом
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
