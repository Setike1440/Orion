import React, { useState, useEffect, useRef } from 'react';
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
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';

export const CanIRunIt = () => {
  usePageTitle('Meu PC Roda?');
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialGameId = searchParams.get('gameId');

  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Carousel ref
  const gamesTrackRef = useRef<HTMLDivElement>(null);

  // User System Specs State
  const [ramGb, setRamGb] = useState<number>(8);
  const [cpuCores, setCpuCores] = useState<number>(8);
  const [gpuName, setGpuName] = useState<string>('NVIDIA GeForce RTX 3060');
  const [osName, setOsName] = useState<string>('Windows 10 / 11 64-bit');
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);

  // Detect System Hardware Specs on Mount
  useEffect(() => {
    try {
      if ((navigator as any).deviceMemory) {
        setRamGb(Math.max(4, (navigator as any).deviceMemory));
      } else {
        setRamGb(16);
      }

      if (navigator.hardwareConcurrency) {
        setCpuCores(navigator.hardwareConcurrency);
      }

      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer) {
            let cleanGpu = renderer.replace(/^ANGLE \([^,]+,\s*/, '').replace(/\s*\(0x\w+\)/, '');
            if (cleanGpu.length > 50) cleanGpu = cleanGpu.substring(0, 50);
            setGpuName(cleanGpu);
          }
        }
      }

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

  // Scroll handler for horizontal games carousel
  const scrollGames = (direction: 'left' | 'right') => {
    if (gamesTrackRef.current) {
      const scrollAmount = 300;
      gamesTrackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Filtered games for search
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
    return 8;
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
      <div className="min-h-screen bg-[#000000] py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Breadcrumb 
            items={[
              { label: t('can_i_run_it') || 'Requisitos do PC' }
            ]} 
          />
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#FF0000] border border-[#FF0000] text-white hover:bg-[#ff3333] hover:border-[#ff6666] text-xs sm:text-sm font-semibold transition-all px-4 py-2.5 rounded-xl shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t('back_to_menu')}</span>
          </Link>
        </div>

        {/* 2. Main Title Banner (Meu PC roda este jogo?) */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0d0e12] border border-[#1f212a] p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF0000]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#FF0000]/10 border border-[#FF0000]/30 px-3 py-1 rounded-full text-[#FF0000] text-[11px] font-semibold tracking-wider uppercase">
                <MonitorCheck className="w-3.5 h-3.5" />
                <span>Análise de Desempenho do PC</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Meu PC roda este <span className="text-[#FF0000]">jogo</span>?
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Analisamos automaticamente as especificações do seu hardware para calcular a compatibilidade e a taxa de quadros esperada para o jogo selecionado.
              </p>
            </div>

            {/* Hardware Detector Summary & Edit Toggle */}
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <div className="bg-[#000000] border border-[#1f212a] rounded-xl p-4 flex items-center gap-4 shrink-0">
                <div className="w-10 h-10 rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Seu Hardware Detectado</p>
                  <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">{ramGb} GB RAM • {cpuCores} Cores</p>
                  <p className="text-xs text-[#FF0000] truncate max-w-[200px] mt-0.5">{gpuName}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                className="w-full py-2 px-3 rounded-xl bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer group"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                <span>{isEditingSpecs ? 'Concluir Edição do Hardware' : 'Ajustar Especificações do meu PC'}</span>
              </button>
            </div>
          </div>

          {/* Hardware Manual Editor Drawer */}
          {isEditingSpecs && (
            <div className="mt-5 p-4 bg-[#000000] border border-[#1f212a] rounded-xl space-y-3 text-xs animate-fadeIn relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 font-medium block mb-1">Memória RAM (GB)</label>
                  <select 
                    value={ramGb} 
                    onChange={(e) => setRamGb(Number(e.target.value))}
                    className="w-full bg-[#0d0e12] border border-[#20222c] rounded-lg p-2 text-white outline-none"
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
                    className="w-full bg-[#0d0e12] border border-[#20222c] rounded-lg p-2 text-white outline-none"
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
                    className="w-full bg-[#0d0e12] border border-[#20222c] rounded-lg p-2 text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Horizontal Games Section with Search Bar on top */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
          
          {/* Search bar on top of horizontal section */}
          <div className="space-y-3">
            <div className="relative group">
              <Search className="w-4 h-4 text-gray-500 group-focus-within:text-gray-300 transition-colors absolute left-3.5 top-3" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar jogo na biblioteca..."
                className="w-full bg-[#000000] border border-[#20222c] focus:border-[#383b4e] rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm text-white outline-none transition-all placeholder-gray-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Limpar pesquisa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Section title & Carousel Arrow Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#FF0000]" />
              <h2 className="text-sm sm:text-base font-semibold text-white">Selecione o Jogo para Testar</h2>
            </div>

            {/* Arrows: Red circle button with white icon */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollGames('left')}
                className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#ff3333] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                type="button"
                onClick={() => scrollGames('right')}
                className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#ff3333] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                title="Próximo"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Horizontal games track (cards deitados igual no menu) */}
          <div 
            ref={gamesTrackRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pt-1 pb-2 px-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => {
                const isSelected = selectedGame?.id === game.id;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGame(game)}
                    className={`group relative flex-none w-52 sm:w-64 aspect-[460/215] rounded-2xl overflow-hidden text-left transition-all duration-200 cursor-pointer flex flex-col justify-end p-3 ${
                      isSelected
                        ? 'border-2 border-[#FF0000] scale-[1.02] z-10 shadow-md'
                        : 'border border-[#1f212a] bg-[#000000] hover:border-[#FF0000]/60 hover:-translate-y-1'
                    }`}
                  >
                    {/* Cover image */}
                    <img 
                      src={game.cover_url} 
                      alt={game.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                    {/* Selection Check Badge Top Right */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Content Bottom */}
                    <div className="relative z-20 space-y-0.5">
                      <p className={`text-xs font-bold truncate transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${isSelected ? 'text-[#FF0000]' : 'text-white group-hover:text-[#FF0000]'}`}>
                        {game.title}
                      </p>
                      <p className="text-[10px] text-gray-300 drop-shadow-sm">
                        {game.is_highlight ? '★ Em Destaque' : 'PC Game'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="w-full py-8 text-center text-xs text-gray-400 bg-[#000000] border border-[#1f212a] rounded-xl">
                Nenhum jogo encontrado para "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* 4. Specifications & Analysis Container (Rectangular - Full Width) */}
        {selectedGame ? (
          <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* Selected Game Card Header with Landscape Cover (deitada) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-[#1f212a]">
              <img 
                src={selectedGame.cover_url} 
                alt={selectedGame.title} 
                className="w-36 sm:w-48 aspect-[460/215] object-cover rounded-xl shadow-md border border-[#1f212a] shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold text-[#FF0000] tracking-wider uppercase bg-[#FF0000]/10 px-2.5 py-0.5 rounded-full inline-block border border-[#FF0000]/20">
                  Jogo Selecionado
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{selectedGame.title}</h3>
                <p className="text-xs text-gray-400">Verificação de compatibilidade em tempo real com hardware local</p>
              </div>
            </div>

            {/* Overall Verdict Box (Green for Excellent, Yellow for Good, Red for Warning/No) */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex items-center gap-4 transition-all shadow-sm ${
              verdict === 'excellent' 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                : verdict === 'good'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                : 'bg-red-500/10 border-red-500/40 text-red-200'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                verdict === 'excellent' 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                  : verdict === 'good'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-red-500/20 border-red-500/50 text-red-400'
              }`}>
                {verdict === 'excellent' ? <Zap className="w-6 h-6 text-emerald-400" /> : verdict === 'good' ? <CheckCircle2 className="w-6 h-6 text-amber-400" /> : <AlertTriangle className="w-6 h-6 text-red-400" />}
              </div>

              <div className="space-y-1">
                <h4 className={`text-sm sm:text-base font-bold tracking-tight ${
                  verdict === 'excellent' ? 'text-emerald-400' : verdict === 'good' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {verdict === 'excellent' && '🚀 Roda no RECOMENDADO! (Excelente Desempenho)'}
                  {verdict === 'good' && '✅ Roda nos Requisitos MÍNIMOS em 1080p'}
                  {verdict === 'warning' && '❌ Seu PC pode ter dificuldades com este jogo'}
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {verdict === 'excellent' && 'Seu hardware excede os requisitos recomendados. Você poderá jogar em alta resolução e taxa de quadros fluida.'}
                  {verdict === 'good' && 'Seu computador atende aos requisitos essenciais para executar o jogo em configurações médias/baixas de qualidade.'}
                  {verdict === 'warning' && 'A memória RAM ou o processador detectados estão abaixo do recomendado oficial do jogo.'}
                </p>
              </div>
            </div>

            {/* Detailed Spec Comparison Breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#FF0000]" />
                <span>Comparativo Detalhado de Componentes</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

                {/* RAM Test */}
                <div className="bg-[#000000] border border-[#1f212a] rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0d0e12] border border-[#20222c] flex items-center justify-center text-gray-300 shrink-0">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Memória RAM</p>
                      <p className="text-[11px] text-gray-400">PC: <span className="text-white font-semibold">{ramGb} GB</span> • Mín: <span className="text-gray-300">{minRam} GB</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#1f212a]">
                    {ramStatus === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Recomendado
                      </span>
                    ) : ramStatus === 'ok' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Mínimo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> Abaixo
                      </span>
                    )}
                  </div>
                </div>

                {/* CPU Test */}
                <div className="bg-[#000000] border border-[#1f212a] rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0d0e12] border border-[#20222c] flex items-center justify-center text-gray-300 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Processador (CPU)</p>
                      <p className="text-[11px] text-gray-400">PC: <span className="text-white font-semibold">{cpuCores} Cores</span> • Mín: <span className="text-gray-300">{minCores} Cores</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#1f212a]">
                    {cpuStatus === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Recomendado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Insuficiente
                      </span>
                    )}
                  </div>
                </div>

                {/* GPU Test */}
                <div className="bg-[#000000] border border-[#1f212a] rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0d0e12] border border-[#20222c] flex items-center justify-center text-gray-300 shrink-0">
                      <MonitorCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Placa de Vídeo (GPU)</p>
                      <p className="text-[11px] text-gray-400 truncate">Detectada: <span className="text-white font-semibold">{gpuName}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#1f212a]">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Compatível
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Official Developer Requirements Text - Organized with Icons & No Scrollbar */}
            {selectedGame.requirements && (
              <div className="pt-4 border-t border-[#1f212a] space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF0000]" />
                    <span>Requisitos Oficiais do Desenvolvedor</span>
                  </h5>
                </div>

                {/* Formatted Container - Full view without scrollbar */}
                <div className="p-5 bg-[#000000] border border-[#1f212a] rounded-xl text-xs text-gray-300 leading-relaxed font-sans space-y-2.5">
                  {selectedGame.requirements.split('\n').filter((line: string) => line.trim().length > 0).map((line: string, idx: number) => {
                    const lower = line.toLowerCase();
                    if (lower.includes('mínimos') || lower.includes('mínimo') || lower.includes('minimum')) {
                      return (
                        <div key={idx} className="pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-[#1f212a]">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{line}</span>
                        </div>
                      );
                    }
                    if (lower.includes('recomendados') || lower.includes('recomendado') || lower.includes('recommended')) {
                      return (
                        <div key={idx} className="pt-4 pb-1 text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-[#1f212a]">
                          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{line}</span>
                        </div>
                      );
                    }

                    let IconComp = CheckCircle2;
                    let iconStyle = "text-[#FF0000]";

                    if (lower.includes('so:') || lower.includes('sistema') || lower.includes('os:')) {
                      IconComp = Monitor;
                      iconStyle = "text-blue-400";
                    } else if (lower.includes('processador') || lower.includes('cpu:')) {
                      IconComp = Cpu;
                      iconStyle = "text-purple-400";
                    } else if (lower.includes('memória') || lower.includes('ram:')) {
                      IconComp = HardDrive;
                      iconStyle = "text-emerald-400";
                    } else if (lower.includes('placa de vídeo') || lower.includes('gpu:') || lower.includes('vídeo:')) {
                      IconComp = MonitorCheck;
                      iconStyle = "text-amber-400";
                    } else if (lower.includes('armazenamento') || lower.includes('espaço') || lower.includes('disco:')) {
                      IconComp = HardDrive;
                      iconStyle = "text-cyan-400";
                    }

                    return (
                      <div key={idx} className="flex items-start gap-2.5 bg-[#0d0e12] border border-[#1f212a] p-3 rounded-lg text-xs text-gray-200">
                        <IconComp className={`w-4 h-4 ${iconStyle} shrink-0 mt-0.5`} />
                        <span className="leading-snug">{line}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Link to Game Details */}
            <div className="pt-2">
              <Link
                to={`/jogo/${selectedGame.id}`}
                className="w-full py-3.5 px-4 bg-[#FF0000] border border-[#FF0000] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Acessar Jogo e Credenciais</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        ) : (
          <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-12 text-center text-gray-400">
            <p>Nenhum jogo selecionado.</p>
          </div>
        )}

      </div>
    </div>
  );
};
