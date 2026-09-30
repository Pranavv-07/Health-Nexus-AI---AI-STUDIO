import React from 'react';
import { useApp, ActiveView } from '../../context/AppContext.tsx';
import {
  Activity,
  AlertTriangle,
  Bot,
  Building2,
  CheckSquare,
  ChevronRight,
  GitBranch,
  Gauge,
  History,
  LayoutDashboard,
  Layers,
  Network,
  PlaySquare,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Workflow
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeView, setActiveView, t, notificationsCount } = useApp();

  // Define tab navigation clusters
  const clusters: {
    groupName: string;
    views: {
      id: ActiveView;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
    }[];
  }[] = [
    {
      groupName: t.navGroups.commandHospitals,
      views: [
        { id: 'overview', label: t.nav.overview, icon: LayoutDashboard },
        { id: 'phcNetwork', label: t.nav.phcNetwork, icon: Building2 },
        { id: 'resourceIntelligence', label: t.nav.resourceIntelligence, icon: Layers }
      ]
    },
    {
      groupName: t.navGroups.predictiveAi,
      views: [
        { id: 'forecasts', label: t.nav.forecasts, icon: TrendingUp },
        { id: 'whatIfSimulator', label: t.nav.whatIfSimulator, icon: SlidersHorizontal },
        { id: 'emergencyCascade', label: t.nav.emergencyCascade, icon: GitBranch }
      ]
    },
    {
      groupName: t.navGroups.alertsTransfers,
      views: [
        {
          id: 'alerts',
          label: t.nav.alerts,
          icon: AlertTriangle,
          badge: notificationsCount > 0 ? notificationsCount : undefined
        },
        { id: 'recommendations', label: t.nav.recommendations, icon: CheckSquare, badge: '3' }
      ]
    },
    {
      groupName: t.navGroups.federatedAi,
      views: [
        { id: 'federatedIntelligence', label: t.nav.federatedIntelligence, icon: Network },
        { id: 'aiCopilot', label: t.nav.aiCopilot, icon: Bot },
        { id: 'aiBriefing', label: t.nav.aiBriefing, icon: Sparkles }
      ]
    },
    {
      groupName: t.navGroups.governance,
      views: [
        { id: 'dataReliability', label: t.nav.dataReliability, icon: Activity },
        { id: 'modelPerformance', label: t.nav.modelPerformance, icon: Gauge },
        { id: 'auditLog', label: t.nav.auditLog, icon: History },
        { id: 'systemArchitecture', label: t.nav.systemArchitecture, icon: Workflow },
        { id: 'demoControlCenter', label: t.nav.demoControlCenter, icon: PlaySquare }
      ]
    }
  ];

  // Find the active cluster
  const currentCluster =
    clusters.find((c) =>
      c.views.some(
        (v) => v.id === activeView || (v.id === 'phcNetwork' && activeView === 'phcDetail')
      )
    ) || clusters[0];

  return (
    <div className="mb-5 pb-3 border-b border-slate-800/80">
      {/* Top category breadcrumb & quick switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Cluster Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {clusters.map((cluster, idx) => {
            const isClusterActive = cluster.groupName === currentCluster.groupName;
            return (
              <button
                key={idx}
                onClick={() => setActiveView(cluster.views[0].id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isClusterActive
                    ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cluster.groupName}
              </button>
            );
          })}
        </div>

        {/* Current View Breadcrumb Tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 shrink-0">
          <span className="text-slate-500">{currentCluster.groupName}</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-cyan-400 font-bold">
            {activeView === 'phcDetail' ? t.nav.phcDetail : t.nav[activeView]}
          </span>
        </div>
      </div>

      {/* Sub-Tabs within the active cluster */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {currentCluster.views.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeView === tab.id || (tab.id === 'phcNetwork' && activeView === 'phcDetail');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40 font-semibold'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
