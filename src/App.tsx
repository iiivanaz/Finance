import { useState, useEffect } from 'react';
import { useSupabaseFinance } from './hooks/useSupabaseFinance';
import { Auth } from './components/Auth';
import { SummaryCards } from './components/SummaryCards';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Charts } from './components/Charts';
import { ReportGenerator } from './components/ReportGenerator';
import { BudgetManager } from './components/BudgetManager';
import { QuickAdd } from './components/QuickAdd';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
  BarChart3,
  LogOut
} from 'lucide-react';
import type { Transaction, TransactionType } from './types/finance';

function App() {
  const {
    user,
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getSummary
  } = useSupabaseFinance();

  // Budget state (untuk kompatibilitas dengan BudgetManager)
  const [budgets, setBudgets] = useState<any[]>([]);

  // Jika belum login, tampilkan halaman Auth
  if (!user) {
    return <Auth />;
  }

  const summary = getSummary();

  const handleAddTransaction = (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => {
    addTransaction({
      ...data
    });
    toast.success(
      data.type === 'income' ? 'Pemasukan berhasil ditambahkan' : 'Pengeluaran berhasil ditambahkan',
      {
        icon: data.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      }
    );
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success('Transaksi berhasil dihapus', {
      icon: <History className="h-4 w-4" />,
    });
  };

  const handleLogout = async () => {
    const { supabase } = await import('./lib/supabase');
    await supabase.auth.signOut();
    toast.success('Berhasil logout');
  };

  // Data untuk Charts (dihitung dari transactions)
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Monthly data (group by month)
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expense += t.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Budget functions
  const getBudgetStatus = () => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: (spent / budget.amount) * 100
      };
    });
  };

  const setBudget = (budget: any) => {
    setBudgets(prev => [...prev, budget]);
  };

  const deleteBudget = (categoryId: string) => {
    setBudgets(prev => prev.filter(b => b.categoryId !== categoryId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Catatan Keuangan</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <SummaryCards />

        {/* Quick Add */}
        <div className="mt-6">
          <QuickAdd />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Forms and Lists */}
          <div className="lg:col-span-2 space-y-6">
            <TransactionForm />
            
            <TransactionList 
              transactions={transactions}
              onDelete={handleDeleteTransaction}
            />
          </div>

          {/* Right Column - Charts and Budget */}
          <div className="space-y-6">
            <Charts />
            <BudgetManager />
            <ReportGenerator />
          </div>
        </div>
      </main>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
