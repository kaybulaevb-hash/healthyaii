export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { TELEGRAM_TOKEN, TG_SECRET, PUBLIC_URL } = process.env;

  if (!TELEGRAM_TOKEN || !TG_SECRET || !PUBLIC_URL) {
    return res.status(500).json({ 
      error: 'Missing environment variables',
      required: ['TELEGRAM_TOKEN', 'TG_SECRET', 'PUBLIC_URL'],
      current: {
        hasToken: !!TELEGRAM_TOKEN,
        hasSecret: !!TG_SECRET,
        hasUrl: !!PUBLIC_URL
      }
    });
  }

  try {
    const webhookUrl = `${PUBLIC_URL}/api/webhook`;
    
    // Устанавливаем webhook
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

    const setWebhookResult = await setWebhookResponse.json();

    if (!setWebhookResult.ok) {
      throw new Error(`Telegram API error: ${setWebhookResult.description}`);
    }

    // Получаем информацию о webhook
    const getWebhookInfoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getWebhookInfo`
    );

    const webhookInfo = await getWebhookInfoResponse.json();

    // Получаем информацию о боте
    const getMeResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`
    );

    const botInfo = await getMeResponse.json();

    const result = {
      success: true,
      message: 'Webhook успешно установлен!',
      webhook: {
        url: webhookUrl,
        secret_token: TG_SECRET,
        status: 'active'
      },
      bot: {
        username: botInfo.ok ? botInfo.result.username : 'Unknown',
        first_name: botInfo.ok ? botInfo.result.first_name : 'Unknown',
        id: botInfo.ok ? botInfo.result.id : 'Unknown'
      },
      telegram_response: setWebhookResult,
      webhook_info: webhookInfo.ok ? webhookInfo.result : webhookInfo
    };

    // Отправляем красивый HTML ответ
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const htmlResponse = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Bot Webhook Setup</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .status {
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .info-box {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
        }
        .info-box h3 {
            margin-top: 0;
            color: #FFD700;
        }
        .bot-username {
            font-size: 1.2em;
            font-weight: bold;
            color: #FFD700;
        }
        .webhook-url {
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            word-break: break-all;
            margin: 10px 0;
        }
        .instructions {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .instructions h3 {
            color: #FFD700;
            margin-top: 0;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
        }
        .error {
            background: rgba(244, 67, 54, 0.2);
            border: 2px solid #f44336;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Telegram Bot Setup</h1>
        
        ${result.success ? `
            <div class="status">
                <h2>✅ Webhook успешно установлен!</h2>
                <p>Ваш бот готов к работе!</p>
            </div>
            
            <div class="info-box">
                <h3>📱 Информация о боте</h3>
                <p><strong>Имя:</strong> ${result.bot.first_name}</p>
                <p><strong>Username:</strong> <span class="bot-username">@${result.bot.username}</span></p>
                <p><strong>ID:</strong> ${result.bot.id}</p>
            </div>
            
            <div class="info-box">
                <h3>🔗 Webhook URL</h3>
                <div class="webhook-url">${result.webhook.url}</div>
                <p><strong>Статус:</strong> ${result.webhook.status}</p>
            </div>
            
            <div class="instructions">
                <h3>🚀 Как использовать бота</h3>
                <ol>
                    <li>Откройте Telegram</li>
                    <li>Найдите бота: <span class="bot-username">@${result.bot.username}</span></li>
                    <li>Отправьте команду <code>/start</code></li>
                    <li>Используйте команды для навигации по плану питания</li>
                </ol>
            </div>
            
            <div class="instructions">
                <h3>📋 Доступные команды</h3>
                <ul>
                    <li><code>/start</code> - приветствие и инструкция</li>
                    <li><code>/today</code> - показать текущий день</li>
                    <li><code>/day N</code> - показать день N (1-15)</li>
                    <li><code>/day N m1</code> - показать завтрак дня N</li>
                    <li><code>/day N m2</code> - показать обед дня N</li>
                    <li><code>/next</code> - следующий день</li>
                    <li><code>/prev</code> - предыдущий день</li>
                    <li><code>/tip</code> - совет дня</li>
                </ul>
            </div>
        ` : `
            <div class="error">
                <h2>❌ Ошибка установки webhook</h2>
                <p>${result.message || 'Неизвестная ошибка'}</p>
            </div>
        `}
    </div>
</body>
</html>
    `;

    res.status(200).send(htmlResponse);

  } catch (error) {
    console.error('Ошибка установки webhook:', error);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const errorHtml = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Bot Webhook Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .error {
            background: rgba(244, 67, 54, 0.2);
            border: 2px solid #f44336;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .info-box {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
        }
        .info-box h3 {
            margin-top: 0;
            color: #FFD700;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Telegram Bot Setup Error</h1>
        
        <div class="error">
            <h2>Ошибка установки webhook</h2>
            <p>${error.message}</p>
        </div>
        
        <div class="info-box">
            <h3>🔧 Возможные причины ошибки</h3>
            <ul>
                <li>Неверный TELEGRAM_TOKEN</li>
                <li>Не настроены переменные окружения</li>
                <li>Проблемы с сетью</li>
                <li>Бот заблокирован или удален</li>
            </ul>
        </div>
        
        <div class="info-box">
            <h3>📋 Проверьте настройки</h3>
            <ul>
                <li>TELEGRAM_TOKEN - токен от @BotFather</li>
                <li>TG_SECRET - секретный ключ для webhook</li>
                <li>PUBLIC_URL - URL вашего проекта на Vercel</li>
                <li>KV_REST_API_URL и KV_REST_API_TOKEN - для Vercel KV</li>
            </ul>
        </div>
    </div>
</body>
</html>
    `;
    
    res.status(500).send(errorHtml);
  }
}
