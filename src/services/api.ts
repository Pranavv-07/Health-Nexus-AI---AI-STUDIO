import {
  Alert,
  AuditLogEntry,
  CascadeGraph,
  FederatedNode,
  FederatedRound,
  ModelMetric,
  PHC,
  Recommendation,
  ResourceForecast,
  ResourceItem,
  SystemIntegrationStatus,
  TimelineStep,
  DigitalTwinSnapshot,
  UserRole,
  WhatIfScenarioInput,
  WhatIfSimulationResult,
  MultimodalAnalysisResult,
  VertexAiModelInfo
} from '../types.ts';

const API_BASE = '/api';

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  return res.json();
}

export async function fetchPhcs(params?: { state?: string; district?: string; risk?: string; search?: string }): Promise<PHC[]> {
  const query = new URLSearchParams();
  if (params?.state) query.set('state', params.state);
  if (params?.district) query.set('district', params.district);
  if (params?.risk) query.set('risk', params.risk);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/phcs?${query.toString()}`);
  return res.json();
}

export async function fetchPhcById(id: string): Promise<{ phc: PHC; resources: ResourceItem[]; alerts: Alert[]; recommendations: Recommendation[] }> {
  const res = await fetch(`${API_BASE}/phcs/${id}`);
  return res.json();
}

export async function fetchResources(params?: { phcId?: string; category?: string; risk?: string }): Promise<ResourceItem[]> {
  const query = new URLSearchParams();
  if (params?.phcId) query.set('phcId', params.phcId);
  if (params?.category) query.set('category', params.category);
  if (params?.risk) query.set('risk', params.risk);

  const res = await fetch(`${API_BASE}/resources?${query.toString()}`);
  return res.json();
}

export async function fetchForecast(phcId: string, resourceId: string): Promise<ResourceForecast> {
  const res = await fetch(`${API_BASE}/forecasts/${phcId}/${resourceId}`);
  return res.json();
}

export async function fetchAlerts(params?: { severity?: string; escalation?: string; status?: string }): Promise<Alert[]> {
  const query = new URLSearchParams();
  if (params?.severity) query.set('severity', params.severity);
  if (params?.escalation) query.set('escalation', params.escalation);
  if (params?.status) query.set('status', params.status);

  const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
  return res.json();
}

export async function acknowledgeAlert(alertId: string, user: string, role: UserRole) {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, role })
  });
  return res.json();
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations`);
  return res.json();
}

export async function approveRecommendation(id: string, user: string, role: UserRole, notes?: string) {
  const res = await fetch(`${API_BASE}/recommendations/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, role, notes })
  });
  return res.json();
}

export async function rejectRecommendation(id: string, user: string, role: UserRole, reason?: string) {
  const res = await fetch(`${API_BASE}/recommendations/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, role, reason })
  });
  return res.json();
}

export async function generateRedistributionRecommendation(targetPhcId: string, resourceId: string, requiredQty?: number): Promise<Recommendation> {
  const res = await fetch(`${API_BASE}/recommendations/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetPhcId, resourceId, requiredQty })
  });
  return res.json();
}

export async function fetchEmergencyCascade(phcId?: string): Promise<CascadeGraph> {
  const url = phcId ? `${API_BASE}/emergency/cascade/${phcId}` : `${API_BASE}/emergency/cascade`;
  const res = await fetch(url);
  return res.json();
}

export async function runWhatIfScenario(input: WhatIfScenarioInput): Promise<WhatIfSimulationResult> {
  const res = await fetch(`${API_BASE}/scenarios/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function triggerEmergencyScenario() {
  const res = await fetch(`${API_BASE}/scenarios/emergency-trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/scenarios/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function fetchFederatedData(): Promise<{ nodes: FederatedNode[]; rounds: FederatedRound[]; globalTopology: any }> {
  const res = await fetch(`${API_BASE}/federated`);
  return res.json();
}

export async function runFederatedRound() {
  const res = await fetch(`${API_BASE}/federated/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function fetchDataQuality() {
  const res = await fetch(`${API_BASE}/data-quality`);
  return res.json();
}

export async function fetchModelPerformance(): Promise<{ metrics: ModelMetric[]; ensembleArchitecture: any }> {
  const res = await fetch(`${API_BASE}/model-performance`);
  return res.json();
}

export async function fetchIntegrations(): Promise<SystemIntegrationStatus[]> {
  const res = await fetch(`${API_BASE}/integrations`);
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  return res.json();
}

export async function queryAi(query: string, role: string, phcId?: string, user?: string) {
  const res = await fetch(`${API_BASE}/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, role, phcId, user })
  });
  return res.json();
}

export async function generateBriefing(role: string, jurisdiction?: string) {
  const res = await fetch(`${API_BASE}/ai/briefing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, jurisdiction })
  });
  return res.json();
}

export async function fetchDigitalTwinSnapshot(step: TimelineStep = 'TODAY'): Promise<DigitalTwinSnapshot> {
  const res = await fetch(`${API_BASE}/digital-twin?step=${step}`);
  return res.json();
}

export async function fetchRecentMultimodalAnalyses(): Promise<MultimodalAnalysisResult[]> {
  const res = await fetch(`${API_BASE}/multimodal/recent`);
  return res.json();
}

export async function submitMultimodalAnalysis(data: {
  imageBase64?: string;
  mimeType?: string;
  analysisType: 'citizen_hazard' | 'crop_disease' | 'pollution_monitoring';
  location?: string;
  phcId?: string;
}): Promise<MultimodalAnalysisResult> {
  const res = await fetch(`${API_BASE}/multimodal/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchVertexAiModels(): Promise<VertexAiModelInfo[]> {
  const res = await fetch(`${API_BASE}/vertex-ai/models`);
  return res.json();
}

export async function triggerVertexRetraining(modelId: string) {
  const res = await fetch(`${API_BASE}/vertex-ai/simulate-retraining`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId })
  });
  return res.json();
}


