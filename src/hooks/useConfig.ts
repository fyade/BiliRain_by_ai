'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppConfig } from '@/types';
import * as api from '@/lib/api';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchConfig()
      .then(setConfig)
      .catch(() => setConfig({ cookie: '', refreshIntervalMin: 30, typeFilters: [], avatarSize: 24 }))
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = useCallback(async (partial: Partial<AppConfig>) => {
    const updated = await api.saveConfig(partial);
    setConfig(updated);
    return updated;
  }, []);

  return { config, loading, updateConfig };
}
