import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Store, UtensilsCrossed, Settings, LogOut, Plus, ChefHat } from 'lucide-react';
import { FloatingActionButton } from '../components/ui';
import { BranchManager } from '../components/admin/BranchManager';
import { MenuManager } from '../components/admin/MenuManager';
import { SettingsManager } from '../components/admin/SettingsManager';
import Login from './admin/Login';
import ProtectedRoute from '../components/ProtectedRoute';

const AdminDashboard: React.FC = () => {
  type ActiveTab = 'branches' | 'menu' | 'settings';
  const [activeTab, setActiveTab] = useState<ActiveTab>('branches');
  const { branding, signOut, loading } = useStore();
  const navigate = useNavigate();
  const [fabTrigger, setFabTrigger] = useState(0);

  const handleLogout = () => { signOut(); navigate('/admin/login'); };
  const handleFabClick = () => setFabTrigger(c => c + 1);

  const renderContent = () => {
    switch (activeTab) {
        case 'branches': return <BranchManager fabTrigger={fabTrigger} />;
        case 'menu': return <MenuManager fabTrigger={fabTrigger} />;
        case 'settings': return <SettingsManager />;
        default: return null;
    }
  };

  const getTitle = () => {
    if (activeTab === 'branches') return 'Filiallar';
    if (activeTab === 'menu') return 'Menyu';
    return 'Sozlamalar';
  };

  if (loading || !branding) {
    return <div className="flex h-screen items-center justify-center"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-sans text-gray-900">
      <aside className="w-72 bg-white flex-col border-r border-gray-100 z-20 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
            <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200"><ChefHat size={22} /></div><span className="font-black text-xl tracking-tight text-gray-900">Admin<span className="text-orange-500">Panel</span></span></div>
            <nav className="space-y-1.5"><SidebarItem icon={Store} label="Filiallar" active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} /><SidebarItem icon={UtensilsCrossed} label="Menyu va Taomlar" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} /><SidebarItem icon={Settings} label="Sozlamalar" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} /></nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-50">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-gray-100">
               <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0"><img src={branding.logoUrl} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/100'} /></div>
               <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate text-gray-900">{branding.restaurantName}</p><p className="text-xs text-gray-400 font-bold uppercase">Administrator</p></div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 bg-white border border-red-100 py-3 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"><LogOut size={16} /> Chiqish</button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-4 flex justify-between items-center sticky top-0 z-30 lg:hidden">
            <h1 className="text-xl font-extrabold text-gray-900">{getTitle()}</h1>
            <button onClick={handleLogout} className="p-2 text-red-500 rounded-lg hover:bg-red-50"><LogOut size={20}/></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-28 lg:pb-10 scroll-smooth">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-40 lg:hidden">
        <BottomNavItem icon={Store} label="Filiallar" active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} />
        <BottomNavItem icon={UtensilsCrossed} label="Menyu" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
        <BottomNavItem icon={Settings} label="Sozlamalar" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
      {activeTab !== 'settings' && <FloatingActionButton icon={Plus} onClick={handleFabClick} />}
    </div>
  );
};

const BottomNavItem: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full transition-colors ${active ? 'text-gray-900' : 'text-gray-400'}`}>
        <Icon size={24} strokeWidth={active ? 3 : 2} />
        <span className={`text-xs font-bold ${active ? 'font-extrabold' : ''}`}>{label}</span>
    </button>
);

const SidebarItem: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${active ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
    <div className={`relative z-10 flex items-center gap-3 font-bold text-sm`}><Icon size={20} className={active ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-600'} />{label}</div>
  </button>
);

const AdminApp: React.FC = () => {
  const { loading } = useStore();
  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
};

export default AdminApp;