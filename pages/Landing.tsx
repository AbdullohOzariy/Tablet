import React from 'react';
import { Link } from 'react-router-dom';
import { Tablet, ShieldCheck, ChefHat, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100/50 to-transparent -z-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white to-transparent -z-10" />

      <div className="text-center mb-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-gray-100">
          <ChefHat className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
          Tablet<span className="text-orange-500">Menu</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed">
          Restoran biznesingiz uchun zamonaviy raqamli menyu va boshqaruv tizimi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        <Link to="/customer" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
           
           <div className="relative z-10 flex flex-col h-full">
             <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
               <Tablet size={28} />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Mijoz rejimi</h2>
             <p className="text-gray-500 mb-8 flex-1">Planshet orqali menyuni ko'rish uchun maxsus interfeys.</p>
             
             <div className="flex items-center font-semibold text-orange-600 group-hover:translate-x-2 transition-transform">
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

      <footer className="absolute bottom-6 text-gray-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} TabletMenu System
      </footer>
    </div>
  );
};

export default Landing;