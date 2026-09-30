import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchAlerts, acknowledgeAlert } from '../services/api.ts';
import { Alert, EscalationLevel, RiskLevel } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Layers,
  MapPin,
  Radio,
  Share2,
  ShieldAlert
} from 'lucide-react';

export const AlertCenterView: React.FC = () => {
  const { role, refreshSignal, triggerRefresh, showDemoToast, setActiveView, setSelectedPhcId, t } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedEscalation, setSelectedEscalation] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts()
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [refreshSignal]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, 'Duty Officer', role);
      showDemoToast('✅ Alert acknowledged & recorded in system audit log.');
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (selectedEscalation !== 'ALL' && a.escalationLevel !== selectedEscalation) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.nav.alerts}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.kpi.hierarchicalTier}: {t.roles.PHC_STAFF} → {t.roles.DISTRICT_AUTHORITY} → {t.roles.STATE_AUTHORITY} → {t.roles.NATIONAL_AUTHORITY}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {alerts.filter((a) => a.status === 'ACTIVE').length} {t.kpi.active}
          </span>
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {alerts.filter((a) => a.status === 'ACKNOWLEDGED').length} {t.common.approved}
          </span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-400">{t.common.filterRisk}:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="ALL">{t.common.allRisks}</option>
            <option value="CRITICAL">{t.common.critical}</option>
            <option value="HIGH">{t.common.high}</option>
            <option value="MEDIUM">{t.common.medium}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Escalation Tier:</span>
          <select
            value={selectedEscalation}
            onChange={(e) => setSelectedEscalation(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="ALL">All Tiers (PHC / District / State / National)</option>
            <option value="PHC">PHC Tier</option>
            <option value="District">District Authority Tier</option>
            <option value="State">State Authority Tier</option>
            <option value="National">National Ministry Tier</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isAcknowledged = alert.status === 'ACKNOWLEDGED';

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 transition-all shadow-xl ${
                isCritical
                  ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900'
                  : 'border-slate-800 bg-slate-900/90'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={alert.severity} size="sm" pulse={isCritical} />
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 uppercase">
                      Escalated to: {alert.escalationLevel} Tier
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: #{alert.id}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white font-sans mt-1">
                    {alert.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{alert.phcName} ({alert.district}, {alert.state})</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  {!isAcknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-semibold"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold px-2 py-1 bg-emerald-950/60 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledged</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedPhcId(alert.phcId);
                      setActiveView('recommendations');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md transition-colors"
                  >
                    <span>Launch Redistribution</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Structured Conditions & Impact */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Current Condition</span>
                  <p className="text-slate-200 leading-relaxed">{alert.currentCondition}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Predicted Forecast</span>
                  <p className="text-rose-300 leading-relaxed font-semibold">{alert.predictedCondition}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Clinical Impact</span>
                  <p className="text-slate-300 leading-relaxed">{alert.expectedImpact}</p>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="mt-3.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs font-mono">
                <Share2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 uppercase block text-[10px]">Recommended Operational Action:</strong>
                  <span className="text-slate-200">{alert.recommendedAction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
