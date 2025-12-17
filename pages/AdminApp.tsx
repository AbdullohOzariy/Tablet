import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Branch, Dish, Category, CategoryViewType } from '../types';
import {
  Store, UtensilsCrossed, Settings, LogOut, Plus, Trash2, Edit2, Search, ChefHat, Save, X, GripVertical,
  LayoutList, Grid, Building, Info, Hand, CheckCircle, XCircle, Maximize2, Link as LinkIcon, Upload, Globe, Layers, Tag, Palette, Type
} from 'lucide-react';
import { Button, Input, TextArea, Modal, FloatingActionButton } from '../components/ui';
import { DishModal } from '../components/modals/DishModal'; // Yangi import
import Login from './admin/Login';
import ProtectedRoute from '../components/ProtectedRoute';

// --- Reusable Components ---
const LoadingSpinner: React.FC = () => <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>;

const EmptyState: React.FC<{icon: React.ElementType, title: string, description: string, children?: React.ReactNode}> = ({ icon: Icon, title, description, children }) => (
    <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"><Icon size={36} /></div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">{description}</p>
        {children}
    </div>
);

// --- Manager Components ---

const BranchManager: React.FC<{ onAdd: () => void, onEdit: (branch: Branch) => void }> = ({ onAdd, onEdit }) => {
  const { branches, deleteBranch } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBranches = useMemo(() =>
    branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    ), [branches, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
        <div className="w-full md:w-1/2 lg:w-1/3">
            <Input icon={Search} placeholder="Filial izlash..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="hidden md:block">
            <Button onClick={onAdd} icon={Plus}>Yangi Filial</Button>
        </div>
      </div>
      {branches.length === 0 ? (
        <EmptyState icon={Building} title="Hali filiallar yo'q" description="Tizimga birinchi filialingizni qo'shing."><Button onClick={onAdd} icon={Plus}>Birinchi Filialni Qo'shish</Button></EmptyState>
      ) : filteredBranches.length === 0 ? (
        <EmptyState icon={Search} title="Natija topilmadi" description={`"${searchTerm}" uchun filiallar topilmadi.`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
            <div key={branch.id} className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden relative bg-gray-100">
                    {branch.logoUrl ? <img src={branch.logoUrl} className="w-full h-full object-cover" alt="Logo" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/100?text=Logo'}/> : <Store size={32} className="text-gray-400" />}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(branch)} className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-colors"><Edit2 size={18}/></button>
                    <button onClick={() => deleteBranch(branch.id)} className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={18}/></button>
                    </div>
                </div>
                <div className="flex-1"><h3 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h3><div className="space-y-3"><div className="flex items-start gap-3 text-gray-500 text-sm font-medium p-3 bg-gray-50 rounded-xl"><Store className="shrink-0 mt-0.5 text-gray-400" size={16} /><span className="leading-snug">{branch.address}</span></div><div className="flex items-center gap-3 text-gray-500 text-sm font-medium px-3"><div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-gray-300" /></div>{branch.phone}</div></div></div>
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between"><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span><span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Aktiv</span></div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

// ... (The rest of the file will be added below)
const AdminApp: React.FC = () => {
    return <div>Admin App Placeholder</div>
}
export default AdminApp;