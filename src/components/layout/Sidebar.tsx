import React from 'react';
import { useApp, ActiveView } from '../../context/AppContext.tsx';
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  Building2,
  CheckSquare,
  Cpu,
  FileText,
  GitBranch,
  Gauge,
  History,
  LayoutDashboard,
  Layers,
  Network,
  PlaySquare,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Workflow,
  X
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activeView, setActiveView, t, notificationsCount, role } = useApp();

  const navSections: {
    heading: string;
    items: {
      id: ActiveView;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      heading: t.navGroups.commandHospitals,
      items: [
        { id: 'overview', label: t.nav.overview, icon: LayoutDashboard },
        {
          id: 'digitalTwin',
          label: t.nav.digitalTwin,
          icon: Cpu,
          badge: 'TWIN',
          badgeColor: 'bg-cyan-500'
        },
        { id: 'phcNetwork', label: t.nav.phcNetwork, icon: Building2 },
        { id: 'resourceIntelligence', label: t.nav.resourceIntelligence, icon: Layers }
      ]
    },
    {
      heading: t.navGroups.predictiveAi,
      items: [
        { id: 'forecasts', label: t.nav.forecasts, icon: TrendingUp },
        { id: 'whatIfSimulator', label: t.nav.whatIfSimulator, icon: SlidersHorizontal },
        { id: 'emergencyCascade', label: t.nav.emergencyCascade, icon: GitBranch }
      ]
    },
    {
      heading: t.navGroups.alertsTransfers,
      items: [
        {
          id: 'alerts',
          label: t.nav.alerts,
          icon: AlertTriangle,
          badge: notificationsCount > 0 ? notificationsCount : undefined,
          badgeColor: 'bg-rose-500'
        },
        {
          id: 'recommendations',
          label: t.nav.recommendations,
          icon: CheckSquare,
          badge: '3',
          badgeColor: 'bg-cyan-600'
        }
      ]
    },
    {
      heading: t.navGroups.federatedAi,
      items: [
        {
          id: 'federatedIntelligence',
          label: t.nav.federatedIntelligence,
          icon: Network,
          badge: '6 Nodes',
          badgeColor: 'bg-blue-600'
        },
        { id: 'aiCopilot', label: t.nav.aiCopilot, icon: Bot },
        { id: 'aiBriefing', label: t.nav.aiBriefing, icon: Sparkles }
      ]
    },
    {
      heading: t.navGroups.governance,
      items: [
        { id: 'dataReliability', label: t.nav.dataReliability, icon: Activity },
        { id: 'modelPerformance', label: t.nav.modelPerformance, icon: Gauge },
        { id: 'auditLog', label: t.nav.auditLog, icon: History },
        { id: 'systemArchitecture', label: t.nav.systemArchitecture, icon: Workflow },
        {
          id: 'demoControlCenter',
          label: t.nav.demoControlCenter,
          icon: PlaySquare,
          badge: 'Demo Hub',
          badgeColor: 'bg-amber-500 text-slate-950 font-bold'
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 flex flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-md transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-xs font-mono uppercase tracking-wider text-slate-200">
              {t.appName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
              LIVE
            </span>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <h5 className="px-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {section.heading}
              </h5>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeView === item.id ||
                    (item.id === 'phcNetwork' && activeView === 'phcDetail');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-cyan-400' : 'text-slate-400'
                          }`}
                        />
                        <span className="font-sans truncate text-left">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-mono shrink-0 text-white ${
                            item.badgeColor || 'bg-slate-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Current Role Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">
                {t.common.officer}
              </span>
              <span className="font-semibold text-slate-200 truncate block text-[11px]">
                {t.roles[role]}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
