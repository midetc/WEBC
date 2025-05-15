import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type LayoutProps = {
  children: ReactNode;
};

type MenuItem = {
  name: string;
  path: string;
  icon: string;
};

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems: MenuItem[] = [
    { name: 'Головна', path: '/', icon: 'home' },
    { name: 'Витрати', path: '/expenses', icon: 'money-bill' },
    { name: 'Категорії', path: '/categories', icon: 'list' },
    { name: 'Аналітика', path: '/analytics', icon: 'chart-bar' },
    { name: 'Прогнози', path: '/forecasts', icon: 'chart-line' },
    { name: 'Профіль', path: '/profile', icon: 'user' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-lg transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && (
            <h1 className="text-xl font-semibold text-gray-800">
              ФінТрекер
            </h1>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            <span className="block w-6 h-0.5 bg-gray-600 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-600 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-600"></span>
          </button>
        </div>

        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link 
                  href={item.path}
                  className={`flex items-center p-3 mx-3 rounded-md ${
                    router.pathname === item.path
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <i className={`fas fa-${item.icon} ${isSidebarOpen ? 'mr-4' : 'mx-auto'}`}></i>
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => item.path === router.pathname)?.name || 'Головна'}
          </h2>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Floating Add Button */}
      <button 
        className="fixed right-8 bottom-8 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  );
};

export default Layout; 