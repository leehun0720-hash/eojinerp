import React, { useState } from 'react';
import { 
  LayoutDashboard, Building2, FileText, Package, Layers, 
  PenTool, Factory, Truck, Wallet, Menu, X, RefreshCw, LogOut
} from 'lucide-react';
import { StoreProvider, useStore } from './store';
import { Tab } from './types';
import { loginWithGoogle, logout } from './firebase';
import { ErrorBoundary } from './ErrorBoundary';

import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import Invoice from './pages/Invoice';
import Products from './pages/Products';
import Materials from './pages/Materials';
import Contract from './pages/Contract';
import Production from './pages/Production';
import Shipping from './pages/Shipping';
import Finance from './pages/Finance';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { exchangeRate, setExchangeRate, userId, isAuthReady } = useStore();
  const [isSyncingRate, setIsSyncingRate] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">EOJIN<span className="text-blue-600">.</span></h1>
          <p className="text-sm text-slate-500 mb-8 uppercase tracking-widest font-bold">Global Uniform ERP</p>
          <p className="text-slate-600 mb-8">안전하게 데이터를 관리하기 위해 로그인이 필요합니다.</p>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            Google 계정으로 로그인
          </button>
        </div>
      </div>
    );
  }

  const fetchExchangeRate = async () => {
    setIsSyncingRate(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      if (data?.rates?.KRW) {
        setExchangeRate(Math.floor(data.rates.KRW));
      }
    } catch (e) {
      console.error("Failed to fetch exchange rate", e);
    } finally {
      setIsSyncingRate(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '대시보드 홈' },
    { id: 'partners', icon: Building2, label: '업체 관리' },
    { id: 'invoice', icon: FileText, label: '견적 관리' },
    { id: 'products', icon: Package, label: '제품/품목 관리' },
    { id: 'materials', icon: Layers, label: '원단 관리' },
    { id: 'contract', icon: PenTool, label: '계약서 관리' },
    { id: 'production', icon: Factory, label: '생산 관리' },
    { id: 'shipping', icon: Truck, label: '물류 관리' },
    { id: 'finance', icon: Wallet, label: '이익 및 재무' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'partners': return <Partners />;
      case 'invoice': return <Invoice />;
      case 'products': return <Products />;
      case 'materials': return <Materials />;
      case 'contract': return <Contract />;
      case 'production': return <Production />;
      case 'shipping': return <Shipping />;
      case 'finance': return <Finance />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f5] text-slate-800 font-sans print:h-auto print:overflow-visible print:bg-white">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-40 
        fixed md:static inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        print:hidden
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">EOJIN<span className="text-blue-600">.</span></h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Global Uniform ERP</p>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }}
                className={`w-full flex items-center p-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-700 bg-blue-50/80 shadow-sm border border-blue-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={18} className={`mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exchange Rate</span>
              <button onClick={fetchExchangeRate} className={`text-slate-400 hover:text-blue-600 transition-colors ${isSyncingRate ? 'animate-spin' : ''}`}>
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              <span className="text-slate-400 pl-2 text-sm font-medium">₩</span>
              <input 
                type="number" 
                className="w-full bg-transparent text-right font-bold text-slate-800 outline-none p-1.5 text-sm" 
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
              />
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center p-3 rounded-xl font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative print:overflow-visible print:h-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 md:px-8 md:py-5 flex justify-between items-center z-10 sticky top-0 print:hidden">
          <div className="flex items-center">
            <button className="md:hidden mr-4 p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full p-6 lg:p-8 print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto print:max-w-none">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ErrorBoundary>
  );
}
