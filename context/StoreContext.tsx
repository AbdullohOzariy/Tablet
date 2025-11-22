import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, Category, Dish, Branding, CategoryViewType, UserInfo } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001';

interface StoreContextType {
  loading: boolean;
  userInfo: UserInfo | null;
  signIn: (userData: UserInfo) => void;
  signOut: () => void;
  branding: Branding | null;
  updateBranding: (settings: Branding) => Promise<void>;
  branches: Branch[];
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, data: Branch) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  categories: Category[];
  addCategory: (name: string, viewType: CategoryViewType) => Promise<void>;
  updateCategory: (id: string, data: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: Category[]) => Promise<void>; // Yangi funksiya
  dishes: Dish[];
  addDish: (dish: Omit<Dish, 'id'>) => Promise<void>;
  updateDish: (id: string, data: Dish) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
  reorderDishes: (updatedDishes: Dish[]) => Promise<void>;
  moveDish: (id: string, direction: 'up' | 'down') => Promise<void>;
  getDishesByCategory: (categoryId: string) => Dish[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const item = localStorage.getItem('userInfo');
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  });

  const signIn = (userData: UserInfo) => { setUserInfo(userData); localStorage.setItem('userInfo', JSON.stringify(userData)); };
  const signOut = () => { setUserInfo(null); localStorage.removeItem('userInfo'); };

  const [branding, setBranding] = useState<Branding | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brandingRes, branchesRes, categoriesRes, dishesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/branding`),
          fetch(`${API_BASE_URL}/branches`),
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/dishes`),
        ]);
        setBranding(await brandingRes.json());
        setBranches(await branchesRes.json());
        setCategories((await categoriesRes.json()).sort((a, b) => a.sortOrder - b.sortOrder));
        setDishes(await dishesRes.json());
      } catch (error) { console.error("Failed to fetch initial data:", error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    return response.json();
  };

  const updateBranding = async (settings: Branding) => {
    const updatedBranding = await apiRequest(`${API_BASE_URL}/branding`, { method: 'PUT', body: JSON.stringify(settings) });
    setBranding(updatedBranding);
  };

  const addBranch = async (branchData: Omit<Branch, 'id'>) => {
    const newBranch = await apiRequest(`${API_BASE_URL}/branches`, { method: 'POST', body: JSON.stringify(branchData) });
    setBranches(prev => [...prev, newBranch]);
  };

  const updateBranch = async (id: string, data: Branch) => {
    const updatedBranch = await apiRequest(`${API_BASE_URL}/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setBranches(prev => prev.map(b => b.id === id ? updatedBranch : b));
  };

  const deleteBranch = async (id: string) => {
    await apiRequest(`${API_BASE_URL}/branches/${id}`, { method: 'DELETE' });
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const addCategory = async (name: string, viewType: CategoryViewType = 'grid') => {
    const newCatData = { name, viewType, sortOrder: (categories.length > 0 ? Math.max(...categories.map(c => c.sortOrder)) : 0) + 1 };
    const newCat = await apiRequest(`${API_BASE_URL}/categories`, { method: 'POST', body: JSON.stringify(newCatData) });
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = async (id: string, data: Category) => {
    const updatedCategory = await apiRequest(`${API_BASE_URL}/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Kategoriyani o'chirsangiz, unga tegishli taomlar ham o'chadi. Davom etasizmi?")) return;
    const dishesToDelete = dishes.filter(d => d.categoryId === id);
    const deleteDishPromises = dishesToDelete.map(d => apiRequest(`${API_BASE_URL}/dishes/${d.id}`, { method: 'DELETE' }));
    const deleteCategoryPromise = apiRequest(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
    await Promise.all([...deleteDishPromises, deleteCategoryPromise]);
    setCategories(prev => prev.filter(c => c.id !== id));
    setDishes(prev => prev.filter(d => d.categoryId !== id));
  };

  const reorderCategories = async (reorderedCategories: Category[]) => {
    // Optimistic update
    const originalCategories = [...categories];
    setCategories(reorderedCategories);

    try {
      const updatePromises = reorderedCategories.map((cat, index) => 
        apiRequest(`${API_BASE_URL}/categories/${cat.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: index }),
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      // Rollback on error
      setCategories(originalCategories);
      console.error("Failed to reorder categories:", error);
      throw error; // Re-throw to notify the component
    }
  };

  const addDish = async (dishData: Omit<Dish, 'id'>) => {
    const currentCategoryDishes = dishes.filter(d => d.categoryId === dishData.categoryId);
    const maxSort = currentCategoryDishes.reduce((max, d) => Math.max(max, d.sortOrder), 0);
    const newDishData = { ...dishData, sortOrder: maxSort + 1 };
    const newDish = await apiRequest(`${API_BASE_URL}/dishes`, { method: 'POST', body: JSON.stringify(newDishData) });
    setDishes(prev => [...prev, newDish]);
  };

  const updateDish = async (id: string, data: Dish) => {
    const updatedDish = await apiRequest(`${API_BASE_URL}/dishes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setDishes(prev => prev.map(d => d.id === id ? updatedDish : d));
  };

  const deleteDish = async (id: string) => {
    if (!window.confirm("Bu taomni o'chirishga aminmisiz?")) return;
    await apiRequest(`${API_BASE_URL}/dishes/${id}`, { method: 'DELETE' });
    setDishes(prev => prev.filter(d => d.id !== id));
  };
  
  const reorderDishes = async (updatedDishes: Dish[]) => {
    const updatePromises = updatedDishes.map(dish => apiRequest(`${API_BASE_URL}/dishes/${dish.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: dish.sortOrder }) }));
    await Promise.all(updatePromises);
    const updatesMap = new Map(updatedDishes.map(d => [d.id, d]));
    setDishes(prev => prev.map(d => updatesMap.has(d.id) ? { ...d, sortOrder: updatesMap.get(d.id)!.sortOrder } : d));
  };

  const moveDish = async (id: string, direction: 'up' | 'down') => {
    const targetDish = dishes.find(d => d.id === id);
    if (!targetDish) return;
    const sameCatDishes = dishes.filter(d => d.categoryId === targetDish.categoryId).sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sameCatDishes.findIndex(d => d.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sameCatDishes.length) return;
    const adjacentDish = sameCatDishes[targetIndex];
    await Promise.all([
      apiRequest(`${API_BASE_URL}/dishes/${targetDish.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: adjacentDish.sortOrder }) }),
      apiRequest(`${API_BASE_URL}/dishes/${adjacentDish.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: targetDish.sortOrder }) })
    ]);
    const updatedDishes = await apiRequest(`${API_BASE_URL}/dishes`);
    setDishes(updatedDishes);
  };

  const getDishesByCategory = (categoryId: string) => {
    return dishes.filter(d => d.categoryId === categoryId && d.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const value = { loading, userInfo, signIn, signOut, branding, updateBranding, branches, addBranch, updateBranch, deleteBranch, categories, addCategory, updateCategory, deleteCategory, reorderCategories, dishes, addDish, updateDish, deleteDish, reorderDishes, moveDish, getDishesByCategory };

  return <StoreContext.Provider value={value as StoreContextType}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
