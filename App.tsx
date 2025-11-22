import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import CustomerApp from './pages/CustomerApp';
import AdminApp from './pages/AdminApp';
import Landing from './pages/Landing';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/customer" element={<CustomerApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
};

export default App;