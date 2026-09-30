import {
  ExpiryAwareRedistributionProposal,
  MedicineBatch,
  ResourceCircularitySummary
} from '../src/types.ts';
import { db } from './db.ts';

// Deterministic seed batches across hospitals
export function getMedicineBatches(): MedicineBatch[] {
  const batches: MedicineBatch[] = [];
  const medicines = [
    { name: 'ORS & Rehydration Salts', unit: 'packets', cost: 18, baseRate: 45 },
    { name: 'Paracetamol 650mg Tablets', unit: 'strips', cost: 24, baseRate: 35 },
    { name: 'Amoxicillin 500mg Antibiotics', unit: 'boxes', cost: 140, baseRate: 15 },
    { name: 'IV Fluids (Ringer Lactate)', unit: 'bottles', cost: 65, baseRate: 25 },
    { name: 'Ciprofloxacin 500mg', unit: 'strips', cost: 48, baseRate: 18 },
    { name: 'Anti-Rabies Vaccine (ARV)', unit: 'vials', cost: 350, baseRate: 6 },
    { name: 'Rapid Diagnostic Leptospirosis Kits', unit: 'tests', cost: 120, baseRate: 12 }
  ];

  db.phcs.forEach((phc, pIdx) => {
    medicines.forEach((med, mIdx) => {
      const batchNum = `BTH-${phc.code.slice(0, 6)}-${100 + pIdx * 10 + mIdx}`;
      // Introduce synthetic variance: some batches near expiry, some overstocked
      let daysToExpiry = 45 + ((pIdx * 17 + mIdx * 29) % 360);
      let currentStock = Math.round(med.baseRate * (10 + (pIdx % 6) * 8));

      // Specific deliberate near-expiry surplus cases for demo
      if (phc.id === 'phc-ts-02' && med.name.includes('ORS')) {
        daysToExpiry = 28; // Expiring in 28 days
        currentStock = 1200; // Large stock
      }
      if (phc.id === 'phc-ka-01' && med.name.includes('Amoxicillin')) {
        daysToExpiry = 21;
        currentStock = 450;
      }
      if (phc.id === 'phc-mh-02' && med.name.includes('IV Fluids')) {
        daysToExpiry = 35;
        currentStock = 800;
      }

      const dailyRate = Math.max(2, Math.round(med.baseRate * (phc.patientFootfallDaily / 300)));
      const expectedUsage = Math.min(currentStock, dailyRate * daysToExpiry);
      const projectedWastageUnits = Math.max(0, currentStock - expectedUsage);
      const projectedWastageInr = projectedWastageUnits * med.cost;

      let wasteRiskStatus: MedicineBatch['wasteRiskStatus'] = 'SAFE';
      if (daysToExpiry <= 30 && projectedWastageUnits > 0) {
        wasteRiskStatus = 'NEAR_EXPIRY';
      } else if (projectedWastageUnits > currentStock * 0.4) {
        wasteRiskStatus = 'HIGH_WASTE_RISK';
      } else if (currentStock > expectedUsage * 2) {
        wasteRiskStatus = 'OVERSTOCK';
      }

      const expDate = new Date(Date.now() + daysToExpiry * 86400000).toISOString().split('T')[0];

      batches.push({
        id: `batch-${phc.id}-${mIdx}`,
        batchNumber: batchNum,
        phcId: phc.id,
        phcName: phc.name,
        district: phc.district,
        medicineName: med.name,
        currentStock,
        unit: med.unit,
        unitCostInr: med.cost,
        expiryDate: expDate,
        daysToExpiry,
        dailyConsumptionRate: dailyRate,
        expectedUsageBeforeExpiry: expectedUsage,
        projectedWastageUnits,
        projectedWastageInr,
        wasteRiskStatus
      });
    });
  });

  return batches;
}

export function getExpiryAwareRedistributionProposals(): ExpiryAwareRedistributionProposal[] {
  const batches = getMedicineBatches();
  const proposals: ExpiryAwareRedistributionProposal[] = [];

  // Find batches with high waste risk and match to surging deficit PHCs
  const wasteBatches = batches.filter((b) => b.projectedWastageUnits >= 100 && b.daysToExpiry <= 45);

  wasteBatches.forEach((batch, idx) => {
    // Find target PHC that has high footfall / deficit
    const targetPhc = db.phcs.find((p) => p.id !== batch.phcId && (p.overallRisk === 'CRITICAL' || p.overallRisk === 'HIGH')) || db.phcs[0];
    const transferQty = Math.min(batch.projectedWastageUnits, 600);

    proposals.push({
      id: `waste-prop-${idx + 1}`,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      sourcePhcId: batch.phcId,
      sourcePhcName: batch.phcName,
      targetPhcId: targetPhc.id,
      targetPhcName: targetPhc.name,
      medicineName: batch.medicineName,
      unitsToTransfer: transferQty,
      daysToExpiry: batch.daysToExpiry,
      wastageAvoidedUnits: transferQty,
      valuePreservedInr: transferQty * batch.unitCostInr,
      rationale: `Source hospital has ${batch.currentStock} units with ${batch.daysToExpiry} days to expiry but only consumes ${batch.dailyConsumptionRate}/day. Pre-emptive transfer prevents ${transferQty} units of expired drug disposal while stabilizing acute outbreak demand at ${targetPhc.name}.`,
      status: 'PENDING'
    });
  });

  return proposals;
}

export function getResourceCircularitySummary(): ResourceCircularitySummary {
  const batches = getMedicineBatches();
  const proposals = getExpiryAwareRedistributionProposals();

  let potentialWastageUnits = 0;
  let potentialWastageValueInr = 0;
  let batchesAtRiskCount = 0;

  batches.forEach((b) => {
    if (b.projectedWastageUnits > 0) {
      potentialWastageUnits += b.projectedWastageUnits;
      potentialWastageValueInr += b.projectedWastageInr;
      batchesAtRiskCount++;
    }
  });

  let avoidedWastageUnits = 0;
  let avoidedWastageValueInr = 0;
  proposals.forEach((p) => {
    avoidedWastageUnits += p.wastageAvoidedUnits;
    avoidedWastageValueInr += p.valuePreservedInr;
  });

  const circularityScore = Math.min(
    95,
    Math.max(60, Math.round(((avoidedWastageUnits + 1000) / (potentialWastageUnits + 1000)) * 100))
  );

  return {
    totalMonitoredBatches: batches.length,
    potentialWastageUnits,
    potentialWastageValueInr,
    avoidedWastageUnits,
    avoidedWastageValueInr,
    circularityScore,
    batchesAtRiskCount
  };
}
