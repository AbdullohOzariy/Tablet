import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Branch, Dish } from '../types';
import { MapPin, Phone, Info, ChevronRight, ArrowLeft, Home, Clock, Utensils, Sparkles, ServerCrash } from 'lucide-react';

// --- Helper Components ---
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

// ... (BranchSelector and MenuViewer components remain the same)

const CustomerApp: React.FC = () => {
  const { loading, error } = useStore();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (selectedBranch) {
    return <MenuViewer branch={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  }

  return <BranchSelector onSelect={setSelectedBranch} />;
};

export default CustomerApp;