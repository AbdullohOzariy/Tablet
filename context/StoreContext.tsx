import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, Category, Dish, Branding, UserInfo, CategoryViewType } from '../types';

const API_BASE_URL = '/api';

// ... (StoreContextType interface remains the same)

const StoreContext = createContext<any>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => { /* ... */ });
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

  // --- Optimistic Update Functions ---

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

  // ... (other functions like addBranch, updateCategory, etc. will follow the same optimistic pattern)

  const value = { /* ... all functions and state ... */ };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
