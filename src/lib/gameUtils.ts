export const sortGamesAlphanumeric = <T extends { title?: string }>(gamesList: T[]): T[] => {
  return [...gamesList].sort((a, b) => {
    const titleA = (a.title || '').trim();
    const titleB = (b.title || '').trim();
    
    if (!titleA) return 1;
    if (!titleB) return -1;

    const isNumA = /^\d/.test(titleA);
    const isNumB = /^\d/.test(titleB);

    if (isNumA && !isNumB) return -1;
    if (!isNumA && isNumB) return 1;
    
    return titleA.localeCompare(titleB, 'pt-BR', { numeric: true, sensitivity: 'base' });
  });
};
