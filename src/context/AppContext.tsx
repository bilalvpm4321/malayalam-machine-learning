import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiService, getApiBaseUrl, getIsMockMode, setApiBaseUrl, setIsMockMode } from '../services/api';
import type { ExperimentConfigId, HealthResponse, LanguageId, TaskId } from '../types/api';
import type { ExperimentRecord } from '../types/experiment';

export type ActivePage = 'dashboard' | 'playground' | 'dataset' | 'experiments' | 'metrics' | 'history' | 'settings';

interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  backendStatus: 'checking' | 'connected' | 'disconnected';
  backendInfo: HealthResponse | null;
  lastHealthCheckTime: Date | null;
  isMockMode: boolean;
  setIsMockModeState: (enabled: boolean) => void;
  apiBaseUrl: string;
  setApiBaseUrlState: (url: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentLanguage: LanguageId;
  setCurrentLanguage: (lang: LanguageId) => void;
  currentConfig: ExperimentConfigId;
  setCurrentConfig: (config: ExperimentConfigId) => void;
  currentTask: TaskId;
  setCurrentTask: (task: TaskId) => void;
  history: ExperimentRecord[];
  addHistoryRecord: (record: Omit<ExperimentRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryRecord: (id: string) => void;
  checkBackendHealth: () => Promise<void>;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const STORAGE_KEY_HISTORY = 'indic_qa_experiment_history';
const STORAGE_KEY_THEME = 'indic_qa_dark_theme';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendInfo, setBackendInfo] = useState<HealthResponse | null>(null);
  const [lastHealthCheckTime, setLastHealthCheckTime] = useState<Date | null>(null);
  const [isMockMode, setIsMockModeLocal] = useState<boolean>(getIsMockMode());
  const [apiBaseUrl, setApiBaseUrlLocal] = useState<string>(getApiBaseUrl());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const [currentLanguage, setCurrentLanguage] = useState<LanguageId>('ml');
  const [currentConfig, setCurrentConfig] = useState<ExperimentConfigId>('qlora');
  const [currentTask, setCurrentTask] = useState<TaskId>('qa');

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // History state
  const [history, setHistory] = useState<ExperimentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // storage quota exceeded or unavailable
    }
  }, [history]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const setApiBaseUrlState = (url: string) => {
    setApiBaseUrl(url);
    setApiBaseUrlLocal(url);
    checkBackendHealth();
  };

  const setIsMockModeState = (enabled: boolean) => {
    setIsMockMode(enabled);
    setIsMockModeLocal(enabled);
    checkBackendHealth();
  };

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    try {
      const info = await ApiService.checkHealth();
      setBackendInfo(info);
      setBackendStatus('connected');
      setLastHealthCheckTime(new Date());
    } catch {
      setBackendInfo(null);
      setBackendStatus('disconnected');
      setLastHealthCheckTime(new Date());
    }
  };

  useEffect(() => {
    checkBackendHealth();
    // Poll health status every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [isMockMode, apiBaseUrl]);

  const addHistoryRecord = (record: Omit<ExperimentRecord, 'id' | 'timestamp'>) => {
    const newRecord: ExperimentRecord = {
      ...record,
      id: `EXP-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [newRecord, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  const deleteHistoryRecord = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        backendStatus,
        backendInfo,
        lastHealthCheckTime,
        isMockMode,
        setIsMockModeState,
        apiBaseUrl,
        setApiBaseUrlState,
        isDarkMode,
        toggleDarkMode,
        currentLanguage,
        setCurrentLanguage,
        currentConfig,
        setCurrentConfig,
        currentTask,
        setCurrentTask,
        history,
        addHistoryRecord,
        clearHistory,
        deleteHistoryRecord,
        checkBackendHealth,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
