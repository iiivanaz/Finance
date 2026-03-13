import type { FinanceSummary, MonthlyStats } from '@/types/finance';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface SummaryCardsProps {
  summary: FinanceSummary;
  monthlyStats: MonthlyStats;
}

export function SummaryCards({ summary, monthlyStats }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change: number, isIncome: boolean) => {
    // For income: increase is good (green), decrease is bad (red)
    // For expense: increase is bad (red), decrease is good (green)
    if (change === 0) return 'text-[#a09080]';
    if (isIncome) {
      return change > 0 ? 'text-[#2d5a3d]' : 'text-[#8b3a3a]';
    } else {
      return change > 0 ? 'text-[#8b3a3a]' : 'text-[#2d5a3d]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Monthly Stats Banner */}
      <div className="skeuo-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #4a6a8a 0%, #3a5a7a 50%, #2a4a6a 100%)',
                border: '2px solid #1a3a5a',
                boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
              }}
            >
              <TrendingUp className="h-5 w-5 text-[#f0f5f8]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#5a3a1e]">Statistik Bulan Ini</h3>
              <p className="text-xs text-[#a09080] font-serif">Dibandingkan bulan lalu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Income Change */}
            <div className="text-center">
              <p className="text-xs text-[#a09080] font-serif mb-1">Pemasukan</p>
              <div className={`flex items-center gap-1 font-serif font-bold ${getChangeColor(monthlyStats.incomeChange, true)}`}>
                {getChangeIcon(monthlyStats.incomeChange)}
                <span>{Math.abs(monthlyStats.incomeChange).toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Expense Change */}
            <div className="text-center">
              <p className="text-xs text-[#a09080] font-serif mb-1">Pengeluaran</p>
              <div className={`flex items-center gap-1 font-serif font-bold ${getChangeColor(monthlyStats.expenseChange, false)}`}>
                {getChangeIcon(monthlyStats.expenseChange)}
                <span>{Math.abs(monthlyStats.expenseChange).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Income Card */}
        <div className="skeuo-summary-income p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-20"
            style={{ background: 'radial-gradient(circle at top right, #4a8a5a 0%, transparent 70%)' }}
          />
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-serif font-semibold" style={{ color: '#2d5a3d' }}>
              Total Pemasukan
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #4a8a5a 0%, #2d5a3d 50%, #1d4a2d 100%)',
                border: '1px solid #1d3a1d',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <TrendingUp className="h-5 w-5 text-[#e8f5e8]" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold" style={{ color: '#1d4a2d' }}>
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-xs mt-2 font-serif" style={{ color: '#4a8a5a' }}>
            Semua pemasukan tercatat
          </p>
        </div>

        {/* Expense Card */}
        <div className="skeuo-summary-expense p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-20"
            style={{ background: 'radial-gradient(circle at top right, #a54a4a 0%, transparent 70%)' }}
          />
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-serif font-semibold" style={{ color: '#8b3a3a' }}>
              Total Pengeluaran
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #a54a4a 0%, #8b3a3a 50%, #6b2a2a 100%)',
                border: '1px solid #4a1a1a',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <TrendingDown className="h-5 w-5 text-[#f5e8e8]" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold" style={{ color: '#6b2a2a' }}>
            {formatCurrency(summary.totalExpense)}
          </div>
          <p className="text-xs mt-2 font-serif" style={{ color: '#a54a4a' }}>
            Semua pengeluaran tercatat
          </p>
        </div>

        {/* Balance Card */}
        <div className="skeuo-summary-balance p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-20"
            style={{ background: 'radial-gradient(circle at top right, #4a6a8a 0%, transparent 70%)' }}
          />
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-serif font-semibold" style={{ color: '#4a6a8a' }}>
              Saldo Saat Ini
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{
                background: summary.balance >= 0 
                  ? 'linear-gradient(180deg, #4a6a8a 0%, #3a5a7a 50%, #2a4a6a 100%)'
                  : 'linear-gradient(180deg, #a54a4a 0%, #8b3a3a 50%, #6b2a2a 100%)',
                border: summary.balance >= 0 ? '1px solid #1a3a5a' : '1px solid #4a1a1a',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <Wallet className="h-5 w-5 text-[#f0f5f8]" />
            </div>
          </div>
          <div className={`text-2xl font-serif font-bold ${summary.balance >= 0 ? 'text-[#2a4a6a]' : 'text-[#6b2a2a]'}`}>
            {formatCurrency(summary.balance)}
          </div>
          <p className={`text-xs mt-2 font-serif ${summary.balance >= 0 ? 'text-[#4a6a8a]' : 'text-[#a54a4a]'}`}>
            {summary.balance >= 0 ? 'Saldo positif' : 'Saldo negatif'}
          </p>
        </div>
      </div>
    </div>
  );
}
