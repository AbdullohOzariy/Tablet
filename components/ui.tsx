import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', icon?: any }> = 
  ({ children, className = '', variant = 'primary', icon: Icon, ...props }) => {
  
  const baseStyle = "flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: any }> = ({ label, icon: Icon, className = '', ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}
    <div className="relative group w-full">
      {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"><Icon size={18} /></div>}
      <input 
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 ${className}`}
        {...props}
      />
    </div>
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}
    <textarea 
      className={`w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 resize-none ${className}`}
      {...props}
    />
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-slideIn relative flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur z-10">
          <h2 className="text-2xl font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-slideIn text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-8">{message}</p>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Ha, o'chirilsin
          </Button>
        </div>
      </div>
    </div>
  );
};