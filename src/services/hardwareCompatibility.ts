/**
 * Hardware Compatibility & Device Detection Service
 * AutoVoice EGY PRO V2
 * 
 * Transparent, realistic hardware guidance for Android & iPhone OBD2 connection.
 * Strictly adheres to non-fake claims and explains real Web Bluetooth capabilities.
 */

export interface DeviceHardwareStatus {
  os: 'android' | 'ios' | 'desktop' | 'unknown';
  browser: 'chrome' | 'safari' | 'bluefy' | 'edge' | 'other';
  supportsWebBluetooth: boolean;
  recommendedDongle: string;
  connectionMethodAr: string;
  isFullySupported: boolean;
  setupSteps: string[];
  warnings: string[];
}

export function detectDeviceHardware(): DeviceHardwareStatus {
  if (typeof window === 'undefined') {
    return {
      os: 'unknown',
      browser: 'other',
      supportsWebBluetooth: false,
      recommendedDongle: 'ELM327 BLE 4.0 (PIC18F25K80)',
      connectionMethodAr: 'غير معروف',
      isFullySupported: false,
      setupSteps: [],
      warnings: []
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isChrome = /chrome|crios/.test(userAgent) && !/edge|opr/.test(userAgent);
  const isBluefy = /bluefy/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !isChrome;

  const supportsBluetooth = 'bluetooth' in navigator && typeof (navigator as unknown as { bluetooth: { requestDevice?: unknown } }).bluetooth?.requestDevice === 'function';

  if (isAndroid) {
    return {
      os: 'android',
      browser: isChrome ? 'chrome' : 'other',
      supportsWebBluetooth: supportsBluetooth,
      recommendedDongle: 'فيشة ELM327 V1.5 مزودة ببلوتوث BLE 4.0 أو Vgate iCar Pro BLE',
      connectionMethodAr: 'اتصال مباشر عبر متصفح Google Chrome (Web Bluetooth BLE)',
      isFullySupported: true,
      setupSteps: [
        'تأكد من تركيب فيشة OBD2 في السيارة وتشغيل الكونتاكت (وضع ON أو تدوير الموتور).',
        'شغّل البلوتوث والموقع (GPS) في هاتفك الأندرويد (متطلب نظام أندرويد لاكتشاف البلوتوث).',
        'افتح التطبيق عبر متصفح Google Chrome.',
        'اضغط زر [اتصال]، ستظهر نافذة أندرويد للبحث عن الفيشة (اختر OBDII أو ELM327).'
      ],
      warnings: [
        'تنبيه مهم: فيشات البلوتوث القديمة الزرقاء الرديئة (Classic Bluetooth 2.0 / SPP) لا تدعمها متصفحات الويب، يجب استخدام فيشة تدعم بروتوكول BLE (Bluetooth 4.0+).',
        'احرص على شراء فيشة بشريحة PIC18F25K80 الأصلية إصدار v1.5 لضمان قراءة كمبيوتر المحرك بدقة.'
      ]
    };
  }

  if (isIOS) {
    return {
      os: 'ios',
      browser: isBluefy ? 'bluefy' : (isSafari ? 'safari' : 'other'),
      supportsWebBluetooth: supportsBluetooth,
      recommendedDongle: 'Vgate iCar Pro BLE 4.0 أو Viecar BLE (متوافق مع آبل)',
      connectionMethodAr: isBluefy 
        ? 'متصل عبر متصفح Bluefy المخصص للبلوتوث على الآيفون' 
        : 'يتطلب فتح الرابط في متصفح Bluefy المخصص لتمكين البلوتوث على iOS',
      isFullySupported: isBluefy && supportsBluetooth,
      setupSteps: [
        'نظام Apple iOS يمنع متصفح Safari الافتراضي من استخدام البلوتوث مباشرة.',
        'للربط بالفيشة على آيفون: حمّل تطبيق المتصفح المجاني "Bluefy - Web BLE Browser" من متجر App Store.',
        'افتح رابط تطبيقنا داخل متصفح Bluefy، وسيظهر زر البلوتوث ويعمل بنسبة 100%.',
        'تأكد من استخدام فيشة بلوتوث داعمة لـ iPhone مثل Vgate iCar Pro BLE أو Viecar.'
      ],
      warnings: [
        'متصفح Safari الأصلي لا يدعم تقنية Web Bluetooth طبقاً لقيود شركة Apple.',
        'فيشات البلوتوث القديمة 2.0 (الفيشة الزرقاء الصغيرة) لا تدعم هواتف آيفون نهائياً.'
      ]
    };
  }

  // Desktop (Windows / Mac / Linux)
  return {
    os: 'desktop',
    browser: isChrome ? 'chrome' : 'other',
    supportsWebBluetooth: supportsBluetooth,
    recommendedDongle: 'ELM327 Bluetooth BLE 4.0 / USB Dongle',
    connectionMethodAr: 'Google Chrome / Edge على الكمبيوتر مع قطعة بلوتوث',
    isFullySupported: supportsBluetooth,
    setupSteps: [
      'تأكد من تفعيل البلوتوث على جهاز الكمبيوتر / اللابتوب.',
      'افتح الموقع في متصفح Google Chrome أو Microsoft Edge.',
      'اضغط زر [اتصال] واختر فيشة OBD2 المقترنة.'
    ],
    warnings: [
      'يجب أن يدعم لابتوبك تقنية Bluetooth 4.0+ BLE للاتصال اللاسلكي.'
    ]
  };
}
