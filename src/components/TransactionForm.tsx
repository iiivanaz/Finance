import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import type { TransactionType } from '@/types/finance';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/finance';

interface TransactionFormProps {
  onSubmit: (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => void;
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category || !date) return;

    onSubmit({
      amount: Number(amount),
      description,
      category,
      type,
      date,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="skeuo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 50%, #5a3a1e 100%)',
            border: '1px solid #4a3018',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <PlusCircle className="h-4 w-4 text-[#f5f0e6]" />
        </div>
        <h2 className="text-lg font-serif font-bold text-[#5a3a1e]">Tambah Transaksi</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs
          value={type}
          onValueChange={(v) => {
            setType(v as TransactionType);
            setCategory('');
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 p-1"
            style={{
              background: 'linear-gradient(180deg, #d8d0c0 0%, #c8c0b0 100%)',
              border: '1px solid #b0a090',
              borderRadius: '10px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <TabsTrigger
              value="expense"
              className="font-serif data-[state=active]:shadow-lg transition-all"
              style={{
                borderRadius: '8px',
              }}
            >
              <span className="data-[state=active]:text-[#8b3a3a]">Pengeluaran</span>
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="font-serif data-[state=active]:shadow-lg transition-all"
              style={{
                borderRadius: '8px',
              }}
            >
              <span className="data-[state=active]:text-[#2d5a3d]">Pemasukan</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label className="text-sm font-serif text-[#5a3a1e]">Jumlah (Rp)</Label>
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            required
            className="skeuo-input font-serif text-lg h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-serif text-[#5a3a1e]">Keterangan</Label>
          <Input
            placeholder="Contoh: Belanja bulanan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="skeuo-input font-serif h-10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-serif text-[#5a3a1e]">Kategori</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="skeuo-input font-serif h-10">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent 
              className="skeuo-card"
              style={{ background: '#f5f0e6' }}
            >
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="font-serif">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color, border: '1px solid rgba(0,0,0,0.2)' }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-serif text-[#5a3a1e]">Tanggal</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="skeuo-input font-serif h-10"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-serif font-bold text-base mt-4"
          style={{
            background: type === 'income' 
              ? 'linear-gradient(180deg, #4a8a5a 0%, #2d5a3d 50%, #1d4a2d 100%)'
              : 'linear-gradient(180deg, #a54a4a 0%, #8b3a3a 50%, #6b2a2a 100%)',
            border: type === 'income' ? '1px solid #1d3a1d' : '1px solid #4a1a1a',
            borderRadius: '10px',
            boxShadow: `0 4px 0 ${type === 'income' ? '#0d2a0d' : '#3a0a0a'}, 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
            color: '#f5f0e6',
            textShadow: '0 -1px 0 rgba(0,0,0,0.3)',
            transition: 'all 0.1s ease'
          }}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Tambah {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </Button>
      </form>
    </div>
  );
}
