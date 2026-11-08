/**
 * AutoVoice EGY PRO V2 - Splash Screen
 * Displays branded stethoscope & engine logo with smooth diagnostic initialization
 */

import React, { useEffect, useState } from 'react';
import { AppLanguage } from '../database/types';
import { Stethoscope, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  language: AppLanguage;
  onFinish: () => void;
  totalCodes: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ language, onFinish, totalCodes }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState(
    language === 'en'
      ? 'Initializing diagnostic engine...'
      : language === 'ar_standard'
      ? 'جاري تهيئة محرك الفحص التشخيصي...'
      : 'جاري تهيئة محرك الفحص الذكي...'
  );
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1
    const t1 = setTimeout(() => {
      setProgress(55);
      setStatusText(
        language === 'en'
          ? `Loading ${totalCodes}+ verified trouble codes (P, C, B, U)...`
          : language === 'ar_standard'
          ? `تحميل أكثر من ${totalCodes} رمز عطل موثق (P, C, B, U)...`
          : `تحميل أكتر من ${totalCodes} كود عطل مصري ومعتمد...`
      );
    }, 400);

    // Stage 2
    const t2 = setTimeout(() => {
      setProgress(90);
      setStatusText(
        language === 'en'
          ? 'Bluetooth OBD2 & ELM327 ready ⚡'
          : language === 'ar_standard'
          ? 'محول البلوتوث OBD2 جاهز للاتصال ⚡'
          : 'فيشة البلوتوث ELM327 جاهزة للتوصيل ⚡'
      );
    }, 900);

    // Stage 3 - Complete & Fade
    const t3 = setTimeout(() => {
      setProgress(100);
      setIsFadingOut(true);
    }, 1400);

    // Stage 4 - Unmount
    const t4 = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [language, onFinish, totalCodes]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none transition-opacity duration-400 cursor-pointer overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #0f1c3f 0%, #060913 70%, #02040a 100%)',
      }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none -top-10 -right-10 animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none -bottom-10 -left-10 animate-pulse" />

      {/* Main Container */}
      <div className="flex flex-col items-center text-center max-w-sm w-full space-y-6 relative z-10 animate-fadeIn">
        
        {/* Glowing Logo Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse-glow" />
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-cyan-400/40 bg-slate-900 shadow-2xl flex items-center justify-center p-0.5">
            <img
              src="/logo.png"
              alt="AutoVoice EGY PRO"
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>
        </div>

        {/* App Title & Version Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              AutoVoice EGY PRO
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              V2 PRO EDITION
            </span>
            <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-mono">
              OBD2 & ELM327
            </span>
          </div>

          <p className="text-xs text-slate-400 pt-1 font-medium">
            {language === 'en'
              ? 'Doctor for your car • Bluetooth Voice Diagnostics'
              : language === 'ar_standard'
              ? 'طبيب سيارتك الذكي • فحص أعطال وتشخيص صوتي'
              : 'دكتور عربيتك الذكي • كشف أعطال وتشخيص صوتي مصري'}
          </p>
        </div>

        {/* Progress Bar & Diagnostic Initialization Status */}
        <div className="w-full space-y-2.5 pt-2">
          <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1.5 truncate max-w-[240px]">
              {progress === 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Stethoscope className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              )}
              <span className="truncate">{statusText}</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold shrink-0">{progress}%</span>
          </div>
        </div>

        {/* Skip button prompt */}
        <div className="pt-2 text-[10px] text-slate-500 hover:text-slate-300 transition">
          {language === 'en' ? 'Tap anywhere to start' : 'اضغط في أي مكان للدخول مباشرة'}
        </div>
      </div>
    </div>
  );
};
