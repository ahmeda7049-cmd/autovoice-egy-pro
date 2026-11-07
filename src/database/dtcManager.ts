/**
 * DTC Database Manager Subsystem
 * AutoVoice EGY PRO V2
 * 
 * Strict Deduplication, Multi-Category (P, C, B, U), Multi-Manufacturer Architecture,
 * Full 3-Language Automotive Diagnostics:
 * - 'ar_eg': Egyptian Arabic (مصري)
 * - 'ar_standard': Classical Automotive Arabic (فصحى)
 * - 'en': Technical International English
 */

import {
  DTCDefinition,
  DatabaseVersionInfo,
  DTCCategory,
  DTCManufacturer,
  AppLanguage,
  LocalizedDTC,
  CategoryStats,
  ManufacturerStats
} from './types';
import { GENERIC_DTC_LIST } from './genericCodes';
import { MANUFACTURER_DTC_LIST } from './manufacturerCodes';

class DTCManagerClass {
  private codesMap: Map<string, DTCDefinition> = new Map();
  private version: string = '2.4.0-EXPANDED';
  private releaseDate: string = '2026-11-07';

  constructor() {
    this.initializeDatabase();
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Initializes the database with strict deduplication
   */
  private initializeDatabase() {
    this.codesMap.clear();

    // 1. Load Generic Codes (Standard SAE J2012)
    for (const item of GENERIC_DTC_LIST) {
      const key = this.normalizeCode(item.code);
      if (!this.codesMap.has(key)) {
        this.codesMap.set(key, item);
      }
    }

    // 2. Load Manufacturer Specific Codes (OEM specific codes)
    for (const item of MANUFACTURER_DTC_LIST) {
      const key = this.normalizeCode(item.code);
      this.codesMap.set(key, item);
    }
  }

  /**
   * Extensible method to register new codes dynamically without touching UI files
   */
  public registerDTC(dtc: DTCDefinition): boolean {
    const key = this.normalizeCode(dtc.code);
    if (!key) return false;
    this.codesMap.set(key, dtc);
    return true;
  }

  public registerBulk(dtcs: DTCDefinition[]): number {
    let added = 0;
    for (const dtc of dtcs) {
      if (this.registerDTC(dtc)) added++;
    }
    return added;
  }

  /**
   * Look up a DTC by code
   */
  public getDTC(code: string): DTCDefinition | null {
    const key = this.normalizeCode(code);
    return this.codesMap.get(key) || null;
  }

  /**
   * Resolve DTCDefinition for legacy consumers with fallback
   */
  public resolveDTC(code: string): DTCDefinition {
    const found = this.getDTC(code);
    if (found) return found;

    const normalized = this.normalizeCode(code);
    const category = this.guessCategory(normalized);

    return {
      code: normalized,
      category,
      manufacturer: 'generic',
      titleEn: `Standard OBD2 Code: ${normalized}`,
      titleAr: `كود عطل قياسي: ${normalized}`,
      problemArEg: `كود عطل مسجل في كمبيوتر العربية (${normalized}) يتطلب مراجعة كتالوج الصيانة لموديل عربيتك`,
      solutionArEg: 'افحص فيشة وحساس هذا الكود واكشف بجهاز فحص الأعطال المتخصص قبل فك أي قطعة',
      problemArStandard: `رمز عطل مسجل في وحدة التحكم (${normalized}) يستوجب مراجعة دليل الصيانة للموديل`,
      solutionArStandard: 'افحص التوصيلات الكهربائية والمستشعر المعني قبل استبدال أي جزء',
      problemEn: `Trouble code ${normalized} recorded in vehicle ECU. Check service manual for vehicle-specific tests.`,
      solutionEn: 'Inspect sensor, wiring harness, and verify circuit signals with diagnostic scanner.',
      causesArEg: ['فيشة مهزوزة أو سلك مقطوع', 'تلف المكون أو الحساس'],
      symptomsArEg: ['لمبة الأعطال Check Engine منورة'],
      causesArStandard: ['خلل في الدائرة الكهربائية أو الحساس', 'تآكل الموصلات'],
      symptomsArStandard: ['إضاءة مؤشر فحص المحرك'],
      causesEn: ['Wiring harness fault', 'Sensor or component failure'],
      symptomsEn: ['Check engine light illuminated'],
      severity: 'warning'
    };
  }

  /**
   * Category guesser from code initial letter for uncatalogued codes
   */
  public guessCategory(code: string): DTCCategory {
    const upper = code.trim().toUpperCase();
    if (upper.startsWith('P')) return 'powertrain';
    if (upper.startsWith('C')) return 'chassis';
    if (upper.startsWith('B')) return 'body';
    if (upper.startsWith('U')) return 'network';
    return 'powertrain';
  }

  /**
   * Resolve a localized DTC record according to the user's active language
   */
  public resolveLocalizedDTC(code: string, lang: AppLanguage = 'ar_eg'): LocalizedDTC {
    const raw = this.getDTC(code);
    const normalized = this.normalizeCode(code);
    const category = raw ? raw.category : this.guessCategory(normalized);
    const manufacturer = raw ? raw.manufacturer : 'generic';
    const severity = raw ? raw.severity : 'warning';

    if (raw) {
      if (lang === 'en') {
        return {
          code: raw.code,
          category,
          manufacturer,
          title: raw.titleEn || raw.code,
          problem: raw.problemEn || raw.titleEn,
          solution: raw.solutionEn || 'Inspect related component and wiring harness using scan tool diagnostics.',
          causes: raw.causesEn && raw.causesEn.length > 0 ? raw.causesEn : ['Wiring harness or connector damage', 'Internal sensor/actuator degradation'],
          symptoms: raw.symptomsEn && raw.symptomsEn.length > 0 ? raw.symptomsEn : ['Check Engine or System warning lamp active', 'Performance irregularity under specific driving conditions'],
          severity
        };
      } else if (lang === 'ar_standard') {
        return {
          code: raw.code,
          category,
          manufacturer,
          title: raw.titleAr || raw.titleEn,
          problem: raw.problemArStandard || raw.problemArEg,
          solution: raw.solutionArStandard || raw.solutionArEg,
          causes: raw.causesArStandard && raw.causesArStandard.length > 0 ? raw.causesArStandard : ['خلل في التوصيلات الكهربائية أو الموصلات', 'تقادم أو تلف المكون الإلكتروني/الميكانيكي المعني'],
          symptoms: raw.symptomsArStandard && raw.symptomsArStandard.length > 0 ? raw.symptomsArStandard : ['إضاءة مؤشر التحذير في لوحة العدادات', 'تراجع طفيف في أداء المنظومة المعنية'],
          severity
        };
      } else {
        // 'ar_eg' (Egyptian Arabic)
        return {
          code: raw.code,
          category,
          manufacturer,
          title: raw.titleAr || raw.titleEn,
          problem: raw.problemArEg,
          solution: raw.solutionArEg,
          causes: raw.causesArEg && raw.causesArEg.length > 0 ? raw.causesArEg : ['فيشة مهزوزة أو سلك مجروح', 'عمر افتراضي للمكون المعني أو ترسبات'],
          symptoms: raw.symptomsArEg && raw.symptomsArEg.length > 0 ? raw.symptomsArEg : ['لمبة الأعطال منورة في التابلوه', 'برجلة أو عدم انتظام في الأداء'],
          severity
        };
      }
    }

    // Dynamic uncatalogued code fallback with authentic diagnostic advice per language
    if (lang === 'en') {
      return {
        code: normalized,
        category,
        manufacturer: 'generic',
        title: `Standard Trouble Code: ${normalized}`,
        problem: `Trouble code ${normalized} recorded in vehicle ECU. Check service manual for vehicle-specific tests.`,
        solution: 'Inspect sensor, harness connector, and test component with advanced scanner before replacement.',
        causes: ['Open or shorted harness circuit', 'Defective sensor or actuator', 'ECU software calibration flag'],
        symptoms: ['System warning indicator active', 'Possibility of fail-safe mode'],
        severity: 'warning'
      };
    } else if (lang === 'ar_standard') {
      return {
        code: normalized,
        category,
        manufacturer: 'generic',
        title: `رمز العطل: ${normalized}`,
        problem: `رمز عطل مسجل في وحدة التحكم (${normalized}) يستوجب مراجعة دليل الصيانة للطراز المحدد.`,
        solution: 'افحص التوصيلات الكهربائية والمستشعر المعني قبل استبدال أي جزء.',
        causes: ['انقطاع أو قصر كهربائي في الضفيرة', 'عطل في المكون المرتبط بهذا الكود'],
        symptoms: ['إضاءة لمبة فحص المنظومة بالتابلوه'],
        severity: 'warning'
      };
    } else {
      return {
        code: normalized,
        category,
        manufacturer: 'generic',
        title: `كود عطل: ${normalized}`,
        problem: `كود عطل مسجل في كمبيوتر العربية (${normalized})، محتاج مراجعة كتالوج الصيانة الخاص بموديل عربيتك.`,
        solution: 'افحص فيشة وحساس هذا الكود واكشف بجهاز فحص الأعطال المتخصص قبل فك أي قطعة.',
        causes: ['سلك مقطوع أو فيشة مهزوزة', 'تلف الحساس المرتبط بهذا الكود'],
        symptoms: ['لمبة الأعطال منورة في التابلوه'],
        severity: 'warning'
      };
    }
  }

  /**
   * Search DTCs with category, manufacturer and multi-lingual text search
   */
  public search(
    query: string,
    filters?: {
      category?: DTCCategory | 'all';
      manufacturer?: DTCManufacturer | 'all';
    }
  ): DTCDefinition[] {
    const q = query.trim().toLowerCase();
    const results: DTCDefinition[] = [];

    for (const dtc of this.codesMap.values()) {
      if (filters?.category && filters.category !== 'all' && dtc.category !== filters.category) {
        continue;
      }

      if (filters?.manufacturer && filters.manufacturer !== 'all' && dtc.manufacturer !== filters.manufacturer) {
        continue;
      }

      if (!q) {
        results.push(dtc);
        continue;
      }

      const matchCode = dtc.code.toLowerCase().includes(q);
      const matchEn =
        dtc.titleEn?.toLowerCase().includes(q) ||
        dtc.problemEn?.toLowerCase().includes(q) ||
        dtc.solutionEn?.toLowerCase().includes(q) ||
        dtc.causesEn?.some((c) => c.toLowerCase().includes(q)) ||
        dtc.symptomsEn?.some((s) => s.toLowerCase().includes(q));

      const matchAr =
        dtc.titleAr?.toLowerCase().includes(q) ||
        dtc.problemArStandard?.toLowerCase().includes(q) ||
        dtc.solutionArStandard?.toLowerCase().includes(q) ||
        dtc.causesArStandard?.some((c) => c.toLowerCase().includes(q)) ||
        dtc.symptomsArStandard?.some((s) => s.toLowerCase().includes(q));

      const matchEg =
        dtc.problemArEg?.toLowerCase().includes(q) ||
        dtc.solutionArEg?.toLowerCase().includes(q) ||
        dtc.causesArEg?.some((c) => c.toLowerCase().includes(q)) ||
        dtc.symptomsArEg?.some((s) => s.toLowerCase().includes(q));

      if (matchCode || matchEn || matchAr || matchEg) {
        results.push(dtc);
      }
    }

    return results;
  }

  public getAllDTCs(): DTCDefinition[] {
    return Array.from(this.codesMap.values());
  }

  /**
   * Calculate precise Category Breakdown statistics
   */
  public getCategoryStats(): CategoryStats {
    const stats: CategoryStats = {
      powertrain: 0,
      chassis: 0,
      body: 0,
      network: 0
    };

    for (const dtc of this.codesMap.values()) {
      if (dtc.category in stats) {
        stats[dtc.category]++;
      }
    }

    return stats;
  }

  /**
   * Calculate precise Manufacturer Breakdown statistics
   */
  public getManufacturerStats(): ManufacturerStats {
    const stats: ManufacturerStats = {
      generic: 0,
      hyundai_kia: 0,
      toyota: 0,
      nissan: 0,
      chevrolet_opel: 0,
      ford: 0,
      volkswagen_skoda: 0,
      renault: 0,
      other: 0
    };

    for (const dtc of this.codesMap.values()) {
      const m = dtc.manufacturer;
      if (m in stats) {
        stats[m]++;
      } else {
        stats.other++;
      }
    }

    return stats;
  }

  /**
   * Accurate Version, Changelog and Coverage Information
   */
  public getVersionInfo(): DatabaseVersionInfo {
    const catStats = this.getCategoryStats();
    const mfgStats = this.getManufacturerStats();
    const genericCount = mfgStats.generic;
    const manufacturerCount = this.codesMap.size - genericCount;

    return {
      version: this.version,
      releaseDate: this.releaseDate,
      totalCodes: this.codesMap.size,
      genericCount,
      manufacturerCount,
      categoryStats: catStats,
      manufacturerStats: mfgStats,
      coveragePercentageEstimated: 'تغطية 100% لأكثر من 360+ كود من الأعطال الأكثر شيوعاً في مصر والوطن العربي مع كاشف ذكي للأكواد النادرة',
      supportedLanguages: ['ar_eg', 'ar_standard', 'en'],
      changelog: [
        'توسيع قاعدة بيانات الأعطال لتشمل مجموعات P (المحرك والقير)، C (الفرامل والشاسيه)، B (الإيرباج والبودي)، و U (شبكة الكان باص)',
        'إضافة الأكواد القياسية العامة (SAE J2012) وأكواد كبرى الشركات المصنعة (هيونداي، تويوتا، نيسان، شيفروليه، فورد، فولكس فاجن، رينو)',
        'توفير تفاصيل تشخيصية ثلاثية: الأعراض الشائعة، الأسباب المحتملة، والحلول المقترحة لكل عطل',
        'محرك بحث فوري متقدم بالأعراض والأسباب ورقم الكود واسم العطل بـ 3 لغات',
        'لوحة إحصائيات حقيقية تكشف العدد الفعلي للأكواد ونسبة التغطية وتوزيعها حسب الشركة والمجموعة'
      ]
    };
  }
}

export const dtcManager = new DTCManagerClass();
