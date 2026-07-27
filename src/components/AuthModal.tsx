import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Gamepad2, X, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Shield } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveCredentials, setSaveCredentials] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      // Load saved email if exists
      const savedEmail = localStorage.getItem('orion_saved_login_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  useEffect(() => {
    setTab(authModalTab);
    setError(null);
    setSuccess(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const translateAuthError = (msg: string, lang: 'pt' | 'en' | 'es'): string => {
    if (!msg) {
      if (lang === 'en') return 'An error occurred while processing your request.';
      if (lang === 'es') return 'Ocurrió un error al procesar su solicitud.';
      return 'Ocorreu um erro ao processar sua solicitação.';
    }

    const lower = msg.toLowerCase();

    if (
      lower.includes('invalid login credentials') ||
      lower.includes('invalid_credentials') ||
      lower.includes('invalid email or password') ||
      lower.includes('invalid username or password') ||
      lower.includes('invalid_grant')
    ) {
      if (lang === 'en') return 'Invalid email or password.';
      if (lang === 'es') return 'E-mail o contraseña incorrectos.';
      return 'E-mail ou senha incorretos.';
    }

    if (lower.includes('email not confirmed')) {
      if (lang === 'en') return 'Email not confirmed. Please check your inbox.';
      if (lang === 'es') return 'Correo electrónico no confirmado.';
      return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
    }

    if (
      lower.includes('already registered') ||
      lower.includes('already exists') ||
      lower.includes('user_already_exists')
    ) {
      if (lang === 'en') return 'User with this email is already registered.';
      if (lang === 'es') return 'Este correo electrónico ya está registrado.';
      return 'Este e-mail já está cadastrado.';
    }

    if (lower.includes('at least 6 characters') || lower.includes('password should be')) {
      if (lang === 'en') return 'Password must be at least 6 characters.';
      if (lang === 'es') return 'La contraseña debe tener al menos 6 caracteres.';
      return 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (lower.includes('rate limit') || lower.includes('too many requests')) {
      if (lang === 'en') return 'Too many requests. Please wait a moment.';
      if (lang === 'es') return 'Demasiadas solicitudes. Espera un momento.';
      return 'Muitas tentativas. Por favor, aguarde um momento e tente novamente.';
    }

    if (lower.includes('invalid email') || lower.includes('validate email')) {
      if (lang === 'en') return 'Invalid email address.';
      if (lang === 'es') return 'Correo electrónico inválido.';
      return 'E-mail inválido.';
    }

    if (lower.includes('as senhas não coincidem') || lower.includes('passwords do not match')) {
      if (lang === 'en') return 'Passwords do not match.';
      if (lang === 'es') return 'Las contraseñas no coinciden.';
      return 'As senhas não coincidem.';
    }

    if (lang === 'en') return msg;
    if (lang === 'es') return msg;
    return 'E-mail ou senha incorretos ou erro no servidor.';
  };

  const getSuccessMessage = (type: 'login' | 'register', lang: 'pt' | 'en' | 'es') => {
    if (type === 'login') {
      if (lang === 'en') return 'Login successful!';
      if (lang === 'es') return '¡Inicio de sesión con éxito!';
      return 'Login realizado com sucesso!';
    } else {
      if (lang === 'en') return 'Account created successfully! Log in to continue.';
      if (lang === 'es') return '¡Cuenta creada con éxito! Inicia sesión para continuar.';
      return 'Conta criada com sucesso! Faça login para continuar.';
    }
  };

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

        // Save credentials if option checked
        if (saveCredentials) {
          localStorage.setItem('orion_saved_login_email', email);
        } else {
          localStorage.removeItem('orion_saved_login_email');
        }

        setSuccess(getSuccessMessage('login', language));
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      } else {
        if (password !== confirmPassword) {
          throw new Error('passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('password should be at least 6 characters');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Try creating profile
          await supabase.from('profiles').insert([
            { id: data.user.id, email: data.user.email, username: username.trim() || email.split('@')[0], role: 'user' }
          ]);
        }

        setSuccess(getSuccessMessage('register', language));
        setTimeout(() => {
          setTab('login');
          setSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setError(translateAuthError(err.message || '', language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-fadeIn">
      {/* Click outside backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={closeAuthModal} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden">
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
          <div className="w-12 h-12 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center mb-3 p-2 text-[#FF0000]">
            <img src="https://i.imgur.com/sYDoUj4.png" alt="Orion Logo" className="w-6 h-6 object-contain" />
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
        <div className="flex bg-[#000000] p-1 rounded-xl mb-5 border border-[#1f212a]">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-[#FF0000] text-white shadow-sm'
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
                ? 'bg-[#FF0000] text-white shadow-sm'
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
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Nome de usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SeuNomeOuNick"
                  required
                  className="w-full bg-[#000000] border border-[#20222c] focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-all placeholder-gray-600"
                />
                <Gamepad2 className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

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
                className="w-full bg-[#000000] border border-[#20222c] focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-all placeholder-gray-600"
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
                className="w-full bg-[#000000] border border-[#20222c] focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 rounded-xl py-2.5 pl-9 pr-9 text-xs text-white focus:outline-none transition-all placeholder-gray-600"
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

          {tab === 'login' && (
            <div 
              onClick={() => setSaveCredentials(!saveCredentials)}
              className="flex items-center gap-2.5 pt-1 pb-0.5 cursor-pointer select-none group"
            >
              <button
                type="button"
                role="switch"
                aria-checked={saveCredentials}
                onClick={(e) => { e.stopPropagation(); setSaveCredentials(!saveCredentials); }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  saveCredentials ? 'bg-[#FF0000]' : 'bg-[#20222c]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    saveCredentials ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="font-medium text-xs text-gray-300 group-hover:text-white transition-colors">
                {t('save_credentials_q')}
              </span>
            </div>
          )}

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
                  className="w-full bg-[#000000] border border-[#20222c] focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-all placeholder-gray-600"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer text-xs"
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
            className="text-[#FF0000] hover:underline font-semibold cursor-pointer"
          >
            {tab === 'login' ? 'Cadastre-se grátis' : 'Fazer Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
