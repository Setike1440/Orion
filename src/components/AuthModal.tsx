import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Gamepad2, X, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Shield } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setTab(authModalTab);
    setError(null);
    setSuccess(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      } else {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Try creating profile
          await supabase.from('profiles').insert([
            { id: data.user.id, email: data.user.email, role: 'user' }
          ]);
        }

        setSuccess('Conta criada com sucesso! Faça login para continuar.');
        setTimeout(() => {
          setTab('login');
          setSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro no servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={closeAuthModal} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#121318] border border-[#1f212a] rounded-2xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#181920] border border-[#222430] text-gray-400 hover:text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#268FFF]/10 border border-[#268FFF]/20 flex items-center justify-center mb-3 text-[#268FFF]">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {tab === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {tab === 'login' 
              ? 'Entre para acessar suas credenciais e jogos offline' 
              : 'Cadastre-se para favoritar jogos e gerenciar seus dados'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#0a0b0e] p-1 rounded-xl mb-5 border border-[#1f212a]">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-[#268FFF] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t('login') || 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-[#268FFF] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t('register') || 'Cadastrar'}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#268FFF]/10 border border-[#268FFF]/30 text-[#268FFF] text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#268FFF] shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('email') || 'E-mail'}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full bg-[#0a0b0e] border border-[#20222c] focus:border-[#268FFF] focus:ring-1 focus:ring-[#268FFF]/20 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-all placeholder-gray-600"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('password') || 'Senha'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0a0b0e] border border-[#20222c] focus:border-[#268FFF] focus:ring-1 focus:ring-[#268FFF]/20 rounded-xl py-2.5 pl-9 pr-9 text-xs text-white focus:outline-none transition-all placeholder-gray-600"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0a0b0e] border border-[#20222c] focus:border-[#268FFF] focus:ring-1 focus:ring-[#268FFF]/20 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-all placeholder-gray-600"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#268FFF] hover:bg-[#1f7fe6] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {tab === 'login' ? (t('login') || 'Entrar') : (t('register') || 'Cadastrar')}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          {tab === 'login' ? 'Não possui uma conta? ' : 'Já tem uma conta? '}
          <button
            onClick={() => {
              setTab(tab === 'login' ? 'register' : 'login');
              setError(null);
              setSuccess(null);
            }}
            className="text-[#268FFF] hover:underline font-semibold cursor-pointer"
          >
            {tab === 'login' ? 'Cadastre-se grátis' : 'Fazer Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
