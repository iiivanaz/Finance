import { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import type { TransactionType } from './types/finance';

function App() {
  const {
    user,
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getSummary
  } = useSupabaseFinance();

  // Budget state
  const [budgets, setBudgets] = useState<any[]>([]);

  // Jika belum login, tampilkan halaman Auth
  if (!user) {
    return <Auth />;
  }

  const summary = getSummary();

  // Data untuk Charts
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

  // Monthly data
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7);
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

  // Monthly stats untuk SummaryCards
  const currentMonth = new Date().toISOString().substring(0, 7);
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const prevMonthStr = previousMonth.toISOString().substring(0, 7);
  
  const monthlyStats = {
    currentMonth: monthlyData[currentMonth] || { income: 0, expense: 0 },
    previousMonth: monthlyData[prevMonthStr] || { income: 0, expense: 0 },
    incomeChange: 0,
    expenseChange: 0
  };

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

  const handleAddTransaction = (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => {
    addTransaction(data);
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
        <SummaryCards 
          summary={{
            totalIncome: summary.income,
            totalExpense: summary.expense,
            balance: summary.balance
          }}
          monthlyStats={monthlyStats}
        />

        {/* Quick Add */}
        <div className="mt-6">
          <QuickAdd onAdd={handleAddTransaction} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Forms and Lists */}
          <div className="lg:col-span-2 space-y-6">
            <TransactionForm onSubmit={handleAddTransaction} />
            
            <TransactionList 
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              onEdit={() => {}} // Placeholder untuk edit
            />
          </div>

          {/* Right Column - Charts and Budget */}
          <div className="space-y-6">
            <Charts 
              expenseByCategory={expenseByCategory}
              incomeByCategory={incomeByCategory}
              monthlyData={monthlyData}
            />
            <BudgetManager 
              budgets={budgets}
              getBudgetStatus={getBudgetStatus}
              setBudget={(budget) => setBudgets([...budgets, budget])}
              deleteBudget={(categoryId) => setBudgets(budgets.filter(b => b.categoryId !== categoryId))}
            />
            <ReportGenerator transactions={transactions} />
          </div>
        </div>
      </main>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
