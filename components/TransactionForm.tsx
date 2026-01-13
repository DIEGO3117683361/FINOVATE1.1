import React, { useState, useEffect } from 'react';
import { TransactionType, PaymentMethod, SavingType, Transaction, LoanFrequency, Loan, UserProfile, ThemeColor } from '../types';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, LOAN_INTEREST_RATES, formatMoney } from '../constants';
import { saveTransaction, getTransactions, saveLoan, getLoans, updateLoanPayment } from '../services/storageService';
import { getUserProfile } from '../services/authService';
import { X, Check, Calendar, DollarSign, Tag, CreditCard, User, Phone, FileText, Calculator } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateLoanContract } from '../services/pdfService';
import { getThemeStyles } from '../App';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  themeColor: ThemeColor;
}

export default function TransactionForm({ onSuccess, onCancel, themeColor }: Props) {
  const styles = getThemeStyles(themeColor);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [source, setSource] = useState(INCOME_SOURCES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.CASH);
  const [savingType, setSavingType] = useState(SavingType.SAVING);
  const [goal, setGoal] = useState('');

  // Loan Fields
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [interestRate, setInterestRate] = useState<number | ''>('');
  const [termMonths, setTermMonths] = useState<number | ''>('');
  const [frequency, setFrequency] = useState(LoanFrequency.MONTHLY);
  const [calculatedInstallment, setCalculatedInstallment] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');

  useEffect(() => {
    const user = getUserProfile();
    setCurrentUser(user);
    const loans = getLoans().filter(l => l.status === 'active');
    setActiveLoans(loans);
  }, []);

  useEffect(() => {
    if (type === TransactionType.LENDING && amount && interestRate && termMonths) {
      const principal = parseFloat(amount);
      const rateDecimal = Number(interestRate) / 100;
      const term = Number(termMonths);
      const installment = principal * rateDecimal; 
      const totalInterest = installment * term;
      setCalculatedTotal(totalInterest + principal);
      setCalculatedInstallment(installment);
    } else {
      setCalculatedTotal(0);
      setCalculatedInstallment(0);
    }
  }, [amount, interestRate, termMonths, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const txId = uuidv4();
    const numAmount = parseFloat(amount);

    const newTx: Transaction = {
      id: txId,
      type,
      amount: numAmount,
      date,
      description,
      timestamp: Date.now(),
    };

    if (type === TransactionType.EXPENSE) {
      newTx.category = category;
      newTx.paymentMethod = paymentMethod;
    } else if (type === TransactionType.INCOME) {
      newTx.source = source;
      if ((source === 'Cobro de Cuota' || source === 'Liquidación Crédito') && selectedLoanId) {
        newTx.relatedLoanId = selectedLoanId;
        updateLoanPayment(selectedLoanId, numAmount);
      }
    } else if (type === TransactionType.SAVING) {
      newTx.savingType = savingType;
      newTx.goal = goal;
    } else if (type === TransactionType.LENDING) {
        const loanId = uuidv4();
        const newLoan: Loan = {
            id: loanId,
            borrowerName,
            borrowerId,
            borrowerPhone,
            principalAmount: numAmount,
            interestRate: Number(interestRate),
            frequency,
            termMonths: Number(termMonths),
            installmentAmount: calculatedInstallment,
            startDate: date,
            totalToPay: calculatedTotal,
            amountPaid: 0,
            status: 'active',
            transactionId: txId
        };
        saveLoan(newLoan);
        newTx.category = 'Préstamo Otorgado';
        newTx.loanId = loanId;
    }

    saveTransaction(newTx);
    onSuccess();
  };

  const inputClass = `w-full glass-input rounded-2xl px-5 py-4 text-slate-800 outline-none text-base font-medium placeholder-slate-400`;
  const labelClass = `text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1 mb-2 block`;

  return (
    <div className="glass-panel rounded-[3rem] shadow-2xl overflow-hidden animate-enter pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-white/30 flex justify-between items-center bg-white/10 backdrop-blur-md">
        <h2 className="text-xl font-light text-slate-900">Nueva Operación</h2>
        <button onClick={onCancel} className="p-2.5 rounded-full hover:bg-white/40 transition-colors text-slate-500">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Type Selector Pills */}
        <div className="flex bg-white/20 p-1.5 rounded-2xl backdrop-blur-sm border border-white/30">
          {[TransactionType.EXPENSE, TransactionType.INCOME, TransactionType.SAVING, TransactionType.LENDING].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                type === t ? 'bg-white shadow-lg text-slate-800 transform scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === TransactionType.EXPENSE ? 'Gasto' : 
               t === TransactionType.INCOME ? 'Ingreso' : 
               t === TransactionType.SAVING ? 'Ahorro' : 'Prestar'}
            </button>
          ))}
        </div>

        {/* Big Amount Input */}
        <div className="relative group text-center py-4">
          <span className="block text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Monto Total</span>
          <div className="flex items-center justify-center relative">
              <DollarSign className={`text-slate-400 absolute left-0 opacity-50`} size={24} />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`block w-full text-center text-6xl font-extralight text-slate-900 placeholder-slate-200 bg-transparent outline-none transition-colors border-none p-0`}
                required
                autoFocus
              />
          </div>
        </div>

        {/* Date */}
        <div>
            <label className={labelClass}>Fecha y Hora</label>
            <div className="relative">
                <Calendar size={18} className="absolute left-5 top-4 text-slate-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} pl-12`}
                />
            </div>
        </div>

        {/* Dynamic Fields */}
        {type === TransactionType.LENDING ? (
             <div className="space-y-6 animate-enter">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                         <label className={labelClass}>Deudor</label>
                         <div className="relative">
                            <User size={18} className="absolute left-5 top-4 text-slate-400" />
                            <input value={borrowerName} onChange={e => setBorrowerName(e.target.value)} className={`${inputClass} pl-12`} placeholder="Nombre" required />
                         </div>
                     </div>
                     <div>
                         <label className={labelClass}>ID / Documento</label>
                         <input value={borrowerId} onChange={e => setBorrowerId(e.target.value)} className={inputClass} placeholder="Número ID" required />
                     </div>
                 </div>
                 
                 <div className="bg-slate-900/5 rounded-[2rem] p-6 border border-slate-900/5">
                     <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Calculator size={16}/> Calculadora de Intereses</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Interés (%)</label>
                            <input type="number" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} className={`${inputClass} bg-white`} placeholder="0" />
                        </div>
                        <div>
                            <label className={labelClass}>Meses</label>
                            <input type="number" value={termMonths} onChange={e => setTermMonths(Number(e.target.value))} className={`${inputClass} bg-white`} placeholder="12" />
                        </div>
                     </div>
                     {calculatedTotal > 0 && (
                         <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-2">
                             <div className="flex justify-between items-center">
                                 <span className="text-slate-500 text-sm">Cuota Estimada</span>
                                 <span className="text-lg font-bold text-emerald-600">{formatMoney(calculatedInstallment, currentUser?.country)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-slate-500 text-sm">Total a Recibir</span>
                                 <span className="text-lg font-bold text-slate-800">{formatMoney(calculatedTotal, currentUser?.country)}</span>
                             </div>
                         </div>
                     )}
                 </div>
             </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter">
                {type === TransactionType.EXPENSE && (
                    <div>
                        <label className={labelClass}>Categoría</label>
                        <div className="relative">
                            <Tag size={18} className="absolute left-5 top-4 text-slate-400" />
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} pl-12 appearance-none`}>
                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                )}
                
                {type === TransactionType.INCOME && (
                    <div>
                        <label className={labelClass}>Fuente</label>
                        <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
                            {INCOME_SOURCES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}

                {/* Linked Loan */}
                {type === TransactionType.INCOME && (source === 'Cobro de Cuota' || source === 'Liquidación Crédito') && (
                     <div className="md:col-span-2">
                        <label className={labelClass}>Seleccionar Crédito</label>
                        <select value={selectedLoanId} onChange={(e) => setSelectedLoanId(e.target.value)} className={`${inputClass} bg-emerald-50/50 border-emerald-100`}>
                            <option value="">-- Seleccionar --</option>
                            {activeLoans.map(loan => (
                                <option key={loan.id} value={loan.id}>{loan.borrowerName} ({formatMoney(loan.totalToPay - loan.amountPaid, currentUser?.country)})</option>
                            ))}
                        </select>
                     </div>
                )}

                {type === TransactionType.EXPENSE && (
                    <div>
                         <label className={labelClass}>Método</label>
                         <div className="relative">
                             <CreditCard size={18} className="absolute left-5 top-4 text-slate-400" />
                             <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={`${inputClass} pl-12 appearance-none`}>
                                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                         </div>
                    </div>
                )}
             </div>
        )}

        <div className="pt-6 flex gap-4">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl border border-transparent hover:bg-slate-100/50 text-slate-600 font-semibold transition-colors"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className={`flex-1 py-4 rounded-2xl ${styles.bgGradient} text-white font-bold shadow-xl ${styles.glow} liquid-click flex justify-center items-center gap-2`}
            >
                <Check size={20} strokeWidth={2.5} /> Confirmar
            </button>
        </div>
      </form>
    </div>
  );
}