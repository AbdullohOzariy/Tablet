
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  customColor?: string; // Optional override
  logoUrl?: string; // Optional override
}

export type CategoryViewType = 'grid' | 'list';

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  viewType: CategoryViewType; // 'grid' (default) or 'list'
}

export interface DishVariant {
  name: string; // e.g. "0.7 portsiya", "Mol go'shtli"
  price: number;
}

export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  variants?: DishVariant[]; // New field for portions/types
  badges?: string[]; // New: Ingredients/Icons URLs (e.g. beef icon, cheese icon)
  isActive: boolean;
  isFeatured?: boolean; // New: Agar true bo'lsa, gridda 2 ta joy egallaydi (Wide card)
  availableBranchIds?: string[]; // New: Agar bo'sh bo'lsa, barcha filiallarda ko'rinadi. Aks holda faqat ID lari borlarida.
  sortOrder: number;
}

export interface Branding {
  restaurantName: string;
  logoUrl: string;
  backgroundImageUrl?: string; // New: Main App Background / Welcome Screen
  headerImageUrl?: string;     // New: Menu Top Banner
  // Colors
  primaryColor: string;      // Buttons, Highlights, Accents
  backgroundColor: string;   // Main App Background
  cardColor: string;         // Product Cards / Containers
  textColor: string;         // Headings, Main Text
  mutedColor: string;        // Descriptions, Secondary Text
}

export enum ViewMode {
  CUSTOMER_BRANCH_SELECT = 'CUSTOMER_BRANCH_SELECT',
  CUSTOMER_MENU = 'CUSTOMER_MENU',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
