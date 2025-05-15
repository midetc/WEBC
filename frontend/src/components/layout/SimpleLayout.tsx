import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type SimpleLayoutProps = {
  children: ReactNode;
};

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  const router = useRouter();
  
  const navigationLinks = [
    { href: '/', label: 'Головна' },
    { href: '/categories', label: 'Категорії' },
    { href: '/add-expense', label: 'Додати витрату' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Spendio</h1>
          <nav>
            <ul className="flex space-x-6">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={`text-sm font-medium ${
                      router.pathname === link.href
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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