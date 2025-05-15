import React from 'react';
import Link from 'next/link';
import SimpleLayout from '../components/layout/SimpleLayout';

const Dashboard = () => {
  // Приклад останніх витрат
  const recentExpenses = [
    { id: 1, title: 'Супермаркет', amount: 850, category: 'Продукти', date: '15 травня 2023' },
    { id: 2, title: 'Таксі', amount: 120, category: 'Транспорт', date: '14 травня 2023' },
    { id: 3, title: 'Кав\'ярня', amount: 75, category: 'Розваги', date: '13 травня 2023' },
    { id: 4, title: 'Інтернет', amount: 250, category: 'Комунальні', date: '10 травня 2023' },
  ];

  // Загальна сума витрат
  const totalExpenses = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <SimpleLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Мої витрати</h1>
        
        {/* Загальна статистика */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Загальна сума</h2>
          <p className="text-2xl font-bold text-blue-600">{totalExpenses} ₴</p>
        </div>
      </div>

      {/* Останні витрати */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Останні витрати</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Опис</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Категорія</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Сума</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((expense) => (
                <tr key={expense.id} className="border-t border-gray-200">
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{expense.title}</div>
                    <div className="text-xs text-gray-500">{expense.date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium">
                    {expense.amount} ₴
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Кнопка додавання */}
      <Link href="/add-expense">
        <button 
          className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <span className="text-xl">+</span>
        </button>
      </Link>
    </SimpleLayout>
  );
};

export default Dashboard; 