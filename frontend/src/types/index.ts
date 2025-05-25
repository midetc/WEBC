
export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  color?: string;
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
  date: string;
} 