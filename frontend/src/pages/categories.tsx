import React, { useState } from 'react';
import SimpleLayout from '../components/layout/SimpleLayout';

const Categories = () => {
  // Приклад категорій
  const [categories, setCategories] = useState([
    { id: 1, name: 'Продукти', count: 12 },
    { id: 2, name: 'Транспорт', count: 8 },
    { id: 3, name: 'Розваги', count: 5 },
    { id: 4, name: 'Комунальні', count: 4 },
    { id: 5, name: 'Одяг', count: 3 },
    { id: 6, name: 'Здоров\'я', count: 2 },
    { id: 7, name: 'Інше', count: 6 }
  ]);

  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    setCategories([
      ...categories,
      {
        id: categories.length + 1,
        name: newCategory,
        count: 0
      }
    ]);
    
    setNewCategory('');
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  return (
    <SimpleLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Категорії</h1>
        
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <form onSubmit={handleAddCategory} className="flex items-center">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Нова категорія"
              className="flex-1 p-2 border border-gray-300 rounded mr-2"
              required
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Додати
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="p-3 flex justify-between items-center">
                <div>
                  <span className="text-gray-800">{category.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({category.count})</span>
                </div>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Видалити
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default Categories; 