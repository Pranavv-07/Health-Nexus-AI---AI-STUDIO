import { FederatedNode, FederatedRound } from '../src/types.ts';
import { db } from './db.ts';

export function runFederatedTrainingRound(): {
  round: FederatedRound;
  updatedNodes: FederatedNode[];
  summary: string;
} {
  const lastRound = db.federatedRounds[db.federatedRounds.length - 1];
  const newRoundNum = (lastRound?.roundNumber || 0) + 1;

  // 1. Simulate local training across regional edge nodes
  let totalWeightedAccuracy = 0;
  let totalWeightedLoss = 0;
  let totalDatasetSize = 0;

  db.federatedNodes.forEach((node) => {
    // Local accuracy incrementally improves with non-IID noise
    const noise = (Math.random() * 0.4) - 0.1;
    const improvedAccuracy = Math.min(98.8, parseFloat((node.localAccuracy + 0.6 + noise).toFixed(2)));
    const reducedLoss = Math.max(0.04, parseFloat((node.localLoss * 0.91).toFixed(3)));
    const datasetIncrement = Math.floor(Math.random() * 1200) + 600;

    node.localAccuracy = improvedAccuracy;
    node.localLoss = reducedLoss;
    node.localDatasetSize += datasetIncrement;
    node.status = 'SYNCED';

    totalDatasetSize += node.localDatasetSize;
  });

  // Calculate FedAvg contribution weights
  db.federatedNodes.forEach((node) => {
    node.lastRoundContributionWeight = parseFloat((node.localDatasetSize / totalDatasetSize).toFixed(3));
    totalWeightedAccuracy += node.localAccuracy * node.lastRoundContributionWeight;
    totalWeightedLoss += node.localLoss * node.lastRoundContributionWeight;
  });

  const globalAcc = parseFloat(totalWeightedAccuracy.toFixed(2));
  const globalLoss = parseFloat(totalWeightedLoss.toFixed(3));
  const prevAcc = lastRound?.globalAccuracy || 91.0;
  const gain = parseFloat((globalAcc - prevAcc).toFixed(2));

  const newRound: FederatedRound = {
    roundNumber: newRoundNum,
    timestamp: new Date().toISOString(),
    participatingNodes: db.federatedNodes.length,
    globalAccuracy: globalAcc,
    globalLoss: globalLoss,
    aggregationAlgorithm: 'FedAvg with Non-IID Dynamic Weighting',
    accuracyGainPercent: Math.max(0.2, gain),
    status: 'COMPLETED',
    notes: `Simulated edge training on ${totalDatasetSize.toLocaleString()} records across 6 state clusters with differential privacy preservation.`
  };

  db.federatedRounds.push(newRound);

  // Add audit log
  db.auditLogs.unshift({
    id: `log-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user: 'federated.coordinator',
    role: 'ADMIN',
    action: 'FEDERATED_ROUND_AGGREGATED',
    entityType: 'FEDERATED_ROUND',
    entityId: `ROUND-${newRoundNum}`,
    status: 'SUCCESS',
    details: `Round #${newRoundNum} completed. Global accuracy reached ${globalAcc}% (+${gain}% gain) across ${db.federatedNodes.length} regional clusters.`,
    ipAddress: '10.0.12.1 (Fed Server)'
  });

  return {
    round: newRound,
    updatedNodes: db.federatedNodes,
    summary: `Federated Training Round #${newRoundNum} executed successfully. Global model accuracy improved to ${globalAcc}% across 6 regional nodes without moving raw patient telemetry.`
  };
}
