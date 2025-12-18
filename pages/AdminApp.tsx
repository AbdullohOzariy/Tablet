import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Branch, Dish, Category, CategoryViewType } from '../types';
import {
  Store, UtensilsCrossed, Settings, LogOut, Plus, Trash2, Edit2, Search, ChefHat, Save, X, GripVertical,
  LayoutList, Grid, Building, Info, Hand, CheckCircle, XCircle, Maximize2, Link as LinkIcon, Upload, Globe, Layers, Tag, Palette, Type, ServerCrash
} from 'lucide-react';
import { Button, Input, TextArea, Modal, FloatingActionButton } from '../components/ui';
import { DishModal } from '../components/modals/DishModal';
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

const MenuManager: React.FC<{ onAddDish: () => void, onEditDish: (dish: Dish) => void, onAddCategory: () => void, onEditCategory: (cat: Category) => void }> = ({ onAddDish, onEditDish, onAddCategory, onEditCategory }) => {
  const { categories, updateCategory, deleteCategory, reorderCategories, dishes, updateDish, deleteDish } = useStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'dishes' | 'categories'>('dishes');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    const newCategories = Array.from(categories);
    const [reorderedItem] = newCategories.splice(source.index, 1);
    newCategories.splice(destination.index, 0, reorderedItem);
    const updatedCategories = newCategories.map((cat, index) => ({ ...cat, sortOrder: index }));
    reorderCategories(updatedCategories).catch(() => showToast("Tartibni saqlashda xatolik!", "error"));
  };

  const filteredDishes = useMemo(() =>
    (selectedCatId === 'all' ? dishes : dishes.filter(d => d.categoryId === selectedCatId)).sort((a, b) => a.sortOrder - b.sortOrder),
    [dishes, selectedCatId]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
         <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setActiveTab('dishes')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dishes' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Taomlar</button>
            <button onClick={() => setActiveTab('categories')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Kategoriyalar</button>
         </div>
         {activeTab === 'dishes' && (
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
               <button onClick={() => setSelectedCatId('all')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedCatId === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Barchasi</button>
               {categories.map(c => <button key={c.id} onClick={() => setSelectedCatId(c.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedCatId === c.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{c.name}</button>)}
            </div>
         )}
         <div className="hidden md:block">
            <Button onClick={() => activeTab === 'dishes' ? onAddDish() : onAddCategory()} icon={Plus}>{activeTab === 'dishes' ? 'Yangi Taom' : 'Yangi Kategoriya'}</Button>
         </div>
      </div>
      {activeTab === 'categories' ? (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {categories.map((cat, index) => (
                            <Draggable key={cat.id} draggableId={cat.id} index={index}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div {...provided.dragHandleProps} className="p-2 cursor-grab text-gray-400 hover:bg-gray-100 rounded-lg"><GripVertical size={20} /></div>
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">{cat.viewType === 'list' ? <LayoutList size={24}/> : <Grid size={24}/>}</div>
                                            <div><h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cat.viewType === 'list' ? "Ro'yxat" : "Kartochka"}</span></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => onEditCategory(cat)} className="p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Tahrirlash"><Edit2 size={18}/></button>
                                            <button onClick={() => updateCategory(cat.id, { ...cat, viewType: cat.viewType === 'grid' ? 'list' : 'grid' })} className="p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Ko'rinishni o'zgartirish">{cat.viewType === 'grid' ? <LayoutList size={18}/> : <Grid size={18}/>}</button>
                                            <button onClick={() => deleteCategory(cat.id)} className="p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => (
               <div key={dish.id} className="group bg-white rounded-3xl p-4 border shadow-sm flex gap-4 relative">
                  <div className={`rounded-2xl bg-gray-100 shrink-0 overflow-hidden border border-gray-100 relative w-24 h-24`}>
                     {dish.imageUrls[0] ? <img src={dish.imageUrls[0]} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/200?text=No+Img'} /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ChefHat size={24}/></div>}
                     {!dish.isActive && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"><span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">Yashirin</span></div>}
                  </div>
                  <div className="flex-1 min-w-0 py-1 relative">
                     <div className="flex justify-between items-start pr-12"><h3 className="font-bold text-gray-900 text-lg truncate">{dish.name}</h3></div>
                     <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-2 font-medium h-8">{dish.description}</p>
                     <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                           <div className="text-orange-600 font-black text-lg">{dish.variants && dish.variants.length > 0 ? <span className="text-sm bg-orange-50 px-2 py-1 rounded-lg">{dish.variants.length} variant</span> : `${dish.price.toLocaleString()} so'm`}</div>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">{!dish.availableBranchIds || dish.availableBranchIds.length === 0 ? <div className="flex items-center gap-1 text-gray-300"><Globe size={14} /></div> : <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-bold"><Store size={12} /> {dish.availableBranchIds.length}</div>}</div>
                     </div>
                  </div>
                  <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 bg-white/90 backdrop-blur-sm p-1 rounded-xl z-30 shadow-sm">
                     <button onClick={() => updateDish(dish.id, { ...dish, isActive: !dish.isActive })} className={`p-2 rounded-xl border shadow-sm transition-colors ${dish.isActive ? 'bg-white text-gray-400 hover:text-blue-500' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{dish.isActive ? <CheckCircle size={18}/> : <XCircle size={18}/>}</button>
                     <button onClick={() => onEditDish(dish)} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-colors"><Edit2 size={18}/></button>
                     <button onClick={() => deleteDish(dish.id)} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"><Trash2 size={18}/></button>
                  </div>
               </div>
            ))}
        </div>
      )}
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

const BottomNavItem: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full transition-colors ${active ? 'text-gray-900' : 'text-gray-400'}`}>
        <Icon size={24} strokeWidth={active ? 3 : 2} />
        <span className={`text-xs font-bold ${active ? 'font-extrabold' : ''}`}>{label}</span>
    </button>
);

const AdminDashboard: React.FC = () => {
  type ActiveTab = 'branches' | 'menu' | 'settings';
  const [activeTab, setActiveTab] = useState<ActiveTab>('branches');
  const { branding, signOut, loading, error } = useStore();
  const navigate = useNavigate();
  const [fabTrigger, setFabTrigger] = useState(0);

  // --- Modal States (Lifted Up) ---
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleLogout = () => { signOut(); navigate('/admin/login'); };
  const handleFabClick = () => {
    if (activeTab === 'branches') openBranchModal();
    else if (activeTab === 'menu') openDishModal();
  };

  const openBranchModal = (branch?: Branch) => { setEditingBranch(branch || null); setIsBranchModalOpen(true); };
  const openDishModal = (dish?: Dish) => { setEditingDish(dish || null); setIsDishModalOpen(true); };
  const openCategoryModal = (cat?: Category) => { setEditingCategory(cat || null); setIsCategoryModalOpen(true); };

  const renderContent = () => {
    if (error) return <EmptyState icon={ServerCrash} title="Server bilan aloqa yo'q" description={error} />;
    switch (activeTab) {
        case 'branches': return <BranchManager onAdd={openBranchModal} onEdit={openBranchModal} />;
        case 'menu': return <MenuManager onAddDish={openDishModal} onEditDish={openDishModal} onAddCategory={openCategoryModal} onEditCategory={openCategoryModal} />;
        case 'settings': return <SettingsManager />;
        default: return null;
    }
  };

  const getTitle = () => {
    if (activeTab === 'branches') return 'Filiallar';
    if (activeTab === 'menu') return 'Menyu';
    return 'Sozlamalar';
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-sans text-gray-900">
      <aside className="w-72 bg-white flex-col border-r border-gray-100 z-20 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
            <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200"><ChefHat size={22} /></div><span className="font-black text-xl tracking-tight text-gray-900">Admin<span className="text-orange-500">Panel</span></span></div>
            <nav className="space-y-1.5"><SidebarItem icon={Store} label="Filiallar" active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} /><SidebarItem icon={UtensilsCrossed} label="Menyu va Taomlar" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} /><SidebarItem icon={Settings} label="Sozlamalar" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} /></nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-50">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-gray-100">
               <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0"><img src={branding?.logoUrl} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/100'} /></div>
               <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate text-gray-900">{branding?.restaurantName}</p><p className="text-xs text-gray-400 font-bold uppercase">Administrator</p></div>
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

      {/* Modals are controlled here */}
      <BranchModal isOpen={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} editingBranch={editingBranch} />
      <DishModal isOpen={isDishModalOpen} onClose={() => setIsDishModalOpen(false)} editingDish={editingDish} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} editingCategory={editingCategory} />
    </div>
  );
};

// --- Modal Components (Extracted for clarity) ---

const BranchModal: React.FC<{isOpen: boolean, onClose: () => void, editingBranch: Branch | null}> = ({isOpen, onClose, editingBranch}) => {
    const { addBranch, updateBranch } = useStore();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState<Omit<Branch, 'id'>>({ name: '', address: '', phone: '', customColor: '#F97316', logoUrl: '' });

    useEffect(() => {
        if (editingBranch) {
            setFormState({ name: editingBranch.name, address: editingBranch.address, phone: editingBranch.phone, customColor: editingBranch.customColor || '#F97316', logoUrl: editingBranch.logoUrl || '' });
        } else {
            setFormState({ name: '', address: '', phone: '', customColor: '#F97316', logoUrl: '' });
        }
    }, [editingBranch, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name) return;
        setIsSubmitting(true);
        try {
            if (editingBranch) {
                await updateBranch(editingBranch.id, { id: editingBranch.id, ...formState });
                showToast('Filial yangilandi');
            } else {
                await addBranch(formState);
                showToast('Yangi filial qo\'shildi');
            }
            onClose();
        } catch (error) {
            showToast('Xatolik!', 'error');
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
        <Modal isOpen={isOpen} onClose={onClose} title={editingBranch ? 'Filialni Tahrirlash' : 'Yangi Filial Yaratish'}>
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
                        <button type="button" key={color} onClick={() => setFormState({...formState, customColor: color})} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${formState.customColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }}>
                            {formState.customColor === color && <CheckCircle className="text-white w-5 h-5" />}
                        </button>
                        ))}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200"><input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" value={formState.customColor} onChange={e => setFormState({...formState, customColor: e.target.value})} /></div>
                    </div>
                </div>
                <div className="pt-4 flex gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={isSubmitting}>Bekor qilish</Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner/> : (editingBranch ? 'Saqlash' : 'Yaratish')}</Button>
                </div>
            </form>
        </Modal>
    );
}

const CategoryModal: React.FC<{isOpen: boolean, onClose: () => void, editingCategory: Category | null}> = ({isOpen, onClose, editingCategory}) => {
    const { addCategory, updateCategory } = useStore();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [catForm, setCatForm] = useState<{name: string, viewType: CategoryViewType}>({ name: '', viewType: 'grid' });

    useEffect(() => {
        if (editingCategory) {
            setCatForm({ name: editingCategory.name, viewType: editingCategory.viewType });
        } else {
            setCatForm({ name: '', viewType: 'grid' });
        }
    }, [editingCategory, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catForm.name.trim()) return;
        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, { ...editingCategory, ...catForm });
                showToast('Kategoriya yangilandi');
            } else {
                await addCategory(catForm.name, catForm.viewType);
                showToast('Yangi kategoriya qo\'shildi');
            }
            onClose();
        } catch (error) {
            showToast('Xatolik!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Nomi" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Masalan: Shirinliklar" autoFocus />
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Ko'rinish Turi</label>
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setCatForm({...catForm, viewType: 'grid'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${catForm.viewType === 'grid' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><Grid size={32} /><span className="font-bold">Kartochka</span><span className="text-[10px] opacity-70">Rasmli va katta</span></button>
                    <button type="button" onClick={() => setCatForm({...catForm, viewType: 'list'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${catForm.viewType === 'list' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><LayoutList size={32} /><span className="font-bold">Ro'yxat</span><span className="text-[10px] opacity-70">Ixcham va matnli</span></button>
                </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (editingCategory ? 'Saqlash' : 'Qo\'shish')}
                </Button>
            </form>
        </Modal>
    );
}

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