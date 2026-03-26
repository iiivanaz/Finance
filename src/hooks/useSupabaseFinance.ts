import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionType, FinanceSummary, Budget, MonthlyStats, BudgetStatus } from '@/types/finance';

interface DbTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

interface DbBudget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at: string;
}

export function useSupabaseFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, Budget>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check auth status
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        console.log('Checking auth...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) setError(sessionError.message);
        }
        
        console.log('Session:', session ? 'Found' : 'Not found');
        
        if (mounted) {
          setUser(session?.user ?? null);
          setIsLoaded(true);
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('Auth state changed:', _event);
          if (mounted) {
            setUser(session?.user ?? null);
          }
        });

        return () => subscription.unsubscribe();
      } catch (err: any) {
        console.error('Auth check error:', err);
        if (mounted) {
          setError(err.message);
          setIsLoaded(true);
        }
      }
    };

    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Load data when user changes
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!user) {
        setTransactions([]);
        setBudgets({});
        return;
      }

      console.log('Loading data for user:', user.id);
      
      try {
        // Load transactions
        const { data: transactionsData, error: transError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (transError) {
          console.error('Error loading transactions:', transError);
        } else {
          console.log('Loaded transactions:', transactionsData?.length || 0);
          const mappedTransactions: Transaction[] = (transactionsData || []).map((t: DbTransaction) => ({
            id: t.id,
            amount: t.amount,
            description: t.description,
            category: t.category,
            type: t.type,
            date: t.date,
            createdAt: new Date(t.created_at).getTime(),
          }));
          if (mounted) setTransactions(mappedTransactions);
        }

        // Load budgets
        const { data: budgetsData, error: budgetError } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);

        if (budgetError) {
          console.error('Error loading budgets:', budgetError);
        } else {
          console.log('Loaded budgets:', budgetsData?.length || 0);
          const budgetsMap: Record<string, Budget> = {};
          (budgetsData || []).forEach((b: DbBudget) => {
            budgetsMap[b.category_id] = {
              categoryId: b.category_id,
              amount: b.amount,
              period: b.period,
            };
          });
          if (mounted) setBudgets(budgetsMap);
        }
      } catch (err: any) {
        console.error('Load data error:', err);
        if (mounted) setError(err.message);
      }
    };

    loadData();
    
    return () => {
      mounted = false;
    };
  }, [user]);

  // Auth functions
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    setBudgets({});
  }, []);

  // Transaction functions
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          date: transaction.date,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        return null;
      }

      const dbTrans = data as DbTransaction;
      const newTransaction: Transaction = {
        id: dbTrans.id,
        amount: dbTrans.amount,
        description: dbTrans.description,
        category: dbTrans.category,
        type: dbTrans.type,
        date: dbTrans.date,
        createdAt: new Date(dbTrans.created_at).getTime(),
      };

      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error('Add transaction error:', err);
      return null;
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: updates.amount,
          description: updates.description,
          category: updates.category,
          type: updates.type,
          date: updates.date,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating transaction:', error);
        return;
      }

      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates } : t))
      );
    } catch (err) {
      console.error('Update transaction error:', err);
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting transaction:', error);
        return;
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Delete transaction error:', err);
    }
  }, [user]);

  // Budget functions
  const setBudget = useCallback(async (categoryId: string, amount: number, period: 'monthly' | 'yearly' = 'monthly') => {
    if (!user) return;

    const existing = budgets[categoryId];

    try {
      if (existing) {
        const { error } = await supabase
          .from('budgets')
          .update({ amount, period })
          .eq('user_id', user.id)
          .eq('category_id', categoryId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category_id: categoryId,
            amount,
            period,
          });

        if (error) throw error;
      }

      setBudgets(prev => ({
        ...prev,
        [categoryId]: { categoryId, amount, period },
      }));
    } catch (err) {
      console.error('Set budget error:', err);
    }
  }, [user, budgets]);

  const deleteBudget = useCallback(async (categoryId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id)
        .eq('category_id', categoryId);

      if (error) throw error;

      setBudgets(prev => {
        const newBudgets = { ...prev };
        delete newBudgets[categoryId];
        return newBudgets;
      });
    } catch (err) {
      console.error('Delete budget error:', err);
    }
  }, [user]);

  const getBudgetStatus = useCallback((categoryId: string, year: number, month: number): BudgetStatus | null => {
    const budget = budgets[categoryId];
    if (!budget) return null;

    const spent = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.category === categoryId && 
               t.type === 'expense' &&
               date.getFullYear() === year && 
               date.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      budget: budget.amount,
      spent,
      remaining: Math.max(0, budget.amount - spent),
      percentage,
      isWarning: percentage >= 80 && percentage < 100,
      isOver: percentage >= 100,
    };
  }, [transactions, budgets]);

  // Summary functions
  const getSummary = useCallback((): FinanceSummary => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions]);

  const getMonthlyStats = useCallback((): MonthlyStats => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentIncome = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getFullYear() === currentYear && 
               date.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpense = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getFullYear() === currentYear && 
               date.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previousIncome = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getFullYear() === previousYear && 
               date.getMonth() === previousMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpense = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getFullYear() === previousYear && 
               date.getMonth() === previousMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChange = previousIncome > 0 
      ? ((currentIncome - previousIncome) / previousIncome) * 100 
      : 0;
    const expenseChange = previousExpense > 0 
      ? ((currentExpense - previousExpense) / previousExpense) * 100 
      : 0;

    return {
      currentMonth: { income: currentIncome, expense: currentExpense },
      previousMonth: { income: previousIncome, expense: previousExpense },
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  const getCategoryTotals = useCallback((type: TransactionType): Record<string, number> => {
    const filtered = transactions.filter(t => t.type === type);
    const totals: Record<string, number> = {};
    
    filtered.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    
    return totals;
  }, [transactions]);

  const getMonthlyData = useCallback(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[key].income += t.amount;
      } else {
        monthlyData[key].expense += t.amount;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [transactions]);

  const searchTransactions = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t => 
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
    );
  }, [transactions]);

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
    searchTransactions,
  };
}
