import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { ChefHat, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../../components/ui'; // Assuming you have a UI component library

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { dispatch } = useContext(Store);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have an API call here
    if (username === 'admin' && password === 'admin') {
      const userInfo = { name: 'Admin', username: 'admin' };
      dispatch({ type: 'USER_SIGNIN', payload: userInfo });
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      showToast('Xush kelibsiz, Boss!', 'success');
      navigate('/admin');
    } else {
      showToast('Login yoki parol xato', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl flex items-center justify-center shadow-xl shadow-gray-900/20 mx-auto mb-6 transform rotate-3">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Panel</h2>
          <p className="text-gray-500 mt-2 font-medium">Tizimni boshqarish uchun kiring</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Login" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="text-lg"
          />
          <Input 
            type="password" 
            label="Parol" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="text-lg"
          />
          
          <div className="pt-2">
            <Button type="submit" className="w-full py-4 text-lg">
              Tizimga Kirish
            </Button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
           <button type="button" onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors">
              <ArrowLeft size={14} /> Ortga qaytish
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;