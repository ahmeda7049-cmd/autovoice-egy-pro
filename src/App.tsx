/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
  Zap
} from 'lucide-react';
import { ConnectionStatus, DTCFault, EngineVitals, ScanReport } from './types/obd';
import { obdService } from './services/bluetoothOBD';
import { voiceAssistant } from './services/voiceAssistant';
import { reportStorage } from './services/reportStorage';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Comprehensive English DTC Codes Database (200+ Codes)
const dtcDB: Record<string, string> = {
  // Original Codes
  "P0300": "Random Multiple Cylinder Misfire",
  "P0301": "Cylinder 1 Misfire Detected",
  "P0302": "Cylinder 2 Misfire Detected",
  "P0303": "Cylinder 3 Misfire Detected",
  "P0304": "Cylinder 4 Misfire Detected",
  "P0171": "System Too Lean Bank 1",
  "P0172": "System Too Rich Bank 1",
  "P0420": "Catalyst System Efficiency Below Threshold Bank 1",
  "P0430": "Catalyst Efficiency Below Threshold Bank 2",
  "P0335": "Crankshaft Position Sensor Circuit",
  "P0340": "Camshaft Position Sensor Circuit",
  "P0700": "Transmission Control System Malfunction",
  "P0715": "Input Turbine Speed Sensor Circuit",
  "B1000": "ECU Malfunction",
  "B1021": "Driver Airbag Loop Open",
  "C0035": "Left Front Wheel Speed Circuit",
  "C0040": "Right Front Wheel Speed Circuit",
  "C0110": "Pump Motor Malfunction",
  "U0100": "Lost Communication With ECM",
  "U0140": "Lost Communication With BCM",

  // Added Comprehensive Diagnostic Trouble Codes
  "P0001": "Fuel Volume Regulator Control Circuit Open",
  "P0002": "Fuel Volume Regulator Control Circuit Range",
  "P0010": "Camshaft Position Actuator Circuit Bank 1",
  "P0011": "Camshaft Position Timing Over Advanced Bank 1",
  "P0012": "Camshaft Position Timing Over Retarded Bank 1",
  "P0016": "Crankshaft Camshaft Position Correlation Bank 1",
  "P0030": "HO2S Heater Control Circuit Bank 1 Sensor 1",
  "P0031": "HO2S Heater Control Circuit Low Bank 1 Sensor 1",
  "P0032": "HO2S Heater Control Circuit High Bank 1 Sensor 1",
  "P0036": "HO2S Heater Control Circuit Bank 1 Sensor 2",
  "P0100": "Mass Air Flow Circuit Malfunction",
  "P0101": "Mass Air Flow Circuit Range Problem",
  "P0102": "Mass Air Flow Circuit Low Input",
  "P0103": "Mass Air Flow Circuit High Input",
  "P0106": "Manifold Absolute Pressure Circuit Range",
  "P0107": "Manifold Absolute Pressure Circuit Low Input",
  "P0110": "Intake Air Temperature Circuit Malfunction",
  "P0113": "Intake Air Temperature Circuit High Input",
  "P0115": "Engine Coolant Temperature Circuit Malfunction",
  "P0116": "Engine Coolant Temperature Circuit Range",
  "P0118": "Engine Coolant Temperature Circuit High Input",
  "P0120": "Throttle Position Sensor Circuit Malfunction",
  "P0121": "Throttle Position Sensor Range Problem",
  "P0122": "Throttle Position Sensor Low Input",
  "P0123": "Throttle Position Sensor High Input",
  "P0125": "Insufficient Coolant Temp For Closed Loop",
  "P0128": "Coolant Thermostat Coolant Temp Below Regulating",
  "P0130": "O2 Sensor Circuit Bank 1 Sensor 1",
  "P0131": "O2 Sensor Circuit Low Voltage Bank 1 Sensor 1",
  "P0132": "O2 Sensor Circuit High Voltage Bank 1 Sensor 1",
  "P0133": "O2 Sensor Circuit Slow Response Bank 1 Sensor 1",
  "P0134": "O2 Sensor Circuit No Activity Bank 1 Sensor 1",
  "P0135": "O2 Sensor Heater Circuit Bank 1 Sensor 1",
  "P0136": "O2 Sensor Circuit Bank 1 Sensor 2",
  "P0137": "O2 Sensor Circuit Low Voltage Bank 1 Sensor 2",
  "P0138": "O2 Sensor Circuit High Voltage Bank 1 Sensor 2",
  "P0140": "O2 Sensor Circuit No Activity Bank 1 Sensor 2",
  "P0141": "O2 Sensor Heater Circuit Bank 1 Sensor 2",
  "P0170": "Fuel Trim Malfunction Bank 1",
  "P0173": "Fuel Trim Malfunction Bank 2",
  "P0174": "System Too Lean Bank 2",
  "P0175": "System Too Rich Bank 2",
  "P0180": "Fuel Temperature Sensor A Circuit",
  "P0196": "Engine Oil Temperature Sensor Range",
  "P0200": "Injector Circuit Malfunction",
  "P0201": "Injector Circuit Cylinder 1",
  "P0202": "Injector Circuit Cylinder 2",
  "P0203": "Injector Circuit Cylinder 3",
  "P0204": "Injector Circuit Cylinder 4",
  "P0215": "Engine Shutoff Solenoid Malfunction",
  "P0219": "Engine Overspeed Condition",
  "P0220": "Throttle Position Sensor B Circuit",
  "P0230": "Fuel Pump Primary Circuit",
  "P0234": "Turbocharger Overboost Condition",
  "P0245": "Turbocharger Wastegate Solenoid A Low",
  "P0305": "Cylinder 5 Misfire Detected",
  "P0306": "Cylinder 6 Misfire Detected",
  "P0307": "Cylinder 7 Misfire Detected",
  "P0308": "Cylinder 8 Misfire Detected",
  "P0315": "Crankshaft Position System Variation Not Learned",
  "P0325": "Knock Sensor Circuit Bank 1",
  "P0327": "Knock Sensor Circuit Low Input Bank 1",
  "P0328": "Knock Sensor Circuit High Input Bank 1",
  "P0330": "Knock Sensor 2 Circuit Bank 2",
  "P0336": "Crankshaft Position Sensor Range Performance",
  "P0341": "Camshaft Position Sensor Range Bank 1",
  "P0345": "Camshaft Position Sensor Bank 2",
  "P0350": "Ignition Coil Primary Secondary Circuit",
  "P0351": "Ignition Coil A Primary Secondary",
  "P0352": "Ignition Coil B Primary Secondary",
  "P0353": "Ignition Coil C Primary Secondary",
  "P0354": "Ignition Coil D Primary Secondary",
  "P0400": "Exhaust Gas Recirculation Flow Malfunction",
  "P0401": "Exhaust Gas Recirculation Flow Insufficient",
  "P0402": "Exhaust Gas Recirculation Flow Excessive",
  "P0403": "Exhaust Gas Recirculation Circuit",
  "P0410": "Secondary Air Injection System",
  "P0411": "Secondary Air Injection Incorrect Flow",
  "P0421": "Warm Up Catalyst Efficiency Below Threshold Bank 1",
  "P0440": "Evaporative Emission System Malfunction",
  "P0441": "Evaporative Emission System Incorrect Purge Flow",
  "P0442": "Evaporative Emission System Small Leak",
  "P0443": "Evaporative Emission System Purge Control Valve Circuit",
  "P0446": "Evaporative Emission System Vent Control Circuit",
  "P0455": "Evaporative Emission System Large Leak",
  "P0460": "Fuel Level Sensor Circuit",
  "P0463": "Fuel Level Sensor Circuit High Input",
  "P0500": "Vehicle Speed Sensor Malfunction",
  "P0501": "Vehicle Speed Sensor Range Performance",
  "P0505": "Idle Air Control System Malfunction",
  "P0506": "Idle Air Control RPM Lower Than Expected",
  "P0507": "Idle Air Control RPM Higher Than Expected",
  "P0510": "Closed Throttle Position Switch Malfunction",
  "P0520": "Engine Oil Pressure Sensor Circuit",
  "P0530": "A/C Refrigerant Pressure Sensor Circuit",
  "P0562": "System Voltage Low",
  "P0563": "System Voltage High",
  "P0600": "Serial Communication Link Malfunction",
  "P0601": "Internal Control Module Memory Check Sum Error",
  "P0606": "ECM Processor Fault",
  "P0620": "Generator Control Circuit",
  "P0645": "A/C Clutch Relay Control Circuit",
  "P0650": "Malfunction Indicator Lamp Control Circuit",
  "P0705": "Transmission Range Sensor Circuit Malfunction",
  "P0710": "Transmission Fluid Temperature Sensor Circuit",
  "P0720": "Output Speed Sensor Circuit",
  "P0722": "Output Speed Sensor No Signal",
  "P0730": "Incorrect Gear Ratio",
  "P0740": "Torque Converter Clutch Circuit Malfunction",
  "P0750": "Shift Solenoid A Malfunction",
  "P0755": "Shift Solenoid B Malfunction",
  "P0760": "Shift Solenoid C Malfunction",
  "P0780": "Shift Malfunction",
  "P0805": "Clutch Position Sensor Circuit",
  "P0810": "Clutch Position Control Error",
  "B0001": "Driver Frontal Stage 1 Deployment Control",
  "B0020": "Left Frontal Stage 1 Deployment Control",
  "B1001": "Option Configuration Error",
  "B1015": "Passenger Deployment Loop Open",
  "B1026": "Driver Deployment Loop Short To Ground",
  "B1040": "Electronic Front Driver Door Module",
  "B1114": "Brake Lamp Switch Circuit",
  "B1140": "Airbag Deployment Indication Circuit",
  "B1200": "Climate Control Pushbutton Circuit Failure",
  "B1318": "Battery Voltage Low",
  "B1342": "ECU Is Defective",
  "B1484": "Brake Pedal Input Circuit Failure",
  "B1485": "Brake Pedal Input Short To Battery",
  "B1516": "Driver Seat Position Sensor Circuit",
  "B1590": "Driver Seat Horizontal Switch Circuit",
  "B1610": "Driver Window Motor Circuit",
  "B1676": "Battery Pack Voltage Out Of Range",
  "B1869": "Lamp Airbag Warning Indicator Circuit Failure",
  "B1891": "Airbag Tone Warning Indicator Circuit Short To Battery",
  "B1916": "Driver Airbag Loop Short To Battery",
  "B1932": "Driver Airbag Loop Resistance High",
  "B1934": "Driver Airbag Loop Resistance Low",
  "B1992": "Driver Side Airbag Circuit Short To Battery",
  "B1993": "Driver Side Airbag Circuit Short To Ground",
  "B2228": "Airbag Driver Circuit Resistance High",
  "B2230": "Airbag Driver Circuit Short To Ground",
  "B2295": "Passenger Side Airbag Circuit Resistance High",
  "C0001": "TCS Control Channel A Valve 1",
  "C0031": "Left Front Wheel Speed Sensor",
  "C0036": "Right Front Tone Wheel Performance",
  "C0045": "Brake Pressure Sensor B Circuit",
  "C0050": "Right Rear Wheel Speed Circuit",
  "C0051": "Steering Wheel Position Sensor Signal C",
  "C0060": "Left Front ABS Solenoid 1 Circuit",
  "C0070": "Control Module Internal Failure ABS",
  "C0080": "ABS Malfunction Indicator Lamp Circuit",
  "C0115": "ABS Motor Relay Coil Circuit Failure",
  "C0121": "Valve Relay Circuit Failure",
  "C0128": "Low Brake Fluid Circuit Low",
  "C0156": "Position Sensor Calibration Not Learned",
  "C0161": "ABS TCS Brake Switch Circuit Malfunction",
  "C0245": "Wheel Speed Sensor Frequency Error",
  "C0265": "EBCM Motor Relay Circuit",
  "C0281": "Brake Switch Circuit Malfunction",
  "C0550": "ECU Malfunction Internal",
  "C0710": "Steering Position Signal Malfunction",
  "C0750": "Left Front Tire Pressure Sensor Low Battery",
  "C0800": "Device Power Circuit Low Voltage",
  "U0001": "High Speed CAN Communication Bus",
  "U0073": "Control Module Communication Bus Off",
  "U0101": "Lost Communication With TCM",
  "U0122": "Lost Communication With Vehicle Dynamics Control Module",
  "U0146": "Lost Communication With Gateway Module A",
  "U0155": "Lost Communication With Instrument Panel Cluster",
  "U0164": "Lost Communication With HVAC Control Module",
  "U0170": "Lost Communication With Restraints Control Module",
  "U0184": "Lost Communication With Radio",
  "U0199": "Lost Communication With Door Control Module A",
  "U0208": "Lost Communication With Seat Control Module A",
  "U0214": "Lost Communication With Remote Function Actuation",
  "U0232": "Lost Communication With Blind Spot Detection Module Left",
  "U0300": "Internal Control Module Software Incompatibility",
  "U0401": "Invalid Data Received ECM PCM",
  "U0422": "Invalid Data Received Body Control Module",
  "U0423": "Invalid Data Received Instrument Panel Cluster",
  "U0452": "Invalid Data Received Restraints Control Module",
  "U1000": "Class 2 Communication Malfunction",
  "U1041": "Loss Of EBCM Communication",
  "U1064": "Loss Of BCM Communication",
  "U1096": "Loss Of IPC Communication",
  "U1192": "Loss Of VTD Communication"
};

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>(obdService.getStatus());
  const [faults, setFaults] = useState<DTCFault[]>([]);
  const [vitals, setVitals] = useState<EngineVitals>(obdService.getVitals());
  
  const [isScanning, setIsScanning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Storage and Navigation State
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [savedReports, setSavedReports] = useState<ScanReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ScanReport | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // PWA Offline and Install State
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showInstallModal, setShowInstallModal] = useState(false);

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
          title: 'طبيب أعطال السيارات OBD2',
          text: 'افحص سيارتك بالبلوتوث مجاناً عبر الهاتف مع تشخيص صوتي بالعربية:',
          url,
        });
        return;
      } catch {
        // user dismissed share sheet
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
    const msg = encodeURIComponent(`افحص سيارتك وفيشة الأعطال بالبلوتوث مجاناً عبر الهاتف مع تشخيص صوتي للأعطال:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  useEffect(() => {
    // Load initial reports from localStorage
    const stored = reportStorage.getReports();
    setSavedReports(stored);

    // Subscribe to status, faults, and vitals updates
    const unsubStatus = obdService.onStatus((s) => {
      setStatus(s);
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
    try {
      const scannedFaults = await obdService.scanFaults();

      // Automatically create and save inspection report into localStorage
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat('ar-EG', {
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
      setSavedNotice('تم حفظ تقرير الفحص تلقائياً في السجل 💾');
      setTimeout(() => setSavedNotice(null), 4000);
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

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceAssistant.setEnabled(next);
    if (next) {
      voiceAssistant.speak('المساعد الصوتي مفعل.');
    }
  };

  const handleSpeakSingleFault = (fault: DTCFault) => {
    voiceAssistant.playChime('warning');
    voiceAssistant.speak(`كود: ${fault.code}. المشكلة: ${fault.problemAr}. الحل: ${fault.solutionAr}.`, true);
  };

  const handleSpeakReport = (report: ScanReport) => {
    if (report.faults.length === 0) {
      voiceAssistant.playChime('success');
      voiceAssistant.speak('تقرير الفحص المحفوظ: السيارة سليمة تماماً ولا توجد أعطال مسجلة.');
    } else {
      voiceAssistant.playChime('warning');
      const countText = `تقرير الفحص يحتوي على ${report.faults.length} عطل.`;
      const faultTexts = report.faults
        .map((f, i) => `العطل ${i + 1}: كود ${f.code}، المشكلة: ${f.problemAr}، الحل: ${f.solutionAr}.`)
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
    if (window.confirm('هل أنت متأكد من مسح جميع تقارير الفحص السابقة من الذاكرة؟')) {
      reportStorage.clearAllReports();
      setSavedReports([]);
      setSelectedReport(null);
    }
  };

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isError = status === 'error';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white pb-12">
      {/* App Doctor Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-wide">
                طبيب أعطال السيارات (OBD2)
              </h1>
              <p className="text-xs text-slate-400">
                تشخيص كمبيوتر المحرك بلغة عربية بسيطة وحفظ السجلات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Offline PWA Install Button */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="p-2 sm:px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                title="تثبيت التطبيق على هاتفك لفتحه بدون إنترنت في أي وقت"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تثبيت بدون نت</span>
              </button>
            )}

            {/* Share App Button */}
            <button
              onClick={handleShareClick}
              className="p-2 sm:px-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="إرسال ومشاركة التطبيق مع صديق"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة التطبيق</span>
            </button>

            {/* Voice Assistant Toggle */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                voiceEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={voiceEnabled ? 'الصوت مفعل' : 'الصوت مكتوم'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{voiceEnabled ? 'الصوت ناطق' : 'مكتوم'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs: [ 🩺 الفحص المباشر ] and [ 📋 سجل الفحوصات السابقة (X) ] */}
        <div className="max-w-3xl mx-auto px-4 pt-1 flex gap-2">
          <button
            onClick={() => {
              setActiveTab('current');
              setSelectedReport(null);
            }}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'current'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>الفحص المباشر</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>سجل الفحوصات السابقة</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
              savedReports.length > 0
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {savedReports.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Doctor Screen */}
      <main className="max-w-3xl mx-auto w-full px-4 py-6 flex-1 space-y-6">

        {/* Offline Status Alert */}
        {!isOnline && (
          <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>وضع بدون إنترنت نشط: التطبيق والبلوتوث وقاعدة بيانات الأعطال تعمل 100% بدون نت!</span>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg shrink-0">
              بلوتوث مباشر ⚡
            </span>
          </div>
        )}

        {/* Offline & Bluetooth Independence Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 sm:mt-0">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  فحص بالبلوتوث بدون استهلاك إنترنت (Offline 100%)
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-md font-mono">
                  لا يحتاج نت
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                اتصال فيشة OBD2 وقراءة الأعطال والنطق الصوتي يعمل محلياً بالكامل على هاتفك بدون أي باقة أو واي فاي.
              </p>
            </div>
          </div>

          {!isInstalled ? (
            <button
              onClick={handleInstallClick}
              className="self-end sm:self-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>تثبيت التطبيق على الهاتف</span>
            </button>
          ) : (
            <span className="self-end sm:self-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
              <Check className="w-3.5 h-3.5" />
              <span>مثبت على الهاتف ✓</span>
            </span>
          )}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CURRENT LIVE SCAN SCREEN (DOCTOR MINIMAL STYLE)    */}
        {/* ========================================================= */}
        {activeTab === 'current' && (
          <>
            {/* TOP: ONE BIG CARD SHOWS CONNECTION STATUS WITH ONE BUTTON [اتصال] */}
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all shadow-2xl relative overflow-hidden ${
              isConnected
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-emerald-500/40 shadow-emerald-950/20'
                : isConnecting
                ? 'bg-slate-900 border-amber-500/40 shadow-amber-950/20 animate-pulse'
                : isError
                ? 'bg-gradient-to-br from-slate-900 to-red-950/50 border-red-500/50 shadow-red-950/20'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-right">
                
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
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      حالة فيشة الأعطال
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {isConnected
                        ? 'الفيشة متصلة وجاهزة للكشف'
                        : isConnecting
                        ? 'جاري الاتصال والتحقق (ATZ)...'
                        : isError
                        ? 'فشل الاتصال، تأكد من تركيب الفيشة'
                        : 'الفيشة غير متصلة'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed max-w-md">
                      {isConnected
                        ? 'تم استقبال استجابة ELM327 بنجاح. يمكنك الآن بدء الكشف الطبي على السيارة.'
                        : isConnecting
                        ? 'جاري إرسال أمر ATZ وانتظار تأكيد استجابة الفيشة (المهلة 5 ثوانٍ).'
                        : isError
                        ? 'لم يتم استلام رد من الفيشة. تأكد من إحكام توصيل الفيشة في مخرج OBD2 وتشغيل مفتاح السيارة (ON).'
                        : 'قم بتركيب فيشة OBD2 أسفل المقود، وتأكد من تشغيل البلوتوث بهاتفك ثم اضغط اتصال.'}
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
                      قطع الاتصال
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
                          <span>جاري الفحص...</span>
                        </>
                      ) : (
                        <>
                          <Bluetooth className="w-5 h-5" />
                          <span>{isError ? 'إعادة المحاولة' : 'اتصال'}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Demo test helper for testing in browser */}
                  {!isConnected && !isConnecting && (
                    <button
                      onClick={handleConnectDemo}
                      className="text-[11px] text-slate-500 hover:text-cyan-400 text-center transition underline cursor-pointer mt-1"
                    >
                      أو تجربة محاكاة سريعة (Demo)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3 IMPORTANT PIDS FILTER (RPM, Coolant Temp, Intake Pressure) */}
            {isConnected && (
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-md">
                <span className="text-[11px] font-bold text-slate-400 block mb-2.5">
                  المؤشرات الحيوية للمحرك (قراءات حقيقية):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* RPM (010C) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>سرعة دوران المحرك</span>
                    </div>
                    <span className={`text-lg font-black font-mono ${vitals.rpm.isSupported ? 'text-white' : 'text-amber-400 text-xs'}`}>
                      {vitals.rpm.value}
                    </span>
                  </div>

                  {/* Coolant Temp (0105) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-400" />
                      <span>حرارة ماء المحرك</span>
                    </div>
                    <span className={`text-lg font-black font-mono ${vitals.coolantTemp.isSupported ? 'text-white' : 'text-amber-400 text-xs'}`}>
                      {vitals.coolantTemp.value}
                    </span>
                  </div>

                  {/* Intake Pressure (010B) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Wind className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ضغط هواء السحب</span>
                    </div>
                    <span className={`text-lg font-black font-mono ${vitals.intakePressure.isSupported ? 'text-white' : 'text-amber-400 text-xs'}`}>
                      {vitals.intakePressure.value}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MIDDLE: IF CONNECTED, SHOW ONLY 2 BIG BUTTONS: [افحص الأعطال] and [امسح الأعطال] */}
            {isConnected ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Button 1: [افحص الأعطال] */}
                <button
                  onClick={handleScanFaults}
                  disabled={isScanning}
                  className="py-5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-3 transition cursor-pointer transform active:scale-[0.98] disabled:opacity-50"
                >
                  <Stethoscope className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'جاري الكشف على السيارة...' : 'افحص الأعطال'}</span>
                </button>

                {/* Button 2: [امسح الأعطال] */}
                <button
                  onClick={handleClearFaults}
                  disabled={isClearing}
                  className="py-5 px-6 rounded-2xl bg-slate-800 hover:bg-red-900/60 text-slate-200 hover:text-white border border-slate-700 hover:border-red-500/50 font-black text-lg shadow-xl flex items-center justify-center gap-3 transition cursor-pointer transform active:scale-[0.98] disabled:opacity-50"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <span>{isClearing ? 'جاري مسح الأعطال...' : 'امسح الأعطال'}</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center text-slate-400 text-sm">
                💡 اضغط زر <strong className="text-white">"اتصال"</strong> أعلاه للربط بفيشة الأعطال والبدء في الكشف الطبي على سيارتك.
              </div>
            )}

            {/* BOTTOM: LIST OF FAULTS IN BIG WHITE CARDS (DOCTOR STYLE) */}
            {hasScanned && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                    <span>تقرير الفحص والتشخيص الطبي للسيارة:</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      محفوظ في السجل ✓
                    </span>
                    <span className="text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      {faults.length === 0 ? 'سليمة تماماً' : `${faults.length} عطل مسجل`}
                    </span>
                  </div>
                </div>

                {faults.length === 0 ? (
                  /* Doctor clean healthy card */
                  <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-r-8 border-emerald-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          كود: لا يوجد أعطال
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1.5">
                          المشكلة: السيارة سليمة تماماً
                        </h4>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">
                          الحل: كمبيوتر المحرك سليم ولا توجد أي مشاكل مسجلة، لا تحتاج سيارتك لأي صيانة حالياً.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List of Faults formatted as Big White Cards */
                  <div className="space-y-3.5">
                    {faults.map((fault) => (
                      <div
                        key={fault.code}
                        className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-r-8 border-red-500 hover:shadow-cyan-500/10 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            {/* Format: "كود: P0301 - المشكلة: خلل في البوجيه رقم 1 - الحل: غير البوجيه" */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-black bg-slate-950 text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-800">
                                {dtcDB[fault.code] ?? `Unknown Code: ${fault.code}`}
                              </span>
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                كود: {fault.code}
                              </span>
                            </div>

                            <div className="text-base sm:text-lg font-black text-slate-950 mt-1">
                              المشكلة: <span className="text-red-600">{fault.problemAr}</span>
                            </div>

                            <div className="text-sm sm:text-base font-bold text-emerald-800 mt-1.5 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                              الحل: <span>{fault.solutionAr}</span>
                            </div>
                          </div>

                          {/* Doctor Voice Button */}
                          <button
                            onClick={() => handleSpeakSingleFault(fault)}
                            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
                            title="استمع للتشخيص بالصوت العربي"
                          >
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                            <span>استمع للتشخيص</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Diagnostic Test Chips */}
            {isConnected && (
              <div className="pt-2 border-t border-slate-900 text-center">
                <span className="text-[11px] text-slate-500 block mb-2">
                  تجربة سريعة لإضافة أعطال وفحص كروت التشخيص:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    onClick={() => obdService.injectTestFault('P0301')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + بوجيه رقم 1 (P0301)
                  </button>
                  <button
                    onClick={() => obdService.injectTestFault('P0115')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + حرارة المحرك (P0115)
                  </button>
                  <button
                    onClick={() => obdService.injectTestFault('P0420')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + علبة البيئة (P0420)
                  </button>
                  <button
                    onClick={() => obdService.injectTestFault('P0700')}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg cursor-pointer transition"
                  >
                    + فتيس أوتوماتيك (P0700)
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SAVED REPORTS HISTORY (FROM LOCALSTORAGE)          */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-5">
            {/* If user is viewing details of a specific saved report */}
            {selectedReport ? (
              <div className="space-y-4">
                {/* Back button and report header */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-bold flex items-center gap-2 border border-slate-800 transition cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة لقائمة الفحوصات</span>
                  </button>

                  <button
                    onClick={() => handleSpeakReport(selectedReport)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>قراءة التقرير صوتياً</span>
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
                        <span>تقرير الفحص المحفوظ</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                          selectedReport.status === 'healthy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {selectedReport.status === 'healthy' ? 'سليمة تماماً' : `${selectedReport.faults.length} عطل مسجل`}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>تاريخ الفحص: {selectedReport.formattedDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stored Vitals Snapshot */}
                  {selectedReport.vitals && (
                    <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400">المؤشرات أثناء الفحص:</span>
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
                          كود: لا يوجد أعطال
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1.5">
                          المشكلة: السيارة كانت سليمة تماماً في هذا الفحص
                        </h4>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">
                          الحل: لم تكن هناك أي مشاكل مسجلة في كمبيوتر السيارة خلال وقت هذا الفحص.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {selectedReport.faults.map((fault) => (
                      <div
                        key={fault.code}
                        className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-r-8 border-red-500"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-black bg-slate-950 text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-800">
                                {dtcDB[fault.code] ?? `Unknown Code: ${fault.code}`}
                              </span>
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                كود: {fault.code}
                              </span>
                            </div>

                            <div className="text-base sm:text-lg font-black text-slate-950 mt-1">
                              المشكلة: <span className="text-red-600">{fault.problemAr}</span>
                            </div>

                            <div className="text-sm sm:text-base font-bold text-emerald-800 mt-1.5 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                              الحل: <span>{fault.solutionAr}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSpeakSingleFault(fault)}
                            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
                          >
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                            <span>استمع للتشخيص</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Saved Reports List */
              <div className="space-y-4">
                {/* History Header & Clear All */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-cyan-400" />
                      <span>تقارير الفحوصات المحفوظة ({savedReports.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      محفوظة على ذاكرة هاتفك (localStorage) وتظل متاحة حتى بعد إغلاق التطبيق.
                    </p>
                  </div>

                  {savedReports.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs font-bold flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>مسح السجل</span>
                    </button>
                  )}
                </div>

                {/* Empty State */}
                {savedReports.length === 0 ? (
                  <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-white">لا توجد تقارير فحص سابقة حتى الآن</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      عندما تقوم بالاتصال بفيشة الأعطال والضغط على "افحص الأعطال"، سيتم حفظ التقرير هنا تلقائياً ليمكنك الرجوع إليه في أي وقت.
                    </p>
                    <button
                      onClick={() => setActiveTab('current')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>إجراء فحص جديد الآن</span>
                    </button>
                  </div>
                ) : (
                  /* Cards for Each Saved Report */
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
                                  {report.status === 'healthy' ? 'فحص: السيارة سليمة تماماً' : `فحص: تم اكتشاف ${report.faults.length} عطل`}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  report.status === 'healthy'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}>
                                  {report.status === 'healthy' ? 'سليم' : `${report.faults.length} أعطال`}
                                </span>
                              </div>

                              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>{report.formattedDate}</span>
                              </p>

                              {/* Preview of Fault codes in this report */}
                              {report.faults.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {report.faults.slice(0, 3).map((f) => (
                                    <span key={f.code} className="text-[11px] font-mono bg-slate-950 text-cyan-300 px-2 py-0.5 rounded border border-slate-800">
                                      {f.code}
                                    </span>
                                  ))}
                                  {report.faults.length > 3 && (
                                    <span className="text-[10px] text-slate-500 self-center">
                                      +{report.faults.length - 3} أعطال أخرى
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons for this item */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSpeakReport(report);
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                              title="استمع للتقرير"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => handleDeleteReport(report.id, e)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition cursor-pointer"
                              title="حذف هذا التقرير"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/50 flex items-center gap-1">
                              <span>فتح</span>
                              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
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

      {/* Share with Friend Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-right">
            
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">إرسال التطبيق لصديقك</h3>
                <p className="text-xs text-slate-400">شارك الرابط لفتحه مباشرة على هاتفه وفحص سيارته</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              {/* WhatsApp direct share */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Send className="w-4 h-4" />
                <span>إرسال عبر واتساب (WhatsApp)</span>
              </button>

              {/* Copy Link Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block font-semibold">رابط التطبيق المباشر:</label>
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
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Friend setup tips */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
              <span className="font-bold text-slate-200 block">💡 كيف يشغله صاحبك على هاتفه؟</span>
              <p>1. يفتح الرابط في متصفح <strong>Google Chrome</strong> على هاتف أندرويد.</p>
              <p>2. يركّب فيشة OBD2 بالسيارة ويشغّل البلوتوث ويضغط <strong>"اتصال"</strong>.</p>
              <p>3. <strong>لتثبيته كـ تطبيق على الهاتف:</strong> يضغط على خيارات المتصفح (الثلاث نقاط ⋮) ثم يختار <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong> ليصبح تطبيقاً كاملاً على شاشة هاتفه.</p>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* PWA Offline Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-right">
            
            {/* Close Button */}
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">تشغيل التطبيق بدون إنترنت (Offline)</h3>
                <p className="text-xs text-slate-400">تثبيت التطبيق كـ أيقونة على هاتفك لفتحه في أي وقت بدون نت</p>
              </div>
            </div>

            {/* Direct Install prompt if available */}
            {isInstallable && (
              <button
                onClick={async () => {
                  const res = await install();
                  if (res) setShowInstallModal(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                <span>اضغط هنا للتثبيت الفوري على الهاتف</span>
              </button>
            )}

            {/* Android / Chrome Manual Steps */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">
                خطوات تثبيت التطبيق على هاتفك (أندرويد / Google Chrome):
              </span>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>اضغط على زر القائمة <strong>(الثلاث نقاط ⋮)</strong> في أعلى يسار متصفح Chrome.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>ستظهر أيقونة التطبيق على شاشة هاتفك الرئيسية، وتفتح فوراً <strong>بدون إنترنت إطلاقاً</strong> وتتصل بالبلوتوث مباشرة!</span>
                </div>
              </div>
            </div>

            {/* Key Facts */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-[11px] text-emerald-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>معلومة هامة عن عمل التطبيق:</span>
              </span>
              <p>• اتصال فيشة OBD2 يعتمد 100% على موجات البلوتوث اللاسلكية ولا يحتاج أي إنترنت أو شبكة بيانات.</p>
              <p>• جميع أكواد الأعطال (DTC) والنطق الصوتي والتقارير مخزنة محلياً في ذاكرة هاتفك.</p>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              فهمت، حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
