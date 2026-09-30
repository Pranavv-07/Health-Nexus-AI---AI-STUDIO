import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types.ts';
import { Language } from '../../locales/translations.ts';
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  Building,
  CheckCircle2,
  ChevronDown,
  Globe,
  Radio,
  RefreshCw,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  X,
  Zap
} from 'lucide-react';

interface RolePersona {
  id: UserRole;
  label: string;
  name: string;
  jurisdiction: string;
  badge: string;
  primaryScreen: string;
  targetView: string;
  clearance: string;
  description: string;
}

export const Header: React.FC = () => {
  const {
    role,
    switchLoginRole,
    language,
    setLanguage,
    t,
    isAiConnected,
    activeScenario,
    demoStep,
    notificationsCount,
    triggerRefresh,
    setActiveView
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const personas: RolePersona[] = [
    {
      id: 'PHC_STAFF',
      label: t.roles.PHC_STAFF,
      name: 'Dr. N. Prabhavathi',
      jurisdiction: 'GGH Guntur Facility',
      badge: 'PHC-MED-9402',
      primaryScreen: 'Facility Telemetry & Local Inventory',
      targetView: 'phcDetail',
      clearance: 'Local Clinic Level',
      description: 'Manages local patient footfall, critical drug stock alerts, and emergency supplies request.'
    },
    {
      id: 'DISTRICT_AUTHORITY',
      label: t.roles.DISTRICT_AUTHORITY,
      name: 'Dr. K. V. Sharma',
      jurisdiction: 'Guntur & Krishna Health Circle',
      badge: 'DHO-AP-4819',
      primaryScreen: 'Command Center & Mutual-Aid Approvals',
      targetView: 'overview',
      clearance: 'District Cluster Clearance',
      description: 'Authorized to digitally approve inter-hospital transfers, manage district surplus corridors.'
    },
    {
      id: 'STATE_AUTHORITY',
      label: t.roles.STATE_AUTHORITY,
      name: 'Dr. R. Sundaram, IAS',
      jurisdiction: 'State Health Mission Directorate',
      badge: 'SHC-STE-1002',
      primaryScreen: 'Healthcare Digital Twin & Network Flows',
      targetView: 'digitalTwin',
      clearance: 'State-wide Strategic Clearance',
      description: 'Operates Healthcare Digital Twin, monitors timeline horizons (T-7 to T+14), declares emergency status.'
    },
    {
      id: 'NATIONAL_AUTHORITY',
      label: t.roles.NATIONAL_AUTHORITY,
      name: 'Prof. V. Ramanathan',
      jurisdiction: 'National Health Mission (MoHFW)',
      badge: 'NHM-NAT-0081',
      primaryScreen: 'Federated Intelligence & National Policy',
      targetView: 'federatedIntelligence',
      clearance: 'National Cabinet Level',
      description: 'Supervises privacy-preserving federated AI model training and inter-state strategic medicine reserves.'
    },
    {
      id: 'ADMIN',
      label: t.roles.ADMIN,
      name: 'SecOps & Audit Controller',
      jurisdiction: 'Core System Infrastructure',
      badge: 'SYS-SEC-0001',
      primaryScreen: 'Judge Demo Hub & Cryptographic Audit Trail',
      targetView: 'demoControlCenter',
      clearance: 'Root Administrator',
      description: 'Executes chaos scenario triggers, verifies SHA-256 cryptographic audit logs, controls live demo state.'
    }
  ];

  const currentPersona = personas.find((p) => p.id === role) || personas[1];

  const handleSelectPersona = (p: RolePersona) => {
    switchLoginRole(p.id);
    setShowPersonaModal(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-xl">
      {/* Top Synthetic Data Banner */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 text-cyan-300 border-b border-cyan-500/20 px-4 py-1 text-center text-[11px] font-mono tracking-wider flex items-center justify-center gap-2">
        <Radio className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
        <span className="font-bold truncate">{t.syntheticBanner}</span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="text-slate-400 hidden sm:inline">
          {t.scenarioActive}: <strong className="text-slate-200">{activeScenario}</strong>
        </span>
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  HEALTH-NEXUS <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  FEDERATED
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wide hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Guided Demo Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Demo:</span>
          </span>
          <button
            onClick={() => setActiveView('demoControlCenter')}
            className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline"
          >
            {demoStep > 0 ? `Step ${demoStep}/7 Active` : t.nav.demoControlCenter}
          </button>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Connectivity Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono">
            {isAiConnected ? (
              <>
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 text-[11px]">Gemini 3.8 Flash</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 text-[11px]">Demo Mode</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </>
            )}
          </div>

          {/* Multilingual Selector (English, Hindi, Telugu) */}
          <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-mono shadow-sm">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-slate-100 font-medium outline-none cursor-pointer text-xs pr-1"
              aria-label="Language Selector"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Role Switcher & Persona Switcher Trigger */}
          <div className="flex items-center bg-slate-900 border border-cyan-500/40 rounded-lg p-0.5 text-xs font-mono shadow-sm">
            <button
              onClick={() => setShowPersonaModal(true)}
              title="Click to Switch Login Role & Tailored Screen"
              className="flex items-center gap-1.5 px-2 py-1 text-cyan-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold hidden sm:inline max-w-[130px] truncate">
                {currentPersona.label}
              </span>
              <span className="sm:hidden font-semibold">
                {currentPersona.id.replace('_AUTHORITY', '').replace('_STAFF', '')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            title={t.common.refresh}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title={t.kpi.activeAlerts}
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono animate-pulse">
                  {notificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold font-mono text-white">
                    {t.kpi.activeAlerts}
                  </span>
                  <button
                    onClick={() => {
                      setActiveView('alerts');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    {t.common.viewDetails}
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto text-xs">
                  <div className="p-2 rounded bg-rose-950/50 border border-rose-500/30 text-rose-200">
                    <strong className="block text-[11px]">GGH Guntur: ORS Shortage in 48h</strong>
                    <span className="text-[10px] text-rose-300">Surplus match ready from New GGH Vijayawada (34 km).</span>
                  </div>
                  <div className="p-2 rounded bg-rose-950/50 border border-rose-500/30 text-rose-200">
                    <strong className="block text-[11px]">DHH Puri: Bed Occupancy 95%</strong>
                    <span className="text-[10px] text-rose-300">Coastal cholera surge alert - 8 emergency cots requested.</span>
                  </div>
                  <div className="p-2 rounded bg-amber-950/50 border border-amber-500/30 text-amber-200">
                    <strong className="block text-[11px]">Civil Hospital Alibag: Diagnostic Kits</strong>
                    <span className="text-[10px] text-amber-300">Leptospirosis test stock below 48-hour buffer.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MULTI-LOGIN ROLE PERSONA SWITCHER MODAL */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/50 bg-slate-900 p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Multi-Login Persona & Role Screen Switcher
                  </h3>
                  <p className="text-xs text-slate-400">
                    Switch between distinct administrative tiers to experience role-tailored dashboards and screen clearances
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPersonaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Persona Cards Grid */}
            <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {personas.map((p) => {
                const isActive = p.id === role;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPersona(p)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm font-sans">{p.label}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {p.badge}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                              Current Login
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cyan-300 font-mono mt-0.5">
                          {p.name} • {p.jurisdiction}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block">Clearance</span>
                        <span className="text-xs font-mono font-semibold text-slate-200">{p.clearance}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                      {p.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">
                        Primary Screen: <strong className="text-cyan-400">{p.primaryScreen}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400 hover:underline font-semibold">
                        <span>Switch to this Screen</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
