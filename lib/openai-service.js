const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = null;
    this.isAvailable = false;
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.isAvailable = true;
    }
  }

  async generateCookingTip(day, mealData) {
    if (!this.isAvailable || !this.openai) {
      return this.getDefaultTip();
    }

    try {
      const mealNames = Object.values(mealData)
        .filter(meal => meal.name)
        .map(meal => meal.name)
        .join(', ');

      const prompt = `День ${day} плана питания. Блюда: ${mealNames}. 
      Дай короткий (2-3 предложения) полезный совет по готовке или организации питания на этот день. 
      Совет должен быть практичным и мотивирующим.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Ты - опытный диетолог и кулинар. Даешь короткие, практичные советы по питанию и готовке."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const tip = completion.choices[0]?.message?.content?.trim();
      return tip || this.getDefaultTip();
    } catch (error) {
      console.error('Ошибка OpenAI API:', error);
      return this.getDefaultTip();
    }
  }

  getDefaultTip() {
    const defaultTips = [
      "💡 Сегодня отличный день для приготовления здоровой пищи! Не забудьте прочитать рецепт заранее и подготовить все ингредиенты.",
      "💡 Планируйте время приготовления с запасом - это поможет избежать стресса и насладиться процессом готовки.",
      "💡 Используйте свежие сезонные продукты - они не только вкуснее, но и полезнее для здоровья.",
      "💡 Приготовьте порцию с запасом - это сэкономит время на завтра и обеспечит здоровый перекус.",
      "💡 Не забывайте про баланс белков, жиров и углеводов в каждом приеме пищи.",
      "💡 Экспериментируйте со специями - они могут превратить простое блюдо в кулинарный шедевр.",
      "💡 Пейте достаточно воды во время приготовления и приема пищи.",
      "💡 Готовьте с любовью - это главный секрет вкусной еды!"
    ];
    
    const randomIndex = Math.floor(Math.random() * defaultTips.length);
    return defaultTips[randomIndex];
  }

  async generateMealSuggestion(day, currentMeals) {
    if (!this.isAvailable || !this.openai) {
      return null;
    }

    try {
      const prompt = `День ${day} плана питания. Текущие блюда: ${JSON.stringify(currentMeals)}. 
      Предложи одно альтернативное блюдо, которое будет хорошо сочетаться с существующим планом. 
      Ответ должен содержать только название блюда и краткое описание (1-2 предложения).`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Ты - диетолог, который предлагает альтернативные блюда для разнообразия рациона."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.error('Ошибка генерации предложения:', error);
      return null;
    }
  }
}

module.exports = OpenAIService;
