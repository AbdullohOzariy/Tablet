import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Tablet, ShieldCheck, ChefHat, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const { branding, loading } = useStore();

  if (loading || !branding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { restaurantName, slogan, primaryColor, backgroundColor, textColor, mutedColor } = branding;

  return (
    <div style={{ backgroundColor }} className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100/50 to-transparent -z-10" style={{ '--tw-gradient-from': `${primaryColor}1A` } as React.CSSProperties} />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl -z-10" style={{ backgroundColor: `${primaryColor}33` }} />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white to-transparent -z-10" />

      <div className="text-center mb-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-gray-100">
          <ChefHat className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4" style={{ color: textColor }}>
          {restaurantName.split(' ')[0]}<span style={{ color: primaryColor }}>{restaurantName.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-xl leading-relaxed" style={{ color: mutedColor }}>
          {slogan || "Restoran biznesingiz uchun zamonaviy raqamli menyu va boshqaruv tizimi."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        <Link to="/customer" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden" style={{ '--tw-shadow-color': `${primaryColor}33`, '--tw-border-color': `${primaryColor}33` } as React.CSSProperties}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" style={{ backgroundColor: `${primaryColor}1A` }} />
           
           <div className="relative z-10 flex flex-col h-full">
             <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}4D, 0 4px 6px -4px ${primaryColor}4D` }}>
               <Tablet size={28} />
             </div>
             <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>Mijoz rejimi</h2>
             <p className="mb-8 flex-1" style={{ color: mutedColor }}>Planshet orqali menyuni ko'rish uchun maxsus interfeys.</p>
             
             <div className="flex items-center font-semibold group-hover:translate-x-2 transition-transform" style={{ color: primaryColor }}>
               Kirish <ArrowRight className="ml-2 w-4 h-4" />
             </div>
           </div>
        </Link>

        <Link to="/admin" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
           
           <div className="relative z-10 flex flex-col h-full">
             <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300">
               <ShieldCheck size={28} />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Admin Panel</h2>
             <p className="text-gray-500 mb-8 flex-1">Filiallar, taomlar va narxlarni boshqarish markazi.</p>
             
             <div className="flex items-center font-semibold text-gray-900 group-hover:translate-x-2 transition-transform">
               Kirish <ArrowRight className="ml-2 w-4 h-4" />
             </div>
           </div>
        </Link>
      </div>

      <footer className="absolute bottom-6 text-sm font-medium" style={{ color: mutedColor }}>
        &copy; {new Date().getFullYear()} {restaurantName}
      </footer>
    </div>
  );
};

export default Landing;