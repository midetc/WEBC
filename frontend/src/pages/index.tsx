import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Expense } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { predictFutureExpenses, getCategoryAnalytics, detectAnomalies, getRecommendations } from '../utils/analytics';
import { loadTestData } from '../utils/testData';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

const Dashboard = () => {
  const router = useRouter();
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = React.useState<Expense[]>([]);
  const [dateRange, setDateRange] = React.useState<string>('all');
  const [customStartDate, setCustomStartDate] = React.useState<string>('');
  const [customEndDate, setCustomEndDate] = React.useState<string>('');
  const [selectedTab, setSelectedTab] = React.useState<'overview' | 'trends' | 'predictions' | 'anomalies'>('overview');
  const { isDark } = useTheme();
  const { user, isLoading } = useAuth();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  const filterExpensesByDate = React.useCallback(() => {
    const now = new Date();
    let filtered = [...expenses];

    switch (dateRange) {
      case 'week':
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        });
        break;
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        });
        break;
      case '3months':
        const threeMonthsAgo = subMonths(now, 3);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= threeMonthsAgo;
        });
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDate = parseISO(customStartDate);
          const endDate = parseISO(customEndDate);
          filtered = expenses.filter(expense => {
            const expenseDate = parseISO(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
          });
        }
        break;
      default:
        filtered = expenses;
    }

    setFilteredExpenses(filtered);
  }, [expenses, dateRange, customStartDate, customEndDate]);

  React.useEffect(() => {
    filterExpensesByDate();
  }, [filterExpensesByDate]);

  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    filteredExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  const getTimeSeriesData = () => {
    const dailyTotals: { [key: string]: number } = {};
    filteredExpenses.forEach(expense => {
      const day = format(parseISO(expense.date), 'MM/dd');
      dailyTotals[day] = (dailyTotals[day] || 0) + expense.amount;
    });
    
    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getRecentExpenses = () => {
    return filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const [predictionPeriod, setPredictionPeriod] = React.useState<'week' | 'month' | '3months' | '6months' | 'year'>('month');
  const [showAccuracyTable, setShowAccuracyTable] = React.useState(false);

  const predictions = React.useMemo(() => predictFutureExpenses(expenses, predictionPeriod), [expenses, predictionPeriod]);
  const categoryAnalytics = React.useMemo(() => getCategoryAnalytics(expenses), [expenses]);
  const anomalies = React.useMemo(() => detectAnomalies(expenses), [expenses]);
  const recommendations = React.useMemo(() => getRecommendations(expenses, predictions), [expenses, predictions]);

  const loadExpenses = async () => {
    try {
      const { api } = await import('../services/api');
      const data = await api.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    }
  };

  const handleLoadTestData = async () => {
    try {
      const testExpenses = await loadTestData();
      setExpenses(testExpenses);
      alert(`Завантажено ${testExpenses.length} тестових витрат! 🎉`);
    } catch (error) {
      console.error('Error loading test data:', error);
      alert('Помилка завантаження тестових даних');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цю витрату?')) return;
    
    try {
      const { api } = await import('../services/api');
      await api.deleteExpense(id);
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  React.useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

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

  const totalExpenses = filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
  const categoryData = getCategoryData();
  const timeSeriesData = getTimeSeriesData();
  const recentExpenses = getRecentExpenses();

  if (expenses.length === 0) {
    return (
      <SimpleLayout>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              🤖 ШІ Аналітика витрат
            </h1>
            <button
              onClick={handleLoadTestData}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              📊 Завантажити тестові дані
            </button>
          </div>
          
          <div className={`rounded-lg shadow p-12 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-6xl mb-4">🤖</div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Готовий до аналізу!
            </h2>
            <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Щоб побачити ШІ-аналітику в дії, завантажте тестові дані або додайте власні витрати
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={handleLoadTestData}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                📊 Завантажити тестові дані
                <div className="text-sm opacity-90 mt-1">200+ витрат з трендами</div>
              </button>
              <Link href="/add-expense">
                <button className={`w-full px-6 py-3 border-2 border-dashed rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  isDark ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>
                  ➕ Додати власну витрату
                  <div className="text-sm opacity-70 mt-1">Створити самостійно</div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            🤖 ШІ Аналітика витрат
          </h1>
          {expenses.length === 0 && (
            <button
              onClick={handleLoadTestData}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              📊 Завантажити тестові дані
            </button>
          )}
        </div>
        
        <div className={`rounded-lg shadow p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📅 Період аналізу
          </h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === 'all'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Весь час
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Цей тиждень
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Цей місяць
            </button>
            <button
              onClick={() => setDateRange('3months')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === '3months'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3 місяці
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === 'custom'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Власний період
            </button>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex gap-3">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={`px-3 py-2 border rounded-md ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={`px-3 py-2 border rounded-md ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}
        </div>

        <div className={`rounded-lg shadow mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'overview'
                  ? `border-b-2 border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                  : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Огляд
            </button>
            <button
              onClick={() => setSelectedTab('trends')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'trends'
                  ? `border-b-2 border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                  : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 Тренди
            </button>
            <button
              onClick={() => setSelectedTab('predictions')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'predictions'
                  ? `border-b-2 border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                  : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔮 Прогнози ШІ
            </button>
            <button
              onClick={() => setSelectedTab('anomalies')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'anomalies'
                  ? `border-b-2 border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                  : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚠️ Аномалії
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Загальна сума
            </h3>
          <p className="text-2xl font-bold text-blue-600">{totalExpenses} ₴</p>
          </div>
          
          <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Кількість витрат
            </h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {filteredExpenses.length}
            </p>
          </div>
          
          <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Середня витрата
            </h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {filteredExpenses.length > 0 ? Math.round(totalExpenses / filteredExpenses.length) : 0} ₴
            </p>
          </div>

          <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Тренд ШІ
            </h3>
            <p className={`text-2xl font-bold ${
              predictions?.trend === 'зростання' ? 'text-red-500' : 
              predictions?.trend === 'спадання' ? 'text-green-500' : 'text-gray-500'
            }`}>
              {predictions?.trend === 'зростання' ? '📈' : 
               predictions?.trend === 'спадання' ? '📉' : '➡️'} 
              {predictions?.trend || 'Стабільно'}
            </p>
          </div>
        </div>

        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Витрати по категоріях
              </h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ₴`, 'Сума']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Немає даних для відображення
                </div>
              )}
            </div>

            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Динаміка витрат
              </h2>
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis 
                      dataKey="date" 
                      stroke={isDark ? '#9CA3AF' : '#6B7280'} 
                      interval={timeSeriesData.length > 30 ? 'preserveStartEnd' : timeSeriesData.length > 15 ? 2 : 0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip 
                      formatter={(value) => [`${value} ₴`, 'Сума']}
                      contentStyle={{
                        backgroundColor: isDark ? '#374151' : '#F9FAFB',
                        border: 'none',
                        borderRadius: '8px',
                        color: isDark ? '#F9FAFB' : '#111827'
                      }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="url(#colorAmount)" />
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Немає даних для відображення
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'trends' && (
          <div className="space-y-6">
            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📈 Аналіз трендів по категоріях
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAnalytics.map((category, index) => (
                  <div key={category.name} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.name}
                      </h3>
                      <span className={`text-lg ${
                        category.trendDirection === 'up' ? 'text-red-500' :
                        category.trendDirection === 'down' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {category.trendDirection === 'up' ? '📈' :
                         category.trendDirection === 'down' ? '📉' : '➡️'}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Всього: <span className="font-bold">{category.total} ₴</span>
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Середня: <span className="font-bold">{category.average} ₴</span>
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Транзакцій: <span className="font-bold">{category.count}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'predictions' && (
          <div className="space-y-6">
            {predictions ? (
              <>
                <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      🔮 Прогноз витрат (ШІ)
                    </h2>
                    <select
                      value={predictionPeriod}
                      onChange={(e) => setPredictionPeriod(e.target.value as any)}
                      className={`px-3 py-2 border rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="week">📅 Тиждень</option>
                      <option value="month">📅 Місяць</option>
                      <option value="3months">📅 3 місяці</option>
                      <option value="6months">📅 Півроку</option>
                      <option value="year">📅 Рік</option>
                    </select>
                  </div>
                  {predictions.isLongTerm && (
                    <div className={`mb-4 p-3 rounded-lg border-l-4 border-yellow-500 ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-lg mr-2">⚠️</span>
                        <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                          <strong>Довгостроковий прогноз:</strong> Точність знижується через сезонність, економічні цикли та непередбачувані події. Використовуйте як орієнтир для планування.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
                        Тренд
                      </h3>
                      <p className={`text-xl font-bold ${
                        predictions.trend === 'зростання' ? 'text-red-500' :
                        predictions.trend === 'спадання' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {predictions.trend}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
                        Прогноз на {predictions.periodLabel}
                      </h3>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                        {predictions.totalPredicted} ₴
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
                        Точність ШІ
                      </h3>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                        {(predictions.accuracy * 100).toFixed(1)}%
                      </p>
                      <button
                        onClick={() => setShowAccuracyTable(!showAccuracyTable)}
                        className={`mt-2 text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } transition-colors`}
                      >
                        {showAccuracyTable ? 'Сховати деталі' : 'Показати деталі'}
                      </button>
                    </div>
                  </div>

                  {showAccuracyTable && predictions.modelMetrics && (
                    <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        📊 Метрики точності ШІ
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className={`p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Точок даних</div>
                          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {predictions.modelMetrics.dataPoints}
                          </div>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Середня за день</div>
                          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round(predictions.modelMetrics.avgDaily)} ₴
                          </div>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Середня за тиждень</div>
                          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round(predictions.modelMetrics.avgWeekly)} ₴
                          </div>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Сезонний фактор</div>
                          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {predictions.modelMetrics.seasonalFactor.toFixed(2)}
                          </div>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Волатильність</div>
                          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {(predictions.modelMetrics.volatility * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className={`mt-4 p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Рівень довіри</div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            predictions.confidenceLevel === 'high' ? 'bg-green-100 text-green-800' :
                            predictions.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {predictions.confidenceLevel === 'high' ? '🟢 Високий' :
                             predictions.confidenceLevel === 'medium' ? '🟡 Середній' : '🔴 Низький'}
                          </div>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {predictions.confidenceLevel === 'high' ? 'Прогноз дуже надійний' :
                             predictions.confidenceLevel === 'medium' ? 'Прогноз помірно надійний' : 'Потрібно більше даних'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={predictions.predictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                      <XAxis 
                        dataKey="day" 
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                        interval={predictionPeriod === 'week' ? 0 : predictionPeriod === 'month' ? 2 : 7} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Tooltip 
                        formatter={(value) => [`${value} ₴`, 'Прогноз']}
                        labelFormatter={(label) => `День ${label}`}
                        contentStyle={{
                          backgroundColor: isDark ? '#374151' : '#F9FAFB',
                          border: 'none',
                          borderRadius: '8px',
                          color: isDark ? '#F9FAFB' : '#111827'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={predictionPeriod === 'week' ? { fill: '#8B5CF6', strokeWidth: 2, r: 4 } : 
                             predictionPeriod === 'month' ? { fill: '#8B5CF6', strokeWidth: 1, r: 2 } : false}
                        connectNulls={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💡 Рекомендації ШІ
                  </h2>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                        rec.type === 'alert' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      }`}>
                        <div className="flex items-start">
                          <span className="text-2xl mr-3">{rec.icon}</span>
                          <div>
                            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {rec.title}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {rec.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Недостатньо даних для прогнозування. Додайте більше витрат.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'anomalies' && (
          <div className="space-y-6">
            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ⚠️ Аномальні витрати
              </h2>
              {anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((anomaly, index) => (
                    <div key={anomaly.id} className={`p-4 rounded-lg border ${isDark ? 'border-red-700 bg-red-900/20' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {anomaly.description}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {anomaly.category} • {anomaly.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-500">
                            {anomaly.amount} ₴
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Оцінка: {anomaly.anomalyScore.toFixed(1)}σ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Аномалії не знайдено</p>
                  <p className="text-sm mt-1">Ваші витрати в межах норми</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Останні витрати
          </h2>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense: Expense) => (
                <div key={expense.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center`}>
                      <span className="text-blue-600 font-bold">₴</span>
                    </div>
      <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {expense.description}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {expense.category} • {expense.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {expense.amount} ₴
                    </p>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>Ще немає витрат</p>
              <p className="text-sm mt-1">Додайте першу витрату, щоб побачити аналітику</p>
            </div>
          )}
        </div>
      </div>

      <Link href="/add-expense">
        <button className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-200 transform hover:scale-110">
          <span className="text-2xl">+</span>
        </button>
      </Link>
    </SimpleLayout>
  );
};

export default Dashboard; 