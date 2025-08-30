# 🚀 Быстрый старт - Telegram Bot для Плана Питания

## ⚡ За 5 минут к работающему боту

### 1️⃣ Создайте бота
- Откройте [@BotFather](https://t.me/BotFather) в Telegram
- Отправьте `/newbot`
- Следуйте инструкциям
- **Сохраните токен!**

### 2️⃣ Разверните на Vercel
```bash
# Клонируйте репозиторий
git clone <your-repo-url>
cd <your-repo-name>

# Поместите Excel файл в папку /data
# Файл должен называться: План_питания_15дней_IF_Лента_Томск_без_чечевицы.xlsx

# Запушьте в GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 3️⃣ Настройте Vercel
- [vercel.com](https://vercel.com) → New Project
- Выберите ваш репозиторий
- Deploy

### 4️⃣ Добавьте переменные окружения
В Vercel Dashboard → Settings → Environment Variables:

```env
TELEGRAM_TOKEN=your_bot_token
TG_SECRET=your_secret_string
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
PUBLIC_URL=https://your-project.vercel.app
OPENAI_API_KEY=your_openai_key  # опционально
```

### 5️⃣ Создайте Vercel KV
- Storage → KV → Create Database
- Скопируйте URL и токен
- Добавьте в переменные окружения

### 6️⃣ Активируйте бота
Откройте: `https://your-project.vercel.app/api/set-webhook`

### 7️⃣ Тестируйте
Найдите бота в Telegram и отправьте `/start`

---

## 🎯 Что получите

✅ **15-дневный план питания** с 4 приемами пищи в день  
✅ **Удобные команды**: `/today`, `/day N`, `/next`, `/prev`  
✅ **AI советы** через OpenAI (если настроен)  
✅ **Красивое форматирование** HTML-разметкой  
✅ **Безопасность** через защищенный webhook  
✅ **Хранение состояния** в Vercel KV  

## 📱 Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Приветствие |
| `/today` | Текущий день |
| `/day N` | День N (1-15) |
| `/day N m1` | Завтрак дня N |
| `/day N m2` | Обед дня N |
| `/day N m3` | Полдник дня N |
| `/day N m4` | Ужин дня N |
| `/next` | Следующий день |
| `/prev` | Предыдущий день |
| `/tip` | Совет дня |

## 🔧 Полезные ссылки

- **Статус системы**: `/api/status`
- **Главная страница**: `/`
- **Подробная инструкция**: `DEPLOYMENT.md`

---

**🎉 Готово! Ваш бот работает!**
