// Простое хранилище в памяти для Railway (альтернатива Vercel KV)
class SimpleStorage {
  constructor() {
    this.storage = new Map();
    this.prefix = 'meal_bot:';
  }

  async getUserCurrentDay(chatId) {
    try {
      const key = `${this.prefix}current_day:${chatId}`;
      const day = this.storage.get(key);
      return day ? parseInt(day) : 1;
    } catch (error) {
      console.error('Ошибка получения текущего дня:', error);
      return 1;
    }
  }

  async setUserCurrentDay(chatId, day) {
    try {
      const key = `${this.prefix}current_day:${chatId}`;
      this.storage.set(key, day.toString());
      return true;
    } catch (error) {
      console.error('Ошибка установки текущего дня:', error);
      return false;
    }
  }

  async getUserPreferences(chatId) {
    try {
      const key = `${this.prefix}preferences:${chatId}`;
      const prefs = this.storage.get(key);
      return prefs || { language: 'ru', notifications: true };
    } catch (error) {
      console.error('Ошибка получения настроек:', error);
      return { language: 'ru', notifications: true };
    }
  }

  async setUserPreferences(chatId, preferences) {
    try {
      const key = `${this.prefix}preferences:${chatId}`;
      this.storage.set(key, preferences);
      return true;
    } catch (error) {
      console.error('Ошибка установки настроек:', error);
      return false;
    }
  }

  async incrementUserUsage(chatId) {
    try {
      const key = `${this.prefix}usage:${chatId}`;
      const current = this.storage.get(key) || 0;
      this.storage.set(key, current + 1);
      return current + 1;
    } catch (error) {
      console.error('Ошибка инкремента использования:', error);
      return 0;
    }
  }

  async getBotStats() {
    try {
      const statsKey = `${this.prefix}stats`;
      const stats = this.storage.get(statsKey) || { total_users: 0, total_requests: 0 };
      return stats;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return { total_users: 0, total_requests: 0 };
    }
  }

  async updateBotStats(newUser = false, newRequest = false) {
    try {
      const statsKey = `${this.prefix}stats`;
      const stats = this.storage.get(statsKey) || { total_users: 0, total_requests: 0 };
      
      if (newUser) stats.total_users += 1;
      if (newRequest) stats.total_requests += 1;
      
      this.storage.set(statsKey, stats);
      return stats;
    } catch (error) {
      console.error('Ошибка обновления статистики:', error);
      return null;
    }
  }
}

module.exports = SimpleStorage;
