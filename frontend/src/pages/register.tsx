import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Завантаження...
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Перенаправлення...
        </p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль повинен містити мінімум 6 символів');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(formData.name, formData.email, formData.password);
      if (success) {
        router.push('/');
      } else {
        setError('Не вдалося створити акаунт');
      }
    } catch (error) {
      setError('Сталася помилка при реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Реєстрація в Spendio
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Створіть новий акаунт
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Ім'я
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Ваше ім'я"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Мінімум 6 символів"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Підтвердіть пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Повторіть пароль"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Вже маєте акаунт?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Увійдіть
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} hover:underline`}>
            ← Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 