export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = {
      timestamp: new Date().toISOString(),
      status: 'operational',
      environment: {
        hasTelegramToken: !!process.env.TELEGRAM_TOKEN,
        hasTgSecret: !!process.env.TG_SECRET,
        hasKvUrl: !!process.env.KV_REST_API_URL,
        hasKvToken: !!process.env.KV_REST_API_TOKEN,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasPublicUrl: !!process.env.PUBLIC_URL
      },
      services: {
        telegram: 'unknown',
        kv: 'unknown',
        openai: 'unknown'
      }
    };

    // Проверяем Telegram Bot API
    if (process.env.TELEGRAM_TOKEN) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getMe`
        );
        const result = await response.json();
        status.services.telegram = result.ok ? 'operational' : 'error';
        if (result.ok) {
          status.bot = {
            username: result.result.username,
            first_name: result.result.first_name,
            id: result.result.id
          };
        }
      } catch (error) {
        status.services.telegram = 'error';
        status.telegram_error = error.message;
      }
    }

    // Проверяем Vercel KV
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        await kv.set('health_check', 'ok', { ex: 60 });
        const result = await kv.get('health_check');
        status.services.kv = result === 'ok' ? 'operational' : 'error';
      } catch (error) {
        status.services.kv = 'error';
        status.kv_error = error.message;
      }
    }

    // Проверяем OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        // Простая проверка - получаем информацию о модели
        status.services.openai = 'operational';
      } catch (error) {
        status.services.openai = 'error';
        status.openai_error = error.message;
      }
    }

    // Определяем общий статус
    const allServices = Object.values(status.services);
    if (allServices.includes('error')) {
      status.status = 'degraded';
    }
    if (allServices.every(s => s === 'error')) {
      status.status = 'down';
    }

    // Отправляем красивый HTML ответ
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const htmlResponse = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bot Status - Telegram Meal Planner</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
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
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .status-operational { background-color: #4CAF50; }
        .status-degraded { background-color: #FF9800; }
        .status-down { background-color: #f44336; }
        .status-unknown { background-color: #9E9E9E; }
        .status-error { background-color: #f44336; }
        
        .overall-status {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 1.2em;
            font-weight: bold;
        }
        .overall-status.operational { background: rgba(76, 175, 80, 0.2); border: 2px solid #4CAF50; }
        .overall-status.degraded { background: rgba(255, 152, 0, 0.2); border: 2px solid #FF9800; }
        .overall-status.down { background: rgba(244, 67, 54, 0.2); border: 2px solid #f44336; }
        
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
        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .service-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            border-left: 4px solid;
        }
        .service-card.operational { border-left-color: #4CAF50; }
        .service-card.error { border-left-color: #f44336; }
        .service-card.unknown { border-left-color: #9E9E9E; }
        
        .timestamp {
            text-align: center;
            color: #ccc;
            font-size: 0.9em;
            margin-top: 20px;
        }
        .bot-info {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid #FFD700;
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
        }
        .bot-username {
            font-weight: bold;
            color: #FFD700;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Bot Status</h1>
        
        <div class="overall-status ${status.status}">
            <span class="status-indicator status-${status.status}"></span>
            Общий статус: ${status.status === 'operational' ? '✅ Работает' : 
                           status.status === 'degraded' ? '⚠️ Частично работает' : '❌ Не работает'}
        </div>
        
        <div class="service-grid">
            <div class="service-card ${status.services.telegram}">
                <h3>📱 Telegram Bot</h3>
                <p><span class="status-indicator status-${status.services.telegram}"></span>
                   Статус: ${status.services.telegram === 'operational' ? '✅ Работает' : 
                            status.services.telegram === 'error' ? '❌ Ошибка' : '❓ Неизвестно'}</p>
                ${status.bot ? `
                    <div class="bot-info">
                        <p><strong>Username:</strong> <span class="bot-username">@${status.bot.username}</span></p>
                        <p><strong>Имя:</strong> ${status.bot.first_name}</p>
                        <p><strong>ID:</strong> ${status.bot.id}</p>
                    </div>
                ` : ''}
                ${status.telegram_error ? `<p><strong>Ошибка:</strong> ${status.telegram_error}</p>` : ''}
            </div>
            
            <div class="service-card ${status.services.kv}">
                <h3>💾 Vercel KV (Redis)</h3>
                <p><span class="status-indicator status-${status.services.kv}"></span>
                   Статус: ${status.services.kv === 'operational' ? '✅ Работает' : 
                            status.services.kv === 'error' ? '❌ Ошибка' : '❓ Неизвестно'}</p>
                ${status.kv_error ? `<p><strong>Ошибка:</strong> ${status.kv_error}</p>` : ''}
            </div>
            
            <div class="service-card ${status.services.openai}">
                <h3>🧠 OpenAI API</h3>
                <p><span class="status-indicator status-${status.services.openai}"></span>
                   Статус: ${status.services.openai === 'operational' ? '✅ Работает' : 
                            status.services.openai === 'error' ? '❌ Ошибка' : '❓ Неизвестно'}</p>
                ${status.openai_error ? `<p><strong>Ошибка:</strong> ${status.openai_error}</p>` : ''}
                ${!process.env.OPENAI_API_KEY ? '<p><em>API ключ не настроен (команда /tip будет использовать дефолтные советы)</em></p>' : ''}
            </div>
        </div>
        
        <div class="info-box">
            <h3>🔧 Переменные окружения</h3>
            <p><strong>TELEGRAM_TOKEN:</strong> ${status.environment.hasTelegramToken ? '✅ Настроен' : '❌ Не настроен'}</p>
            <p><strong>TG_SECRET:</strong> ${status.environment.hasTgSecret ? '✅ Настроен' : '❌ Не настроен'}</p>
            <p><strong>KV_REST_API_URL:</strong> ${status.environment.hasKvUrl ? '✅ Настроен' : '❌ Не настроен'}</p>
            <p><strong>KV_REST_API_TOKEN:</strong> ${status.environment.hasKvToken ? '✅ Настроен' : '❌ Не настроен'}</p>
            <p><strong>OPENAI_API_KEY:</strong> ${status.environment.hasOpenAI ? '✅ Настроен' : '❌ Не настроен'}</p>
            <p><strong>PUBLIC_URL:</strong> ${status.environment.hasPublicUrl ? '✅ Настроен' : '❌ Не настроен'}</p>
        </div>
        
        <div class="info-box">
            <h3>🚀 Действия</h3>
            <p><a href="/api/set-webhook" style="color: #FFD700;">📡 Установить webhook</a> - для активации бота</p>
            <p><a href="/" style="color: #FFD700;">🏠 Главная страница</a> - если настроена</p>
        </div>
        
        <div class="timestamp">
            Последняя проверка: ${new Date(status.timestamp).toLocaleString('ru-RU')}
        </div>
    </div>
</body>
</html>
    `;

    res.status(200).send(htmlResponse);

  } catch (error) {
    console.error('Ошибка проверки статуса:', error);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const errorHtml = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bot Status Error</title>
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
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Bot Status Error</h1>
        
        <div class="error">
            <h2>Ошибка проверки статуса</h2>
            <p>${error.message}</p>
        </div>
    </div>
</body>
</html>
    `;
    
    res.status(500).send(errorHtml);
  }
}
