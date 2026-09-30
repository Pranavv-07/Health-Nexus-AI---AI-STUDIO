import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchModelPerformance } from '../services/api.ts';
import { ModelMetric } from '../types.ts';
import {
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Gauge,
  Layers,
  LineChart,
  Percent,
  Sliders,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export const ModelPerformanceView: React.FC = () => {
  const { refreshSignal } = useApp();
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [architecture, setArchitecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelPerformance()
      .then((data) => {
        setMetrics(data.metrics);
        setArchitecture(data.ensembleArchitecture);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [refreshSignal]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Adaptive Ensemble Model Performance & Evaluation Metrics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), R² Goodness-of-Fit, and Dynamic Weight Breakdown
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
            Average R² Fit: 0.935
          </span>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3 font-mono text-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">
                  {m.resourceCategory} FORECASTER
                </span>
                <h4 className="font-bold text-white text-sm mt-0.5 font-sans leading-snug">{m.modelName}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Weight: {Math.round(m.currentWeight * 100)}%
              </span>
            </div>

            <p className="text-[11px] text-slate-400">{m.modelType}</p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">MAE</span>
                <span className="font-bold text-white text-sm">{m.mae}</span>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">RMSE</span>
                <span className="font-bold text-cyan-300 text-sm">{m.rmse}</span>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">R² Score</span>
                <span className="font-bold text-emerald-400 text-sm">{m.r2Score}</span>
              </div>
            </div>

            <span className="block text-[10px] text-slate-500 pt-1">
              Sample Volume: {m.sampleCount.toLocaleString()} time-series records
            </span>
          </div>
        ))}
      </div>

      {/* Model Performance Comparison Bar Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Model Goodness of Fit & Accuracy Metric Comparison</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="modelName" stroke="#64748b" fontSize={10} fontFamily="monospace" interval={0} angle={-10} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Bar dataKey="mae" name="MAE (Lower is Better)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rmse" name="RMSE (Lower is Better)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
