import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { isDark } = useTheme();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Завантаження...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Перенаправлення на сторінку входу...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 