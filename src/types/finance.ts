export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  user_id?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  user_id?: string;
  created_at?: string;
}

export interface BudgetStatus {
  category: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export type Category = string;

export const INCOME_CATEGORIES: Category[] = [
  'Gaji',
  'Bonus',
  'Investasi',
  'Freelance',
  'Endorsement',
  'Lainnya'
];

export const EXPENSE_CATEGORIES: Category[] = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan',
  'Lainnya'
];

export const ALL_CATEGORIES: Category[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES
];

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
}
