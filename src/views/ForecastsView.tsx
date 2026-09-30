import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchPhcs, fetchResources, fetchForecast } from '../services/api.ts';
import { PHC, ResourceItem, ResourceForecast } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator.tsx';
import {
  BrainCircuit,
  Calendar,
  ChevronRight,
  Droplets,
  Layers,
  LineChart as LineChartIcon,
  Sliders,
  TrendingUp,
  Wind
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export const ForecastsView: React.FC = () => {
  const { refreshSignal, setSelectedPhcId, setActiveView, t } = useApp();
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedPhcIdState, setSelectedPhcIdState] = useState<string>('phc-ap-01');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('res-phc-ap-01-ors');
  const [forecast, setForecast] = useState<ResourceForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPhcs(), fetchResources()])
      .then(([phcList, resList]) => {
        setPhcs(phcList);
        setResources(resList);
        if (phcList.length > 0) {
          const phc = phcList.find((p) => p.overallRisk === 'CRITICAL') || phcList[0];
          setSelectedPhcIdState(phc.id);
          const phcRes = resList.filter((r) => r.phcId === phc.id);
          if (phcRes.length > 0) {
            setSelectedResourceId(phcRes[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshSignal]);

  useEffect(() => {
    if (selectedPhcIdState && selectedResourceId) {
      fetchForecast(selectedPhcIdState, selectedResourceId)
        .then((f) => setForecast(f))
        .catch((e) => console.error(e));
    }
  }, [selectedPhcIdState, selectedResourceId, refreshSignal]);

  const activePhc = phcs.find((p) => p.id === selectedPhcIdState);
  const phcResources = resources.filter((r) => r.phcId === selectedPhcIdState);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Adaptive Ensemble Forecasting Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic combination of Tree-Based Multi-Feature Regression + Seasonal Holt-Winters + Environmental Context models
          </p>
        </div>

        {/* PHC and Resource Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <select
            value={selectedPhcIdState}
            onChange={(e) => {
              const newPhcId = e.target.value;
              setSelectedPhcIdState(newPhcId);
              const matching = resources.filter((r) => r.phcId === newPhcId);
              if (matching.length > 0) setSelectedResourceId(matching[0].id);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
          >
            {phcs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.district}) [{p.overallRisk}]
              </option>
            ))}
          </select>

          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
          >
            {phcResources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {forecast && (
        <div className="space-y-6">
          {/* Top Forecast Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">Current Stock</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {forecast.currentStock} <span className="text-xs text-slate-400 font-normal">{forecast.unit}</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Safety Buffer: {forecast.safetyLevel}</span>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 to-slate-900/90 p-4 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">7-Day Predicted Demand</span>
              <span className="text-2xl font-bold text-rose-300 mt-1 block">
                {forecast.predictedDemandTotal} <span className="text-xs text-slate-400 font-normal">{forecast.unit}</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Range: {forecast.predictedRange[0]} – {forecast.predictedRange[1]}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">Shortage Probability</span>
              <span className="text-2xl font-bold text-rose-400 mt-1 block">
                {forecast.shortageProbability}%
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Risk Level:</span>
                <RiskBadge level={forecast.riskLevel} size="sm" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">Time to Stock-Out</span>
              <span className="text-2xl font-bold text-amber-300 mt-1 block">
                ~{forecast.daysUntilShortage} Days
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Confidence:</span>
                <ConfidenceIndicator level={forecast.confidenceLevel} />
              </div>
            </div>
          </div>

          {/* Forecast Chart Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">
                  14-Day Demand & Projected Stock Depletion Curve
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  7-Day Historical Telemetry Actuals + 7-Day Ensemble Forecast with Dynamic Uncertainty Envelope
                </p>
              </div>

              {/* Ensemble Weights Breakdown Tag */}
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="text-slate-500">Weights:</span>
                <span className="text-purple-400">Tree: {forecast.ensembleWeights.treeBased}%</span>
                <span>•</span>
                <span className="text-sky-400">Time-Series: {forecast.ensembleWeights.timeSeries}%</span>
                <span>•</span>
                <span className="text-emerald-400">Context: {forecast.ensembleWeights.contextual}%</span>
              </div>
            </div>

            {/* Recharts Forecast Graph */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.points} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="rangeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <ReferenceLine y={forecast.safetyLevel} label="Safety Threshold" stroke="#eab308" strokeDasharray="4 4" />
                  
                  {/* Uncertainty Envelope */}
                  <Area type="monotone" dataKey="predictedRangeHigh" name="Range (Upper 95% CI)" stroke="none" fill="url(#rangeFill)" />
                  <Area type="monotone" dataKey="predictedRangeLow" name="Range (Lower 95% CI)" stroke="none" fill="transparent" />

                  {/* Primary Forecast Curve */}
                  <Line type="monotone" dataKey="predictedDemand" name="Ensemble Demand Forecast" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                  
                  {/* Projected Stock Remaining */}
                  <Line type="monotone" dataKey="projectedStockRemaining" name="Projected Stock Inventory" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} />

                  {/* Component Models */}
                  <Line type="monotone" dataKey="treeModelForecast" name="Tree-Based Model" stroke="#c084fc" strokeWidth={1} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="timeSeriesModelForecast" name="Time-Series SARIMA" stroke="#38bdf8" strokeWidth={1} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="contextualModelForecast" name="Contextual Weather/Disease" stroke="#34d399" strokeWidth={1} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
