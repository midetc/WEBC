import React, { createContext, useContext, useState, useEffect } from 'react';

type CategoriesContextType = {
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  loadCategories: () => void;
};

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = [
  'Продукти',
  'Транспорт', 
  'Розваги',
  'Комунальні',
  'Одяг',
  'Здоров\'я',
  'Інше'
];

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<string[]>([]);

  const loadCategories = () => {
    const savedCategories = localStorage.getItem('spendio-categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('spendio-categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
  };

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      localStorage.setItem('spendio-categories', JSON.stringify(updatedCategories));
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    if (DEFAULT_CATEGORIES.includes(categoryToRemove)) return;
    
    const updatedCategories = categories.filter(cat => cat !== categoryToRemove);
    setCategories(updatedCategories);
    localStorage.setItem('spendio-categories', JSON.stringify(updatedCategories));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, addCategory, removeCategory, loadCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
}; 