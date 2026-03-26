import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EXPENSE_CATEGORIES, type BudgetStatus } from '@/types/finance';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BudgetManagerProps {
  budgets: Record<string, { categoryId: string; amount: number; period: 'monthly' | 'yearly' }>;
  getBudgetStatus: (categoryId: string, year: number, month: number) => BudgetStatus | null;
  setBudget: (categoryId: string, amount: number, period?: 'monthly' | 'yearly') => void;
  deleteBudget: (categoryId: string) => void;
}

export function BudgetManager({ budgets, getBudgetStatus, setBudget, deleteBudget }: BudgetManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  
  const now = new Date();
  const categoryMap = EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {} as Record<string, typeof EXPENSE_CATEGORIES[0]>);
  
  const activeBudgets = Object.values(budgets);

  const handleSetBudget = () => {
    if (!selectedCategory || !budgetAmount) return;
    setBudget(selectedCategory, Number(budgetAmount), 'monthly');
    setSelectedCategory('');
    setBudgetAmount('');
    setDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: BudgetStatus) => {
    if (status.isOver) return <AlertCircle className="h-5 w-5 text-[#8b3a3a]" />;
    if (status.isWarning) return <AlertTriangle className="h-5 w-5 text-[#c9a227]" />;
    return <CheckCircle2 className="h-5 w-5 text-[#2d5a3d]" />;
  };

  const getProgressColor = (status: BudgetStatus) => {
    if (status.isOver) return 'bg-[#8b3a3a]';
    if (status.isWarning) return 'bg-[#c9a227]';
    return 'bg-[#2d5a3d]';
  };

  return (
    <div className="skeuo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #c9a227 0%, #a88220 50%, #8b6914 100%)',
              border: '2px solid #6b5010',
              boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
            }}>
            <Target className="h-5 w-5 text-[#f5f0e6]" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#5a3a1e]">Budget Bulanan</h2>
            <p className="text-xs text-[#a09080] font-serif">{format(now, 'MMMM yyyy', { locale: id })}</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm"
              className="gap-2 font-serif"
              style={{
                background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 50%, #5a3a1e 100%)',
                border: '1px solid #4a3018',
                boxShadow: '0 3px 0 #3d2914, 0 4px 8px rgba(0,0,0,0.2)',
                color: '#f5f0e6'
              }}
            >
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="skeuo-card">
            <DialogHeader>
              <DialogTitle className="font-serif text-[#5a3a1e]">Tambah Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-sm font-serif text-[#5a3a1e]">Kategori</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="skeuo-input w-full h-10 mt-1 font-serif"
                >
                  <option value="">Pilih kategori</option>
                  {EXPENSE_CATEGORIES.filter(cat => !budgets[cat.id]).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-serif text-[#5a3a1e]">Budget Bulanan (Rp)</Label>
                <Input
                  type="number"
                  placeholder="1500000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="skeuo-input h-10 mt-1 font-serif"
                />
              </div>
              <Button
                onClick={handleSetBudget}
                disabled={!selectedCategory || !budgetAmount}
                className="w-full font-serif"
                style={{
                  background: 'linear-gradient(180deg, #4a8a5a 0%, #2d5a3d 50%, #1d4a2d 100%)',
                  border: '1px solid #1d3a1d',
                  boxShadow: '0 3px 0 #0d2a0d, 0 4px 8px rgba(0,0,0,0.2)',
                  color: '#f5f0e6'
                }}
              >
                Simpan Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeBudgets.length === 0 ? (
        <div className="text-center py-8 text-[#a09080]">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-serif text-sm">Belum ada budget</p>
          <p className="font-serif text-xs mt-1">Tambah budget untuk mengontrol pengeluaran</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeBudgets.map((budget) => {
            const status = getBudgetStatus(budget.categoryId, now.getFullYear(), now.getMonth());
            const category = categoryMap[budget.categoryId];
            if (!status || !category) return null;

            return (
              <div key={budget.categoryId} className="skeuo-transaction p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="font-serif font-medium text-[#3d2914]">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-serif font-bold ${
                      status.isOver ? 'text-[#8b3a3a]' : 
                      status.isWarning ? 'text-[#c9a227]' : 'text-[#2d5a3d]'
                    }`}>
                      {status.percentage.toFixed(0)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 skeuo-icon-button"
                      onClick={() => deleteBudget(budget.categoryId)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-[#8b3a3a]" />
                    </Button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="h-3 rounded-full overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(180deg, #e0d8c8 0%, #d0c8b8 100%)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(status)}`}
                      style={{ 
                        width: `${Math.min(status.percentage, 100)}%`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-xs font-serif">
                  <span className="text-[#6b4423]">
                    Terpakai: <strong>{formatCurrency(status.spent)}</strong>
                  </span>
                  <span className="text-[#a09080]">
                    Budget: {formatCurrency(status.budget)}
                  </span>
                </div>
                
                {status.isOver && (
                  <p className="text-xs text-[#8b3a3a] font-serif mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Budget melebihi batas! ({formatCurrency(status.spent - status.budget)})
                  </p>
                )}
                {status.isWarning && !status.isOver && (
                  <p className="text-xs text-[#c9a227] font-serif mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Hampir mencapai budget ({formatCurrency(status.remaining)} tersisa)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
