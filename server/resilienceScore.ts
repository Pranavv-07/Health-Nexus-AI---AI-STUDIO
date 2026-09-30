import { DistrictResilienceSummary, FacilityResilienceScore } from '../src/types.ts';
import { db } from './db.ts';

export function calculateFacilityResilience(phcId: string): FacilityResilienceScore {
  const phc = db.phcs.find((p) => p.id === phcId) || db.phcs[0];

  // 1. Medicine resilience (based on stockout buffer and days to shortage)
  const phcResources = db.resources.filter((r) => r.phcId === phc.id);
  const minDays = phcResources.length > 0 ? Math.min(...phcResources.map((r) => r.daysUntilShortage)) : 5;
  const medicineScore = Math.min(100, Math.max(20, Math.round(minDays * 12)));

  // 2. Bed resilience (occupancy head room)
  const occPct = (phc.bedOccupancy / Math.max(1, phc.bedCapacity)) * 100;
  const bedScore = Math.min(100, Math.max(15, Math.round(100 - (occPct - 50) * 1.6)));

  // 3. Staff resilience (presence ratio)
  const staffRatio = (phc.staffAvailable / Math.max(1, phc.staffTotal)) * 100;
  const staffScore = Math.min(100, Math.max(25, Math.round(staffRatio * 0.95)));

  // 4. Diagnostic resilience
  const diagRes = phcResources.filter((r) => r.category === 'diagnostics');
  const diagScore = diagRes.some((d) => d.riskLevel === 'CRITICAL') ? 45 : diagRes.some((d) => d.riskLevel === 'HIGH') ? 65 : 88;

  // 5. Supply resilience (lead time penalty)
  const supplyScore = Math.min(100, Math.max(30, Math.round(100 - phc.supplyLeadTimeDays * 10)));

  // 6. Emergency preparedness (disaster prone penalty countered by capacity)
  const emergencyScore = phc.isDisasterProne ? 58 : 82;

  // 7. Data reliability
  const dataScore = phc.dataReliabilityScore;

  // 8. Geographic accessibility (terrain)
  let geoScore = 85;
  if (phc.terrainType === 'Hilly') geoScore = 52;
  if (phc.terrainType === 'Coastal') geoScore = 64;

  // 9. Recovery capability
  const recoveryScore = phc.specialistPresent ? 84 : 60;

  const dimensions = {
    medicines: medicineScore,
    beds: bedScore,
    staff: staffScore,
    diagnostics: diagScore,
    supply: supplyScore,
    emergencyPreparedness: emergencyScore,
    dataReliability: dataScore,
    geographicAccessibility: geoScore,
    recoveryCapability: recoveryScore
  };

  const dimArray = Object.entries(dimensions);
  dimArray.sort((a, b) => a[1] - b[1]);
  const weakestDimensions = dimArray.slice(0, 3).map(([key, val]) => `${key} (${val}/100)`);

  const overallScore = Math.round(
    dimArray.reduce((acc, curr) => acc + curr[1], 0) / dimArray.length
  );

  return {
    phcId: phc.id,
    phcName: phc.name,
    district: phc.district,
    state: phc.state,
    areaType: phc.areaType,
    overallScore,
    dimensions,
    weakestDimensions,
    historicalTrend: [
      { period: '90_DAYS_AGO', score: Math.min(100, overallScore + 8) },
      { period: '30_DAYS_AGO', score: Math.min(100, overallScore + 4) },
      { period: 'CURRENT', score: overallScore },
      { period: 'PROJECTED_30D', score: phc.isDisasterProne ? Math.max(30, overallScore - 6) : Math.min(95, overallScore + 3) }
    ]
  };
}

export function getAllResilienceScores(): FacilityResilienceScore[] {
  return db.phcs.map((p) => calculateFacilityResilience(p.id));
}

export function getDistrictResilienceSummaries(): DistrictResilienceSummary[] {
  const scores = getAllResilienceScores();
  const districtMap = new Map<string, FacilityResilienceScore[]>();

  scores.forEach((s) => {
    const list = districtMap.get(s.district) || [];
    list.push(s);
    districtMap.set(s.district, list);
  });

  const summaries: DistrictResilienceSummary[] = [];
  districtMap.forEach((list, dist) => {
    const avg = Math.round(list.reduce((acc, curr) => acc + curr.overallScore, 0) / list.length);
    list.sort((a, b) => b.overallScore - a.overallScore);
    summaries.push({
      district: dist,
      state: list[0].state,
      averageResilience: avg,
      topPerformingPhc: list[0].phcName,
      mostVulnerablePhc: list[list.length - 1].phcName,
      phcCount: list.length
    });
  });

  return summaries;
}
