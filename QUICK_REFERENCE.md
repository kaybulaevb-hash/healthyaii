# 📚 Краткий справочник - Telegram Bot для Плана Питания

## 🚀 Быстрый старт

### 1. Подготовка
- Создайте бота у @BotFather
- Получите TELEGRAM_TOKEN
- Поместите Excel файл в `/data`

### 2. Развертывание
```bash
git add .
git commit -m "Initial commit: Telegram Bot for Meal Planning"
git push origin main
```

### 3. Vercel
- vercel.com → New Project
- Выберите репозиторий
- Deploy

### 4. Настройка
- Переменные окружения
- Vercel KV база данных
- `/api/set-webhook`

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

## 🔧 Переменные окружения

```env
TELEGRAM_TOKEN=your_bot_token
TG_SECRET=your_secret_string
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
PUBLIC_URL=https://your-project.vercel.app
OPENAI_API_KEY=your_openai_key  # опционально
```

## 📊 Проверка работы

- **Статус**: `/api/status`
- **Главная**: `/`
- **Логи**: Vercel Dashboard

## 🎯 Возможности

- ✅ 15-дневный план питания
- ✅ 4 приема пищи в день
- ✅ Excel файл парсинг
- ✅ AI советы (OpenAI)
- ✅ Интерактивные клавиатуры
- ✅ Защищенный webhook
- ✅ Vercel KV хранение
- ✅ HTML форматирование

## 📚 Документация

- **`QUICKSTART.md`** - быстрый старт
- **`DEPLOYMENT.md`** - развертывание
- **`TESTING.md`** - тестирование
- **`PROJECT_INFO.md`** - информация

## 🐛 Отладка

1. Проверьте `/api/status`
2. Проверьте логи Vercel
3. Проверьте переменные окружения
4. Проверьте Excel файл

---

**🚀 Бот готов к использованию!**
