
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DTC_DETAIL = 'DTC_DETAIL',
  FULL_DIAGNOSTIC = 'FULL_DIAGNOSTIC',
  FAULTS = 'FAULTS',
  COMPONENTS = 'COMPONENTS',
  LOGS = 'LOGS',
  CHAT = 'CHAT',
  VISION = 'VISION',
  SETTINGS = 'SETTINGS',
  LIVE_MONITOR = 'LIVE_MONITOR',
  LIVE_DATA_COURSE = 'LIVE_DATA_COURSE'
}

export type Language = 'en' | 'es';

export interface VehicleInfo {
  brand: string;
  model: string;
  engine: string;
  year: string;
  vin?: string;
}

export interface FaultCode {
  code: string;
  severity: string;
  desc: string;
  system: string;
}

export interface StoreComparison {
  store: 'Amazon' | 'eBay' | 'Mercado Libre' | 'Refacciones Treviño' | 'Joomar';
  price: string;
  shipping: string;
  url: string;
}

export interface FullDiagnosticResult {
  summary: string;
  likelyRootCause: string;
  possibleFailures: {
    description: string;
    probability: number;
    partNameEnglish: string;
  }[];
  affectedPart: string;
  confidence: number;
  correlations: {
    dtc: string;
    symptom: string;
    explanation: string;
  }[];
  urgentActions: string[];
  estimatedDifficulty: 'Bajo' | 'Medio' | 'Alto';
  repairSteps: {
    number: number;
    instruction: string;
  }[];
  requiredTools: string[];
  groundingSources?: { title: string; uri: string }[];
  priceComparison: StoreComparison[];
}

export interface SavedDiagnostic {
  id: string;
  date: string;
  vehicle: VehicleInfo;
  result: FullDiagnosticResult;
  codes: string[];
  symptoms: string;
}

// Fix: Added missing interface for DTC detail response
export interface DTCExplanation {
  code: string;
  description: string;
  symptoms: string[];
  causes: {
    description: string;
    probability: number;
  }[];
  solutions: {
    step: string;
    description: string;
  }[];
}

// Fix: Added missing interface for vehicle sensor mapping
export interface SensorLocation {
  name: string;
  importance: 'Alta' | 'Media' | 'Baja';
  location: string;
  function: string;
}
