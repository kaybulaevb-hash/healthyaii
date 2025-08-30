const { kv } = require('@vercel/kv');

class KVStorage {
  constructor() {
    this.prefix = 'meal_bot:';
  }

  async getUserCurrentDay(chatId) {
    try {
      const key = `${this.prefix}current_day:${chatId}`;
      const day = await kv.get(key);
      return day ? parseInt(day) : 1;
    } catch (error) {
      console.error('Ошибка получения текущего дня:', error);
      return 1;
    }
  }

  async setUserCurrentDay(chatId, day) {
    try {
      const key = `${this.prefix}current_day:${chatId}`;
      await kv.set(key, day.toString());
      return true;
    } catch (error) {
      console.error('Ошибка установки текущего дня:', error);
      return false;
    }
  }

  async getUserPreferences(chatId) {
    try {
      const key = `${this.prefix}preferences:${chatId}`;
      const prefs = await kv.get(key);
      return prefs || { language: 'ru', notifications: true };
    } catch (error) {
      console.error('Ошибка получения настроек:', error);
      return { language: 'ru', notifications: true };
    }
  }

  async setUserPreferences(chatId, preferences) {
    try {
      const key = `${this.prefix}preferences:${chatId}`;
      await kv.set(key, preferences);
      return true;
    } catch (error) {
      console.error('Ошибка установки настроек:', error);
      return false;
    }
  }

  async incrementUserUsage(chatId) {
    try {
      const key = `${this.prefix}usage:${chatId}`;
      const current = await kv.get(key) || 0;
      await kv.set(key, current + 1);
      return current + 1;
    } catch (error) {
      console.error('Ошибка инкремента использования:', error);
      return 0;
    }
  }

  async getBotStats() {
    try {
      const statsKey = `${this.prefix}stats`;
      const stats = await kv.get(statsKey) || { total_users: 0, total_requests: 0 };
      return stats;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return { total_users: 0, total_requests: 0 };
    }
  }

  async updateBotStats(newUser = false, newRequest = false) {
    try {
      const statsKey = `${this.prefix}stats`;
      const stats = await kv.get(statsKey) || { total_users: 0, total_requests: 0 };
      
      if (newUser) stats.total_users += 1;
      if (newRequest) stats.total_requests += 1;
      
      await kv.set(statsKey, stats);
      return stats;
    } catch (error) {
      console.error('Ошибка обновления статистики:', error);
      return null;
    }
  }
}

module.exports = KVStorage;
