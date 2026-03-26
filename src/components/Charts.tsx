import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';

interface ChartsProps {
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
  monthlyData: { month: string; income: number; expense: number }[];
}

export function Charts({ expenseByCategory, incomeByCategory, monthlyData }: ChartsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp${(value / 1000000).toFixed(1)}jt`;
    } else if (value >= 1000) {
      return `Rp${(value / 1000).toFixed(0)}rb`;
    }
    return `Rp${value}`;
  };

  const expenseChartData = Object.entries(expenseByCategory)
    .map(([categoryId, amount]) => {
      const category = EXPENSE_CATEGORIES.find((c) => c.id === categoryId);
      return {
        name: category?.name || categoryId,
        value: amount,
        color: category?.color || '#6b7280',
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const incomeChartData = Object.entries(incomeByCategory)
    .map(([categoryId, amount]) => {
      const category = INCOME_CATEGORIES.find((c) => c.id === categoryId);
      return {
        name: category?.name || categoryId,
        value: amount,
        color: category?.color || '#6b7280',
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const formattedMonthlyData = monthlyData.map((item) => {
    const [year, month] = item.month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return {
      ...item,
      label: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`,
    };
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg border"
          style={{
            background: 'linear-gradient(180deg, #f5f0e6 0%, #ebe5d8 100%)',
            border: '1px solid #c8bba0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
          {label && <p className="font-serif font-bold text-[#5a3a1e] mb-1">{label}</p>}
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-serif" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Expense by Category */}
      <div className="skeuo-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #a54a4a 0%, #8b3a3a 50%, #6b2a2a 100%)',
              border: '1px solid #4a1a1a',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
            <PieChartIcon className="h-4 w-4 text-[#f5e8e8]" />
          </div>
          <h3 className="font-serif font-bold text-[#5a3a1e]">Pengeluaran per Kategori</h3>
        </div>
        {expenseChartData.length > 0 ? (
          <div className="skeuo-chart p-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value">
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#f5f0e6" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-serif text-[#5a3a1e]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-[#a09080] skeuo-chart">
            <p className="text-sm font-serif">Belum ada data pengeluaran</p>
          </div>
        )}
      </div>

      {/* Income by Category */}
      <div className="skeuo-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #4a8a5a 0%, #2d5a3d 50%, #1d4a2d 100%)',
              border: '1px solid #1d3a1d',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
            <PieChartIcon className="h-4 w-4 text-[#e8f5e8]" />
          </div>
          <h3 className="font-serif font-bold text-[#5a3a1e]">Pemasukan per Kategori</h3>
        </div>
        {incomeChartData.length > 0 ? (
          <div className="skeuo-chart p-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value">
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#f5f0e6" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-serif text-[#5a3a1e]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-[#a09080] skeuo-chart">
            <p className="text-sm font-serif">Belum ada data pemasukan</p>
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="skeuo-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #4a6a8a 0%, #3a5a7a 50%, #2a4a6a 100%)',
              border: '1px solid #1a3a5a',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
            <BarChart3 className="h-4 w-4 text-[#f0f5f8]" />
          </div>
          <h3 className="font-serif font-bold text-[#5a3a1e]">Tren Bulanan</h3>
        </div>
        {formattedMonthlyData.length > 0 ? (
          <div className="skeuo-chart p-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={formattedMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c8bba0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#5a3a1e', fontFamily: 'Georgia' }}
                  axisLine={{ stroke: '#b8a890' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#5a3a1e', fontFamily: 'Georgia' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="income"
                  name="Pemasukan"
                  fill="#2d5a3d"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="#8b3a3a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-[#a09080] skeuo-chart">
            <p className="text-sm font-serif">Belum ada data bulanan</p>
          </div>
        )}
      </div>
    </div>
  );
}
