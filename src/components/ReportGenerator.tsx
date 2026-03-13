import { useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileDown, Download, Loader2, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Transaction } from '@/types/finance';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/finance';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportGeneratorProps {
  transactions: Transaction[];
}

type PeriodType = '7days' | '1month' | '3months' | '1year' | 'custom';

interface PeriodConfig {
  label: string;
  startDate: Date;
  endDate: Date;
}

const categoryMap: Record<string, { name: string; color: string }> = {
  ...INCOME_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {}),
  ...EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {}),
};

export function ReportGenerator({ transactions }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [periodType, setPeriodType] = useState<PeriodType>('1month');
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const reportRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    return categoryMap[categoryId]?.name || categoryId;
  };

  const getPeriodConfig = (type: PeriodType): PeriodConfig => {
    const now = new Date();
    switch (type) {
      case '7days':
        return {
          label: '7 Hari Terakhir',
          startDate: subDays(now, 7),
          endDate: now,
        };
      case '1month':
        return {
          label: '1 Bulan Terakhir',
          startDate: subMonths(now, 1),
          endDate: now,
        };
      case '3months':
        return {
          label: '3 Bulan Terakhir',
          startDate: subMonths(now, 3),
          endDate: now,
        };
      case '1year':
        return {
          label: '1 Tahun Terakhir',
          startDate: subYears(now, 1),
          endDate: now,
        };
      case 'custom':
        return {
          label: `Periode Custom`,
          startDate: new Date(customStartDate),
          endDate: new Date(customEndDate),
        };
      default:
        return {
          label: '1 Bulan Terakhir',
          startDate: subMonths(now, 1),
          endDate: now,
        };
    }
  };

  const periodConfig = getPeriodConfig(periodType);

  const filteredTransactions = useMemo(() => {
    const start = startOfDay(periodConfig.startDate);
    const end = endOfDay(periodConfig.endDate);
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return isWithinInterval(transactionDate, { start, end });
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, periodConfig]);

  const periodSummary = useMemo(() => {
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
    };
  }, [filteredTransactions]);

  const generatePDF = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      let imgY = 10;
      
      const scaledHeight = imgHeight * ratio * (pdfWidth - 20) / (imgWidth * ratio);
      let heightLeft = scaledHeight;
      let position = imgY;

      pdf.addImage(imgData, 'PNG', 10, imgY, pdfWidth - 20, scaledHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, scaledHeight);
        heightLeft -= (pdfHeight - 20);
      }

      const dateStr = format(new Date(), 'yyyy-MM-dd', { locale: id });
      const periodLabel = periodType === 'custom' 
        ? `${customStartDate}-sampai-${customEndDate}`
        : periodType;
      pdf.save(`Laporan-Keuangan-${periodLabel}-${dateStr}.pdf`);
      
      setPreviewOpen(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const expenseByCategory: Record<string, number> = {};
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
  
  const topExpenses = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const incomeByCategory: Record<string, number> = {};
  filteredTransactions
    .filter(t => t.type === 'income')
    .forEach(t => {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });
  
  const topIncomes = Object.entries(incomeByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 font-serif"
            style={{
              background: 'linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%)',
              border: '1px solid #b8a890',
              color: '#5a3a1e',
              boxShadow: '0 3px 0 #908070, 0 4px 6px rgba(0,0,0,0.15)'
            }}
          >
            <FileDown className="h-4 w-4" />
            Laporan PDF
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto skeuo-card">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between font-serif text-[#5a3a1e]">
              <span>Pratinjau Laporan</span>
              <Button
                onClick={generatePDF}
                disabled={isGenerating || filteredTransactions.length === 0}
                className="gap-2 font-serif"
                style={{
                  background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 50%, #5a3a1e 100%)',
                  border: '1px solid #4a3018',
                  boxShadow: '0 3px 0 #3d2914, 0 4px 8px rgba(0,0,0,0.2)',
                  color: '#f5f0e6'
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Membuat PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Unduh PDF
                  </>
                )}
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Period Selection */}
          <div className="mb-4 space-y-4">
            <div>
              <Label className="text-sm font-bold mb-2 block font-serif text-[#5a3a1e]">Pilih Periode</Label>
              <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                <TabsList className="grid grid-cols-5 w-full gap-1"
                  style={{
                    background: 'linear-gradient(180deg, #d8d0c0 0%, #c8c0b0 100%)',
                    padding: '4px',
                    borderRadius: '8px'
                  }}
                >
                  <TabsTrigger value="7days" className="font-serif text-xs">7 Hari</TabsTrigger>
                  <TabsTrigger value="1month" className="font-serif text-xs">1 Bulan</TabsTrigger>
                  <TabsTrigger value="3months" className="font-serif text-xs">3 Bulan</TabsTrigger>
                  <TabsTrigger value="1year" className="font-serif text-xs">1 Tahun</TabsTrigger>
                  <TabsTrigger value="custom" className="font-serif text-xs">Custom</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {periodType === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1 block font-serif text-[#5a3a1e]">Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="skeuo-input h-9 font-serif"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block font-serif text-[#5a3a1e]">Tanggal Selesai</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="skeuo-input h-9 font-serif"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-[#5a3a1e] bg-[#f5f0e6] p-3 rounded-lg border border-[#d8d0c0] font-serif">
              <Calendar className="h-4 w-4 text-[#8b5a2b]" />
              <span>
                Periode: <strong>{format(periodConfig.startDate, 'dd MMM yyyy', { locale: id })}</strong>
                {' '}sampai{' '}
                <strong>{format(periodConfig.endDate, 'dd MMM yyyy', { locale: id })}</strong>
                {' '}({filteredTransactions.length} transaksi)
              </span>
            </div>
          </div>

          {/* Report Content */}
          <div
            ref={reportRef}
            className="bg-white p-8 text-slate-800"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            {/* Header */}
            <div className="text-center border-b-4 border-[#8b5a2b] pb-6 mb-8"
              style={{
                background: 'linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%)',
                margin: '-32px -32px 32px -32px',
                padding: '32px'
              }}
            >
              <h1 className="text-3xl font-serif font-bold text-[#3d2914] mb-2">
                LAPORAN KEUANGAN PRIBADI
              </h1>
              <p className="text-[#8b5a2b] text-lg font-serif font-bold mb-1">
                {periodConfig.label.toUpperCase()}
              </p>
              <p className="text-[#6b4423] font-serif">
                Periode: {format(periodConfig.startDate, 'dd MMMM yyyy', { locale: id })} - {format(periodConfig.endDate, 'dd MMMM yyyy', { locale: id })}
              </p>
              <p className="text-[#a09080] text-sm mt-2 font-serif">
                Dibuat pada: {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}
              </p>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-xl font-serif font-bold text-[#5a3a1e] mb-2">Tidak Ada Data</h2>
                <p className="text-[#a09080] font-serif">Tidak ada transaksi pada periode yang dipilih.</p>
              </div>
            ) : (
              <>
                {/* Summary Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-serif font-bold text-[#3d2914] mb-4 border-l-4 border-[#4a6a8a] pl-3">
                    Ringkasan Keuangan
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border-2 border-[#4a8a5a]"
                      style={{ background: 'linear-gradient(180deg, #e8f5e8 0%, #d0e8d0 100%)' }}>
                      <p className="text-sm text-[#2d5a3d] mb-1 font-serif">Total Pemasukan</p>
                      <p className="text-xl font-serif font-bold text-[#1d4a2d]">
                        {formatCurrency(periodSummary.totalIncome)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-[#a54a4a]"
                      style={{ background: 'linear-gradient(180deg, #f5e8e8 0%, #e8d0d0 100%)' }}>
                      <p className="text-sm text-[#8b3a3a] mb-1 font-serif">Total Pengeluaran</p>
                      <p className="text-xl font-serif font-bold text-[#6b2a2a]">
                        {formatCurrency(periodSummary.totalExpense)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${periodSummary.balance >= 0 ? 'border-[#4a6a8a]' : 'border-[#a54a4a]'}`}
                      style={{ background: periodSummary.balance >= 0 
                        ? 'linear-gradient(180deg, #f0f5f8 0%, #d8e0e8 100%)' 
                        : 'linear-gradient(180deg, #f5e8e8 0%, #e8d0d0 100%)' }}>
                      <p className={`text-sm mb-1 font-serif ${periodSummary.balance >= 0 ? 'text-[#4a6a8a]' : 'text-[#a54a4a]'}`}>
                        Saldo Periode
                      </p>
                      <p className={`text-xl font-serif font-bold ${periodSummary.balance >= 0 ? 'text-[#2a4a6a]' : 'text-[#6b2a2a]'}`}>
                        {formatCurrency(periodSummary.balance)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="mb-8">
                  <h2 className="text-xl font-serif font-bold text-[#3d2914] mb-4 border-l-4 border-[#8b5a2b] pl-3">
                    Statistik Transaksi
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border-2 border-[#c8bba0] text-center"
                      style={{ background: 'linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%)' }}>
                      <p className="text-3xl font-serif font-bold text-[#3d2914]">{filteredTransactions.length}</p>
                      <p className="text-sm text-[#6b4423] font-serif">Total Transaksi</p>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-[#4a8a5a] text-center"
                      style={{ background: 'linear-gradient(180deg, #e8f5e8 0%, #d0e8d0 100%)' }}>
                      <p className="text-3xl font-serif font-bold text-[#1d4a2d]">
                        {filteredTransactions.filter(t => t.type === 'income').length}
                      </p>
                      <p className="text-sm text-[#2d5a3d] font-serif">Pemasukan</p>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-[#a54a4a] text-center"
                      style={{ background: 'linear-gradient(180deg, #f5e8e8 0%, #e8d0d0 100%)' }}>
                      <p className="text-3xl font-serif font-bold text-[#6b2a2a]">
                        {filteredTransactions.filter(t => t.type === 'expense').length}
                      </p>
                      <p className="text-sm text-[#8b3a3a] font-serif">Pengeluaran</p>
                    </div>
                    <div className={`p-4 rounded-lg border-2 text-center ${periodSummary.balance >= 0 ? 'border-[#4a6a8a]' : 'border-[#a54a4a]'}`}
                      style={{ background: periodSummary.balance >= 0 
                        ? 'linear-gradient(180deg, #f0f5f8 0%, #d8e0e8 100%)' 
                        : 'linear-gradient(180deg, #f5e8e8 0%, #e8d0d0 100%)' }}>
                      <p className={`text-3xl font-serif font-bold ${periodSummary.balance >= 0 ? 'text-[#2a4a6a]' : 'text-[#6b2a2a]'}`}>
                        {periodSummary.balance >= 0 ? '+' : '-'}
                      </p>
                      <p className={`text-sm font-serif ${periodSummary.balance >= 0 ? 'text-[#4a6a8a]' : 'text-[#a54a4a]'}`}>Status</p>
                    </div>
                  </div>
                </div>

                {/* Top Income Categories */}
                {topIncomes.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-serif font-bold text-[#3d2914] mb-4 border-l-4 border-[#4a8a5a] pl-3">
                      Kategori Pemasukan Terbesar
                    </h2>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr style={{ background: 'linear-gradient(180deg, #d0e8d0 0%, #b8dcb8 100%)' }}>
                          <th className="border-2 border-[#4a8a5a] px-4 py-2 text-left font-serif text-[#1d4a2d]">No</th>
                          <th className="border-2 border-[#4a8a5a] px-4 py-2 text-left font-serif text-[#1d4a2d]">Kategori</th>
                          <th className="border-2 border-[#4a8a5a] px-4 py-2 text-right font-serif text-[#1d4a2d]">Jumlah</th>
                          <th className="border-2 border-[#4a8a5a] px-4 py-2 text-right font-serif text-[#1d4a2d]">Persentase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topIncomes.map(([category, amount], index) => (
                          <tr key={category} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f5f0e6]'}>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 font-serif">{index + 1}</td>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 font-serif">{getCategoryName(category)}</td>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 text-right font-serif font-medium text-[#1d4a2d]">
                              {formatCurrency(amount)}
                            </td>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 text-right font-serif">
                              {periodSummary.totalIncome > 0 
                                ? ((amount / periodSummary.totalIncome) * 100).toFixed(1) 
                                : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Top Expense Categories */}
                {topExpenses.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-serif font-bold text-[#3d2914] mb-4 border-l-4 border-[#a54a4a] pl-3">
                      Kategori Pengeluaran Terbesar
                    </h2>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr style={{ background: 'linear-gradient(180deg, #e8d0d0 0%, #dcb8b8 100%)' }}>
                          <th className="border-2 border-[#a54a4a] px-4 py-2 text-left font-serif text-[#6b2a2a]">No</th>
                          <th className="border-2 border-[#a54a4a] px-4 py-2 text-left font-serif text-[#6b2a2a]">Kategori</th>
                          <th className="border-2 border-[#a54a4a] px-4 py-2 text-right font-serif text-[#6b2a2a]">Jumlah</th>
                          <th className="border-2 border-[#a54a4a] px-4 py-2 text-right font-serif text-[#6b2a2a]">Persentase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topExpenses.map(([category, amount], index) => (
                          <tr key={category} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f5f0e6]'}>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 font-serif">{index + 1}</td>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 font-serif">{getCategoryName(category)}</td>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 text-right font-serif font-medium text-[#6b2a2a]">
                              {formatCurrency(amount)}
                            </td>
                            <td className="border-2 border-[#c8bba0] px-4 py-2 text-right font-serif">
                              {periodSummary.totalExpense > 0 
                                ? ((amount / periodSummary.totalExpense) * 100).toFixed(1) 
                                : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* All Transactions */}
                <div className="mb-8">
                  <h2 className="text-xl font-serif font-bold text-[#3d2914] mb-4 border-l-4 border-[#8b5a2b] pl-3">
                    Daftar Transaksi ({filteredTransactions.length})
                  </h2>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ background: 'linear-gradient(180deg, #e8e0d0 0%, #d8d0c0 100%)' }}>
                        <th className="border-2 border-[#8b5a2b] px-3 py-2 text-left font-serif text-[#3d2914]">No</th>
                        <th className="border-2 border-[#8b5a2b] px-3 py-2 text-left font-serif text-[#3d2914]">Tanggal</th>
                        <th className="border-2 border-[#8b5a2b] px-3 py-2 text-left font-serif text-[#3d2914]">Keterangan</th>
                        <th className="border-2 border-[#8b5a2b] px-3 py-2 text-left font-serif text-[#3d2914]">Kategori</th>
                        <th className="border-2 border-[#8b5a2b] px-3 py-2 text-right font-serif text-[#3d2914]">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((t, index) => (
                        <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f5f0e6]'}>
                          <td className="border-2 border-[#c8bba0] px-3 py-2 text-sm font-serif">{index + 1}</td>
                          <td className="border-2 border-[#c8bba0] px-3 py-2 text-sm font-serif">
                            {format(new Date(t.date), 'dd/MM/yyyy', { locale: id })}
                          </td>
                          <td className="border-2 border-[#c8bba0] px-3 py-2 font-serif">{t.description}</td>
                          <td className="border-2 border-[#c8bba0] px-3 py-2 text-sm">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-serif ${
                              t.type === 'income' 
                                ? 'bg-[#d0e8d0] text-[#1d4a2d] border border-[#4a8a5a]' 
                                : 'bg-[#e8d0d0] text-[#6b2a2a] border border-[#a54a4a]'
                            }`}>
                              {getCategoryName(t.category)}
                            </span>
                          </td>
                          <td className={`border-2 border-[#c8bba0] px-3 py-2 text-right font-serif font-medium ${
                            t.type === 'income' ? 'text-[#1d4a2d]' : 'text-[#6b2a2a]'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-4 border-[#8b5a2b] text-center text-sm text-[#6b4423] font-serif"
              style={{ background: 'linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%)', margin: '0 -32px -32px -32px', padding: '24px 32px' }}>
              <p>Laporan ini dibuat otomatis oleh aplikasi Catatan Keuangan Pribadi</p>
              <p className="mt-1">© {new Date().getFullYear()} - Semua data bersifat pribadi dan rahasia</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
