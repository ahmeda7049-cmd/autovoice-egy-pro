/**
 * Standard Generic OBD2 DTCs (Powertrain, Chassis, Body, Network)
 * AutoVoice EGY PRO V2
 * Multi-Language Engine: Egyptian Arabic, Standard Arabic, and English
 */

import { DTCDefinition } from './types';
import { GENERIC_POWERTRAIN_CODES } from './genericPowertrain';
import { GENERIC_CHASSIS_BODY_NETWORK_CODES } from './genericChassisBodyNetwork';
import { EXTENDED_DTC_CODES } from './extendedStandardCodes';

export const GENERIC_DTC_LIST: DTCDefinition[] = [
  ...GENERIC_POWERTRAIN_CODES,
  ...GENERIC_CHASSIS_BODY_NETWORK_CODES,
  ...EXTENDED_DTC_CODES
];
