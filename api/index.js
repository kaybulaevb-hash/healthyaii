export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  const htmlResponse = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍽️ Telegram Bot для Плана Питания</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            line-height: 1.6;
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
            font-size: 3em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .subtitle {
            text-align: center;
            font-size: 1.3em;
            margin-bottom: 40px;
            color: #FFD700;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-5px);
        }
        .feature-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
        .feature-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #FFD700;
        }
        .commands {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
        }
        .commands h3 {
            color: #FFD700;
            margin-top: 0;
            text-align: center;
            font-size: 1.5em;
        }
        .command-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .command-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #FFD700;
        }
        .command-name {
            font-family: monospace;
            font-weight: bold;
            color: #FFD700;
            font-size: 1.1em;
        }
        .command-desc {
            margin-top: 5px;
            font-size: 0.9em;
            color: #ccc;
        }
        .actions {
            text-align: center;
            margin: 40px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #333;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 10px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        .btn.primary {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
        }
        .btn.secondary {
            background: linear-gradient(45deg, #2196F3, #1976D2);
            color: white;
        }
        .tech-stack {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
        }
        .tech-stack h3 {
            color: #FFD700;
            margin-top: 0;
            text-align: center;
            font-size: 1.5em;
        }
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        .tech-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .tech-name {
            font-weight: bold;
            color: #FFD700;
        }
        .tech-desc {
            font-size: 0.9em;
            color: #ccc;
            margin-top: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            color: #ccc;
        }
        .emoji {
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍽️ Telegram Bot для Плана Питания</h1>
        <p class="subtitle">Умный помощник для здорового питания с 15-дневным планом</p>
        
        <div class="features">
            <div class="feature-card">
                <div class="feature-icon">📅</div>
                <div class="feature-title">15-дневный план</div>
                <div>Полный план питания на 15 дней с детальными рецептами</div>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🍳</div>
                <div class="feature-title">4 приема пищи</div>
                <div>Завтрак, обед, полдник и ужин для каждого дня</div>
            </div>
            <div class="feature-card">
                <div class="feature-icon">💡</div>
                <div class="feature-title">AI советы</div>
                <div>Персональные советы по готовке с OpenAI GPT-4</div>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <div class="feature-title">Безопасность</div>
                <div>Защищенный webhook и шифрование данных</div>
            </div>
        </div>
        
        <div class="commands">
            <h3>📱 Доступные команды</h3>
            <div class="command-grid">
                <div class="command-item">
                    <div class="command-name">/start</div>
                    <div class="command-desc">Приветствие и инструкция</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/today</div>
                    <div class="command-desc">Показать текущий день</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/day N</div>
                    <div class="command-desc">Показать день N (1-15)</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/day N m1</div>
                    <div class="command-desc">Показать завтрак дня N</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/day N m2</div>
                    <div class="command-desc">Показать обед дня N</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/day N m3</div>
                    <div class="command-desc">Показать полдник дня N</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/day N m4</div>
                    <div class="command-desc">Показать ужин дня N</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/next</div>
                    <div class="command-desc">Следующий день</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/prev</div>
                    <div class="command-desc">Предыдущий день</div>
                </div>
                <div class="command-item">
                    <div class="command-name">/tip</div>
                    <div class="command-desc">Совет дня</div>
                </div>
            </div>
        </div>
        
        <div class="tech-stack">
            <h3>🛠️ Технологии</h3>
            <div class="tech-grid">
                <div class="tech-item">
                    <div class="tech-name">Node.js</div>
                    <div class="tech-desc">Backend runtime</div>
                </div>
                <div class="tech-item">
                    <div class="tech-name">Telegraf.js</div>
                    <div class="tech-desc">Telegram Bot API</div>
                </div>
                <div class="tech-item">
                    <div class="tech-name">Vercel KV</div>
                    <div class="tech-desc">Redis database</div>
                </div>
                <div class="tech-item">
                    <div class="tech-name">ExcelJS</div>
                    <div class="tech-desc">Excel parsing</div>
                </div>
                <div class="tech-item">
                    <div class="tech-name">OpenAI API</div>
                    <div class="tech-desc">AI советы</div>
                </div>
                <div class="tech-item">
                    <div class="tech-name">Vercel</div>
                    <div class="tech-desc">Hosting & deployment</div>
                </div>
            </div>
        </div>
        
        <div class="actions">
            <a href="/api/set-webhook" class="btn primary">🚀 Активировать бота</a>
            <a href="/api/status" class="btn secondary">📊 Статус системы</a>
        </div>
        
        <div class="footer">
            <p><span class="emoji">🤖</span> Telegram Bot для Плана Питания</p>
            <p>Разработано для здорового образа жизни <span class="emoji">💚</span></p>
        </div>
    </div>
</body>
</html>
  `;

  res.status(200).send(htmlResponse);
}
