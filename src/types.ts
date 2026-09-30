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

// ==========================================
// FEATURE 1: HEALTHCARE DIGITAL TWIN
// ==========================================
export type TimelineStep = 'T-7' | 'T-3' | 'TODAY' | 'T+1' | 'T+3' | 'T+7' | 'T+14';

export interface DigitalTwinNodeState {
  phcId: string;
  name: string;
  code: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  areaType: AreaType;
  terrainType: TerrainType;
  currentRisk: RiskLevel;
  projectedRisk: RiskLevel;
  bedOccupancy: number;
  bedCapacity: number;
  patientFootfallDaily: number;
  staffAvailable: number;
  staffTotal: number;
  criticalResourceStockoutRisk: boolean;
  activeSurgeDisease: string;
  weatherCondition: string;
  rainfallMm: number;
}

export interface DigitalTwinFlow {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  resourceName: string;
  quantity: number;
  unit: string;
  status: 'PLANNED' | 'IN_TRANSIT' | 'DELIVERED';
  corridorDistanceKm: number;
  estimatedHours: number;
}

export interface DigitalTwinSnapshot {
  timelineStep: TimelineStep;
  timestamp: string;
  nodes: DigitalTwinNodeState[];
  flows: DigitalTwinFlow[];
  networkShortageIndex: number; // 0 - 100
  networkResilienceScore: number;
  activeEmergencyFlag: boolean;
  summary: string;
}

// ==========================================
// FEATURE 2: AI RESOURCE ALLOCATION OPTIMIZER
// ==========================================
export interface OptimizationObjectiveWeights {
  minimizeShortages: number; // 0.0 - 1.0
  minimizeDistance: number;
  minimizeResponseTime: number;
  preserveBuffers: number;
  minimizeCost: number;
  minimizeRisk: number;
}

export interface NetworkShortageDemand {
  phcId: string;
  phcName: string;
  district: string;
  resourceName: string;
  quantityNeeded: number;
  unit: string;
  daysUntilStockout: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface NetworkSurplusSupply {
  phcId: string;
  phcName: string;
  district: string;
  resourceName: string;
  totalStock: number;
  safetyBuffer: number;
  surplusAvailable: number;
  unit: string;
}

export interface OptimizedTransferAllocation {
  id: string;
  sourcePhcId: string;
  sourcePhcName: string;
  targetPhcId: string;
  targetPhcName: string;
  resourceName: string;
  allocatedUnits: number;
  unit: string;
  distanceKm: number;
  estimatedHours: number;
  estimatedCostInr: number;
  score: number;
  rationale: string;
  status: 'PROPOSED' | 'APPROVED' | 'DISPATCHED';
}

export interface OptimalResourcePlan {
  id: string;
  timestamp: string;
  objectiveWeights: OptimizationObjectiveWeights;
  allocations: OptimizedTransferAllocation[];
  unmetDemands: NetworkShortageDemand[];
  beforeMetrics: {
    totalShortageUnits: number;
    atRiskPhcsCount: number;
    networkRiskScore: number;
  };
  afterMetrics: {
    remainingShortageUnits: number;
    atRiskPhcsCount: number;
    networkRiskScore: number;
    shortageReductionPercent: number;
  };
  aiExplanation: string;
}

// ==========================================
// FEATURE 3: LAST-MILE LOGISTICS INTELLIGENCE
// ==========================================
export type VehicleType = 'DRONE' | 'AMBULANCE_4X4' | 'TEMPERATURE_CONTROLLED_VAN' | 'STANDARD_TRUCK';
export type RoadCondition = 'NORMAL' | 'HEAVY_RAIN' | 'FLOODED' | 'ROAD_CLOSED' | 'TRAFFIC_CONGESTION';

export interface LogisticsRouteOption {
  id: string;
  name: string;
  distanceKm: number;
  baselineTransitMinutes: number;
  adjustedTransitMinutes: number;
  roadCondition: RoadCondition;
  feasibilityScore: number; // 0 - 100
  riskLevel: RiskLevel;
  checkpoints: string[];
  isRecommended: boolean;
  rationale: string;
}

export interface LogisticsTransferDetail {
  id: string;
  originPhcId: string;
  originName: string;
  originDistrict: string;
  destinationPhcId: string;
  destinationName: string;
  destinationDistrict: string;
  resourceName: string;
  quantity: number;
  unit: string;
  urgency: RiskLevel;
  vehicleType: VehicleType;
  selectedRoute: LogisticsRouteOption;
  alternativeRoutes: LogisticsRouteOption[];
  deliveryWindowHours: number;
  coldChainCompliant: boolean;
  transitStatus: 'READY' | 'DISPATCHED' | 'DELIVERED';
}

// ==========================================
// FEATURE 4: MEDICINE EXPIRY + WASTE INTELLIGENCE
// ==========================================
export interface MedicineBatch {
  id: string;
  batchNumber: string;
  phcId: string;
  phcName: string;
  district: string;
  medicineName: string;
  currentStock: number;
  unit: string;
  unitCostInr: number;
  expiryDate: string;
  daysToExpiry: number;
  dailyConsumptionRate: number;
  expectedUsageBeforeExpiry: number;
  projectedWastageUnits: number;
  projectedWastageInr: number;
  wasteRiskStatus: 'SAFE' | 'NEAR_EXPIRY' | 'HIGH_WASTE_RISK' | 'OVERSTOCK';
}

export interface ExpiryAwareRedistributionProposal {
  id: string;
  batchId: string;
  batchNumber: string;
  sourcePhcId: string;
  sourcePhcName: string;
  targetPhcId: string;
  targetPhcName: string;
  medicineName: string;
  unitsToTransfer: number;
  daysToExpiry: number;
  wastageAvoidedUnits: number;
  valuePreservedInr: number;
  rationale: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
}

export interface ResourceCircularitySummary {
  totalMonitoredBatches: number;
  potentialWastageUnits: number;
  potentialWastageValueInr: number;
  avoidedWastageUnits: number;
  avoidedWastageValueInr: number;
  circularityScore: number; // 0 - 100
  batchesAtRiskCount: number;
}

// ==========================================
// FEATURE 5: HEALTHCARE RESILIENCE SCORE
// ==========================================
export interface FacilityResilienceScore {
  phcId: string;
  phcName: string;
  district: string;
  state: string;
  areaType: AreaType;
  overallScore: number; // 0 - 100
  dimensions: {
    medicines: number;
    beds: number;
    staff: number;
    diagnostics: number;
    supply: number;
    emergencyPreparedness: number;
    dataReliability: number;
    geographicAccessibility: number;
    recoveryCapability: number;
  };
  weakestDimensions: string[];
  historicalTrend: {
    period: '30_DAYS_AGO' | '90_DAYS_AGO' | 'CURRENT' | 'PROJECTED_30D';
    score: number;
  }[];
}

export interface DistrictResilienceSummary {
  district: string;
  state: string;
  averageResilience: number;
  topPerformingPhc: string;
  mostVulnerablePhc: string;
  phcCount: number;
}

// ==========================================
// FEATURE 6: HEALTHCARE EQUITY INTELLIGENCE
// ==========================================
export interface AreaDemographicMetric {
  areaType: AreaType;
  phcsCount: number;
  totalPopulation: number;
  avgBedsPer10k: number;
  avgStaffPer10k: number;
  avgEmergencyAccessTimeMinutes: number;
  avgMedicineAvailabilityPercent: number;
  vulnerabilityIndex: number; // 0 - 100
}

export interface AccessibilityDisparityGap {
  urbanAccessMinutes: number;
  remoteAccessMinutes: number;
  gapMinutes: number;
  stateAvgGapMinutes: number;
  severity: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface EquityAlert {
  id: string;
  district: string;
  title: string;
  description: string;
  disparityFactor: string;
  recommendedIntervention: string;
  timestamp: string;
}

// ==========================================
// FEATURE 7: COUNTERFACTUAL POLICY SIMULATOR
// ==========================================
export interface PolicyScenarioConfig {
  id: string;
  name: string;
  description: string;
  safetyStockMultiplier: number; // e.g. 1.20 for +20%
  extraNursesPerPhc: number; // e.g. 1
  leadTimeReductionDays: number; // e.g. 2
  establishStockpile: boolean;
  mobileDiagnosticUnitsCount: number;
  preemptiveRedistribution: boolean;
}

export interface PolicyScenarioOutcome {
  scenarioId: string;
  scenarioName: string;
  shortageProbability: number; // %
  criticalPhcsCount: number;
  expectedStockoutsCount: number;
  bedPressureIndex: number;
  staffBurnoutRisk: number;
  transportRequirementKm: number;
  wastageRatePercent: number;
  avgResponseTimeHours: number;
  operationalResilienceScore: number;
}

export interface PolicyComparisonReport {
  scenarios: PolicyScenarioOutcome[];
  baseline: PolicyScenarioOutcome;
  geminiPolicyAnalysis: string;
}

// ==========================================
// FEATURE 8: AI MODEL + DATA DRIFT SENTINEL
// ==========================================
export interface DriftMetric {
  metricName: string;
  baselineValue: number;
  currentObservedValue: number;
  driftPercent: number;
  isDriftDetected: boolean;
  status: 'STABLE' | 'WARNING' | 'CRITICAL_DRIFT';
}

export interface AiSystemHealth {
  overallScore: number; // 0 - 100
  dataQualityScore: number;
  modelAccuracyScore: number;
  driftIndex: number;
  confidenceStability: number;
  regionalReliability: number;
  safetyThrottlingActive: boolean;
  retrainingRecommended: boolean;
  driftMetrics: DriftMetric[];
  recentDriftEvents: {
    id: string;
    timestamp: string;
    title: string;
    detail: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

// ==========================================
// FEATURE 9: EDGE + OFFLINE PHC MODE
// ==========================================
export interface EdgeNodeState {
  phcId: string;
  phcName: string;
  connectivityStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastSyncTime: string;
  pendingSyncQueueCount: number;
  cachedRecordsCount: number;
  isLocalInferenceActive: boolean;
}

export interface EdgeQueuedAction {
  id: string;
  timestamp: string;
  actionType: 'CONSUMPTION_LOG' | 'BED_UPDATE' | 'STAFF_SHIFT' | 'LOCAL_ALERT';
  payload: any;
  syncStatus: 'QUEUED' | 'SYNCED' | 'CONFLICT';
}

export interface EdgeSyncResult {
  syncedCount: number;
  conflictsDetectedCount: number;
  status: 'SUCCESS' | 'RESOLVED_WITH_WARNINGS' | 'OFFLINE';
  timestamp: string;
}

// ==========================================
// FEATURE 10: AI EMERGENCY INCIDENT COMMANDER
// ==========================================
export interface IncidentPriorityAction {
  id: string;
  priorityRank: number;
  title: string;
  description: string;
  ownerRole: UserRole;
  urgency: RiskLevel;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  expectedImpact: string;
  deadline: string;
}

export interface IncidentTimelineEntry {
  id: string;
  time: string;
  title: string;
  source: string;
  category: string;
  detail: string;
}

export interface IncidentPostMortem {
  incidentId: string;
  completedAt: string;
  summary: string;
  peakPatientSurge: number;
  resourcesMobilizedCount: number;
  responseTimeMinutes: number;
  shortagesPreventedCount: number;
  wastageAvoidedInr: number;
  lessonsLearned: string[];
  modelAccuracyScore: number;
}

export interface IncidentRecord {
  id: string;
  code: string;
  title: string;
  incidentType: 'CYCLONE_FLOOD' | 'DISEASE_OUTBREAK' | 'SUPPLY_GRID_COLLAPSE';
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  startedAt: string;
  affectedPhcsCount: number;
  affectedPhcIds: string[];
  criticalResourcesCount: number;
  patientPressureSurgePercent: number;
  predictedGapSeverity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  timeline: IncidentTimelineEntry[];
  actions: IncidentPriorityAction[];
  aiResponsePlan: {
    summary: string;
    strategicDirectives: string[];
    priorities: {
      rank: number;
      directive: string;
      rationale: string;
      requiredApproval: UserRole;
    }[];
  };
  postMortem?: IncidentPostMortem;
}

// ==========================================
// COMMUNITY IMPACT & JUDGE SCORECARD
// ==========================================
export interface CommunityImpactMetrics {
  potentialStockoutsPrevented: number;
  emergencyResponseTimeMinutesSaved: number;
  resourcesRedistributedUnits: number;
  medicineWastageAvoidedValueInr: number;
  criticalPhcsStabilized: number;
  predictedShortagesEarlyDetected: number;
  resourceUtilizationEfficiencyGain: number; // %
  operationalResilienceImprovementPercent: number; // %
}

export interface JudgeScorecard {
  phcsSimulated: number;
  resourcesTracked: number;
  forecastHorizonDays: number;
  aiConfidencePercent: number;
  federatedNodes: number;
  dataReliabilityScore: number;
  activeRisks: number;
  resourcesOptimized: number;
  shortagesPrevented: number;
  wasteAvoidedInr: number;
  resilienceGainPoints: number;
}
