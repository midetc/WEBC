import { Expense, ExpenseFormData } from '../types';

const API_BASE = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('spendio-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem('spendio-token');
    localStorage.removeItem('spendio-user');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export const api = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const response = await fetch(`${API_BASE}/expenses/`, {
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      
      // Only fallback to localStorage if user is not authenticated
      const token = localStorage.getItem('spendio-token');
      if (!token) {
        console.warn('No authentication token, using localStorage');
        const stored = localStorage.getItem('expenses');
        return stored ? JSON.parse(stored) : [];
      }
      
      throw error;
    }
  },

  async createExpense(data: ExpenseFormData): Promise<Expense> {
    try {
      const response = await fetch(`${API_BASE}/expenses/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          description: data.description,
          category: data.category,
          date: data.date
        })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to create expense:', error);
      
      // Only fallback to localStorage if user is not authenticated
      const token = localStorage.getItem('spendio-token');
      if (!token) {
        console.warn('No authentication token, using localStorage for creation');
        const stored = localStorage.getItem('expenses');
        const expenses: Expense[] = stored ? JSON.parse(stored) : [];
        
        const newExpense: Expense = {
          id: Date.now(),
          amount: parseFloat(data.amount),
          description: data.description,
          category: data.category,
          date: data.date
        };
        
        expenses.push(newExpense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        return newExpense;
      }
      
      throw error;
    }
  },

  async updateExpense(id: number, data: ExpenseFormData): Promise<Expense> {
    try {
      const response = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          description: data.description,
          category: data.category,
          date: data.date
        })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  },

  async deleteExpense(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.status === 204) {
        return; // Success, no content
      }
      
      await handleResponse(response);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      
      // Only fallback to localStorage if user is not authenticated
      const token = localStorage.getItem('spendio-token');
      if (!token) {
        console.warn('No authentication token, using localStorage for deletion');
        const stored = localStorage.getItem('expenses');
        if (stored) {
          const expenses: Expense[] = JSON.parse(stored);
          const filtered = expenses.filter(expense => expense.id !== id);
          localStorage.setItem('expenses', JSON.stringify(filtered));
        }
        return;
      }
      
      throw error;
    }
  },

  // Auth-related API calls
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      // Clear local storage regardless of response
      localStorage.removeItem('spendio-token');
      localStorage.removeItem('spendio-user');
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage
      localStorage.removeItem('spendio-token');
      localStorage.removeItem('spendio-user');
    }
  }
}; 