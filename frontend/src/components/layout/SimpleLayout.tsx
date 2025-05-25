import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

type SimpleLayoutProps = {
  children: ReactNode;
};

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const navigationLinks = user ? [
    { 
      href: '/', 
      label: 'Головна', 
      icon: '🏠'
    },
    { 
      href: '/categories', 
      label: 'Категорії', 
      icon: '📁'
    },
    { 
      href: '/add-expense', 
      label: 'Додати витрату', 
      icon: '➕'
    },
    { 
      href: '/profile', 
      label: 'Кабінет', 
      icon: '👤'
    },
  ] : [];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`${isDark ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-50`}>
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {user ? (
                <Link href="/" className="group">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-600'} group-hover:scale-105 transition-transform`}>
                      <span className="text-white font-bold text-lg">💰</span>
                    </div>
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                      Spendio
                    </h1>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-600'}`}>
                    <span className="text-white font-bold text-lg">💰</span>
                  </div>
                  <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Spendio
                  </h1>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {user && (
                <nav className="flex items-center space-x-1">
                  {navigationLinks.map((link) => {
                    const isActive = router.pathname === link.href;
                    return (
                      <Link 
                        key={link.href}
                        href={link.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? `${isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} shadow-lg transform scale-105`
                            : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                        }`}
                      >
                        <span className="text-base">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}

              <div className="flex items-center space-x-3">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      👋 {user.name}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        router.push('/login');
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isDark 
                          ? 'text-gray-300 bg-gray-700 hover:bg-red-600 hover:text-white' 
                          : 'text-gray-600 bg-gray-100 hover:bg-red-500 hover:text-white'
                      } transform hover:scale-105`}
                    >
                      Вийти
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isDark 
                          ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                          : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                      } transform hover:scale-105`}
                    >
                      Вхід
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Реєстрація
                    </Link>
                  </div>
                )}
                
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:rotate-180' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:rotate-180'
                  } transform hover:scale-110`}
                  title={isDark ? 'Світла тема' : 'Темна тема'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </div>
            </div>

            {user && (
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <span className={`block w-5 h-0.5 ${isDark ? 'bg-gray-300' : 'bg-gray-600'} transition-all duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                    <span className={`block w-5 h-0.5 ${isDark ? 'bg-gray-300' : 'bg-gray-600'} mt-1 transition-all duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-5 h-0.5 ${isDark ? 'bg-gray-300' : 'bg-gray-600'} mt-1 transition-all duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
              <nav className={`py-4 space-y-2 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50/50'} rounded-lg backdrop-blur-sm`}>
                {navigationLinks.map((link) => {
                  const isActive = router.pathname === link.href;
                  return (
                    <Link 
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `${isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`
                          : `${isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`
                      }`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                <div className="border-t border-gray-600 mx-2 my-2"></div>
                <div className="px-4 py-2">
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                    Привіт, {user.name}!
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDark 
                        ? 'text-red-400 hover:bg-red-600 hover:text-white' 
                        : 'text-red-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    🚪 Вийти з акаунту
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SimpleLayout; 