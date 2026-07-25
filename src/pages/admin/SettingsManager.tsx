import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Settings, Save, Globe, Share2, Palette, Search, CheckCircle2 } from 'lucide-react';

export const SettingsManager = () => {
  const { settings, updateSettings } = useSiteSettings();
  const [formData, setFormData] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#FF0000]" />
            <span>Configurações Gerais do Site</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Altere branding, logomarca, redes sociais, SEO e preferências visuais com salvamento em tempo real.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configurações salvas e aplicadas em todo o site com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Identifiers */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#1f212a]">
            <Globe className="w-4 h-4 text-[#FF0000]" />
            <span>Identidade do Site</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nome Oficial do Site</label>
              <input
                type="text"
                value={formData.site_name}
                onChange={e => setFormData({ ...formData, site_name: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">E-mail de Suporte</label>
              <input
                type="email"
                value={formData.support_email}
                onChange={e => setFormData({ ...formData, support_email: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">URL da Logomarca (PNG/SVG)</label>
              <input
                type="text"
                value={formData.logo_url}
                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">URL do Favicon (.ico / .png)</label>
              <input
                type="text"
                value={formData.favicon_url}
                onChange={e => setFormData({ ...formData, favicon_url: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>
          </div>
        </div>

        {/* Social Networks */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#1f212a]">
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>Redes Sociais & Comunidade</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Servidor Discord</label>
              <input
                type="text"
                value={formData.social_discord}
                onChange={e => setFormData({ ...formData, social_discord: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Instagram</label>
              <input
                type="text"
                value={formData.social_instagram}
                onChange={e => setFormData({ ...formData, social_instagram: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Twitter / X</label>
              <input
                type="text"
                value={formData.social_twitter}
                onChange={e => setFormData({ ...formData, social_twitter: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Canal no YouTube</label>
              <input
                type="text"
                value={formData.social_youtube}
                onChange={e => setFormData({ ...formData, social_youtube: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>
          </div>
        </div>

        {/* SEO & Meta Tags */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#1f212a]">
            <Search className="w-4 h-4 text-amber-400" />
            <span>SEO & Otimização para Buscadores</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Título Padrão (Meta Title)</label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Descrição Padrão (Meta Description)</label>
              <textarea
                rows={2}
                value={formData.seo_description}
                onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                className="w-full bg-[#181920] border border-[#20222c] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF0000]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações Globais</span>
        </button>
      </form>
    </div>
  );
};
