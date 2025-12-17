import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, TextArea } from '../ui';
import { Save, ImageIcon, Palette, Type, Link as LinkIcon } from 'lucide-react';

const ColorInput: React.FC<{ label: string, description?: string, value: string, onChange: (val: string) => void }> = ({ label, description, value, onChange }) => (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
        <div className="relative shrink-0"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent p-0 opacity-0 absolute inset-0 z-10"/><div className="w-14 h-14 rounded-xl border-2 border-gray-200 shadow-sm flex items-center justify-center overflow-hidden" style={{ backgroundColor: value }}><div className="w-full h-1/2 bg-black/10 absolute bottom-0"></div></div></div>
        <div className="flex-1 min-w-0"><p className="font-bold text-gray-900 text-base">{label}</p>{description && <p className="text-xs text-gray-400 line-clamp-1">{description}</p>}</div>
        <div className="text-xs font-mono font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 uppercase">{value}</div>
    </div>
);

export const SettingsManager: React.FC = () => {
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
            <div className="pt-8 mt-4 border-t border-gray-100"><Button onClick={handleSave} className="w-full py-4 text-lg" disabled={isSubmitting}>{isSubmitting ? "Saqlanmoqda..." : <><Save size={20} /> O'zgarishlarni Saqlash</>}</Button></div>
         </div>
      </div>
   );
};