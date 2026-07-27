import React from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Bell, AlertTriangle, Info, Megaphone, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnnouncementBar = () => {
  const { announcement } = useSiteSettings();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = React.useState(false);

  if (!announcement.enabled || dismissed) return null;

  const renderIcon = () => {
    switch (announcement.icon) {
      case 'Bell': return <Bell className="w-3.5 h-3.5 shrink-0" />;
      case 'AlertTriangle': return <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
      case 'Info': return <Info className="w-3.5 h-3.5 shrink-0" />;
      case 'Megaphone': return <Megaphone className="w-3.5 h-3.5 shrink-0" />;
      case 'Sparkles': default: return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  const getColorClasses = () => {
    switch (announcement.color) {
      case 'amber':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'emerald':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
      case 'blue':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
      case 'purple':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-300';
      case 'white':
        return 'bg-white/10 border-white/30 text-white shadow-sm';
      case 'red': default:
        return 'bg-[#FF0000]/15 border-[#FF0000]/30 text-[#FF0000]';
    }
  };

  const getLinkColorClasses = () => {
    switch (announcement.color) {
      case 'amber':
        return 'text-amber-300 hover:text-amber-100';
      case 'emerald':
        return 'text-emerald-300 hover:text-emerald-100';
      case 'blue':
        return 'text-blue-300 hover:text-blue-100';
      case 'purple':
        return 'text-purple-300 hover:text-purple-100';
      case 'white':
        return 'text-white hover:text-gray-200';
      case 'red': default:
        return 'text-[#FF0000] hover:text-[#ff6666]';
    }
  };

  return (
    <div className={`w-full py-2 px-4 border-b text-xs font-semibold flex items-center justify-between gap-3 relative z-50 transition-all ${getColorClasses()}`}>
      <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 text-center">
        {renderIcon()}
        <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <span>{announcement.text}</span>
          <Link 
            to={announcement.link_url && announcement.link_url !== '/sugerir-jogo' ? announcement.link_url : "/como-funciona"} 
            className={`inline-flex items-center gap-1 underline underline-offset-2 font-bold transition-colors ${getLinkColorClasses()}`}
          >
            <span>{t('learn_more') || 'Saber mais'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <button 
        onClick={() => setDismissed(true)} 
        className="opacity-70 hover:opacity-100 p-1 rounded-full transition-opacity cursor-pointer shrink-0"
        title="Fechar aviso"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
