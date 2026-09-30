import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types.ts';
import { Language, translations } from '../locales/translations.ts';

export type ActiveView =
  | 'overview'
  | 'digitalTwin'
  | 'phcNetwork'
  | 'phcDetail'
  | 'resourceIntelligence'
  | 'forecasts'
  | 'alerts'
  | 'recommendations'
  | 'emergencyCascade'
  | 'whatIfSimulator'
  | 'federatedIntelligence'
  | 'aiCopilot'
  | 'aiBriefing'
  | 'modelPerformance'
  | 'dataReliability'
  | 'auditLog'
  | 'systemArchitecture'
  | 'demoControlCenter'
  | 'settings';

interface AppContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  switchLoginRole: (r: UserRole) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: typeof translations.en;
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  selectedPhcId: string | null;
  setSelectedPhcId: (id: string | null) => void;
  isAiConnected: boolean;
  activeScenario: string;
  setActiveScenario: (s: string) => void;
  demoStep: number; // 0 = not running, 1..7 = guided steps
  setDemoStep: (step: number) => void;
  notificationsCount: number;
  setNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  refreshSignal: number;
  triggerRefresh: () => void;
  showDemoToast: (msg: string) => void;
  toastMessage: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('DISTRICT_AUTHORITY');
  const [language, setLanguage] = useState<Language>('en');
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedPhcId, setSelectedPhcId] = useState<string | null>('phc-ap-01');
  const [isAiConnected, setIsAiConnected] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<string>('Standard Operations');
  const [demoStep, setDemoStep] = useState<number>(0);
  const [notificationsCount, setNotificationsCount] = useState<number>(4);
  const [refreshSignal, setRefreshSignal] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[language] || translations.en;

  const triggerRefresh = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  const showDemoToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const switchLoginRole = (newRole: UserRole) => {
    setRole(newRole);
    switch (newRole) {
      case 'PHC_STAFF':
        setActiveView('phcDetail');
        showDemoToast('Logged in as Hospital Medical Officer — Local Facility Telemetry Screen');
        break;
      case 'DISTRICT_AUTHORITY':
        setActiveView('overview');
        showDemoToast('Logged in as District Health Officer — District Command & Mutual-Aid Screen');
        break;
      case 'STATE_AUTHORITY':
        setActiveView('digitalTwin');
        showDemoToast('Logged in as State Health Commissioner — Healthcare Digital Twin & Network Screen');
        break;
      case 'NATIONAL_AUTHORITY':
        setActiveView('federatedIntelligence');
        showDemoToast('Logged in as National Health Mission Lead — Federated Learning & Policy Screen');
        break;
      case 'ADMIN':
        setActiveView('demoControlCenter');
        showDemoToast('Logged in as System Administrator — Full Audit & Demo Control Center');
        break;
      default:
        setActiveView('overview');
    }
  };

  useEffect(() => {
    // Probe backend status on mount
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.geminiConnected !== undefined) {
          setIsAiConnected(data.geminiConnected);
        }
        if (data.activeScenario) {
          setActiveScenario(data.activeScenario);
        }
      })
      .catch(() => {
        setIsAiConnected(false);
      });
  }, [refreshSignal]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        switchLoginRole,
        language,
        setLanguage,
        t,
        activeView,
        setActiveView,
        selectedPhcId,
        setSelectedPhcId,
        isAiConnected,
        activeScenario,
        setActiveScenario,
        demoStep,
        setDemoStep,
        notificationsCount,
        setNotificationsCount,
        refreshSignal,
        triggerRefresh,
        showDemoToast,
        toastMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
