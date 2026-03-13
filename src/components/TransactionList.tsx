import { useState, useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wallet,
  Gift,
  TrendingUp,
  Laptop,
  PlusCircle,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Film,
  Heart,
  BookOpen,
  Receipt,
  Home,
  MoreHorizontal,
  Trash2,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  X,
  Search,
  Edit2,
  Save,
} from 'lucide-react';
import type { Transaction, TransactionType } from '@/types/finance';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/finance';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Transaction>) => void;
}

type PeriodType = 'all' | '7days' | '1month' | '3months' | '1year' | 'custom';

const iconMap: Record<string, React.ElementType> = {
  Wallet,
  Gift,
  TrendingUp,
  Laptop,
  PlusCircle,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Film,
  Heart,
  BookOpen,
  Receipt,
  Home,
  MoreHorizontal,
};

const categoryMap: Record<string, { name: string; color: string; icon: string; type: TransactionType }> = {
  ...INCOME_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: { ...cat, type: 'income' as TransactionType } }), {}),
  ...EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: { ...cat, type: 'expense' as TransactionType } }), {}),
};

const periodLabels: Record<PeriodType, string> = {
  all: 'Semua Waktu',
  '7days': '7 Hari',
  '1month': '1 Bulan',
  '3months': '3 Bulan',
  '1year': '1 Tahun',
  custom: 'Custom',
};

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [periodType, setPeriodType] = useState<PeriodType>('all');
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');

  const getPeriodConfig = (type: PeriodType) => {
    const now = new Date();
    switch (type) {
      case '7days':
        return { startDate: subDays(now, 7), endDate: now };
      case '1month':
        return { startDate: subMonths(now, 1), endDate: now };
      case '3months':
        return { startDate: subMonths(now, 3), endDate: now };
      case '1year':
        return { startDate: subYears(now, 1), endDate: now };
      case 'custom':
        return { startDate: new Date(customStartDate), endDate: new Date(customEndDate) };
      default:
        return null;
    }
  };

  const periodConfig = getPeriodConfig(periodType);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter((t) => t.type === filter);
    }

    // Filter by period
    if (periodConfig) {
      const start = startOfDay(periodConfig.startDate);
      const end = endOfDay(periodConfig.endDate);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, { start, end });
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(query) ||
        categoryMap[t.category]?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, filter, periodType, customStartDate, customEndDate, searchQuery]);

  const periodSummary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryInfo = (categoryId: string) => {
    return categoryMap[categoryId] || { name: categoryId, color: '#6b7280', icon: 'MoreHorizontal', type: 'expense' };
  };

  const clearPeriodFilter = () => {
    setPeriodType('all');
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditDescription(transaction.description);
    setEditCategory(transaction.category);
    setEditDate(transaction.date);
  };

  const handleSaveEdit = () => {
    if (!editTransaction) return;
    
    onEdit(editTransaction.id, {
      amount: Number(editAmount),
      description: editDescription,
      category: editCategory,
      date: editDate,
    });
    setEditTransaction(null);
  };

  const categories = editTransaction?.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="skeuo-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 50%, #5a3a1e 100%)',
                border: '1px solid #4a3018',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <Calendar className="h-4 w-4 text-[#f5f0e6]" />
            </div>
            <CardTitle className="text-lg font-serif font-bold text-[#5a3a1e]">Riwayat Transaksi</CardTitle>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]" />
              <Input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="skeuo-input h-9 pl-9 pr-8 w-40 sm:w-48 font-serif text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-[#a09080] hover:text-[#8b3a3a]" />
                </button>
              )}
            </div>

            {/* Period Filter Popover */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 font-serif"
                  style={{
                    background: periodType !== 'all' 
                      ? 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 100%)'
                      : 'linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%)',
                    border: '1px solid #b8a890',
                    color: periodType !== 'all' ? '#f5f0e6' : '#5a3a1e',
                    boxShadow: '0 3px 0 #908070, 0 4px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  <Filter className="h-4 w-4" />
                  {periodLabels[periodType]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 skeuo-card" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-[#5a3a1e]">Filter Periode</h4>
                    {periodType !== 'all' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[#8b3a3a]"
                        onClick={clearPeriodFilter}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>

                  <Tabs
                    value={periodType}
                    onValueChange={(v) => setPeriodType(v as PeriodType)}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full gap-1"
                      style={{
                        background: 'linear-gradient(180deg, #d8d0c0 0%, #c8c0b0 100%)',
                        padding: '4px',
                        borderRadius: '8px'
                      }}
                    >
                      <TabsTrigger value="7days" className="font-serif text-xs">7 Hari</TabsTrigger>
                      <TabsTrigger value="1month" className="font-serif text-xs">1 Bulan</TabsTrigger>
                      <TabsTrigger value="3months" className="font-serif text-xs">3 Bulan</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid grid-cols-3 w-full gap-1 mt-1"
                      style={{
                        background: 'linear-gradient(180deg, #d8d0c0 0%, #c8c0b0 100%)',
                        padding: '4px',
                        borderRadius: '8px'
                      }}
                    >
                      <TabsTrigger value="1year" className="font-serif text-xs">1 Tahun</TabsTrigger>
                      <TabsTrigger value="custom" className="font-serif text-xs">Custom</TabsTrigger>
                      <TabsTrigger value="all" className="font-serif text-xs">Semua</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {periodType === 'custom' && (
                    <div className="space-y-3 pt-2 border-t border-[#c8bba0]">
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

                  {periodConfig && (
                    <div className="text-xs text-[#5a3a1e] bg-[#f5f0e6] p-2 rounded border border-[#d8d0c0] font-serif">
                      {format(periodConfig.startDate, 'dd MMM yyyy', { locale: id })} - {format(periodConfig.endDate, 'dd MMM yyyy', { locale: id })}
                    </div>
                  )}

                  <Button
                    className="w-full font-serif"
                    style={{
                      background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 50%, #5a3a1e 100%)',
                      border: '1px solid #4a3018',
                      boxShadow: '0 3px 0 #3d2914, 0 4px 8px rgba(0,0,0,0.2)',
                      color: '#f5f0e6'
                    }}
                    onClick={() => setFilterOpen(false)}
                  >
                    Terapkan
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Type Filter */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as TransactionType | 'all')}>
              <TabsList className="h-9 gap-1"
                style={{
                  background: 'linear-gradient(180deg, #d8d0c0 0%, #c8c0b0 100%)',
                  padding: '3px',
                  borderRadius: '8px'
                }}
              >
                <TabsTrigger value="all" className="text-xs px-3 font-serif data-[state=active]:shadow-md">
                  Semua
                </TabsTrigger>
                <TabsTrigger value="expense" className="text-xs px-3 font-serif data-[state=active]:shadow-md">
                  Keluar
                </TabsTrigger>
                <TabsTrigger value="income" className="text-xs px-3 font-serif data-[state=active]:shadow-md">
                  Masuk
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Summary Bar */}
        {periodSummary.count > 0 && (
          <div className="flex items-center gap-4 mt-3 text-sm bg-[#f5f0e6] p-2 rounded-lg border border-[#d8d0c0]">
            <span className="text-[#5a3a1e] font-serif">
              <strong>{periodSummary.count}</strong> transaksi
            </span>
            {periodSummary.totalIncome > 0 && (
              <span className="text-[#2d5a3d] font-serif font-medium">
                +{formatCurrency(periodSummary.totalIncome)}
              </span>
            )}
            {periodSummary.totalExpense > 0 && (
              <span className="text-[#8b3a3a] font-serif font-medium">
                -{formatCurrency(periodSummary.totalExpense)}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#a09080]">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mb-3"
                style={{
                  background: 'linear-gradient(180deg, #e8e0d0 0%, #d8d0c0 100%)',
                  border: '2px solid #c8bba0',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <Calendar className="h-8 w-8" />
              </div>
              <p className="font-serif text-sm">
                {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada transaksi'}
              </p>
              {(periodType !== 'all' || searchQuery) && (
                <p className="font-serif text-xs mt-1">
                  {searchQuery ? 'Coba kata kunci lain' : 'Coba ubah filter periode'}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const categoryInfo = getCategoryInfo(transaction.category);
                const IconComponent = iconMap[categoryInfo.icon] || MoreHorizontal;

                return (
                  <div
                    key={transaction.id}
                    className="skeuo-transaction flex items-center justify-between p-3 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(180deg, ${categoryInfo.color}40 0%, ${categoryInfo.color}60 100%)`,
                          border: `1px solid ${categoryInfo.color}80`,
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <IconComponent
                          className="h-5 w-5"
                          style={{ color: categoryInfo.color, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}
                        />
                      </div>
                      <div>
                        <p className="font-serif font-medium text-sm text-[#3d2914]">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-xs px-2 py-0.5 rounded font-serif"
                            style={{
                              background: transaction.type === 'income' 
                                ? 'linear-gradient(180deg, #d0e8d0 0%, #b8dcb8 100%)'
                                : 'linear-gradient(180deg, #e8d0d0 0%, #dcb8b8 100%)',
                              border: transaction.type === 'income' ? '1px solid #4a8a5a' : '1px solid #a54a4a',
                              color: transaction.type === 'income' ? '#1d4a2d' : '#6b2a2a'
                            }}
                          >
                            {categoryInfo.name}
                          </span>
                          <span className="text-xs text-[#908070] font-serif">
                            {format(new Date(transaction.date), 'd MMM yyyy', { locale: id })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p
                          className={`font-serif font-bold text-sm ${
                            transaction.type === 'income'
                              ? 'text-[#1d4a2d]'
                              : 'text-[#6b2a2a]'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex justify-end mt-0.5">
                          {transaction.type === 'income' ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-[#4a8a5a]" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-[#a54a4a]" />
                          )}
                        </div>
                      </div>
                      
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 skeuo-icon-button"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit2 className="h-4 w-4 text-[#8b5a2b]" />
                      </Button>
                      
                      {/* Delete Button */}
                      <Dialog open={deleteId === transaction.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 skeuo-icon-button"
                            onClick={() => setDeleteId(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-[#8b3a3a]" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="skeuo-card">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-[#5a3a1e]">Hapus Transaksi</DialogTitle>
                            <DialogDescription className="font-serif text-[#908070]">
                              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setDeleteId(null)}
                              className="font-serif"
                            >
                              Batal
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                onDelete(transaction.id);
                                setDeleteId(null);
                              }}
                              className="font-serif"
                              style={{
                                background: 'linear-gradient(180deg, #a54a4a 0%, #8b3a3a 50%, #6b2a2a 100%)',
                                border: '1px solid #4a1a1a',
                                boxShadow: '0 3px 0 #3a0a0a, 0 4px 8px rgba(0,0,0,0.2)'
                              }}
                            >
                              Hapus
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editTransaction} onOpenChange={() => setEditTransaction(null)}>
        <DialogContent className="skeuo-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#5a3a1e]">Edit Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-serif text-[#5a3a1e]">Jumlah (Rp)</Label>
              <Input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="skeuo-input h-10 mt-1 font-serif"
              />
            </div>
            <div>
              <Label className="text-sm font-serif text-[#5a3a1e]">Keterangan</Label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="skeuo-input h-10 mt-1 font-serif"
              />
            </div>
            <div>
              <Label className="text-sm font-serif text-[#5a3a1e]">Kategori</Label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="skeuo-input w-full h-10 mt-1 font-serif"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-serif text-[#5a3a1e]">Tanggal</Label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="skeuo-input h-10 mt-1 font-serif"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setEditTransaction(null)}
                variant="outline"
                className="flex-1 font-serif"
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 font-serif gap-2"
                style={{
                  background: 'linear-gradient(180deg, #4a8a5a 0%, #2d5a3d 50%, #1d4a2d 100%)',
                  border: '1px solid #1d3a1d',
                  boxShadow: '0 3px 0 #0d2a0d, 0 4px 8px rgba(0,0,0,0.2)',
                  color: '#f5f0e6'
                }}
              >
                <Save className="h-4 w-4" />
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
