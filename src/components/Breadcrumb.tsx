import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { t } = useLanguage();

  // Deduplicate if items starts with 'Início' or 'Home' or path='/'
  const filteredItems = items.filter((item, idx) => {
    if (idx === 0) {
      const lower = item.label.toLowerCase();
      if (lower === 'início' || lower === 'inicio' || lower === 'home' || item.path === '/') {
        return false;
      }
    }
    return true;
  });

  return (
    <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 flex-wrap bg-[#15161a] border border-[#25262c] px-4 py-2.5 rounded-xl shadow-sm">
      <Link to="/" className="text-gray-400 hover:text-white transition-colors font-medium">
        {t('home') || 'Início'}
      </Link>
      {filteredItems.map((item, index) => {
        const isLast = index === filteredItems.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            {item.path && !isLast ? (
              <Link 
                to={item.path} 
                className="text-gray-300 hover:text-white transition-colors font-medium truncate max-w-[150px] sm:max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-semibold truncate max-w-[180px] sm:max-w-[260px] ${isLast ? 'text-white' : 'text-gray-300'}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

