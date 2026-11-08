/**
 * AutoVoice EGY PRO V2
 * Modern, Professional OBD2 & ELM327 Automotive Diagnostics
 * 3-Language Multi-Dialect Engine:
 * - 🇪🇬 Egyptian Arabic (العربي المصري الفني)
 * - 🇸🇦 Standard Arabic (العربي الفصيح)
 * - 🇬🇧 English (International Technical OBD2)
 * 
 * @license Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Bluetooth, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Trash2, 
  Thermometer, 
  Gauge, 
  Wind, 
  ShieldCheck, 
  ClipboardList, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Check, 
  FileText,
  AlertTriangle,
  Share2,
  Copy,
  Send,
  X,
  WifiOff,
  Download,
  Smartphone,
  Zap,
  Package,
  ExternalLink,
  Search,
  BookOpen,
  Languages,
  Globe,
  ChevronDown,
  ChevronUp,
  Layers,
  Car,
  Info
} from 'lucide-react';
import { ConnectionStatus, DTCFault, EngineVitals, ScanReport } from './types/obd';
import { obdService } from './services/bluetoothOBD';
import { voiceAssistant } from './services/voiceAssistant';
import { reportStorage } from './services/reportStorage';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { dtcManager } from './database/dtcManager';
import { DTCDefinition, DTCCategory, DTCManufacturer, AppLanguage, LocalizedDTC } from './database/types';
import { detectDeviceHardware, DeviceHardwareStatus } from './services/hardwareCompatibility';
import { I18N_DICTIONARY, UIStrings } from './services/i18n';
import { SplashScreen } from './components/SplashScreen';

const LANGUAGE_STORAGE_KEY = 'autovoice_app_language';

export default function App() {
  // Language State: 'ar_eg' (Egyptian), 'ar_standard' (Standard Arabic), 'en' (English)
  const [language, setLanguage] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage;
      if (saved && (saved === 'ar_eg' || saved === 'ar_standard' || saved === 'en')) {
        return saved;
      }
    }
    return 'ar_eg';
  });

  const t: UIStrings = useMemo(() => I18N_DICTIONARY[language], [language]);

  const [status, setStatus] = useState<ConnectionStatus>(obdService.getStatus());
  const [statusMessage, setStatusMessage] = useState<string>(obdService.getStatusMessage());
  const [faults, setFaults] = useState<DTCFault[]>([]);
  const [vitals, setVitals] = useState<EngineVitals>(obdService.getVitals());
  
  const [isScanning, setIsScanning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Navigation: 'current' (Live OBD2), 'encyclopedia' (DTC Lookup), 'history' (Saved Reports)
  const [activeTab, setActiveTab] = useState<'current' | 'encyclopedia' | 'history'>('current');
  const [savedReports, setSavedReports] = useState<ScanReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ScanReport | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Modals state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // DTC Encyclopedia Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DTCCategory | 'all'>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<DTCManufacturer | 'all'>('all');
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState<number>(30);

  const toggleCodeExpanded = (code: string) => {
    setExpandedCodes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // PWA Offline and Install State
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const hardwareStatus: DeviceHardwareStatus = useMemo(() => detectDeviceHardware(), []);
  const dbVersion = useMemo(() => dtcManager.getVersionInfo(), []);

  // Update voice language when language changes
  useEffect(() => {
    voiceAssistant.setLanguage(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.dir = t.dir;
      document.documentElement.lang = language === 'en' ? 'en' : 'ar';
    }
  }, [language, t.dir]);

  useEffect(() => {
    // Load saved inspection reports from localStorage
    const stored = reportStorage.getReports();
    setSavedReports(stored);

    // Subscribe to OBD2 events
    const unsubStatus = obdService.onStatus((s, msg) => {
      setStatus(s);
      if (msg) setStatusMessage(msg);
    });

    const unsubFaults = obdService.onFaults((f) => {
      setFaults(f);
    });

    const unsubVitals = obdService.onVitals((v) => {
      setVitals(v);
    });

    return () => {
      unsubStatus();
      unsubFaults();
      unsubVitals();
    };
  }, []);

  // Filtered encyclopedia results
  const encyclopediaResults = useMemo(() => {
    return dtcManager.search(searchQuery, {
      category: selectedCategory,
      manufacturer: selectedManufacturer
    });
  }, [searchQuery, selectedCategory, selectedManufacturer]);

  const handleConnect = async () => {
    await obdService.connect();
  };

  const handleConnectDemo = async () => {
    await obdService.connectDemo();
  };

  const handleDisconnect = () => {
    obdService.disconnect();
    setHasScanned(false);
  };

  const handleScanFaults = async () => {
    setIsScanning(true);
    setHasScanned(true);
    voiceAssistant.playChime('warning');
    voiceAssistant.speak(t.voiceScanningNotice);

    try {
      const scannedFaults = await obdService.scanFaults();

      // Automatically create and save inspection report into localStorage
      const now = new Date();
      const locale = language === 'en' ? 'en-US' : 'ar-EG';
      const formattedDate = new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(now);

      const newReport: ScanReport = {
        id: `scan_${Date.now()}`,
        createdAt: now.toISOString(),
        formattedDate,
        faults: scannedFaults,
        vitals: {
          rpm: vitals.rpm.value,
          coolant: vitals.coolantTemp.value,
          pressure: vitals.intakePressure.value,
        },
        status: scannedFaults.length === 0 ? 'healthy' : 'issues',
      };

      const updated = reportStorage.saveReport(newReport);
      setSavedReports(updated);
      setSavedNotice(t.autoSaveToast);
      setTimeout(() => setSavedNotice(null), 4000);

      // Voice announcements in selected language
      if (scannedFaults.length === 0) {
        voiceAssistant.playChime('success');
        voiceAssistant.speak(t.voiceHealthyNotice);
      } else {
        voiceAssistant.playChime('warning');
        const first = scannedFaults[0];
        const localized = dtcManager.resolveLocalizedDTC(first.code, language);
        if (language === 'en') {
          voiceAssistant.speak(`${t.voiceFaultIntroNotice} ${localized.code}. Issue: ${localized.problem}. Solution: ${localized.solution}`);
        } else if (language === 'ar_standard') {
          voiceAssistant.speak(`${t.voiceFaultIntroNotice} ${localized.code}. المشكلة: ${localized.problem}. الحل المقترح: ${localized.solution}`);
        } else {
          voiceAssistant.speak(`${t.voiceFaultIntroNotice} ${localized.code}. المشكلة: ${localized.problem}. الحل: ${localized.solution}`);
        }
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearFaults = async () => {
    setIsClearing(true);
    try {
      await obdService.clearFaults();
    } finally {
      setIsClearing(false);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) return;
    }
    setShowInstallModal(true);
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return 'https://ais-pre-wfojgdlv64xg5pfcqqmj6s-92334257386.europe-west2.run.app';
  };

  const handleShareClick = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.appName,
          text: language === 'en' 
            ? 'Scan your car diagnostics with Bluetooth OBD2 for free with audio voice readout:' 
            : 'افحص سيارتك بالبلوتوث مجاناً عبر الهاتف مع تشخيص صوتي دقيق:',
          url,
        });
        return;
      } catch {
        // user dismissed
      }
    }
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const msg = encodeURIComponent(`${t.appName}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceAssistant.setEnabled(next);
    if (next) {
      voiceAssistant.speak(t.voiceEnabledNotice);
    }
  };

  const handleSpeakFaultLocalized = (code: string) => {
    const localized = dtcManager.resolveLocalizedDTC(code, language);
    voiceAssistant.playChime('warning');
    if (language === 'en') {
      voiceAssistant.speak(`Code ${localized.code}. ${localized.title}. Issue: ${localized.problem}. Recommended fix: ${localized.solution}.`, true);
    } else if (language === 'ar_standard') {
      voiceAssistant.speak(`رمز العطل ${localized.code}. ${localized.title}. المشكلة: ${localized.problem}. الإجراء الموصى به: ${localized.solution}.`, true);
    } else {
      voiceAssistant.speak(`كود ${localized.code}. ${localized.title}. المشكلة بالمصري: ${localized.problem}. والحل: ${localized.solution}.`, true);
    }
  };

  const handleSpeakReport = (report: ScanReport) => {
    if (report.faults.length === 0) {
      voiceAssistant.playChime('success');
      voiceAssistant.speak(t.voiceHealthyNotice);
    } else {
      voiceAssistant.playChime('warning');
      const countText = language === 'en' 
        ? `Diagnostic report contains ${report.faults.length} recorded fault codes.`
        : `تقرير الفحص يحتوي على ${report.faults.length} عطل.`;
      
      const faultTexts = report.faults
        .map((f, i) => {
          const loc = dtcManager.resolveLocalizedDTC(f.code, language);
          return language === 'en'
            ? `Fault ${i + 1}: Code ${loc.code}, ${loc.problem}. Solution: ${loc.solution}.`
            : `العطل ${i + 1}: كود ${loc.code}، المشكلة: ${loc.problem}، والحل: ${loc.solution}.`;
        })
        .join(' ');
      voiceAssistant.speak(`${countText} ${faultTexts}`, true);
    }
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reportStorage.deleteReport(id);
    setSavedReports(updated);
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(null);
    }
  };

  const handleClearAllHistory = () => {
    const confirmMsg = language === 'en' 
      ? 'Are you sure you want to clear all inspection reports from local storage?'
      : 'هل أنت متأكد من مسح جميع تقارير الفحص السابقة من الذاكرة؟';
    if (window.confirm(confirmMsg)) {
      reportStorage.clearAllReports();
      setSavedReports([]);
      setSelectedReport(null);
    }
  };

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isError = status === 'error';

  return (
    <div 
      dir={t.dir}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white pb-14"
    >
      {/* Launch Splash Screen */}
      {showSplash && (
        <SplashScreen
          language={language}
          onFinish={() => setShowSplash(false)}
          totalCodes={dbVersion.totalCodes}
        />
      )}

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/20 shrink-0 bg-slate-900 group relative">
              <img
                src="/logo.png"
                alt="AutoVoice EGY PRO"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {t.appName}
                </h1>
                <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  V2
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-cyan-400 border border-slate-700 px-2 py-0.5 rounded-md font-mono">
                  v{dbVersion.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[210px] sm:max-w-none">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Language Selector + Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            {/* 3-Language Segmented Switcher */}
            <div className="bg-slate-950 border border-slate-800 p-0.5 rounded-xl flex items-center gap-0.5 shadow-inner">
              <button
                onClick={() => setLanguage('ar_eg')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  language === 'ar_eg'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="العربي المصري"
              >
                <span>🇪🇬</span>
                <span className="hidden xs:inline">مصري</span>
              </button>

              <button
                onClick={() => setLanguage('ar_standard')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  language === 'ar_standard'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="العربي الفصيح"
              >
                <span>🇸🇦</span>
                <span className="hidden xs:inline">فصحى</span>
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="hidden xs:inline">EN</span>
              </button>
            </div>

            {/* Device Compatibility Guide */}
            <button
              onClick={() => setShowHardwareModal(true)}
              className="p-2 sm:px-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-bold"
              title={t.btnHardware}
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">{t.btnHardware}</span>
            </button>

            {/* Offline PWA Install Button */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="p-2 sm:px-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold shadow-sm"
                title={t.btnInstallOffline}
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">{t.btnInstallOffline}</span>
              </button>
            )}

            {/* APK Download Button */}
            <button
              onClick={() => setShowApkModal(true)}
              className="p-2 sm:px-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold shadow-sm"
              title={t.btnDownloadApk}
            >
              <Package className="w-4 h-4" />
              <span className="hidden lg:inline">{t.btnDownloadApk}</span>
            </button>

            {/* Share App Button */}
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition cursor-pointer text-xs font-bold"
              title={t.btnShare}
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Voice Assistant Toggle */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                voiceEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={voiceEnabled ? t.btnVoiceActive : t.btnVoiceMuted}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto px-4 pt-1 flex gap-1 border-t border-slate-800/60">
          {/* Tab 1: Live Diagnostic */}
          <button
            onClick={() => {
              setActiveTab('current');
              setSelectedReport(null);
            }}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'current'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t.tabLive}</span>
          </button>

          {/* Tab 2: DTC Encyclopedia & Lookup */}
          <button
            onClick={() => {
              setActiveTab('encyclopedia');
              setSelectedReport(null);
            }}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'encyclopedia'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.tabEncyclopedia}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-amber-300 rounded-md font-mono hidden sm:inline">
              {dbVersion.totalCodes}
            </span>
          </button>

          {/* Tab 3: Saved History Reports */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t.tabHistory}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              savedReports.length > 0
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {savedReports.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-5 flex-1 space-y-5">

        {/* Offline Status Alert if disconnected from web */}
        {!isOnline && (
          <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.offlineBanner}</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md shrink-0">
              {t.offlineDirectBleBadge}
            </span>
          </div>
        )}

        {/* Auto-Save Toast Notification */}
        {savedNotice && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{savedNotice}</span>
            </div>
            <button
              onClick={() => {
                setActiveTab('history');
                setSavedNotice(null);
              }}
              className="text-xs text-emerald-200 underline hover:text-white cursor-pointer mr-3"
            >
              {t.viewHistory}
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: CURRENT LIVE OBD2 SCAN SCREEN                     */}
        {/* ========================================================= */}
        {activeTab === 'current' && (
          <div className="space-y-5">
            {/* TOP: ONE BIG CARD SHOWS CONNECTION STATUS WITH ONE BUTTON [اتصال] */}
            <div className={`rounded-3xl p-6 sm:p-7 border transition-all shadow-2xl relative overflow-hidden ${
              isConnected
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-emerald-500/40 shadow-emerald-950/20'
                : isConnecting
                ? 'bg-slate-900 border-amber-500/40 shadow-amber-950/20 animate-pulse'
                : isError
                ? 'bg-gradient-to-br from-slate-900 to-red-950/50 border-red-500/50 shadow-red-950/20'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-start">
                
                {/* Status Icon & Text */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isConnected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/25'
                      : isConnecting
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : isError
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {isConnected ? (
                      <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    ) : isConnecting ? (
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    ) : isError ? (
                      <AlertCircle className="w-8 h-8" />
                    ) : (
                      <Bluetooth className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {t.dongleStatusTitle}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {isConnected
                        ? t.statusConnected
                        : isConnecting
                        ? t.statusConnecting
                        : isError
                        ? t.statusError
                        : t.statusDisconnected}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed max-w-md">
                      {isConnected
                        ? t.statusConnectedDesc
                        : isConnecting
                        ? t.statusConnectingDesc
                        : isError
                        ? t.statusErrorDesc
                        : t.statusDisconnectedDesc}
                    </p>
                  </div>
                </div>

                {/* ONE BIG BUTTON: [اتصال] or [قطع الاتصال] */}
                <div className="shrink-0 w-full sm:w-auto flex flex-col gap-2">
                  {isConnected ? (
                    <button
                      onClick={handleDisconnect}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-red-950/80 hover:text-red-300 hover:border-red-500/50 text-slate-300 border border-slate-700 text-sm font-bold transition cursor-pointer"
                    >
                      {t.btnDisconnect}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-base font-black transition shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transform active:scale-95"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>{t.btnScanning}</span>
                        </>
                      ) : (
                        <>
                          <Bluetooth className="w-5 h-5" />
                          <span>{t.btnConnect}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Demo test helper */}
                  {!isConnected && !isConnecting && (
                    <button
                      onClick={handleConnectDemo}
                      className="text-[11px] text-slate-500 hover:text-cyan-400 text-center transition underline cursor-pointer mt-1"
                    >
                      {t.btnDemo}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3 IMPORTANT PIDS FILTER (RPM, Coolant Temp, Intake Pressure) */}
            {isConnected && (
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {t.vitalsTitle}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md font-mono">
                    {t.vitalsLiveBadge}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* RPM (010C) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t.rpmLabel}</span>
                    </div>
                    <span className={`text-lg font-black font-mono ${vitals.rpm.isSupported ? 'text-white' : 'text-amber-400 text-xs'}`}>
                      {vitals.rpm.isSupported ? vitals.rpm.value : t.notSupported}
                    </span>
                  </div>

                  {/* Coolant Temp (0105) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-400" />
                      <span>{t.coolantLabel}</span>
                    </div>
                    <span className={`text-lg font-black font-mono ${vitals.coolantTemp.isSupported ? 'text-white' : 'text-amber-400 text-xs'}`}>
                      {vitals.coolantTemp.isSupported ? vitals.coolantTemp.value : t.notSupported}
                    </span>
                  </div>

                  {/* Intake Pressure (010B) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Wind className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.pressureLabel}</span>
                    </div>
                    <span className={`text-lg font-black font-mono ${vitals.intakePressure.isSupported ? 'text-white' : 'text-amber-400 text-xs'}`}>
                      {vitals.intakePressure.isSupported ? vitals.intakePressure.value : t.notSupported}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MIDDLE: IF CONNECTED, SHOW 2 BIG BUTTONS: [افحص الأعطال] and [امسح الأعطال] */}
            {isConnected ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Button 1: [افحص الأعطال] */}
                <button
                  onClick={handleScanFaults}
                  disabled={isScanning}
                  className="py-5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-3 transition cursor-pointer transform active:scale-[0.98] disabled:opacity-50"
                >
                  <Stethoscope className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? t.btnScanningFaults : t.btnScanFaults}</span>
                </button>

                {/* Button 2: [امسح الأعطال] */}
                <button
                  onClick={handleClearFaults}
                  disabled={isClearing}
                  className="py-5 px-6 rounded-2xl bg-slate-800 hover:bg-red-900/60 text-slate-200 hover:text-white border border-slate-700 hover:border-red-500/50 font-black text-lg shadow-xl flex items-center justify-center gap-3 transition cursor-pointer transform active:scale-[0.98] disabled:opacity-50"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <span>{isClearing ? t.btnClearingFaults : t.btnClearFaults}</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs sm:text-sm leading-relaxed">
                💡 {t.dongleStatusTitle}: {t.statusDisconnectedDesc}
              </div>
            )}

            {/* BOTTOM: LIST OF FAULTS IN BIG WHITE CARDS */}
            {hasScanned && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                    <span>{t.reportTitle}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      {t.savedInHistoryBadge}
                    </span>
                    <span className="text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      {faults.length === 0 
                        ? (language === 'en' ? 'Healthy' : 'سليمة تماماً') 
                        : `${faults.length} ${language === 'en' ? 'DTCs' : 'أعطال'}`}
                    </span>
                  </div>
                </div>

                {faults.length === 0 ? (
                  /* Clean healthy card */
                  <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-r-8 border-emerald-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {t.noFaultsFoundTitle}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1.5">
                          {t.noFaultsFoundProblem}
                        </h4>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">
                          {t.noFaultsFoundSolution}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List of Faults formatted as Big White Cards */
                  <div className="space-y-3.5">
                    {faults.map((fault) => {
                      const loc = dtcManager.resolveLocalizedDTC(fault.code, language);
                      return (
                        <div
                          key={fault.code}
                          className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-r-8 border-red-500 hover:shadow-cyan-500/10 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              {/* Header chip */}
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-mono text-sm font-black bg-slate-950 text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-800">
                                  {loc.title}
                                </span>
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                  {t.faultCodeLabel}: {loc.code}
                                </span>
                              </div>

                              {/* Problem */}
                              <div className="text-base sm:text-lg font-black text-slate-950 mt-1">
                                {t.problemLabel}: <span className="text-red-600">{loc.problem}</span>
                              </div>

                              {/* Solution */}
                              <div className="text-sm sm:text-base font-bold text-emerald-800 mt-1.5 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                                {t.solutionLabel}: <span>{loc.solution}</span>
                              </div>
                            </div>

                            {/* Voice Button */}
                            <button
                              onClick={() => handleSpeakFaultLocalized(fault.code)}
                              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
                              title={t.btnSpeakDiagnosis}
                            >
                              <Volume2 className="w-4 h-4 text-cyan-400" />
                              <span>{t.btnSpeakDiagnosis}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Diagnostic Test Chips */}
            {isConnected && (
              <div className="pt-2 border-t border-slate-900 text-center">
                <span className="text-[11px] text-slate-500 block mb-2">
                  {t.quickTestTitle}
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    onClick={() => obdService.injectTestFault('P0301')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + P0301
                  </button>
                  <button
                    onClick={() => obdService.injectTestFault('P0115')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + P0115
                  </button>
                  <button
                    onClick={() => obdService.injectTestFault('P0420')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + P0420
                  </button>
                  <button
                    onClick={() => obdService.injectTestFault('P0335')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + P0335
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DTC ENCYCLOPEDIA & ADVANCED SEARCH                 */}
        {/* ========================================================= */}
        {activeTab === 'encyclopedia' && (
          <div className="space-y-4">
            
            {/* Real Statistics & Coverage Header Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>{t.encyclopediaTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {t.encyclopediaSubtitle}
                  </p>
                </div>
                
                {/* Real Verified Count Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <div className="bg-slate-950 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {dbVersion.totalCodes} {t.statsRealCountLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real Category Breakdown Cards (P, C, B, U) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* Powertrain (P) */}
                <button
                  onClick={() => setSelectedCategory(selectedCategory === 'powertrain' ? 'all' : 'powertrain')}
                  className={`p-3 rounded-2xl border text-start transition cursor-pointer ${
                    selectedCategory === 'powertrain'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-amber-400">P</span>
                    <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-white">
                      {dbVersion.categoryStats.powertrain}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mt-1 text-slate-300">
                    {t.catPowertrain}
                  </div>
                </button>

                {/* Chassis (C) */}
                <button
                  onClick={() => setSelectedCategory(selectedCategory === 'chassis' ? 'all' : 'chassis')}
                  className={`p-3 rounded-2xl border text-start transition cursor-pointer ${
                    selectedCategory === 'chassis'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-cyan-400">C</span>
                    <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-white">
                      {dbVersion.categoryStats.chassis}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mt-1 text-slate-300">
                    {t.catChassis}
                  </div>
                </button>

                {/* Body (B) */}
                <button
                  onClick={() => setSelectedCategory(selectedCategory === 'body' ? 'all' : 'body')}
                  className={`p-3 rounded-2xl border text-start transition cursor-pointer ${
                    selectedCategory === 'body'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-purple-400">B</span>
                    <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-white">
                      {dbVersion.categoryStats.body}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mt-1 text-slate-300">
                    {t.catBody}
                  </div>
                </button>

                {/* Network (U) */}
                <button
                  onClick={() => setSelectedCategory(selectedCategory === 'network' ? 'all' : 'network')}
                  className={`p-3 rounded-2xl border text-start transition cursor-pointer ${
                    selectedCategory === 'network'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-emerald-400">U</span>
                    <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-white">
                      {dbVersion.categoryStats.network}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mt-1 text-slate-300">
                    {t.catNetwork}
                  </div>
                </button>
              </div>

              {/* Coverage Transparency Note */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-start gap-2.5 text-slate-400 text-[11px] leading-relaxed">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t.statsCoverageDisclaimer}</span>
              </div>
            </div>

            {/* Search Input & Dual Filter Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
              
              {/* Search input */}
              <div className="relative">
                <Search className={`w-4 h-4 text-slate-400 absolute ${t.dir === 'rtl' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(30);
                  }}
                  placeholder={t.searchPlaceholder}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl ${t.dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/60 transition`}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setVisibleCount(30);
                    }}
                    className={`absolute ${t.dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer`}
                  >
                    {language === 'en' ? 'Clear' : 'مسح'}
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] font-bold me-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.categoryLabel}</span>
                </span>
                
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setVisibleCount(30);
                  }}
                  className={`px-3 py-1 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.catAll}
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('powertrain');
                    setVisibleCount(30);
                  }}
                  className={`px-3 py-1 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                    selectedCategory === 'powertrain'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  P ({dbVersion.categoryStats.powertrain})
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('chassis');
                    setVisibleCount(30);
                  }}
                  className={`px-3 py-1 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                    selectedCategory === 'chassis'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  C ({dbVersion.categoryStats.chassis})
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('body');
                    setVisibleCount(30);
                  }}
                  className={`px-3 py-1 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                    selectedCategory === 'body'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  B ({dbVersion.categoryStats.body})
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('network');
                    setVisibleCount(30);
                  }}
                  className={`px-3 py-1 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                    selectedCategory === 'network'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  U ({dbVersion.categoryStats.network})
                </button>
              </div>

              {/* Manufacturer Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px] font-bold me-1 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.mfgFilterLabel}</span>
                </span>

                <button
                  onClick={() => {
                    setSelectedManufacturer('all');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgAll}
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('generic');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'generic'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgGeneric} ({dbVersion.manufacturerStats.generic})
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('hyundai_kia');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'hyundai_kia'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgHyundaiKia} ({dbVersion.manufacturerStats.hyundai_kia})
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('toyota');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'toyota'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgToyota} ({dbVersion.manufacturerStats.toyota})
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('nissan');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'nissan'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgNissan} ({dbVersion.manufacturerStats.nissan})
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('chevrolet_opel');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'chevrolet_opel'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgChevroletOpel} ({dbVersion.manufacturerStats.chevrolet_opel})
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('ford');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'ford'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgFord} ({dbVersion.manufacturerStats.ford})
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('volkswagen_skoda');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'volkswagen_skoda'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgVolkswagenSkoda} ({dbVersion.manufacturerStats.volkswagen_skoda})
                </button>
                <button
                  onClick={() => {
                    setSelectedManufacturer('renault');
                    setVisibleCount(30);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                    selectedManufacturer === 'renault'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.mfgRenault} ({dbVersion.manufacturerStats.renault})
                </button>
              </div>
            </div>

            {/* Results Count Summary */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span>
                {t.showingCodesText
                  .replace('{shown}', String(Math.min(visibleCount, encyclopediaResults.length)))
                  .replace('{total}', String(encyclopediaResults.length))}
              </span>
              <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {selectedCategory !== 'all' ? selectedCategory.toUpperCase() : 'ALL'} / {selectedManufacturer}
              </span>
            </div>

            {/* Encyclopedia DTC Cards List */}
            <div className="space-y-3.5">
              {encyclopediaResults.length === 0 ? (
                <div className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 text-center space-y-2">
                  <p className="text-sm font-bold text-white">{t.noResults}</p>
                  <p className="text-xs text-slate-500">
                    {language === 'en'
                      ? 'Try searching with a broader term or switch category filters.'
                      : 'جرب البحث بكلمة عامة أو قم بتغيير فلاتر المجموعات والشركات.'}
                  </p>
                </div>
              ) : (
                encyclopediaResults.slice(0, visibleCount).map((item) => {
                  const loc = dtcManager.resolveLocalizedDTC(item.code, language);
                  const isExpanded = !!expandedCodes[item.code];

                  return (
                    <div
                      key={item.code}
                      className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border-r-8 border-amber-500 hover:shadow-cyan-500/10 transition space-y-3"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          
                          {/* Code, Title, Category and Manufacturer Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm sm:text-base font-black bg-slate-950 text-amber-400 px-3 py-1 rounded-xl border border-slate-800 shadow-sm">
                              {loc.code}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">
                              {loc.title}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {item.category}
                            </span>
                            {item.manufacturer !== 'generic' && (
                              <span className="text-[10px] font-bold text-cyan-900 bg-cyan-100 px-2.5 py-0.5 rounded-md border border-cyan-200">
                                {item.manufacturer.replace('_', ' / ')}
                              </span>
                            )}
                          </div>

                          {/* Problem Line */}
                          <div className="text-base font-black text-slate-950 pt-1">
                            {t.problemLabel}: <span className="text-red-600 font-extrabold">{loc.problem}</span>
                          </div>

                          {/* Recommended Solution Line */}
                          <div className="text-sm font-bold text-emerald-800 bg-emerald-50/90 p-2.5 rounded-2xl border border-emerald-200">
                            {t.solutionLabel}: <span className="font-semibold text-slate-900">{loc.solution}</span>
                          </div>
                        </div>

                        {/* Audio Pronunciation Button */}
                        <div className="flex sm:flex-col items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleSpeakFaultLocalized(item.code)}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                            title={t.btnSpeakFault}
                          >
                            <Volume2 className="w-4 h-4 text-amber-400" />
                            <span>{t.btnSpeakFault}</span>
                          </button>

                          {/* Details Toggle Button */}
                          <button
                            onClick={() => toggleCodeExpanded(item.code)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>{t.btnToggleDetails}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Diagnostic Deep-Dive (Causes & Symptoms) */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
                          {/* Common Symptoms */}
                          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 space-y-1.5">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{t.symptomsLabel}</span>
                            </div>
                            <ul className="space-y-1 ps-1 text-slate-700 text-[11px] font-medium">
                              {loc.symptoms && loc.symptoms.length > 0 ? (
                                loc.symptoms.map((s, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>{s}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-500 italic">
                                  {language === 'en' ? 'Warning light active' : 'إضاءة لمبة الأعطال في التابلوه'}
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Probable Causes */}
                          <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-2xl p-3 space-y-1.5">
                            <div className="font-bold text-cyan-900 flex items-center gap-1.5 text-xs">
                              <Search className="w-3.5 h-3.5 text-cyan-600" />
                              <span>{t.causesLabel}</span>
                            </div>
                            <ul className="space-y-1 ps-1 text-slate-700 text-[11px] font-medium">
                              {loc.causes && loc.causes.length > 0 ? (
                                loc.causes.map((c, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-cyan-500 font-bold">•</span>
                                    <span>{c}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-500 italic">
                                  {language === 'en' ? 'Harness or component failure' : 'تلف في الفيشة أو المكون الإلكتروني'}
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Load More Pagination Button */}
            {encyclopediaResults.length > visibleCount && (
              <div className="text-center pt-2 pb-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40 text-xs sm:text-sm font-bold transition shadow-lg cursor-pointer inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>{t.loadMoreCodes} (+30)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SAVED REPORTS HISTORY                              */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {selectedReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-bold flex items-center gap-2 border border-slate-800 transition cursor-pointer"
                  >
                    <ArrowRight className={`w-4 h-4 ${t.dir === 'rtl' ? '' : 'rotate-180'}`} />
                    <span>{t.btnBackToHistory}</span>
                  </button>

                  <button
                    onClick={() => handleSpeakReport(selectedReport)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>{t.btnSpeakReport}</span>
                  </button>
                </div>

                {/* Report Info Banner */}
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{t.historyReportTitle}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                          selectedReport.status === 'healthy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {selectedReport.status === 'healthy' 
                            ? (language === 'en' ? 'Healthy' : 'سليمة تماماً') 
                            : `${selectedReport.faults.length} ${language === 'en' ? 'Faults' : 'أعطال'}`}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{selectedReport.formattedDate}</span>
                      </p>
                    </div>
                  </div>

                  {selectedReport.vitals && (
                    <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400">{t.vitalsSnapshot}</span>
                      <span className="font-mono text-cyan-400">{selectedReport.vitals.rpm}</span>
                      <span className="text-slate-600">|</span>
                      <span className="font-mono text-red-400">{selectedReport.vitals.coolant}</span>
                    </div>
                  )}
                </div>

                {/* Report Faults in Big White Doctor Cards */}
                {selectedReport.faults.length === 0 ? (
                  <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-r-8 border-emerald-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {t.noFaultsFoundTitle}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1.5">
                          {t.noFaultsFoundProblem}
                        </h4>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">
                          {t.noFaultsFoundSolution}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {selectedReport.faults.map((fault) => {
                      const loc = dtcManager.resolveLocalizedDTC(fault.code, language);
                      return (
                        <div
                          key={fault.code}
                          className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-r-8 border-red-500"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-mono text-sm font-black bg-slate-950 text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-800">
                                  {loc.title}
                                </span>
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                  {t.faultCodeLabel}: {loc.code}
                                </span>
                              </div>

                              <div className="text-base sm:text-lg font-black text-slate-950 mt-1">
                                {t.problemLabel}: <span className="text-red-600">{loc.problem}</span>
                              </div>

                              <div className="text-sm sm:text-base font-bold text-emerald-800 mt-1.5 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                                {t.solutionLabel}: <span>{loc.solution}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleSpeakFaultLocalized(fault.code)}
                              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
                            >
                              <Volume2 className="w-4 h-4 text-cyan-400" />
                              <span>{t.btnSpeakDiagnosis}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Saved Reports List */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-cyan-400" />
                      <span>{t.historyTitle} ({savedReports.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.historySubtitle}
                    </p>
                  </div>

                  {savedReports.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs font-bold flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.btnClearHistory}</span>
                    </button>
                  )}
                </div>

                {savedReports.length === 0 ? (
                  <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-white">{t.noHistoryTitle}</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {t.noHistoryDesc}
                    </p>
                    <button
                      onClick={() => setActiveTab('current')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{t.btnStartNewScan}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedReports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className="bg-slate-900 hover:bg-slate-850 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-lg group relative"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              report.status === 'healthy'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                              {report.status === 'healthy' ? (
                                <ShieldCheck className="w-6 h-6" />
                              ) : (
                                <AlertTriangle className="w-6 h-6" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-400 transition">
                                  {report.status === 'healthy' 
                                    ? (language === 'en' ? 'Inspection: Vehicle Healthy' : 'فحص: السيارة سليمة تماماً') 
                                    : (language === 'en' ? `Inspection: ${report.faults.length} DTCs Detected` : `فحص: تم اكتشاف ${report.faults.length} عطل`)}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  report.status === 'healthy'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}>
                                  {report.status === 'healthy' ? (language === 'en' ? 'OK' : 'سليم') : `${report.faults.length}`}
                                </span>
                              </div>

                              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>{report.formattedDate}</span>
                              </p>

                              {report.faults.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {report.faults.slice(0, 3).map((f) => (
                                    <span key={f.code} className="text-[11px] font-mono bg-slate-950 text-cyan-300 px-2 py-0.5 rounded border border-slate-800">
                                      {f.code}
                                    </span>
                                  ))}
                                  {report.faults.length > 3 && (
                                    <span className="text-[10px] text-slate-500 self-center">
                                      +{report.faults.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSpeakReport(report);
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                              title={t.btnSpeakReport}
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => handleDeleteReport(report.id, e)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/50 flex items-center gap-1">
                              <span>{t.openReport}</span>
                              <ArrowRight className={`w-3.5 h-3.5 ${t.dir === 'rtl' ? 'rotate-180' : ''}`} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: HARDWARE & DEVICE COMPATIBILITY (ANDROID / IOS)  */}
      {/* ========================================================= */}
      {showHardwareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-start max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowHardwareModal(false)}
              className="absolute top-5 end-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {language === 'en' ? 'Hardware & Device Compatibility' : 'دليل توافق الأجهزة (Android و iPhone)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'en' ? 'Transparent connection instructions for your phone' : 'توضيح تقني دقيق وصادق لربط الفيشة حسب جهازك'}
                </p>
              </div>
            </div>

            {/* Current Detected Hardware Badge */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                {language === 'en' ? 'Your Current System:' : 'جهازك الحالي:'}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span>OS: {hardwareStatus.os === 'android' ? 'Android' : hardwareStatus.os === 'ios' ? 'Apple iOS' : 'Desktop'}</span>
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  hardwareStatus.supportsWebBluetooth
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {hardwareStatus.supportsWebBluetooth 
                    ? (language === 'en' ? 'Bluetooth Supported ✓' : 'البلوتوث مدعوم ومتاح ✓') 
                    : (language === 'en' ? 'Requires BLE Browser' : 'يتطلب متصفح مخصص')}
                </span>
              </div>
              <p className="text-xs text-slate-300 pt-1">
                <strong>{language === 'en' ? 'Connection Method:' : 'طريقة الاتصال:'}</strong> {hardwareStatus.connectionMethodAr}
              </p>
            </div>

            {/* Steps per device */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-200 block">
                {language === 'en' ? 'Connection Steps:' : 'خطوات الاتصال الناجحة:'}
              </span>
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                {hardwareStatus.setupSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dongle Advice */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{language === 'en' ? 'Recommended OBD2 Hardware:' : 'نصيحة ذهبية عند اختيار فيشة الأعطال:'}</span>
              </span>
              <p className="leading-relaxed">
                {language === 'en' 
                  ? '• Choose an ELM327 BLE 4.0 adapter (e.g. Vgate iCar Pro BLE or Viecar BLE) with a genuine PIC18F25K80 chip.'
                  : '• اختر فيشة تعمل بتقنية Bluetooth 4.0 BLE مثل Vgate iCar Pro BLE أو Viecar BLE أو فيشة بشريحة PIC18F25K80 الأصلية إصدار v1.5.'}
              </p>
            </div>

            <button
              onClick={() => setShowHardwareModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {language === 'en' ? 'Got it, Close' : 'فهمت، إغلاق'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: SHARE APP WITH FRIEND                            */}
      {/* ========================================================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-start">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-5 end-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-md shrink-0 bg-slate-950">
                <img src="/logo.png" alt="AutoVoice EGY PRO" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {language === 'en' ? 'Share App with Friends' : 'إرسال التطبيق لصديقك'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'en' ? 'Share direct link for browser and vehicle scanning' : 'شارك الرابط لفتحه مباشرة على هاتفه وفحص سيارته'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'en' ? 'Send via WhatsApp' : 'إرسال عبر واتساب (WhatsApp)'}</span>
              </button>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block font-semibold">
                  {language === 'en' ? 'Direct Application Link:' : 'رابط التطبيق المباشر:'}
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-1.5">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 bg-transparent px-3 text-xs text-cyan-300 font-mono outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (language === 'en' ? 'Copied!' : 'تم النسخ!') : (language === 'en' ? 'Copy Link' : 'نسخ الرابط')}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {language === 'en' ? 'Close' : 'إغلاق'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PWA OFFLINE INSTALL GUIDE                        */}
      {/* ========================================================= */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-start">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-5 end-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-md shrink-0 bg-slate-950">
                <img src="/logo.png" alt="AutoVoice EGY PRO" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {language === 'en' ? 'Install for 100% Offline Use' : 'تشغيل التطبيق بدون إنترنت (Offline)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'en' ? 'Pin app to home screen to launch anytime without data' : 'تثبيت التطبيق كـ أيقونة على هاتفك لفتحه في أي وقت بدون نت'}
                </p>
              </div>
            </div>

            {isInstallable && (
              <button
                onClick={async () => {
                  const res = await install();
                  if (res) setShowInstallModal(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'en' ? 'Tap Here to Install Immediately' : 'اضغط هنا للتثبيت الفوري على الهاتف'}</span>
              </button>
            )}

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">
                {language === 'en' ? 'Android / Chrome Installation Steps:' : 'خطوات تثبيت التطبيق على هاتفك (أندرويد / Google Chrome):'}
              </span>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>{language === 'en' ? 'Tap Chrome menu (⋮) in the top bar.' : 'اضغط على زر القائمة (الثلاث نقاط ⋮) في أعلى المتصفح.'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>{language === 'en' ? 'Select "Install app" or "Add to Home screen".' : 'اختر "تثبيت التطبيق" (Install app) أو "إضافة إلى الشاشة الرئيسية".'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>{language === 'en' ? 'The app icon appears on your home screen, working 100% offline via Bluetooth!' : 'ستظهر أيقونة التطبيق على شاشة هاتفك، وتفتح فوراً بدون إنترنت وتتصل بالبلوتوث!'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {language === 'en' ? 'Got it' : 'فهمت، حسناً'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: APK DOWNLOAD & INSTALLATION                      */}
      {/* ========================================================= */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-start">
            <button
              onClick={() => setShowApkModal(false)}
              className="absolute top-5 end-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-500/40 shadow-md shrink-0 bg-slate-950">
                <img src="/logo.png" alt="AutoVoice EGY PRO" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {language === 'en' ? 'Install & Download APK' : 'تثبيت وتحميل ملف التطبيق (APK)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'en' ? 'Real standalone Android package for offline Bluetooth scanning' : 'تطبيق أندرويد حقيقي يثبت على هاتفك ويعمل بالبلوتوث بدون نت'}
                </p>
              </div>
            </div>

            {/* Option 1: Direct Android WebAPK Install */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  {language === 'en' ? 'Method 1: Direct Android WebAPK (Recommended)' : 'الطريقة 1: التثبيت الفوري كـ APK على أندرويد (موصى بها)'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'Instant' : 'تلقائي'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Chrome generates a genuine Android package (WebAPK) signed for your device with its own icon in Android Settings.'
                  : 'يقوم متصفح Chrome بنظام أندرويد بتوليد حزمة APK رسمية (WebAPK) وتثبيتها مباشرة داخل هاتفك لتظهر كأيقونة تطبيق رسمي.'}
              </p>
              <button
                onClick={() => {
                  setShowApkModal(false);
                  handleInstallClick();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'en' ? 'Install as APK Package on My Phone' : 'تثبيت كـ تطبيق APK على هاتفي الآن'}</span>
              </button>
            </div>

            {/* Option 2: PWABuilder Direct APK Package */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">
                  {language === 'en' ? 'Method 2: Download Standalone .apk File' : 'الطريقة 2: تنزيل ملف .apk خام للمشاركة'}
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'File' : 'ملف خارجي'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Generate and download an official .apk file using PWABuilder (Google & Microsoft tool) to save or share via Bluetooth.'
                  : 'إذا كنت تريد تنزيل ملف التطبيق بصيغة .apk كملف مستقل لإرساله إلى أصدقائك عبر البلوتوث أو الواتساب:'}
              </p>
              <a
                href={`https://www.pwabuilder.com/package?site=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{language === 'en' ? 'Generate & Download APK (PWABuilder)' : 'توليد وتنزيل ملف APK كامل (PWABuilder)'}</span>
              </a>
            </div>

            <button
              onClick={() => setShowApkModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {language === 'en' ? 'Close' : 'إغلاق'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
