import {
  ConfidenceLevel,
  ForecastPoint,
  PHC,
  ResourceCategory,
  ResourceForecast,
  ResourceItem,
  RiskLevel
} from '../src/types.ts';
import { db } from './db.ts';

// Dynamic weight generator based on resource & context
export function getEnsembleWeights(category: ResourceCategory, phc: PHC) {
  if (category === 'medicines') {
    // Contextual weight rises during extreme rainfall / outbreak
    if (phc.weather.rainfallMm > 100 || phc.dominantDiseaseTrend.weeklySurgePercent > 40) {
      return { treeBased: 0.40, timeSeries: 0.25, contextual: 0.35 };
    }
    return { treeBased: 0.45, timeSeries: 0.35, contextual: 0.20 };
  } else if (category === 'beds') {
    // Beds are heavily driven by severe illness rates and footfall
    return { treeBased: 0.40, timeSeries: 0.40, contextual: 0.20 };
  } else if (category === 'staff') {
    return { treeBased: 0.50, timeSeries: 0.30, contextual: 0.20 };
  } else if (category === 'diagnostics') {
    return { treeBased: 0.35, timeSeries: 0.25, contextual: 0.40 };
  } else {
    return { treeBased: 0.40, timeSeries: 0.30, contextual: 0.30 };
  }
}

export function generateResourceForecast(
  phcId: string,
  resourceId: string
): ResourceForecast | null {
  const phc = db.phcs.find((p) => p.id === phcId);
  const resource = db.resources.find((r) => r.id === resourceId);

  if (!phc || !resource) return null;

  const weights = getEnsembleWeights(resource.category, phc);
  const points: ForecastPoint[] = [];

  const now = new Date();
  let currentStockTracker = resource.currentStock;
  const baseRate = resource.dailyConsumptionRate || Math.max(1, Math.round(phc.patientFootfallDaily * 0.4));
  
  // Factor in disease surge & weather impact
  const surgeMultiplier = 1 + (phc.dominantDiseaseTrend.weeklySurgePercent / 100) * 0.6;
  const weatherMultiplier = 1 + (phc.weather.rainfallMm > 80 ? 0.25 : 0.05);
  const adjustedDailyDemand = Math.round(baseRate * surgeMultiplier * weatherMultiplier);

  // 1. Generate 7 days of historical actuals
  for (let i = 7; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const noise = (Math.sin(i * 1.5) * 0.15);
    const historicalVal = Math.round(baseRate * (1 + noise * 0.8));

    points.push({
      date: d.toISOString().split('T')[0],
      dayLabel: dayName,
      historicalActual: historicalVal,
      predictedDemand: historicalVal,
      predictedRangeLow: Math.round(historicalVal * 0.9),
      predictedRangeHigh: Math.round(historicalVal * 1.1),
      projectedStockRemaining: currentStockTracker + (historicalVal * (7 - i)),
      safetyThreshold: resource.safetyStockLevel,
      treeModelForecast: historicalVal,
      timeSeriesModelForecast: historicalVal,
      contextualModelForecast: historicalVal
    });
  }

  // 2. Generate 7 days of future predictions
  let predictedDemandTotal = 0;
  let predictedDemandLowTotal = 0;
  let predictedDemandHighTotal = 0;
  let dayOfStockout = -1;

  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Model 1: Tree-based feature regression simulation
    const growthTrend = 1 + (i * 0.04);
    const treeVal = Math.round(adjustedDailyDemand * growthTrend * 1.02);

    // Model 2: Time-series Holt-Winters seasonality
    const seasonalFactor = 1 + Math.sin((d.getDay() / 7) * Math.PI * 2) * 0.08;
    const timeSeriesVal = Math.round(adjustedDailyDemand * seasonalFactor * 0.98);

    // Model 3: Contextual Environmental regressor
    const contextVal = Math.round(adjustedDailyDemand * (phc.weather.rainfallMm > 100 ? 1.15 : 1.0));

    // Weighted ensemble
    const ensembleVal = Math.round(
      treeVal * weights.treeBased +
      timeSeriesVal * weights.timeSeries +
      contextVal * weights.contextual
    );

    // Uncertainty range (widens further in the future + data unreliability)
    const uncertaintyPct = 0.08 + (i * 0.02) + (100 - phc.dataReliabilityScore) * 0.003;
    const rangeLow = Math.round(ensembleVal * (1 - uncertaintyPct));
    const rangeHigh = Math.round(ensembleVal * (1 + uncertaintyPct));

    currentStockTracker = Math.max(0, currentStockTracker - ensembleVal);
    if (currentStockTracker <= resource.safetyStockLevel && dayOfStockout === -1) {
      dayOfStockout = i + 1;
    }

    predictedDemandTotal += ensembleVal;
    predictedDemandLowTotal += rangeLow;
    predictedDemandHighTotal += rangeHigh;

    points.push({
      date: d.toISOString().split('T')[0],
      dayLabel: dayName,
      predictedDemand: ensembleVal,
      predictedRangeLow: rangeLow,
      predictedRangeHigh: rangeHigh,
      projectedStockRemaining: currentStockTracker,
      safetyThreshold: resource.safetyStockLevel,
      treeModelForecast: treeVal,
      timeSeriesModelForecast: timeSeriesVal,
      contextualModelForecast: contextVal
    });
  }

  // Calculate shortage probability and risk
  let shortageProbability = 0;
  if (resource.currentStock < resource.safetyStockLevel) {
    shortageProbability = 95;
  } else if (resource.currentStock < predictedDemandTotal) {
    const ratio = (predictedDemandTotal - resource.currentStock) / predictedDemandTotal;
    shortageProbability = Math.min(96, Math.round(50 + ratio * 50));
  } else if (resource.currentStock < predictedDemandHighTotal) {
    shortageProbability = 35;
  } else {
    shortageProbability = 5;
  }

  let riskLevel: RiskLevel = 'NORMAL';
  if (shortageProbability > 80 || dayOfStockout <= 2 && dayOfStockout !== -1) {
    riskLevel = 'CRITICAL';
  } else if (shortageProbability > 50 || dayOfStockout <= 5 && dayOfStockout !== -1) {
    riskLevel = 'HIGH';
  } else if (shortageProbability > 25) {
    riskLevel = 'MEDIUM';
  } else if (shortageProbability > 10) {
    riskLevel = 'LOW';
  }

  let confidence: ConfidenceLevel = 'HIGH';
  if (phc.dataReliabilityScore < 80) confidence = 'LOW';
  else if (phc.dataReliabilityScore < 92) confidence = 'MEDIUM';

  const keyDrivers: string[] = [
    `Epidemiological surge in ${phc.dominantDiseaseTrend.disease} (+${phc.dominantDiseaseTrend.weeklySurgePercent}%)`,
    `Patient footfall trend (+${phc.patientFootfallTrend}% week-over-week)`,
    `Local precipitation intensity: ${phc.weather.rainfallMm}mm (${phc.weather.condition})`,
    `Supply lead time from central depot: ${phc.supplyLeadTimeDays} days`
  ];

  return {
    phcId: phc.id,
    phcName: phc.name,
    resourceId: resource.id,
    resourceName: resource.name,
    category: resource.category,
    unit: resource.unit,
    currentStock: resource.currentStock,
    safetyLevel: resource.safetyStockLevel,
    predictedDemandTotal,
    predictedRange: [predictedDemandLowTotal, predictedDemandHighTotal],
    shortageProbability,
    daysUntilShortage: dayOfStockout === -1 ? 30 : dayOfStockout,
    riskLevel,
    confidenceLevel: confidence,
    ensembleWeights: {
      treeBased: Math.round(weights.treeBased * 100),
      timeSeries: Math.round(weights.timeSeries * 100),
      contextual: Math.round(weights.contextual * 100)
    },
    keyDrivers,
    points
  };
}
