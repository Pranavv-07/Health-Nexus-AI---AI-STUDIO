import { AiSystemHealth, DriftMetric } from '../src/types.ts';

export function getAiSystemHealth(): AiSystemHealth {
  const driftMetrics: DriftMetric[] = [
    {
      metricName: 'Monsoon Precipitation Feature Distribution',
      baselineValue: 45.0, // mm
      currentObservedValue: 145.0,
      driftPercent: 222.2,
      isDriftDetected: true,
      status: 'CRITICAL_DRIFT'
    },
    {
      metricName: 'Acute Diarrheal Footfall Vector',
      baselineValue: 280.0,
      currentObservedValue: 420.0,
      driftPercent: 50.0,
      isDriftDetected: true,
      status: 'WARNING'
    },
    {
      metricName: 'Inter-PHC Supply Lead Time Variance',
      baselineValue: 2.2, // days
      currentObservedValue: 3.8,
      driftPercent: 72.7,
      isDriftDetected: true,
      status: 'WARNING'
    },
    {
      metricName: 'Chronic OPD Patient Proportion',
      baselineValue: 62.0, // %
      currentObservedValue: 64.5,
      driftPercent: 4.0,
      isDriftDetected: false,
      status: 'STABLE'
    },
    {
      metricName: 'Model Prediction Residual Error (MAE)',
      baselineValue: 18.4,
      currentObservedValue: 22.8,
      driftPercent: 23.9,
      isDriftDetected: false,
      status: 'STABLE'
    }
  ];

  const recentDriftEvents = [
    {
      id: 'drift-ev-01',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      title: 'Covariate Shift: Extreme Rainfall Vector Spike',
      detail: 'Coastal precipitation exceeded 3.2 standard deviations from baseline 5-year monsoon distribution in Guntur and Puri.',
      severity: 'HIGH' as const
    },
    {
      id: 'drift-ev-02',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      title: 'Forecast Confidence Auto-Throttled (-12%)',
      detail: 'Sentinel automatic safety policy lowered automated recommendation confidence from 94% to 82% to prevent over-allocation.',
      severity: 'MEDIUM' as const
    },
    {
      id: 'drift-ev-03',
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      title: 'Federated Edge Retraining Scheduled',
      detail: 'Non-IID local weight drift in Andhra Pradesh cluster queued for Global Round #5 aggregation.',
      severity: 'LOW' as const
    }
  ];

  return {
    overallScore: 91,
    dataQualityScore: 96,
    modelAccuracyScore: 89,
    driftIndex: 28, // 0 = no drift, 100 = total drift
    confidenceStability: 88,
    regionalReliability: 92,
    safetyThrottlingActive: true,
    retrainingRecommended: true,
    driftMetrics,
    recentDriftEvents
  };
}
