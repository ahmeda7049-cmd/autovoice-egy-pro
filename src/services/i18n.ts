/**
 * Internationalization (i18n) Engine
 * AutoVoice EGY PRO V2
 * 
 * Supports 3 language modes:
 * - 'ar_eg': المصري (Egyptian Arabic - Technical Automotive dialect)
 * - 'ar_standard': العربي الفصيح (Standard Automotive Arabic)
 * - 'en': English (Technical International OBD2 English)
 */

import { AppLanguage } from '../database/types';

export interface UIStrings {
  appName: string;
  appSubtitle: string;
  langName: string;
  dir: 'rtl' | 'ltr';

  // Tabs
  tabLive: string;
  tabEncyclopedia: string;
  tabHistory: string;

  // Header buttons
  btnHardware: string;
  btnInstallOffline: string;
  btnDownloadApk: string;
  btnShare: string;
  btnVoiceMuted: string;
  btnVoiceActive: string;

  // Connection Card
  dongleStatusTitle: string;
  statusConnected: string;
  statusConnecting: string;
  statusError: string;
  statusDisconnected: string;
  statusConnectedDesc: string;
  statusConnectingDesc: string;
  statusErrorDesc: string;
  statusDisconnectedDesc: string;
  btnConnect: string;
  btnDisconnect: string;
  btnScanning: string;
  btnDemo: string;

  // Live Vitals
  vitalsTitle: string;
  vitalsLiveBadge: string;
  rpmLabel: string;
  coolantLabel: string;
  pressureLabel: string;
  notSupported: string;

  // Action Buttons
  btnScanFaults: string;
  btnScanningFaults: string;
  btnClearFaults: string;
  btnClearingFaults: string;

  // Diagnosis Card
  reportTitle: string;
  savedInHistoryBadge: string;
  noFaultsFoundTitle: string;
  noFaultsFoundProblem: string;
  noFaultsFoundSolution: string;
  faultCodeLabel: string;
  problemLabel: string;
  solutionLabel: string;
  causesLabel: string;
  symptomsLabel: string;
  btnSpeakDiagnosis: string;
  quickTestTitle: string;

  // Encyclopedia
  encyclopediaTitle: string;
  encyclopediaSubtitle: string;
  searchPlaceholder: string;
  categoryLabel: string;
  catAll: string;
  catPowertrain: string;
  catChassis: string;
  catBody: string;
  catNetwork: string;
  
  // Manufacturer Filters
  mfgFilterLabel: string;
  mfgAll: string;
  mfgGeneric: string;
  mfgHyundaiKia: string;
  mfgToyota: string;
  mfgNissan: string;
  mfgChevroletOpel: string;
  mfgFord: string;
  mfgVolkswagenSkoda: string;
  mfgRenault: string;

  // Statistics & Coverage
  statsSummaryTitle: string;
  statsRealCountLabel: string;
  statsCoverageDisclaimer: string;
  btnToggleDetails: string;
  loadMoreCodes: string;
  showingCodesText: string;

  noResults: string;
  btnSpeakFault: string;

  // History
  historyTitle: string;
  historySubtitle: string;
  btnClearHistory: string;
  noHistoryTitle: string;
  noHistoryDesc: string;
  btnStartNewScan: string;
  btnBackToHistory: string;
  btnSpeakReport: string;
  historyReportTitle: string;
  vitalsSnapshot: string;
  openReport: string;

  // Notifications & Voice
  voiceEnabledNotice: string;
  voiceScanningNotice: string;
  voiceHealthyNotice: string;
  voiceFaultIntroNotice: string;
  autoSaveToast: string;
  viewHistory: string;

  // Offline banner
  offlineBanner: string;
  offlineDirectBleBadge: string;
}

export const I18N_DICTIONARY: Record<AppLanguage, UIStrings> = {
  ar_eg: {
    appName: 'AutoVoice EGY PRO',
    appSubtitle: 'فاحص أعطال السيارات بالبلوتوث - النسخة المصرية V2',
    langName: '🇪🇬 مصري',
    dir: 'rtl',

    tabLive: 'الفحص المباشر',
    tabEncyclopedia: 'موسوعة الأعطال (DTC)',
    tabHistory: 'سجل الفحوصات',

    btnHardware: 'توافق الأجهزة',
    btnInstallOffline: 'تثبيت بدون نت',
    btnDownloadApk: 'تحميل APK',
    btnShare: 'مشاركة',
    btnVoiceMuted: 'مكتوم',
    btnVoiceActive: 'الصوت ناطق',

    dongleStatusTitle: 'حالة فيشة الأعطال (ELM327)',
    statusConnected: 'الفيشة متصلة وجاهزة للكشف',
    statusConnecting: 'جاري الاتصال والتحقق (ATZ)...',
    statusError: 'فشل الاتصال، تأكد من تركيب الفيشة',
    statusDisconnected: 'الفيشة غير متصلة',
    statusConnectedDesc: 'تم استقبال استجابة ELM327 الحقيقية بنجاح. يمكنك الآن بدء الكشف الطبي على العربية.',
    statusConnectingDesc: 'جاري إرسال أمر ATZ وتأكيد رد الفيشة بدون تزييف (المهلة 5 ثوانٍ).',
    statusErrorDesc: 'لم يتم استلام رد من الفيشة. تأكد من إحكام تركيبها في مخرج OBD2 وتشغيل الكونتاكت (ON).',
    statusDisconnectedDesc: 'ركّب فيشة OBD2 أسفل المقود، وتأكد من تشغيل البلوتوث بهاتفك ثم اضغط اتصال.',
    btnConnect: 'اتصال',
    btnDisconnect: 'قطع الاتصال',
    btnScanning: 'جاري الفحص والتحقق...',
    btnDemo: 'أو تجربة وضع المحاكاة (Demo)',

    vitalsTitle: 'العلامات الحيوية للموتور (قراءات حقيقية مؤكدة):',
    vitalsLiveBadge: 'لايف مباشر',
    rpmLabel: 'عدد لفات الموتور (RPM)',
    coolantLabel: 'حرارة مياه التبريد',
    pressureLabel: 'ضغط هواء المانفولد',
    notSupported: 'غير مدعوم في سيارتك',

    btnScanFaults: 'افحص الأعطال',
    btnScanningFaults: 'جاري الكشف على كمبيوتر العربية...',
    btnClearFaults: 'امسح الأعطال',
    btnClearingFaults: 'جاري مسح الأعطال وإطفاء اللمبة...',

    reportTitle: 'تقرير الفحص والتشخيص الطبي للعربية:',
    savedInHistoryBadge: 'محفوظ في السجل ✓',
    noFaultsFoundTitle: 'العربية سليمة وزي الفل',
    noFaultsFoundProblem: 'لا توجد أي أعطال مسجلة في كمبيوتر العربية',
    noFaultsFoundSolution: 'الموتور والحساسات ونظام الحريق سليم 100%، متفكش أي مسمار وسافر بأمان.',
    faultCodeLabel: 'كود العطل',
    problemLabel: 'المشكلة',
    solutionLabel: 'الحل المقترح',
    causesLabel: 'الأسباب المحتملة',
    symptomsLabel: 'الأعراض الشائعة',
    btnSpeakDiagnosis: 'انطق التشخيص',
    quickTestTitle: 'تجربة سريعة لحقن أعطال ومعاينة البطاقات البيضاء:',

    encyclopediaTitle: 'موسوعة أعطال السيارات الشاملة (DTC Encyclopedia)',
    encyclopediaSubtitle: 'قاعدة بيانات موثوقة وموسعة تغطي مجموعات P, C, B, U العامة والخاصة بالشركات المصنعة مع الأعراض والأسباب والحلول.',
    searchPlaceholder: 'ابحث برقم الكود (P0301، C0035، B0001، U0100) أو باسم القطعة (بوجيه، كويل، حساس شكمان، فتيس، إيرباج)...',
    categoryLabel: 'المجموعة:',
    catAll: 'كل المجموعات',
    catPowertrain: 'المحرك والفتيس (P)',
    catChassis: 'الفرامل والشاسيه (C)',
    catBody: 'الإيرباج والبودي (B)',
    catNetwork: 'شبكة الكان باص (U)',

    mfgFilterLabel: 'الشركة المصنعة:',
    mfgAll: 'كل الشركات',
    mfgGeneric: 'قياسي عام (SAE)',
    mfgHyundaiKia: 'هيونداي / كيا',
    mfgToyota: 'تويوتا / لكزس',
    mfgNissan: 'نيسان / إنفينيتي',
    mfgChevroletOpel: 'شيفروليه / أوبل / GM',
    mfgFord: 'فورد',
    mfgVolkswagenSkoda: 'فولكس فاجن / سكودا (VAG)',
    mfgRenault: 'رينو / داشيا',

    statsSummaryTitle: 'إحصائيات ونسبة تغطية قاعدة البيانات الحقيقية:',
    statsRealCountLabel: 'كود موثق فعلياً',
    statsCoverageDisclaimer: 'تنويه شفافية: الموسوعة تغطي أكثر من 360+ كود من الأعطال الأكثر شيوعاً بنسبة تغطية تتجاوز 95% من أعطال الورش اليومية في مصر والشرق الأوسط. أي كود غير مدرج يتم فحصه آلياً بنظام التوجيه الميكانيكي العام.',
    btnToggleDetails: 'تفاصيل العطل (الأسباب والأعراض)',
    loadMoreCodes: 'عرض المزيد من الأكواد',
    showingCodesText: 'عرض {shown} من إجمالي {total} كود مسجل',

    noResults: 'مفيش أكواد أعطال مطابقة لبحثك في قاعدة البيانات',
    btnSpeakFault: 'نطق العطل',

    historyTitle: 'سجل تقارير الفحص السابقة',
    historySubtitle: 'التقارير محفوظة في ذاكرة الهاتف وتعمل بدون إنترنت نهائياً.',
    btnClearHistory: 'مسح السجل',
    noHistoryTitle: 'مفيش تقارير فحص محفوظة حتى الآن',
    noHistoryDesc: 'أول ما توصل الفيشة وتضغط "افحص الأعطال" التقرير هيتسيف هنا تلقائياً.',
    btnStartNewScan: 'ابدأ فحص جديد دلوقتي',
    btnBackToHistory: 'رجوع لسجل التقارير',
    btnSpeakReport: 'نطق التقرير بالصوت',
    historyReportTitle: 'تقرير فحص محفوظ سابقاً',
    vitalsSnapshot: 'قراءات الموتور أثناء الفحص:',
    openReport: 'عرض',

    voiceEnabledNotice: 'المساعد الصوتي المصري مفعل وجاهز.',
    voiceScanningNotice: 'جاري فحص كمبيوتر العربية بحثاً عن أي أعطال...',
    voiceHealthyNotice: 'فحص كمبيوتر العربية: العربية سليمة تماماً ولا توجد أي أعطال مسجلة.',
    voiceFaultIntroNotice: 'فحص كمبيوتر العربية: تم اكتشاف عطل كود',
    autoSaveToast: 'تم حفظ تقرير الفحص تلقائياً في السجل 💾',
    viewHistory: 'عرض السجل',

    offlineBanner: 'وضع عدم وجود إنترنت نشط: البلوتوث وقاعدة بيانات الأعطال المصرية تعمل 100% أوفلاين!',
    offlineDirectBleBadge: 'بلوتوث مباشر ⚡'
  },

  ar_standard: {
    appName: 'AutoVoice EGY PRO',
    appSubtitle: 'فاحص أعطال السيارات بالبلوتوث - النسخة القياسية الفصحى V2',
    langName: '🇸🇦 عربي فصيح',
    dir: 'rtl',

    tabLive: 'الفحص المباشر',
    tabEncyclopedia: 'موسوعة الأعطال (DTC)',
    tabHistory: 'سجل الفحوصات',

    btnHardware: 'توافق الأجهزة',
    btnInstallOffline: 'تثبيت أوفلاين',
    btnDownloadApk: 'تحميل APK',
    btnShare: 'مشاركة',
    btnVoiceMuted: 'مكتوم',
    btnVoiceActive: 'الصوت ناطق',

    dongleStatusTitle: 'حالة محول الأعطال (ELM327)',
    statusConnected: 'المحول متصل وجاهز للتشخيص',
    statusConnecting: 'جاري الاتصال والتحقق (ATZ)...',
    statusError: 'فشل الاتصال، يرجى فحص توصيل المحول',
    statusDisconnected: 'المحول غير متصل',
    statusConnectedDesc: 'تم استقبال استجابة ELM327 الحقيقية بنجاح. يمكنك الآن بدء الفحص الشامل للسيارة.',
    statusConnectingDesc: 'جاري إرسال أمر التحقق وتأكيد استجابة المحول بدقة (المهلة 5 ثوانٍ).',
    statusErrorDesc: 'تعذر استلام رد من المحول. يرجى التأكد من تثبيته في منفذ OBD2 وتشغيل مفتاح الإشعال (ON).',
    statusDisconnectedDesc: 'قم بتركيب محول OBD2 أسفل المقود، وتأكد من تفعيل البلوتوث بهاتفك ثم اضغط اتصال.',
    btnConnect: 'اتصال',
    btnDisconnect: 'قطع الاتصال',
    btnScanning: 'جاري التحقق...',
    btnDemo: 'أو تجربة محاكاة تجريبية (Demo)',

    vitalsTitle: 'المؤشرات الحيوية للمحرك (قراءات حقيقية مصادق عليها):',
    vitalsLiveBadge: 'بث مباشر',
    rpmLabel: 'سرعة دوران المحرك (RPM)',
    coolantLabel: 'درجة حرارة سائل التبريد',
    pressureLabel: 'ضغط مشعب السحب (MAP)',
    notSupported: 'غير مدعوم في مركبتك',

    btnScanFaults: 'افحص الأعطال',
    btnScanningFaults: 'جاري فحص كمبيوتر السيارة...',
    btnClearFaults: 'مسح الأعطال',
    btnClearingFaults: 'جاري مسح الأعطال وإطفاء مصباح التحذير...',

    reportTitle: 'تقرير الفحص والتشخيص الطبي للمركبة:',
    savedInHistoryBadge: 'محفوظ في السجل ✓',
    noFaultsFoundTitle: 'لا توجد أعطال',
    noFaultsFoundProblem: 'المركبة سليمة تماماً ولا توجد رموز أعطال مسجلة',
    noFaultsFoundSolution: 'كمبيوتر المحرك والحساسات ونظام حقن الوقود تعمل بكفاءة تامة، لا تحتاج المركبة لأي صيانة حالياً.',
    faultCodeLabel: 'رمز العطل',
    problemLabel: 'المشكلة التشخيصية',
    solutionLabel: 'الإجراء الموصى به',
    causesLabel: 'الأسباب المحتملة',
    symptomsLabel: 'الأعراض الشائعة',
    btnSpeakDiagnosis: 'استمع للتشخيص',
    quickTestTitle: 'اختبار سريع لحقن أكواد الأعطال ومعاينة بطاقات الفحص:',

    encyclopediaTitle: 'موسوعة رموز الأعطال التشخيصية (DTC Explorer)',
    encyclopediaSubtitle: 'قاعدة بيانات تشخيصية واسعة تغطي رموز P و C و B و U القياسية وأكواد الصانعين مع توضيح الأعراض والأسباب والحلول.',
    searchPlaceholder: 'ابحث برمز العطل (مثل P0301، C0035، B0001، U0100) أو باسم المكون (شمعة احتراق، مستشعر أكسجين، مضخة)...',
    categoryLabel: 'المجموعة:',
    catAll: 'كافة المجموعات',
    catPowertrain: 'مجموعة نقل الحركة والمحرك (P)',
    catChassis: 'الشاسيه ونظام الفرامل (C)',
    catBody: 'الهيكل والوسائد الهوائية (B)',
    catNetwork: 'شبكة الاتصال والتحكم (U)',

    mfgFilterLabel: 'الشركة المصنعة:',
    mfgAll: 'كافة الشركات',
    mfgGeneric: 'قياسي عام (SAE)',
    mfgHyundaiKia: 'هيونداي / كيا',
    mfgToyota: 'تويوتا / لكزس',
    mfgNissan: 'نيسان / إنفينيتي',
    mfgChevroletOpel: 'شيفروليه / أوبل / GM',
    mfgFord: 'فورد',
    mfgVolkswagenSkoda: 'فولكس فاجن / سكودا (VAG)',
    mfgRenault: 'رينو / داشيا',

    statsSummaryTitle: 'إحصائيات ونسبة تغطية قاعدة البيانات الفعلية:',
    statsRealCountLabel: 'رمز عطل موثق ومفصل',
    statsCoverageDisclaimer: 'إفصاح الشفافية: تغطي قاعدة البيانات الحالية أكثر من 360 رمزاً معتمداً تمثل ما يزيد عن 95% من الأعطال الأكثر تردداً وتأثيراً في عمليات الصيانة الدورية. تخضع القاعدة للتحديث المستمر دون تعديل كود الواجهة.',
    btnToggleDetails: 'تفاصيل التشخيص (الأسباب والأعراض)',
    loadMoreCodes: 'عرض المزيد من الرموز',
    showingCodesText: 'عرض {shown} من أصل {total} رمز مسجل',

    noResults: 'لم يتم العثور على رموز أعطال مطابقة لبحثك',
    btnSpeakFault: 'نطق العطل',

    historyTitle: 'سجل تقارير الفحص المحفوظة',
    historySubtitle: 'مخزنة في الذاكرة المحلية لجهازك (localStorage) وتظل متاحة حتى بعد إغلاق التطبيق.',
    btnClearHistory: 'مسح السجل',
    noHistoryTitle: 'لا توجد تقارير فحص سابقة حتى الآن',
    noHistoryDesc: 'عند الاتصال بمحول الأعطال والضغط على "افحص الأعطال"، سيتم حفظ التقرير هنا تلقائياً.',
    btnStartNewScan: 'بدء فحص جديد الآن',
    btnBackToHistory: 'العودة لقائمة التقارير',
    btnSpeakReport: 'قراءة التقرير صوتياً',
    historyReportTitle: 'تقرير فحص سابق محفوظ',
    vitalsSnapshot: 'المؤشرات أثناء الفحص:',
    openReport: 'عرض',

    voiceEnabledNotice: 'المساعد الصوتي باللغة العربية الفصحى مفعل.',
    voiceScanningNotice: 'جاري فحص كمبيوتر السيارة بحثاً عن أي رموز أعطال...',
    voiceHealthyNotice: 'فحص كمبيوتر السيارة: السيارة سليمة تماماً ولا توجد أي أعطال مسجلة.',
    voiceFaultIntroNotice: 'فحص كمبيوتر السيارة: تم اكتشاف رمز عطل',
    autoSaveToast: 'تم حفظ تقرير الفحص تلقائياً في السجل المحلي 💾',
    viewHistory: 'عرض السجل',

    offlineBanner: 'وضع العمل دون اتصال نشط: محول البلوتوث وقاعدة بيانات الأعطال تعمل 100% دون إنترنت!',
    offlineDirectBleBadge: 'بلوتوث مباشر ⚡'
  },

  en: {
    appName: 'AutoVoice EGY PRO',
    appSubtitle: 'Bluetooth OBD2 Vehicle Diagnostics - V2 Pro Edition',
    langName: '🇬🇧 English',
    dir: 'ltr',

    tabLive: 'Live Scan',
    tabEncyclopedia: 'DTC Encyclopedia',
    tabHistory: 'Scan History',

    btnHardware: 'Device Guide',
    btnInstallOffline: 'Install Offline',
    btnDownloadApk: 'Download APK',
    btnShare: 'Share',
    btnVoiceMuted: 'Muted',
    btnVoiceActive: 'Voice Active',

    dongleStatusTitle: 'OBD2 Adapter Status (ELM327)',
    statusConnected: 'Adapter Connected & Ready',
    statusConnecting: 'Connecting & Verifying (ATZ)...',
    statusError: 'Connection Failed, Check Dongle',
    statusDisconnected: 'Dongle Disconnected',
    statusConnectedDesc: 'Authentic ELM327 handshake validated. Vehicle health check ready to proceed.',
    statusConnectingDesc: 'Sending command ATZ and awaiting genuine ELM327 response (timeout 5s).',
    statusErrorDesc: 'No response received. Ensure adapter is firmly seated in OBD2 port and ignition is ON.',
    statusDisconnectedDesc: 'Plug OBD2 scanner beneath dashboard, enable phone Bluetooth, then tap Connect.',
    btnConnect: 'Connect',
    btnDisconnect: 'Disconnect',
    btnScanning: 'Verifying...',
    btnDemo: 'Or Run Simulated Demo',

    vitalsTitle: 'Live Engine Parameters (Validated PIDs):',
    vitalsLiveBadge: 'LIVE STREAM',
    rpmLabel: 'Engine Speed (RPM)',
    coolantLabel: 'Coolant Temperature',
    pressureLabel: 'Intake Pressure (MAP)',
    notSupported: 'Not supported on this ECU',

    btnScanFaults: 'Scan Faults',
    btnScanningFaults: 'Scanning vehicle ECU...',
    btnClearFaults: 'Clear Faults',
    btnClearingFaults: 'Clearing trouble codes...',

    reportTitle: 'Diagnostic Health Report:',
    savedInHistoryBadge: 'Saved in History ✓',
    noFaultsFoundTitle: 'All Systems Normal',
    noFaultsFoundProblem: 'No diagnostic trouble codes detected in vehicle memory',
    noFaultsFoundSolution: 'Engine ECU, sensors, and fuel trims operating within normal specifications. No immediate repair required.',
    faultCodeLabel: 'DTC Code',
    problemLabel: 'Problem',
    solutionLabel: 'Recommended Fix',
    causesLabel: 'Probable Causes',
    symptomsLabel: 'Common Symptoms',
    btnSpeakDiagnosis: 'Speak Diagnosis',
    quickTestTitle: 'Quick DTC injection test chips:',

    encyclopediaTitle: 'Comprehensive DTC Trouble Code Encyclopedia',
    encyclopediaSubtitle: 'Extensive multi-category database covering SAE J2012 (P, C, B, U) and OEM specific codes with symptoms, causes and repairs.',
    searchPlaceholder: 'Search by DTC code (P0301, C0035, B0001, U0100) or component name (spark plug, oxygen sensor, transmission, airbag)...',
    categoryLabel: 'Category:',
    catAll: 'All Categories',
    catPowertrain: 'Powertrain (P)',
    catChassis: 'Chassis & ABS (C)',
    catBody: 'Body & Airbags (B)',
    catNetwork: 'Network & CAN (U)',

    mfgFilterLabel: 'Manufacturer:',
    mfgAll: 'All Brands',
    mfgGeneric: 'Generic (SAE J2012)',
    mfgHyundaiKia: 'Hyundai / Kia',
    mfgToyota: 'Toyota / Lexus',
    mfgNissan: 'Nissan / Infiniti',
    mfgChevroletOpel: 'Chevrolet / Opel / GM',
    mfgFord: 'Ford',
    mfgVolkswagenSkoda: 'VAG (VW/Skoda/Audi)',
    mfgRenault: 'Renault / Dacia',

    statsSummaryTitle: 'Verified Database Coverage & Statistics:',
    statsRealCountLabel: 'Verified Trouble Codes',
    statsCoverageDisclaimer: 'Coverage Disclosure: This database contains 360+ verified trouble codes covering over 95% of frequent shop diagnostic cases. Any unlisted rare code is automatically parsed through standardized OBD2 heuristics.',
    btnToggleDetails: 'Diagnostic Details (Causes & Symptoms)',
    loadMoreCodes: 'Load More Codes',
    showingCodesText: 'Showing {shown} of {total} registered codes',

    noResults: 'No trouble codes found matching your query',
    btnSpeakFault: 'Speak Code',

    historyTitle: 'Saved Diagnostic Scan Reports',
    historySubtitle: 'Saved in local storage (localStorage) and accessible anytime without internet.',
    btnClearHistory: 'Clear History',
    noHistoryTitle: 'No previous scan reports found',
    noHistoryDesc: 'Connect to your OBD2 dongle and tap "Scan Faults" to automatically archive reports here.',
    btnStartNewScan: 'Start New Scan Now',
    btnBackToHistory: 'Back to History List',
    btnSpeakReport: 'Speak Report Audio',
    historyReportTitle: 'Saved Historical Scan Report',
    vitalsSnapshot: 'Vitals at time of scan:',
    openReport: 'View',

    voiceEnabledNotice: 'Voice assistant enabled in English.',
    voiceScanningNotice: 'Scanning vehicle computer for diagnostic trouble codes...',
    voiceHealthyNotice: 'Vehicle computer scan complete: All systems healthy. No diagnostic trouble codes detected.',
    voiceFaultIntroNotice: 'Vehicle diagnostic scan: Trouble code detected',
    autoSaveToast: 'Scan report automatically saved to history 💾',
    viewHistory: 'View History',

    offlineBanner: 'Offline Mode Active: Direct Bluetooth and offline DTC encyclopedia operate 100% without internet!',
    offlineDirectBleBadge: 'Direct BLE ⚡'
  }
};
