import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Dish, Category, Branch } from '../../types';
import { Button, Input, TextArea, Modal } from '../ui';
import { DollarSign, Link as LinkIcon, Upload, Trash2, Plus, CheckCircle, Maximize2, Tag, Layers, Store as StoreIcon, Globe, X, ArrowRight, ArrowLeft, FileImage, Info } from 'lucide-react';

interface DishModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingDish: Dish | null;
    initialCategoryId?: string;
}

const LoadingSpinner: React.FC = () => <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>;

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number; setStep: (step: number) => void }> = ({ currentStep, totalSteps, setStep }) => (
    <div className="flex justify-center items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isCompleted = step < currentStep;
            const isActive = step === currentStep;
            return (
                <React.Fragment key={step}>
                    <button type="button" onClick={() => isCompleted || isActive ? setStep(step) : undefined} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 ${isActive ? 'bg-gray-900 text-white border-gray-900' : ''} ${isCompleted ? 'bg-emerald-500 text-white border-emerald-500 cursor-pointer' : ''} ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400 border-gray-200' : ''}`}>
                        {isCompleted ? <CheckCircle size={24} /> : step}
                    </button>
                    {step < totalSteps && <div className={`h-1 w-12 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
            );
        })}
    </div>
);

export const DishModal: React.FC<DishModalProps> = ({ isOpen, onClose, editingDish, initialCategoryId }) => {
    const { categories, branches, addDish, updateDish } = useStore();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState<Omit<Dish, 'id'>>({ categoryId: '', name: '', description: '', price: 0, imageUrls: [], isActive: true, isFeatured: false, availableBranchIds: [], sortOrder: 0, variants: [], badges: [] });
    const [useVariants, setUseVariants] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [badgeUrlInput, setBadgeUrlInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            if (editingDish) {
                setFormState({ ...editingDish });
                setUseVariants(!!(editingDish.variants && editingDish.variants.length > 0));
            } else {
                setFormState({ categoryId: initialCategoryId && initialCategoryId !== 'all' ? initialCategoryId : (categories[0]?.id || ''), name: '', description: '', price: 0, imageUrls: [], isActive: true, isFeatured: false, availableBranchIds: [], sortOrder: 0, variants: [], badges: [] });
                setUseVariants(false);
            }
            setImageUrlInput('');
            setBadgeUrlInput('');
        }
    }, [isOpen, editingDish, initialCategoryId, categories]);

    const handleNext = () => {
        if (step === 1 && (!formState.name || !formState.categoryId)) {
            showToast("Taom nomi va kategoriyasini to'ldiring!", "warning");
            return;
        }
        setStep(s => Math.min(s + 1, 3));
    };
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleDishSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name || !formState.categoryId) {
            showToast("1-qadamdagi majburiy maydonlarni to'ldiring.", "error");
            setStep(1);
            return;
        }
        setIsSubmitting(true);
        try {
            let payload: Omit<Dish, 'id'> = { ...formState, price: Number(formState.price) };
            if (!useVariants) payload.variants = [];
            else {
                if (!payload.variants || payload.variants.length === 0) { showToast("Variantlar uchun kamida bitta narx kiriting.", "error"); setIsSubmitting(false); return; }
                payload.variants = payload.variants.map(v => ({ ...v, price: Number(v.price) }));
                payload.price = Math.min(...payload.variants.map(v => v.price));
            }
            if (editingDish) {
                await updateDish(editingDish.id, { ...editingDish, ...payload });
                showToast('Taom muvaffaqiyatli yangilandi');
            } else {
                await addDish(payload);
                showToast('Yangi taom qo\'shildi');
            }
            onClose();
        } catch (error) {
            console.error("Taomni saqlashda xatolik:", error);
            showToast('Xatolik yuz berdi!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: return <Step1 formState={formState} setFormState={setFormState} categories={categories} useVariants={useVariants} setUseVariants={setUseVariants} />;
            case 2: return <Step2 formState={formState} setFormState={setFormState} imageUrlInput={imageUrlInput} setImageUrlInput={setImageUrlInput} badgeUrlInput={badgeUrlInput} setBadgeUrlInput={setBadgeUrlInput} />;
            case 3: return <Step3 formState={formState} setFormState={setFormState} branches={branches} />;
            default: return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingDish ? 'Taomni Tahrirlash' : 'Yangi Taom Qo\'shish'}>
            <StepIndicator currentStep={step} totalSteps={3} setStep={setStep} />
            <form onSubmit={handleDishSubmit}>
                <div className="min-h-[400px] py-4">{renderStepContent()}</div>
                <div className="pt-6 flex gap-4 border-t border-gray-100">
                    {step > 1 && <Button type="button" variant="secondary" onClick={handlePrev} icon={ArrowLeft}>Oldingisi</Button>}
                    <div className="flex-1"></div>
                    {step < 3 ? <Button type="button" onClick={handleNext} icon={ArrowRight} className="w-full justify-center sm:w-auto">Keyingisi</Button> : <Button type="submit" className="w-full justify-center sm:w-auto" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner/> : 'Saqlash'}</Button>}
                </div>
            </form>
        </Modal>
    );
};

// --- Step Components ---
const Step1 = ({ formState, setFormState, categories, useVariants, setUseVariants }) => (
    <div className="space-y-6 animate-slideIn">
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Kategoriya *</label>
            <div className="flex flex-wrap gap-2">{categories.map(c => <button key={c.id} type="button" onClick={() => setFormState({...formState, categoryId: c.id})} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${formState.categoryId === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{c.name}</button>)}</div>
        </div>
        <Input label="Taom Nomi *" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Masalan: Osh" required />
        <TextArea label="Tavsif" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} placeholder="Taomning tarkibi, o'ziga xosligi haqida qisqacha ma'lumot..." rows={4} />
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4"><span className="font-bold text-gray-800 flex items-center gap-2"><Layers size={18} className="text-orange-500"/> Narx turi</span><div className="flex items-center bg-gray-200 rounded-lg p-1 gap-1"><button type="button" onClick={() => setUseVariants(false)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!useVariants ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Oddiy</button><button type="button" onClick={() => setUseVariants(true)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${useVariants ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Variantlar</button></div></div>
            {useVariants ? <div className="space-y-3">{formState.variants?.map((v, idx) => <div key={idx} className="flex gap-3 items-center animate-slideIn"><div className="flex-1"><Input placeholder="Nomi (masalan: 0.7)" value={v.name} onChange={e => {const n=[...(formState.variants||[])]; n[idx].name=e.target.value; setFormState({...formState, variants:n})}} className="py-2.5 text-sm" /></div><div className="w-32"><Input type="number" placeholder="Narx" value={v.price} onChange={e => {const n=[...(formState.variants||[])]; n[idx].price=Number(e.target.value); setFormState({...formState, variants:n})}} className="py-2.5 text-sm" icon={DollarSign} /></div><button type="button" onClick={() => {const n=[...(formState.variants||[])]; n.splice(idx,1); setFormState({...formState, variants:n})}} className="p-2.5 bg-white border border-gray-200 text-red-500 rounded-xl hover:bg-red-50"><Trash2 size={16}/></button></div>)}<button type="button" onClick={() => setFormState({...formState, variants:[...(formState.variants||[]), {name:'', price:0}]})} className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 w-fit transition-colors"><Plus size={16}/> Variant qo'shish</button></div> : <Input label="Narx *" type="number" value={formState.price} onChange={e => setFormState({...formState, price: Number(e.target.value)})} placeholder="0" icon={DollarSign} required />}
        </div>
    </div>
);

const Step2 = ({ formState, setFormState, imageUrlInput, setImageUrlInput, badgeUrlInput, setBadgeUrlInput }) => {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            Promise.all(files.map(f => new Promise<string>((res) => { const r = new FileReader(); r.onload = (ev) => res(ev.target?.result as string); r.readAsDataURL(f); }))).then(imgs => setFormState(p => ({...p, imageUrls: [...p.imageUrls, ...imgs]})));
        }
    };
    const addImageFromUrl = () => { if (imageUrlInput.trim()) { setFormState(p => ({ ...p, imageUrls: [...p.imageUrls, imageUrlInput] })); setImageUrlInput(''); } };
    const addBadgeFromUrl = () => { if (badgeUrlInput.trim()) { setFormState(p => ({ ...p, badges: [...(p.badges || []), badgeUrlInput] })); setBadgeUrlInput(''); } };

    return (
        <div className="space-y-6 animate-slideIn">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Rasmlar</label>
                <div className="flex gap-2 mb-4"><div className="flex-1"><Input placeholder="Rasm havolasi (URL)..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} icon={LinkIcon} className="py-2.5 text-sm"/></div><Button type="button" variant="secondary" onClick={addImageFromUrl} disabled={!imageUrlInput.trim()} className="py-2 px-4">Qo'shish</Button></div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formState.imageUrls.map((url, idx) => <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-gray-200 bg-gray-50"><img src={url} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/150?text=Error'} /><button type="button" onClick={() => setFormState(p => ({...p, imageUrls: p.imageUrls.filter((_,i)=>i!==idx)}))} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2/></button></div>)}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer"><Upload size={24} /><span className="text-[10px] font-bold mt-1">Fayl Yuklash</span><input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} /></label>
                </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Tag size={14} /> Taom belgilari (Ikonkalar)</label>
                <div className="flex gap-2 mb-4"><div className="flex-1"><Input placeholder="Ikonka havolasi (https://...)" value={badgeUrlInput} onChange={(e) => setBadgeUrlInput(e.target.value)} icon={LinkIcon} className="py-2.5 text-sm"/></div><Button type="button" variant="secondary" onClick={addBadgeFromUrl} disabled={!badgeUrlInput.trim()} className="py-2 px-4">Qo'shish</Button></div>
                {formState.badges && formState.badges.length > 0 && <div className="flex flex-wrap gap-3">{formState.badges.map((url, idx) => <div key={idx} className="relative group w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-1"><img src={url} className="w-full h-full object-contain" alt="badge" /><button type="button" onClick={() => setFormState(p => ({...p, badges: p.badges?.filter((_, i) => i !== idx)}))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X size={12} /></button></div>)}</div>}
            </div>
        </div>
    );
};

const Step3 = ({ formState, setFormState, branches }) => {
    const toggleBranchAvailability = (branchId: string) => {
        setFormState(prev => {
            const currentIds = prev.availableBranchIds || [];
            const newIds = currentIds.includes(branchId) ? currentIds.filter(id => id !== branchId) : [...currentIds, branchId];
            return { ...prev, availableBranchIds: newIds };
        });
    };
    return (
        <div className="space-y-6 animate-slideIn">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><StoreIcon size={14} /> Filiallarda Mavjudligi</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button type="button" onClick={() => setFormState(p => ({...p, availableBranchIds: []}))} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${!formState.availableBranchIds || formState.availableBranchIds.length === 0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}><Globe size={16} /> Barchasida</button>
                    {branches.map(b => { const isSelected = formState.availableBranchIds?.includes(b.id); return <button key={b.id} type="button" onClick={() => toggleBranchAvailability(b.id)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${isSelected ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-500 border-gray-200'}`}>{isSelected ? <CheckCircle size={16} className="text-orange-500"/> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}<span className="truncate">{b.name}</span></button> })}
                </div>
                <p className="text-xs text-gray-400 mt-2">* Agar "Barchasida" tanlansa, kelajakda qo'shiladigan filiallarda ham ko'rinadi.</p>
            </div>
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${formState.isFeatured ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>{formState.isFeatured && <CheckCircle size={14} className="text-white" />}</div>
                <input type="checkbox" className="hidden" checked={!!formState.isFeatured} onChange={e => setFormState({...formState, isFeatured: e.target.checked})} />
                <div className="flex-1">
                    <div className="font-bold text-gray-900 flex items-center gap-2"><Maximize2 size={16} className="text-gray-500"/> Katta Karta (2x eniga)</div>
                    <p className="text-xs text-gray-500 mt-0.5">Menyuda taomni alohida ajratib ko'rsatish uchun</p>
                </div>
            </label>
        </div>
    );
};