export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Budget {
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlyStats {
  currentMonth: {
    income: number;
    expense: number;
  };
  previousMonth: {
    income: number;
    expense: number;
  };
  incomeChange: number;
  expenseChange: number;
}

export interface BudgetStatus {
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  isWarning: boolean;
  isOver: boolean;
}

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Gaji', type: 'income', icon: 'Wallet', color: '#10b981' },
  { id: 'bonus', name: 'Bonus', type: 'income', icon: 'Gift', color: '#22c55e' },
  { id: 'investment', name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#14b8a6' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#06b6d4' },
  { id: 'other-income', name: 'Lainnya', type: 'income', icon: 'PlusCircle', color: '#8b5cf6' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Makanan', type: 'expense', icon: 'UtensilsCrossed', color: '#ef4444' },
  { id: 'transport', name: 'Transportasi', type: 'expense', icon: 'Car', color: '#f97316' },
  { id: 'shopping', name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#eab308' },
  { id: 'entertainment', name: 'Hiburan', type: 'expense', icon: 'Film', color: '#ec4899' },
  { id: 'health', name: 'Kesehatan', type: 'expense', icon: 'Heart', color: '#f43f5e' },
  { id: 'education', name: 'Pendidikan', type: 'expense', icon: 'BookOpen', color: '#3b82f6' },
  { id: 'bills', name: 'Tagihan', type: 'expense', icon: 'Receipt', color: '#6366f1' },
  { id: 'housing', name: 'Tempat Tinggal', type: 'expense', icon: 'Home', color: '#8b5cf6' },
  { id: 'other-expense', name: 'Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#6b7280' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
