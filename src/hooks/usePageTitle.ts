import { useEffect } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export function usePageTitle(pageTitle?: string) {
  const { settings } = useSiteSettings();
  const rawSiteName = settings?.site_name || 'Sirius';
  const siteName = rawSiteName.includes('Orion') ? 'Sirius' : rawSiteName;

  useEffect(() => {
    if (pageTitle && pageTitle !== siteName && pageTitle !== 'Orion' && pageTitle !== 'Sirius') {
      document.title = `${pageTitle} - ${siteName}`;
    } else {
      document.title = siteName;
    }
  }, [pageTitle, siteName]);
}

