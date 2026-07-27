import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { Skeleton } from '../components/Skeleton';
import { Shield, FileText, Lock, CreditCard, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../contexts/LanguageContext';

export const TermsOfUse = () => {
  const { t } = useLanguage();
  usePageTitle(t('terms') || 'Termos de Uso');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: t('terms') || 'Termos de Uso' }]} />
          <Link to="/" className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-[#e60000] text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_home') || 'Voltar ao Início'}</span>
          </Link>
        </div>

        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1f212a] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{t('terms') || 'Termos de Uso'}</h1>
              <p className="text-xs text-gray-400">Última atualização: Julho de 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF0000]" />
                1. Aceitação dos Termos
              </h3>
              <p className="text-gray-400 pl-6">
                Ao acessar e utilizar nossa plataforma de biblioteca Steam, você concorda expressamente com todos os termos e diretrizes descritos nesta página. O descumprimento pode levar à suspensão temporária ou permanente do acesso.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF0000]" />
                2. Uso das Contas e Biblioteca
              </h3>
              <p className="text-gray-400 pl-6">
                As credenciais fornecidas são destinadas exclusivamente ao download e execução dos jogos no modo Offline da Steam. É estritamente proibido alterar senhas, e-mails de recuperação, configurações de segurança ou compartilhar credenciais com terceiros.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF0000]" />
                3. Responsabilidades do Usuário
              </h3>
              <p className="text-gray-400 pl-6">
                O usuário é responsável por verificar se o seu dispositivo atende aos requisitos mínimos de sistema antes de iniciar o download. Não nos responsabilizamos por limitações de hardware do usuário.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SecurityPage = () => {
  const { t } = useLanguage();
  usePageTitle(t('security') || 'Segurança');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: t('security') || 'Segurança' }]} />
          <Link to="/" className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-[#e60000] text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_home') || 'Voltar ao Início'}</span>
          </Link>
        </div>

        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1f212a] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{t('security') || 'Central de Segurança'}</h1>
              <p className="text-xs text-gray-400">Proteção de dados e segurança da conta</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0d0e12] border border-[#1f212a] p-5 rounded-xl space-y-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Criptografia Ponta a Ponta</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Todas as credenciais e conexões são protegidas com criptografia de alto nível para garantir que apenas assinantes ativos tenham acesso.
              </p>
            </div>

            <div className="bg-[#0d0e12] border border-[#1f212a] p-5 rounded-xl space-y-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Monitoramento 24/7</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sistemas automatizados identificam qualquer tentativa indevida de alteração em contas ou acessos não autorizados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LifetimeWarrantyPage = () => {
  const { t } = useLanguage();
  usePageTitle(t('lifetime_warranty') || 'Garantia Vitalícia');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: t('lifetime_warranty') || 'Garantia Vitalícia' }]} />
          <Link to="/" className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-[#e60000] text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_home') || 'Voltar ao Início'}</span>
          </Link>
        </div>

        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1f212a] pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{t('lifetime_warranty') || 'Garantia Vitalícia de Acesso'}</h1>
              <p className="text-xs text-gray-400">Tranquilidade total enquanto sua assinatura estiver ativa</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed">
            <p>
              Oferecemos garantia vitalícia de funcionamento e substituição imediata para qualquer conta de jogo em nossa biblioteca durante todo o período da sua assinatura.
            </p>
            <div className="bg-[#0d0e12] border border-[#1f212a] p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-amber-400">O que nossa garantia cobre:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs">
                <li>Substituição de credenciais em caso de indisponibilidade da conta pela Steam.</li>
                <li>Atualizações gratuitas de jogos e expansões oficiais.</li>
                <li>Suporte técnico prioritário para solução de problemas de login.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SafePaymentPage = () => {
  const { t } = useLanguage();
  usePageTitle(t('secure_payment') || 'Pagamento Seguro');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: t('secure_payment') || 'Pagamento Seguro' }]} />
          <Link to="/" className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-[#e60000] text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_home') || 'Voltar ao Início'}</span>
          </Link>
        </div>

        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1f212a] pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{t('secure_payment') || 'Pagamento Seguro'}</h1>
              <p className="text-xs text-gray-400">Processamento rápido, seguro e transparente via PIX e Cartão</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed">
            <p>
              Sua segurança financeira é nossa prioridade absoluta. Todos os pagamentos são intermediados por gateways de pagamento homologados no Brasil com certificação PCI-DSS.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0d0e12] border border-[#1f212a] p-4 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-400 mb-1">Aprovação Instantânea via PIX</h4>
                <p className="text-xs text-gray-400">Aprovação em poucos segundos com liberação imediata do acesso à biblioteca.</p>
              </div>
              <div className="bg-[#0d0e12] border border-[#1f212a] p-4 rounded-xl">
                <h4 className="text-xs font-bold text-blue-400 mb-1">Cartão de Crédito</h4>
                <p className="text-xs text-gray-400">Dados protegidos por tokenização sem armazenamento de números no nosso servidor.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
