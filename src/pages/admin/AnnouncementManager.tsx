import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Megaphone, Save, CheckCircle2, Sparkles, Bell, AlertTriangle, Info } from 'lucide-react';

export const AnnouncementManager = () => {
  const { announcement, updateAnnouncement } = useSiteSettings();
  const [formData, setFormData] = useState({ ...announcement });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData({ ...announcement });
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAnnouncement(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-[#FF0000]" />
            <span>Barra de Avisos no Topo do Site</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Crie e gerencie avisos globais exibidos em destaque no topo para todos os visitantes do site.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Barra de avisos atualizada e ativa em todo o site!</span>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-3">
        <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Pré-visualização ao vivo</span>
        <div className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
          formData.color === 'amber' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
          formData.color === 'emerald' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
          formData.color === 'blue' ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' :
          formData.color === 'purple' ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' :
          formData.color === 'white' ? 'bg-white/10 border-white/30 text-white' :
          'bg-[#FF0000]/15 border-[#FF0000]/30 text-[#FF0000]'
        }`}>
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{formData.text || 'Digite o texto do aviso abaixo...'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f212a]">
          <h2 className="text-sm font-bold text-white">Configurações da Barra de Avisos</h2>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#181920] border border-[#20222c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0000]" />
            <span className="ml-2 text-xs font-bold text-white">{formData.enabled ? 'ATIVO' : 'DESATIVADO'}</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Texto do Aviso</label>
          <input
            type="text"
            value={formData.text}
            onChange={e => setFormData({ ...formData, text: e.target.value })}
            placeholder="Ex: 🚀 Novas contas Steam adicionadas hoje! Aproveite."
            className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Link de Destino (Opcional)</label>
            <input
              type="text"
              value={formData.link_url || ''}
              onChange={e => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="Ex: /sugerir-jogo"
              className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Cor de Destaque</label>
            <select
              value={formData.color}
              onChange={e => setFormData({ ...formData, color: e.target.value as any })}
              className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
            >
              <option value="red">Vermelho (Padrão Orion)</option>
              <option value="white">Branco (Destaque Limpo)</option>
              <option value="amber">Amarelo / Alerta</option>
              <option value="emerald">Verde / Sucesso</option>
              <option value="blue">Azul / Informativo</option>
              <option value="purple">Roxo / Especial</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>Salvar e Publicar Aviso</span>
        </button>
      </form>
    </div>
  );
};
