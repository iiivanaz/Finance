import { useSupabaseFinance } from '@/hooks/useSupabaseFinance';
import { SummaryCards } from '@/components/SummaryCards';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Charts } from '@/components/Charts';
import { ReportGenerator } from '@/components/ReportGenerator';
import { BudgetManager } from '@/components/BudgetManager';
import { QuickAdd } from '@/components/QuickAdd';
import { Auth } from '@/components/Auth';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Wallet,
  BarChart3,
  LogOut,
  User,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TransactionType, BudgetStatus } from '@/types/finance';

interface MonthlyDataItem {
  month: string;
  income: number;
  expense: number;
}

function App() {
  const {
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
  } = useSupabaseFinance();

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #d4c8b0 50%, #c8bba0 100%)' }}>
        <div className="skeuo-card p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-[#8b3a3a] mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-[#8b3a3a] mb-2">Terjadi Kesalahan</h2>
          <p className="text-[#5a3a1e] font-serif mb-4">{error}</p>
          <p className="text-sm text-[#a09080] font-serif">
            Pastikan environment variables VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diatur dengan benar.
          </p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return (
      <>
        <Auth onSignIn={signIn} onSignUp={signUp} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const summary = getSummary();
  const monthlyStats = getMonthlyStats();
  const expenseByCategory = getCategoryTotals('expense');
  const incomeByCategory = getCategoryTotals('income');
  const monthlyData: MonthlyDataItem[] = getMonthlyData();

  const handleAddTransaction = async (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => {
    const result = await addTransaction(data);
    if (result) {
      toast.success(
        data.type === 'income' ? 'Pemasukan berhasil ditambahkan' : 'Pengeluaran berhasil ditambahkan'
      );
    } else {
      toast.error('Gagal menambahkan transaksi');
    }
  };

  const handleEditTransaction = async (id: string, data: Partial<{
    amount: number;
    description: string;
    category: string;
    date: string;
  }>) => {
    await updateTransaction(id, data);
    toast.success('Transaksi berhasil diperbarui');
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    toast.success('Transaksi berhasil dihapus');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Berhasil keluar');
  };

  const handleGetBudgetStatus = (categoryId: string, year: number, month: number): BudgetStatus | null => {
    return getBudgetStatus(categoryId, year, month);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #d4c8b0 50%, #c8bba0 100%)' }}>
        <div className="skeuo-card p-8 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-[#8b5a2b] border-t-[#d4c8b0] animate-spin" />
          <span className="text-[#5a3a1e] font-serif text-lg font-medium">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #d4c8b0 50%, #c8bba0 100%)', backgroundAttachment: 'fixed' }}>
      {/* Header */}
      <header className="skeuo-header sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(145deg, #c9a227 0%, #a88220 50%, #8b6914 100%)',
                  border: '2px solid #6b5010',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}>
                <Wallet className="h-6 w-6 text-[#f5f0e6]" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold" style={{ 
                  background: 'linear-gradient(180deg, #e8d5a3 0%, #c9a227 50%, #a88220 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Catatan Keuangan
                </h1>
                <p className="text-xs text-[#c9a227]/80 font-serif italic">Kelola keuanganmu dengan mudah</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#d4c8b0]">
                <User className="h-4 w-4" />
                <span className="font-serif">{user.email}</span>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#d4c8b0]">
                <BarChart3 className="h-4 w-4" />
                <span className="font-serif">{transactions.length} transaksi</span>
              </div>
              
              <ReportGenerator transactions={transactions} />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 font-serif text-[#d4c8b0] hover:text-[#f5f0e6] hover:bg-[#8b3a3a]/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
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
          <div className="lg:col-span-2">
            <BudgetManager
              budgets={budgets}
              getBudgetStatus={handleGetBudgetStatus}
              setBudget={setBudget}
              deleteBudget={deleteBudget}
            />
          </div>

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
              Data tersimpan di cloud Supabase
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
