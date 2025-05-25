import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {  const router = useRouter();  const { login, user, isLoading: authLoading, error: authError } = useAuth();  const { isDark } = useTheme();  const [formData, setFormData] = useState({    email: '',    password: ''  });  const [error, setError] = useState('');  const [isLoading, setIsLoading] = useState(false); 

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

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push('/');
      } else {
        setError('Неправильний email або пароль');
      }
    } catch (error) {
      setError('Сталася помилка при вході');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Вхід до Spendio
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Увійдіть до свого акаунту
          </p>
        </div>

        {(error || authError) && (
          <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-200">
            <p className="text-sm text-red-800">{error || authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="mb-6">
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
              placeholder="Ваш пароль"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Ще немає акаунту?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Зареєструйтесь
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

export default Login; 