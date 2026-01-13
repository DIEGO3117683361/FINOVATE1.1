import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, TransactionType, UserProfile, Loan } from '../types';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Briefcase, FileText } from 'lucide-react';
import { formatMoney } from '../constants';
import { getLoans } from '../services/storageService';
import { generateLoanContract } from '../services/pdfService';
import { getThemeStyles } from '../App';

interface DashboardProps {
  transactions: Transaction[];
  userProfile: UserProfile | null;
}

export default function Dashboard({ transactions, userProfile }: DashboardProps) {
  const country = userProfile?.country || 'CO';
  const themeColor = userProfile?.themeColor || 'blue';
  const styles = getThemeStyles(themeColor);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    setLoans(getLoans());
  }, [transactions]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;

    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) income += t.amount;
      if (t.type === TransactionType.EXPENSE || t.type === TransactionType.LENDING) expense += t.amount;
      if (t.type === TransactionType.SAVING) savings += t.amount;
    });

    return { income, expense, savings, balance: income - expense - savings };
  }, [transactions]);

  const chartData = useMemo(() => {
    // Mock smooth curve data
    return [
      { name: '1', value: stats.balance * 0.8 },
      { name: '2', value: stats.balance * 0.9 },
      { name: '3', value: stats.balance * 0.85 },
      { name: '4', value: stats.balance * 1.1 },
      { name: '5', value: stats.balance },
    ];
  }, [stats]);

  const StatCard = ({ title, amount, icon: Icon, trend, color }: any) => (
    <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-10 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-700 ${color === 'green' ? 'bg-emerald-500' : color === 'red' ? 'bg-rose-500' : 'bg-blue-500'} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`}></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${color === 'green' ? 'bg-emerald-500/10 text-emerald-600' : color === 'red' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-500/10 text-slate-600'}`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        {trend && (
           <span className="text-xs font-medium text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100/50">+2.4%</span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-3xl font-light text-slate-800 tracking-tight">
          {formatMoney(amount, country)}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Balance Card */}
      <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.bgGradient} opacity-[0.08]`}></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-slate-500 font-medium tracking-wide">Balance Total</span>
            <h2 className="text-5xl md:text-6xl font-extralight text-slate-900 mt-2 tracking-tighter">
              {formatMoney(stats.balance, country)}
            </h2>
          </div>
          <div className="h-20 w-full md:w-48">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#1e293b" strokeWidth={2} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard 
          title="Ingresos" 
          amount={stats.income} 
          icon={ArrowUpRight} 
          trend={true}
          color="green"
        />
        <StatCard 
          title="Gastos" 
          amount={stats.expense} 
          icon={ArrowDownRight} 
          color="red"
        />
        <StatCard 
          title="Ahorros" 
          amount={stats.savings} 
          icon={TrendingUp} 
          color="blue"
        />
      </div>

      {/* Loans Section */}
      {loans.length > 0 && (
          <div className="space-y-4">
              <div className="flex items-center gap-3 opacity-60 px-2">
                 <Briefcase size={18} />
                 <span className="text-sm font-semibold uppercase tracking-widest">Préstamos Activos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {loans.filter(l => l.status === 'active').map(loan => {
                      const progress = (loan.amountPaid / loan.totalToPay) * 100;
                      return (
                          <div key={loan.id} className="glass-card rounded-[2rem] p-6 relative overflow-hidden">
                              <div className="flex justify-between items-center mb-6">
                                  <div>
                                      <h4 className="font-medium text-slate-800 text-lg">{loan.borrowerName}</h4>
                                      <p className="text-xs text-slate-400 mt-1">Debe: {formatMoney(loan.totalToPay - loan.amountPaid, country)}</p>
                                  </div>
                                  <button 
                                    onClick={() => generateLoanContract(loan, userProfile?.name || 'Prestamista', country)}
                                    className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                                  >
                                      <FileText size={18} />
                                  </button>
                              </div>
                              
                              <div className="relative h-2 w-full bg-slate-200/30 rounded-full overflow-hidden mb-4">
                                  <div className="absolute top-0 left-0 h-full bg-slate-800 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                              </div>
                              
                              <div className="flex justify-between text-xs font-medium text-slate-400">
                                  <span>Progreso: {Math.round(progress)}%</span>
                                  <span>Meta: {formatMoney(loan.totalToPay, country)}</span>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* Analytics */}
      <div className="glass-card rounded-[2rem] p-8">
        <h3 className="text-lg font-light text-slate-800 mb-8">Flujo Mensual</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Actual', in: stats.income, out: stats.expense }]} barSize={40}>
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}
                formatter={(value: number) => formatMoney(value, country)}
              />
              <Bar dataKey="in" fill="#34D399" radius={[6, 6, 6, 6]} />
              <Bar dataKey="out" fill="#F87171" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}