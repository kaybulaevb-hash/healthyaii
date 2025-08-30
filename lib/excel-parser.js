const ExcelJS = require('exceljs');
const path = require('path');

class ExcelParser {
  constructor() {
    this.workbook = null;
    this.data = {};
  }

  async loadExcelFile() {
    try {
      const filePath = path.join(process.cwd(), 'data', 'План_питания_15дней_IF_Лента_Томск_без_чечевицы.xlsx');
      this.workbook = new ExcelJS.Workbook();
      await this.workbook.xlsx.readFile(filePath);
      await this.parseData();
      return true;
    } catch (error) {
      console.error('Ошибка загрузки Excel файла:', error);
      return false;
    }
  }

  async parseData() {
    try {
      const worksheet = this.workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('Не удалось найти рабочий лист');
      }

      let currentDay = null;
      let currentMeal = null;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Пропускаем заголовок

        const firstCell = row.getCell(1).value;
        const secondCell = row.getCell(2).value;
        const thirdCell = row.getCell(3).value;

        // Определяем день
        if (firstCell && typeof firstCell === 'string' && firstCell.toLowerCase().includes('день')) {
          const dayMatch = firstCell.match(/(\d+)/);
          if (dayMatch) {
            currentDay = parseInt(dayMatch[1]);
            this.data[currentDay] = {
              M1: { name: '', ingredients: '', recipe: '' },
              M2: { name: '', ingredients: '', recipe: '' },
              M3: { name: '', ingredients: '', recipe: '' },
              M4: { name: '', ingredients: '', recipe: '' }
            };
          }
        }

        // Определяем прием пищи
        if (secondCell && typeof secondCell === 'string') {
          if (secondCell.includes('M1') || secondCell.includes('Завтрак')) {
            currentMeal = 'M1';
          } else if (secondCell.includes('M2') || secondCell.includes('Обед')) {
            currentMeal = 'M2';
          } else if (secondCell.includes('M3') || secondCell.includes('Полдник')) {
            currentMeal = 'M3';
          } else if (secondCell.includes('M4') || secondCell.includes('Ужин')) {
            currentMeal = 'M4';
          }
        }

        // Заполняем данные
        if (currentDay && currentMeal && thirdCell) {
          if (!this.data[currentDay][currentMeal].name) {
            this.data[currentDay][currentMeal].name = thirdCell.toString();
          } else if (!this.data[currentDay][currentMeal].ingredients) {
            this.data[currentDay][currentMeal].ingredients = thirdCell.toString();
          } else if (!this.data[currentDay][currentMeal].recipe) {
            this.data[currentDay][currentMeal].recipe = thirdCell.toString();
          }
        }
      });

      console.log(`Загружено ${Object.keys(this.data).length} дней питания`);
      return true;
    } catch (error) {
      console.error('Ошибка парсинга данных:', error);
      return false;
    }
  }

  getDayData(day) {
    return this.data[day] || null;
  }

  getMealData(day, meal) {
    const dayData = this.data[day];
    return dayData ? dayData[meal] : null;
  }

  getAllDays() {
    return Object.keys(this.data).map(Number).sort((a, b) => a - b);
  }

  getMaxDay() {
    const days = this.getAllDays();
    return days.length > 0 ? Math.max(...days) : 15;
  }
}

module.exports = ExcelParser;
