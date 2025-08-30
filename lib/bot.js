const { Telegraf } = require('telegraf');
const ExcelParser = require('./excel-parser');
// Используем простое хранилище для Railway
const KVStorage = process.env.RAILWAY_ENVIRONMENT ? 
  require('./simple-storage') : 
  require('./kv-storage');
const OpenAIService = require('./openai-service');

class MealBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_TOKEN);
    this.excelParser = new ExcelParser();
    this.kvStorage = new KVStorage();
    this.openaiService = new OpenAIService();
    this.maxDay = 15;
    
    this.setupCommands();
    this.setupMiddleware();
  }

  setupMiddleware() {
    this.bot.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      console.log(`Обработка сообщения: ${ms}ms`);
      
      // Обновляем статистику
      await this.kvStorage.incrementUserUsage(ctx.chat.id);
    });
  }

  setupCommands() {
    // Команда /start
    this.bot.start(async (ctx) => {
      const welcomeMessage = `
🍽️ <b>Добро пожаловать в Бота Плана Питания!</b>

Я помогу вам следить за 15-дневным планом здорового питания.

<b>Доступные команды:</b>
• /start - показать это сообщение
• /today - показать текущий день
• /day N - показать день N (1-15)
• /day N m1 - показать завтрак дня N
• /day N m2 - показать обед дня N
• /day N m3 - показать полдник дня N
• /day N m4 - показать ужин дня N
• /next - следующий день
• /prev - предыдущий день
• /tip - совет дня

<b>Начните с команды /today</b>
      `;

      await ctx.reply(welcomeMessage, { parse_mode: 'HTML' });
      
      // Обновляем статистику
      await this.kvStorage.updateBotStats(true, false);
    });

    // Команда /today
    this.bot.command('today', async (ctx) => {
      const currentDay = await this.kvStorage.getUserCurrentDay(ctx.chat.id);
      await this.showDayOverview(ctx, currentDay);
    });

    // Команда /day
    this.bot.command('day', async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 2) {
        return ctx.reply('Использование: /day N или /day N m1');
      }

      const day = parseInt(args[1]);
      if (isNaN(day) || day < 1 || day > this.maxDay) {
        return ctx.reply(`День должен быть от 1 до ${this.maxDay}`);
      }

      if (args.length === 2) {
        // Показать обзор дня
        await this.showDayOverview(ctx, day);
      } else if (args.length === 3) {
        // Показать конкретный прием пищи
        const meal = args[2].toUpperCase();
        if (!['M1', 'M2', 'M3', 'M4'].includes(meal)) {
          return ctx.reply('Прием пищи должен быть: m1, m2, m3 или m4');
        }
        await this.showMealDetails(ctx, day, meal);
      }
    });

    // Команда /next
    this.bot.command('next', async (ctx) => {
      const currentDay = await this.kvStorage.getUserCurrentDay(ctx.chat.id);
      const nextDay = currentDay >= this.maxDay ? 1 : currentDay + 1;
      await this.kvStorage.setUserCurrentDay(ctx.chat.id, nextDay);
      await this.showDayOverview(ctx, nextDay);
    });

    // Команда /prev
    this.bot.command('prev', async (ctx) => {
      const currentDay = await this.kvStorage.getUserCurrentDay(ctx.chat.id);
      const prevDay = currentDay <= 1 ? this.maxDay : currentDay - 1;
      await this.kvStorage.setUserCurrentDay(ctx.chat.id, prevDay);
      await this.showDayOverview(ctx, prevDay);
    });

    // Команда /tip
    this.bot.command('tip', async (ctx) => {
      const currentDay = await this.kvStorage.getUserCurrentDay(ctx.chat.id);
      const dayData = this.excelParser.getDayData(currentDay);
      
      if (!dayData) {
        return ctx.reply('Не удалось загрузить данные для этого дня');
      }

      const tip = await this.openaiService.generateCookingTip(currentDay, dayData);
      await ctx.reply(tip, { parse_mode: 'HTML' });
    });

    // Обработка текстовых сообщений
    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text.toLowerCase();
      
      if (text.includes('день') || text.includes('day')) {
        const dayMatch = text.match(/(\d+)/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          if (day >= 1 && day <= this.maxDay) {
            await this.showDayOverview(ctx, day);
            return;
          }
        }
      }

      // Если не распознали команду
      await ctx.reply('Используйте команды для навигации по плану питания. Начните с /start');
    });
  }

  async showDayOverview(ctx, day) {
    const dayData = this.excelParser.getDayData(day);
    if (!dayData) {
      return ctx.reply('Не удалось загрузить данные для этого дня');
    }

    const message = `
📅 <b>День ${day}</b>

🍳 <b>Завтрак (M1):</b> ${dayData.M1.name || 'Не указано'}
🍽️ <b>Обед (M2):</b> ${dayData.M2.name || 'Не указано'}
☕ <b>Полдник (M3):</b> ${dayData.M3.name || 'Не указано'}
🌙 <b>Ужин (M4):</b> ${dayData.M4.name || 'Не указано'}

<i>Используйте /day ${day} m1, /day ${day} m2 и т.д. для подробностей</i>
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '⬅️ Предыдущий', callback_data: `prev_${day}` },
          { text: 'Следующий ➡️', callback_data: `next_${day}` }
        ],
        [
          { text: '🍳 Завтрак', callback_data: `meal_${day}_M1` },
          { text: '🍽️ Обед', callback_data: `meal_${day}_M2` }
        ],
        [
          { text: '☕ Полдник', callback_data: `meal_${day}_M3` },
          { text: '🌙 Ужин', callback_data: `meal_${day}_M4` }
        ],
        [
          { text: '💡 Совет дня', callback_data: `tip_${day}` }
        ]
      ]
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  async showMealDetails(ctx, day, meal) {
    const mealData = this.excelParser.getMealData(day, meal);
    if (!mealData || !mealData.name) {
      return ctx.reply('Данные для этого приема пищи не найдены');
    }

    const mealNames = {
      'M1': 'Завтрак',
      'M2': 'Обед',
      'M3': 'Полдник',
      'M4': 'Ужин'
    };

    let message = `
🍽️ <b>${mealNames[meal]} - День ${day}</b>

<b>Блюдо:</b> ${mealData.name}
    `;

    if (mealData.ingredients) {
      message += `\n\n<b>Ингредиенты:</b>\n${mealData.ingredients}`;
    }

    if (mealData.recipe) {
      message += `\n\n<b>Рецепт:</b>\n${mealData.recipe}`;
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '⬅️ Назад к дню', callback_data: `day_${day}` }
        ],
        [
          { text: '💡 Совет дня', callback_data: `tip_${day}` }
        ]
      ]
    };

    await ctx.reply(message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  // Обработка callback-запросов
  setupCallbacks() {
    this.bot.action(/prev_(.+)/, async (ctx) => {
      const day = parseInt(ctx.match[1]);
      const prevDay = day <= 1 ? this.maxDay : day - 1;
      await this.kvStorage.setUserCurrentDay(ctx.chat.id, prevDay);
      await this.showDayOverview(ctx, prevDay);
      await ctx.answerCbQuery();
    });

    this.bot.action(/next_(.+)/, async (ctx) => {
      const day = parseInt(ctx.match[1]);
      const nextDay = day >= this.maxDay ? 1 : day + 1;
      await this.kvStorage.setUserCurrentDay(ctx.chat.id, nextDay);
      await this.showDayOverview(ctx, nextDay);
      await ctx.answerCbQuery();
    });

    this.bot.action(/meal_(.+)_(.+)/, async (ctx) => {
      const day = parseInt(ctx.match[1]);
      const meal = ctx.match[2];
      await this.showMealDetails(ctx, day, meal);
      await ctx.answerCbQuery();
    });

    this.bot.action(/day_(.+)/, async (ctx) => {
      const day = parseInt(ctx.match[1]);
      await this.showDayOverview(ctx, day);
      await ctx.answerCbQuery();
    });

    this.bot.action(/tip_(.+)/, async (ctx) => {
      const day = parseInt(ctx.match[1]);
      const dayData = this.excelParser.getDayData(day);
      
      if (dayData) {
        const tip = await this.openaiService.generateCookingTip(day, dayData);
        await ctx.reply(tip, { parse_mode: 'HTML' });
      }
      
      await ctx.answerCbQuery();
    });
  }

  async initialize() {
    try {
      // Загружаем Excel файл
      const loaded = await this.excelParser.loadExcelFile();
      if (!loaded) {
        console.error('Не удалось загрузить Excel файл');
        return false;
      }

      // Настраиваем callback-обработчики
      this.setupCallbacks();

      console.log('Бот успешно инициализирован');
      return true;
    } catch (error) {
      console.error('Ошибка инициализации бота:', error);
      return false;
    }
  }

  getBot() {
    return this.bot;
  }
}

module.exports = MealBot;
