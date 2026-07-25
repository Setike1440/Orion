import { useEffect } from 'react';

export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    if (pageTitle && pageTitle !== 'Orion') {
      document.title = `${pageTitle} - Orion`;
    } else {
      document.title = 'Orion';
    }
  }, [pageTitle]);
}

