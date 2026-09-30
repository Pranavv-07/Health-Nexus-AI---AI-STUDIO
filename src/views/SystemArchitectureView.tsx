import React, { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  Layers,
  Lock,
  Network,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Workflow,
  Zap
} from 'lucide-react';

export const SystemArchitectureView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 1,
      title: '1. Existing PHC Systems',
      subtitle: 'Simulated PHC EMR, DVDMS, Live Beds, Biometric HRMS, LIMS, Depot ERP',
      icon: Database,
      tag: 'INGESTION',
      tagColor: 'text-slate-400 bg-slate-800',
      description: 'Zero manual data entry burden for clinical staff. Simulates real-world legacy connectors across Patient Footfall, Drug Inventories, Bed Occupancy, Attendance, and Laboratory surveillance.',
      details: [
        'Connectors: /api/integrations/patient, /inventory, /beds, /staff, /diagnostics, /supply',
        'Automatic polling every 5–15 minutes with jitter & retry resilience',
        'Synthetic data modeling for 15+ Primary Health Centres across 6 Indian states'
      ]
    },
    {
      id: 2,
      title: '2. Integration & Reliability Engine',
      subtitle: 'Freshness, Completeness, Consistency & Anomaly Scoring',
      icon: Activity,
      tag: 'DATA QUALITY',
      tagColor: 'text-emerald-400 bg-emerald-950',
      description: 'Incoming telemetry is never blindly trusted. Verifies sync timestamps (<30 min threshold), missing logs, and anomalous spikes. Dynamically penalizes downstream AI prediction confidence if data becomes stale.',
      details: [
        'Real-time reliability score calculation (0–100%)',
        'Automated stale data warnings & field officer verification flags',
        'Confidence multiplier factor applied to all predictive models'
      ]
    },
    {
      id: 3,
      title: '3. Context Intelligence Engine',
      subtitle: 'Location, Weather (IMD), Season, Disease Vectors, Lead Time',
      icon: Layers,
      tag: 'FEATURE LAYER',
      tagColor: 'text-cyan-400 bg-cyan-950',
      description: 'Enriches raw inventory numbers with geographic and environmental factors: Monsoon precipitation, flood zones, coastal humidity, active cholera/diarrhea outbreaks, and transit lead times.',
      details: [
        'Geographic stratification: Plain, Coastal, Hilly, Tribal, Urban',
        'Epidemiological rate of acceleration tracking (+weekly surge %)',
        'Supply chain lead time buffers (1–6 days based on terrain)'
      ]
    },
    {
      id: 4,
      title: '4. Adaptive Ensemble AI',
      subtitle: 'Gradient Boosted Trees + Seasonal SARIMA + Context Regressors',
      icon: BrainCircuit,
      tag: 'PREDICTIVE CORE',
      tagColor: 'text-purple-400 bg-purple-950',
      description: 'Multi-resource forecasting combining tree-based feature regression with time-series trend decomposition and environmental regressors. Ensemble weights dynamically adapt per resource category and emergency severity.',
      details: [
        'Generates 14-day multi-resource demand curves and 95% uncertainty intervals',
        'Calculates shortage probability % and exact days-to-stockout marker',
        'Demonstrates MAE 14.2, RMSE 19.8, and R² = 0.942 on synthetic evaluation'
      ]
    },
    {
      id: 5,
      title: '5. Predict • Warn • Act Pipeline',
      subtitle: 'Hierarchical Early Warnings & Surplus Redistribution Search',
      icon: ShieldCheck,
      tag: 'OPERATIONS',
      tagColor: 'text-rose-400 bg-rose-950',
      description: 'Predicts deficits before stockouts occur. Automates hierarchical alert escalation across PHC Staff → District Health Officer → State Health Commissioner, and searches nearby facilities for surplus buffers.',
      details: [
        'Automated Haversine + road transit tortuosity distance calculations',
        'Calculates multi-criteria transfer feasibility score (0–100%)',
        'Ensures source facility retains safe 7-day operational reserve'
      ]
    },
    {
      id: 6,
      title: '6. Human-in-the-Loop Governance',
      subtitle: '6-Point Structured Explainability & Role-Gated Authorization',
      icon: UserCheck,
      tag: 'GOVERNANCE',
      tagColor: 'text-amber-400 bg-amber-950',
      description: 'The AI never autonomously transfers medical supplies. Generates transparent, 6-point structured explainability dossiers (Why, What, When, Certainty, Source, Feasibility) for human signature.',
      details: [
        'Strict Role-Based Access Control (RBAC)',
        'Approve/Reject modal with mandatory official rationale input',
        'Immediate immutable audit logging to cryptographically signed ledger'
      ]
    },
    {
      id: 7,
      title: '7. Federated Learning Simulation',
      subtitle: 'Regional Edge Learning without Raw Data Centralization',
      icon: Network,
      tag: 'PRIVACY AI',
      tagColor: 'text-blue-400 bg-blue-950',
      description: 'Edge nodes in Andhra Pradesh, Telangana, Maharashtra, Karnataka, Tamil Nadu, and Odisha train on local non-IID distributions. Only model updates are aggregated using FedAvg with differential privacy.',
      details: [
        'Non-IID regional characteristic modeling (Monsoon vs Urban vs Tribal)',
        'Interactive 1-click federated training round execution live in UI',
        'Zero centralization of sensitive patient or operational logs'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Health-Nexus AI End-to-End System Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive visual pipeline designed for Hackathon Judges: SEE → UNDERSTAND → PREDICT → WARN → RECOMMEND → APPROVE → LEARN
          </p>
        </div>

        <span className="px-3 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
          7-Stage Closed-Loop Architecture
        </span>
      </div>

      {/* Interactive Step-by-Step Architecture Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Vertical Stepper */}
        <div className="lg:col-span-6 space-y-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-xl'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm font-sans">{s.title}</h4>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{s.subtitle}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${s.tagColor}`}>
                    {s.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Deep Dive Explanation Panel */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                  STAGE {activeStep + 1} SPECIFICATION
                </span>
                <h3 className="text-lg font-bold text-white font-sans mt-1">
                  {steps[activeStep].title}
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${steps[activeStep].tagColor}`}>
                {steps[activeStep].tag}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Engine Functionality</span>
              <p className="text-slate-200 leading-relaxed font-sans text-xs">
                {steps[activeStep].description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-cyan-400 text-[10px] uppercase font-bold block">
                Technical Highlights & Implementation Details:
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {steps[activeStep].details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
            <span>Click any architecture stage on the left to inspect</span>
            <span className="text-cyan-400 font-bold">Health-Nexus AI Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
