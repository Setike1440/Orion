import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, UserX, Plus } from 'lucide-react';

export const SecurityCenter = () => {
  const { securityEvents, blockedIPs, blockIP, unblockIP, clientIP } = useSiteSettings();
  const [newIP, setNewIP] = useState('');

  const handleManualBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIP.trim()) return;
    blockIP(newIP.trim());
    setNewIP('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#FF0000]" />
            <span>Central de Segurança & Monitoramento</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Acompanhe eventos de login, bloqueios de IP e tentativas de acesso não autorizados.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Status de Proteção</span>
            <span className="text-base font-bold text-white">ATIVO (Sem Riscos)</span>
          </div>
        </div>

        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center text-[#FF0000] shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">IPs Bloqueados</span>
            <span className="text-xl font-bold text-white">{blockedIPs.length}</span>
          </div>
        </div>

        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Tentativas de Login</span>
            <span className="text-xl font-bold text-white">{securityEvents.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blocked IPs Section */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f212a]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF0000]" />
              <span>Bloqueio de IP</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400 bg-[#181920] px-2 py-0.5 rounded border border-[#20222c]" title="Seu IP Atual">
              Seu IP: {clientIP}
            </span>
          </div>

          <form onSubmit={handleManualBlock} className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: 189.12.34.56"
              value={newIP}
              onChange={e => setNewIP(e.target.value)}
              className="flex-1 bg-[#181920] border border-[#20222c] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF0000]"
            />
            <button
              type="submit"
              className="bg-[#FF0000] hover:bg-[#e60000] text-white p-2 rounded-xl transition-all cursor-pointer"
              title="Bloquear IP"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {blockedIPs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Nenhum IP bloqueado no momento.</p>
            ) : (
              blockedIPs.map(ip => (
                <div key={ip} className="flex items-center justify-between p-2.5 bg-[#181920] border border-[#1f212a] rounded-xl text-xs">
                  <span className="font-mono text-gray-300">{ip}</span>
                  <button
                    onClick={() => unblockIP(ip)}
                    className="text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer p-1"
                    title="Desbloquear IP"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Logs */}
        <div className="lg:col-span-2 bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#1f212a]">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Registro de Eventos de Segurança</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {securityEvents.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Nenhum evento de segurança registrado no momento.</p>
            ) : (
              securityEvents.map(event => (
                <div key={event.id} className="p-3 bg-[#181920] border border-[#1f212a] rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{event.event_type}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(event.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-300">{event.details}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono pt-1">
                    <span>IP: {event.ip_address}</span>
                    {event.user_email && <span>Usuário: {event.user_email}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
