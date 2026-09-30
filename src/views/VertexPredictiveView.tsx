import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchVertexAiModels, triggerVertexRetraining } from '../services/api.ts';
import { VertexAiModelInfo } from '../types.ts';
import {
  Cpu,
  Layers,
  Activity,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  Database,
  SlidersHorizontal,
  TrendingUp,
  Workflow,
  ShieldCheck,
  Server
} from 'lucide-react';

export const VertexPredictiveView: React.FC = () => {
  const { showDemoToast, triggerRefresh } = useApp();
  const [models, setModels] = useState<VertexAiModelInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<VertexAiModelInfo | null>(null);
  const [retrainingModelId, setRetrainingModelId] = useState<string | null>(null);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    'Vertex AI Pipeline Orchestrator online (asia-south1)',
    'BigQuery ML feature view synced: `health_nexus.features.phc_daily_telemetry_v2`',
    'Model monitoring drift detectors active (Kolmogorov-Smirnov alpha=0.05)',
    'Endpoint `ep-timesfm-opd-v4` serving at 14ms average latency'
  ]);

  useEffect(() => {
    fetchVertexAiModels()
      .then((res) => {
        setModels(res);
        if (res.length > 0) setSelectedModel(res[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching vertex AI models:', err);
        setLoading(false);
      });
  }, []);

  const handleLaunchRetraining = async (model: VertexAiModelInfo) => {
    setRetrainingModelId(model.id);
    const newLog = `[${new Date().toLocaleTimeString()}] Pipeline started for ${model.name} on Vertex AI Pipelines...`;
    setPipelineLogs((prev) => [newLog, ...prev]);
    showDemoToast(`Triggered Vertex AI automated training pipeline for ${model.name}`);

    try {
      const resp = await triggerVertexRetraining(model.id);
      setTimeout(() => {
        setPipelineLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] TPU v4 worker pool allocated (asia-south1-a)`,
          `[${new Date().toLocaleTimeString()}] 18.4M records ingested from BigQuery feature store`,
          `[${new Date().toLocaleTimeString()}] AutoML hyperparameter tuning converged (WAPE improved by 0.3%)`,
          `[${new Date().toLocaleTimeString()}] Canary deployed to ${resp.targetEndpoint} with zero downtime`,
          ...prev
        ]);
        setRetrainingModelId(null);
        showDemoToast(`Pipeline finished: ${model.name} canary deployment active!`);
        triggerRefresh();
      }, 3500);
    } catch (err) {
      console.error(err);
      setRetrainingModelId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading Vertex AI Model Registry & Pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-indigo-400" />
                Google Cloud Vertex AI
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                AutoML • Custom Training • Model Serving
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Vertex AI Predictive Modeling Hub
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
              Unified enterprise ML ecosystem powering Health-Nexus AI under the <i>Code for Communities 2.0</i> mandate. Deploys foundational time-series transformers (TimesFM), probabilistic inventory forecasting (DeepAR), and vision segmentation endpoints with automated concept drift detection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Serving Endpoints</div>
              <div className="text-lg font-bold text-indigo-400 flex items-center justify-end gap-1.5">
                <Server className="w-4 h-4 text-indigo-400" />
                <span>4 / 4 Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => setSelectedModel(model)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedModel?.id === model.id
                ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  {model.category}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  model.status === 'SERVING'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                    : 'bg-amber-950 text-amber-300 border-amber-800/60'
                }`}>
                  {model.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white line-clamp-2 mt-1">{model.name}</h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {model.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Latency:</span>
                <span className="text-cyan-400 font-bold">{model.latencyMs} ms</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Metric:</span>
                <span className="text-emerald-400 font-bold">{model.accuracyMetricValue}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Drift Status:</span>
                <span className="text-slate-300">{model.driftStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Model Deep Dive & Vertex Pipeline Control */}
      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Details (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                  Vertex Model Specification
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedModel.name}</h2>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  Revision: <span className="text-slate-200">{selectedModel.deployedRevision}</span> • Dataset: {selectedModel.datasetSize}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchRetraining(selectedModel)}
                disabled={retrainingModelId === selectedModel.id}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-950 disabled:opacity-50 shrink-0"
              >
                {retrainingModelId === selectedModel.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-white fill-current" />
                    <span>Launch Retraining Pipeline</span>
                  </>
                )}
              </button>
            </div>

            {/* Model Architecture Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Training Framework</div>
                <div className="text-xs font-semibold text-white mt-1">{selectedModel.trainingFramework}</div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Evaluation Metric</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  {selectedModel.accuracyMetricName}: <span className="font-mono">{selectedModel.accuracyMetricValue}</span>
                </div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Serving Endpoint URI</div>
                <div className="text-[11px] font-mono text-cyan-400 mt-1 truncate">{selectedModel.endpointId}</div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Concept Drift Monitoring</div>
                <div className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{selectedModel.driftStatus} (Evaluated {selectedModel.lastEvaluated})</span>
                </div>
              </div>
            </div>

            {/* Features Used From Feature Store */}
            <div>
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Vertex AI Feature Store Variables</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedModel.featuresUsed.map((feat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pipeline Execution Console (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between font-mono">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Vertex AI Pipeline Execution Log
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
                {pipelineLogs.map((log, index) => (
                  <div key={index} className="text-slate-300 leading-relaxed font-mono flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">$</span>
                    <span className={index === 0 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Cloud Region: asia-south1 (Mumbai)</span>
              <span>KubeFlow / Vertex v2.8</span>
            </div>
          </div>
        </div>
      )}

      {/* Dataset & Demographic Accuracy Assurance Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Real-World Ground-Truth Datasets & Regulatory Alignment</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated against Ministry of Health & Family Welfare (MoHFW) HMIS benchmarks, DVDMS drug inventory standards, CPCB CAAQMS air sensors, and ICAR agricultural disease taxonomies.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3">State / Jurisdiction</th>
                <th className="py-2.5 px-3">Facilities Modeled</th>
                <th className="py-2.5 px-3">Public Data Sources</th>
                <th className="py-2.5 px-3">Grounding Features</th>
                <th className="py-2.5 px-3 text-right">Data Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-bold text-white">Andhra Pradesh</td>
                <td className="py-2.5 px-3">3 PHCs (Guntur, Vijayawada, Mangalagiri)</td>
                <td className="py-2.5 px-3 text-cyan-300">AP-DVDMS, Rythu Bharosa, IMD Cyclone Warning</td>
                <td className="py-2.5 px-3">Dengue/Malaria OPD surges, coastal storm surge logistics</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">Live (5 min sync)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-bold text-white">Odisha</td>
                <td className="py-2.5 px-3">3 PHCs (Puri, Jagatsinghpur, Balasore)</td>
                <td className="py-2.5 px-3 text-cyan-300">OSDMA Disaster Registry, Niramaya Drug Portal</td>
                <td className="py-2.5 px-3">Monsoon flood risk propagation, antivenom buffer levels</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">Live (5 min sync)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-bold text-white">Tamil Nadu</td>
                <td className="py-2.5 px-3">3 PHCs (Salem, Attur, Yercaud)</td>
                <td className="py-2.5 px-3 text-cyan-300">TNMSC Warehouse Feed, CPCB Air Quality Network</td>
                <td className="py-2.5 px-3">Hilly terrain cold-chain transit, industrial AQI spikes</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">Live (5 min sync)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-bold text-white">Telangana</td>
                <td className="py-2.5 px-3">3 PHCs (Warangal, Hanamkonda, Kazipet)</td>
                <td className="py-2.5 px-3 text-cyan-300">TG-MSIDC, Kakatiya Urban Development GIS</td>
                <td className="py-2.5 px-3">Urban OPD surge, seasonal viral respiratory clusters</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">Live (5 min sync)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-bold text-white">Maharashtra</td>
                <td className="py-2.5 px-3">3 PHCs (Thane, Kalyan, Dombivli)</td>
                <td className="py-2.5 px-3 text-cyan-300">MPCB Industrial Telemetry, BMC Health MIS</td>
                <td className="py-2.5 px-3">High-density industrial air pollution, pediatric triage</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">Live (5 min sync)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
