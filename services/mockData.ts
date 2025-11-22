
import { Branch, Category, Dish, Branding } from '../types';

export const initialBranding: Branding = {
  restaurantName: "Lazzat Milliy Taomlar",
  logoUrl: "https://picsum.photos/id/1060/200/200", // Chef/Kitchen placeholder
  backgroundImageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop", // Default Welcome BG
  headerImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop", // Default Menu Banner
  
  // Colors
  primaryColor: "#F97316",      // Orange-500
  backgroundColor: "#F8F9FC",   // Light Gray/Blueish
  cardColor: "#FFFFFF",         // White
  textColor: "#111827",         // Gray-900
  mutedColor: "#6B7280"         // Gray-500
};

export const initialBranches: Branch[] = [
  {
    id: 'br-1',
    name: 'Chilonzor Filiali',
    address: 'Chilonzor ko\'chasi, 5-uy',
    phone: '+998 90 123 45 67'
  },
  {
    id: 'br-2',
    name: 'Markaziy Filial',
    address: 'Amir Temur ko\'chasi, 10-uy',
    phone: '+998 99 987 65 43',
    customColor: '#DC2626' // Red-600
  }
];

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Quyuq Taomlar', sortOrder: 1, viewType: 'grid' },
  { id: 'cat-2', name: 'Suyuq Taomlar', sortOrder: 2, viewType: 'grid' },
  { id: 'cat-3', name: 'Salatlar', sortOrder: 3, viewType: 'grid' },
  { id: 'cat-4', name: 'Ichimliklar', sortOrder: 4, viewType: 'list' }, // List view example
];

export const initialDishes: Dish[] = [
  {
    id: 'd-1',
    categoryId: 'cat-1',
    name: 'To\'y Oshi (Maxsus)',
    description: 'An\'anaviy to\'y oshi, mol go\'shti, qazi va bedana tuxum bilan. Katta laganda.',
    price: 45000, // Base price (used for sorting or default)
    imageUrls: ['https://picsum.photos/seed/palov/800/400', 'https://picsum.photos/seed/palov2/600/400'],
    variants: [
      { name: '0.7 Portsiya', price: 35000 },
      { name: '1 Portsiya', price: 45000 },
      { name: '1.5 Portsiya (Double)', price: 65000 }
    ],
    badges: ['https://cdn-icons-png.flaticon.com/128/6469/6469034.png', 'https://cdn-icons-png.flaticon.com/128/2396/2396713.png'], // Meat icon example
    isActive: true,
    isFeatured: true, // Katta karta
    availableBranchIds: [], // Available everywhere
    sortOrder: 1
  },
  {
    id: 'd-2',
    categoryId: 'cat-1',
    name: 'Qozon Kabob',
    description: 'Yumshoq pishirilgan qo\'y go\'shti va kartoshka.',
    price: 65000,
    imageUrls: ['https://picsum.photos/seed/qozon/600/400'],
    isActive: true,
    availableBranchIds: ['br-2'], // Only at Markaziy Filial
    sortOrder: 2
  },
  {
    id: 'd-3',
    categoryId: 'cat-2',
    name: 'Mastava',
    description: 'Qatiq bilan tortiladigan guruchli sho\'rva.',
    price: 30000,
    imageUrls: ['https://picsum.photos/seed/mastava/600/400'],
    isActive: true,
    availableBranchIds: [],
    sortOrder: 1
  },
  {
    id: 'd-4',
    categoryId: 'cat-3',
    name: 'Achichuk',
    description: 'Pomidor, piyoz va achchiq qalampir.',
    price: 15000,
    imageUrls: ['https://picsum.photos/seed/achichuk/600/400'],
    badges: ['https://cdn-icons-png.flaticon.com/128/603/603222.png'], // Chili icon
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'd-5',
    categoryId: 'cat-4',
    name: 'Coca-Cola',
    description: 'Muzdek ichimlik.',
    price: 12000,
    imageUrls: ['https://picsum.photos/seed/coke/600/400'],
    variants: [
        { name: '0.5L', price: 7000 },
        { name: '1L', price: 12000 },
        { name: '1.5L', price: 16000 }
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'd-7',
    categoryId: 'cat-4',
    name: 'Fanta',
    description: 'Apelsin ta\'mli gazli ichimlik.',
    price: 12000,
    imageUrls: ['https://picsum.photos/seed/fanta/600/400'],
    variants: [
        { name: '0.5L', price: 7000 },
        { name: '1L', price: 12000 }
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'd-8',
    categoryId: 'cat-4',
    name: 'Kompot',
    description: 'Mevli sharbat (stakan).',
    price: 5000,
    imageUrls: [],
    isActive: true,
    sortOrder: 3
  },
   {
    id: 'd-6',
    categoryId: 'cat-1',
    name: 'Norin',
    description: 'Ot go\'shtidan tayyorlangan maxsus xamirli taom.',
    price: 50000,
    imageUrls: ['https://picsum.photos/seed/norin/600/400'],
    badges: ['https://cdn-icons-png.flaticon.com/128/1993/1993257.png'], // Horse meat icon
    isActive: false, // Hidden
    sortOrder: 3
  }
];
