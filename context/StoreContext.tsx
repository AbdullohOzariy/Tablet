import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, Category, Dish, Branding, UserInfo, CategoryViewType } from '../types';

const API_BASE_URL = '/api';

interface StoreContextType {
  loading: boolean;
  error: string | null;
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
  reorderCategories: (categories: Category[]) => Promise<void>;
  dishes: Dish[];
  addDish: (dish: Omit<Dish, 'id'>) => Promise<void>;
  updateDish: (id: string, data: Dish) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
  getDishesByCategory: (categoryId: string) => Dish[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const item = localStorage.getItem('userInfo');
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  });

  const [branding, setBranding] = useState<Branding | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);
      try {
        const [brandingRes, branchesRes, categoriesRes, dishesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/branding`),
          fetch(`${API_BASE_URL}/branches`),
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/dishes`),
        ]);

        if (!brandingRes.ok || !branchesRes.ok || !categoriesRes.ok || !dishesRes.ok) {
            throw new Error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
        }

        setBranding(await brandingRes.json());
        setBranches(await branchesRes.json());
        setCategories((await categoriesRes.json()).sort((a, b) => a.sortOrder - b.sortOrder));
        setDishes(await dishesRes.json());
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Server bilan aloqa yo'q. Iltimos, keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API so'rovi muvaffaqiyatsiz: ${response.status}`);
    }
    return response.json();
  };

  // --- Auth ---
  const signIn = (userData: UserInfo) => { setUserInfo(userData); localStorage.setItem('userInfo', JSON.stringify(userData)); };
  const signOut = () => { setUserInfo(null); localStorage.removeItem('userInfo'); };

  // --- Optimistic Update Functions ---

  const updateBranding = async (settings: Branding) => {
    const originalBranding = branding;
    setBranding(settings);
    try {
      await apiRequest(`${API_BASE_URL}/branding`, { method: 'PUT', body: JSON.stringify(settings) });
    } catch (error) {
      setBranding(originalBranding);
      throw error;
    }
  };

  const addBranch = async (branchData: Omit<Branch, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newBranch = { ...branchData, id: tempId };
    setBranches(prev => [...prev, newBranch]);
    try {
        const savedBranch = await apiRequest(`${API_BASE_URL}/branches`, { method: 'POST', body: JSON.stringify(branchData) });
        setBranches(prev => prev.map(b => b.id === tempId ? savedBranch : b));
    } catch (error) {
        setBranches(prev => prev.filter(b => b.id !== tempId));
        throw error;
    }
  };

  const updateBranch = async (id: string, data: Branch) => {
    const originalBranches = [...branches];
    setBranches(prev => prev.map(b => b.id === id ? data : b));
    try {
      await apiRequest(`${API_BASE_URL}/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (error) {
      setBranches(originalBranches);
      throw error;
    }
  };

  const deleteBranch = async (id: string) => {
    const originalBranches = [...branches];
    setBranches(prev => prev.filter(b => b.id !== id));
    try {
      await apiRequest(`${API_BASE_URL}/branches/${id}`, { method: 'DELETE' });
    } catch (error) {
      setBranches(originalBranches);
      throw error;
    }
  };

  const addCategory = async (name: string, viewType: CategoryViewType) => {
    const tempId = `temp-cat-${Date.now()}`;
    const newCatData = { name, viewType, sortOrder: (categories.length > 0 ? Math.max(...categories.map(c => c.sortOrder)) : 0) + 1 };
    setCategories(prev => [...prev, { ...newCatData, id: tempId }]);
    try {
        const savedCategory = await apiRequest(`${API_BASE_URL}/categories`, { method: 'POST', body: JSON.stringify(newCatData) });
        setCategories(prev => prev.map(c => c.id === tempId ? savedCategory : c));
    } catch (error) {
        setCategories(prev => prev.filter(c => c.id !== tempId));
        throw error;
    }
  };

  const updateCategory = async (id: string, data: Category) => {
    const originalCategories = [...categories];
    setCategories(prev => prev.map(c => c.id === id ? data : c));
    try {
        await apiRequest(`${API_BASE_URL}/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (error) {
        setCategories(originalCategories);
        throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    // This is complex due to dish deletion, so we won't make it optimistic for now.
    if (!window.confirm("Kategoriyani o'chirsangiz, unga tegishli taomlar ham o'chadi. Davom etasizmi?")) return;
    const dishesToDelete = dishes.filter(d => d.categoryId === id);
    const deleteDishPromises = dishesToDelete.map(d => apiRequest(`${API_BASE_URL}/dishes/${d.id}`, { method: 'DELETE' }));
    await Promise.all(deleteDishPromises);
    await apiRequest(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id));
    setDishes(prev => prev.filter(d => d.categoryId !== id));
  };

  const reorderCategories = async (reorderedCategories: Category[]) => {
    const originalCategories = [...categories];
    setCategories(reorderedCategories);
    try {
      const updatePromises = reorderedCategories.map((cat, index) =>
        apiRequest(`${API_BASE_URL}/categories/${cat.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: index }) })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      setCategories(originalCategories);
      throw error;
    }
  };

  const addDish = async (dishData: Omit<Dish, 'id'>) => {
    const tempId = `temp-dish-${Date.now()}`;
    const maxSort = dishes.filter(d => d.categoryId === dishData.categoryId).reduce((max, d) => Math.max(max, d.sortOrder), 0);
    const newDish = { ...dishData, sortOrder: maxSort + 1, id: tempId };
    setDishes(prev => [...prev, newDish]);
    try {
        const savedDish = await apiRequest(`${API_BASE_URL}/dishes`, { method: 'POST', body: JSON.stringify(dishData) });
        setDishes(prev => prev.map(d => d.id === tempId ? savedDish : d));
    } catch (error) {
        setDishes(prev => prev.filter(d => d.id !== tempId));
        throw error;
    }
  };

  const updateDish = async (id: string, data: Dish) => {
    const originalDishes = [...dishes];
    setDishes(prev => prev.map(d => d.id === id ? data : d));
    try {
        await apiRequest(`${API_BASE_URL}/dishes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (error) {
        setDishes(originalDishes);
        throw error;
    }
  };

  const deleteDish = async (id: string) => {
    const originalDishes = [...dishes];
    setDishes(prev => prev.filter(d => d.id !== id));
    try {
        await apiRequest(`${API_BASE_URL}/dishes/${id}`, { method: 'DELETE' });
    } catch (error) {
        setDishes(originalDishes);
        throw error;
    }
  };

  const getDishesByCategory = (categoryId: string) => {
    return dishes.filter(d => d.categoryId === categoryId && d.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const value = { loading, error, userInfo, signIn, signOut, branding, updateBranding, branches, addBranch, updateBranch, deleteBranch, categories, addCategory, updateCategory, deleteCategory, reorderCategories, dishes, addDish, updateDish, deleteDish, getDishesByCategory };

  return <StoreContext.Provider value={value as StoreContextType}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
