import React, { useState } from 'react';
import { Transaction, TransactionType, UserProfile, ThemeColor } from '../types';
import { deleteTransaction } from '../services/storageService';
import { generateReceipt } from '../services/pdfService';
import { Trash2, FileText, ArrowUp, ArrowDown, PiggyBank, HandCoins } from 'lucide-react';
import { formatMoney } from '../constants';
import { getThemeStyles } from '../App';
import ConfirmationModal from './ConfirmationModal';

interface Props {
  transactions: Transaction[];
  onUpdate: () => void;
  userProfile: UserProfile | null;
  themeColor: ThemeColor;
}

export default function TransactionList({ transactions, onUpdate, userProfile, themeColor }: Props) {
  const country = userProfile?.country || 'CO';
  const styles = getThemeStyles(themeColor);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getIcon = (type: TransactionType) => {
    switch(type) {
      case TransactionType.INCOME: return <ArrowUp className="text-emerald-500" size={20} strokeWidth={2.5} />;
      case TransactionType.EXPENSE: return <ArrowDown className="text-rose-500" size={20} strokeWidth={2.5} />;
      case TransactionType.SAVING: return <PiggyBank className="text-amber-500" size={20} strokeWidth={2.5} />;
      case TransactionType.LENDING: return <HandCoins className="text-indigo-500" size={20} strokeWidth={2.5} />;
    }
  };

  const executeDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      onUpdate();
      setDeleteId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-32 opacity-50">
        <p className="text-slate-500 font-light text-lg">No hay movimientos recientes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="px-4 mb-6">
        <h2 className="text-2xl font-light text-slate-900 tracking-tight">Historial</h2>
      </div>
      
      {transactions.map((t) => (
        <div key={t.id} className="group glass-card rounded-[1.5rem] p-4 flex items-center justify-between hover:bg-white/60 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/50 shadow-sm ${
                t.type === TransactionType.INCOME ? 'bg-emerald-50' :
                t.type === TransactionType.EXPENSE ? 'bg-rose-50' :
                t.type === TransactionType.SAVING ? 'bg-amber-50' : 'bg-indigo-50'
            }`}>
              {getIcon(t.type)}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-base">{t.category || t.source || t.savingType}</p>
              <p className="text-xs text-slate-400 font-medium">{new Date(t.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className={`text-lg font-light tracking-tight ${
              t.type === TransactionType.INCOME ? 'text-emerald-600' : 
              t.type === TransactionType.EXPENSE ? 'text-slate-900' : 
              'text-slate-700'
            }`}>
              {t.type === TransactionType.EXPENSE || t.type === TransactionType.LENDING ? '-' : '+'} 
              {formatMoney(t.amount, country)}
            </span>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <button onClick={() => generateReceipt(t, country)} className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 hover:text-slate-700">
                    <FileText size={18} />
                </button>
                <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-xl hover:bg-rose-100/50 text-slate-400 hover:text-rose-600">
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmationModal 
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={executeDelete}
          title="Eliminar"
          message="¿Borrar este movimiento?"
          isDestructive={true}
      />
    </div>
  );
}