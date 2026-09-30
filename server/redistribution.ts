import {
  ConfidenceLevel,
  PHC,
  Recommendation,
  RedistributionOption,
  ResourceCategory,
  ResourceItem,
  RiskLevel,
  UserRole
} from '../src/types.ts';
import { db } from './db.ts';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by road tortuosity factor (~1.25)
  return Math.round(R * c * 1.25);
}

export function findRedistributionOptions(
  targetPhcId: string,
  resourceCategory: ResourceCategory,
  resourceNameSubstr: string,
  neededQuantity: number
): RedistributionOption[] {
  const targetPhc = db.phcs.find((p) => p.id === targetPhcId);
  if (!targetPhc) return [];

  const candidates: RedistributionOption[] = [];

  db.phcs.forEach((candidatePhc) => {
    if (candidatePhc.id === targetPhcId) return;

    // Find matching resource in candidate
    const candidateResource = db.resources.find(
      (r) =>
        r.phcId === candidatePhc.id &&
        r.category === resourceCategory &&
        r.name.toLowerCase().includes(resourceNameSubstr.toLowerCase().slice(0, 5))
    );

    if (!candidateResource) return;

    // Calculate candidate available surplus beyond safety buffer & projected 7-day demand
    const surplus = candidateResource.currentStock - (candidateResource.safetyStockLevel + candidateResource.predictedDemand7d);

    if (surplus > 0) {
      const distanceKm = Math.max(12, calculateDistanceKm(
        targetPhc.lat,
        targetPhc.lng,
        candidatePhc.lat,
        candidatePhc.lng
      ));
      const transitHours = parseFloat((distanceKm / 35).toFixed(1)); // average ~35 km/h in rural corridors

      // Feasibility score (0 - 100) based on: distance, source risk, surplus cushion, source data reliability
      let score = 100;
      score -= Math.min(40, distanceKm * 0.4);
      if (candidatePhc.overallRisk === 'HIGH') score -= 30;
      if (candidatePhc.overallRisk === 'MEDIUM') score -= 15;
      if (candidatePhc.dataReliabilityScore < 85) score -= 15;
      if (surplus < neededQuantity) score -= 20;
      score = Math.max(20, Math.min(99, Math.round(score)));

      let feasibility: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
      if (score < 60) feasibility = 'LOW';
      else if (score < 80) feasibility = 'MEDIUM';

      candidates.push({
        sourcePhcId: candidatePhc.id,
        sourcePhcName: candidatePhc.name,
        sourceDistrict: candidatePhc.district,
        surplusAvailable: surplus,
        distanceKm,
        estimatedTransitHours: transitHours,
        sourceRiskLevel: candidatePhc.overallRisk,
        transferFeasibility: feasibility,
        feasibilityScore: score
      });
    }
  });

  // Sort by highest feasibility score
  return candidates.sort((a, b) => b.feasibilityScore - a.feasibilityScore);
}

export function generateRedistributionRecommendation(
  targetPhcId: string,
  resourceId: string,
  requiredQty?: number
): Recommendation | null {
  const targetPhc = db.phcs.find((p) => p.id === targetPhcId);
  const resource = db.resources.find((r) => r.id === resourceId);

  if (!targetPhc || !resource) return null;

  const needed = requiredQty || Math.max(200, (resource.predictedDemand7d - resource.currentStock) + resource.safetyStockLevel);
  const options = findRedistributionOptions(targetPhc.id, resource.category, resource.name, needed);

  if (options.length === 0) return null;

  const bestOption = options[0];
  const alternatives = options.slice(1, 3);

  const recId = `rec-${Date.now().toString().slice(-6)}`;
  const roleRequired: UserRole = targetPhc.district === bestOption.sourceDistrict ? 'DISTRICT_AUTHORITY' : 'STATE_AUTHORITY';

  const recommendation: Recommendation = {
    id: recId,
    targetPhcId: targetPhc.id,
    targetPhcName: targetPhc.name,
    targetDistrict: targetPhc.district,
    targetState: targetPhc.state,
    resourceCategory: resource.category,
    resourceName: resource.name,
    requiredQuantity: needed,
    unit: resource.unit,
    shortageProbability: resource.shortageProbability || 88,
    daysUntilShortage: resource.daysUntilShortage || 2,
    riskLevel: resource.riskLevel || 'CRITICAL',
    confidence: targetPhc.dataReliabilityStatus === 'HIGH' ? 'HIGH' : 'MEDIUM',
    selectedSource: bestOption,
    alternativeSources: alternatives,
    whyExplanation: `Patient footfall surge (+${targetPhc.patientFootfallTrend}%) triggered by ${targetPhc.weather.condition} and ${targetPhc.dominantDiseaseTrend.disease} (+${targetPhc.dominantDiseaseTrend.weeklySurgePercent}% weekly surge).`,
    whatExplanation: `Projected 7-day demand is ${resource.predictedDemand7d} ${resource.unit} against on-hand stock of ${resource.currentStock} ${resource.unit}.`,
    whenExplanation: `Stockout projected within ${resource.daysUntilShortage} days without operational replenishment.`,
    certaintyExplanation: `${resource.shortageProbability}% Shortage Probability derived via multi-model ensemble with ${targetPhc.dataReliabilityScore}% verified telemetry reliability.`,
    sourceExplanation: `${bestOption.sourcePhcName} maintains ${bestOption.surplusAvailable} ${resource.unit} in verified surplus buffer beyond its projected local clinical requirements.`,
    whyThisSourceExplanation: `Optimal road transit corridor (${bestOption.distanceKm} km, ~${bestOption.estimatedTransitHours} hrs), low source risk (${bestOption.sourceRiskLevel}), and strong logistical feasibility (${bestOption.feasibilityScore}/100).`,
    actionSummary: `Authorize inter-PHC emergency transfer of ${needed} ${resource.unit} from ${bestOption.sourcePhcName} to ${targetPhc.name}.`,
    requiredApprovalRole: roleRequired,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  db.recommendations.unshift(recommendation);
  return recommendation;
}
