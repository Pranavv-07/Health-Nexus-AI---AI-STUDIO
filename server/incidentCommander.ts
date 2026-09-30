import {
  IncidentPostMortem,
  IncidentPriorityAction,
  IncidentRecord,
  IncidentTimelineEntry
} from '../src/types.ts';

// Current active incident instance in memory
let currentIncident: IncidentRecord = {
  id: 'inc-2026-001',
  code: 'FLOOD-CYCLONE-2026-001',
  title: 'Severe Coastal Cyclone & Monsoon Inundation Surge',
  incidentType: 'CYCLONE_FLOOD',
  status: 'ACTIVE',
  startedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  affectedPhcsCount: 7,
  affectedPhcIds: ['phc-ap-01', 'phc-ap-03', 'phc-od-01', 'phc-mh-01', 'phc-ka-02', 'phc-ts-01', 'phc-ap-02'],
  criticalResourcesCount: 4,
  patientPressureSurgePercent: 42,
  predictedGapSeverity: 'CRITICAL',
  timeline: [
    {
      id: 'time-1',
      time: '08:00 IST',
      title: 'Meteorological Anomaly Detected',
      source: 'IMD Coastal Doppler Radar',
      category: 'WEATHER',
      detail: 'Intense rain bands (145mm/24h) and storm surge warning recorded along Andhra Pradesh and Odisha coastline.'
    },
    {
      id: 'time-2',
      time: '08:20 IST',
      title: 'Epidemiological Patient Inflow Spike',
      source: 'PHC Surveillance Telemetry',
      category: 'PATIENT_SURGE',
      detail: 'Acute diarrheal and gastroenteritis triage volume at GGH Guntur spiked +42% above 30-day baseline.'
    },
    {
      id: 'time-3',
      time: '08:35 IST',
      title: 'Adaptive Ensemble AI Predicts 48h Stockout',
      source: 'Forecasting Engine (XGBoost + LSTM)',
      category: 'FORECAST',
      detail: 'Projected 7-day demand for ORS and IV fluids exceeds on-hand hospital reserve stock within 44 hours.'
    },
    {
      id: 'time-4',
      time: '08:50 IST',
      title: 'Bed Capacity Breach Warning',
      source: 'Inpatient Monitoring Telemetry',
      category: 'BED_CAPACITY',
      detail: 'Bed occupancy reached 114/120 cots (95% capacity) with emergency observation ward overflowing.'
    },
    {
      id: 'time-5',
      time: '09:05 IST',
      title: 'Hierarchical Early Warning Escalated',
      source: 'Alert Center',
      category: 'ALERT',
      detail: 'Automated notification dispatched to District Health Officer (Guntur) and State Health Commissioner.'
    },
    {
      id: 'time-6',
      time: '09:10 IST',
      title: 'Multi-Objective Resource Optimization Completed',
      source: 'AI Resource Allocation Optimizer',
      category: 'OPTIMIZATION',
      detail: 'Optimal network allocation computed: 600 units surplus identified at New GGH Vijayawada with 34km transit feasibility.'
    },
    {
      id: 'time-7',
      time: '09:15 IST',
      title: 'Mutual-Aid Transfer Proposal Generated',
      source: 'Logistics Intelligence Engine',
      category: 'LOGISTICS',
      detail: 'Temperature-controlled transport corridor assigned via NH-16 highway with 45-minute delivery window.'
    }
  ],
  actions: [
    {
      id: 'act-01',
      priorityRank: 1,
      title: 'Authorize 600 Units ORS Transfer (Vijayawada → Guntur)',
      description: 'Stabilize acute pediatric and adult dehydration ward before 48-hour stockout horizon.',
      ownerRole: 'DISTRICT_AUTHORITY',
      urgency: 'CRITICAL',
      status: 'PENDING',
      expectedImpact: 'Prevents clinical stockout for 280 incoming patients across next 5 days.',
      deadline: 'Today, 11:00 IST'
    },
    {
      id: 'act-02',
      priorityRank: 2,
      title: 'Deploy 8 Portable Surge Cots at Puri DHH',
      description: 'Convert community recreation hall into observation ward for flood-affected coastal villagers.',
      ownerRole: 'PHC_STAFF',
      urgency: 'HIGH',
      status: 'IN_PROGRESS',
      expectedImpact: 'Relieves 95% bed capacity bottleneck and prevents patient rejection.',
      deadline: 'Today, 12:30 IST'
    },
    {
      id: 'act-03',
      priorityRank: 3,
      title: 'Redirect Rapid Leptospirosis Diagnostic Kits to Alibag',
      description: 'Disinfectant and diagnostic transfer from Pune Sassoon Hospital along State Highway bypass.',
      ownerRole: 'DISTRICT_AUTHORITY',
      urgency: 'HIGH',
      status: 'PENDING',
      expectedImpact: 'Restores 14-day diagnostic testing capacity for waterborne bacterial infections.',
      deadline: 'Today, 14:00 IST'
    },
    {
      id: 'act-04',
      priorityRank: 4,
      title: 'Mobilize On-Call Emergency Shift Doctors',
      description: 'Call in 6 standby medical officers and 8 staff nurses for 24-hour rotating emergency roster.',
      ownerRole: 'STATE_AUTHORITY',
      urgency: 'MEDIUM',
      status: 'IN_PROGRESS',
      expectedImpact: 'Maintains nurse-to-patient ratio under 1:12 during peak night inflow.',
      deadline: 'Today, 15:00 IST'
    },
    {
      id: 'act-05',
      priorityRank: 5,
      title: 'Monitor Upstream Inundation Corridors',
      description: 'AI Sentinel continuous telemetry check on river gauge sensors and road bypass feasibility.',
      ownerRole: 'ADMIN',
      urgency: 'NORMAL',
      status: 'COMPLETED',
      expectedImpact: 'Ensures secondary logistics routes remain open if primary bridges close.',
      deadline: 'Continuous'
    }
  ],
  aiResponsePlan: {
    summary: 'Coordinated emergency response to contain dual-vector threat (monsoon flooding + waterborne diarrheal outbreak) across 7 vulnerable coastal facilities.',
    strategicDirectives: [
      'Pre-emptively replenish dehydration therapy stocks before regional road closures.',
      'Decentralize surge bed capacity via portable cots rather than long-distance ambulance transfers.',
      'Protect source facility reserves: No donating hospital may drop below 130% safety threshold.',
      'Utilize elevated bypass corridors if Doppler radar indicates highway flash flooding.'
    ],
    priorities: [
      {
        rank: 1,
        directive: 'Stabilize GGH Guntur Medicine Supply',
        rationale: 'Highest daily patient volume (420 pts/day) with lowest depletion timeline (<44 hours).',
        requiredApproval: 'DISTRICT_AUTHORITY'
      },
      {
        rank: 2,
        directive: 'Expand Puri Coastal Inpatient Buffer',
        rationale: 'Cyclonic storm surge in coastal Odisha driving cholera and gastroenteritis admission wave.',
        requiredApproval: 'PHC_STAFF'
      },
      {
        rank: 3,
        directive: 'Replenish Diagnostic Kits in Raigad & Alibag',
        rationale: 'Prevent diagnostic blindness for leptospirosis following standing water contamination.',
        requiredApproval: 'DISTRICT_AUTHORITY'
      },
      {
        rank: 4,
        directive: 'Activate Secondary Supply Corridors',
        rationale: 'Guarantee supply continuity even if primary Krishna River and coastal highway routes submerge.',
        requiredApproval: 'STATE_AUTHORITY'
      }
    ]
  }
};

export function getActiveIncident(): IncidentRecord {
  return currentIncident;
}

export function updateIncidentActionStatus(
  actionId: string,
  newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
): IncidentRecord {
  const action = currentIncident.actions.find((a) => a.id === actionId);
  if (action) {
    action.status = newStatus;
  }
  return currentIncident;
}

export function generateIncidentPostMortem(): IncidentPostMortem {
  const postMortem: IncidentPostMortem = {
    incidentId: currentIncident.id,
    completedAt: new Date().toISOString(),
    summary: `Emergency Incident ${currentIncident.code} successfully managed. Sourced 1,850 critical medicine units across 4 mutual-aid corridors without patient stockouts or hospital bed rejections. Total elapsed response time from Doppler alert to first delivery was 74 minutes.`,
    peakPatientSurge: currentIncident.patientPressureSurgePercent,
    resourcesMobilizedCount: 1850,
    responseTimeMinutes: 74,
    shortagesPreventedCount: 6,
    wastageAvoidedInr: 148500,
    lessonsLearned: [
      'Pre-emptive mutual-aid rebalancing at T+24h prevented acute pediatric triage failure at Guntur.',
      'Secondary elevated ridge bypass proved essential when coastal highway experienced localized waterlogging.',
      'Federated edge model training round #4 reduced demand forecast MAE by 14.2% across southern coastal nodes.'
    ],
    modelAccuracyScore: 92.4
  };

  currentIncident.postMortem = postMortem;
  currentIncident.status = 'RESOLVED';

  return postMortem;
}
