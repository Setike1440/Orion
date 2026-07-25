import React from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Globe, Monitor, Smartphone, LogOut, CheckCircle2 } from 'lucide-react';

export const ActiveSessionsManager = () => {
  const { activeSessions, terminateSession } = useSiteSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-[#FF0000]" />
            <span>Sessões Ativas dos Usuários</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Monitore os usuários atualmente conectados, dispositivos e encerre conexões remotamente.
          </p>
        </div>
      </div>

      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1f212a] flex items-center justify-between bg-[#0d0e12]">
          <span className="text-xs font-bold text-gray-300">Total de Usuários Conectados: {activeSessions.length}</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Monitoramento em Tempo Real
          </span>
        </div>

        <div className="divide-y divide-[#1f212a]">
          {activeSessions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">Nenhuma sessão ativa encontrada.</p>
          ) : (
            activeSessions.map((session) => {
              const isMobile = session.device.toLowerCase().includes('mobile') || session.device.toLowerCase().includes('android') || session.device.toLowerCase().includes('iphone');
              
              return (
                <div key={session.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#181920]/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#181920] border border-[#20222c] flex items-center justify-center text-gray-300 shrink-0">
                      {isMobile ? <Smartphone className="w-5 h-5 text-blue-400" /> : <Monitor className="w-5 h-5 text-[#FF0000]" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{session.username}</span>
                        <span className="text-xs text-gray-400 font-mono">({session.user_email})</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Dispositivo: <span className="text-gray-200">{session.device}</span> • Navegador: <span className="text-gray-200">{session.browser}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500 pt-0.5">
                        <span>IP: {session.ip_address}</span>
                        <span>•</span>
                        <span>Última atividade: {session.last_active}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => terminateSession(session.id)}
                    className="bg-[#0d0e12] border border-[#20222c] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30 text-[#FF0000] font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    title="Encerrar Sessão Remotamente"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#FF0000]" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
