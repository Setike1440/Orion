import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { DEFAULT_CATEGORIES } from '../../data/categoriesData';
import { usePageTitle } from '../../hooks/usePageTitle';
import { AdminToast, ConfirmModal } from '../../components/admin/AdminModal';
import { 
  Images, 
  Upload, 
  Link as LinkIcon, 
  RotateCw, 
  Save, 
  Search, 
  CheckCircle, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface CategoryItemState {
  id: string;
  name: string;
  slug: string;
  currentCover: string;
  defaultCover: string;
  urlInput: string;
  isCustom: boolean;
  isSaving?: boolean;
}

export const CategoryCoversManager: React.FC = () => {
  usePageTitle('Capas das Categorias');
  const { categoryCovers, updateCategoryCover, updateAllCategoryCovers } = useSiteSettings();
  const [categories, setCategories] = useState<CategoryItemState[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [savingAll, setSavingAll] = useState(false);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadCategories();
  }, [categoryCovers]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data: dbCats } = await supabase.from('categories').select('*');
      const dbCategories = dbCats || [];

      // Merge DB categories and DEFAULT_CATEGORIES
      const mergedList: any[] = [...dbCategories];
      DEFAULT_CATEGORIES.forEach(defCat => {
        if (!mergedList.some(c => (c.slug && c.slug.toLowerCase() === defCat.slug.toLowerCase()) || (c.name && c.name.toLowerCase() === defCat.name.toLowerCase()))) {
          mergedList.push(defCat);
        }
      });

      const customMap = categoryCovers || JSON.parse(localStorage.getItem('custom_category_covers') || '{}');

      const items: CategoryItemState[] = mergedList.map(c => {
        const slug = c.slug || c.id;
        const defaultImg = DEFAULT_CATEGORIES.find(d => d.slug === slug || d.id === slug)?.image_url || c.image_url || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400';
        const customImg = customMap[slug] || customMap[c.id] || customMap[c.name?.toLowerCase()];
        const activeImg = customImg || c.image_url || defaultImg;

        return {
          id: c.id || slug,
          name: c.name,
          slug: slug,
          currentCover: activeImg,
          defaultCover: defaultImg,
          urlInput: activeImg,
          isCustom: !!customImg && customImg !== defaultImg
        };
      });

      setCategories(items);
    } catch (e) {
      console.error('Error loading category covers:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleUrlChange = (slug: string, val: string) => {
    setCategories(prev => prev.map(item => {
      if (item.slug === slug) {
        return {
          ...item,
          urlInput: val,
          currentCover: val.trim() || item.defaultCover
        };
      }
      return item;
    }));
  };

  const handleFileUpload = (slug: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('A imagem é muito grande. Escolha uma imagem com menos de 8MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCategories(prev => prev.map(item => {
          if (item.slug === slug) {
            return {
              ...item,
              urlInput: dataUrl,
              currentCover: dataUrl,
              isCustom: true
            };
          }
          return item;
        }));
        showToast(`Imagem carregada para ${slug}. Clique em "Salvar" para confirmar.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSingle = async (slug: string) => {
    const item = categories.find(c => c.slug === slug);
    if (!item) return;

    setCategories(prev => prev.map(c => c.slug === slug ? { ...c, isSaving: true } : c));
    try {
      await updateCategoryCover(slug, item.urlInput);
      setCategories(prev => prev.map(c => c.slug === slug ? { ...c, isSaving: false, isCustom: item.urlInput !== c.defaultCover } : c));
      showToast(`Capa da categoria "${item.name}" atualizada com sucesso!`);
    } catch (e) {
      showToast(`Erro ao salvar capa da categoria "${item.name}".`, 'error');
      setCategories(prev => prev.map(c => c.slug === slug ? { ...c, isSaving: false } : c));
    }
  };

  const handleResetSingle = async (slug: string) => {
    const item = categories.find(c => c.slug === slug);
    if (!item) return;

    setConfirmModalState({
      isOpen: true,
      title: 'Restaurar Imagem Padrão',
      message: `Tem certeza que deseja restaurar a imagem original da categoria "${item.name}"?`,
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        try {
          await updateCategoryCover(slug, item.defaultCover);
          setCategories(prev => prev.map(c => c.slug === slug ? {
            ...c,
            urlInput: item.defaultCover,
            currentCover: item.defaultCover,
            isCustom: false
          } : c));
          showToast(`Capa da categoria "${item.name}" restaurada para o padrão!`);
        } catch (e) {
          showToast('Erro ao restaurar imagem padrão.', 'error');
        }
      }
    });
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      const coversPayload: Record<string, string> = {};
      categories.forEach(c => {
        coversPayload[c.slug] = c.urlInput;
      });

      await updateAllCategoryCovers(coversPayload);
      setCategories(prev => prev.map(c => ({
        ...c,
        isCustom: c.urlInput !== c.defaultCover
      })));
      showToast('Todas as capas de categorias foram salvas com sucesso!');
    } catch (e) {
      showToast('Erro ao salvar capas de categorias.', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  const handleResetAll = async () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Restaurar Todas as Capas Padrão',
      message: 'Tem certeza que deseja restaurar as capas originais de TODAS as categorias?',
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        setSavingAll(true);
        try {
          const defaultPayload: Record<string, string> = {};
          categories.forEach(c => {
            defaultPayload[c.slug] = c.defaultCover;
          });

          await updateAllCategoryCovers(defaultPayload);
          setCategories(prev => prev.map(c => ({
            ...c,
            urlInput: c.defaultCover,
            currentCover: c.defaultCover,
            isCustom: false
          })));
          showToast('Todas as categorias foram restauradas para suas capas originais!');
        } catch (e) {
          showToast('Erro ao restaurar capas padrão.', 'error');
        } finally {
          setSavingAll(false);
        }
      }
    });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      <AdminToast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header Banner */}
      <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF0000]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center text-[#FF0000]">
                <Images className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Capas das Categorias</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Personalize as imagens de capa das categorias do site. Faça upload de arquivos diretamente do seu computador ou cole o link de uma imagem externa. As alterações são aplicadas instantaneamente para todos os usuários no banco de dados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetAll}
              disabled={savingAll || loading}
              className="px-4 py-2.5 rounded-xl border border-[#1f212a] bg-[#17181f] text-gray-300 hover:text-white hover:bg-[#1f212a] transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCw className="w-4 h-4" />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={savingAll || loading}
              className="px-5 py-2.5 rounded-xl bg-[#FF0000] hover:bg-[#e60000] text-white transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF0000]/20 disabled:opacity-50"
            >
              {savingAll ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Todas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar categoria por nome ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121318] border border-[#1f212a] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF0000] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-gray-400 font-medium">
          Exibindo <span className="text-white font-bold">{filteredCategories.length}</span> de <span className="text-white font-bold">{categories.length}</span> categorias
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#121318] border border-[#1f212a] rounded-2xl p-5 animate-pulse space-y-4">
              <div className="h-5 bg-white/5 rounded-lg w-1/2" />
              <div className="h-44 bg-white/5 rounded-xl w-full" />
              <div className="h-10 bg-white/5 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <ImageIcon className="w-10 h-10 text-gray-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">Nenhuma categoria encontrada</h3>
          <p className="text-xs text-gray-500 mt-1">Tente buscar por outro termo ou limpe o filtro de pesquisa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((item) => (
            <div 
              key={item.slug}
              className="bg-[#121318] border border-[#1f212a] hover:border-[#2a2d3a] rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-md group"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{item.name}</span>
                    </h3>
                    <span className="text-[10px] text-gray-500 font-mono">/categoria/{item.slug}</span>
                  </div>
                  {item.isCustom ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Personalizada
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                      Padrão
                    </span>
                  )}
                </div>

                {/* Cover Image Preview */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#0a0b0e] border border-[#1f212a] mb-4 group/img">
                  <img 
                    src={item.currentCover} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = item.defaultCover;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white drop-shadow">
                    <span className="truncate max-w-[180px] text-gray-300">{item.name}</span>
                    <a 
                      href={item.currentCover} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#FF0000] hover:underline text-[10px] bg-black/60 px-2 py-0.5 rounded"
                    >
                      Abrir link ↗
                    </a>
                  </div>
                </div>

                {/* Upload & Link Inputs */}
                <div className="space-y-3">
                  {/* Option 1: File Upload */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                      1. Upload de Imagem (do computador):
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-upload-${item.slug}`}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(item.slug, e)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`file-upload-${item.slug}`}
                        className="w-full py-2 px-3 bg-[#17181f] hover:bg-[#1e2029] border border-[#1f212a] hover:border-[#FF0000]/40 rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all border-dashed"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#FF0000]" />
                        <span>Escolher arquivo de imagem</span>
                      </label>
                    </div>
                  </div>

                  {/* Option 2: Image URL */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                      2. Ou insira a URL da Imagem:
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={item.urlInput}
                        onChange={(e) => handleUrlChange(item.slug, e.target.value)}
                        placeholder="https://exemplo.com/imagem.png"
                        className="w-full pl-8 pr-3 py-2 bg-[#17181f] border border-[#1f212a] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF0000] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#1f212a]">
                <button
                  type="button"
                  onClick={() => handleResetSingle(item.slug)}
                  disabled={item.isSaving}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Restaurar Imagem Padrão"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveSingle(item.slug)}
                  disabled={item.isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF0000] hover:bg-[#e60000] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {item.isSaving ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
