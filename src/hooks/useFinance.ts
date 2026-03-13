import { useState, useEffect, useCallback } from 'react';
import type { Transaction, TransactionType, FinanceSummary, Budget, MonthlyStats } from '@/types/finance';

const STORAGE_KEY = 'personal-finance-data';
const BUDGET_KEY = 'personal-finance-budgets';

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, Budget>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedBudgets = localStorage.getItem(BUDGET_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    
    if (storedBudgets) {
      try {
        const parsed = JSON.parse(storedBudgets);
        setBudgets(parsed);
      } catch (e) {
        console.error('Failed to parse stored budgets:', e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  // Save budgets to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    }
  }, [budgets, isLoaded]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Budget functions
  const setBudget = useCallback((categoryId: string, amount: number, period: 'monthly' | 'yearly' = 'monthly') => {
    setBudgets(prev => ({
      ...prev,
      [categoryId]: { categoryId, amount, period }
    }));
  }, []);

  const deleteBudget = useCallback((categoryId: string) => {
    setBudgets(prev => {
      const newBudgets = { ...prev };
      delete newBudgets[categoryId];
      return newBudgets;
    });
  }, []);

  const getBudgetStatus = useCallback((categoryId: string, year: number, month: number) => {
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

  const getTransactionsByType = useCallback((type: TransactionType) => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  const getTransactionsByMonth = useCallback((year: number, month: number) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [transactions]);

  const getCategoryTotals = useCallback((type: TransactionType) => {
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

  // Search transactions
  const searchTransactions = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t => 
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
    );
  }, [transactions]);

  return {
    transactions,
    budgets,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    deleteBudget,
    getBudgetStatus,
    getSummary,
    getMonthlyStats,
    getTransactionsByType,
    getTransactionsByMonth,
    getCategoryTotals,
    getMonthlyData,
    searchTransactions,
  };
}
