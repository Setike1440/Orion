import React, { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { GameDetails } from './pages/GameDetails';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';
import { CategoryPage } from './pages/CategoryPage';
import { HowItWorks } from './pages/HowItWorks';
import { CanIRunIt } from './pages/CanIRunIt';
import { AdminRoutes } from './pages/admin/AdminRoutes';
import { AuthModal } from './components/AuthModal';
import { ScrollToTop } from './components/ScrollToTop';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0b0e] text-[#e5e7eb]">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="cadastro" element={<Register />} />
            <Route path="register" element={<Register />} />
            <Route path="jogo/:id" element={<GameDetails />} />
            <Route path="game/:id" element={<GameDetails />} />
            <Route path="categoria/:slug" element={<CategoryPage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="favoritos" element={<Favorites />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="settings" element={<Settings />} />
            <Route path="como-funciona" element={<HowItWorks />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="requisitos-do-pc" element={<CanIRunIt />} />
            <Route path="can-i-run" element={<CanIRunIt />} />
          </Route>
          <Route path="/painel/*" element={<AdminRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}
