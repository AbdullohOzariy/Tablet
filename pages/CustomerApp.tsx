
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Branch, Dish } from '../types';
import { MapPin, Phone, Info, ChevronRight, ArrowLeft, Home, Clock, Search, Utensils, Sparkles } from 'lucide-react';

// --- Branch Selector (Welcome Screen) ---
const BranchSelector: React.FC<{ onSelect: (b: Branch) => void }> = ({ onSelect }) => {
  const { branches, branding } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (branches.length === 1) {
      onSelect(branches[0]);
    }
  }, [branches, onSelect]);

  // Dynamic Styles
  const bgStyle = { backgroundColor: branding.backgroundColor };
  const cardStyle = { backgroundColor: branding.cardColor, borderColor: 'transparent' };
  const textStyle = { color: branding.textColor };
  const mutedStyle = { color: branding.mutedColor };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bgStyle}>
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[50vh] z-0" style={{ backgroundColor: branding.textColor }}>
         <div 
            className="absolute inset-0 opacity-30 bg-cover bg-center transition-all duration-700" 
            style={{ backgroundImage: `url('${branding.backgroundImageUrl}')` }} 
         />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-current" style={{ color: branding.backgroundColor }} />
      </div>

      {/* Header Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-16 pb-6 max-w-6xl mx-auto w-full">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-0 left-4 md:left-0 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-12 animate-slideIn">
          <div className="w-40 h-40 mx-auto mb-6 p-2 rounded-full shadow-2xl ring-4 ring-white/20" style={{ backgroundColor: branding.cardColor }}>
             <img 
               src={branding.logoUrl} 
               alt="Logo" 
               className="w-full h-full rounded-full object-cover"
               onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Logo'}
             />
          </div>
          {/* Inverse text color for header area as it sits on dark bg/image */}
          <h1 className="text-4xl md:text-6xl font-black mb-3 drop-shadow-sm tracking-tight mix-blend-overlay" style={{ color: branding.backgroundColor }}>{branding.restaurantName}</h1>
          <p className="text-lg md:text-xl font-medium opacity-80" style={{ color: branding.backgroundColor }}>Xush kelibsiz! Iltimos, filialni tanlang</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-slideIn" style={{ animationDelay: '0.1s' }}>
          {branches.map((branch) => {
            const themeColor = branch.customColor || branding.primaryColor;
            return (
              <button
                key={branch.id}
                onClick={() => onSelect(branch)}
                className="group relative p-6 rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={cardStyle}
              >
                <div 
                  className="absolute top-0 left-0 w-2 h-full transition-all duration-300 group-hover:w-3" 
                  style={{ backgroundColor: themeColor }}
                />
                
                <div className="flex items-center gap-6 pl-4">
                   {branch.logoUrl ? (
                      <img src={branch.logoUrl} alt={branch.name} className="w-24 h-24 rounded-2xl object-cover shadow-lg border group-hover:scale-105 transition-transform" style={{ borderColor: branding.backgroundColor }} />
                   ) : (
                      <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: branding.backgroundColor, color: branding.mutedColor }}>
                         <MapPin size={36} />
                      </div>
                   )}
                   
                   <div className="flex-1 min-w-0 py-2">
                     <h2 className="text-2xl font-bold mb-3 truncate pr-8" style={textStyle}>
                       {branch.name}
                     </h2>
                     <div className="space-y-2">
                        <div className="flex items-center w-fit px-2 py-1 rounded-lg" style={{ backgroundColor: branding.backgroundColor }}>
                          <MapPin className="w-4 h-4 mr-2 shrink-0 opacity-70" style={mutedStyle} />
                          <span className="text-sm font-medium line-clamp-1" style={mutedStyle}>{branch.address}</span>
                        </div>
                        <div className="flex items-center w-fit px-2 py-1 rounded-lg" style={{ backgroundColor: branding.backgroundColor }}>
                          <Phone className="w-4 h-4 mr-2 shrink-0 opacity-70" style={mutedStyle} />
                          <span className="text-sm font-medium" style={mutedStyle}>{branch.phone}</span>
                        </div>
                     </div>
                   </div>

                   <div 
                     className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                     style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                   >
                      <ChevronRight className="w-6 h-6" />
                   </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Menu Viewer (Main Interface) ---
const MenuViewer: React.FC<{ branch: Branch; onBack: () => void }> = ({ branch, onBack }) => {
  const { categories, getDishesByCategory, branding, branches } = useStore();
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const themeColor = branch.customColor || branding.primaryColor;
  const isSingleBranch = branches.length <= 1;

  // Dynamic Branding Styles
  const bgStyle = { backgroundColor: branding.backgroundColor };
  const cardStyle = { backgroundColor: branding.cardColor };
  const textStyle = { color: branding.textColor };
  const mutedStyle = { color: branding.mutedColor };

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            setScrolled(scrollContainerRef.current.scrollTop > 50);
        }
    };
    const el = scrollContainerRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-select first category
  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // Scroll to top when category changes
  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
    if(scrollContainerRef.current) {
        // Smooth scroll to content start
        const heroHeight = 200; // Approx height of hero section
        const currentScroll = scrollContainerRef.current.scrollTop;
        
        if (currentScroll > heroHeight) {
             scrollContainerRef.current.scrollTo({ top: heroHeight, behavior: 'smooth' });
        }
    }
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  
  // --- BRANCH FILTERING LOGIC ---
  const activeDishes = getDishesByCategory(activeCategoryId)
    .filter(d => d.isActive)
    .filter(d => {
        // If availableBranchIds is empty/undefined, it is available everywhere.
        // Otherwise, the current branch ID must be in the list.
        if (!d.availableBranchIds || d.availableBranchIds.length === 0) return true;
        return d.availableBranchIds.includes(branch.id);
    });

  const isListView = activeCategory?.viewType === 'list';
  
  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden" style={bgStyle}>
      
      {/* Fixed Header Bar */}
      <div className={`z-40 transition-all duration-300 border-b border-white/10`} style={{ backgroundColor: branding.cardColor }}>
        <div className="px-6 py-3 flex items-center justify-between">
           <div className="flex items-center gap-4">
              {isSingleBranch ? (
                 <button onClick={() => navigate('/')} className="p-2.5 rounded-full transition-colors" style={{ backgroundColor: branding.backgroundColor, color: branding.textColor }}>
                    <Home size={20} />
                 </button>
              ) : (
                 <button onClick={onBack} className="p-2.5 rounded-full transition-colors" style={{ backgroundColor: branding.backgroundColor, color: branding.textColor }}>
                    <ArrowLeft size={20} />
                 </button>
              )}

              {/* Logo & Info */}
              <div className="flex items-center gap-3 pl-2 border-l" style={{ borderColor: branding.backgroundColor }}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border" style={{ borderColor: branding.backgroundColor, backgroundColor: branding.backgroundColor }}>
                     <img src={branch.logoUrl || branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <h1 className="text-lg font-extrabold leading-none" style={textStyle}>{branding.restaurantName}</h1>
                     <p className="text-xs font-bold uppercase tracking-wide mt-0.5" style={mutedStyle}>{branch.name}</p>
                  </div>
              </div>
           </div>

           {/* Time */}
           <div className="px-4 py-2 rounded-full flex items-center gap-2 border border-transparent" style={{ backgroundColor: branding.backgroundColor }}>
              <Clock size={16} style={{ color: themeColor }}/>
              <span className="text-sm font-bold tabular-nums" style={textStyle}>
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
           </div>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
         
         {/* Hero Banner */}
         <div className="relative w-full h-64 md:h-72 overflow-hidden shrink-0" style={{ backgroundColor: branding.textColor }}>
             <img 
                src={branding.headerImageUrl} 
                className="w-full h-full object-cover opacity-60 transition-opacity duration-500"
                alt="Cover"
                onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop'}
             />
             <div className="absolute inset-0 bg-gradient-to-t to-transparent" style={{ '--tw-gradient-from': branding.backgroundColor } as any}></div>
             <div className="absolute bottom-0 left-0 w-full px-8 pb-8 pt-20 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                 <div className="max-w-[1600px] mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
                       Ta'm va Lazzzat
                    </h2>
                    <p className="text-gray-200 text-lg font-medium max-w-xl drop-shadow-md">
                       Bizning maxsus taomlarimizdan bahramand bo'ling. Faqat yangi masalliqlar va sevimli retseptlar.
                    </p>
                 </div>
             </div>
         </div>

         {/* Sticky Category Navigation */}
         <div className="sticky top-0 z-30 pt-4 pb-4 px-6 shadow-sm" style={{ backgroundColor: branding.backgroundColor, opacity: 0.98 }}>
             <div className="max-w-[1600px] mx-auto" ref={categoryScrollRef}>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {categories.sort((a, b) => a.sortOrder - b.sortOrder).map(cat => {
                        const isActive = activeCategoryId === cat.id;
                        return (
                            <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`relative px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 flex items-center gap-2 whitespace-nowrap border-2
                                ${isActive ? 'shadow-lg scale-105' : 'border-transparent hover:opacity-80'}`}
                            style={isActive 
                                ? { backgroundColor: themeColor, color: '#fff', borderColor: themeColor } 
                                : { backgroundColor: branding.cardColor, color: branding.mutedColor }}
                            >
                            {isActive && <Sparkles size={16} className="animate-pulse" />}
                            {cat.name}
                            </button>
                        );
                    })}
                </div>
             </div>
         </div>

         {/* Main Content (Dish Grid/List) */}
         <div className="max-w-[1600px] mx-auto px-6 pt-8 pb-32">
            <div className="mb-6">
                <h3 className="text-3xl font-black flex items-center gap-3" style={textStyle}>
                    {activeCategory?.name}
                    <span className="text-sm font-normal px-2 py-1 rounded-lg" style={{ backgroundColor: branding.cardColor, color: branding.mutedColor }}>
                        {activeDishes.length} taom
                    </span>
                </h3>
            </div>

            {activeDishes.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 animate-slideIn" style={mutedStyle}>
                  <div className="w-24 h-24 rounded-full shadow-sm flex items-center justify-center mb-4" style={cardStyle}>
                     <Info className="w-10 h-10 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold" style={textStyle}>Hozircha bo'sh</h3>
                  <p>Ushbu kategoriyada taomlar mavjud emas.</p>
               </div>
            ) : (
               <>
                {/* --- LIST VIEW RENDERER (PREMIUM) --- */}
                {isListView ? (
                   <div className="max-w-6xl mx-auto animate-slideIn">
                      <div className="rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden relative" style={cardStyle}>
                         {/* Header decorative line */}
                        <div className="h-1.5 w-full" style={{ backgroundColor: themeColor }}></div>
                        
                        <div className="p-2 md:p-4 space-y-1">
                            {activeDishes.map((dish, index) => (
                                <div key={dish.id} className="group relative p-4 md:p-5 rounded-2xl transition-all duration-200 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-8 hover:bg-black/5">
                                    
                                    {/* Image (Optional) */}
                                    {dish.imageUrls && dish.imageUrls.length > 0 ? (
                                        <div className="hidden md:block shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all" style={{ backgroundColor: branding.backgroundColor }}>
                                            <img src={dish.imageUrls[0]} alt={dish.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ) : (
                                        <div className="hidden md:flex shrink-0 w-20 h-20 rounded-2xl items-center justify-center border" style={{ backgroundColor: branding.backgroundColor, borderColor: 'transparent', color: branding.mutedColor }}>
                                            <Utensils size={24} />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 w-full min-w-0 flex flex-col justify-center h-full py-1">
                                        <div className="flex items-center w-full gap-3">
                                            <h3 className="text-xl md:text-2xl font-bold leading-tight" style={textStyle}>
                                                {dish.name}
                                            </h3>
                                            {/* Badges in List View */}
                                            {dish.badges && dish.badges.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    {dish.badges.map((badgeUrl, bIdx) => (
                                                        <img key={bIdx} src={badgeUrl} alt="badge" className="w-6 h-6 object-contain" title="Ingredient" />
                                                    ))}
                                                </div>
                                            )}
                                            {/* Dot Leader */}
                                            <div className="flex-1 mx-4 border-b-2 border-dotted relative top-[-6px] opacity-30 hidden md:block" style={{ borderColor: branding.mutedColor }}></div>
                                        </div>
                                        
                                        {dish.description && (
                                            <p className="text-sm font-medium mt-1 line-clamp-1" style={mutedStyle}>{dish.description}</p>
                                        )}
                                    </div>

                                    {/* Price/Variants Section */}
                                    <div className="w-full md:w-auto flex flex-col justify-end items-end shrink-0">
                                        {dish.variants && dish.variants.length > 0 ? (
                                            <div className="flex flex-wrap justify-end gap-2 w-full">
                                                {dish.variants.map((v, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center gap-0 border rounded-full overflow-hidden shadow-sm transition-all"
                                                        style={{ backgroundColor: branding.cardColor, borderColor: branding.backgroundColor }}
                                                    >
                                                        <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-r" style={{ backgroundColor: branding.backgroundColor, color: branding.mutedColor, borderColor: branding.cardColor }}>
                                                            {v.name}
                                                        </span>
                                                        <span className="px-3 py-1.5 font-bold text-sm min-w-[80px] text-center" style={textStyle}>
                                                            {v.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline gap-1.5 px-4 py-1.5 rounded-full border border-transparent transition-all shadow-sm" style={{ backgroundColor: branding.backgroundColor }}>
                                                <span className="text-2xl font-black tracking-tight" style={textStyle}>
                                                    {dish.price.toLocaleString()}
                                                </span>
                                                <span className="text-xs font-bold uppercase opacity-60" style={textStyle}>so'm</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                      </div>
                   </div>
                ) : (
                   /* --- GRID VIEW RENDERER (CARD PREMIUM) --- */
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {activeDishes.map((dish, index) => (
                         <div 
                            key={dish.id} 
                            className={`group relative rounded-[2.5rem] p-4 shadow-lg shadow-black/5 border border-transparent hover:shadow-2xl flex flex-col h-full animate-slideIn transition-transform duration-300 hover:-translate-y-2 ${dish.isFeatured ? 'md:col-span-2' : ''}`}
                            style={{ backgroundColor: branding.cardColor, animationDelay: `${index * 0.05}s` }}
                         >
                            {/* Image Area */}
                            <div className={`relative w-full ${dish.isFeatured ? 'aspect-[9/4]' : 'aspect-[5/3]'} rounded-[2rem] overflow-hidden mb-5 shadow-inner`} style={{ backgroundColor: branding.backgroundColor }}>
                               <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                                  {dish.imageUrls.length > 0 ? (
                                     dish.imageUrls.map((url, idx) => (
                                        <img 
                                           key={idx}
                                           src={url} 
                                           alt={dish.name} 
                                           className="w-full h-full object-cover snap-center shrink-0 transform transition-transform duration-700 group-hover:scale-105"
                                           loading="lazy"
                                           onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image' }}
                                        />
                                     ))
                                  ) : (
                                     <div className="w-full h-full flex items-center justify-center" style={{ color: branding.mutedColor }}>
                                        <Utensils size={48} className="opacity-50" />
                                     </div>
                                  )}
                               </div>
                               
                               {/* Badges Overlay in Image */}
                               {dish.badges && dish.badges.length > 0 && (
                                   <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                                       {dish.badges.map((badgeUrl, bIdx) => (
                                           <div key={bIdx} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm p-1 shadow-md flex items-center justify-center" title="Ingredient">
                                               <img src={badgeUrl} alt="badge" className="w-full h-full object-contain" />
                                           </div>
                                       ))}
                                   </div>
                               )}

                               <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>
                            
                            <div className="flex-1 flex flex-col px-2 pb-2">
                               <div className="mb-2">
                                  <h3 className={`font-extrabold leading-tight line-clamp-1 ${dish.isFeatured ? 'text-3xl' : 'text-2xl'}`} title={dish.name} style={textStyle}>{dish.name}</h3>
                               </div>
                               
                               <p className="text-base leading-relaxed line-clamp-2 mb-6 flex-1 font-medium" style={mutedStyle}>
                                  {dish.description || "Mazali taom, albatta tatib ko'ring!"}
                               </p>
                               
                               {/* Variants / Price Block */}
                               <div className="mt-auto">
                                  {dish.variants && dish.variants.length > 0 ? (
                                     <div className={`space-y-2 pt-4 border-t border-dashed ${dish.isFeatured ? 'grid grid-cols-2 gap-3 space-y-0' : ''}`} style={{ borderColor: branding.backgroundColor }}>
                                           {dish.variants.map((variant, idx) => (
                                              <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl transition-colors border border-transparent hover:border-opacity-50" style={{ backgroundColor: branding.backgroundColor }}>
                                                 <span className="font-bold text-sm" style={{ color: branding.mutedColor }}>{variant.name}</span>
                                                 <span className="font-black" style={{ color: themeColor }}>
                                                    {variant.price.toLocaleString()}
                                                 </span>
                                              </div>
                                           ))}
                                     </div>
                                  ) : (
                                     <div className="pt-4 border-t border-dashed flex items-center justify-between" style={{ borderColor: branding.backgroundColor }}>
                                         <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50" style={textStyle}>Narxi</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black" style={{ color: themeColor }}>{dish.price.toLocaleString()}</span>
                                                <span className="text-xs font-bold opacity-70" style={textStyle}>so'm</span>
                                            </div>
                                         </div>
                                     </div>
                                  )}
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
               </>
            )}
         </div>
      </div>
    </div>
  );
};

const CustomerApp: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  if (selectedBranch) {
    return <MenuViewer branch={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  }

  return <BranchSelector onSelect={setSelectedBranch} />;
};

export default CustomerApp;
