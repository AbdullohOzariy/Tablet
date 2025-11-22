import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Branch, Dish, Category, DishVariant, CategoryViewType } from '../types';
import { 
  LayoutDashboard, Store, UtensilsCrossed, Settings, LogOut, Plus, Trash2, Edit2, CheckCircle, XCircle,
  Image as ImageIcon, Search, ChefHat, Save, X, GripVertical, ArrowLeft, Upload, ChevronRight, Grid,
  LayoutList, MoreVertical, Bell, Menu as MenuIcon, DollarSign, Layers, Link as LinkIcon, Palette,
  Type, Maximize2, Tag, ArrowRight, MoveLeft, MoveRight, Info, Globe, Users, ShoppingBag, Hand, Building
} from 'lucide-react';
import { Button, Input, TextArea, Modal } from '../components/ui';
import Login from './admin/Login';
import ProtectedRoute from '../components/ProtectedRoute';

const LoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

const EmptyState: React.FC<{icon: React.ElementType, title: string, description: string, children?: React.ReactNode}> = ({ icon: Icon, title, description, children }) => (
    <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Icon size={36} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">{description}</p>
        {children}
    </div>
);

const BranchManager: React.FC = () => {
  const { branches, addBranch, updateBranch, deleteBranch } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<Branch, 'id'>>({ name: '', address: '', phone: '', customColor: '#F97316', logoUrl: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBranches = useMemo(() => 
    branches.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    ), [branches, searchTerm]);

  const openModal = (branch?: Branch) => {
    if (branch) {
      setEditingId(branch.id);
      setFormState({ name: branch.name, address: branch.address, phone: branch.phone, customColor: branch.customColor || '#F97316', logoUrl: branch.logoUrl || '' });
    } else {
      setEditingId(null);
      setFormState({ name: '', address: '', phone: '', customColor: '#F97316', logoUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.address || !formState.phone) {
        showToast("Barcha maydonlarni to'ldiring!", "error");
        return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const branchToUpdate: Branch = {
            id: editingId,
            name: formState.name,
            address: formState.address,
            phone: formState.phone,
            customColor: formState.customColor,
            logoUrl: formState.logoUrl,
        };
        await updateBranch(editingId, branchToUpdate);
        showToast('Filial muvaffaqiyatli yangilandi');
      } else {
        await addBranch(formState);
        showToast('Yangi filial qo\'shildi');
      }
      setIsModalOpen(false);
    } catch (error) {
        console.error("Filialni saqlashda xatolik:", error);
        showToast('Xatolik yuz berdi!', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormState(prev => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-full md:w-1/2 lg:w-1/3">
            <Input 
                icon={Search}
                placeholder="Nomi yoki manzil bo'yicha izlash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <Button onClick={() => openModal()} icon={Plus} className="w-full md:w-auto">Yangi Filial</Button>
      </div>

      {branches.length === 0 ? (
        <EmptyState 
            icon={Building}
            title="Hali filiallar yo'q"
            description="Tizimga birinchi filialingizni qo'shing va menyularni boshqarishni boshlang."
        >
            <Button onClick={() => openModal()} icon={Plus}>Birinchi Filialni Qo'shish</Button>
        </EmptyState>
      ) : filteredBranches.length === 0 ? (
        <EmptyState 
            icon={Search}
            title="Natija topilmadi"
            description={`"${searchTerm}" uchun filiallar topilmadi. Qidiruv so'zini o'zgartirib ko'ring.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
            <div key={branch.id} className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden relative bg-gray-100">
                    {branch.logoUrl ? (
                        <img src={branch.logoUrl} className="w-full h-full object-cover" alt="Logo" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/100?text=Logo'}/>
                    ) : (
                        <Store size={32} className="text-gray-400" />
                    )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(branch)} className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-colors"><Edit2 size={18}/></button>
                    <button onClick={() => deleteBranch(branch.id)} className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={18}/></button>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h3>
                    <div className="space-y-3">
                    <div className="flex items-start gap-3 text-gray-500 text-sm font-medium p-3 bg-gray-50 rounded-xl">
                        <Store className="shrink-0 mt-0.5 text-gray-400" size={16} />
                        <span className="leading-snug">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-sm font-medium px-3">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-gray-300" /></div>
                        {branch.phone}
                    </div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Aktiv</span>
                </div>
            </div>
            ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Filialni Tahrirlash' : 'Yangi Filial Yaratish'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
             <div className="flex flex-col gap-3 shrink-0 items-center md:items-start">
                <div className="w-32 h-32 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 relative group">
                    {formState.logoUrl ? <img src={formState.logoUrl} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/150?text=Error'} /> : <ImageIcon className="text-gray-400 w-10 h-10" />}
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                       <Upload size={24} /><span className="text-xs font-bold mt-1">Fayl yuklash</span>
                       <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                </div>
                <p className="text-xs text-gray-400 text-center md:text-left">Fayl yuklang yoki<br/>pastga URL yozing</p>
             </div>
             <div className="flex-1 space-y-4 w-full">
                <Input label="Nomi" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Filial nomi" required />
                <Input label="Logo Linki (URL)" value={formState.logoUrl} onChange={e => setFormState({...formState, logoUrl: e.target.value})} placeholder="https://..." icon={LinkIcon} />
                <Input label="Telefon" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} placeholder="+998 90 123 45 67" required />
             </div>
          </div>
          <Input label="Manzil" value={formState.address} onChange={e => setFormState({...formState, address: e.target.value})} placeholder="To'liq manzil" required />
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Brend Rangi</label>
             <div className="flex gap-3">
                {['#F97316', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#6366F1'].map(color => (
                   <button key={color} type="button" onClick={() => setFormState({...formState, customColor: color})} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${formState.customColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }}>
                      {formState.customColor === color && <CheckCircle className="text-white w-5 h-5" />}
                   </button>
                ))}
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200"><input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" value={formState.customColor} onChange={e => setFormState({...formState, customColor: e.target.value})} /></div>
             </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1" disabled={isSubmitting}>Bekor qilish</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner/> : (editingId ? 'Saqlash' : 'Yaratish')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const MenuManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, dishes, addDish, updateDish, deleteDish, moveDish, reorderDishes, branches } = useStore();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'dishes' | 'categories'>('dishes');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [draggedDishId, setDraggedDishId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishForm, setDishForm] = useState<Omit<Dish, 'id'>>({ categoryId: '', name: '', description: '', price: 0, imageUrls: [], isActive: true, isFeatured: false, availableBranchIds: [], sortOrder: 0, variants: [], badges: [] });
  const [useVariants, setUseVariants] = useState(false);
  
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [badgeUrlInput, setBadgeUrlInput] = useState('');

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState<{name: string, viewType: CategoryViewType}>({ name: '', viewType: 'grid' });

  const openDishModal = (dish?: Dish) => {
     setImageUrlInput(''); setBadgeUrlInput('');
     if (dish) {
       setEditingDishId(dish.id);
       setDishForm({ ...dish, variants: dish.variants || [], isFeatured: !!dish.isFeatured, badges: dish.badges || [], availableBranchIds: dish.availableBranchIds || [] });
       setUseVariants(!!(dish.variants && dish.variants.length > 0));
     } else {
       setEditingDishId(null);
       setDishForm({ categoryId: selectedCatId !== 'all' ? selectedCatId : (categories[0]?.id || ''), name: '', description: '', price: 0, imageUrls: [], isActive: true, isFeatured: false, availableBranchIds: [], sortOrder: 0, variants: [], badges: [] });
       setUseVariants(false);
     }
     setIsDishModalOpen(true);
  };

  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.categoryId) return showToast("Kategoriya tanlang!", 'error');
    
    setIsSubmitting(true);
    try {
        let payload: Omit<Dish, 'id'> = { ...dishForm, price: Number(dishForm.price) };
        if (!useVariants) payload.variants = [];
        else {
            if (!payload.variants?.length) { showToast("Variantlarni kiriting", 'error'); setIsSubmitting(false); return; }
            payload.variants = payload.variants.map(v => ({...v, price: Number(v.price)}));
            payload.price = Math.min(...payload.variants.map(v => v.price)); 
        }

        if (editingDishId) {
            const originalDish = dishes.find(d => d.id === editingDishId);
            if (originalDish) {
                const dishToUpdate: Dish = {
                    ...originalDish,
                    ...payload,
                    id: editingDishId,
                };
                await updateDish(editingDishId, dishToUpdate);
                showToast('Taom yangilandi');
            }
        } else { 
            await addDish(payload); 
            showToast('Yangi taom qo\'shildi'); 
        }
        setIsDishModalOpen(false);
    } catch (error) {
        console.error("Failed to save dish:", error);
        showToast('Xatolik yuz berdi!', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      Promise.all(files.map(f => new Promise<string>((res) => {
        const r = new FileReader(); r.onload = (ev) => res(ev.target?.result as string); r.readAsDataURL(f as Blob);
      }))).then(imgs => setDishForm(p => ({...p, imageUrls: [...p.imageUrls, ...imgs]})));
    }
  };

  const addImageFromUrl = () => { if (imageUrlInput.trim()) { setDishForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, imageUrlInput] })); setImageUrlInput(''); } };
  const addBadgeFromUrl = () => { if (badgeUrlInput.trim()) { setDishForm(prev => ({ ...prev, badges: [...(prev.badges || []), badgeUrlInput] })); setBadgeUrlInput(''); } };

  const toggleBranchAvailability = (branchId: string) => {
      setDishForm(prev => {
          const currentIds = prev.availableBranchIds || [];
          return { ...prev, availableBranchIds: currentIds.includes(branchId) ? currentIds.filter(id => id !== branchId) : [...currentIds, branchId] };
      });
  };

  const filteredDishes = (selectedCatId === 'all' ? dishes : dishes.filter(d => d.categoryId === selectedCatId)).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedDishId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedDishId || draggedDishId === targetId || selectedCatId === 'all') return;
    const currentList = [...filteredDishes];
    const fromIndex = currentList.findIndex(d => d.id === draggedDishId);
    const toIndex = currentList.findIndex(d => d.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [movedItem] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, movedItem);
    const updated = currentList.map((d, i) => ({ ...d, sortOrder: i + 1 }));
    reorderDishes(updated); setDraggedDishId(null); showToast("Tartib yangilandi");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center sticky top-0 z-10 backdrop-blur-xl bg-white/80">
         <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setActiveTab('dishes')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dishes' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Taomlar</button>
            <button onClick={() => setActiveTab('categories')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Kategoriyalar</button>
         </div>
         {activeTab === 'dishes' && (
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
               <button onClick={() => setSelectedCatId('all')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedCatId === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Barchasi</button>
               {categories.map(c => <button key={c.id} onClick={() => setSelectedCatId(c.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedCatId === c.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{c.name}</button>)}
            </div>
         )}
         <Button onClick={() => activeTab === 'dishes' ? openDishModal() : setIsCatModalOpen(true)} icon={Plus} className="w-full md:w-auto">{activeTab === 'dishes' ? 'Yangi Taom' : 'Yangi Kategoriya'}</Button>
      </div>
      {activeTab === 'dishes' ? (
         <>
         {selectedCatId === 'all' ? <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-800 animate-slideIn"><Info size={20} /><p className="text-sm font-bold">Diqqat: Taomlarni saralash (Drag & Drop) uchun aniq bir kategoriyani tanlang.</p></div> : <div className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-800 animate-slideIn"><Hand size={20} className="animate-pulse"/><p className="text-sm font-bold">Sichqoncha bilan ushlab surish orqali tartibni o'zgartiring.</p></div>}
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDishes.length === 0 && <div className="col-span-full py-20 text-center"><div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><UtensilsCrossed size={32} /></div><h3 className="text-xl font-bold text-gray-800">Taomlar topilmadi</h3><p className="text-gray-500">Yangi taom qo'shing yoki kategoriyani o'zgartiring</p></div>}
            {filteredDishes.map((dish) => (
               <div key={dish.id} draggable={selectedCatId !== 'all'} onDragStart={(e) => handleDragStart(e, dish.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, dish.id)} className={`group bg-white rounded-3xl p-4 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex gap-4 relative overflow-hidden ${dish.isFeatured ? 'lg:col-span-2' : ''} ${draggedDishId === dish.id ? 'opacity-50 border-orange-400 border-2 scale-95' : 'border-gray-100'} ${selectedCatId !== 'all' ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                  {selectedCatId !== 'all' && <div className="absolute top-0 left-0 z-20 p-2 text-white/80 hover:text-white transition-colors drop-shadow-md" title="Surish uchun ushlang"><GripVertical size={20} /></div>}
                  <div className={`rounded-2xl bg-gray-100 shrink-0 overflow-hidden border border-gray-100 relative ${dish.isFeatured ? 'w-48 h-24' : 'w-24 h-24'}`}>
                     {dish.imageUrls[0] ? <img src={dish.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/200?text=No+Img'} /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ChefHat size={24}/></div>}
                     {!dish.isActive && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"><span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">Yashirin</span></div>}
                     {dish.isFeatured && <div className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-md z-10 shadow-sm">Katta</div>}
                     {selectedCatId !== 'all' && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20 backdrop-blur-[1px]"><button onClick={(e) => { e.stopPropagation(); moveDish(dish.id, 'up'); }} className="p-2 bg-white rounded-full text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-all shadow-lg active:scale-90" title="Oldinga"><MoveLeft size={16} /></button><button onClick={(e) => { e.stopPropagation(); moveDish(dish.id, 'down'); }} className="p-2 bg-white rounded-full text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-all shadow-lg active:scale-90" title="Orqaga"><MoveRight size={16} /></button></div>}
                  </div>
                  <div className="flex-1 min-w-0 py-1 relative">
                     <div className="flex justify-between items-start pr-12"><h3 className="font-bold text-gray-900 text-lg truncate">{dish.name}</h3></div>
                     <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-2 font-medium h-8">{dish.description}</p>
                     <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                           <div className="text-orange-600 font-black text-lg">{dish.variants && dish.variants.length > 0 ? <span className="text-sm bg-orange-50 px-2 py-1 rounded-lg">{dish.variants.length} variant</span> : `${dish.price.toLocaleString()} so'm`}</div>
                           {dish.badges && dish.badges.length > 0 && <div className="flex gap-1">{dish.badges.map((b, i) => <img key={i} src={b} className="w-5 h-5 object-contain" alt="badge" />)}</div>}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1" title={!dish.availableBranchIds?.length ? "Barcha filiallarda" : "Cheklangan filiallar"}>{!dish.availableBranchIds || dish.availableBranchIds.length === 0 ? <div className="flex items-center gap-1 text-gray-300"><Globe size={14} /></div> : <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-bold"><Store size={12} /> {dish.availableBranchIds.length}</div>}</div>
                     </div>
                  </div>
                  <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 bg-white/90 backdrop-blur-sm p-1 rounded-xl z-30 shadow-sm">
                     <button onClick={() => updateDish(dish.id, { ...dish, isActive: !dish.isActive })} className={`p-2 rounded-xl border shadow-sm transition-colors ${dish.isActive ? 'bg-white text-gray-400 hover:text-blue-500' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{dish.isActive ? <CheckCircle size={18}/> : <XCircle size={18}/>}</button>
                     <button onClick={() => openDishModal(dish)} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-colors"><Edit2 size={18}/></button>
                     <button onClick={() => deleteDish(dish.id)} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"><Trash2 size={18}/></button>
                  </div>
               </div>
            ))}
         </div>
         </>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.sort((a,b) => a.sortOrder - b.sortOrder).map(cat => {
                const CategoryIcon = cat.viewType === 'list' ? <LayoutList size={24}/> : <Grid size={24}/>;
                const ToggleIcon = cat.viewType === 'grid' ? <LayoutList size={18}/> : <Grid size={18}/>;
                return (
                    <div key={cat.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                {CategoryIcon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cat.viewType === 'list' ? "Ro'yxat ko'rinishida" : "Kartochka ko'rinishida"}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => updateCategory(cat.id, { ...cat, viewType: cat.viewType === 'grid' ? 'list' : 'grid' })} className="p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Ko'rinishni o'zgartirish">
                                {ToggleIcon}
                            </button>
                            <button onClick={() => deleteCategory(cat.id)} className="p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                );
            })}
         </div>
      )}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Yangi Kategoriya">
         <form onSubmit={async (e) => { e.preventDefault(); if(catForm.name.trim()) { await addCategory(catForm.name, catForm.viewType); setCatForm({name:'', viewType:'grid'}); setIsCatModalOpen(false); showToast('Qo\'shildi'); } }} className="space-y-6">
            <Input label="Nomi" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Masalan: Shirinliklar" autoFocus />
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Ko'rinish Turi</label>
               <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setCatForm({...catForm, viewType: 'grid'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${catForm.viewType === 'grid' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><Grid size={32} /><span className="font-bold">Kartochka</span><span className="text-[10px] opacity-70">Rasmli va katta</span></button>
                  <button type="button" onClick={() => setCatForm({...catForm, viewType: 'list'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${catForm.viewType === 'list' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><LayoutList size={32} /><span className="font-bold">Ro'yxat</span><span className="text-[10px] opacity-70">Ixcham va matnli</span></button>
               </div>
            </div>
            <Button type="submit" className="w-full">Qo'shish</Button>
         </form>
      </Modal>
      <Modal isOpen={isDishModalOpen} onClose={() => setIsDishModalOpen(false)} title={editingDishId ? 'Taomni Tahrirlash' : 'Yangi Taom Qo\'shish'}>
         <form onSubmit={handleDishSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Kategoriya</label><div className="flex flex-wrap gap-2">{categories.map(c => <button key={c.id} type="button" onClick={() => setDishForm({...dishForm, categoryId: c.id})} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${dishForm.categoryId === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{c.name}</button>)}</div></div>
               <Input label="Taom Nomi" value={dishForm.name} onChange={e => setDishForm({...dishForm, name: e.target.value})} placeholder="Osh" className="col-span-2" required />
               <div className="col-span-2"><TextArea label="Tavsif" value={dishForm.description} onChange={e => setDishForm({...dishForm, description: e.target.value})} placeholder="Tarkibi va o'ziga xosligi..." rows={3} /></div>
               <div className="col-span-2 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Store size={14} /> Filiallarda Mavjudligi</label>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       <button type="button" onClick={() => setDishForm(p => ({...p, availableBranchIds: []}))} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${!dishForm.availableBranchIds || dishForm.availableBranchIds.length === 0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}><Globe size={16} /> Barchasida</button>
                       {branches.map(b => { const isSelected = dishForm.availableBranchIds?.includes(b.id); return <button key={b.id} type="button" onClick={() => toggleBranchAvailability(b.id)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${isSelected ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-500 border-gray-200'}`}>{isSelected ? <CheckCircle size={16} className="text-orange-500"/> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}<span className="truncate">{b.name}</span></button> })}
                   </div>
                   <p className="text-xs text-gray-400 mt-2">* Agar "Barchasida" tanlansa, kelajakda qo'shiladigan filiallarda ham ko'rinadi.</p>
               </div>
               <div className="col-span-2"><label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"><div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${dishForm.isFeatured ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>{dishForm.isFeatured && <CheckCircle size={14} className="text-white" />}</div><input type="checkbox" className="hidden" checked={!!dishForm.isFeatured} onChange={e => setDishForm({...dishForm, isFeatured: e.target.checked})} /><div className="flex-1"><div className="font-bold text-gray-900 flex items-center gap-2"><Maximize2 size={16} className="text-gray-500"/> Katta Karta (2x eniga)</div><p className="text-xs text-gray-500 mt-0.5">Uzun rasmlar yoki maxsus taomlar uchun</p></div></label></div>
               <div className="col-span-2 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Tag size={14} /> Taom belgilari (Ikonkalar)</label>
                   <div className="flex gap-2 mb-4"><div className="flex-1"><Input placeholder="Ikonka havolasi (https://...)" value={badgeUrlInput} onChange={(e) => setBadgeUrlInput(e.target.value)} icon={LinkIcon} className="py-2.5 text-sm"/></div><Button type="button" variant="secondary" onClick={addBadgeFromUrl} disabled={!badgeUrlInput.trim()} className="py-2 px-4">Qo'shish</Button></div>
                   {dishForm.badges && dishForm.badges.length > 0 && <div className="flex flex-wrap gap-3">{dishForm.badges.map((url, idx) => <div key={idx} className="relative group w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-1"><img src={url} className="w-full h-full object-contain" alt="badge" /><button type="button" onClick={() => setDishForm(p => ({...p, badges: p.badges?.filter((_, i) => i !== idx)}))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X size={12} /></button></div>)}</div>}
               </div>
               <div className="col-span-2 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4"><span className="font-bold text-gray-800 flex items-center gap-2"><Layers size={18} className="text-orange-500"/> Narx turi</span><div className="flex items-center bg-gray-200 rounded-lg p-1 gap-1"><button type="button" onClick={() => setUseVariants(false)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!useVariants ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Oddiy</button><button type="button" onClick={() => setUseVariants(true)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${useVariants ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Variantlar</button></div></div>
                  {useVariants ? <div className="space-y-3">{dishForm.variants?.map((v, idx) => <div key={idx} className="flex gap-3 items-center animate-slideIn"><div className="flex-1"><Input placeholder="Nomi (masalan: 0.7)" value={v.name} onChange={e => {const n=[...(dishForm.variants||[])]; n[idx].name=e.target.value; setDishForm({...dishForm, variants:n})}} className="py-2.5 text-sm" /></div><div className="w-32"><Input type="number" placeholder="Narx" value={v.price} onChange={e => {const n=[...(dishForm.variants||[])]; n[idx].price=Number(e.target.value); setDishForm({...dishForm, variants:n})}} className="py-2.5 text-sm" icon={DollarSign} /></div><button type="button" onClick={() => {const n=[...(dishForm.variants||[])]; n.splice(idx,1); setDishForm({...dishForm, variants:n})}} className="p-2.5 bg-white border border-gray-200 text-red-500 rounded-xl hover:bg-red-50"><Trash2 size={16}/></button></div>)}<button type="button" onClick={() => setDishForm({...dishForm, variants:[...(dishForm.variants||[]), {name:'', price:0}]})} className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 w-fit transition-colors"><Plus size={16}/> Variant qo'shish</button></div> : <Input label="Narx" type="number" value={dishForm.price} onChange={e => setDishForm({...dishForm, price: Number(e.target.value)})} placeholder="0" icon={DollarSign} />}
               </div>
               <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Rasmlar</label>
                  <div className="flex gap-2 mb-4"><div className="flex-1"><Input placeholder="Rasm havolasi (URL)..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} icon={LinkIcon} className="py-2.5 text-sm"/></div><Button type="button" variant="secondary" onClick={addImageFromUrl} disabled={!imageUrlInput.trim()} className="py-2 px-4">Qo'shish</Button></div>
                  <div className="grid grid-cols-4 gap-3">{dishForm.imageUrls.map((url, idx) => <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-gray-200 bg-gray-50"><img src={url} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/150?text=Error'} /><button type="button" onClick={() => setDishForm(p => ({...p, imageUrls: p.imageUrls.filter((_,i)=>i!==idx)}))} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2/></button></div>)}<label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer"><Upload size={24} /><span className="text-[10px] font-bold mt-1">Fayl Yuklash</span><input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} /></label></div>
               </div>
            </div>
            <div className="pt-4 flex gap-3 border-t border-gray-100">
               <Button type="button" variant="ghost" onClick={() => setIsDishModalOpen(false)} className="flex-1" disabled={isSubmitting}>Bekor qilish</Button>
               <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner/> : 'Saqlash'}</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};

const ColorInput: React.FC<{ label: string, description?: string, value: string, onChange: (val: string) => void }> = ({ label, description, value, onChange }) => (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
        <div className="relative shrink-0"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent p-0 opacity-0 absolute inset-0 z-10"/><div className="w-14 h-14 rounded-xl border-2 border-gray-200 shadow-sm flex items-center justify-center overflow-hidden" style={{ backgroundColor: value }}><div className="w-full h-1/2 bg-black/10 absolute bottom-0"></div></div></div>
        <div className="flex-1 min-w-0"><p className="font-bold text-gray-900 text-base">{label}</p>{description && <p className="text-xs text-gray-400 line-clamp-1">{description}</p>}</div>
        <div className="text-xs font-mono font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 uppercase">{value}</div>
    </div>
);

const SettingsManager: React.FC = () => {
   const { branding, updateBranding } = useStore();
   const { showToast } = useToast();
   const [localBrand, setLocalBrand] = useState(branding);
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => { setLocalBrand(branding); }, [branding]);
   
   if (!localBrand) return <div>Loading settings...</div>;

   const handleSave = async () => {
    setIsSubmitting(true);
    try {
        await updateBranding(localBrand);
        showToast('Sozlamalar saqlandi');
    } catch (error) {
        showToast('Xatolik yuz berdi!', 'error');
    } finally {
        setIsSubmitting(false);
    }
   };

   return (
      <div className="max-w-4xl mx-auto">
         <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-6 mb-8">
               <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden shrink-0"><img src={localBrand.logoUrl} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/150?text=Logo'} /></div>
               <div><h2 className="text-2xl font-black text-gray-900">Brending</h2><p className="text-gray-500">Mijoz ilovasi dizaynini o'zgartirish</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="Restoran Nomi" value={localBrand.restaurantName} onChange={e => setLocalBrand({...localBrand, restaurantName: e.target.value})} />
               <Input label="Logo URL" value={localBrand.logoUrl} onChange={e => setLocalBrand({...localBrand, logoUrl: e.target.value})} icon={LinkIcon} />
               <TextArea label="Kirish Sarlavhasi (Landing Page)" value={localBrand.slogan || ''} onChange={e => setLocalBrand({...localBrand, slogan: e.target.value})} rows={2} className="md:col-span-2" />
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Type size={24}/></div><h3 className="text-xl font-bold text-gray-900">Mijozlar Paneli Matnlari</h3></div>
            <div className="space-y-4">
                <Input label="Filial Tanlash Xabari" value={localBrand.welcomeMessage || ''} onChange={e => setLocalBrand({...localBrand, welcomeMessage: e.target.value})} />
                <Input label="Menyu Banner Sarlavhasi" value={localBrand.menuHeroTitle || ''} onChange={e => setLocalBrand({...localBrand, menuHeroTitle: e.target.value})} />
                <TextArea label="Menyu Banner Matni" value={localBrand.menuHeroSubtitle || ''} onChange={e => setLocalBrand({...localBrand, menuHeroSubtitle: e.target.value})} rows={3} />
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><ImageIcon size={24}/></div><h3 className="text-xl font-bold text-gray-900">Fon va Banner Rasmlari</h3></div>
            <div className="space-y-6"><Input label="Asosiy Fon Rasmi (Welcome Screen)" value={localBrand.backgroundImageUrl || ''} onChange={e => setLocalBrand({...localBrand, backgroundImageUrl: e.target.value})} placeholder="https://..." icon={LinkIcon}/><Input label="Menyu Banner Rasmi (Header)" value={localBrand.headerImageUrl || ''} onChange={e => setLocalBrand({...localBrand, headerImageUrl: e.target.value})} placeholder="https://..." icon={LinkIcon}/></div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Palette size={24}/></div><h3 className="text-xl font-bold text-gray-900">Ranglar va Uslub</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><ColorInput label="Asosiy Rang (Primary)" description="Tugmalar, urg'u berilgan elementlar" value={localBrand.primaryColor} onChange={v => setLocalBrand({...localBrand, primaryColor: v})} /><ColorInput label="Fon Rangi" description="Ilovaning umumiy foni" value={localBrand.backgroundColor} onChange={v => setLocalBrand({...localBrand, backgroundColor: v})} /><ColorInput label="Kartochka Rangi" description="Menyu kartochkalari va bloklar foni" value={localBrand.cardColor} onChange={v => setLocalBrand({...localBrand, cardColor: v})} /><ColorInput label="Matn Rangi" description="Sarlavha va asosiy matnlar" value={localBrand.textColor} onChange={v => setLocalBrand({...localBrand, textColor: v})} /><ColorInput label="Yordamchi Matn" description="Tavsiflar, sanalar va ikkilamchi matn" value={localBrand.mutedColor} onChange={v => setLocalBrand({...localBrand, mutedColor: v})} /></div>
            <div className="pt-8 mt-4 border-t border-gray-100"><Button onClick={handleSave} className="w-full py-4 text-lg" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner/> : <><Save size={20} /> O'zgarishlarni Saqlash</>}</Button></div>
         </div>
      </div>
   );
};

const SidebarItem: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${active ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
    <div className={`relative z-10 flex items-center gap-3 font-bold text-sm`}><Icon size={20} className={active ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-600'} />{label}</div>
  </button>
);

const DashboardStats: React.FC = () => {
    const { branches, dishes, categories } = useStore();
    const StatCard = ({ label, value, icon: Icon, colorClass, bgClass }: any) => (<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${colorClass}`}><Icon size={28} /></div><div><p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{label}</p><p className="text-3xl font-black text-gray-900">{value}</p></div></div>);
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slideIn"><StatCard label="Jami Filiallar" value={branches.length} icon={Store} bgClass="bg-blue-50" colorClass="text-blue-600" /><StatCard label="Aktiv Taomlar" value={dishes.length} icon={UtensilsCrossed} bgClass="bg-orange-50" colorClass="text-orange-600" /><StatCard label="Kategoriyalar" value={categories.length} icon={ShoppingBag} bgClass="bg-emerald-50" colorClass="text-emerald-600" /></div>);
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branches' | 'menu' | 'settings'>('branches');
  const { branding, signOut, loading } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => { signOut(); navigate('/admin/login'); };

  if (loading || !branding) return <div className="flex h-screen items-center justify-center"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-sans text-gray-900 overflow-hidden">
      <aside className="w-72 bg-white flex flex-col border-r border-gray-100 z-20 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
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
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
         <header className="bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-30 lg:hidden">
            <div className="flex items-center gap-2"><ChefHat className="text-orange-500" /><span className="font-black text-gray-900">AdminPanel</span></div>
            <div className="flex gap-2"><button onClick={() => setActiveTab('branches')} className={`p-2 rounded-lg ${activeTab === 'branches' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}><Store size={20}/></button><button onClick={() => setActiveTab('menu')} className={`p-2 rounded-lg ${activeTab === 'menu' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}><UtensilsCrossed size={20}/></button><button onClick={() => setActiveTab('settings')} className={`p-2 rounded-lg ${activeTab === 'settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}><Settings size={20}/></button><div className="w-px h-6 bg-gray-200 mx-1 self-center"></div><button onClick={handleLogout} className="p-2 text-red-500 rounded-lg hover:bg-red-50"><LogOut size={20}/></button></div>
         </header>
         <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-7xl mx-auto">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div>
                     <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{activeTab === 'branches' && 'Filiallar Boshqaruvi'}{activeTab === 'menu' && 'Menyu Tahriri'}{activeTab === 'settings' && 'Tizim Sozlamalari'}</h1>
                     <p className="text-gray-500 font-medium text-lg">{activeTab === 'branches' && 'Restoran filiallarini kuzating va boshqaring.'}{activeTab === 'menu' && 'Yangi taomlar qo\'shing va menyuni yangilang.'}{activeTab === 'settings' && 'Global dizayn va brending sozlamalari.'}</p>
                  </div>
                  <div className="flex items-center gap-3"><div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-500"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />Tizim aktiv</div></div>
               </div>
               <DashboardStats />
               <div className="animate-slideIn">{activeTab === 'branches' && <BranchManager />}{activeTab === 'menu' && <MenuManager />}{activeTab === 'settings' && <SettingsManager />}</div>
            </div>
         </div>
      </main>
    </div>
  );
};

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