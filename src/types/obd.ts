export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type SeverityLevel = 'critical' | 'warning' | 'info';

export interface PidReading {
  value: string; // e.g. "850 د/ق" or "غير مدعوم في سيارتك"
  isSupported: boolean;
  rawValue?: string;
}

export interface EngineVitals {
  rpm: PidReading;
  coolantTemp: PidReading;
  intakePressure: PidReading;
}

export interface DTCFault {
  code: string;
  problemAr: string;     // e.g. "خلل في البوجيه رقم 1"
  solutionAr: string;    // e.g. "غير البوجيه أو الكويل"
  titleAr: string;       // Short description
  titleEn?: string;
  severity: SeverityLevel;
  milTriggered?: boolean;
}

export interface ConnectionConfig {
  mode: 'real_bluetooth' | 'simulator';
  deviceName?: string;
  statusMessage?: string;
}

export interface ScanReport {
  id: string;
  createdAt: string;
  formattedDate: string;
  faults: DTCFault[];
  vitals?: {
    rpm: string;
    coolant: string;
    pressure: string;
  };
  status: 'healthy' | 'issues';
}

