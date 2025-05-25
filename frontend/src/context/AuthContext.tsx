import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('spendio-token');
    const savedUser = localStorage.getItem('spendio-user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Verify token is still valid
      verifyToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token is invalid, logout
        logout();
      } else {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token, user: userData } = data;
        
        setToken(access_token);
        setUser(userData);
        
        localStorage.setItem('spendio-token', access_token);
        localStorage.setItem('spendio-user', JSON.stringify(userData));
        
        setIsLoading(false);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check if the server is running.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      if (response.ok) {
        // After successful registration, automatically login
        setIsLoading(false);
        return await login(email, password);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Registration failed');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check if the server is running.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('spendio-token');
    localStorage.removeItem('spendio-user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}; 