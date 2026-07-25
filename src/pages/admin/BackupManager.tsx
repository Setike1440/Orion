import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Database, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

export const BackupManager = () => {
  const { createFullBackup, restoreFromBackup } = useSiteSettings();
  const [restored, setRestored] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownloadBackup = async () => {
    const backupData = await createFullBackup();
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `orion_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const success = await restoreFromBackup(parsed);
        if (success) {
          setRestored(true);
          setErrorMsg('');
          setTimeout(() => setRestored(false), 4000);
        } else {
          setErrorMsg('Formato de arquivo de backup inválido ou corrompido.');
        }
      } catch (err) {
        setErrorMsg('Erro ao ler arquivo JSON. Verifique a sintaxe.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#FF0000]" />
            <span>Gestão de Backups do Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Gere, baixe e restaure backups completos das configurações, logs, segurança e banco de dados do site.
          </p>
        </div>
      </div>

      {restored && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Backup restaurado com sucesso! Todas as configurações foram atualizadas.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF0000] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create / Download Backup */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Exportar Backup Completo</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Crie uma cópia de segurança em formato JSON contendo todos os dados e configurações do site.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer shadow-lg"
          >
            <FileCode className="w-4 h-4" />
            <span>Baixar Backup (.json)</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Restaurar de um Backup</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Envie um arquivo de backup (.json) gerado anteriormente para restaurar as configurações do sistema.
            </p>
          </div>

          <label className="w-full inline-flex items-center justify-center gap-2 bg-[#181920] border border-[#20222c] hover:bg-[#20222c] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer">
            <RefreshCw className="w-4 h-4 text-[#FF0000]" />
            <span>Selecionar Arquivo JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
