import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { AlertTriangle, CheckCircle2, Trash2, Filter, Info, Bug, RotateCw } from 'lucide-react';
import { AdminToast } from '../../components/admin/AdminModal';

export const ErrorMonitoringManager = () => {
  const { errorLogs, resolveError, clearErrorLogs } = useSiteSettings();
  const [filterType, setFilterType] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    resolveError(id);
    setToastMessage('Erro marcado como resolvido!');
  };

  const handleClearAll = () => {
    clearErrorLogs();
    setToastMessage('Todos os logs de erros foram limpos com sucesso!');
  };

  const filteredLogs = errorLogs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="space-y-6">
      <AdminToast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />

      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Bug className="w-6 h-6 text-[#FF0000]" />
            <span>Monitoramento de Erros do Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Registro em tempo real de falhas 404, exceções 500, erros de banco de dados e APIs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setToastMessage('Logs de erros atualizados com sucesso!')}
            className="bg-[#121318] border border-[#20222c] hover:border-[#3a3d52] hover:bg-[#1a1c26] text-gray-300 hover:text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCw className="w-4 h-4 text-[#FF0000]" />
            <span>Atualizar</span>
          </button>

          {errorLogs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Limpar Erros</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        {['all', '404', '500', 'API', 'DB', 'CLIENT'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === type 
                ? 'bg-[#FF0000] text-white shadow-sm' 
                : 'bg-[#0d0e12] border border-[#20222c] text-gray-400 hover:text-white'
            }`}
          >
            {type === 'all' ? 'Todos' : type}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#181920] border-b border-[#1f212a] text-gray-400 font-semibold">
            <tr>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Mensagem de Erro</th>
              <th className="px-6 py-4">URL / Origem</th>
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f212a]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum erro registrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#181920]/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border ${
                      log.type === '500' || log.type === 'DB'
                        ? 'bg-[#FF0000]/10 border-[#FF0000]/30 text-[#FF0000]'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400 max-w-xs truncate">
                    {log.url || '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {log.status === 'pending' ? (
                      <button
                        onClick={() => handleResolve(log.id)}
                        className="p-1.5 bg-[#181920] border border-[#20222c] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-gray-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                        title="Marcar como resolvido"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resolver</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolvido
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
