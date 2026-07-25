import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Sparkles, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

export const SystemCleanupManager = () => {
  const { runSystemCleanup } = useSiteSettings();
  const [options, setOptions] = useState({
    logs: true,
    errors: true,
    cache: true,
  });
  const [cleaning, setCleaning] = useState(false);
  const [cleanedCount, setCleanedCount] = useState<number | null>(null);

  const handleCleanup = async () => {
    setCleaning(true);
    const result = await runSystemCleanup(options);
    setTimeout(() => {
      setCleaning(false);
      setCleanedCount(result);
      setTimeout(() => setCleanedCount(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#FF0000]" />
            <span>Limpeza e Otimização do Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Remova dados obsoletos, limpe arquivos temporários e libere espaço em memória para manter o site rápido.
          </p>
        </div>
      </div>


      {cleanedCount !== null && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Limpeza concluída! {cleanedCount} registros e itens temporários foram removidos.</span>
        </div>
      )}

      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-white pb-3 border-b border-[#1f212a]">
          Selecione o que deseja limpar:
        </h2>

        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 bg-[#181920] border border-[#20222c] rounded-xl cursor-pointer hover:border-[#3a3d52] transition-colors">
            <input
              type="checkbox"
              checked={options.errors}
              onChange={e => setOptions({ ...options, errors: e.target.checked })}
              className="mt-0.5 accent-[#FF0000] w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold text-white block">Erros do Sistema Resolvidos</span>
              <span className="text-[11px] text-gray-400">Remove o histórico de relatórios de erros já marcados como resolvidos.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-[#181920] border border-[#20222c] rounded-xl cursor-pointer hover:border-[#3a3d52] transition-colors">
            <input
              type="checkbox"
              checked={options.logs}
              onChange={e => setOptions({ ...options, logs: e.target.checked })}
              className="mt-0.5 accent-[#FF0000] w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold text-white block">Logs Antigos de Atividades (&gt; 30 Dias)</span>
              <span className="text-[11px] text-gray-400">Expurga registros antigos de auditoria que não são mais necessários.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-[#181920] border border-[#20222c] rounded-xl cursor-pointer hover:border-[#3a3d52] transition-colors">
            <input
              type="checkbox"
              checked={options.cache}
              onChange={e => setOptions({ ...options, cache: e.target.checked })}
              className="mt-0.5 accent-[#FF0000] w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold text-white block">Cache e Sessões Expiradas</span>
              <span className="text-[11px] text-gray-400">Limpa cache local temporário de navegação e notificações antigas lidas.</span>
            </div>
          </label>
        </div>

        <button
          onClick={handleCleanup}
          disabled={cleaning || (!options.errors && !options.logs && !options.cache)}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${cleaning ? 'animate-spin' : ''}`} />
          <span>{cleaning ? 'Executando Limpeza...' : 'Iniciar Limpeza do Sistema'}</span>
        </button>
      </div>
    </div>
  );
};
