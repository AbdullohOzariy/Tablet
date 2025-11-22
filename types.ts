
export interface UserInfo {
  name: string;
  username: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  customColor?: string;
  logoUrl?: string;
}

export type CategoryViewType = 'grid' | 'list';

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  viewType: CategoryViewType;
}

export interface DishVariant {
  name: string;
  price: number;
}

export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  variants?: DishVariant[];
  badges?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  availableBranchIds?: string[];
  sortOrder: number;
}

export interface Branding {
  restaurantName: string;
  slogan?: string; // Yangi maydon
  logoUrl: string;
  backgroundImageUrl?: string;
  headerImageUrl?: string;
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
}

export enum ViewMode {
  CUSTOMER_BRANCH_SELECT = 'CUSTOMER_BRANCH_SELECT',
  CUSTOMER_MENU = 'CUSTOMER_MENU',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
