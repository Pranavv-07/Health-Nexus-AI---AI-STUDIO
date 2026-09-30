import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchDataQuality, fetchIntegrations } from '../services/api.ts';
import { SystemIntegrationStatus } from '../types.ts';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Layers,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const DataReliabilityView: React.FC = () => {
  const { refreshSignal, triggerRefresh } = useApp();
  const [dataReport, setDataReport] = useState<any>(null);
  const [integrations, setIntegrations] = useState<SystemIntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDataQuality(), fetchIntegrations()])
      .then(([quality, intList]) => {
        setDataReport(quality);
        setIntegrations(intList);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [refreshSignal]);

  if (loading || !dataReport) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const { report, phcReliabilityMatrix } = dataReport;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Data Reliability & Telemetry Quality Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous real-time verification of data freshness, completeness, schema consistency, and anomaly detection
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
            System Reliability: {report.overallScore}%
          </span>
        </div>
      </div>

      {/* Top Warning Banner if Stale Nodes Detected */}
      {report.phcsAtRisk.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4.5 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold font-mono text-xs uppercase">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Telemetry Latency Warning (Confidence Auto-Degraded)</span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            The AI engine automatically reduces forecasting confidence when PHC telemetry sync exceeds the 30-minute freshness threshold.
          </p>
          <div className="space-y-1.5 pt-1">
            {report.phcsAtRisk.map((riskItem: any, idx: number) => (
              <div key={idx} className="text-xs font-mono text-amber-200 flex items-center gap-2">
                <span>• <strong>{riskItem.phcName}:</strong> {riskItem.issue} ({riskItem.recommendedVerification})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reliability KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase block">Average Sync Freshness</span>
          <span className="text-2xl font-bold text-cyan-300 mt-1 block">{report.averageFreshnessMin} mins</span>
          <span className="text-[10px] text-slate-500">Threshold: &lt;30 mins</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase block">Data Completeness</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{report.averageCompleteness}%</span>
          <span className="text-[10px] text-slate-500">Zero missing critical fields</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase block">Record Consistency</span>
          <span className="text-2xl font-bold text-white mt-1 block">{report.averageConsistency}%</span>
          <span className="text-[10px] text-slate-500">Cross-system validation</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase block">Confidence Factor</span>
          <span className="text-2xl font-bold text-purple-300 mt-1 block">{report.confidencePenaltyFactor}x</span>
          <span className="text-[10px] text-slate-500">Multiplier applied to forecasts</span>
        </div>
      </div>

      {/* Simulated PHC Connectors Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-base font-sans">Simulated PHC System Integrations</h3>
          <span className="text-slate-400 text-[11px]">DVDMS, e-Hospital, HRMS, LIMS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrations.map((intg, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="flex items-start justify-between">
                <span className="font-bold text-white font-sans">{intg.connectorName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {intg.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{intg.sourceSystem}</p>
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                <span>{intg.recordsIngested.toLocaleString()} records</span>
                <span>Sync: {intg.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PHC Telemetry Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Facility Telemetry Freshness & Reliability Scorecard</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-bold">
              <tr>
                <th className="py-3 px-4">PHC Facility</th>
                <th className="py-3 px-4">Last Sync</th>
                <th className="py-3 px-4">Completeness</th>
                <th className="py-3 px-4">Consistency</th>
                <th className="py-3 px-4">Reliability Score</th>
                <th className="py-3 px-4">Telemetry Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {phcReliabilityMatrix.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-white font-sans">
                    {item.name} <span className="text-[10px] text-slate-500 font-mono block">{item.district}, {item.state}</span>
                  </td>
                  <td className="py-3 px-4">{item.lastSyncMinutesAgo} mins ago</td>
                  <td className="py-3 px-4">{item.completeness}%</td>
                  <td className="py-3 px-4">{item.consistency}%</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{item.reliabilityScore}%</td>
                  <td className="py-3 px-4">
                    {item.anomalyDetected ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Latency Warning</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Nominal</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
