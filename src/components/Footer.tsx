import React from 'react';
import { Gamepad2, Github, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-[#0d0e12] border-t border-[#1f212a] pt-12 pb-8 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img src="https://i.imgur.com/0a36M0M.png" alt="Orion" className="h-5 sm:h-6 w-auto object-contain" />
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-[#1a1b24] border border-[#20222c] hover:bg-[#222432] hover:border-[#383b4a] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#1a1b24] border border-[#20222c] hover:bg-[#222432] hover:border-[#383b4a] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#1a1b24] border border-[#20222c] hover:bg-[#222432] hover:border-[#383b4a] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"><Github className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('useful_links')}</h3>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">{t('home')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('support')}</h3>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">{t('terms')}</Link></li>
              <li><Link to="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">{t('security')}</Link></li>
              <li><Link to="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">{t('lifetime_warranty')}</Link></li>
              <li><Link to="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">{t('secure_payment')}</Link></li>
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
            &copy; {new Date().getFullYear()} Orion Steam Library. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
