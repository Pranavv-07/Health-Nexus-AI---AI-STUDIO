export type RiskLevel = 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AreaType = 'Urban' | 'Rural' | 'Tribal';
export type TerrainType = 'Plain' | 'Coastal' | 'Hilly';
export type EscalationLevel = 'PHC' | 'District' | 'State' | 'National';
export type UserRole = 'PHC_STAFF' | 'DISTRICT_AUTHORITY' | 'STATE_AUTHORITY' | 'NATIONAL_AUTHORITY' | 'ADMIN';
export type ResourceCategory = 'medicines' | 'beds' | 'staff' | 'diagnostics' | 'emergency';

export interface PHC {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string;
  cityTown: string;
  areaType: AreaType;
  terrainType: TerrainType;
  isDisasterProne: boolean;
  populationServed: number;
  lat: number;
  lng: number;
  contactPerson: string;
  phone: string;
  
  // Real-time status
  overallRisk: RiskLevel;
  dataFreshnessMinutes: number;
  dataCompleteness: number; // 0 - 100
  dataConsistency: number; // 0 - 100
  dataReliabilityScore: number; // 0 - 100
  dataReliabilityStatus: 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Current metrics
  patientFootfallDaily: number;
  patientFootfallTrend: number; // % change
  bedCapacity: number;
  bedOccupancy: number;
  staffTotal: number;
  staffAvailable: number;
  specialistPresent: boolean;
  
  // Contextual factors
  weather: {
    tempC: number;
    rainfallMm: number;
    condition: 'Sunny' | 'Humid' | 'Moderate Rain' | 'Heavy Rain' | 'Extreme Cyclone';
    season: 'Monsoon' | 'Summer' | 'Winter' | 'Post-Monsoon';
  };
  dominantDiseaseTrend: {
    disease: string;
    weeklySurgePercent: number;
    activeCases: number;
  };
  supplyLeadTimeDays: number;
  lastSyncTimestamp: string;
}

export interface ResourceItem {
  id: string;
  phcId: string;
  category: ResourceCategory;
  name: string;
  code: string;
  currentStock: number;
  safetyStockLevel: number;
  unit: string;
  dailyConsumptionRate: number;
  expiryDate?: string;
  predictedDemand7d: number;
  predictedRange7d: [number, number];
  shortageProbability: number; // 0 - 100
  daysUntilShortage: number;
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
}

export interface ForecastPoint {
  date: string;
  dayLabel: string;
  historicalActual?: number;
  predictedDemand: number;
  predictedRangeLow: number;
  predictedRangeHigh: number;
  projectedStockRemaining: number;
  safetyThreshold: number;
  treeModelForecast: number;
  timeSeriesModelForecast: number;
  contextualModelForecast: number;
}

export interface ResourceForecast {
  phcId: string;
  phcName: string;
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  unit: string;
  currentStock: number;
  safetyLevel: number;
  predictedDemandTotal: number;
  predictedRange: [number, number];
  shortageProbability: number;
  daysUntilShortage: number;
  riskLevel: RiskLevel;
  confidenceLevel: ConfidenceLevel;
  ensembleWeights: {
    treeBased: number;
    timeSeries: number;
    contextual: number;
  };
  keyDrivers: string[];
  points: ForecastPoint[];
}

export interface Alert {
  id: string;
  phcId: string;
  phcName: string;
  district: string;
  state: string;
  resourceCategory: ResourceCategory;
  resourceName: string;
  severity: RiskLevel;
  escalationLevel: EscalationLevel;
  title: string;
  message: string;
  currentCondition: string;
  predictedCondition: string;
  expectedImpact: string;
  recommendedAction: string;
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  recommendationId?: string;
}

export interface RedistributionOption {
  sourcePhcId: string;
  sourcePhcName: string;
  sourceDistrict: string;
  surplusAvailable: number;
  distanceKm: number;
  estimatedTransitHours: number;
  sourceRiskLevel: RiskLevel;
  transferFeasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  feasibilityScore: number; // 0 - 100
}

export interface Recommendation {
  id: string;
  alertId?: string;
  targetPhcId: string;
  targetPhcName: string;
  targetDistrict: string;
  targetState: string;
  resourceCategory: ResourceCategory;
  resourceName: string;
  requiredQuantity: number;
  unit: string;
  shortageProbability: number;
  daysUntilShortage: number;
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  
  // Selected source PHC
  selectedSource: RedistributionOption;
  alternativeSources: RedistributionOption[];
  
  // Structured Explainability
  whyExplanation: string;
  whatExplanation: string;
  whenExplanation: string;
  certaintyExplanation: string;
  sourceExplanation: string;
  whyThisSourceExplanation: string;
  actionSummary: string;
  requiredApprovalRole: UserRole;
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvalRole?: string;
  decisionTimestamp?: string;
  decisionNotes?: string;
  createdAt: string;
}

export interface CascadeNode {
  id: string;
  label: string;
  category: 'Trigger' | 'Epidemiology' | 'Footfall' | 'PrimaryResource' | 'SecondaryResource' | 'RegionalPressure';
  currentValue: string;
  predictedChange: string;
  risk: RiskLevel;
  confidence: ConfidenceLevel;
  description: string;
}

export interface CascadeEdge {
  from: string;
  to: string;
  impactWeight: number; // 0 - 1
  label?: string;
}

export interface CascadeGraph {
  nodes: CascadeNode[];
  edges: CascadeEdge[];
  scenarioSummary: string;
  activeCascadeLevel: number;
}

export interface WhatIfScenarioInput {
  footfallPercentChange: number; // e.g. +30
  supplyDelayDays: number; // e.g. 3
  rainfallCondition: 'Normal' | 'High' | 'Extreme';
  staffAvailabilityCondition: 'Normal' | 'Reduced' | 'Critical';
}

export interface WhatIfSimulationResult {
  input: WhatIfScenarioInput;
  affectedPhcsCount: number;
  criticalPhcsCount: number;
  projectedMedicineDeficitUnits: number;
  projectedBedDeficitCount: number;
  projectedStaffHoursShortage: number;
  baselineVsSimulated: {
    metric: string;
    baseline: number;
    simulated: number;
    unit: string;
    changePercent: number;
    risk: RiskLevel;
  }[];
  aiExplanation: string;
  recommendedMitigations: string[];
}

export interface FederatedNode {
  id: string;
  state: string;
  nodeName: string;
  activePhcsCount: number;
  localDatasetSize: number; // e.g. records
  localAccuracy: number; // 0 - 100%
  localLoss: number;
  lastRoundContributionWeight: number;
  characteristic: string;
  dataDistributionType: string;
  status: 'ONLINE' | 'TRAINING' | 'SYNCED';
}

export interface FederatedRound {
  roundNumber: number;
  timestamp: string;
  participatingNodes: number;
  globalAccuracy: number;
  globalLoss: number;
  aggregationAlgorithm: string;
  accuracyGainPercent: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  notes: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  status: 'SUCCESS' | 'WARNING' | 'REJECTED';
  details: string;
  ipAddress: string;
}

export interface SystemIntegrationStatus {
  connectorName: string;
  endpoint: string;
  sourceSystem: string;
  status: 'HEALTHY' | 'DEGRADED' | 'STALE' | 'ERROR';
  lastSync: string;
  recordsIngested: number;
  syncFrequency: string;
  errorRate: number;
}

export interface ModelMetric {
  modelName: string;
  modelType: string;
  resourceCategory: ResourceCategory;
  mae: number;
  rmse: number;
  r2Score: number;
  currentWeight: number;
  sampleCount: number;
}

export interface UserSession {
  username: string;
  fullName: string;
  role: UserRole;
  assignedJurisdiction: string;
  badgeNumber: string;
}
