/**
 * OBD2 Database Service Bridge
 * AutoVoice EGY PRO V2
 * Bridges legacy calls to the new independent DTCManager subsystem
 */

import { DTCFault } from '../types/obd';
import { dtcManager } from '../database/dtcManager';

export const DTC_DATABASE: DTCFault[] = dtcManager.getAllDTCs().map(d => ({
  code: d.code,
  problemAr: d.problemArEg,
  solutionAr: d.solutionArEg,
  titleAr: d.titleAr,
  titleEn: d.titleEn,
  severity: d.severity,
}));

export function findDtcInDatabase(code: string): DTCFault {
  const def = dtcManager.resolveDTC(code);
  return {
    code: def.code,
    problemAr: def.problemArEg,
    solutionAr: def.solutionArEg,
    titleAr: def.titleAr,
    titleEn: def.titleEn,
    severity: def.severity,
  };
}
