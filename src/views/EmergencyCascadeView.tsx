import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchEmergencyCascade, fetchPhcs } from '../services/api.ts';
import { CascadeGraph, PHC, CascadeNode } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator.tsx';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  Info,
  Radio,
  Share2,
  Wind,
  Zap
} from 'lucide-react';

export const EmergencyCascadeView: React.FC = () => {
  const { selectedPhcId, setSelectedPhcId, setActiveView, refreshSignal } = useApp();
  const [cascade, setCascade] = useState<CascadeGraph | null>(null);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [selectedNode, setSelectedNode] = useState<CascadeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchEmergencyCascade(selectedPhcId || undefined), fetchPhcs()])
      .then(([casc, phcList]) => {
        setCascade(casc);
        setPhcs(phcList);
        if (casc.nodes.length > 0) setSelectedNode(casc.nodes[0]);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [selectedPhcId, refreshSignal]);

  const activePhc = phcs.find((p) => p.id === selectedPhcId) || phcs[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Emergency Cascade Intelligence Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates cascading operational pressure: Meteorological Trigger → Enteric Infection Surge → OPD Patient Footfall → Primary Medicine Depletion → Secondary Inpatient Bed Strain → Regional Overflow
          </p>
        </div>

        {/* PHC Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Inspecting Node:</span>
          <select
            value={selectedPhcId || ''}
            onChange={(e) => setSelectedPhcId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
          >
            {phcs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.overallRisk})
              </option>
            ))}
          </select>
        </div>
      </div>

      {cascade && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Cascade Node Network Map */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="font-bold text-white text-base">Active Transmission Sequence</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
                Cascade Level: Tier {cascade.activeCascadeLevel}/6 Activated
              </span>
            </div>

            {/* Cascade Nodes Grid / Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {cascade.nodes.map((node, index) => {
                const isSelected = selectedNode?.id === node.id;
                const isCritical = node.risk === 'CRITICAL';
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-xl'
                        : isCritical
                        ? 'border-rose-500/40 bg-slate-950/80 hover:border-rose-400'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-cyan-400">
                          {index + 1}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          {node.category}
                        </span>
                      </div>
                      <RiskBadge level={node.risk} size="sm" pulse={isCritical} />
                    </div>

                    <h4 className="font-bold text-white text-sm mt-2">{node.label}</h4>

                    <div className="mt-2 text-xs font-mono text-slate-300">
                      <span className="text-slate-400">Current: </span>
                      <span className="font-semibold text-white">{node.currentValue}</span>
                    </div>

                    <div className="mt-1 text-xs font-mono">
                      <span className="text-slate-400">Projected 48h Shift: </span>
                      <span className="font-bold text-rose-300">{node.predictedChange}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scenario Summary */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <span className="font-bold text-cyan-400 uppercase text-[10px] block">Live Cascade Scenario Analysis:</span>
              <p className="leading-relaxed">{cascade.scenarioSummary}</p>
            </div>
          </div>

          {/* Right Selected Node Inspection */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                    CASCADE NODE #{selectedNode.id.toUpperCase()} • {selectedNode.category}
                  </span>
                  <h3 className="text-lg font-bold text-white font-sans mt-1">{selectedNode.label}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <RiskBadge level={selectedNode.risk} size="sm" pulse />
                    <ConfidenceIndicator level={selectedNode.confidence} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Transmission Dynamics</span>
                  <p className="text-slate-200 leading-relaxed font-sans">{selectedNode.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Current Value:</span>
                    <span className="font-bold text-white">{selectedNode.currentValue}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Predicted Change:</span>
                    <span className="font-bold text-rose-300">{selectedNode.predictedChange}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                  <span className="text-cyan-300 text-[10px] font-bold uppercase block">Mitigation Step:</span>
                  <p className="text-slate-200">Pre-emptively route stock replenishment or surge beds before next cascade threshold is breached.</p>
                </div>

                <button
                  onClick={() => setActiveView('recommendations')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all font-mono"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Execute Inter-PHC Rebalance</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                Select any cascade node on the left to inspect propagation risk.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
