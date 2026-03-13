import { useFinance } from '@/hooks/useFinance';
import { SummaryCards } from '@/components/SummaryCards';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Charts } from '@/components/Charts';
import { ReportGenerator } from '@/components/ReportGenerator';
import { BudgetManager } from '@/components/BudgetManager';
import { QuickAdd } from '@/components/QuickAdd';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
  BarChart3,
} from 'lucide-react';
import type { TransactionType } from '@/types/finance';

function App() {
  const {
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
    getCategoryTotals,
    getMonthlyData,
  } = useFinance();

  const summary = getSummary();
  const monthlyStats = getMonthlyStats();
  const expenseByCategory = getCategoryTotals('expense');
  const incomeByCategory = getCategoryTotals('income');
  const monthlyData = getMonthlyData();

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

  const handleEditTransaction = (id: string, data: Partial<{
    amount: number;
    description: string;
    category: string;
    date: string;
  }>) => {
    updateTransaction(id, data);
    toast.success('Transaksi berhasil diperbarui', {
      icon: <History className="h-4 w-4" />,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success('Transaksi berhasil dihapus', {
      icon: <History className="h-4 w-4" />,
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #d4c8b0 50%, #c8bba0 100%)' }}>
        <div className="skeuo-card p-8 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-[#8b5a2b] border-t-[#d4c8b0] animate-spin" />
          <span className="text-[#5a3a1e] font-serif text-lg font-medium">Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #d4c8b0 50%, #c8bba0 100%)', backgroundAttachment: 'fixed' }}>
      {/* Header - Leather Texture */}
      <header className="skeuo-header sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(145deg, #c9a227 0%, #a88220 50%, #8b6914 100%)',
                  border: '2px solid #6b5010',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
              >
                <Wallet className="h-6 w-6 text-[#f5f0e6]" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold" style={{ 
                  background: 'linear-gradient(180deg, #e8d5a3 0%, #c9a227 50%, #a88220 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}>
                  Catatan Keuangan
                </h1>
                <p className="text-xs text-[#c9a227]/80 font-serif italic">Kelola keuanganmu dengan mudah</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#d4c8b0]">
                <BarChart3 className="h-4 w-4" />
                <span className="font-serif">{transactions.length} transaksi</span>
              </div>
              <ReportGenerator transactions={transactions} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Add */}
        <section className="mb-8">
          <QuickAdd onAdd={handleAddTransaction} />
        </section>

        {/* Summary Cards */}
        <section className="mb-8">
          <SummaryCards summary={summary} monthlyStats={monthlyStats} />
        </section>

        {/* Charts */}
        <section className="mb-8">
          <Charts
            expenseByCategory={expenseByCategory}
            incomeByCategory={incomeByCategory}
            monthlyData={monthlyData}
          />
        </section>

        {/* Budget & Form Row */}
        <div className="grid gap-6 lg:grid-cols-5 mb-8">
          {/* Budget Manager */}
          <div className="lg:col-span-2">
            <BudgetManager
              budgets={budgets}
              getBudgetStatus={getBudgetStatus}
              setBudget={setBudget}
              deleteBudget={deleteBudget}
            />
          </div>

          {/* Transaction Form */}
          <div className="lg:col-span-3">
            <TransactionForm onSubmit={handleAddTransaction} />
          </div>
        </div>

        {/* Transaction List */}
        <section>
          <TransactionList
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="skeuo-footer mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#5a3a1e] font-serif">
              Data tersimpan di browser lokal Anda
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(180deg, #4a8a5a 0%, #2d5a3d 100%)', border: '1px solid #1d3a1d' }} />
                <span className="text-[#5a3a1e] font-serif">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(180deg, #a54a4a 0%, #8b3a3a 100%)', border: '1px solid #4a1a1a' }} />
                <span className="text-[#5a3a1e] font-serif">Pengeluaran</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
