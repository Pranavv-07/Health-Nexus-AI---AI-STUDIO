import { PHC } from '../src/types.ts';
import { db } from './db.ts';

export interface DataReliabilityReport {
  overallScore: number;
  averageFreshnessMin: number;
  averageCompleteness: number;
  averageConsistency: number;
  phcsAtRisk: {
    phcId: string;
    phcName: string;
    issue: string;
    reliabilityScore: number;
    recommendedVerification: string;
  }[];
  staleThresholdMinutes: number;
  confidencePenaltyFactor: number;
}

export function evaluateDataReliability(): DataReliabilityReport {
  const phcs = db.phcs;
  let totalScore = 0;
  let totalFreshness = 0;
  let totalCompleteness = 0;
  let totalConsistency = 0;

  const atRiskList: {
    phcId: string;
    phcName: string;
    issue: string;
    reliabilityScore: number;
    recommendedVerification: string;
  }[] = [];

  phcs.forEach((p) => {
    totalScore += p.dataReliabilityScore;
    totalFreshness += p.dataFreshnessMinutes;
    totalCompleteness += p.dataCompleteness;
    totalConsistency += p.dataConsistency;

    if (p.dataFreshnessMinutes > 30) {
      atRiskList.push({
        phcId: p.id,
        phcName: p.name,
        issue: `Telemetry sync latency is ${p.dataFreshnessMinutes} mins (>30 min threshold)`,
        reliabilityScore: p.dataReliabilityScore,
        recommendedVerification: 'Establish manual VHF/telephone confirmation with PHC Medical Officer prior to dispatch.'
      });
    } else if (p.dataCompleteness < 85) {
      atRiskList.push({
        phcId: p.id,
        phcName: p.name,
        issue: `Data completeness at ${p.dataCompleteness}% due to missing diagnostic logs`,
        reliabilityScore: p.dataReliabilityScore,
        recommendedVerification: 'Re-trigger DVDMS electronic stock reconciliation.'
      });
    }
  });

  const count = phcs.length || 1;
  const avgScore = Math.round(totalScore / count);

  return {
    overallScore: avgScore,
    averageFreshnessMin: Math.round(totalFreshness / count),
    averageCompleteness: Math.round(totalCompleteness / count),
    averageConsistency: Math.round(totalConsistency / count),
    phcsAtRisk: atRiskList,
    staleThresholdMinutes: 30,
    confidencePenaltyFactor: avgScore < 80 ? 0.75 : avgScore < 90 ? 0.9 : 1.0
  };
}

export function adjustConfidenceByReliability(
  rawConfidence: 'LOW' | 'MEDIUM' | 'HIGH',
  phcReliabilityScore: number
): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (phcReliabilityScore < 75) return 'LOW';
  if (phcReliabilityScore < 90 && rawConfidence === 'HIGH') return 'MEDIUM';
  return rawConfidence;
}
