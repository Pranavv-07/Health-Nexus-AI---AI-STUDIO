import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { OverviewDashboard } from './views/OverviewDashboard.tsx';
import { PhcNetworkView } from './views/PhcNetworkView.tsx';
import { PhcDetailView } from './views/PhcDetailView.tsx';
import { ResourceIntelligenceView } from './views/ResourceIntelligenceView.tsx';
import { ForecastsView } from './views/ForecastsView.tsx';
import { AlertCenterView } from './views/AlertCenterView.tsx';
import { RecommendationCenterView } from './views/RecommendationCenterView.tsx';
import { EmergencyCascadeView } from './views/EmergencyCascadeView.tsx';
import { WhatIfSimulatorView } from './views/WhatIfSimulatorView.tsx';
import { FederatedIntelligenceView } from './views/FederatedIntelligenceView.tsx';
import { AiCopilotView } from './views/AiCopilotView.tsx';
import { AiBriefingView } from './views/AiBriefingView.tsx';
import { ModelPerformanceView } from './views/ModelPerformanceView.tsx';
import { DataReliabilityView } from './views/DataReliabilityView.tsx';
import { AuditLogView } from './views/AuditLogView.tsx';
import { SystemArchitectureView } from './views/SystemArchitectureView.tsx';
import { DemoControlCenterView } from './views/DemoControlCenterView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { Menu, Sparkles, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, toastMessage } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'phcNetwork':
        return <PhcNetworkView />;
      case 'phcDetail':
        return <PhcDetailView />;
      case 'resourceIntelligence':
        return <ResourceIntelligenceView />;
      case 'forecasts':
        return <ForecastsView />;
      case 'alerts':
        return <AlertCenterView />;
      case 'recommendations':
        return <RecommendationCenterView />;
      case 'emergencyCascade':
        return <EmergencyCascadeView />;
      case 'whatIfSimulator':
        return <WhatIfSimulatorView />;
      case 'federatedIntelligence':
        return <FederatedIntelligenceView />;
      case 'aiCopilot':
        return <AiCopilotView />;
      case 'aiBriefing':
        return <AiBriefingView />;
      case 'modelPerformance':
        return <ModelPerformanceView />;
      case 'dataReliability':
        return <DataReliabilityView />;
      case 'auditLog':
        return <AuditLogView />;
      case 'systemArchitecture':
        return <SystemArchitectureView />;
      case 'demoControlCenter':
        return <DemoControlCenterView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/60 text-white text-xs font-mono shadow-2xl shadow-cyan-950/80">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Main Workspace Body */}
      <div className="flex-1 flex">
        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-5 right-5 z-50 p-3 rounded-full bg-cyan-600 text-white shadow-xl shadow-cyan-950/80 hover:bg-cyan-500 transition-all"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Scrollable View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Navbar />
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
