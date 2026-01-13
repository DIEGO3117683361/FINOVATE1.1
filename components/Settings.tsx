import React, { useState, useRef } from 'react';
import { UserProfile, ThemeColor, TransactionType } from '../types';
import { saveUserProfile, logout, setSessionActive } from '../services/authService';
import { clearAllFinancialData, clearFinancialDataByTypes } from '../services/storageService';
import { User, Shield, Check, Palette, Database, Trash2, ChevronRight, X, Lock, KeyRound, AlertTriangle, Camera, Smartphone } from 'lucide-react';
import { THEME_COLORS } from '../constants';
import { getThemeStyles } from '../App';
import ConfirmationModal from './ConfirmationModal';

interface Props {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
  themeColor: ThemeColor;
}

export default function Settings({ user, onUpdate, onLogout, themeColor }: Props) {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isDirty, setIsDirty] = useState(false);
  const [activeModal, setActiveModal] = useState<'NONE' | 'PIN' | 'DATA'>('NONE');
  const [confirmConfig, setConfirmConfig] = useState<any>({ isOpen: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const styles = getThemeStyles(themeColor);

  // PIN Change State
  const [pinData, setPinData] = useState({ current: '', new: '', confirm: '' });
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Data Cleaning State
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    saveUserProfile(formData);
    // Sync session state immediately based on preference
    setSessionActive(formData.keepSessionOpen);
    onUpdate(formData);
    setIsDirty(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max 300px to save storage space
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          handleChange('avatar', compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePin = () => {
    setPinError('');
    setPinSuccess(false);
    
    if (pinData.current !== user.pin) {
      setPinError('El PIN actual es incorrecto.');
      return;
    }
    if (pinData.new.length !== 4) {
      setPinError('El nuevo PIN debe tener 4 dígitos.');
      return;
    }
    if (pinData.new !== pinData.confirm) {
      setPinError('Los PINs nuevos no coinciden.');
      return;
    }

    // Save new PIN
    const updatedUser = { ...formData, pin: pinData.new };
    setFormData(updatedUser);
    saveUserProfile(updatedUser);
    onUpdate(updatedUser);
    setPinSuccess(true);
    setTimeout(() => {
        setActiveModal('NONE');
        setPinData({ current: '', new: '', confirm: '' });
        setPinSuccess(false);
    }, 1500);
  };

  const toggleDataType = (type: TransactionType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const executeDataCleaning = () => {
    if (selectedTypes.length === 0) return;
    clearFinancialDataByTypes(selectedTypes);
    window.location.reload();
  };

  const executeFactoryReset = () => {
    clearAllFinancialData();
    window.location.reload();
  };

  const sectionClass = "glass-panel rounded-[2rem] p-6 mb-6";
  const labelClass = "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2";
  const inputClass = "w-full glass-input rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";

  return (
    <div className="pb-20 animate-enter relative">
      <div className="flex items-center justify-between mb-8 px-2">
         <h2 className="text-3xl font-light text-slate-900 tracking-tight">Ajustes</h2>
         {isDirty && (
            <button onClick={handleSave} className={`px-5 py-2 rounded-full ${styles.bgGradient} text-white text-sm font-bold shadow-lg liquid-click flex items-center gap-2`}>
                <Check size={16} /> Guardar
            </button>
         )}
      </div>

      {/* Style Section */}
      <div className={sectionClass}>
         <h3 className={labelClass}><Palette size={14} /> Estilo</h3>
         <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {Object.entries(THEME_COLORS).map(([key, config]) => (
                <button
                    key={key}
                    onClick={() => handleChange('themeColor', key)}
                    className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${formData.themeColor === key ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'opacity-50 hover:opacity-100'}`}
                    style={{ backgroundColor: config.hex }}
                >
                    {formData.themeColor === key && <Check size={18} className="text-white" />}
                </button>
            ))}
         </div>
      </div>

      {/* Profile Section */}
      <div className={sectionClass}>
         <h3 className={labelClass}><User size={14} /> Perfil</h3>
         
         {/* Avatar Upload */}
         <div className="flex justify-center mb-8">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl text-slate-300 font-light">{formData.name.charAt(0)}</span>
                    )}
                </div>
                <div className={`absolute bottom-0 right-0 p-2 rounded-full text-white shadow-lg ${styles.bg}`}>
                    <Camera size={16} />
                </div>
                <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleImageUpload} 
                />
            </div>
         </div>

         <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] uppercase text-slate-400 font-bold ml-2 mb-1 block">Nombre</label>
                    <input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} placeholder="Nombre" />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase text-slate-400 font-bold ml-2 mb-1 block">Ocupación</label>
                    <input value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} className={inputClass} placeholder="Ocupación" />
                 </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] uppercase text-slate-400 font-bold ml-2 mb-1 block">Edad</label>
                    <input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} className={inputClass} placeholder="25" />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase text-slate-400 font-bold ml-2 mb-1 block">ID / Documento</label>
                    <input value={formData.idNumber} onChange={(e) => handleChange('idNumber', e.target.value)} className={inputClass} placeholder="12345678" />
                 </div>
             </div>
         </div>
      </div>

      {/* Security Section */}
      <div className={sectionClass}>
          <h3 className={labelClass}><Shield size={14} /> Seguridad</h3>
          <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-1 border-b border-slate-100/50 pb-2">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                         <User size={18} />
                      </div>
                      <span className="text-slate-700 font-medium">Biometría</span>
                  </div>
                  <button 
                    onClick={() => handleChange('biometricsEnabled', !formData.biometricsEnabled)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${formData.biometricsEnabled ? styles.bg : 'bg-slate-200'}`}
                  >
                      <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.biometricsEnabled ? 'translate-x-5' : ''}`} />
                  </button>
              </div>

              <div className="flex justify-between items-center py-2 px-1 pb-2">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                         <Smartphone size={18} />
                      </div>
                      <span className="text-slate-700 font-medium">Mantener Sesión</span>
                  </div>
                  <button 
                    onClick={() => handleChange('keepSessionOpen', !formData.keepSessionOpen)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${formData.keepSessionOpen ? styles.bg : 'bg-slate-200'}`}
                  >
                      <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.keepSessionOpen ? 'translate-x-5' : ''}`} />
                  </button>
              </div>

              <button 
                onClick={() => setActiveModal('PIN')}
                className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 flex justify-between items-center text-slate-700 font-medium transition-colors mt-2"
              >
                  <span className="flex items-center gap-3"><KeyRound size={18} className="text-slate-400"/> Cambiar PIN de acceso</span>
                  <ChevronRight size={16} className="text-slate-400" />
              </button>
          </div>
      </div>

      {/* Data Management Section */}
      <div className={sectionClass}>
          <h3 className={labelClass}><Database size={14} /> Gestión de Datos</h3>
          <button 
             onClick={() => setActiveModal('DATA')}
             className="w-full py-4 text-slate-700 font-bold bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between px-4"
          >
              <span className="flex items-center gap-3"><Trash2 size={18} className="text-slate-400"/> Restablecer Datos</span>
              <ChevronRight size={16} className="text-slate-400" />
          </button>
      </div>
      
      <button onClick={() => { logout(); onLogout(); }} className="w-full py-4 text-slate-400 font-medium hover:text-slate-600 transition-colors mb-10">
          Cerrar Sesión
      </button>

      {/* --- MODALS --- */}

      {/* PIN Change Modal Overlay */}
      {activeModal === 'PIN' && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-slide-up border border-white/50">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Cambiar PIN</h3>
                      <button onClick={() => setActiveModal('NONE')} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
                  </div>
                  
                  {pinSuccess ? (
                      <div className="py-10 text-center">
                          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check size={32} />
                          </div>
                          <p className="text-emerald-700 font-bold">¡PIN Actualizado!</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <input 
                            type="password" maxLength={4} placeholder="PIN Actual" 
                            className={inputClass}
                            value={pinData.current} onChange={e => setPinData({...pinData, current: e.target.value.replace(/\D/g,'')})}
                          />
                          <input 
                            type="password" maxLength={4} placeholder="Nuevo PIN (4 dígitos)" 
                            className={inputClass}
                            value={pinData.new} onChange={e => setPinData({...pinData, new: e.target.value.replace(/\D/g,'')})}
                          />
                          <input 
                            type="password" maxLength={4} placeholder="Confirmar Nuevo PIN" 
                            className={inputClass}
                            value={pinData.confirm} onChange={e => setPinData({...pinData, confirm: e.target.value.replace(/\D/g,'')})}
                          />
                          {pinError && <p className="text-rose-500 text-sm font-medium text-center">{pinError}</p>}
                          
                          <button onClick={handleChangePin} className={`w-full py-3.5 rounded-xl ${styles.bg} text-white font-bold shadow-lg mt-2`}>
                              Actualizar PIN
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Data Management Modal Overlay */}
      {activeModal === 'DATA' && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-slide-up border border-white/50">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Gestionar Datos</h3>
                      <button onClick={() => setActiveModal('NONE')} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
                  </div>

                  <p className="text-sm text-slate-500 mb-6">Selecciona qué información deseas eliminar permanentemente de tu dispositivo.</p>
                  
                  <div className="space-y-3 mb-8">
                      {[
                          { id: TransactionType.EXPENSE, label: 'Gastos' },
                          { id: TransactionType.INCOME, label: 'Ingresos' },
                          { id: TransactionType.SAVING, label: 'Ahorros' },
                          { id: TransactionType.LENDING, label: 'Préstamos' }
                      ].map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => toggleDataType(item.id)}
                            className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                                selectedTypes.includes(item.id) 
                                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}
                          >
                              <span className="font-medium text-slate-700">{item.label}</span>
                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                  selectedTypes.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                              }`}>
                                  {selectedTypes.includes(item.id) && <Check size={14} className="text-white" />}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="space-y-3">
                      <button 
                        onClick={() => {
                            if (selectedTypes.length > 0) {
                                setConfirmConfig({ 
                                    isOpen: true, 
                                    title: '¿Eliminar Selección?', 
                                    message: 'Esta acción no se puede deshacer.', 
                                    onConfirm: executeDataCleaning,
                                    isDestructive: true 
                                });
                            }
                        }}
                        disabled={selectedTypes.length === 0}
                        className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                            selectedTypes.length > 0 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                          Eliminar Seleccionados ({selectedTypes.length})
                      </button>

                      <button 
                        onClick={() => setConfirmConfig({ 
                            isOpen: true, 
                            title: '¿Restablecimiento de Fábrica?', 
                            message: 'Se borrará TODO: perfil, ajustes y transacciones. La app volverá al estado inicial.', 
                            onConfirm: executeFactoryReset,
                            confirmText: 'Borrar Todo',
                            isDestructive: true 
                        })}
                        className="w-full py-3.5 text-rose-500 font-bold bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors flex justify-center items-center gap-2"
                      >
                          <AlertTriangle size={18} /> Restablecimiento Total
                      </button>
                  </div>
              </div>
          </div>
      )}

      <ConfirmationModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig({ isOpen: false })}
          confirmText={confirmConfig.confirmText}
          isDestructive={confirmConfig.isDestructive}
      />
    </div>
  );
}