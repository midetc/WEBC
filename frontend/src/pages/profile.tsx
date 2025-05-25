import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SimpleLayout from '../components/layout/SimpleLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <SimpleLayout>
        <div className="text-center py-8">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Завантаження...
          </p>
        </div>
      </SimpleLayout>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: user.name,
      email: user.email
    });
  };

  const handleSave = () => {
    console.log('Saving user data:', editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      email: user.email
    });
  };

  return (
    <SimpleLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Особистий кабінет
        </h1>

        <div className="grid md:grid-cols-1 gap-8">
          <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} mx-auto w-full max-w-2xl`}>
            <h2 className={`text-xl font-semibold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Профіль користувача
            </h2>
            
            {!isEditing ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-600'}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ім'я
                    </label>
                    <p className={`mt-1 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <p className={`mt-1 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.email}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      ID користувача
                    </label>
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      #{user.id}
                    </p>
                  </div>
                </div>

                <div className="pt-6 text-center">
                  <button
                    onClick={handleEdit}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Редагувати профіль
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ім'я
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full p-3 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={`w-full p-3 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="flex justify-center space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Зберегти
                  </button>
                  <button
                    onClick={handleCancel}
                    className={`px-5 py-2.5 rounded-md transition-colors font-medium ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} mx-auto w-full max-w-2xl`}>
            <h2 className={`text-xl font-semibold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Налаштування акаунту
            </h2>
            
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Вийти з акаунту
              </button>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default Profile; 