import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchDashboard, fetchPhcs, triggerEmergencyScenario } from '../services/api.ts';
import { PHC, Alert, Recommendation } from '../types.ts';
import { StatCard } from '../components/common/StatCard.tsx';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { IndiaPhcMap } from '../components/map/IndiaPhcMap.tsx';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bed,
  CheckCircle,
  CheckSquare,
  Clock,
  Flame,
  Hospital,
  Package,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { t, role, setActiveView, setSelectedPhcId, refreshSignal, showDemoToast, triggerRefresh } = useApp();
  const [data, setData] = useState<any>(null);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringEmergency, setTriggeringEmergency] = useState(false);

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchPhcs()])
      .then(([dash, phcList]) => {
        setData(dash);
        setPhcs(phcList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, [refreshSignal]);

  const handleTriggerEmergency = async () => {
    setTriggeringEmergency(true);
    try {
      await triggerEmergencyScenario();
      showDemoToast('🚨 Emergency Scenario Triggered: Monsoon flood surge active in Guntur & Puri!');
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setTriggeringEmergency(false);
    }
  };

  const handleSelectPhc = (phc: PHC) => {
    setSelectedPhcId(phc.id);
    setActiveView('phcDetail');
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading Healthcare Intelligence Command Center...</p>
        </div>
      </div>
    );
  }

  const kpi = data.kpis;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Emergency Scenario Controller Callout */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300">
                AI Healthcare Operations Command Center
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Predictive Resource Intelligence Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans">
              Continuous multi-resource surveillance across 15 Primary Health Centres. Integrating weather patterns, epidemiological infection vectors, and non-IID federated edge learning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('demoControlCenter')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-md"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Guided Demo Guide</span>
            </button>

            <button
              onClick={handleTriggerEmergency}
              disabled={triggeringEmergency}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-950/60 border border-rose-400/40 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 animate-bounce" />
              <span>{triggeringEmergency ? 'Triggering Live...' : 'Trigger Full Emergency Scenario'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t.kpi.criticalHospitals}
          value={kpi.criticalCenters}
          subtitle={t.kpi.stockout48h}
          icon={Flame}
          variant={kpi.criticalCenters > 0 ? 'critical' : 'default'}
          trend={{ value: 'Guntur & Puri', isPositive: false, label: t.common.critical }}
          onClick={() => setActiveView('alerts')}
        />

        <StatCard
          title={t.kpi.activeAlerts}
          value={kpi.activeAlertsCount}
          subtitle={t.kpi.hierarchicalTier}
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: '3 District, 1 State', isPositive: true }}
          onClick={() => setActiveView('alerts')}
        />

        <StatCard
          title={t.kpi.pendingApprovals}
          value={kpi.pendingApprovalsCount}
          subtitle={t.kpi.humanInLoop}
          icon={CheckCircle}
          variant="cyan"
          trend={{ value: 'Rebalance ready', isPositive: true }}
          onClick={() => setActiveView('recommendations')}
        />

        <StatCard
          title={t.kpi.dataReliability}
          value={`${kpi.dataReliabilityScore}%`}
          subtitle={t.kpi.telemetryVerified}
          icon={ShieldCheck}
          variant="success"
          trend={{ value: '96.4% Completeness', isPositive: true }}
          onClick={() => setActiveView('dataReliability')}
        />
      </div>

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">{t.kpi.totalHospitals}:</span>
          </div>
          <span className="font-bold text-white">{kpi.phcsMonitored}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">{t.kpi.dailyFootfall}:</span>
          </div>
          <span className="font-bold text-white">{kpi.totalDailyFootfall.toLocaleString()} {t.kpi.ptsPerDay}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">{t.kpi.bedOccupancy}:</span>
          </div>
          <span className="font-bold text-amber-300">{kpi.systemBedOccupancyPct}% {t.kpi.occupied}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">{t.kpi.staffPresence}:</span>
          </div>
          <span className="font-bold text-emerald-300">{kpi.systemStaffAvailabilityPct}% {t.kpi.active}</span>
        </div>
      </div>

      {/* Interactive India PHC Map */}
      <IndiaPhcMap
        phcs={phcs}
        onSelectPhc={handleSelectPhc}
      />

      {/* Two Column Grid: Critical Alerts & High-Impact Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Critical Alerts (Hierarchical) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white text-base">Critical Early Warnings & Alerts</h3>
            </div>
            <button
              onClick={() => setActiveView('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>View All ({data.recentAlerts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data.recentAlerts.map((alert: Alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl border border-slate-800/90 bg-slate-950/60 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                      {alert.state} • {alert.district} • Escalated to {alert.escalationLevel}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm mt-0.5">{alert.title}</h4>
                  </div>
                  <RiskBadge level={alert.severity} size="sm" />
                </div>
                <p className="mt-2 text-xs text-slate-300 line-clamp-2">{alert.message}</p>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => setActiveView('recommendations')}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    View Recommendation →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pending Human-in-the-Loop Recommendations */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Actionable AI Redistribution Proposals</h3>
            </div>
            <button
              onClick={() => setActiveView('recommendations')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>Review All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data.topPendingRecommendations.map((rec: Recommendation) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-950/60 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      PROPOSED TRANSFER #{rec.id.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-0.5">
                      {rec.requiredQuantity} {rec.unit} {rec.resourceName}
                    </h4>
                  </div>
                  <RiskBadge level={rec.riskLevel} size="sm" />
                </div>

                <div className="mt-2.5 text-xs font-mono text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Deficit Node:</span>
                    <span className="font-semibold text-rose-300">{rec.targetPhcName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Optimal Surplus Source:</span>
                    <span className="font-semibold text-emerald-300">{rec.selectedSource.sourcePhcName} ({rec.selectedSource.distanceKm} km)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Feasibility Score:</span>
                    <span className="font-bold text-cyan-300">{rec.selectedSource.feasibilityScore}/100</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Requires {rec.requiredApprovalRole}</span>
                  <button
                    onClick={() => setActiveView('recommendations')}
                    className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold transition-colors"
                  >
                    Review & Authorize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
