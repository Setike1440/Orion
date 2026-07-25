import React from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { Sparkles, Bell, AlertTriangle, Info, Megaphone, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnnouncementBar = () => {
  const { announcement, updateAnnouncement } = useSiteSettings();
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

  return (
    <div className={`w-full py-2 px-4 border-b text-xs font-semibold flex items-center justify-between gap-3 relative z-50 transition-all ${getColorClasses()}`}>
      <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 text-center">
        {renderIcon()}
        <span className="truncate">{announcement.text}</span>
        {announcement.link_url && (
          <Link 
            to={announcement.link_url} 
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity ml-1"
          >
            <span>Saber mais</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
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
