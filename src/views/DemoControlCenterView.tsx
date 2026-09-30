import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { triggerEmergencyScenario, resetDatabase, runFederatedRound } from '../services/api.ts';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Database,
  Flame,
  Hospital,
  Network,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DemoControlCenterView: React.FC = () => {
  const {
    demoStep,
    setDemoStep,
    setActiveView,
    setSelectedPhcId,
    setRole,
    triggerRefresh,
    showDemoToast
  } = useApp();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // 7-Stage Hackathon Demo Sequence as specified by sections 29 & 57
  const demoStepsList = [
    {
      step: 1,
      title: '1. Regional Health Network & Overview',
      role: 'DISTRICT_AUTHORITY',
      targetView: 'overview',
      description: 'Switch to District Authority role and inspect the 15-PHC geospatial surveillance network across 6 Indian states.',
      actionLabel: 'Launch Step 1: Command Center'
    },
    {
      step: 2,
      title: '2. Normal vs Emerging Risk Baseline',
      role: 'DISTRICT_AUTHORITY',
      targetView: 'phcDetail',
      phcId: 'phc-ap-01',
      description: 'Select Guntur Rural PHC to observe baseline resource inventory (ORS stock: 380, bed occupancy, weather context).',
      actionLabel: 'Launch Step 2: PHC Telemetry'
    },
    {
      step: 3,
      title: '3. Trigger Live Emergency Flash Flood Scenario',
      role: 'DISTRICT_AUTHORITY',
      targetView: 'forecasts',
      description: 'Trigger 185mm monsoon rain and +95% acute gastroenteritis outbreak, updating forecasts and shortage probabilities live.',
      actionLabel: 'Execute Live Emergency Trigger'
    },
    {
      step: 4,
      title: '4. Emergency Multi-Resource Cascade Transmission',
      role: 'DISTRICT_AUTHORITY',
      targetView: 'emergencyCascade',
      description: 'Visualize the ripple effect: Weather → Outbreak → Footfall (+65%) → ORS Depletion → Inpatient Bed Overflow (100%) → Neighbor strain.',
      actionLabel: 'Launch Step 4: Cascade Graph'
    },
    {
      step: 5,
      title: '5. Intelligent Surplus Search & 6-Point AI Dossier',
      role: 'DISTRICT_AUTHORITY',
      targetView: 'recommendations',
      description: 'AI detects optimal surplus in Vijayawada West (34 km, 1.2 hrs transit) and compiles a 6-point structured explainability recommendation.',
      actionLabel: 'Launch Step 5: AI Recommendation'
    },
    {
      step: 6,
      title: '6. Human-in-the-Loop Authorization & Immutable Audit Log',
      role: 'DISTRICT_AUTHORITY',
      targetView: 'auditLog',
      description: 'Official signs and approves the 650 ORS transfer, rebalancing inventory instantly with full audit ledger trail.',
      actionLabel: 'Launch Step 6: Governance Audit'
    },
    {
      step: 7,
      title: '7. Privacy-Preserving Federated Model Aggregation',
      role: 'ADMIN',
      targetView: 'federatedIntelligence',
      description: 'Execute a simulated edge training round across all 6 state nodes without centralizing raw clinical data, gaining +2.5% accuracy.',
      actionLabel: 'Launch Step 7: Federated Edge Learning'
    }
  ];

  const handleStepClick = async (stepNumber: number) => {
    setDemoStep(stepNumber);
    const target = demoStepsList[stepNumber - 1];
    setRole(target.role as any);
    if (target.phcId) setSelectedPhcId(target.phcId);

    if (stepNumber === 3) {
      setLoadingAction('emergency');
      await triggerEmergencyScenario();
      setLoadingAction(null);
      showDemoToast('🚨 Full Emergency Scenario Triggered: Monsoon flood surge active in Guntur & Puri!');
      triggerRefresh();
    } else if (stepNumber === 7) {
      setLoadingAction('fed');
      await runFederatedRound();
      setLoadingAction(null);
      confetti({ particleCount: 100, spread: 80 });
      showDemoToast('🎉 Federated Round Aggregated across 6 Regional Clusters!');
      triggerRefresh();
    }

    setActiveView(target.targetView as any);
  };

  const handleTriggerFullSequence = async () => {
    setLoadingAction('full');
    try {
      await triggerEmergencyScenario();
      setRole('DISTRICT_AUTHORITY');
      setSelectedPhcId('phc-ap-01');
      setDemoStep(3);
      showDemoToast('🚨 Full Emergency Scenario Triggered Live! Navigating to Adaptive Forecast...');
      triggerRefresh();
      setActiveView('forecasts');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetDemo = async () => {
    setLoadingAction('reset');
    try {
      await resetDatabase();
      setDemoStep(0);
      showDemoToast('🔄 Demo database reset to clean initial baseline state.');
      triggerRefresh();
      setActiveView('overview');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Hackathon Judge Demo Control Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic live test-harness for demonstrating the complete SEE → UNDERSTAND → PREDICT → WARN → RECOMMEND → APPROVE → LEARN pipeline
          </p>
        </div>

        {/* Global Reset Button */}
        <button
          onClick={handleResetDemo}
          disabled={loadingAction !== null}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
          <span>Reset Demo Data Baseline</span>
        </button>
      </div>

      {/* Primary Big CTA: Run Full Emergency Scenario */}
      <div className="rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/40 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase text-rose-300 tracking-wider">
                PRIMARY 5-MINUTE HACKATHON LIVE DEMO
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Run Full Live Emergency Scenario
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans mt-1">
              Instantly simulates extreme monsoon precipitation (185mm) in Guntur (AP) and a cyclone-induced cholera surge in Puri (OD), activating the complete multi-resource forecasting, alert escalation, surplus matching, and human approval flow.
            </p>
          </div>

          <button
            onClick={handleTriggerFullSequence}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-bold text-sm shadow-xl shadow-rose-950/80 border border-rose-400/40 transition-all cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loadingAction === 'full' ? 'Activating Scenario...' : 'RUN FULL EMERGENCY SCENARIO'}</span>
          </button>
        </div>
      </div>

      {/* 7-Step Guided Sequence Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-base">Guided Step-by-Step Judge Walkthrough</h3>
          <span className="text-xs font-mono text-cyan-400">
            {demoStep > 0 ? `Step ${demoStep} of 7 Selected` : 'Click any step to jump'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoStepsList.map((item) => {
            const isActive = demoStep === item.step;
            return (
              <div
                key={item.step}
                className={`p-4.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400 shadow-xl'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      STAGE {item.step}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {item.role}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-2 font-sans">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1.5 font-sans leading-relaxed">{item.description}</p>
                </div>

                <button
                  onClick={() => handleStepClick(item.step)}
                  className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
