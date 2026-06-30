import { useState, useEffect, useCallback } from 'react';
import { Gbb_calculatorproductsService } from '../generated/services/Gbb_calculatorproductsService';
import { Gbb_calculatorpersonasService } from '../generated/services/Gbb_calculatorpersonasService';
import { Gbb_calculatorpricingsService } from '../generated/services/Gbb_calculatorpricingsService';
import { Gbb_calculatorsettingsService } from '../generated/services/Gbb_calculatorsettingsService';

export interface ConfigurationStatus {
  products: boolean | null;
  personas: boolean | null;
  pricing: boolean | null;
  calculatorSettings: boolean | null;
  loading: boolean;
  refresh: () => void;
}

export function useConfigurationStatus(): ConfigurationStatus {
  const [status, setStatus] = useState<Omit<ConfigurationStatus, 'refresh'>>({
    products: null,
    personas: null,
    pricing: null,
    calculatorSettings: null,
    loading: true,
  });

  const checkConfiguration = useCallback(async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    const [products, personas, pricing, settings] = await Promise.all([
      Gbb_calculatorproductsService.getAll({ top: 1, filter: 'statecode eq 0' }).then(r => (r.data?.length ?? 0) > 0).catch(() => false),
      Gbb_calculatorpersonasService.getAll({ top: 1, filter: 'statecode eq 0' }).then(r => (r.data?.length ?? 0) > 0).catch(() => false),
      Gbb_calculatorpricingsService.getAll({ top: 1, filter: 'statecode eq 0' }).then(r => (r.data?.length ?? 0) > 0).catch(() => false),
      Gbb_calculatorsettingsService.getAll({ top: 1, filter: 'statecode eq 0' }).then(r => (r.data?.length ?? 0) > 0).catch(() => false),
    ]);

    setStatus({
      products,
      personas,
      pricing,
      calculatorSettings: settings,
      loading: false,
    });
  }, []);

  useEffect(() => {
    checkConfiguration();
  }, [checkConfiguration]);

  return { ...status, refresh: checkConfiguration };
}
