/**
 * DTC (Diagnostic Trouble Codes) Database Types
 * AutoVoice EGY PRO V2
 * Multi-Language Support: Egyptian Arabic, Standard Arabic, and English
 */

export type AppLanguage = 'ar_eg' | 'ar_standard' | 'en';

export type DTCCategory = 'powertrain' | 'chassis' | 'body' | 'network';

export type DTCManufacturer = 
  | 'generic'
  | 'hyundai_kia'
  | 'toyota'
  | 'nissan'
  | 'chevrolet_opel'
  | 'renault'
  | 'volkswagen_skoda'
  | 'ford'
  | 'other';

export type SeverityLevel = 'critical' | 'warning' | 'info';

export interface DTCDefinition {
  code: string;                 // e.g. "P0301"
  category: DTCCategory;        // powertrain / chassis / body / network
  manufacturer: DTCManufacturer;// generic or specific brand
  titleEn: string;              // Official English title
  titleAr: string;              // Standard Arabic title
  
  // Egyptian Arabic
  problemArEg: string;          // المشكلة بالعامية المصرية
  solutionArEg: string;         // الحل بالعامية المصرية
  causesArEg?: string[];        // الأسباب المحتملة بالمصري
  symptomsArEg?: string[];      // الأعراض بالمصري
  
  // Standard Arabic (الفصحى)
  problemArStandard: string;    // المشكلة بالعربية الفصحى
  solutionArStandard: string;   // الحل المقترح بالعربية الفصحى
  causesArStandard?: string[];  // الأسباب المحتملة بالفصحى
  symptomsArStandard?: string[];// الأعراض بالفصحى
  
  // English
  problemEn: string;            // Diagnostic issue in English
  solutionEn: string;           // Recommended repair in English
  causesEn?: string[];          // Probable causes in English
  symptomsEn?: string[];        // Common symptoms in English

  severity: SeverityLevel;      // critical / warning / info
}

export interface LocalizedDTC {
  code: string;
  category: DTCCategory;
  manufacturer: DTCManufacturer;
  title: string;
  problem: string;
  solution: string;
  causes: string[];
  symptoms: string[];
  severity: SeverityLevel;
}

export interface CategoryStats {
  powertrain: number;
  chassis: number;
  body: number;
  network: number;
}

export interface ManufacturerStats {
  generic: number;
  hyundai_kia: number;
  toyota: number;
  nissan: number;
  chevrolet_opel: number;
  ford: number;
  volkswagen_skoda: number;
  renault: number;
  other: number;
}

export interface DatabaseVersionInfo {
  version: string;              // e.g. "2.4.0-EXPANDED"
  releaseDate: string;          // e.g. "2026-11-07"
  totalCodes: number;
  genericCount: number;
  manufacturerCount: number;
  categoryStats: CategoryStats;
  manufacturerStats: ManufacturerStats;
  coveragePercentageEstimated: string;
  supportedLanguages: AppLanguage[];
  changelog: string[];
}
