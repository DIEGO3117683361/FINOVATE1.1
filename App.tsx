import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, List, PieChart, Wallet, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import Settings from './components/Settings';
import { Transaction, UserProfile, ThemeColor } from './types';
import { getTransactions, checkAndPerformAutoCleaning } from './services/storageService';
import { getUserProfile, isSessionActive, saveUserProfile } from './services/authService';
import { THEME_COLORS } from './constants';

export const getThemeStyles = (color: ThemeColor = 'blue') => {
  const c = THEME_COLORS[color] ? THEME_COLORS[color].class : 'blue';
  
  // iOS 26 Aesthetic Mappings
  const styles = {
    bg: `bg-${c}-500`,
    bgGradient: `bg-gradient-to-br from-${c}-400 to-${c}-600`,
    bgLight: `bg-${c}-50`,
    text: `text-${c}-600`,
    textLight: `text-${c}-400`,
    textDark: `text-${c}-900`,
    border: `border-${c}-100`,
    glassBorder: `border-${c}-200/30`,
    glow: `shadow-[0_0_40px_-10px_rgba(var(--color-${c}-500),0.3)]`,
    shadow: `shadow-${c}-500/40`,
    iconColor: `text-${c}-500`,
  };

  if (color === 'black') {
    return {
      bg: 'bg-slate-800',
      bgGradient: 'bg-gradient-to-br from-slate-700 to-slate-900',
      bgLight: 'bg-slate-100',
      text: 'text-slate-800',
      textLight: 'text-slate-400',
      textDark: 'text-slate-900',
      border: 'border-slate-200',
      glassBorder: 'border-slate-300/30',
      glow: 'shadow-[0_0_40px_-10px_rgba(0,0,0,0.2)]',
      shadow: 'shadow-slate-900/20',
      iconColor: 'text-slate-800',
    };
  }

  return styles;
};

// Liquid Glass TabBar
const TabBar = ({ activeTab, setTab, themeColor }: { activeTab: string, setTab: (t: string) => void, themeColor: ThemeColor }) => {
  const styles = getThemeStyles(themeColor);
  const tabs = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Inicio' },
    { id: 'list', icon: List, label: 'Movimientos' },
    { id: 'add', icon: Plus, label: 'Nuevo', isAction: true },
    { id: 'reports', icon: PieChart, label: 'Reportes' },
    { id: 'settings', icon: SettingsIcon, label: 'Ajustes' },
  ];

  return (
    // Fixed: Use flex and inset-x-0 for stable centering. 
    // The previous implementation had a conflict between Tailwind's -translate-x-1/2 and the animate-enter transform.
    <div className="fixed bottom-8 inset-x-0 flex justify-center z-50 pointer-events-none">
      <div className="flex items-center gap-2 p-2 rounded-[2.5rem] glass-panel backdrop-blur-3xl bg-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 animate-enter pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`mx-2 w-14 h-14 rounded-full ${styles.bgGradient} text-white shadow-lg flex items-center justify-center liquid-click transition-all hover:-translate-y-1 hover:shadow-xl`}
              >
                <Icon size={26} strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                isActive ? 'text-slate-800 bg-white/50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-slate-800 rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [authState, setAuthState] = useState<'LOADING' | 'ONBOARDING' | 'LOCKED' | 'APP'>('LOADING');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [data, setData] = useState<Transaction[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile) {
      setAuthState('ONBOARDING');
    } else {
      const didClean = checkAndPerformAutoCleaning(profile);
      if (didClean) {
        const updatedProfile = { 
            ...profile, 
            autoCleaning: { ...profile.autoCleaning!, lastRun: Date.now() } 
        };
        saveUserProfile(updatedProfile);
        setUserProfile(updatedProfile);
        setRefreshTrigger(prev => prev + 1);
      } else {
        setUserProfile(profile);
      }
      
      if (isSessionActive()) {
        setAuthState('APP');
      } else {
        setAuthState('LOCKED');
      }
    }
  }, []);

  useEffect(() => {
    if (authState === 'APP') {
      const loadedData = getTransactions();
      setData(loadedData);
    }
  }, [refreshTrigger, currentView, authState]);

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard');
  };

  const handleLoginSuccess = () => {
    setAuthState('APP');
  };

  const handleLogout = () => {
    setAuthState('LOCKED');
    setCurrentView('dashboard');
  };

  const currentTheme = userProfile?.themeColor || 'blue';

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard transactions={data} userProfile={userProfile} />;
      case 'add':
        return <TransactionForm onSuccess={handleTransactionAdded} onCancel={() => setCurrentView('dashboard')} themeColor={currentTheme} />;
      case 'list':
        return <TransactionList transactions={data} onUpdate={() => setRefreshTrigger(prev => prev + 1)} userProfile={userProfile} themeColor={currentTheme} />;
      case 'reports':
        return <Reports transactions={data} userProfile={userProfile} themeColor={currentTheme} />;
      case 'settings':
        return <Settings user={userProfile!} onUpdate={setUserProfile} onLogout={handleLogout} themeColor={currentTheme} />;
      default:
        return <Dashboard transactions={data} userProfile={userProfile} />;
    }
  };

  if (authState === 'LOADING') return null;
  if (authState === 'ONBOARDING') return <Onboarding onComplete={() => { setUserProfile(getUserProfile()); setAuthState('APP'); }} />;
  if (authState === 'LOCKED' && userProfile) return <Login user={userProfile} onLogin={handleLoginSuccess} />;

  return (
    <div className="min-h-screen pb-32 selection:bg-black/10 selection:text-black">
      
      {/* Top White Gradient Shadow Mask */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-white/90 via-white/40 to-transparent z-30 pointer-events-none" />

      {/* Ultra Minimal Header */}
      <header className="fixed top-0 w-full z-40 px-6 py-6 transition-all duration-500">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
             {/* Removed 'Finanzas' subtitle and '26' suffix as requested */}
             <h1 className="text-2xl font-light text-slate-900 tracking-tight">Finovate</h1>
          </div>
          <div className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-slate-600 font-bold border border-white/60 overflow-hidden relative">
            {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                userProfile?.name.charAt(0)
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-5 pt-28 animate-enter relative z-10">
        {renderView()}
      </main>

      <TabBar activeTab={currentView} setTab={setCurrentView} themeColor={currentTheme} />
    </div>
  );
}