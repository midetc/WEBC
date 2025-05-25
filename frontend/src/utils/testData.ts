import { Expense } from '../types';
import { format, subDays, subMonths } from 'date-fns';

export const generateTestExpenses = (): Expense[] => {
  const expenses: Expense[] = [];
  const categories = [
    'Продукти', 'Транспорт', 'Розваги', 'Комунальні', 
    'Одяг', 'Здоров\'я', 'Кафе/Ресторани', 'Інше'
  ];

  const baseCosts = {
    'Продукти': 120,
    'Транспорт': 45,
    'Розваги': 180,
    'Комунальні': 650,
    'Одяг': 250,
    'Здоров\'я': 90,
    'Кафе/Ресторани': 100,
    'Інше': 70
  };

  const descriptions = {
    'Продукти': ['Супермаркет', 'Хліб та випічка', 'М\'ясо та риба', 'Овочі та фрукти', 'Молочні продукти', 'Продукти на тиждень', 'Солодощі', 'Напої'],
    'Транспорт': ['Проїзд в метро', 'Автобус', 'Таксі', 'Бензин', 'Парковка', 'Маршрутка', 'Каршеринг', 'Велопрокат'],
    'Розваги': ['Кіно', 'Театр', 'Концерт', 'Боулінг', 'Розважальний центр', 'Гра', 'Книги', 'Стрімінг', 'Спорт'],
    'Комунальні': ['Електроенергія', 'Газ', 'Вода', 'Інтернет', 'Телефон', 'Вивіз сміття', 'Обслуговування', 'Домофон'],
    'Одяг': ['Куртка', 'Джинси', 'Сорочка', 'Взуття', 'Аксесуари', 'Сукня', 'Спортивний одяг', 'Білизна'],
    'Здоров\'я': ['Ліки', 'Вітаміни', 'Лікар', 'Стоматолог', 'Аналізи', 'Медичні послуги', 'Спортзал', 'Масаж'],
    'Кафе/Ресторани': ['Обід', 'Кава', 'Піца', 'Суші', 'Фаст фуд', 'Десерт', 'Сніданок', 'Доставка їжі'],
    'Інше': ['Подарунки', 'Канцтовари', 'Побутова хімія', 'Ремонт', 'Послуги', 'Різне', 'Хімчистка', 'Прання']
  };

  let currentId = 1;

  for (let month = 12; month >= 0; month--) {
    const monthStart = subMonths(new Date(), month);
    
    let seasonMultiplier = 1.0;
    const monthOfYear = monthStart.getMonth();
    
    if ([11, 0, 1].includes(monthOfYear)) seasonMultiplier = 1.3; 
    else if ([5, 6, 7].includes(monthOfYear)) seasonMultiplier = 1.2; 
    else if ([8, 9].includes(monthOfYear)) seasonMultiplier = 1.1; 
    else seasonMultiplier = 0.9; 
    
    const trendMultiplier = 1.0 + (12 - month) * 0.08;
    
    const baseTransactions = 20;
    const transactionsVariation = Math.floor(Math.random() * 25) + 15; 
    
    const highActivityDays = [1, 2, 3, 15, 16]; 
    const weekendBonus = 1.4; 
    
    for (let i = 0; i < transactionsVariation; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const dayOffset = Math.floor(Math.random() * 30);
      const currentDay = subDays(monthStart, dayOffset);
      const date = format(currentDay, 'yyyy-MM-dd');
      const dayOfMonth = currentDay.getDate();
      const dayOfWeek = currentDay.getDay();
      
      let baseAmount = baseCosts[category as keyof typeof baseCosts];
      
      baseAmount *= seasonMultiplier * trendMultiplier;
      
      if (highActivityDays.includes(dayOfMonth)) {
        baseAmount *= 1.5;
      } else if (dayOfMonth > 25) {
        baseAmount *= 0.6;
      }
      
      if ([6, 0].includes(dayOfWeek) && ['Розваги', 'Кафе/Ресторани'].includes(category)) {
        baseAmount *= weekendBonus;
      }
      
      const randomVariation = 0.3 + Math.random() * 1.4; 
      baseAmount *= randomVariation;
      
      if (category === 'Комунальні') {
        if (Math.random() < 0.2) baseAmount *= 2.5; 
        else baseAmount *= 0.8 + Math.random() * 0.4;
      } else if (category === 'Одяг') {
        if (Math.random() < 0.1) baseAmount *= 4; 
        else if (Math.random() < 0.5) baseAmount *= 0.3; 
      } else if (category === 'Розваги') {
        baseAmount *= 0.5 + Math.random() * 2; 
      }
      
      if (Math.random() < 0.05) { 
        baseAmount *= 3 + Math.random() * 3; 
      }
      
      const amount = Math.max(5, Math.round(baseAmount));
      
      const categoryDescriptions = descriptions[category as keyof typeof descriptions];
      const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
      
      expenses.push({
        id: currentId++,
        amount,
        description,
        category,
        date
      });
    }
  }

  const guaranteedAnomalies = [
    {
      amount: 2200 + Math.floor(Math.random() * 800), 
      description: 'Ремонт автомобіля',
      category: 'Транспорт',
      date: format(subDays(new Date(), 5), 'yyyy-MM-dd')
    },
    {
      amount: 3500 + Math.floor(Math.random() * 1000), 
      description: 'Новий ноутбук',
      category: 'Інше',
      date: format(subDays(new Date(), 15), 'yyyy-MM-dd')
    },
    {
      amount: 1600 + Math.floor(Math.random() * 400), 
      description: 'Зимове пальто',
      category: 'Одяг',
      date: format(subDays(new Date(), 25), 'yyyy-MM-dd')
    },
    {
      amount: 4200 + Math.floor(Math.random() * 800), 
      description: 'Стоматологічне лікування',
      category: 'Здоров\'я',
      date: format(subDays(new Date(), 10), 'yyyy-MM-dd')
    },
    {
      amount: 2800 + Math.floor(Math.random() * 700), 
      description: 'Відпустка',
      category: 'Розваги',
      date: format(subDays(new Date(), 30), 'yyyy-MM-dd')
    }
  ];

  guaranteedAnomalies.forEach(anomaly => {
    expenses.push({
      id: currentId++,
      ...anomaly
    });
  });

  return expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const loadTestData = async () => {
  try {
    const { api } = await import('../services/api');
    const testExpenses = generateTestExpenses();
    
    for (const expense of testExpenses) {
      await api.createExpense({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category,
        date: expense.date
      });
    }
    
    return testExpenses;
  } catch (error) {
    console.error('Error loading test data:', error);
    return [];
  }
}; 