import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { generateBriefing } from '../services/api.ts';
import {
  AlertOctagon,
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Printer,
  Radio,
  Share2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

export const AiBriefingView: React.FC = () => {
  const { role, isAiConnected } = useApp();
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('All Monitored Health Centers');

  const handleGenerateBriefing = async () => {
    setLoading(true);
    try {
      const res = await generateBriefing(role, selectedJurisdiction);
      setBriefing(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Executive Healthcare Intelligence Briefing
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-gated executive briefing summarizing critical facilities, emerging epidemic hazards, pending transfers, and data caveats
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateBriefing}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-xl shadow-cyan-950/60 transition-all cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing Executive Briefing...' : "Generate Today's Briefing"}</span>
        </button>
      </div>

      {briefing ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6 font-sans">
          {/* Briefing Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                GOVTECH HEALTH INTELLIGENCE DOSSIER
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {briefing.title}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Target Authority: <strong>{briefing.roleContext}</strong> • Generated: {new Date(briefing.generatedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>

          {/* Executive Overview Paragraph */}
          <div className="p-4.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            <p className="font-semibold text-white mb-1">Executive Summary:</p>
            {briefing.summaryParagraph}
          </div>

          {/* Critical Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              <span>1. Critical Bottlenecks & Active Alerts:</span>
            </h4>
            <div className="space-y-2">
              {briefing.criticalHighlights.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5 font-mono"
                >
                  <span className="font-bold text-rose-400">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emerging Risks */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>2. Emerging Epidemiological & Logistics Vectors:</span>
            </h4>
            <div className="space-y-2">
              {briefing.emergingRisks.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5 font-mono"
                >
                  <span className="font-bold text-amber-400">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Decisions Awaiting Human Signature */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>3. Actionable Decisions Requiring Immediate Authorization:</span>
            </h4>
            <div className="space-y-2">
              {briefing.recommendedDecisions.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5 font-mono"
                >
                  <span className="font-bold text-cyan-400">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Caveats */}
          {briefing.dataQualityCaveats && briefing.dataQualityCaveats.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-400 block uppercase">Telemetry Freshness & Data Quality Caveats:</span>
              {briefing.dataQualityCaveats.map((c: string, idx: number) => (
                <p key={idx} className="text-slate-400">⚠ {c}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <FileText className="w-12 h-12 text-cyan-400/60" />
          <h3 className="text-lg font-bold text-white">No Briefing Generated Yet Today</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Click the "Generate Today's Briefing" button above to synthesize an automated executive intelligence summary customized for your role ({role}).
          </p>
        </div>
      )}
    </div>
  );
};
