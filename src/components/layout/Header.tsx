import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types.ts';
import { Language } from '../../locales/translations.ts';
import {
  Activity,
  Bell,
  Bot,
  ChevronDown,
  Globe,
  Radio,
  RefreshCw,
  Shield,
  Sparkles,
  Zap
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const rolesList: { id: UserRole; label: string }[] = [
    { id: 'DISTRICT_AUTHORITY', label: t.roles.DISTRICT_AUTHORITY },
    { id: 'PHC_STAFF', label: t.roles.PHC_STAFF },
    { id: 'STATE_AUTHORITY', label: t.roles.STATE_AUTHORITY },
    { id: 'NATIONAL_AUTHORITY', label: t.roles.NATIONAL_AUTHORITY },
    { id: 'ADMIN', label: t.roles.ADMIN }
  ];

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

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-900 border border-cyan-500/40 rounded-lg px-2 py-1 text-xs font-mono text-cyan-300 shadow-sm max-w-[160px] sm:max-w-none">
            <Shield className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-cyan-300 font-semibold outline-none cursor-pointer text-xs truncate"
              aria-label="Officer Role Selector"
            >
              {rolesList.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                  {r.label}
                </option>
              ))}
            </select>
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
    </header>
  );
};
