import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { TransactionType } from '@/types/finance';

interface QuickAddProps {
  onAdd: (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => void;
}

// Parse natural language input
function parseQuickInput(input: string): { amount: number; description: string; type: TransactionType } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Determine type based on first character
  let type: TransactionType = 'expense';
  let workingInput = trimmed;
  
  if (trimmed.startsWith('+')) {
    type = 'income';
    workingInput = trimmed.slice(1).trim();
  } else if (trimmed.startsWith('-')) {
    type = 'expense';
    workingInput = trimmed.slice(1).trim();
  }

  // Parse amount with Indonesian abbreviations
  // Pattern: number + (rb/jt/k) + optional description
  const amountPattern = /^(\d+(?:[.,]\d+)?)\s*(rb|jt|k|ribu|juta)?\b/i;
  const match = workingInput.match(amountPattern);
  
  if (!match) return null;

  let amount = parseFloat(match[1].replace(',', '.'));
  const suffix = match[2]?.toLowerCase();

  // Apply multiplier based on suffix
  switch (suffix) {
    case 'rb':
    case 'ribu':
    case 'k':
      amount *= 1000;
      break;
    case 'jt':
    case 'juta':
      amount *= 1000000;
      break;
  }

  // Get description (everything after the amount)
  const description = workingInput.slice(match[0].length).trim() || 'Tanpa keterangan';

  return { amount, description, type };
}

// Guess category based on description
function guessCategory(description: string, type: TransactionType): string {
  const lowerDesc = description.toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    // Expense categories
    food: ['makan', 'nasi', 'ayam', 'sate', 'bakso', 'mie', 'kopi', 'minum', 'snack', 'jajan', 'restoran', 'warung', 'kantin', 'breakfast', 'lunch', 'dinner'],
    transport: ['bensin', 'parkir', 'gojek', 'grab', 'ojek', 'taksi', 'bus', 'kereta', 'travel', 'transport'],
    shopping: ['belanja', 'baju', 'celana', 'sepatu', 'tas', 'kosmetik', 'elektronik', 'hp', 'laptop'],
    entertainment: ['nonton', 'bioskop', 'game', 'hiburan', 'netflix', 'spotify', 'youtube', 'film'],
    health: ['obat', 'dokter', 'rumah sakit', 'rs', 'klinik', 'apotek', 'sehat', 'sakit'],
    education: ['buku', 'kursus', 'les', 'sekolah', 'kuliah', 'pelatihan', 'belajar'],
    bills: ['listrik', 'air', 'internet', 'wifi', 'pulsa', 'tagihan', 'pajak', 'iuran'],
    housing: ['kontrakan', 'kos', 'sewa', 'rumah', 'apartemen', 'perbaikan', 'furniture'],
    // Income categories
    salary: ['gaji', 'upah', 'honor'],
    bonus: ['bonus', 'thr', 'lembur'],
    freelance: ['freelance', 'project', 'kerja', 'jasa'],
    investment: ['dividen', 'deposito', 'saham', 'investasi', 'bunga'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }

  // Default categories
  return type === 'income' ? 'other-income' : 'other-expense';
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    '-12rb nasi padang',
    '+3jt endorsment',
    '-50rb bensin',
    '+5jt gaji',
    '-25rb kopi',
    '-100rb belanja',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = parseQuickInput(input);
    if (!parsed) {
      toast.error('Format tidak valid. Contoh: -12rb nasi padang atau +3jt endorsment', {
        icon: '❌',
      });
      return;
    }

    const category = guessCategory(parsed.description, parsed.type);
    const today = new Date().toISOString().split('T')[0];

    onAdd({
      amount: parsed.amount,
      description: parsed.description,
      category,
      type: parsed.type,
      date: today,
    });

    const typeLabel = parsed.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    const sign = parsed.type === 'income' ? '+' : '-';
    toast.success(`${typeLabel} ${sign}${parsed.amount.toLocaleString('id-ID')} untuk "${parsed.description}"`, {
      icon: parsed.type === 'income' ? '💰' : '💸',
    });

    setInput('');
    setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
  };

  return (
    <div className="skeuo-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #c9a227 0%, #a88220 50%, #8b6914 100%)',
            border: '2px solid #6b5010',
            boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
          }}
        >
          <Zap className="h-5 w-5 text-[#f5f0e6]" />
        </div>
        <div>
          <h2 className="text-lg font-serif font-bold text-[#5a3a1e]">Tambah Cepat</h2>
          <p className="text-xs text-[#a09080] font-serif">Ketik langsung untuk menambah transaksi</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="skeuo-input h-12 font-serif text-base pr-4"
            style={{ paddingLeft: '12px' }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a09080] font-serif pointer-events-none">
            Tekan Enter
          </div>
        </div>
        <Button
          type="submit"
          className="h-12 px-4 font-serif"
          style={{
            background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 50%, #5a3a1e 100%)',
            border: '1px solid #4a3018',
            boxShadow: '0 4px 0 #3d2914, 0 6px 12px rgba(0,0,0,0.2)',
            color: '#f5f0e6'
          }}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#908070] font-serif">
        <span className="bg-[#f5f0e6] px-2 py-1 rounded border border-[#d8d0c0]">-12rb nasi padang</span>
        <span className="bg-[#f5f0e6] px-2 py-1 rounded border border-[#d8d0c0]">+3jt endorsment</span>
        <span className="bg-[#f5f0e6] px-2 py-1 rounded border border-[#d8d0c0]">-50k bensin</span>
        <span className="bg-[#f5f0e6] px-2 py-1 rounded border border-[#d8d0c0]">+5jt gaji</span>
      </div>
    </div>
  );
}
