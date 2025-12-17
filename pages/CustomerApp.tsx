import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Branch, Dish } from '../types';
import { MapPin, Phone, Info, ChevronRight, ArrowLeft, Home, Utensils, Sparkles, ServerCrash } from 'lucide-react';

// --- Helper Functions & Components ---

const optimizeImageUrl = (url: string, width: number): string => {
    if (!url || url.includes('via.placeholder.com')) return url;
    const serviceUrl = `https://images.weserv.nl/?url=`;
    return `${serviceUrl}${encodeURIComponent(url)}&w=${width}&q=75&output=webp`;
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-lg font-semibold text-gray-700">Ma'lumotlar yuklanmoqda...</p>
  </div>
);

const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ServerCrash size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 text-center">Xatolik yuz berdi</h1>
        <p className="text-gray-600 mt-2 text-center max-w-md">{message}</p>
    </div>
);

// --- Optimized Image Component ---
const CachedImage: React.FC<{ src: string; alt: string; className?: string; width: number }> = React.memo(({ src, alt, className, width }) => {
    const optimizedSrc = useMemo(() => optimizeImageUrl(src, width), [src, width]);

    return (
        <img
            src={optimizedSrc}
            alt={alt}
            loading="lazy"
            className={className}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image' }}
        />
    );
});

const BranchSelector: React.FC<{ onSelect: (b: Branch) => void }> = ({ onSelect }) => {
  const { branches, branding } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (branches.length === 1) onSelect(branches[0]);
  }, [branches, onSelect]);

  if (!branding) return null;

  const bgStyle = { backgroundColor: branding.backgroundColor };
  const cardStyle = { backgroundColor: branding.cardColor, borderColor: 'transparent' };
  const textStyle = { color: branding.textColor };
  const mutedStyle = { color: branding.mutedColor };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bgStyle}>
      <div className="absolute top-0 left-0 w-full h-[50vh] z-0" style={{ backgroundColor: branding.textColor }}>
         <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url('${branding.backgroundImageUrl}')` }} />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-current" style={{ color: branding.backgroundColor }} />
      </div>
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 pt-12 sm:pt-16 pb-6 max-w-6xl mx-auto w-full">
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="text-center mb-10 sm:mb-12 animate-slideIn">
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 p-2 rounded-full shadow-2xl ring-4 ring-white/20" style={{ backgroundColor: branding.cardColor }}>
             <img src={branding.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Logo'}/>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 drop-shadow-sm tracking-tight" style={{ color: branding.backgroundColor }}>{branding.restaurantName}</h1>
          <p className="text-base sm:text-lg md:text-xl font-medium opacity-80" style={{ color: branding.backgroundColor }}>{branding.welcomeMessage || "Xush kelibsiz! Iltimos, filialni tanlang"}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full animate-slideIn" style={{ animationDelay: '0.1s' }}>
          {branches.map((branch) => {
            const themeColor = branch.customColor || branding.primaryColor;
            return (
              <button key={branch.id} onClick={() => onSelect(branch)} className="group relative p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={cardStyle}>
                <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full transition-all duration-300 group-hover:w-2.5 sm:group-hover:w-3" style={{ backgroundColor: themeColor }}/>
                <div className="flex items-center gap-4 pl-3 sm:pl-4">
                   {branch.logoUrl ? <CachedImage src={branch.logoUrl} alt={branch.name} width={200} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl object-cover shadow-lg border group-hover:scale-105 transition-transform" /> : <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: branding.backgroundColor, color: branding.mutedColor }}><MapPin size={36} /></div>}
                   <div className="flex-1 min-w-0 py-2">
                     <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 truncate pr-8" style={textStyle}>{branch.name}</h2>
                     <div className="space-y-1.5">
                        <div className="flex items-center w-fit px-2 py-1 rounded-lg" style={{ backgroundColor: branding.backgroundColor }}><MapPin className="w-4 h-4 mr-2 shrink-0 opacity-70" style={mutedStyle} /><span className="text-xs sm:text-sm font-medium line-clamp-1" style={mutedStyle}>{branch.address}</span></div>
                        <div className="flex items-center w-fit px-2 py-1 rounded-lg" style={{ backgroundColor: branding.backgroundColor }}><Phone className="w-4 h-4 mr-2 shrink-0 opacity-70" style={mutedStyle} /><span className="text-xs sm:text-sm font-medium" style={mutedStyle}>{branch.phone}</span></div>
                     </div>
                   </div>
                   <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}><ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Memoized Dish Card to prevent re-renders ---
const DishCard: React.FC<{ dish: Dish; branding: any; themeColor: string }> = React.memo(({ dish, branding, themeColor }) => {
    const textStyle = { color: branding.textColor };
    const mutedStyle = { color: branding.mutedColor };

    return (
        <div className={`group relative rounded-2xl sm:rounded-[2.5rem] p-2 sm:p-4 shadow-lg shadow-black/5 border border-transparent hover:shadow-xl flex flex-col h-full animate-slideIn transition-transform duration-300 hover:-translate-y-1 ${dish.isFeatured ? 'col-span-2' : ''}`}
            style={{ backgroundColor: branding.cardColor }}>
            <div className={`relative w-full ${dish.isFeatured ? 'aspect-video' : 'aspect-[5/4]'} rounded-xl sm:rounded-[2rem] overflow-hidden mb-3 sm:mb-5 shadow-inner`} style={{ backgroundColor: branding.backgroundColor }}>
                <CachedImage src={dish.imageUrls[0]} alt={dish.name} width={dish.isFeatured ? 800 : 400} className="w-full h-full object-cover snap-center shrink-0 transform transition-transform duration-700 group-hover:scale-105" />
                {dish.badges && dish.badges.length > 0 && <div className="absolute bottom-2 left-2 flex gap-1.5 z-10">{dish.badges.map((badgeUrl, bIdx) => <div key={bIdx} className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm p-0.5 shadow-md flex items-center justify-center" title="Ingredient"><img src={badgeUrl} alt="badge" className="w-full h-full object-contain" /></div>)}</div>}
            </div>
            <div className="flex-1 flex flex-col px-1 sm:px-2 pb-1 sm:pb-2">
                <h3 className="font-bold sm:font-extrabold leading-tight line-clamp-2 text-sm sm:text-xl" title={dish.name} style={textStyle}>{dish.name}</h3>
                <p className="text-sm leading-relaxed line-clamp-2 mt-2 mb-4 flex-1 font-medium hidden sm:block" style={mutedStyle}>{dish.description || "Mazali taom, albatta tatib ko'ring!"}</p>
                <div className="mt-auto pt-2 border-t border-dashed" style={{ borderColor: `${branding.mutedColor}22` }}>
                    {dish.variants && dish.variants.length > 0 ? <div className="text-xs sm:text-sm font-bold" style={{ color: themeColor }}>{dish.variants[0].price.toLocaleString()} so'mdan</div> : <div className="text-base sm:text-xl font-black" style={{ color: themeColor }}>{dish.price.toLocaleString()} so'm</div>}
                </div>
            </div>
        </div>
    );
});

const MenuViewer: React.FC<{ branch: Branch; onBack: () => void }> = ({ branch, onBack }) => {
  const { categories, getDishesByCategory, branding, branches } = useStore();
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) setActiveCategoryId(categories[0].id);
  }, [categories, activeCategoryId]);

  if (!branding || !activeCategoryId) return null;

  const themeColor = branch.customColor || branding.primaryColor;
  const isSingleBranch = branches.length <= 1;
  const bgStyle = { backgroundColor: branding.backgroundColor };
  const cardStyle = { backgroundColor: branding.cardColor };
  const textStyle = { color: branding.textColor };
  const mutedStyle = { color: branding.mutedColor };

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
    if(scrollContainerRef.current) {
        const heroHeight = 150;
        if (scrollContainerRef.current.scrollTop > heroHeight) scrollContainerRef.current.scrollTo({ top: heroHeight, behavior: 'smooth' });
    }
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeDishes = getDishesByCategory(activeCategoryId).filter(d => !d.availableBranchIds || d.availableBranchIds.length === 0 || d.availableBranchIds.includes(branch.id));

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden" style={bgStyle}>
      <div className={`z-40 transition-all duration-300 border-b border-white/10`} style={{ backgroundColor: branding.cardColor }}>
        <div className="px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-3">
              {isSingleBranch ? <button onClick={() => navigate('/')} className="p-2 rounded-full transition-colors" style={{ backgroundColor: branding.backgroundColor, color: branding.textColor }}><Home size={18} /></button> : <button onClick={onBack} className="p-2 rounded-full transition-colors" style={{ backgroundColor: branding.backgroundColor, color: branding.textColor }}><ArrowLeft size={18} /></button>}
              <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: branding.backgroundColor }}>
                  <div className="w-9 h-9 rounded-full overflow-hidden border" style={{ borderColor: branding.backgroundColor, backgroundColor: branding.backgroundColor }}><img src={branch.logoUrl || branding.logoUrl} alt="Logo" className="w-full h-full object-cover" /></div>
                  <div><h1 className="text-base font-extrabold leading-none" style={textStyle}>{branding.restaurantName}</h1><p className="text-xs font-bold uppercase tracking-wide" style={mutedStyle}>{branch.name}</p></div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
         <div className="relative w-full h-48 md:h-72 overflow-hidden shrink-0" style={{ backgroundColor: branding.textColor }}>
             <CachedImage src={branding.headerImageUrl || ''} alt="Cover" width={1000} className="w-full h-full object-cover opacity-60" />
             <div className="absolute inset-0 bg-gradient-to-t to-transparent" style={{ '--tw-gradient-from': branding.backgroundColor } as any}></div>
             <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 pb-4 sm:pb-8 pt-16 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                 <div className="max-w-[1600px] mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-1 drop-shadow-lg">{branding.menuHeroTitle || "Ta'm va Lazzzat"}</h2>
                    <p className="text-gray-200 text-sm md:text-lg font-medium max-w-xl drop-shadow-md line-clamp-2">{branding.menuHeroSubtitle || "Bizning maxsus taomlarimizdan bahramand bo'ling."}</p>
                 </div>
             </div>
         </div>

         <div className="sticky top-0 z-30 pt-3 pb-3 px-4 shadow-sm" style={{ backgroundColor: branding.backgroundColor, opacity: 0.98 }}>
             <div className="max-w-[1600px] mx-auto">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {categories.sort((a, b) => a.sortOrder - b.sortOrder).map(cat => {
                        const isActive = activeCategoryId === cat.id;
                        return <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className={`relative px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap border-2 ${isActive ? 'shadow-md scale-105' : 'border-transparent hover:opacity-80'}`} style={isActive ? { backgroundColor: themeColor, color: '#fff', borderColor: themeColor } : { backgroundColor: branding.cardColor, color: branding.mutedColor }}>{isActive && <Sparkles size={14} />} {cat.name}</button>;
                    })}
                </div>
             </div>
         </div>

         <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-32">
            <div className="mb-4"><h3 className="text-2xl font-black flex items-center gap-3" style={textStyle}>{activeCategory?.name}<span className="text-xs font-normal px-2 py-1 rounded-lg" style={{ backgroundColor: branding.cardColor, color: branding.mutedColor }}>{activeDishes.length} taom</span></h3></div>
            {activeDishes.length === 0 ? <div className="flex flex-col items-center justify-center h-64 animate-slideIn" style={mutedStyle}><div className="w-24 h-24 rounded-full shadow-sm flex items-center justify-center mb-4" style={cardStyle}><Info className="w-10 h-10 opacity-50" /></div><h3 className="text-xl font-bold" style={textStyle}>Hozircha bo'sh</h3><p>Ushbu kategoriyada taomlar mavjud emas.</p></div> : (
               <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                  {activeDishes.map((dish) => (
                     <DishCard key={dish.id} dish={dish} branding={branding} themeColor={themeColor} />
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const CustomerApp: React.FC = () => {
  const { loading, error } = useStore();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (selectedBranch) return <MenuViewer branch={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  return <BranchSelector onSelect={setSelectedBranch} />;
};

export default CustomerApp;