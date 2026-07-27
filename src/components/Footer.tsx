import React from 'react';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export const Footer = () => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  
  return (
    <footer className="bg-[#0d0e12] border-t border-[#1f212a] pt-12 pb-8 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img 
                src={settings.logo_url && settings.logo_url !== 'https://i.ibb.co/zW1gzQRR/Logo.png' ? settings.logo_url : "https://i.ibb.co/kspXCrY6/Retangular.png"} 
                alt={settings.site_name || "Sirius"} 
                className="h-5 sm:h-6 w-auto object-contain" 
              />
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
              {t('footer_desc')}
            </p>
            {/* Social Icons: TikTok, Instagram, WhatsApp, Email */}
            <div className="flex gap-2.5">
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="TikTok" 
                className="w-8 h-8 rounded-lg bg-[#1a1b24] border border-[#20222c] hover:bg-[#222432] hover:border-[#383b4a] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.91 1.63V7.55a4.82 4.82 0 0 1-1-.86z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Instagram" 
                className="w-8 h-8 rounded-lg bg-[#1a1b24] border border-[#20222c] hover:bg-[#222432] hover:border-[#383b4a] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="WhatsApp" 
                className="w-8 h-8 rounded-lg bg-[#1a1b24] border border-[#20222c] hover:bg-[#222432] hover:border-[#383b4a] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a 
                href="mailto:suporte@sirius.com" 
                title="E-mail" 
                className="w-8 h-8 rounded-lg bg-[#1a1b24] border border-[#20222c] hover:bg-[#222432] hover:border-[#383b4a] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Úteis - All public pages except dashboard */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('useful_links')}</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">{t('home') || 'Início'}</Link></li>
              <li><Link to="/favoritos" className="text-gray-400 hover:text-white transition-colors">{t('favorites_title') || 'Meus Favoritos'}</Link></li>
              <li><Link to="/como-funciona" className="text-gray-400 hover:text-white transition-colors">{t('how_it_works') || 'Como Funciona'}</Link></li>
              <li><Link to="/requisitos-do-pc" className="text-gray-400 hover:text-white transition-colors">{t('can_i_run_it') || 'Requisitos do PC'}</Link></li>
              <li><Link to="/sugerir-jogo" className="text-gray-400 hover:text-white transition-colors">{t('suggest_game') || 'Sugerir Jogo'}</Link></li>
              <li><Link to="/configuracoes" className="text-gray-400 hover:text-white transition-colors">{t('settings') || 'Configurações'}</Link></li>
            </ul>
          </div>

          {/* Suporte - Dedicated support pages */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('support')}</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/termos-de-uso" className="text-gray-400 hover:text-white transition-colors">{t('terms') || 'Termos de Uso'}</Link></li>
              <li><Link to="/seguranca" className="text-gray-400 hover:text-white transition-colors">{t('security') || 'Segurança'}</Link></li>
              <li><Link to="/garantia-vitalicia" className="text-gray-400 hover:text-white transition-colors">{t('lifetime_warranty') || 'Garantia Vitalícia'}</Link></li>
              <li><Link to="/pagamento-seguro" className="text-gray-400 hover:text-white transition-colors">{t('secure_payment') || 'Pagamento Seguro'}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('support_service')}</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 leading-relaxed">
              {t('support_service_desc')}
            </p>
            <button 
              type="button"
              onClick={() => window.open('https://wa.me/', '_blank')}
              className="bg-[#FF0000] border border-[#FF0000] hover:bg-[#e60000] hover:border-[#e60000] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center w-full cursor-pointer shadow-md"
            >
              {t('support_talk')}
            </button>
          </div>

        </div>

        <div className="pt-8 border-t border-[#1f212a] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {settings.site_name || 'Sirius'} Steam Library. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
