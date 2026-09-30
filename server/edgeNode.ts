import { EdgeNodeState, EdgeQueuedAction, EdgeSyncResult, ResourceItem } from '../src/types.ts';
import { db } from './db.ts';

// In-memory queue of edge actions for demo
let edgeConnectivityStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';
const queuedActions: EdgeQueuedAction[] = [
  {
    id: 'edge-act-01',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    actionType: 'CONSUMPTION_LOG',
    payload: { resourceCode: 'ORS-AP-01', quantityUsed: 140, patientBatch: 'OPD-Emergency-084' },
    syncStatus: 'QUEUED'
  },
  {
    id: 'edge-act-02',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    actionType: 'BED_UPDATE',
    payload: { newOccupancy: 118, surgeCotsDeployed: 4, ward: 'Acute Diarrheal Observation' },
    syncStatus: 'QUEUED'
  },
  {
    id: 'edge-act-03',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    actionType: 'STAFF_SHIFT',
    payload: { nurseOnDutyCount: 6, doctorPresent: 'Dr. N. Prabhavathi', shift: 'Night Surge' },
    syncStatus: 'QUEUED'
  }
];

export function getEdgeNodeState(phcId: string = 'phc-ap-01'): {
  state: EdgeNodeState;
  queuedActions: EdgeQueuedAction[];
  cachedResources: ResourceItem[];
} {
  const phc = db.phcs.find((p) => p.id === phcId) || db.phcs[0];
  const resources = db.resources.filter((r) => r.phcId === phc.id);

  return {
    state: {
      phcId: phc.id,
      phcName: phc.name,
      connectivityStatus: edgeConnectivityStatus,
      lastSyncTime: new Date(Date.now() - 35 * 60000).toISOString(),
      pendingSyncQueueCount: queuedActions.filter((a) => a.syncStatus === 'QUEUED').length,
      cachedRecordsCount: 480,
      isLocalInferenceActive: edgeConnectivityStatus === 'OFFLINE'
    },
    queuedActions,
    cachedResources: resources
  };
}

export function setEdgeConnectivity(status: 'ONLINE' | 'DEGRADED' | 'OFFLINE') {
  edgeConnectivityStatus = status;
  return { status: edgeConnectivityStatus };
}

export function addEdgeOfflineAction(action: Omit<EdgeQueuedAction, 'id' | 'timestamp' | 'syncStatus'>) {
  const newAction: EdgeQueuedAction = {
    id: `edge-act-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actionType: action.actionType,
    payload: action.payload,
    syncStatus: 'QUEUED'
  };
  queuedActions.push(newAction);
  return newAction;
}

export function triggerEdgeSynchronization(): EdgeSyncResult {
  const pendingCount = queuedActions.filter((a) => a.syncStatus === 'QUEUED').length;

  queuedActions.forEach((a) => {
    a.syncStatus = 'SYNCED';
  });

  edgeConnectivityStatus = 'ONLINE';

  return {
    syncedCount: pendingCount,
    conflictsDetectedCount: 0,
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  };
}
