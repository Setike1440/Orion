import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { Skeleton } from '../components/Skeleton';
import { ShieldCheck, Download, Gamepad2, Key, HelpCircle, CheckCircle2, ArrowLeft, Lock, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';

export const HowItWorks = () => {
  usePageTitle('Como Funciona');
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      number: '01',
      icon: Gamepad2,
      title: t('step_1_title'),
      description: t('step_1_desc')
    },
    {
      number: '02',
      icon: Key,
      title: t('step_2_title'),
      description: t('step_2_desc')
    },
    {
      number: '03',
      icon: Download,
      title: t('step_3_title'),
      description: t('step_3_desc')
    },
    {
      number: '04',
      icon: ShieldCheck,
      title: t('step_4_title'),
      description: t('step_4_desc')
    }
  ];

  const faqs = [
    {
      q: t('faq_q1'),
      a: t('faq_a1')
    },
    {
      q: t('faq_q2'),
      a: t('faq_a2')
    },
    {
      q: t('faq_q3'),
      a: t('faq_a3')
    },
    {
      q: t('faq_q4'),
      a: t('faq_a4')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Breadcrumb 
            items={[
              { label: t('how_it_works') || 'Como Funciona' }
            ]} 
          />
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-[#e60000] text-xs sm:text-sm font-semibold transition-all px-4 py-2.5 rounded-xl group cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t('back_to_menu')}</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-[#121318] border border-[#1f212a] p-8 md:p-10 shadow-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF0000]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#FF0000]/10 border border-[#FF0000]/30 px-3 py-1 rounded-full text-[#FF0000] text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('step_by_step_guide')}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-4xl font-bold text-white tracking-tight">
              {t('how_it_works_hero_title_1')} <span className="text-[#FF0000]">{t('how_it_works_hero_title_2')}</span>?
            </h1>
            
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t('how_it_works_hero_desc')}
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FF0000]" />
            <span>{t('simple_step_by_step')}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.number}
                  className="bg-[#121318] border border-[#1f212a] hover:border-[#FF0000]/40 p-6 rounded-2xl transition-all duration-200 shadow-sm group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#181920] border border-[#20222c] text-[#FF0000] flex items-center justify-center group-hover:scale-105 group-hover:border-[#FF0000]/50 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-extrabold text-gray-700/60 group-hover:text-[#FF0000]/30 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-[#FF0000] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Guarantee Box */}
        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{t('guarantee_title')}</h3>
              <p className="text-gray-400 text-xs mt-0.5">
                {t('guarantee_desc')}
              </p>
            </div>
          </div>
          
          <Link
            to="/"
            className="w-full md:w-auto text-center bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
          >
            {t('explore_games_now')}
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#FF0000]" />
            <span>{t('faq_title')}</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-[#121318] border border-[#1f212a] rounded-xl p-4 space-y-1.5 hover:border-[#FF0000]/30 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#FF0000] shrink-0" />
                  <h4>{faq.q}</h4>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
