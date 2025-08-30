const express = require('express');
const MealBot = require('./lib/bot');

const app = express();
const PORT = process.env.PORT || 3000;

let botInstance = null;

async function initializeBot() {
  if (!botInstance) {
    botInstance = new MealBot();
    await botInstance.initialize();
  }
  return botInstance;
}

// Middleware для парсинга JSON
app.use(express.json());

// Webhook endpoint
app.post('/api/webhook', async (req, res) => {
  // Проверяем секретный токен
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
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    bot: 'Telegram Meal Planner Bot'
  });
});

// Set webhook endpoint
app.get('/api/set-webhook', async (req, res) => {
  const { TELEGRAM_TOKEN, TG_SECRET, PUBLIC_URL } = process.env;

  if (!TELEGRAM_TOKEN || !TG_SECRET || !PUBLIC_URL) {
    return res.status(500).json({ 
      error: 'Missing environment variables',
      required: ['TELEGRAM_TOKEN', 'TG_SECRET', 'PUBLIC_URL']
    });
  }

  try {
    const webhookUrl = `${PUBLIC_URL}/api/webhook`;
    
    const setWebhookResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: TG_SECRET,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true
        }),
      }
    );

    const result = await setWebhookResponse.json();
    
    res.json({
      success: result.ok,
      webhook_url: webhookUrl,
      telegram_response: result
    });
  } catch (error) {
    console.error('Ошибка установки webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Telegram Bot для Плана Питания',
    status: 'Running on Railway',
    endpoints: {
      webhook: '/api/webhook',
      status: '/api/status',
      setWebhook: '/api/set-webhook'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
