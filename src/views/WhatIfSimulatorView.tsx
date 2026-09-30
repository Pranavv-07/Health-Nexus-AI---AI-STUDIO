import React, { useState } from 'react';
import { runWhatIfScenario } from '../services/api.ts';
import { WhatIfScenarioInput, WhatIfSimulationResult } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  Clock,
  Droplets,
  HelpCircle,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Wind
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

export const WhatIfSimulatorView: React.FC = () => {
  const [input, setInput] = useState<WhatIfScenarioInput>({
    footfallPercentChange: 30,
    supplyDelayDays: 2,
    rainfallCondition: 'High',
    staffAvailabilityCondition: 'Reduced'
  });

  const [result, setResult] = useState<WhatIfSimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      const res = await runWhatIfScenario(input);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setInput({
      footfallPercentChange: 0,
      supplyDelayDays: 0,
      rainfallCondition: 'Normal',
      staffAvailabilityCondition: 'Normal'
    });
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive What-If Scenario Stress-Testing Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate adverse public health events, extreme precipitation, logistics delays, and workforce deficits before they occur
          </p>
        </div>

        {/* Disclaimer as required by prompt section 23 */}
        <span className="text-[10px] font-mono text-amber-300 px-3 py-1 rounded bg-amber-950/80 border border-amber-500/30 uppercase font-bold">
          SIMULATED SCENARIO — NOT A MEDICAL PREDICTION
        </span>
      </div>

      {/* Simulator Control Panel & Parameter Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Configure Stress Parameters</h3>
            <button
              onClick={handleReset}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Footfall % Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Patient Footfall Surge:</span>
              </span>
              <span className="font-bold text-cyan-400 text-sm">
                {input.footfallPercentChange > 0 ? `+${input.footfallPercentChange}%` : `${input.footfallPercentChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="60"
              step="5"
              value={input.footfallPercentChange}
              onChange={(e) => setInput({ ...input, footfallPercentChange: parseInt(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-20% (Dip)</span>
              <span>Baseline (0%)</span>
              <span>+30% (Severe)</span>
              <span>+60% (Outbreak)</span>
            </div>
          </div>

          {/* 2. Supply Delay Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Supply Logistics Delay:</span>
              </span>
              <span className="font-bold text-amber-300 text-sm">+{input.supplyDelayDays} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="7"
              step="1"
              value={input.supplyDelayDays}
              onChange={(e) => setInput({ ...input, supplyDelayDays: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 Days (On-time)</span>
              <span>2 Days</span>
              <span>5 Days (Flood Block)</span>
              <span>7 Days (Disaster)</span>
            </div>
          </div>

          {/* 3. Rainfall Condition */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>Meteorological Rainfall Intensity:</span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {(['Normal', 'High', 'Extreme'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setInput({ ...input, rainfallCondition: r })}
                  className={`py-2 rounded-lg border font-semibold transition-colors ${
                    input.rainfallCondition === r
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Staff Availability */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Clinical Staffing Level:</span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {(['Normal', 'Reduced', 'Critical'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setInput({ ...input, staffAvailabilityCondition: s })}
                  className={`py-2 rounded-lg border font-semibold transition-colors ${
                    input.staffAvailabilityCondition === s
                      ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-sm shadow-xl shadow-cyan-950/50 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{running ? 'Running Monte Carlo Stress-Test...' : 'Simulate Projected System Impact'}</span>
          </button>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Projected Systemic Impact</h3>
                </div>
                <span className="text-xs font-mono text-rose-400 font-bold bg-rose-950/80 px-2.5 py-1 rounded border border-rose-500/30">
                  {result.criticalPhcsCount} PHCs Breaching Thresholds
                </span>
              </div>

              {/* Top Impact Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Medicine Deficit</span>
                  <span className="text-lg font-bold text-rose-400 mt-1 block">
                    {result.projectedMedicineDeficitUnits.toLocaleString()} units
                  </span>
                  <span className="text-[10px] text-slate-500">ORS & Antibiotics</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Bed Overflow</span>
                  <span className="text-lg font-bold text-amber-300 mt-1 block">
                    +{result.projectedBedDeficitCount} cots needed
                  </span>
                  <span className="text-[10px] text-slate-500">Triage overflow</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Clinical Deficit</span>
                  <span className="text-lg font-bold text-purple-300 mt-1 block">
                    {result.projectedStaffHoursShortage} hours
                  </span>
                  <span className="text-[10px] text-slate-500">Workforce strain</span>
                </div>
              </div>

              {/* Baseline vs Simulated Comparison Chart */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.baselineVsSimulated} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="metric" stroke="#64748b" fontSize={10} fontFamily="monospace" interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                    <Bar dataKey="baseline" name="Current Baseline" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="simulated" name="Simulated Scenario Load" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gemini / AI Scenario Analysis */}
              <div className="rounded-xl border border-cyan-500/20 bg-slate-950/90 p-4 font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[11px] pb-1 border-b border-slate-800">
                  <Bot className="w-4 h-4" />
                  <span>Gemini What-If Scenario Causal Analysis & Mitigations:</span>
                </div>
                <div className="text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                  {result.aiExplanation}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col items-center justify-center text-center">
              <SlidersHorizontal className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="font-bold text-white text-base">Simulator Ready</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Adjust stress-testing parameters on the left and click "Simulate Projected System Impact" to preview resource deficits.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
