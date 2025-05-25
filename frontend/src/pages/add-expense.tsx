import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SimpleLayout from '../components/layout/SimpleLayout';
import { ExpenseFormData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoriesContext';
import { useAuth } from '../context/AuthContext';

const AddExpense = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { categories } = useCategories();
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Завантаження...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Перенаправлення...
        </p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { api } = await import('../services/api');
      await api.createExpense(formData);
      console.log('Expense saved successfully');
      router.push('/');
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };



  return (
    <SimpleLayout>
      <div className="mb-6">
        <h1 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Нова витрата
        </h1>
        
        <form onSubmit={handleSubmit} className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mb-3">
            <label htmlFor="amount" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Сума
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Опис
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="category" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Категорія
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-2 border rounded mb-2 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            >
              <option value="">Оберіть категорію</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Для управління категоріями перейдіть у розділ{' '}
              <span 
                onClick={() => router.push('/categories')}
                className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
              >
                "Категорії"
              </span>
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Дата
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                isDark 
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
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