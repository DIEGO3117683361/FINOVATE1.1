import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { setSessionActive } from '../services/authService';
import { ScanFace, Delete } from 'lucide-react';

interface Props {
  user: UserProfile;
  onLogin: () => void;
}

export default function Login({ user, onLogin }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);

  useEffect(() => {
    if (user.biometricsEnabled) {
      setTimeout(() => setIsBiometricScanning(true), 500);
    }
  }, [user.biometricsEnabled]);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === user.pin) {
      if (user.keepSessionOpen) setSessionActive(true);
      onLogin();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500);
    }
  };

  if (isBiometricScanning) {
    return (
      <div className="min-h-screen bg-slate-900/40 backdrop-blur-3xl flex flex-col items-center justify-center z-50 fixed inset-0">
        <div className="relative">
          <ScanFace size={64} className="text-white opacity-80 animate-pulse" />
          <div className="absolute inset-0 border-2 border-white/20 rounded-xl scale-150 animate-ping"></div>
        </div>
        <p className="mt-8 text-white/60 font-light tracking-widest text-sm uppercase">Autenticando</p>
        <button onClick={() => setIsBiometricScanning(false)} className="mt-12 text-xs text-white/40 hover:text-white transition-colors">Cancelar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-slate-900">
         <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-purple-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="glass-panel w-full max-w-sm rounded-[3rem] p-10 relative z-10 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-white/10 mx-auto flex items-center justify-center text-3xl font-light text-white mb-4 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {user.name.charAt(0)}
            </div>
            <h2 className="text-white font-light text-xl">Bienvenido, <span className="font-semibold">{user.name.split(' ')[0]}</span></h2>
        </div>

        {/* PIN Indicators */}
        <div className={`flex justify-center gap-6 mb-12 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                pin.length > i ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-110' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-y-8 gap-x-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="w-16 h-16 rounded-full text-white text-2xl font-light hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center mx-auto"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center">
             {user.biometricsEnabled && <button onClick={() => setIsBiometricScanning(true)} className="text-white/50 hover:text-white"><ScanFace size={24} /></button>}
          </div>
          <button
            onClick={() => handleNumberClick('0')}
            className="w-16 h-16 rounded-full text-white text-2xl font-light hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center mx-auto"
          >
            0
          </button>
          <div className="flex items-center justify-center">
             {pin.length > 0 && <button onClick={() => setPin(p => p.slice(0, -1))} className="text-white/50 hover:text-white"><Delete size={24} /></button>}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}