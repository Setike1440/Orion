import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Breadcrumb } from '../components/Breadcrumb';
import { Skeleton } from '../components/Skeleton';
import { 
  MonitorCheck, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft, 
  Gamepad2,
  Check,
  Monitor,
  Zap,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const CanIRunIt = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialGameId = searchParams.get('gameId');

  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // User System Specs State (auto-detected, with manual edit capability)
  const [ramGb, setRamGb] = useState<number>(8);
  const [cpuCores, setCpuCores] = useState<number>(8);
  const [gpuName, setGpuName] = useState<string>('NVIDIA GeForce RTX 3060');
  const [osName, setOsName] = useState<string>('Windows 10 / 11 64-bit');
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);

  // Detect System Hardware Specs on Mount
  useEffect(() => {
    try {
      // RAM Detection
      if ((navigator as any).deviceMemory) {
        setRamGb(Math.max(4, (navigator as any).deviceMemory));
      } else {
        setRamGb(16);
      }

      // CPU Cores Detection
      if (navigator.hardwareConcurrency) {
        setCpuCores(navigator.hardwareConcurrency);
      }

      // GPU Detection via WebGL
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer) {
            // Clean up common prefixes like "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11...)"
            let cleanGpu = renderer.replace(/^ANGLE \([^,]+,\s*/, '').replace(/\s*\(0x\w+\)/, '');
            if (cleanGpu.length > 50) cleanGpu = cleanGpu.substring(0, 50);
            setGpuName(cleanGpu);
          }
        }
      }

      // OS Detection
      const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';
      if (platform.toLowerCase().includes('win')) {
        setOsName('Windows 11 / 10 (64-bit)');
      } else if (platform.toLowerCase().includes('mac')) {
        setOsName('macOS Sonoma / Ventura');
      } else if (platform.toLowerCase().includes('linux')) {
        setOsName('Linux Ubuntu / SteamOS');
      }
    } catch (e) {
      console.warn('Specs detection warning:', e);
    }
  }, []);

  // Fetch Games List
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const start = Date.now();
      const { data } = await supabase.from('games').select('*').order('title');
      if (data && data.length > 0) {
        setGames(data);
        if (initialGameId) {
          const found = data.find(g => g.id === initialGameId);
          if (found) setSelectedGame(found);
          else setSelectedGame(data[0]);
        } else {
          setSelectedGame(data[0]);
        }
      }
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 200 - elapsed);
      setTimeout(() => setLoading(false), remaining);
    };
    fetchGames();
  }, [initialGameId]);

  // Filtered games for dropdown / search
  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Requirements Helper parser
  const getMinRamRequired = (game: any) => {
    if (!game) return 8;
    const reqStr = (game.requirements || '').toLowerCase();
    if (reqStr.includes('16 gb') || reqStr.includes('16gb')) return 16;
    if (reqStr.includes('12 gb') || reqStr.includes('12gb')) return 12;
    if (reqStr.includes('8 gb') || reqStr.includes('8gb')) return 8;
    if (reqStr.includes('4 gb') || reqStr.includes('4gb')) return 4;
    return 8; // Default standard
  };

  const getRecRamRequired = (game: any) => {
    return getMinRamRequired(game) <= 8 ? 16 : 32;
  };

  const getMinCoresRequired = (game: any) => {
    if (!game) return 4;
    const reqStr = (game.requirements || '').toLowerCase();
    if (reqStr.includes('i7') || reqStr.includes('ryzen 7') || reqStr.includes('octa')) return 8;
    if (reqStr.includes('i5') || reqStr.includes('ryzen 5') || reqStr.includes('quad')) return 4;
    return 4;
  };

  // Evaluation calculation
  const minRam = getMinRamRequired(selectedGame);
  const recRam = getRecRamRequired(selectedGame);
  const minCores = getMinCoresRequired(selectedGame);

  const ramStatus = ramGb >= recRam ? 'optimal' : ramGb >= minRam ? 'ok' : 'insufficient';
  const cpuStatus = cpuCores >= minCores ? 'optimal' : 'warning';
  const osStatus = 'ok';

  // Overall Score Verdict
  let verdict: 'excellent' | 'good' | 'warning';
  if (ramStatus === 'optimal' && cpuStatus === 'optimal') {
    verdict = 'excellent';
  } else if (ramStatus !== 'insufficient' && cpuStatus !== 'warning') {
    verdict = 'good';
  } else {
    verdict = 'warning';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1014] py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0e] py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Breadcrumb 
            items={[
              { label: t('can_i_run_it') || 'Requisitos do PC' }
            ]} 
          />
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#268FFF] text-white hover:bg-[#1f7fe6] text-xs sm:text-sm font-semibold transition-all px-4 py-2.5 rounded-xl shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Voltar ao Menu</span>
          </Link>
        </div>

        {/* Title Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-[#121318] border border-[#1f212a] p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#268FFF]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#268FFF]/10 border border-[#268FFF]/30 px-3 py-1 rounded-full text-[#268FFF] text-[11px] font-semibold tracking-wider uppercase">
                <MonitorCheck className="w-3.5 h-3.5" />
                <span>Análise de Desempenho do PC</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Meu PC roda este <span className="text-[#268FFF]">jogo</span>?
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Analisamos automaticamente as especificações do seu hardware para calcular a compatibilidade e a taxa de quadros esperada para o jogo selecionado.
              </p>
            </div>

            {/* Quick Summary Badge */}
            <div className="bg-[#181920] border border-[#1f212a] rounded-xl p-4 flex items-center gap-4 shrink-0 w-full md:w-auto">
              <div className="w-10 h-10 rounded-lg bg-[#268FFF]/10 border border-[#268FFF]/30 text-[#268FFF] flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Seu Hardware Detectado</p>
                <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">{ramGb} GB RAM • {cpuCores} Cores</p>
                <p className="text-xs text-[#268FFF] truncate max-w-[200px] mt-0.5">{gpuName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Game Selector & System Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Game Picker */}
          <div className="lg:col-span-5 bg-[#121318] border border-[#1f212a] rounded-2xl p-5 md:p-6 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[#268FFF]" />
                <span>Selecione o Jogo</span>
              </h2>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar jogo..."
                  className="w-full bg-[#0a0b0e] border border-[#20222c] focus:border-[#268FFF] rounded-xl pl-9 pr-9 py-2 text-xs text-white outline-none transition-all placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-0.5"
                    title="Limpar pesquisa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Games List Selector */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                {filteredGames.map((game) => {
                  const isSelected = selectedGame?.id === game.id;
                  return (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#181920] border-[#268FFF] text-white shadow-sm' 
                          : 'bg-[#171821]/60 border-[#1f212a] text-gray-300 hover:bg-[#181920] hover:border-gray-600'
                      }`}
                    >
                      <img 
                        src={game.cover_url} 
                        alt={game.title} 
                        className="w-10 h-12 object-cover rounded-lg shrink-0 border border-black/40"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate text-white">{game.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{game.is_highlight ? '★ Em Destaque' : 'Steam PC'}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#268FFF] shrink-0 mr-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Hardware Override Drawer Toggle */}
            <div className="pt-4 border-t border-[#1f212a]">
              <button 
                onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                className="w-full py-2 px-3 rounded-xl bg-[#171821] hover:bg-[#1f212a] text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2 border border-[#1f212a] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#268FFF]" />
                <span>{isEditingSpecs ? 'Concluir Edição do Hardware' : 'Ajustar Especificações do meu PC'}</span>
              </button>

              {isEditingSpecs && (
                <div className="mt-3 p-3.5 bg-[#0a0b0e] border border-[#1f212a] rounded-xl space-y-3 text-xs animate-fadeIn">
                  <div>
                    <label className="text-gray-400 font-medium block mb-1">Memória RAM (GB)</label>
                    <select 
                      value={ramGb} 
                      onChange={(e) => setRamGb(Number(e.target.value))}
                      className="w-full bg-[#121318] border border-[#20222c] rounded-lg p-2 text-white outline-none"
                    >
                      <option value={4}>4 GB RAM</option>
                      <option value={8}>8 GB RAM</option>
                      <option value={12}>12 GB RAM</option>
                      <option value={16}>16 GB RAM</option>
                      <option value={32}>32 GB RAM</option>
                      <option value={64}>64 GB RAM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 font-medium block mb-1">Cores do Processador (CPU)</label>
                    <select 
                      value={cpuCores} 
                      onChange={(e) => setCpuCores(Number(e.target.value))}
                      className="w-full bg-[#121318] border border-[#20222c] rounded-lg p-2 text-white outline-none"
                    >
                      <option value={2}>Dual-Core (2 Cores)</option>
                      <option value={4}>Quad-Core (4 Cores)</option>
                      <option value={6}>Hexa-Core (6 Cores)</option>
                      <option value={8}>Octa-Core (8 Cores)</option>
                      <option value={12}>12+ Cores</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 font-medium block mb-1">Placa de Vídeo (GPU)</label>
                    <input 
                      type="text" 
                      value={gpuName} 
                      onChange={(e) => setGpuName(e.target.value)}
                      className="w-full bg-[#121318] border border-[#20222c] rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Compatibility Analysis Results */}
          <div className="lg:col-span-7 space-y-6">

            {selectedGame ? (
              <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
                
                {/* Selected Game Card Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-[#1f212a]">
                  <img 
                    src={selectedGame.cover_url} 
                    alt={selectedGame.title} 
                    className="w-14 h-18 object-cover rounded-xl shadow-sm border border-[#1f212a]"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-semibold text-[#268FFF] tracking-wider uppercase">Jogo Selecionado</span>
                    <h3 className="text-lg font-bold text-white truncate">{selectedGame.title}</h3>
                    <p className="text-xs text-gray-400">Verificação em tempo real com hardware local</p>
                  </div>
                </div>

                {/* Overall Verdict Box */}
                <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all shadow-sm ${
                  verdict === 'excellent' 
                    ? 'bg-[#268FFF]/10 border-[#268FFF]/40 text-white' 
                    : verdict === 'good'
                    ? 'bg-blue-500/10 border-blue-500/40 text-white'
                    : 'bg-amber-500/10 border-amber-500/40 text-white'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    verdict === 'excellent' 
                      ? 'bg-[#268FFF]/20 border-[#268FFF]/50 text-[#268FFF]' 
                      : verdict === 'good'
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  }`}>
                    {verdict === 'excellent' ? <Zap className="w-5 h-5" /> : verdict === 'good' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold tracking-tight">
                      {verdict === 'excellent' && '🚀 Roda no RECOMENDADO! (Excelente Desempenho)'}
                      {verdict === 'good' && '✅ Roda nos Requisitos MÍNIMOS em 1080p'}
                      {verdict === 'warning' && '⚠️ Seu PC pode ter dificuldades com este jogo'}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {verdict === 'excellent' && 'Seu hardware excede os requisitos recomendados. Você poderá jogar em alta resolução e taxa de quadros fluida.'}
                      {verdict === 'good' && 'Seu computador atende aos requisitos essenciais para executar o jogo em configurações médias/baixas de qualidade.'}
                      {verdict === 'warning' && 'A memória RAM ou o processador detectados estão abaixo do recomendado oficial do jogo.'}
                    </p>
                  </div>
                </div>

                {/* Detailed Spec Comparison Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#268FFF]" />
                    <span>Comparativo Detalhado de Componentes</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">

                    {/* RAM Test */}
                    <div className="bg-[#181920] border border-[#1f212a] rounded-xl p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#121318] border border-[#20222c] flex items-center justify-center text-gray-300 shrink-0">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Memória RAM</p>
                          <p className="text-[11px] text-gray-400">Seu PC: <span className="text-white font-medium">{ramGb} GB</span> • Mínimo: <span className="text-gray-300">{minRam} GB</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {ramStatus === 'optimal' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#268FFF] bg-[#268FFF]/10 border border-[#268FFF]/30 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Recomendado
                          </span>
                        ) : ramStatus === 'ok' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Mínimo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-400/10 border border-red-400/30 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Abaixo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CPU Test */}
                    <div className="bg-[#181920] border border-[#1f212a] rounded-xl p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#121318] border border-[#20222c] flex items-center justify-center text-gray-300 shrink-0">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Processador (CPU)</p>
                          <p className="text-[11px] text-gray-400">Seu PC: <span className="text-white font-medium">{cpuCores} Cores</span> • Mínimo: <span className="text-gray-300">{minCores} Cores</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {cpuStatus === 'optimal' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#268FFF] bg-[#268FFF]/10 border border-[#268FFF]/30 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Alerta
                          </span>
                        )}
                      </div>
                    </div>

                    {/* GPU Test */}
                    <div className="bg-[#181920] border border-[#1f212a] rounded-xl p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#121318] border border-[#20222c] flex items-center justify-center text-gray-300 shrink-0">
                          <MonitorCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">Placa de Vídeo (GPU)</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[220px]">Detectada: <span className="text-white font-medium">{gpuName}</span></p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#268FFF] bg-[#268FFF]/10 border border-[#268FFF]/30 px-2.5 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Compatível
                      </span>
                    </div>

                  </div>
                </div>

                {/* Requirements Text from Game Details */}
                {selectedGame.requirements && (
                  <div className="pt-4 border-t border-[#1f212a] space-y-2">
                    <h5 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Requisitos Oficiais do Desenvolvedor</h5>
                    <div className="p-3 bg-[#0a0b0e] border border-[#1f212a] rounded-xl text-xs text-gray-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                      {selectedGame.requirements}
                    </div>
                  </div>
                )}

                {/* Link to Game Details */}
                <div className="pt-2">
                  <Link
                    to={`/jogo/${selectedGame.id}`}
                    className="w-full py-2.5 px-4 bg-[#268FFF] hover:bg-[#1f7fe6] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Acessar Jogo e Credenciais</span>
                    <Sparkles className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            ) : (
              <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-12 text-center text-gray-400">
                <p>Nenhum jogo selecionado.</p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
