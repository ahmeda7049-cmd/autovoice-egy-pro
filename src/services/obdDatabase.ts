import { DTCFault } from '../types/obd';

export const DTC_DATABASE: DTCFault[] = [
  {
    code: 'P0301',
    problemAr: 'خلل في البوجيه رقم 1 أو كويل الإشعال',
    solutionAr: 'غير بوجيه الأسطوانة رقم 1 أو استبدل الكويل',
    titleAr: 'اختلال احتراق الأسطوانة رقم 1',
    severity: 'critical',
  },
  {
    code: 'P0300',
    problemAr: 'رعشة واختلال عشوائي في احتراق المحرك',
    solutionAr: 'غير طقم البوجيهات والكويلات وافحص الرشاشات',
    titleAr: 'اختلال عام في احتراق المحرك',
    severity: 'critical',
  },
  {
    code: 'P0302',
    problemAr: 'خلل في البوجيه رقم 2 أو كويل الإشعال',
    solutionAr: 'غير بوجيه الأسطوانة رقم 2 أو استبدل الكويل',
    titleAr: 'اختلال احتراق الأسطوانة رقم 2',
    severity: 'critical',
  },
  {
    code: 'P0303',
    problemAr: 'خلل في البوجيه رقم 3 أو كويل الإشعال',
    solutionAr: 'غير بوجيه الأسطوانة رقم 3 أو استبدل الكويل',
    titleAr: 'اختلال احتراق الأسطوانة رقم 3',
    severity: 'critical',
  },
  {
    code: 'P0304',
    problemAr: 'خلل في البوجيه رقم 4 أو كويل الإشعال',
    solutionAr: 'غير بوجيه الأسطوانة رقم 4 أو استبدل الكويل',
    titleAr: 'اختلال احتراق الأسطوانة رقم 4',
    severity: 'critical',
  },
  {
    code: 'P0420',
    problemAr: 'ضعف كفاءة علبة البيئة (المحول الحفاز بالشكمان)',
    solutionAr: 'نظف أو استبدل علبة البيئة وافحص حساس الشكمان الخلفي',
    titleAr: 'ضعف كفاءة علبة البيئة',
    severity: 'warning',
  },
  {
    code: 'P0171',
    problemAr: 'زيادة مفرطة في الهواء ونقص بنزين (خليط فقير)',
    solutionAr: 'نظف حساس الهواء وافحص خراطيم الشفط من أي تسريب هواء',
    titleAr: 'خليط وقود فقير',
    severity: 'warning',
  },
  {
    code: 'P0172',
    problemAr: 'زيادة ضخ البنزين في المحرك (خليط غني)',
    solutionAr: 'افحص رشاشات البنزين ونظف فلتر الهواء وحساس الأكسجين',
    titleAr: 'خليط وقود غني بالبنزين',
    severity: 'warning',
  },
  {
    code: 'P0115',
    problemAr: 'عطل في حساس حرارة ماء المحرك (الكوع)',
    solutionAr: 'تأكد من ماء الردياتير واستبدل حساس الحرارة',
    titleAr: 'خلل في حساس حرارة ماء التبريد',
    severity: 'critical',
  },
  {
    code: 'P0101',
    problemAr: 'اتساخ أو تلف حساس قياس تدفق الهواء (الماف)',
    solutionAr: 'نظف سلك حساس الهواء بمنظف إلكترونيات وركب فلتر هواء جديد',
    titleAr: 'عطل في حساس قياس الهواء',
    severity: 'warning',
  },
  {
    code: 'P0340',
    problemAr: 'عطل في حساس الكامة (تأخر دوران السيارة)',
    solutionAr: 'افحص فيشة حساس الكامة أو استبدله بقطعة أصلية',
    titleAr: 'عطل في حساس الكامات',
    severity: 'critical',
  },
  {
    code: 'P0335',
    problemAr: 'عطل في حساس الكرنك (انطفاء مفاجئ للسيارة)',
    solutionAr: 'استبدل حساس الكرنك فوراً لمنع توقف المحرك',
    titleAr: 'عطل في حساس الكرنك الرئيسي',
    severity: 'critical',
  },
  {
    code: 'P0500',
    problemAr: 'عطل في حساس سرعة السيارة (العداد لا يعمل)',
    solutionAr: 'افحص فيشة حساس السرعة على الفتيس أو حساسات ABS',
    titleAr: 'عطل في حساس سرعة السيارة',
    severity: 'warning',
  },
  {
    code: 'P0700',
    problemAr: 'عطل مسجل في كمبيوتر الفتيس (ناقل الحركة الأوتوماتيك)',
    solutionAr: 'افحص مستوى وحالة زيت الفتيس وتجنب الضغط على السيارة',
    titleAr: 'عطل في كمبيوتر ناقل الحركة',
    severity: 'critical',
  },
  {
    code: 'C0035',
    problemAr: 'عطل في حساس سرعة العجلة (لمبة ABS مضاءة)',
    solutionAr: 'نظف حساس العجلة وتأكد من سلامة السلك عند المساعد',
    titleAr: 'خلل في حساس نظام الفرامل ABS',
    severity: 'warning',
  },
  {
    code: 'U0100',
    problemAr: 'انقطاع الاتصال بكمبيوتر المحرك الرئيسي',
    solutionAr: 'افحص فيوزات كمبيوتر المحرك وثبات أصابع البطارية وكابل الأرضي',
    titleAr: 'فقدان الاتصال بكمبيوتر المحرك',
    severity: 'critical',
  },
];

export function findDtcInDatabase(code: string): DTCFault {
  const normalized = code.trim().toUpperCase();
  const found = DTC_DATABASE.find(d => d.code === normalized);
  if (found) return found;

  return {
    code: normalized,
    problemAr: `عطل مسجل بكود ${normalized} في كمبيوتر السيارة`,
    solutionAr: 'افحص الجزء المعني في السيارة باستخدام جهاز تشخيص متقدم',
    titleAr: `كود عطل ${normalized}`,
    severity: 'warning',
  };
}
