import React, { useState } from 'react';

type Category = {
  id: number;
  name: string;
};

type ExpenseFormProps = {
  onSubmit: (expense: ExpenseFormData) => void;
  initialData?: ExpenseFormData;
  categories: Category[];
  isEditing?: boolean;
  onCancel: () => void;
};

export type ExpenseFormData = {
  id?: number;
  amount: number;
  description: string;
  categoryId: number;
  date: string;
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  initialData,
  categories,
  isEditing = false,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData || {
      amount: 0,
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : 0,
      date: new Date().toISOString().split('T')[0],
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' || name === 'categoryId' ? Number(value) : value,
    });
    
    // Очищення помилки при зміні поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Сума повинна бути більше 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Опис є обов\'язковим';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Оберіть категорію';
    }
    
    if (!formData.date) {
      newErrors.date = 'Дата є обов\'язковою';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditing ? 'Редагувати витрату' : 'Додати нову витрату'}
      </h2>
      
      {/* Сума */}
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Сума
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.amount ? 'border-red-500' : 'border-gray-300'
          }`}
          step="0.01"
          min="0"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>
      
      {/* Опис */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Опис
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
      
      {/* Категорія */}
      <div className="mb-4">
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          Категорія
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.categoryId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {categories.length === 0 && (
            <option value="">Спочатку створіть категорію</option>
          )}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
        )}
      </div>
      
      {/* Дата */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Дата
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>
      
      {/* Кнопки */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          {isEditing ? 'Оновити' : 'Зберегти'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm; 