import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Wrench, ShieldAlert, Clock, Save, CheckCircle2 } from 'lucide-react';

export const MaintenanceManager = () => {
  const { maintenance, updateMaintenance } = useSiteSettings();
  const [formData, setFormData] = useState({ ...maintenance });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData({ ...maintenance });
  }, [maintenance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMaintenance(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-[#FF0000]" />
            <span>Modo Manutenção</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Ative ou desative a tela de manutenção para os visitantes enquanto você realiza atualizações.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Status do modo manutenção atualizado com sucesso!</span>
        </div>
      )}

      {/* Main Status Toggle Box */}
      <div className={`p-6 rounded-2xl border transition-all ${formData.enabled ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#0d0e12] border-[#1f212a]'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${formData.enabled ? 'bg-amber-500/20 text-amber-400' : 'bg-[#181920] text-gray-400'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Status do Site: {formData.enabled ? 'EM MANUTENÇÃO (BLOQUEADO)' : 'ONLINE (DISPONÍVEL)'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {formData.enabled 
                  ? 'Visitantes comuns verão a tela de manutenção. Administradores continuam com acesso ao painel.' 
                  : 'O site está acessível publicamente para todos os visitantes.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#181920] border border-[#20222c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0000]" />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white pb-3 border-b border-[#1f212a]">
          Personalização da Mensagem de Manutenção
        </h2>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mensagem de Exibição para o Visitante</label>
          <textarea
            rows={3}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            placeholder="Escreva a mensagem aqui..."
            className="w-full bg-[#181920] border border-[#20222c] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF0000]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Previsão de Término (Ex: 30 minutos, 2 horas)</span>
          </label>
          <input
            type="text"
            value={formData.estimated_end || ''}
            onChange={e => setFormData({ ...formData, estimated_end: e.target.value })}
            placeholder="Ex: 1 hora"
            className="w-full bg-[#181920] border border-[#20222c] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF0000]"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Configuração de Manutenção</span>
        </button>
      </form>
    </div>
  );
};
