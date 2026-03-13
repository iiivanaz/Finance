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

export interface QuickAddItem {
  id: string;
  label: string;
  amount: number;
  category: string;
  type: TransactionType;
  icon: string;
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

export const DEFAULT_QUICK_ADD: QuickAddItem[] = [
  { id: 'q1', label: 'Kopi', amount: 15000, category: 'food', type: 'expense', icon: 'Coffee' },
  { id: 'q2', label: 'Makan Siang', amount: 25000, category: 'food', type: 'expense', icon: 'UtensilsCrossed' },
  { id: 'q3', label: 'Bensin', amount: 50000, category: 'transport', type: 'expense', icon: 'Car' },
  { id: 'q4', label: 'Parkir', amount: 5000, category: 'transport', type: 'expense', icon: 'Car' },
  { id: 'q5', label: 'Gaji', amount: 5000000, category: 'salary', type: 'income', icon: 'Wallet' },
];

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
