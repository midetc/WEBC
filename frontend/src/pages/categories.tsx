import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SimpleLayout from '../components/layout/SimpleLayout';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoriesContext';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { categories, addCategory, removeCategory } = useCategories();
  const { user, isLoading } = useAuth();
  const [newCategory, setNewCategory] = useState('');

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

  const defaultCategories = ['Продукти', 'Транспорт', 'Розваги', 'Комунальні', 'Одяг', 'Здоров\'я', 'Інше'];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    if (!confirm(`Видалити категорію "${category}"?`)) return;
    removeCategory(category);
  };

  return (
    <SimpleLayout>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Управління категоріями
        </h1>
        
        <div className={`rounded-lg shadow p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Додати нову категорію
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Назва категорії"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              className={`flex-1 p-2 border rounded ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Додати
            </button>
          </div>
        </div>

        <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Всі категорії ({categories.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => {
              const isDefault = defaultCategories.includes(category);
              return (
                <div
                  key={category}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full mr-3 ${
                      isDefault 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isDefault ? 'Базова' : 'Користувальницька'}
                    </span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {category}
                    </span>
                  </div>
                  
                  {!isDefault && (
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded transition-colors"
                      title="Видалити категорію"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Категорії не знайдено
            </div>
          )}
        </div>

        <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
            <strong>Інфо:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Базові категорії не можна видалити</li>
              <li>Користувальницькі категорії можна видалити в будь-який час</li>
              <li>Категорії зберігаються в localStorage браузера</li>
            </ul>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default Categories; 