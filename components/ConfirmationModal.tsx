import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = "Confirmar", cancelText = "Cancelar", isDestructive = false 
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/25 backdrop-blur-[4px] animate-fade-in">
      <div className="bg-white/85 backdrop-blur-xl rounded-[1.2rem] w-full max-w-[270px] shadow-2xl border border-white/40 overflow-hidden animate-scale-up transform transition-all">
        <div className="p-5 text-center">
            <h3 className="text-[17px] font-bold text-slate-900 mb-1 leading-tight">{title}</h3>
            <p className="text-[13px] text-slate-500 leading-normal">
            {message}
            </p>
        </div>
        <div className="flex border-t border-slate-300/40 divide-x divide-slate-300/40">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[17px] font-normal text-blue-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-[17px] font-bold active:bg-slate-50 transition-colors ${
              isDestructive 
                ? 'text-rose-500' 
                : 'text-blue-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}