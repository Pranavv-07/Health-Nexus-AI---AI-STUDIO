import {
  DigitalTwinFlow,
  DigitalTwinNodeState,
  DigitalTwinSnapshot,
  PHC,
  RiskLevel,
  TimelineStep
} from '../src/types.ts';
import { db } from './db.ts';

export function getDigitalTwinSnapshot(step: TimelineStep = 'TODAY'): DigitalTwinSnapshot {
  const phcs = db.phcs;
  const timestamp = new Date().toISOString();

  // Factors per timeline step
  let footfallMultiplier = 1.0;
  let rainMultiplier = 1.0;
  let riskOffset = 0; // 0 = baseline, +1 = worse, -1 = earlier
  let summary = 'Current operational baseline of the national health network.';
  let activeEmergencyFlag = false;

  switch (step) {
    case 'T-7':
      footfallMultiplier = 0.85;
      rainMultiplier = 0.6;
      riskOffset = -2;
      summary = 'Historical operational state (7 days prior): Standard low-monsoon baseline across southern states.';
      break;
    case 'T-3':
      footfallMultiplier = 0.92;
      rainMultiplier = 0.8;
      riskOffset = -1;
      summary = 'Historical operational state (3 days prior): Early cloud cover and rainfall warning issued in Bay of Bengal.';
      break;
    case 'TODAY':
      footfallMultiplier = 1.0;
      rainMultiplier = 1.0;
      riskOffset = 0;
      activeEmergencyFlag = db.currentScenarioName.includes('Emergency') || db.currentScenarioName.includes('Flood');
      summary = activeEmergencyFlag
        ? 'LIVE EMERGENCY STATE: Monsoon cyclone depression active over Andhra Pradesh and Odisha coastline.'
        : 'LIVE STATE: Steady state healthcare operations with active surveillance on water-borne infection trends.';
      break;
    case 'T+1':
      footfallMultiplier = 1.15;
      rainMultiplier = 1.3;
      riskOffset = 1;
      activeEmergencyFlag = true;
      summary = 'Projected 24h Horizon: Monsoon rain spreading inland; footfall rising +15% at district headquarters.';
      break;
    case 'T+3':
      footfallMultiplier = 1.35;
      rainMultiplier = 1.8;
      riskOffset = 2;
      activeEmergencyFlag = true;
      summary = 'Projected 72h Peak: High acute diarrheal & leptospirosis caseload; Guntur and Puri experiencing severe bed pressure.';
      break;
    case 'T+7':
      footfallMultiplier = 1.25;
      rainMultiplier = 1.2;
      riskOffset = 1;
      activeEmergencyFlag = true;
      summary = 'Projected 7-Day Horizon: Secondary supply delays compounding stock depletion; mutual-aid transfers mitigating deficits.';
      break;
    case 'T+14':
      footfallMultiplier = 1.05;
      rainMultiplier = 0.9;
      riskOffset = 0;
      summary = 'Projected 14-Day Horizon: Network stabilization post-redistribution and centralized replenishment.';
      break;
  }

  // Calculate node states
  const nodes: DigitalTwinNodeState[] = phcs.map((phc) => {
    let currentRisk: RiskLevel = phc.overallRisk;
    let projectedRisk: RiskLevel = phc.overallRisk;

    if (riskOffset > 0) {
      if (phc.isDisasterProne) {
        currentRisk = 'CRITICAL';
        projectedRisk = 'CRITICAL';
      } else if (currentRisk === 'NORMAL') {
        projectedRisk = riskOffset > 1 ? 'HIGH' : 'MEDIUM';
      }
    } else if (riskOffset < 0) {
      if (currentRisk === 'CRITICAL') currentRisk = 'MEDIUM';
      if (currentRisk === 'HIGH') currentRisk = 'NORMAL';
      projectedRisk = 'NORMAL';
    }

    const bedOccupancy = Math.min(
      phc.bedCapacity,
      Math.round(phc.bedOccupancy * (0.8 + footfallMultiplier * 0.2))
    );

    const footfall = Math.round(phc.patientFootfallDaily * footfallMultiplier);
    const staffAvail = Math.max(
      Math.round(phc.staffTotal * 0.4),
      Math.round(phc.staffAvailable * (riskOffset > 1 ? 0.8 : 1.0))
    );

    const isCriticalShortage = currentRisk === 'CRITICAL' || currentRisk === 'HIGH';

    return {
      phcId: phc.id,
      name: phc.name,
      code: phc.code,
      district: phc.district,
      state: phc.state,
      lat: phc.lat,
      lng: phc.lng,
      areaType: phc.areaType,
      terrainType: phc.terrainType,
      currentRisk,
      projectedRisk,
      bedOccupancy,
      bedCapacity: phc.bedCapacity,
      patientFootfallDaily: footfall,
      staffAvailable: staffAvail,
      staffTotal: phc.staffTotal,
      criticalResourceStockoutRisk: isCriticalShortage,
      activeSurgeDisease: phc.dominantDiseaseTrend.disease,
      weatherCondition: rainMultiplier > 1.2 ? 'Heavy Rain' : phc.weather.condition,
      rainfallMm: Math.round(phc.weather.rainfallMm * rainMultiplier)
    };
  });

  // Resource flows across active corridors
  const flows: DigitalTwinFlow[] = [
    {
      id: 'flow-01',
      fromId: 'phc-ap-02',
      fromName: 'New GGH Vijayawada',
      toId: 'phc-ap-01',
      toName: 'GGH Guntur',
      resourceName: 'ORS & Rehydration Salts',
      quantity: 600,
      unit: 'packets',
      status: step === 'T+1' || step === 'T+3' ? 'IN_TRANSIT' : step === 'T+7' || step === 'T+14' ? 'DELIVERED' : 'PLANNED',
      corridorDistanceKm: 34,
      estimatedHours: 0.8
    },
    {
      id: 'flow-02',
      fromId: 'phc-ts-02',
      fromName: 'Osmania General Hospital, Hyderabad',
      toId: 'phc-ts-01',
      toName: 'GGH Mahabubnagar',
      resourceName: 'Paracetamol & Antipyretics',
      quantity: 400,
      unit: 'strips',
      status: step === 'T+3' ? 'IN_TRANSIT' : step === 'T+7' || step === 'T+14' ? 'DELIVERED' : 'PLANNED',
      corridorDistanceKm: 98,
      estimatedHours: 1.8
    },
    {
      id: 'flow-03',
      fromId: 'phc-od-02',
      fromName: 'SCB Medical College, Cuttack',
      toId: 'phc-od-01',
      toName: 'DHH Puri Coastal Hospital',
      resourceName: 'IV Fluids (Ringer Lactate)',
      quantity: 500,
      unit: 'bottles',
      status: step === 'T+1' ? 'IN_TRANSIT' : step === 'T+3' || step === 'T+7' || step === 'T+14' ? 'DELIVERED' : 'PLANNED',
      corridorDistanceKm: 82,
      estimatedHours: 1.5
    },
    {
      id: 'flow-04',
      fromId: 'phc-mh-02',
      fromName: 'Sassoon Hospital, Pune',
      toId: 'phc-mh-01',
      toName: 'Civil Hospital Alibag',
      resourceName: 'Rapid Diagnostic Leptospirosis Kits',
      quantity: 350,
      unit: 'tests',
      status: step === 'T+3' ? 'IN_TRANSIT' : step === 'T+7' || step === 'T+14' ? 'DELIVERED' : 'PLANNED',
      corridorDistanceKm: 142,
      estimatedHours: 2.6
    }
  ];

  // Calculate network shortage index (0 - 100)
  const criticalCount = nodes.filter((n) => n.currentRisk === 'CRITICAL' || n.projectedRisk === 'CRITICAL').length;
  const highCount = nodes.filter((n) => n.currentRisk === 'HIGH' || n.projectedRisk === 'HIGH').length;
  const networkShortageIndex = Math.min(100, Math.round((criticalCount * 22 + highCount * 12) / nodes.length * 10));
  const networkResilienceScore = Math.max(35, 100 - networkShortageIndex);

  return {
    timelineStep: step,
    timestamp,
    nodes,
    flows,
    networkShortageIndex,
    networkResilienceScore,
    activeEmergencyFlag,
    summary
  };
}
