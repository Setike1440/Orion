import { useEffect } from 'react';

export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    if (pageTitle) {
      document.title = `Orion / ${pageTitle}`;
    } else {
      document.title = 'Orion / Biblioteca Steam';
    }
  }, [pageTitle]);
}
