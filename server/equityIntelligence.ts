import { AccessibilityDisparityGap, AreaDemographicMetric, EquityAlert } from '../src/types.ts';
import { db } from './db.ts';

export function getEquityMetrics(): {
  demographicMetrics: AreaDemographicMetric[];
  accessibilityGap: AccessibilityDisparityGap;
  equityAlerts: EquityAlert[];
} {
  const phcs = db.phcs;

  const areaTypes: ('Urban' | 'Rural' | 'Tribal')[] = ['Urban', 'Rural', 'Tribal'];
  const demographicMetrics: AreaDemographicMetric[] = areaTypes.map((area) => {
    const matching = phcs.filter((p) => p.areaType === area);
    const count = matching.length || 1;
    const totalPop = matching.reduce((acc, curr) => acc + curr.populationServed, 0);
    const totalBeds = matching.reduce((acc, curr) => acc + curr.bedCapacity, 0);
    const totalStaff = matching.reduce((acc, curr) => acc + curr.staffTotal, 0);

    const bedsPer10k = Math.round((totalBeds / (totalPop / 10000)) * 10) / 10;
    const staffPer10k = Math.round((totalStaff / (totalPop / 10000)) * 10) / 10;

    let emergencyTime = 18;
    let medAvail = 94;
    let vulnIndex = 25;

    if (area === 'Rural') {
      emergencyTime = 34;
      medAvail = 82;
      vulnIndex = 58;
    } else if (area === 'Tribal') {
      emergencyTime = 52;
      medAvail = 68;
      vulnIndex = 82;
    }

    return {
      areaType: area,
      phcsCount: count,
      totalPopulation: totalPop,
      avgBedsPer10k: bedsPer10k,
      avgStaffPer10k: staffPer10k,
      avgEmergencyAccessTimeMinutes: emergencyTime,
      avgMedicineAvailabilityPercent: medAvail,
      vulnerabilityIndex: vulnIndex
    };
  });

  const urban = demographicMetrics.find((m) => m.areaType === 'Urban');
  const tribal = demographicMetrics.find((m) => m.areaType === 'Tribal');

  const urbanMin = urban ? urban.avgEmergencyAccessTimeMinutes : 18;
  const remoteMin = tribal ? tribal.avgEmergencyAccessTimeMinutes : 52;
  const gap = remoteMin - urbanMin;

  const accessibilityGap: AccessibilityDisparityGap = {
    urbanAccessMinutes: urbanMin,
    remoteAccessMinutes: remoteMin,
    gapMinutes: gap,
    stateAvgGapMinutes: 22,
    severity: gap > 30 ? 'CRITICAL' : gap > 15 ? 'ELEVATED' : 'NORMAL'
  };

  const equityAlerts: EquityAlert[] = [
    {
      id: 'eq-alert-01',
      district: 'Gadchiroli (Tribal Belt)',
      title: 'Disproportionate Diagnostic Access Gap',
      description: 'Tribal healthcare facilities in Gadchiroli have 38% lower rapid malaria diagnostic test buffers per capita than the state average.',
      disparityFactor: 'Access Gap: +34 min transit to secondary depot',
      recommendedIntervention: 'Deploy mobile diagnostic lab van and establish 60-day buffer stockpile.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'eq-alert-02',
      district: 'Uttara Kannada & Puri (Coastal)',
      title: 'Coastal Monsoon Inundation Buffer Depletion',
      description: 'Coastal PHCs experience recurrent supply delays (4.8 days avg) versus urban corridors (1.2 days avg), creating vulnerability during storm surges.',
      disparityFactor: 'Supply transit variance: 4.0x longer',
      recommendedIntervention: 'Pre-position emergency flood cots and ORS caches at elevated ridge substations.',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'eq-alert-03',
      district: 'Mahabubnagar (Semi-Arid Rural)',
      title: 'Emergency Bed Availability Disparity',
      description: 'Inpatient bed capacity per 10,000 population is 8.4 beds in rural Mahabubnagar vs 24.2 beds in metropolitan Hyderabad.',
      disparityFactor: 'Bed density ratio: 0.35x of urban median',
      recommendedIntervention: 'Activate mutual-aid corridor with Osmania General Hospital for critical overflow.',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  return {
    demographicMetrics,
    accessibilityGap,
    equityAlerts
  };
}
