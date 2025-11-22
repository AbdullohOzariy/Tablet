import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useContext(Store);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Bu yerda parolni tekshirish logikasi bo'lishi kerak.
    // Hozircha, oddiy tekshiruvdan foydalanamiz.
    if (password === 'admin') {
      dispatch({ type: 'USER_SIGNIN', payload: { name: 'Admin' } });
      localStorage.setItem('userInfo', JSON.stringify({ name: 'Admin' }));
      navigate('/admin');
    } else {
      toast.error('Noto‘g‘ri parol');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Admin Panelga Kirish</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Parol
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Kirish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;