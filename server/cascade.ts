import { CascadeGraph, PHC } from '../src/types.ts';
import { db } from './db.ts';

export function getEmergencyCascadeGraph(phcId?: string): CascadeGraph {
  const phc = db.phcs.find((p) => p.id === phcId) || db.phcs[0]; // defaults to Guntur or critical PHC

  const isCritical = phc.overallRisk === 'CRITICAL';
  const rain = phc.weather.rainfallMm;
  const disease = phc.dominantDiseaseTrend;
  const footfallTrend = phc.patientFootfallTrend;

  return {
    activeCascadeLevel: isCritical ? 6 : 2,
    scenarioSummary: `Cascade transmission active: ${phc.weather.condition} (${rain}mm) -> ${disease.disease} (+${disease.weeklySurgePercent}%) -> Footfall (+${footfallTrend}%) -> ORS & Antibiotic stock-out -> Inpatient bed strain -> Regional cross-PHC pressure.`,
    nodes: [
      {
        id: 'node-env',
        label: `${phc.weather.condition}`,
        category: 'Trigger',
        currentValue: `${rain} mm rain / ${phc.weather.tempC}°C`,
        predictedChange: '+28% precip next 48h',
        risk: rain > 100 ? 'CRITICAL' : 'HIGH',
        confidence: 'HIGH',
        description: 'Monsoon weather front inducing surface water stagnation and drinking reservoir contamination.'
      },
      {
        id: 'node-epi',
        label: `${disease.disease.slice(0, 24)}...`,
        category: 'Epidemiology',
        currentValue: `${disease.activeCases} active cases`,
        predictedChange: `+${disease.weeklySurgePercent}% weekly surge`,
        risk: disease.weeklySurgePercent > 50 ? 'CRITICAL' : 'HIGH',
        confidence: 'HIGH',
        description: 'Exponential incubation curve detected in local enteric surveillance testing.'
      },
      {
        id: 'node-footfall',
        label: 'OPD Patient Footfall',
        category: 'Footfall',
        currentValue: `${phc.patientFootfallDaily} patients/day`,
        predictedChange: `+${footfallTrend}% escalation`,
        risk: footfallTrend > 30 ? 'CRITICAL' : 'HIGH',
        confidence: 'HIGH',
        description: 'Outpatient registration queue volume exceeding baseline capacity by 1.4x.'
      },
      {
        id: 'node-meds',
        label: 'Oral Rehydration & Antibiotics',
        category: 'PrimaryResource',
        currentValue: isCritical ? '380 sachets remaining' : 'Normal inventory',
        predictedChange: 'Stockout within 48 hrs',
        risk: isCritical ? 'CRITICAL' : 'NORMAL',
        confidence: 'HIGH',
        description: 'Rapid depletion rate of 210 units/day against safety threshold of 500 units.'
      },
      {
        id: 'node-diag',
        label: 'Diagnostic Test Kits',
        category: 'PrimaryResource',
        currentValue: '120 cassettes on hand',
        predictedChange: 'Depletion in 2.5 days',
        risk: 'HIGH',
        confidence: 'HIGH',
        description: 'High test positivity rate requiring 100% confirmation testing.'
      },
      {
        id: 'node-beds',
        label: 'Inpatient Bed Capacity',
        category: 'SecondaryResource',
        currentValue: `${phc.bedOccupancy}/${phc.bedCapacity} beds (${Math.round((phc.bedOccupancy/phc.bedCapacity)*100)}%)`,
        predictedChange: 'Overflow in 18 hrs',
        risk: (phc.bedOccupancy / phc.bedCapacity) > 0.85 ? 'CRITICAL' : 'HIGH',
        confidence: 'HIGH',
        description: 'Acute dehydration admissions requiring continuous IV infusion monitoring.'
      },
      {
        id: 'node-staff',
        label: 'Clinical Duty Staff',
        category: 'SecondaryResource',
        currentValue: `${phc.staffAvailable}/${phc.staffTotal} staff present`,
        predictedChange: 'Ratio: 31 pts / MD',
        risk: 'HIGH',
        confidence: 'MEDIUM',
        description: 'High workforce strain and fatigue risk with duty shifts extending beyond 12 hours.'
      },
      {
        id: 'node-regional',
        label: 'Neighbor PHC Buffer Strain',
        category: 'RegionalPressure',
        currentValue: 'Secondary referrals +38%',
        predictedChange: 'Surrounding nodes impacted',
        risk: 'MEDIUM',
        confidence: 'HIGH',
        description: 'Patient overflow beginning to cross sub-district boundaries toward urban hubs.'
      }
    ],
    edges: [
      { from: 'node-env', to: 'node-epi', impactWeight: 0.92, label: 'Water Contamination' },
      { from: 'node-epi', to: 'node-footfall', impactWeight: 0.88, label: 'Acute Clinical Demand' },
      { from: 'node-footfall', to: 'node-meds', impactWeight: 0.94, label: 'Heavy Prescriptions' },
      { from: 'node-footfall', to: 'node-diag', impactWeight: 0.82, label: 'Triage Screening' },
      { from: 'node-footfall', to: 'node-beds', impactWeight: 0.78, label: 'Severe Admissions' },
      { from: 'node-beds', to: 'node-staff', impactWeight: 0.85, label: 'Workforce Exhaustion' },
      { from: 'node-meds', to: 'node-regional', impactWeight: 0.72, label: 'Referral Diversion' },
      { from: 'node-beds', to: 'node-regional', impactWeight: 0.76, label: 'Overflow Patients' }
    ]
  };
}
