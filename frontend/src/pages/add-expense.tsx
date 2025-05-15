import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SimpleLayout from '../components/layout/SimpleLayout';

const AddExpense = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving expense:', formData);
    router.push('/');
  };

  // Приклад категорій
  const categories = [
    'Продукти',
    'Транспорт',
    'Розваги',
    'Комунальні',
    'Одяг',
    'Здоров\'я',
    'Інше'
  ];

  return (
    <SimpleLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Нова витрата</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
          <div className="mb-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Сума
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Опис
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Категорія
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Оберіть категорію</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Дата
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </SimpleLayout>
  );
};

export default AddExpense; 