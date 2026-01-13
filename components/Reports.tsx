import React, { useState } from 'react';
import { Transaction, TransactionType, UserProfile, ThemeColor } from '../types';
import { generateReport } from '../services/pdfService';
import { Download, CalendarDays } from 'lucide-react';
import { formatMoney } from '../constants';
import { getThemeStyles } from '../App';

interface Props {
  transactions: Transaction[];
  userProfile: UserProfile | null;
  themeColor: ThemeColor;
}

export default function Reports({ transactions, userProfile, themeColor }: Props) {
  const [period, setPeriod] = useState('all');
  const country = userProfile?.country || 'CO';
  const styles = getThemeStyles(themeColor);

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  });

  const stats = {
    totalIncome: filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0),
    totalExpense: filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0),
    totalSavings: filteredTransactions.filter(t => t.type === TransactionType.SAVING).reduce((a, b) => a + b.amount, 0),
  };
  const netBalance = stats.totalIncome - stats.totalExpense - stats.totalSavings;

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/50">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Generar Reporte</h2>
            <p className="text-slate-500 mt-2 font-medium">Descarga un resumen detallado de tus finanzas.</p>
          </div>
          
          <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
             {['all', 'month', 'year'].map((p) => (
                 <button 
                   key={p}
                   onClick={() => setPeriod(p)}
                   className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                       period === p ? 'bg-white shadow-md text-slate-900 transform scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
                   }`}
                 >
                   {p === 'all' ? 'Todo' : p === 'month' ? 'Este Mes' : 'Este Año'}
                 </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Ingresos</span>
              <span className="text-xl font-bold text-emerald-600">{formatMoney(stats.totalIncome, country)}</span>
            </div>
            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Gastos</span>
              <span className="text-xl font-bold text-rose-600">{formatMoney(stats.totalExpense, country)}</span>
            </div>
            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Ahorros</span>
              <span className="text-xl font-bold text-amber-600">{formatMoney(stats.totalSavings, country)}</span>
            </div>
            <div className={`p-5 ${styles.bgLight} rounded-[1.5rem] border ${styles.border} text-center`}>
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Balance</span>
              <span className={`text-xl font-bold ${styles.textDark}`}>{formatMoney(netBalance, country)}</span>
            </div>
        </div>

        <button
          onClick={() => generateReport(filteredTransactions, period === 'all' ? 'Histórico Completo' : period === 'month' ? 'Mes Actual' : 'Año Actual', { ...stats, netBalance }, country)}
          className={`w-full py-4 ${styles.bg} hover:brightness-110 text-white rounded-2xl font-bold text-lg shadow-lg ${styles.shadow} transition-all active:scale-[0.98] flex items-center justify-center gap-3`}
        >
          <Download size={24} strokeWidth={2.5} /> Descargar Reporte PDF
        </button>
      </div>

      {/* Preview List */}
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/50">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
            <CalendarDays size={22} className={styles.text} />
            Vista previa de datos ({filteredTransactions.length} registros)
        </h3>
        <div className="h-40 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent z-10 pointer-events-none"></div>
            <table className="w-full text-sm text-left">
                <tbody>
                    {filteredTransactions.slice(0, 5).map(t => (
                        <tr key={t.id} className="border-b border-slate-100">
                            <td className="py-3 text-slate-500 font-medium pl-2">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="py-3 text-slate-800 font-bold">{t.category || t.source}</td>
                            <td className="py-3 text-right text-slate-600 pr-2">{formatMoney(t.amount, country)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}