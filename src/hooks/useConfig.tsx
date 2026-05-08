'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AppConfig } from '@/types';
import * as api from '@/lib/api';

interface ConfigContextValue {
  config: AppConfig | null;
  loading: boolean;
  updateConfig: (partial: Partial<AppConfig>) => Promise<AppConfig>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchConfig()
      .then(setConfig)
      .catch(() =>
        setConfig({
          cookie: '',
          refreshIntervalMin: 30,
          typeFilters: [],
          avatarSize: 24,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = useCallback(async (partial: Partial<AppConfig>) => {
    const updated = await api.saveConfig(partial);
    setConfig(updated);
    return updated;
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx)
    throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
