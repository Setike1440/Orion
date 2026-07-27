import React, { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SiteSettingsProvider, useSiteSettings } from './contexts/SiteSettingsContext';
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
import { SuggestGame } from './pages/SuggestGame';
import { TermsOfUse, SecurityPage, LifetimeWarrantyPage, SafePaymentPage } from './pages/SupportPages';
import { AdminRoutes } from './pages/admin/AdminRoutes';
import { AuthModal } from './components/AuthModal';
import { ScrollToTop } from './components/ScrollToTop';
import { AnnouncementBar } from './components/AnnouncementBar';
import { MaintenanceGuard } from './components/MaintenanceGuard';

const RouteTracker = () => {
  const location = useLocation();
  const { trackPageView } = useSiteSettings();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};

const Layout = () => {
  return (
    <MaintenanceGuard>
      <RouteTracker />
      <div className="flex flex-col min-h-screen bg-[#000000] text-[#e5e7eb]">
        <AnnouncementBar />
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <AuthModal />
      </div>
    </MaintenanceGuard>
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
        <SiteSettingsProvider>
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
              <Route path="sugerir-jogo" element={<SuggestGame />} />
              <Route path="pedir-jogo" element={<SuggestGame />} />
              <Route path="termos-de-uso" element={<TermsOfUse />} />
              <Route path="seguranca" element={<SecurityPage />} />
              <Route path="garantia-vitalicia" element={<LifetimeWarrantyPage />} />
              <Route path="pagamento-seguro" element={<SafePaymentPage />} />
            </Route>
            <Route path="/painel/*" element={<AdminRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </SiteSettingsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

