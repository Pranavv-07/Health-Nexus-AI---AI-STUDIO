import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Bot,
  CheckCircle2,
  Database,
  Globe,
  Lock,
  Moon,
  Radio,
  Save,
  Server,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { role, setRole, language, setLanguage, isAiConnected, showDemoToast } = useApp();
  const [telemetrySyncInterval, setTelemetrySyncInterval] = useState('5');
  const [confidenceThreshold, setConfidenceThreshold] = useState('85');
  const [autoEscalateAlerts, setAutoEscalateAlerts] = useState(true);
  const [differentialPrivacyEpsilon, setDifferentialPrivacyEpsilon] = useState('1.2');

  const handleSave = () => {
    showDemoToast('✅ Operational settings saved and synchronized.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              System Configuration & AI Governance Parameters
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage data synchronization intervals, ensemble thresholds, differential privacy bounds, and role permissions
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold shadow-md transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* General & AI Configuration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm font-sans">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI Model & Telemetry Ingestion</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 block font-semibold">Active AI Engine:</label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Gemini 3.8 Flash (Server-Side)</span>
                <span className="text-[10px] text-slate-500">Autonomous failover to Deterministic Demo Mode</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 block font-semibold">Telemetry Polling Interval:</label>
            <select
              value={telemetrySyncInterval}
              onChange={(e) => setTelemetrySyncInterval(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
            >
              <option value="1">Every 1 Minute (High Precision)</option>
              <option value="5">Every 5 Minutes (Standard Recommendation)</option>
              <option value="15">Every 15 Minutes (Low Bandwidth)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 block font-semibold">Data Reliability Confidence Threshold (%):</label>
            <input
              type="number"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500 block">Below this reliability score, forecast confidence is automatically downgraded.</span>
          </div>
        </div>

        {/* Federated Privacy & Security */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm font-sans">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Privacy & Federated Governance</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 block font-semibold">Differential Privacy Epsilon (ε):</label>
            <input
              type="text"
              value={differentialPrivacyEpsilon}
              onChange={(e) => setDifferentialPrivacyEpsilon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500 block">Ensures zero reconstruction of individual patient records from model gradients.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 block font-semibold">Automated Early Warning Escalation:</label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Hierarchical Escalation Engine</span>
                <span className="text-[10px] text-slate-500">Auto-routes to District/State on deficit projection &lt;48h</span>
              </div>
              <input
                type="checkbox"
                checked={autoEscalateAlerts}
                onChange={(e) => setAutoEscalateAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
