import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { 
  Transaction, 
  Budget, 
  BudgetStatus, 
  FinanceSummary, 
  MonthlyStats, 
  CategoryTotal,
  MonthlyData,
  TransactionType 
} from '@/types/finance';

export interface UseSupabaseFinanceReturn {
  user: any | null;
  transactions: Transaction[];
  budgets: Budget[];
  isLoaded: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudget: (category: string, amount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetStatus: (category: string) => BudgetStatus | null;
  getSummary: (startDate?: string, endDate?: string) => FinanceSummary;
  getMonthlyStats: () => MonthlyStats[];
  getCategoryTotals: (type: TransactionType, startDate?: string, endDate?: string) => CategoryTotal[];
  getMonthlyData: () => MonthlyData[];
  refreshData: () => Promise<void>;
}

export function useSupabaseFinance(): UseSupabaseFinanceReturn {
  const [user, setUser] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Session check error:', err);
        setUser(null);
      } finally {
        setIsLoaded(true);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setTransactions([]);
      setBudgets([]);
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (budgetsError) throw budgetsError;
      setBudgets(budgetsData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    }
  }, [user]);

  // Auth functions
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    setBudgets([]);
  };

  // Transaction functions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: user.id,
      }]);

    if (error) throw error;
    await refreshData();
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await refreshData();
  };

  // Budget functions
  const setBudget = async (category: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    // Check if budget for this category already exists
    const existingBudget = budgets.find(b => b.category === category);

    if (existingBudget) {
      // Update existing budget
      const { error } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existingBudget.id)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Create new budget
      const { error } = await supabase
        .from('budgets')
        .insert([{
          category,
          amount,
          user_id: user.id,
        }]);

      if (error) throw error;
    }

    await refreshData();
  };

  const deleteBudget = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await refreshData();
  };

  const getBudgetStatus = (category: string): BudgetStatus | null => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const spent = transactions
      .filter(t => 
        t.category === category && 
        t.type === 'expense' &&
        t.date.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      category,
      budgetAmount: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentage,
      isOverBudget: spent > budget.amount,
      isNearLimit: percentage >= 80 && percentage <= 100,
    };
  };

  // Summary and stats functions
  const getSummary = (startDate?: string, endDate?: string): FinanceSummary => {
    let filteredTransactions = transactions;

    if (startDate && endDate) {
      filteredTransactions = transactions.filter(
        t => t.date >= startDate && t.date <= endDate
      );
    }

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: filteredTransactions.length,
    };
  };

  const getMonthlyStats = (): MonthlyStats[] => {
    const stats: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!stats[month]) {
        stats[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        stats[month].income += t.amount;
      } else {
        stats[month].expense += t.amount;
      }
    });

    return Object.entries(stats)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }));
  };

  const getCategoryTotals = (
    type: TransactionType, 
    startDate?: string, 
    endDate?: string
  ): CategoryTotal[] => {
    let filteredTransactions = transactions.filter(t => t.type === type);

    if (startDate && endDate) {
      filteredTransactions = filteredTransactions.filter(
        t => t.date >= startDate && t.date <= endDate
      );
    }

    const totals: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

    const totalAmount = Object.values(totals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      }));
  };

  const getMonthlyData = (): MonthlyData[] => {
    const data: { [key: string]: { income: number; expense: number } } = {};
    
    // Get last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toISOString().slice(0, 7);
      data[monthKey] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      if (data[month]) {
        if (t.type === 'income') {
          data[month].income += t.amount;
        } else {
          data[month].expense += t.amount;
        }
      }
    });

    return Object.entries(data).map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
    }));
  };

  return {
    user,
    transactions,
    budgets,
    isLoaded,
    error,
    signUp,
    signIn,
    signOut,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    deleteBudget,
    getBudgetStatus,
    getSummary,
    getMonthlyStats,
    getCategoryTotals,
    getMonthlyData,
    refreshData,
  };
}
