import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveUserProfile, setSessionActive } from '../services/authService';
import { ArrowRight, User, Briefcase, Fingerprint, ShieldCheck, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

// Fixed: Component defined OUTSIDE the main component to prevent re-rendering/focus loss
const InputField = ({ label, value, onChange, type = "text", placeholder, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      {Icon && <div className="absolute left-4 top-3.5 text-slate-400"><Icon size={20} /></div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`}
      />
    </div>
  </div>
);

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    biometricsEnabled: false,
    keepSessionOpen: false,
    country: 'CO',
    themeColor: 'blue' // Default Theme
  });
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleNext = () => {
    setError('');
    if (step === 3) {
      if (formData.pin !== confirmPin) {
        setError('Los PINs no coinciden');
        return;
      }
      if (!formData.pin || formData.pin.length !== 4) {
        setError('El PIN debe tener 4 dígitos');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleFinish = (enableBiometrics: boolean, keepSession: boolean) => {
    const finalProfile = { 
      ...formData, 
      biometricsEnabled: enableBiometrics, 
      keepSessionOpen: keepSession 
    } as UserProfile;
    
    saveUserProfile(finalProfile);
    setSessionActive(true);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 animate-slide-up relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 w-full">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Finovate</h2>
              <p className="text-slate-500">Bienvenido. Comencemos configurando tu perfil.</p>
            </div>
            
            <InputField 
              label="Nombre Completo" 
              value={formData.name || ''} 
              onChange={(v: string) => setFormData(prev => ({...prev, name: v}))} 
              icon={User}
              placeholder="Ej. Juan Pérez"
            />
            
            <InputField 
              label="Número de Identificación" 
              value={formData.idNumber || ''} 
              onChange={(v: string) => setFormData(prev => ({...prev, idNumber: v}))} 
              icon={CreditCard}
              placeholder="ID Nacional / Pasaporte"
            />

            <button 
              onClick={handleNext}
              disabled={!formData.name || !formData.idNumber}
              className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
            >
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Demographics */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Sobre ti</h2>
              <p className="text-slate-500">Para personalizar tu experiencia.</p>
            </div>

            <InputField 
              label="Edad" 
              type="number"
              value={formData.age || ''} 
              onChange={(v: string) => setFormData(prev => ({...prev, age: v}))} 
              placeholder="Ej. 28"
            />
            
            <InputField 
              label="Ocupación" 
              value={formData.occupation || ''} 
              onChange={(v: string) => setFormData(prev => ({...prev, occupation: v}))} 
              icon={Briefcase}
              placeholder="Ej. Diseñador, Ingeniero..."
            />

            <button 
              onClick={handleNext}
              disabled={!formData.age || !formData.occupation}
              className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
            >
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Security */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Lock size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Crea tu PIN</h2>
              <p className="text-slate-500">Protege tu información financiera.</p>
            </div>

            <div className="relative">
              <div className="flex justify-center gap-4 mb-6">
                  <input 
                    type={showPin ? "text" : "password"}
                    maxLength={4}
                    value={formData.pin || ''}
                    onChange={(e) => setFormData(prev => ({...prev, pin: e.target.value.replace(/\D/g,'')}))}
                    placeholder="PIN"
                    className="w-32 text-center text-3xl tracking-[0.5em] font-bold border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2"
                  />
              </div>
              
               <div className="flex justify-center gap-4">
                  <input 
                    type={showPin ? "text" : "password"}
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g,''))}
                    placeholder="Confirmar"
                    className="w-32 text-center text-3xl tracking-[0.5em] font-bold border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2"
                  />
              </div>
              
              <button 
                onClick={() => setShowPin(!showPin)}
                className="absolute right-0 top-0 bottom-0 flex flex-col justify-center items-center text-slate-400 hover:text-blue-600 w-12"
                title="Mostrar/Ocultar PIN"
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <p className="text-center text-rose-500 text-sm">{error}</p>}

            <button 
              onClick={handleNext}
              className="w-full py-4 mt-6 bg-slate-900 text-white rounded-2xl font-semibold shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
            >
              Establecer PIN <ShieldCheck size={18} />
            </button>
          </div>
        )}

        {/* Step 4: Biometrics & Session */}
        {step === 4 && (
          <div className="space-y-8 animate-fade-in text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white shadow-2xl animate-pulse">
              <Fingerprint size={48} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Usar Biometría</h2>
              <p className="text-slate-500 px-4">¿Deseas iniciar sesión usando FaceID o TouchID la próxima vez?</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleFinish(true, true)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
              >
                Sí, activar y mantener sesión
              </button>
              
              <button 
                onClick={() => handleFinish(true, false)}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all"
              >
                Activar biometría (pedir siempre)
              </button>

              <button 
                onClick={() => handleFinish(false, false)}
                className="block w-full py-2 text-sm text-slate-400 font-medium hover:text-slate-600"
              >
                No, usaré solo mi PIN
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}