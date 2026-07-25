import { useEffect } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export function usePageTitle(pageTitle?: string) {
  const { settings } = useSiteSettings();
  const rawSiteName = settings?.site_name || 'Sirius';
  const siteName = (rawSiteName.toLowerCase().includes('orion') || rawSiteName.includes('Contas Steam')) ? 'Sirius' : rawSiteName;

  useEffect(() => {
    let cleanTitle = pageTitle?.trim();
    if (cleanTitle?.toLowerCase().includes('orion')) {
      cleanTitle = cleanTitle.replace(/orion/gi, 'Sirius');
    }

    if (cleanTitle && cleanTitle !== siteName && cleanTitle !== 'Sirius' && cleanTitle !== 'Orion' && cleanTitle !== 'Home') {
      document.title = `${siteName} / ${cleanTitle}`;
    } else {
      document.title = siteName;
    }
  }, [pageTitle, siteName]);
}

