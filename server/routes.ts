import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import { evaluateDataReliability } from './dataReliability.ts';
import { generateResourceForecast } from './forecasting.ts';
import { getEmergencyCascadeGraph } from './cascade.ts';
import {
  findRedistributionOptions,
  generateRedistributionRecommendation
} from './redistribution.ts';
import { runFederatedTrainingRound } from './federated.ts';
import {
  askHealthNexus,
  generateExecutiveBriefing,
  explainWhatIfScenario,
  isGeminiConnected,
  askIncidentCopilot
} from './gemini.ts';
import { getDigitalTwinSnapshot } from './digitalTwin.ts';
import { runMultiObjectiveAllocation } from './resourceOptimizer.ts';
import { simulateLogisticsTransfer } from './logistics.ts';
import { getMedicineBatches, getExpiryAwareRedistributionProposals, getResourceCircularitySummary } from './wasteIntelligence.ts';
import { calculateFacilityResilience, getAllResilienceScores, getDistrictResilienceSummaries } from './resilienceScore.ts';
import { getEquityMetrics } from './equityIntelligence.ts';
import { runPolicySimulation } from './policySimulator.ts';
import { getAiSystemHealth } from './aiSentinel.ts';
import { getEdgeNodeState, setEdgeConnectivity, addEdgeOfflineAction, triggerEdgeSynchronization } from './edgeNode.ts';
import { getActiveIncident, updateIncidentActionStatus, generateIncidentPostMortem } from './incidentCommander.ts';
import { getCommunityImpactMetrics, getJudgeScorecard } from './impactMetrics.ts';
import { recentAnalyses, vertexAiModels, processMultimodalAnalysis } from './multimodalVision.ts';
import {
  RiskLevel,
  TimelineStep,
  UserRole,
  VehicleType,
  RoadCondition,
  WhatIfScenarioInput,
  WhatIfSimulationResult
} from '../src/types.ts';

export const apiRouter = Router();

// 1. Health & AI Status
apiRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    appName: 'Health-Nexus AI',
    status: 'HEALTHY',
    geminiConnected: isGeminiConnected(),
    aiMode: isGeminiConnected() ? 'Gemini 3.8 Flash Active' : 'Demo AI Mode (Deterministic Fallback)',
    phcsMonitored: db.phcs.length,
    activeScenario: db.currentScenarioName,
    serverTimestamp: new Date().toISOString()
  });
});

// 2. Main Command Center Dashboard
apiRouter.get('/dashboard', (req: Request, res: Response) => {
  const criticalPhcs = db.phcs.filter((p) => p.overallRisk === 'CRITICAL');
  const highRiskPhcs = db.phcs.filter((p) => p.overallRisk === 'HIGH');
  const normalPhcs = db.phcs.filter((p) => p.overallRisk === 'NORMAL' || p.overallRisk === 'LOW');
  
  const pendingApprovals = db.recommendations.filter((r) => r.status === 'PENDING');
  const activeAlerts = db.alerts.filter((a) => a.status === 'ACTIVE');

  let totalFootfall = 0;
  let totalBedsOccupied = 0;
  let totalBedsCapacity = 0;
  let totalStaffAvail = 0;
  let totalStaffCount = 0;

  db.phcs.forEach((p) => {
    totalFootfall += p.patientFootfallDaily;
    totalBedsOccupied += p.bedOccupancy;
    totalBedsCapacity += p.bedCapacity;
    totalStaffAvail += p.staffAvailable;
    totalStaffCount += p.staffTotal;
  });

  const reliability = evaluateDataReliability();

  res.json({
    kpis: {
      phcsMonitored: db.phcs.length,
      criticalCenters: criticalPhcs.length,
      highRiskCenters: highRiskPhcs.length,
      activeAlertsCount: activeAlerts.length,
      pendingApprovalsCount: pendingApprovals.length,
      totalDailyFootfall: totalFootfall,
      systemBedOccupancyPct: Math.round((totalBedsOccupied / totalBedsCapacity) * 100),
      systemStaffAvailabilityPct: Math.round((totalStaffAvail / totalStaffCount) * 100),
      dataReliabilityScore: reliability.overallScore
    },
    riskDistribution: {
      critical: criticalPhcs.length,
      high: highRiskPhcs.length,
      medium: db.phcs.filter((p) => p.overallRisk === 'MEDIUM').length,
      normal: normalPhcs.length
    },
    criticalPhcsSummary: criticalPhcs.map((p) => ({
      id: p.id,
      name: p.name,
      district: p.district,
      state: p.state,
      risk: p.overallRisk,
      footfallDaily: p.patientFootfallDaily,
      footfallTrend: p.patientFootfallTrend,
      disease: p.dominantDiseaseTrend.disease,
      bedOccupancy: `${p.bedOccupancy}/${p.bedCapacity}`
    })),
    recentAlerts: activeAlerts.slice(0, 5),
    topPendingRecommendations: pendingApprovals.slice(0, 3)
  });
});

// 3. PHCs Directory
apiRouter.get('/phcs', (req: Request, res: Response) => {
  const { state, district, risk, search } = req.query;
  let list = db.phcs;

  if (state && typeof state === 'string') {
    list = list.filter((p) => p.state.toLowerCase() === state.toLowerCase());
  }
  if (district && typeof district === 'string') {
    list = list.filter((p) => p.district.toLowerCase() === district.toLowerCase());
  }
  if (risk && typeof risk === 'string') {
    list = list.filter((p) => p.overallRisk.toLowerCase() === risk.toLowerCase());
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

apiRouter.get('/phcs/:id', (req: Request, res: Response) => {
  const phc = db.phcs.find((p) => p.id === req.params.id);
  if (!phc) return res.status(404).json({ error: 'PHC not found' });

  const resources = db.resources.filter((r) => r.phcId === phc.id);
  const alerts = db.alerts.filter((a) => a.phcId === phc.id);
  const recommendations = db.recommendations.filter((r) => r.targetPhcId === phc.id);

  res.json({
    phc,
    resources,
    alerts,
    recommendations
  });
});

// 4. Resources
apiRouter.get('/resources', (req: Request, res: Response) => {
  const { phcId, category, risk } = req.query;
  let list = db.resources;

  if (phcId && typeof phcId === 'string') {
    list = list.filter((r) => r.phcId === phcId);
  }
  if (category && typeof category === 'string') {
    list = list.filter((r) => r.category === category);
  }
  if (risk && typeof risk === 'string') {
    list = list.filter((r) => r.riskLevel === risk);
  }

  res.json(list);
});

// 5. Adaptive Ensemble Forecasts
apiRouter.get('/forecasts/:phcId/:resourceId', (req: Request, res: Response) => {
  const forecast = generateResourceForecast(req.params.phcId, req.params.resourceId);
  if (!forecast) {
    return res.status(404).json({ error: 'Forecast data unavailable for specified resource/PHC' });
  }
  res.json(forecast);
});

// 6. Alerts & Hierarchical Escalation
apiRouter.get('/alerts', (req: Request, res: Response) => {
  const { severity, escalation, status } = req.query;
  let list = db.alerts;

  if (severity && typeof severity === 'string') {
    list = list.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
  }
  if (escalation && typeof escalation === 'string') {
    list = list.filter((a) => a.escalationLevel.toLowerCase() === escalation.toLowerCase());
  }
  if (status && typeof status === 'string') {
    list = list.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  }

  res.json(list);
});

apiRouter.post('/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const alert = db.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  alert.status = 'ACKNOWLEDGED';

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'officer.operations',
    role: (req.body.role as UserRole) || 'DISTRICT_AUTHORITY',
    action: 'ALERT_ACKNOWLEDGED',
    entityType: 'ALERT',
    entityId: alert.id,
    status: 'SUCCESS',
    details: `Alert "${alert.title}" acknowledged by ${(req.body.role as string) || 'DISTRICT_AUTHORITY'}.`,
    ipAddress: req.ip || '10.0.8.4'
  });

  res.json({ message: 'Alert acknowledged successfully', alert });
});

// 7. Recommendations & Human Approval Workflow
apiRouter.get('/recommendations', (req: Request, res: Response) => {
  res.json(db.recommendations);
});

apiRouter.post('/recommendations/generate', (req: Request, res: Response) => {
  const { targetPhcId, resourceId, requiredQty } = req.body;
  const rec = generateRedistributionRecommendation(targetPhcId, resourceId, requiredQty);
  if (!rec) return res.status(400).json({ error: 'No feasible surplus source found' });
  res.json(rec);
});

apiRouter.post('/recommendations/:id/approve', (req: Request, res: Response) => {
  const rec = db.recommendations.find((r) => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

  const approverName = (req.body.user as string) || 'Dr. K. V. Sharma (District Health Officer)';
  const approverRole = (req.body.role as UserRole) || 'DISTRICT_AUTHORITY';
  const notes = (req.body.notes as string) || 'Approved for emergency dispatch via medical courier.';

  rec.status = 'APPROVED';
  rec.approvedBy = approverName;
  rec.approvalRole = approverRole;
  rec.decisionTimestamp = new Date().toISOString();
  rec.decisionNotes = notes;

  // Rebalance simulated inventory
  const targetResource = db.resources.find(
    (r) => r.phcId === rec.targetPhcId && r.name === rec.resourceName
  );
  const sourceResource = db.resources.find(
    (r) => r.phcId === rec.selectedSource.sourcePhcId && r.name === rec.resourceName
  );

  if (targetResource) {
    targetResource.currentStock += rec.requiredQuantity;
    targetResource.riskLevel = 'NORMAL';
    targetResource.shortageProbability = 12;
    targetResource.daysUntilShortage = 18;
  }
  if (sourceResource) {
    sourceResource.currentStock -= rec.requiredQuantity;
  }

  // Update target PHC risk if relieved
  const targetPhc = db.phcs.find((p) => p.id === rec.targetPhcId);
  if (targetPhc) {
    targetPhc.overallRisk = 'LOW';
  }

  // Record immutable audit log
  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: approverName,
    role: approverRole,
    action: 'RESOURCE_TRANSFER_APPROVED',
    entityType: 'RECOMMENDATION',
    entityId: rec.id,
    status: 'SUCCESS',
    details: `Authorized transfer of ${rec.requiredQuantity} ${rec.unit} from ${rec.selectedSource.sourcePhcName} to ${rec.targetPhcName}. Notes: "${notes}"`,
    ipAddress: req.ip || '10.0.8.21'
  });

  res.json({ message: 'Recommendation approved and transfer executed.', recommendation: rec });
});

apiRouter.post('/recommendations/:id/reject', (req: Request, res: Response) => {
  const rec = db.recommendations.find((r) => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

  const rejecterName = (req.body.user as string) || 'Dr. K. V. Sharma (District Health Officer)';
  const rejecterRole = (req.body.role as UserRole) || 'DISTRICT_AUTHORITY';
  const reason = (req.body.reason as string) || 'Local stock buffer adequate; state depot shipment arriving tomorrow.';

  rec.status = 'REJECTED';
  rec.approvedBy = rejecterName;
  rec.approvalRole = rejecterRole;
  rec.decisionTimestamp = new Date().toISOString();
  rec.decisionNotes = reason;

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: rejecterName,
    role: rejecterRole,
    action: 'RESOURCE_TRANSFER_REJECTED',
    entityType: 'RECOMMENDATION',
    entityId: rec.id,
    status: 'REJECTED',
    details: `Rejected transfer of ${rec.requiredQuantity} ${rec.unit} to ${rec.targetPhcName}. Reason: "${reason}"`,
    ipAddress: req.ip || '10.0.8.21'
  });

  res.json({ message: 'Recommendation rejected with logged rationale.', recommendation: rec });
});

// 8. Emergency Cascade Intelligence
apiRouter.get('/emergency/cascade/:phcId?', (req: Request, res: Response) => {
  const graph = getEmergencyCascadeGraph(req.params.phcId);
  res.json(graph);
});

// 9. What-If Scenario Simulator
apiRouter.post('/scenarios/what-if', async (req: Request, res: Response) => {
  const input: WhatIfScenarioInput = {
    footfallPercentChange: Number(req.body.footfallPercentChange) || 30,
    supplyDelayDays: Number(req.body.supplyDelayDays) || 2,
    rainfallCondition: req.body.rainfallCondition || 'High',
    staffAvailabilityCondition: req.body.staffAvailabilityCondition || 'Reduced'
  };

  const surgeMultiplier = 1 + input.footfallPercentChange / 100;
  const delayPenalty = input.supplyDelayDays * 120;
  const staffPenalty = input.staffAvailabilityCondition === 'Critical' ? 0.6 : input.staffAvailabilityCondition === 'Reduced' ? 0.8 : 1.0;

  let totalBaselineMedsDemand = 0;
  let totalSimulatedMedsDemand = 0;
  let baselineBedsNeeded = 0;
  let simulatedBedsNeeded = 0;
  let affectedPhcsCount = 0;
  let criticalPhcsCount = 0;

  db.phcs.forEach((p) => {
    const baseDemand = p.patientFootfallDaily * 3.2;
    const simDemand = baseDemand * surgeMultiplier + (input.rainfallCondition === 'Extreme' ? 250 : 80);
    totalBaselineMedsDemand += baseDemand;
    totalSimulatedMedsDemand += simDemand;

    baselineBedsNeeded += p.bedOccupancy;
    const simBeds = Math.round(p.bedOccupancy * surgeMultiplier * (input.rainfallCondition === 'Extreme' ? 1.4 : 1.15));
    simulatedBedsNeeded += simBeds;

    if (simDemand > baseDemand * 1.2 || simBeds > p.bedCapacity) {
      affectedPhcsCount++;
    }
    if (simBeds > p.bedCapacity * 0.95 || (p.patientFootfallDaily * surgeMultiplier > 400)) {
      criticalPhcsCount++;
    }
  });

  const projectedMedicineDeficit = Math.round(Math.max(0, totalSimulatedMedsDemand - totalBaselineMedsDemand + delayPenalty));
  const projectedBedDeficit = Math.max(0, simulatedBedsNeeded - baselineBedsNeeded);
  const staffHoursDeficit = Math.round((1 - staffPenalty) * db.phcs.length * 48);

  const baselineVsSimulated: {
    metric: string;
    baseline: number;
    simulated: number;
    unit: string;
    changePercent: number;
    risk: RiskLevel;
  }[] = [
    {
      metric: 'Daily Patient Footfall Across Network',
      baseline: db.phcs.reduce((acc, p) => acc + p.patientFootfallDaily, 0),
      simulated: Math.round(db.phcs.reduce((acc, p) => acc + p.patientFootfallDaily, 0) * surgeMultiplier),
      unit: 'patients/day',
      changePercent: input.footfallPercentChange,
      risk: (input.footfallPercentChange > 30 ? 'CRITICAL' : 'HIGH') as RiskLevel
    },
    {
      metric: '7-Day Medicine Demand',
      baseline: Math.round(totalBaselineMedsDemand * 7),
      simulated: Math.round(totalSimulatedMedsDemand * 7),
      unit: 'units',
      changePercent: Math.round(((totalSimulatedMedsDemand - totalBaselineMedsDemand) / totalBaselineMedsDemand) * 100),
      risk: 'CRITICAL' as RiskLevel
    },
    {
      metric: 'Total Inpatient Bed Occupancy',
      baseline: baselineBedsNeeded,
      simulated: simulatedBedsNeeded,
      unit: 'occupied beds',
      changePercent: Math.round(((simulatedBedsNeeded - baselineBedsNeeded) / (baselineBedsNeeded || 1)) * 100),
      risk: (simulatedBedsNeeded > 260 ? 'CRITICAL' : 'HIGH') as RiskLevel
    },
    {
      metric: 'Workforce Capacity Deficit',
      baseline: 0,
      simulated: staffHoursDeficit,
      unit: 'lost clinical hours',
      changePercent: Math.round((1 - staffPenalty) * 100),
      risk: (staffPenalty < 0.7 ? 'CRITICAL' : 'MEDIUM') as RiskLevel
    }
  ];

  const aiExplanation = await explainWhatIfScenario(input, {
    affectedPhcs: affectedPhcsCount,
    criticalPhcs: criticalPhcsCount,
    medicineDeficitUnits: projectedMedicineDeficit,
    bedDeficit: projectedBedDeficit
  });

  const result: WhatIfSimulationResult = {
    input,
    affectedPhcsCount,
    criticalPhcsCount,
    projectedMedicineDeficitUnits: projectedMedicineDeficit,
    projectedBedDeficitCount: projectedBedDeficit,
    projectedStaffHoursShortage: staffHoursDeficit,
    baselineVsSimulated,
    aiExplanation,
    recommendedMitigations: [
      `Pre-position 2,500 units of ORS sachets from Vijayawada and Pune central depots.`,
      `Activate District Emergency Surge Bed Protocols (add +15 temporary cots across coastal centers).`,
      `Authorize telemedicine triaging to offset the ${staffHoursDeficit} clinical hours deficit.`
    ]
  };

  res.json(result);
});

// 10. DEMO CONTROL CENTER: 1-Click Live Emergency Trigger
apiRouter.post('/scenarios/emergency-trigger', (req: Request, res: Response) => {
  db.currentScenarioName = 'Severe Monsoon Flash Flood & Enteric Outbreak';
  db.lastScenarioTimestamp = new Date().toISOString();

  // Escalate Guntur and Puri into acute critical state
  const guntur = db.phcs.find((p) => p.id === 'phc-ap-01');
  if (guntur) {
    guntur.overallRisk = 'CRITICAL';
    guntur.patientFootfallDaily = 420;
    guntur.patientFootfallTrend = 65;
    guntur.weather.rainfallMm = 185;
    guntur.weather.condition = 'Heavy Rain';
    guntur.dominantDiseaseTrend.weeklySurgePercent = 95;
    guntur.dominantDiseaseTrend.activeCases = 112;
    guntur.bedOccupancy = 24; // 100% capacity
  }

  const gunturOrs = db.resources.find((r) => r.phcId === 'phc-ap-01' && r.name.includes('ORS'));
  if (gunturOrs) {
    gunturOrs.currentStock = 240;
    gunturOrs.shortageProbability = 98;
    gunturOrs.daysUntilShortage = 1;
    gunturOrs.riskLevel = 'CRITICAL';
  }

  const puri = db.phcs.find((p) => p.id === 'phc-od-01');
  if (puri) {
    puri.overallRisk = 'CRITICAL';
    puri.patientFootfallDaily = 380;
    puri.bedOccupancy = 20; // 100%
  }

  // Ensure fresh recommendation is generated
  generateRedistributionRecommendation('phc-ap-01', 'res-phc-ap-01-ors', 750);

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: 'demo.controller',
    role: 'ADMIN',
    action: 'EMERGENCY_SCENARIO_TRIGGERED',
    entityType: 'SCENARIO',
    entityId: 'FLASH_FLOOD_CYCLONE_CASCADE',
    status: 'WARNING',
    details: 'Triggered Monsoon Flash Flood & Cholera surge scenario across Guntur (AP) and Puri (OD) nodes.',
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({
    message: 'Full Emergency Scenario Activated Live.',
    scenario: db.currentScenarioName,
    affectedCenters: ['Government General Hospital (GGH), Guntur', 'District Headquarters Hospital (DHH), Puri'],
    timestamp: db.lastScenarioTimestamp
  });
});

apiRouter.post('/scenarios/reset', (req: Request, res: Response) => {
  db.initDatabase();
  res.json({
    message: 'Demo database reset to clean initial state.',
    timestamp: new Date().toISOString()
  });
});

// 11. Federated Learning Simulation
apiRouter.get('/federated', (req: Request, res: Response) => {
  res.json({
    nodes: db.federatedNodes,
    rounds: db.federatedRounds,
    globalTopology: {
      coordinatorHost: 'GovTech Central Federated Aggregator (State Cluster Server)',
      encryption: 'Differential Privacy + Secure Multiparty Aggregation',
      totalRecordsConceptuallyLocal: db.federatedNodes.reduce((acc, n) => acc + n.localDatasetSize, 0)
    }
  });
});

apiRouter.post('/federated/train', (req: Request, res: Response) => {
  const result = runFederatedTrainingRound();
  res.json(result);
});

// 12. Data Reliability & Telemetry
apiRouter.get('/data-quality', (req: Request, res: Response) => {
  const report = evaluateDataReliability();
  res.json({
    report,
    phcReliabilityMatrix: db.phcs.map((p) => ({
      id: p.id,
      name: p.name,
      district: p.district,
      state: p.state,
      lastSyncMinutesAgo: p.dataFreshnessMinutes,
      completeness: p.dataCompleteness,
      consistency: p.dataConsistency,
      reliabilityScore: p.dataReliabilityScore,
      reliabilityStatus: p.dataReliabilityStatus,
      anomalyDetected: p.dataFreshnessMinutes > 30 || p.dataCompleteness < 85
    }))
  });
});

// 13. Model Performance & Weights
apiRouter.get('/model-performance', (req: Request, res: Response) => {
  res.json({
    metrics: db.modelMetrics,
    ensembleArchitecture: {
      models: [
        { name: 'Gradient Boosted Tree Regressor', role: 'Multi-feature cross-elasticity & non-linear patterns', weightRange: '35% - 50%' },
        { name: 'Temporal Holt-Winters / SARIMA', role: 'Historical trend baseline & day-of-week seasonality', weightRange: '25% - 40%' },
        { name: 'Contextual Environmental Regressor', role: 'Monsoon rainfall, temperature & disease surge amplification', weightRange: '20% - 35%' }
      ],
      description: 'Dynamic ensemble weighting adapts in real-time according to weather severity and disease alerts.'
    }
  });
});

// 14. PHC Connectors / Integrations
apiRouter.get('/integrations', (req: Request, res: Response) => {
  res.json(db.integrations);
});

// 15. Audit Logs
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// 16. Natural Language Healthcare Query ("Ask Health-Nexus") & Copilot
apiRouter.post('/ai/query', async (req: Request, res: Response) => {
  const query = (req.body.query as string) || '';
  const role = (req.body.role as string) || 'DISTRICT_AUTHORITY';
  const phcId = req.body.phcId as string | undefined;

  if (!query.trim()) {
    return res.status(400).json({ error: 'Query string is required' });
  }

  const result = await askHealthNexus(query, role, phcId);

  // Log user query in audit log
  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'user.copilot',
    role: (req.body.role as UserRole) || 'DISTRICT_AUTHORITY',
    action: 'AI_COPILOT_QUERY',
    entityType: 'AI_QUERY',
    entityId: 'GEMINI_COPILOT',
    status: 'SUCCESS',
    details: `Natural language query: "${query.slice(0, 75)}..."`,
    ipAddress: req.ip || '10.0.1.5'
  });

  res.json(result);
});

// 17. Role-Gated AI Executive Briefing
apiRouter.post('/ai/briefing', async (req: Request, res: Response) => {
  const role = (req.body.role as string) || 'DISTRICT_AUTHORITY';
  const jurisdiction = (req.body.jurisdiction as string) || 'All Monitored Districts';

  const briefing = await generateExecutiveBriefing(role, jurisdiction);

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'system.briefing_gen',
    role: (role as UserRole) || 'DISTRICT_AUTHORITY',
    action: 'EXECUTIVE_BRIEFING_GENERATED',
    entityType: 'AI_BRIEFING',
    entityId: role,
    status: 'SUCCESS',
    details: `Executive AI Briefing generated for ${role} (${jurisdiction}).`,
    ipAddress: req.ip || '10.0.1.5'
  });

  res.json(briefing);
});

// ==========================================
// FEATURE 1: HEALTHCARE DIGITAL TWIN
// ==========================================
apiRouter.get('/digital-twin', (req: Request, res: Response) => {
  const step = (req.query.step as TimelineStep) || 'TODAY';
  const snapshot = getDigitalTwinSnapshot(step);
  res.json(snapshot);
});

// ==========================================
// FEATURE 2: AI RESOURCE ALLOCATION OPTIMIZER
// ==========================================
apiRouter.post('/optimizer/run', (req: Request, res: Response) => {
  const customWeights = req.body.weights;
  const plan = runMultiObjectiveAllocation(customWeights);

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'system.optimizer',
    role: (req.body.role as UserRole) || 'DISTRICT_AUTHORITY',
    action: 'RESOURCE_OPTIMIZATION_SOLVED',
    entityType: 'OPTIMIZATION_PLAN',
    entityId: plan.id,
    status: 'SUCCESS',
    details: `Multi-objective network allocation: ${plan.allocations.length} transfers allocated (${plan.afterMetrics.shortageReductionPercent}% shortage reduction).`,
    ipAddress: req.ip || '10.0.1.5'
  });

  res.json(plan);
});

// ==========================================
// FEATURE 3: LAST-MILE LOGISTICS INTELLIGENCE
// ==========================================
apiRouter.post('/logistics/simulate', (req: Request, res: Response) => {
  const { originId, destinationId, resourceName, quantity, vehicleType, roadCondition } = req.body;
  const detail = simulateLogisticsTransfer(
    originId || 'phc-ap-02',
    destinationId || 'phc-ap-01',
    resourceName || 'ORS & Rehydration Salts',
    quantity || 500,
    (vehicleType as VehicleType) || 'TEMPERATURE_CONTROLLED_VAN',
    (roadCondition as RoadCondition) || 'NORMAL'
  );
  res.json(detail);
});

// ==========================================
// FEATURE 4: MEDICINE EXPIRY + WASTE INTELLIGENCE
// ==========================================
apiRouter.get('/waste/batches', (req: Request, res: Response) => {
  const batches = getMedicineBatches();
  res.json(batches);
});

apiRouter.get('/waste/proposals', (req: Request, res: Response) => {
  const proposals = getExpiryAwareRedistributionProposals();
  res.json(proposals);
});

apiRouter.get('/waste/circularity', (req: Request, res: Response) => {
  const circularity = getResourceCircularitySummary();
  res.json(circularity);
});

// ==========================================
// FEATURE 5: HEALTHCARE RESILIENCE SCORE
// ==========================================
apiRouter.get('/resilience/facility/:id', (req: Request, res: Response) => {
  const score = calculateFacilityResilience(req.params.id);
  res.json(score);
});

apiRouter.get('/resilience/all', (req: Request, res: Response) => {
  const scores = getAllResilienceScores();
  res.json(scores);
});

apiRouter.get('/resilience/districts', (req: Request, res: Response) => {
  const summaries = getDistrictResilienceSummaries();
  res.json(summaries);
});

// ==========================================
// FEATURE 6: HEALTHCARE EQUITY INTELLIGENCE
// ==========================================
apiRouter.get('/equity', (req: Request, res: Response) => {
  const metrics = getEquityMetrics();
  res.json(metrics);
});

// ==========================================
// FEATURE 7: COUNTERFACTUAL POLICY SIMULATOR
// ==========================================
apiRouter.post('/policy/simulate', (req: Request, res: Response) => {
  const scenarios = req.body.scenarios;
  const report = runPolicySimulation(scenarios);

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'system.policy_sim',
    role: (req.body.role as UserRole) || 'STATE_AUTHORITY',
    action: 'POLICY_SIMULATION_EXECUTED',
    entityType: 'POLICY_SIMULATOR',
    entityId: 'COUNTERFACTUAL_RUN',
    status: 'SUCCESS',
    details: `Tested ${report.scenarios.length} strategic intervention policies against current baseline.`,
    ipAddress: req.ip || '10.0.1.5'
  });

  res.json(report);
});

// ==========================================
// FEATURE 8: AI MODEL + DATA DRIFT SENTINEL
// ==========================================
apiRouter.get('/sentinel', (req: Request, res: Response) => {
  const health = getAiSystemHealth();
  res.json(health);
});

// ==========================================
// FEATURE 9: EDGE + OFFLINE PHC MODE
// ==========================================
apiRouter.get('/edge/:id', (req: Request, res: Response) => {
  const data = getEdgeNodeState(req.params.id);
  res.json(data);
});

apiRouter.post('/edge/connectivity', (req: Request, res: Response) => {
  const { status } = req.body;
  const result = setEdgeConnectivity(status);
  res.json(result);
});

apiRouter.post('/edge/action', (req: Request, res: Response) => {
  const action = addEdgeOfflineAction(req.body);
  res.json(action);
});

apiRouter.post('/edge/sync', (req: Request, res: Response) => {
  const syncResult = triggerEdgeSynchronization();

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'phc.edge_sync',
    role: 'PHC_STAFF',
    action: 'EDGE_SYNCHRONIZATION_COMPLETED',
    entityType: 'EDGE_NODE',
    entityId: req.body.phcId || 'phc-ap-01',
    status: 'SUCCESS',
    details: `Edge node uploaded ${syncResult.syncedCount} queued operational logs without conflict.`,
    ipAddress: req.ip || '192.168.1.14'
  });

  res.json(syncResult);
});

// ==========================================
// FEATURE 10: AI EMERGENCY INCIDENT COMMANDER
// ==========================================
apiRouter.get('/incident/active', (req: Request, res: Response) => {
  const incident = getActiveIncident();
  res.json(incident);
});

apiRouter.post('/incident/action', (req: Request, res: Response) => {
  const { actionId, status } = req.body;
  const updated = updateIncidentActionStatus(actionId, status);

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'incident.commander',
    role: (req.body.role as UserRole) || 'DISTRICT_AUTHORITY',
    action: 'INCIDENT_ACTION_UPDATED',
    entityType: 'INCIDENT_ACTION',
    entityId: actionId,
    status: 'SUCCESS',
    details: `Incident Action #${actionId} updated to status "${status}".`,
    ipAddress: req.ip || '10.0.1.5'
  });

  res.json(updated);
});

apiRouter.post('/incident/copilot', async (req: Request, res: Response) => {
  const query = (req.body.query as string) || '';
  const answer = await askIncidentCopilot(query);
  res.json({ query, answer, timestamp: new Date().toISOString() });
});

apiRouter.post('/incident/post-mortem', (req: Request, res: Response) => {
  const postMortem = generateIncidentPostMortem();

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: (req.body.user as string) || 'incident.post_mortem',
    role: 'STATE_AUTHORITY',
    action: 'INCIDENT_POST_MORTEM_GENERATED',
    entityType: 'INCIDENT_REPORT',
    entityId: postMortem.incidentId,
    status: 'SUCCESS',
    details: `Post-Mortem for ${postMortem.incidentId}: ${postMortem.shortagesPreventedCount} shortages prevented, ₹${postMortem.wastageAvoidedInr.toLocaleString()} waste avoided.`,
    ipAddress: req.ip || '10.0.1.5'
  });

  res.json(postMortem);
});

// ==========================================
// COMMUNITY IMPACT & JUDGE SCORECARD
// ==========================================
apiRouter.get('/impact', (req: Request, res: Response) => {
  const metrics = getCommunityImpactMetrics();
  res.json(metrics);
});

apiRouter.get('/judge/scorecard', (req: Request, res: Response) => {
  const scorecard = getJudgeScorecard();
  res.json(scorecard);
});

// ==========================================
// VISION & MULTIMODAL INTELLIGENCE (CODE FOR COMMUNITIES 2.0)
// ==========================================
apiRouter.get('/multimodal/recent', (req: Request, res: Response) => {
  res.json(recentAnalyses);
});

apiRouter.post('/multimodal/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, analysisType, location, phcId } = req.body;
    const result = await processMultimodalAnalysis({
      imageBase64,
      mimeType,
      analysisType: analysisType || 'citizen_hazard',
      location,
      phcId
    });

    db.auditLogs.unshift({
      id: `log-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      user: 'citizen_multimodal_vision',
      role: 'DISTRICT_AUTHORITY',
      action: 'MULTIMODAL_VISION_ANALYSIS',
      entityType: 'VISION_INFERENCE',
      entityId: result.id,
      status: 'SUCCESS',
      details: `${result.title} processed via ${result.vertexAiVisionMetadata.modelType}. Hazard Score: ${result.hazardScore}/100. Work order ${result.dispatchWorkOrder?.orderId} dispatched to ${result.dispatchWorkOrder?.department}.`,
      ipAddress: req.ip || '10.0.1.5'
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process multimodal analysis', details: err?.message });
  }
});

// ==========================================
// VERTEX AI PREDICTIVE MODELING & PIPELINES
// ==========================================
apiRouter.get('/vertex-ai/models', (req: Request, res: Response) => {
  res.json(vertexAiModels);
});

apiRouter.post('/vertex-ai/simulate-retraining', (req: Request, res: Response) => {
  const { modelId } = req.body;
  const model = vertexAiModels.find((m) => m.id === modelId) || vertexAiModels[0];

  model.status = 'RETRAINING';
  model.lastEvaluated = 'Retraining Pipeline Triggered...';

  setTimeout(() => {
    model.status = 'SERVING';
    model.lastEvaluated = 'Just now (Canary Deployed)';
    model.driftStatus = 'STABLE';
  }, 4000);

  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: 'vertex_ai_orchestrator',
    role: 'ADMIN',
    action: 'VERTEX_AI_PIPELINE_RETRAINING_TRIGGERED',
    entityType: 'MODEL_REGISTRY',
    entityId: model.id,
    status: 'SUCCESS',
    details: `Triggered Vertex AI automated training pipeline for ${model.name}. Endpoint ${model.endpointId} updated with dataset versioning.`,
    ipAddress: req.ip || '10.0.1.5'
  });

  res.json({
    success: true,
    message: `Vertex AI custom retraining pipeline launched for ${model.name}`,
    pipelineJobId: `job-vertex-${Date.now().toString().slice(-8)}`,
    targetEndpoint: model.endpointId
  });
});

