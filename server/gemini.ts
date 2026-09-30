import { GoogleGenAI } from '@google/genai';
import { db } from './db.ts';

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isGeminiConnected(): boolean {
  return ai !== null;
}

export async function askHealthNexus(
  userQuery: string,
  userRole: string = 'DISTRICT_AUTHORITY',
  selectedPhcId?: string
): Promise<{
  answer: string;
  intent: string;
  matchedEntities: {
    phcs: string[];
    resources: string[];
    riskLevels: string[];
  };
  sources: string[];
  suggestedFollowUps: string[];
}> {
  // 1. Entity & structured data extraction
  const lower = userQuery.toLowerCase();
  const matchedPhcs = db.phcs.filter(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.district.toLowerCase()) ||
      lower.includes(p.state.toLowerCase()) ||
      lower.includes(p.code.toLowerCase()) ||
      (selectedPhcId && p.id === selectedPhcId)
  );

  const matchedResources = db.resources.filter((r) =>
    lower.includes(r.name.toLowerCase()) || lower.includes(r.category.toLowerCase())
  );

  const matchedAlerts = db.alerts.filter(
    (a) =>
      matchedPhcs.some((p) => p.id === a.phcId) ||
      lower.includes(a.severity.toLowerCase()) ||
      lower.includes(a.resourceCategory.toLowerCase())
  );

  // Build live structured context
  const contextSummary = {
    totalPhcs: db.phcs.length,
    criticalPhcs: db.phcs.filter((p) => p.overallRisk === 'CRITICAL').map((p) => ({
      name: p.name,
      district: p.district,
      state: p.state,
      footfallDaily: p.patientFootfallDaily,
      footfallTrend: `+${p.patientFootfallTrend}%`,
      diseaseTrend: p.dominantDiseaseTrend,
      weather: p.weather,
      dataReliability: `${p.dataReliabilityScore}% (${p.dataReliabilityStatus})`
    })),
    highRiskPhcs: db.phcs.filter((p) => p.overallRisk === 'HIGH').map((p) => ({
      name: p.name,
      district: p.district,
      state: p.state,
      bedOccupancy: `${p.bedOccupancy}/${p.bedCapacity}`
    })),
    activeAlerts: db.alerts.slice(0, 5).map((a) => ({
      title: a.title,
      severity: a.severity,
      phcName: a.phcName,
      message: a.message,
      recommendedAction: a.recommendedAction
    })),
    pendingRecommendations: db.recommendations
      .filter((r) => r.status === 'PENDING')
      .map((r) => ({
        targetPhc: r.targetPhcName,
        sourcePhc: r.selectedSource.sourcePhcName,
        resource: r.resourceName,
        qty: `${r.requiredQuantity} ${r.unit}`,
        feasibilityScore: `${r.selectedSource.feasibilityScore}/100`,
        reason: r.whyThisSourceExplanation
      })),
    federatedIntelligence: {
      globalAccuracy: `${db.federatedRounds[db.federatedRounds.length - 1]?.globalAccuracy || 94.4}%`,
      activeNodes: db.federatedNodes.length
    }
  };

  if (ai) {
    try {
      const prompt = `You are the AI Healthcare Copilot for Health-Nexus AI, a federated healthcare resource intelligence system.
User Role: ${userRole}
Current Application Data Context:
${JSON.stringify(contextSummary, null, 2)}

User Question: "${userQuery}"

Instructions:
1. Answer accurately using ONLY the structured data context above.
2. Structure your answer with clear headers, key risk metrics, causal explanation (weather -> disease -> footfall -> resource), and actionable recommendations.
3. If data for an asked query is missing, state: "I don't have enough application data to answer that specific aspect."
4. Maintain a professional, clinical-operations command center tone. Do NOT provide patient medical diagnosis or prescription advice. Keep answers crisp and high-signal.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      return {
        answer: text,
        intent: 'RESOURCE_INTELLIGENCE_QUERY',
        matchedEntities: {
          phcs: matchedPhcs.map((p) => p.name),
          resources: Array.from(new Set(matchedResources.map((r) => r.name))),
          riskLevels: ['CRITICAL', 'HIGH']
        },
        sources: [
          'Health-Nexus Adaptive Ensemble Engine',
          'DVDMS Simulated Inventory Connector',
          'State Epidemiological Surveillance Feed'
        ],
        suggestedFollowUps: [
          'What happens if patient footfall rises another 30%?',
          'Which nearby PHCs have surplus ORS or Beds?',
          'Why has prediction confidence decreased in tribal nodes?'
        ]
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic response:', err);
    }
  }

  // Deterministic fallback response when Gemini is offline or unconfigured
  let fallbackAnswer = '';
  if (lower.includes('ors') || lower.includes('shortage') || lower.includes('critical')) {
    fallbackAnswer = `### Critical Risk Summary: Guntur Rural PHC (Andhra Pradesh)

* **Current Situation:** Guntur Rural PHC is facing a **CRITICAL ORS stock-out alert** within 48 hours.
* **Causal Drivers:** 145mm heavy monsoon rainfall triggered an Acute Diarrheal outbreak (+68% surge, 84 active cases), elevating daily footfall to 340 patients (+42%).
* **Stock vs Forecast:** Current stock is **380 sachets** against a 7-day predicted demand of **1,470 sachets** (Expected Range: 1,320 – 1,620).
* **Shortage Probability:** **92%** with High Data Reliability (97%).
* **Actionable Recommendation:** Rebalance **650 sachets from Vijayawada West Urban Health Post** (34 km away, surplus buffer 1,100 sachets, feasibility score 94/100).
* **Approval Status:** Pending District Authority approval.`;
  } else if (lower.includes('bed') || lower.includes('puri') || lower.includes('capacity')) {
    fallbackAnswer = `### Inpatient Bed Surge: Puri Coastal PHC (Odisha)

* **Current Occupancy:** **19/20 beds (95%)** occupied.
* **Epidemiological Trigger:** Bay of Bengal cyclone storm surge caused drinking water contamination, driving a +74% spike in cholera & severe gastroenteritis cases.
* **Forecast:** 18 additional inpatient bed-days projected over the next 72 hours.
* **Recommended Intervention:** Authorize dispatch of **8 rapid-deployment surge beds** and 2 rotating duty nurses from Bhubaneswar Sub-Urban PHC (58 km away).`;
  } else if (lower.includes('briefing') || lower.includes('today') || lower.includes('summary')) {
    fallbackAnswer = `### Today's Executive Healthcare Operations Briefing

1. **Monitored Network:** 15 PHCs across 6 states with 96.4% average data completeness.
2. **Critical Risk Centers (2):**
   - **Guntur Rural PHC (AP):** Imminent ORS stock-out (2 days remaining).
   - **Puri Coastal PHC (OD):** Bed capacity breach imminent (95% occupied).
3. **High-Risk Centers (3):**
   - **Raigad Coastal Health Post (MH):** Rapid test kits depleting due to monsoon leptospirosis.
   - **Mahabubnagar Tribal CHC (TS):** Staffing deficit (66% availability).
   - **Nilgiris Hilly Post (TN):** Pediatric respiratory surge.
4. **Federated Model Health:** Round #3 achieved **94.4% global accuracy** across Non-IID regional clusters with zero patient data centralization.`;
  } else {
    fallbackAnswer = `### Health-Nexus System Intelligence

Based on current simulated feeds across 15 Primary Health Centres:
* **2 Centers at CRITICAL risk:** Guntur Rural PHC (Andhra Pradesh) and Puri Coastal PHC (Odisha).
* **3 Centers at HIGH risk:** Raigad Coastal (MH), Mahabubnagar Tribal (TS), and Nilgiris (TN).
* **Surplus Availability:** Urban hubs in Vijayawada, Pune, and Bhubaneswar hold sufficient buffers to resolve predicted deficits within 2.5 hours transit time.
* **Federated Learning:** 6 state nodes are currently synced at 94.4% global accuracy.`;
  }

  return {
    answer: fallbackAnswer,
    intent: 'DETERMINISTIC_OPERATIONS_QUERY',
    matchedEntities: {
      phcs: matchedPhcs.map((p) => p.name),
      resources: matchedResources.map((r) => r.name),
      riskLevels: ['CRITICAL', 'HIGH']
    },
    sources: [
      'Health-Nexus Adaptive Ensemble Engine (Demo AI Mode)',
      'Simulated PHC Telemetry Database'
    ],
    suggestedFollowUps: [
      'Show me PHCs with predicted ORS shortages within 5 days',
      'What happens if patient footfall increases by 30%?',
      'Explain the Guntur Rural redistribution recommendation'
    ]
  };
}

export async function generateExecutiveBriefing(
  role: string = 'DISTRICT_AUTHORITY',
  jurisdiction: string = 'All Jurisdictions'
): Promise<{
  title: string;
  generatedAt: string;
  roleContext: string;
  summaryParagraph: string;
  criticalHighlights: string[];
  emergingRisks: string[];
  recommendedDecisions: string[];
  dataQualityCaveats: string[];
}> {
  const criticalPhcs = db.phcs.filter((p) => p.overallRisk === 'CRITICAL');
  const highRiskPhcs = db.phcs.filter((p) => p.overallRisk === 'HIGH');
  const pendingRecs = db.recommendations.filter((r) => r.status === 'PENDING');
  const stalePhcs = db.phcs.filter((p) => p.dataReliabilityStatus !== 'HIGH');

  if (ai) {
    try {
      const prompt = `Generate a concise, high-level Executive Healthcare Intelligence Briefing for a ${role} governing ${jurisdiction}.
Context:
- Monitored PHCs: ${db.phcs.length}
- Critical Risk PHCs: ${criticalPhcs.map((p) => `${p.name} (${p.district}, ${p.state}): ${p.dominantDiseaseTrend.disease}`).join('; ')}
- High Risk PHCs: ${highRiskPhcs.map((p) => `${p.name} (${p.state})`).join('; ')}
- Pending High-Impact Recommendations: ${pendingRecs.map((r) => `${r.resourceName} transfer to ${r.targetPhcName} from ${r.selectedSource.sourcePhcName}`).join('; ')}
- Stale or degraded data nodes: ${stalePhcs.map((p) => `${p.name} (Reliability: ${p.dataReliabilityScore}%)`).join('; ')}

Return a JSON object matching this schema:
{
  "title": "Short executive title",
  "summaryParagraph": "2-3 sentences overview",
  "criticalHighlights": ["point 1", "point 2", "point 3"],
  "emergingRisks": ["point 1", "point 2"],
  "recommendedDecisions": ["action 1", "action 2"],
  "dataQualityCaveats": ["caveat 1"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        title: parsed.title || `Executive Health Intelligence Briefing (${role})`,
        generatedAt: new Date().toISOString(),
        roleContext: `${role} — ${jurisdiction}`,
        summaryParagraph: parsed.summaryParagraph || 'Regional healthcare infrastructure exhibits concentrated pressure in monsoon flood zones requiring proactive supply rebalancing.',
        criticalHighlights: parsed.criticalHighlights || ['ORS shortage in Guntur Rural', 'Inpatient bed surge in Puri Coastal'],
        emergingRisks: parsed.emergingRisks || ['Waterborne infections escalating across coastal delta belt'],
        recommendedDecisions: parsed.recommendedDecisions || ['Approve 650 ORS transfer from Vijayawada West to Guntur Rural'],
        dataQualityCaveats: parsed.dataQualityCaveats || ['Mahabubnagar Tribal CHC telemetry has 38 min sync latency; verify field radio before critical dispatch.']
      };
    } catch (e) {
      console.warn('Gemini briefing generation failed, using deterministic template:', e);
    }
  }

  // Fallback
  return {
    title: `Daily Operational Health Intelligence Briefing — ${role}`,
    generatedAt: new Date().toISOString(),
    roleContext: `${role} — ${jurisdiction}`,
    summaryParagraph: `Active surveillance across 15 Primary Health Centres identifies 2 critical bottlenecks requiring immediate human authorization. Monsoon precipitation in Andhra Pradesh and Odisha continues to drive severe waterborne disease outbreaks.`,
    criticalHighlights: [
      `Guntur Rural PHC (Andhra Pradesh): ORS stock-out projected in 48 hours (92% probability) driven by +68% acute gastroenteritis surge.`,
      `Puri Coastal PHC (Odisha): Inpatient bed occupancy reached 95% (19/20 beds) under cyclone-induced cholera surge.`,
      `Raigad Coastal (Maharashtra): Leptospirosis diagnostic test cassettes depleted to 1.8 days supply.`
    ],
    emergingRisks: [
      `Tribal healthcare node in Mahabubnagar reporting 66% medical staff availability with elevated diarrhea footfall.`,
      `Nilgiris hilly tribal sector witnessing pediatric bronchopneumonia uptick with 5-day supply lead times.`
    ],
    recommendedDecisions: [
      `Authorize Transfer #REC-001: 650 ORS sachets from Vijayawada West to Guntur Rural (34 km, 1.2 hrs transit).`,
      `Authorize Transfer #REC-002: 8 rapid surge cots and 2 nursing officers from Bhubaneswar to Puri Coastal.`,
      `Acknowledge and route Alert #ALT-003 to Maharashtra State Medical Logistics Depot.`
    ],
    dataQualityCaveats: [
      `Mahabubnagar Tribal CHC sync latency is 38 minutes (Reliability 82%); confirm local stock registers prior to physical dispatch.`
    ]
  };
}

export async function explainWhatIfScenario(
  input: {
    footfallPercentChange: number;
    supplyDelayDays: number;
    rainfallCondition: string;
    staffAvailabilityCondition: string;
  },
  impacts: {
    affectedPhcs: number;
    criticalPhcs: number;
    medicineDeficitUnits: number;
    bedDeficit: number;
  }
): Promise<string> {
  if (ai) {
    try {
      const prompt = `You are Health-Nexus AI. Explain this simulated What-If healthcare scenario in 3 crisp paragraphs.
Parameters:
- Footfall change: ${input.footfallPercentChange > 0 ? '+' : ''}${input.footfallPercentChange}%
- Supply delivery delay: +${input.supplyDelayDays} days
- Rainfall condition: ${input.rainfallCondition}
- Staff availability: ${input.staffAvailabilityCondition}

Simulated Output:
- Affected PHCs: ${impacts.affectedPhcs} of 15
- Critical Risk PHCs: ${impacts.criticalPhcs}
- Total medicine deficit: ${impacts.medicineDeficitUnits} units
- Inpatient bed deficit: ${impacts.bedDeficit} beds

Explain:
1. The causal escalation mechanism.
2. The operational bottlenecks created.
3. Priority emergency mitigations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return response.text || '';
    } catch (e) {
      console.warn('What-If Gemini explanation failed:', e);
    }
  }

  return `### Simulated Cascade Impact Analysis

**1. Systemic Strain & Amplification:**
An increase of **${input.footfallPercentChange > 0 ? '+' : ''}${input.footfallPercentChange}% in patient footfall** compounded by a **${input.supplyDelayDays}-day supply logistics delay** elevates **${impacts.criticalPhcs} PHCs** into Critical risk status. Coastal and rural facilities with already tight safety stock margins face immediate depletion within 24–36 hours.

**2. Multi-Resource Cascade:**
The surge triggers concurrent pressure across all tiers: an aggregate deficit of **${impacts.medicineDeficitUnits} medicine units** (predominantly ORS and broad-spectrum antibiotics) and **${impacts.bedDeficit} inpatient beds**. Under ${input.staffAvailabilityCondition.toLowerCase()} staffing conditions, medical officer triage load increases to over 32 patients per doctor-hour.

**3. Strategic Pre-Emptive Mitigations:**
1. Pre-position buffer inventories from low-risk urban hubs (Vijayawada, Hyderabad, Pune).
2. Activate district-level emergency bed reserve protocols and deploy mobile telemedicine triage units to tribal centers.
3. Expedite emergency procurement bypass for critical oral rehydration and IV fluid supplies.`;
}
