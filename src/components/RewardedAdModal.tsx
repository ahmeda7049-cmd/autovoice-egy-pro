/**
 * Google Mobile Ads (AdMob) Rewarded Ad Modal
 * AutoVoice EGY PRO V2
 * 
 * App ID: ca-app-pub-7096879370242564~4036694688
 * Rewarded Unit ID: ca-app-pub-7096879370242564/8466894287
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';
import { ADMOB_CONFIG } from '../services/admobService';

interface RewardedAdModalProps {
  faultCode: string;
  faultTitle?: string;
  onReward: (code: string) => void;
  onClose: () => void;
  language: 'ar_eg' | 'ar_standard' | 'en';
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  faultCode,
  faultTitle,
  onReward,
  onClose,
  language,
}) => {
  const TOTAL_SECONDS = ADMOB_CONFIG.adDurationSeconds; // 15 seconds
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer for Rewarded Ad
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAdCompleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAdCompleted = () => {
    setIsCompleted(true);
    setRewardGranted(true);
    onReward(faultCode);
  };

  const handleAttemptClose = () => {
    if (isCompleted || rewardGranted) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExitEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowExitConfirm(false);
    onClose(); // Closed early: Solution remains LOCKED as required
  };

  const handleResumeAd = () => {
    setShowExitConfirm(false);
  };

  const progressPercent = Math.min(100, Math.round(((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-start">
        
        {/* Top AdMob Header Bar */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-white flex items-center gap-1">
                <span>Google AdMob</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                  Rewarded Ad
                </span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 truncate max-w-[200px] sm:max-w-none">
                Unit: {ADMOB_CONFIG.rewardedAdUnitId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Close Button */}
            <button
              onClick={handleAttemptClose}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Reward Countdown Status */}
        <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1 me-4">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 shadow-sm shadow-amber-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="shrink-0 font-mono font-bold">
            {isCompleted ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'en' ? 'Reward Unlocked!' : 'تم الحصول على المكافأة!'}
              </span>
            ) : (
              <span className="text-amber-400 text-xs">
                {language === 'en'
                  ? `Reward in: ${secondsLeft}s`
                  : `المكافأة خلال: ${secondsLeft} ثانية`}
              </span>
            )}
          </div>
        </div>

        {/* Video / Interactive Ad Player Content */}
        <div className="relative aspect-video sm:aspect-[16/10] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          
          {/* Subtle Ambient Video Visuals */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {!isCompleted ? (
            <div className="space-y-4 max-w-sm relative z-10 animate-fadeIn">
              {/* Automotive Sponsor Logo / Visual */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 via-cyan-500/20 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center shadow-xl shadow-cyan-500/10">
                <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  إعلان ممول • Automotive Diagnostic Sponsor
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  فحص وصيانة كمبيوتر السيارات الحديثة
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  احصل على حلول الأعطال الفورية وقطع الغيار الأصلية مع فحص دقيق عبر فيشة OBD2 بالبلوتوث.
                </p>
              </div>

              {/* Dynamic countdown notice */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2">
                <Play className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>
                  {language === 'en'
                    ? `Watching video ad for DTC solution: ${faultCode}`
                    : `مشاهدة فيديو الإعلان لفتح حل العطل: ${faultCode}`}
                </span>
              </div>
            </div>
          ) : (
            /* Completed / Rewarded State */
            <div className="space-y-4 max-w-sm relative z-10 animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 text-emerald-400">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-white">
                  {language === 'en' ? 'Congratulations! Solution Unlocked' : 'مبروك! تم فتح الحل بنجاح'}
                </h4>
                <p className="text-xs text-emerald-300 font-medium">
                  {language === 'en'
                    ? `The recommended repair solution for trouble code ${faultCode} is now revealed in your diagnostic card.`
                    : `تم فتح خانة الحل المقترح لكود العطل (${faultCode}) بالكامل، يمكنك الآن قراءته وتطبيقه.`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'en' ? 'View Solution Now' : 'مشاهدة الحل الآن'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>AdMob Rewarded Video Unit</span>
          <span className="font-mono text-slate-500">App ID: ...694688</span>
        </div>

        {/* Early Exit Confirmation Warning Modal */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h5 className="text-sm font-bold text-white">
                  {language === 'en' ? 'Close ad early?' : 'هل تريد إغلاق الإعلان الآن؟'}
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'en'
                    ? 'If you exit now, the solution will remain locked and no reward will be given.'
                    : 'إذا أغلقت الإعلان قبل نهايته، فلن تحصل على المكافأة وسيظل حل العطل مقفولاً كما هو.'}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {/* Button to resume and keep watching */}
                <button
                  onClick={handleResumeAd}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
                >
                  {language === 'en' ? 'Continue Watching (Get Solution)' : 'متابعة المشاهدة (للحصول على الحل)'}
                </button>

                {/* Button to exit early and lose reward */}
                <button
                  onClick={handleConfirmExitEarly}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  {language === 'en' ? 'Exit Early (Keep Locked)' : 'إغلاق الإعلان وخسارة الحل'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
