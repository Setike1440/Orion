export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'terror',
    name: 'Terror',
    slug: 'terror',
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'mundo-aberto',
    name: 'Mundo Aberto',
    slug: 'mundo-aberto',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'corrida',
    name: 'Corrida',
    slug: 'corrida',
    image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'acao',
    name: 'Ação',
    slug: 'acao',
    image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'rpg',
    name: 'RPG',
    slug: 'rpg',
    image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'esportes',
    name: 'Esportes',
    slug: 'esportes',
    image_url: 'https://images.unsplash.com/photo-1579952318893-2713f64359ee?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'estrategia',
    name: 'Estratégia',
    slug: 'estrategia',
    image_url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'aventura',
    name: 'Aventura',
    slug: 'aventura',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'sobrevivencia',
    name: 'Sobrevivência',
    slug: 'sobrevivencia',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'simulacao',
    name: 'Simulação',
    slug: 'simulacao',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'luta',
    name: 'Luta',
    slug: 'luta',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'anime',
    name: 'Anime',
    slug: 'anime',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600'
  }
];
