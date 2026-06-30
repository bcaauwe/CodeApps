import React, { useState, useCallback, useEffect } from 'react';
import {
  FluentProvider,
  makeStyles,
  tokens,
  Text,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import { WeatherMoon24Regular, WeatherSunny24Regular, Settings24Regular, People24Regular, Money24Regular, Options24Regular, Apps24Regular } from '@fluentui/react-icons';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './hooks/useTheme';
import { ToolSelector, type ProductItem } from './components/ToolSelector';
import { PersonaSelector } from './components/PersonaSelector';
import { EstimateTable } from './components/EstimateTable';
import { AdminPersonas } from './components/AdminPersonas';
import { AdminPricing } from './components/AdminPricing';
import { AdminProducts } from './components/AdminProducts';
import { CalculatorSettings } from './components/CalculatorSettings';
import { SettingsHub } from './components/SettingsHub';
import { Gbb_calculatorproductsService } from './generated/services/Gbb_calculatorproductsService';
import { Gbb_calculatorpersonasService } from './generated/services/Gbb_calculatorpersonasService';
import { Gbb_calculatorpersonacomplexitiesService } from './generated/services/Gbb_calculatorpersonacomplexitiesService';
import { Gbb_calculatorsettingsService } from './generated/services/Gbb_calculatorsettingsService';
import { WhoAmIService } from './generated/services/WhoAmIService';
import { RetrieveUserPrivilegesService } from './generated/services/RetrieveUserPrivilegesService';
import type { Gbb_calculatorpersonacomplexities } from './generated/models/Gbb_calculatorpersonacomplexitiesModel';
import type { ToolId, Persona, PersonaComplexity, EstimateRow } from './types';

const useStyles = makeStyles({
  shell: {
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXXL}`,
  },
});

const COMPLEXITY_REVERSE: Record<number, keyof PersonaComplexity> = {
  803430000: 'low',
  803430001: 'medium',
  803430002: 'high',
  803430003: 'veryHigh',
};

function buildComplexityFromRecords(records: Gbb_calculatorpersonacomplexities[]): PersonaComplexity {
  const result: PersonaComplexity = {};
  for (const rec of records) {
    const level = rec.gbb_complexity !== undefined ? COMPLEXITY_REVERSE[rec.gbb_complexity] : undefined;
    if (level) {
      result[level] = {
        creditsPerSessionMin: rec.gbb_minimum ?? 0,
        creditsPerSessionMax: rec.gbb_maximum ?? 0,
      };
    }
  }
  return result;
}

type Page = 'main' | 'settings' | 'admin-personas' | 'admin-pricing' | 'admin-products' | 'calculator-settings';

let nextRowId = 1;

const AppContent: React.FC = () => {
  const styles = useStyles();
  const { theme, isDark, toggleTheme } = useTheme();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeToolId, setActiveToolId] = useState<ToolId>('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [page, setPage] = useState<Page>('main');
  const [appTitle, setAppTitle] = useState('Copilot Credit Calculator');
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(22);

  const [estimateRows, setEstimateRows] = useState<Record<ToolId, EstimateRow[]>>({});
  const [currentEstimates, setCurrentEstimates] = useState<Record<ToolId, { id: string; name: string } | null>>({});
  const [userPrivileges, setUserPrivileges] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function loadPrivileges() {
      try {
        const whoAmIResult = await WhoAmIService.WhoAmI();
        const userId = (whoAmIResult.data as Record<string, unknown>)?.UserId as string;
        if (userId) {
          const privilegesResult = await RetrieveUserPrivilegesService.RetrieveUserPrivileges(userId);
          setUserPrivileges(privilegesResult.data as Record<string, unknown> ?? null);
        } else {
          setUserPrivileges({});
        }
      } catch (err) {
        console.error('Failed to load privileges:', err);
        setUserPrivileges({});
      }
    }
    loadPrivileges();
  }, []);

  useEffect(() => {
    Gbb_calculatorsettingsService.getAll({ filter: 'statecode eq 0' }).then((result) => {
      const records = result.data ?? [];
      if (records.length === 0) return;
      try {
        const config = JSON.parse(records[0].gbb_configuration ?? '');
        const settings = config.settings as { category?: string; items?: { key?: string; value?: unknown }[] }[] | undefined;
        if (Array.isArray(settings)) {
          for (const cat of settings) {
            for (const item of cat.items ?? []) {
              if (item.key === 'appTitle' && item.value) {
                setAppTitle(String(item.value));
              }
              if (item.key === 'workingDaysPerMonth' && item.value != null) {
                setWorkingDaysPerMonth(Number(item.value) || 22);
              }
            }
          }
        }
      } catch { /* ignore parse errors */ }
    });
  }, []);

  useEffect(() => {
    Gbb_calculatorproductsService.getAll({ filter: 'statecode eq 0', orderBy: ['gbb_sortorder asc'] }).then(async (result) => {
      const data = result.data ?? [];
      const items: ProductItem[] = data.map((p) => ({
        id: p.gbb_calculatorproductid,
        name: p.gbb_name,
        sortOrder: p.gbb_sortorder,
      }));
      setProducts(items);
      if (items.length > 0 && !activeToolId) {
        setActiveToolId(items[0].id);
      }
      // Download images for products that have one
      for (const p of data) {
        if (p.gbb_productimageid) {
          try {
            const imgResult = await Gbb_calculatorproductsService.downloadImage(p.gbb_calculatorproductid, 'gbb_productimage');
            if (imgResult.data) {
              const uint8 = new Uint8Array(imgResult.data);
              let binary = '';
              for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
              const url = `data:image/png;base64,${btoa(binary)}`;
              setProducts((prev) =>
                prev.map((item) =>
                  item.id === p.gbb_calculatorproductid ? { ...item, imageUrl: url } : item,
                ),
              );
            }
          } catch {
            // Image not available
          }
        }
      }
    });
  }, []);

  // Load personas from Dataverse when active product changes
  const loadPersonas = useCallback(async () => {
    if (!activeToolId) {
      setPersonas([]);
      return;
    }

    try {
      const result = await Gbb_calculatorpersonasService.getAll({
        filter: `_gbb_product_value eq '${activeToolId}' and statecode eq 0`,
      });
      const personaRecords = result.data ?? [];

      // Load complexities for all personas
      const mapped: Persona[] = await Promise.all(
        personaRecords.map(async (rec) => {
          const cResult = await Gbb_calculatorpersonacomplexitiesService.getAll({
            filter: `_gbb_persona_value eq '${rec.gbb_calculatorpersonaid}' and statecode eq 0`,
          });
          const complexity = buildComplexityFromRecords(cResult.data ?? []);
          return {
            id: rec.gbb_calculatorpersonaid,
            name: rec.gbb_name,
            icon: rec.gbb_icon ?? 'Person',
            bullets: rec.gbb_description ? rec.gbb_description.split('\n').filter((b) => b.trim() !== '') : [],
            complexity,
          };
        }),
      );

      setPersonas(mapped);
    } catch (err) {
      console.error('Failed to load personas:', err);
    }
  }, [activeToolId]);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const activeProductName = products.find((p) => p.id === activeToolId)?.name ?? '';
  const activeRows = estimateRows[activeToolId] ?? [];

  const handleAddPersona = useCallback(
    (personaId: string) => {
      const newRow: EstimateRow = {
        id: String(nextRowId++),
        personaId,
        complexityLevel: 'medium',
        userCount: 0,
        sessionsPerDay: 0,
        months: 12,
      };
      setEstimateRows((prev) => ({
        ...prev,
        [activeToolId]: [...(prev[activeToolId] ?? []), newRow],
      }));
    },
    [activeToolId],
  );

  const handleUpdateRow = useCallback(
    (rowId: string, field: keyof Pick<EstimateRow, 'personaId' | 'complexityLevel' | 'userCount' | 'sessionsPerDay' | 'months'>, value: string | number) => {
      setEstimateRows((prev) => ({
        ...prev,
        [activeToolId]: (prev[activeToolId] ?? []).map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row,
        ),
      }));
    },
    [activeToolId],
  );

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      setEstimateRows((prev) => ({
        ...prev,
        [activeToolId]: (prev[activeToolId] ?? []).filter((row) => row.id !== rowId),
      }));
    },
    [activeToolId],
  );

  const handleEstimateSaved = useCallback(
    (estimateId: string, estimateName: string) => {
      setCurrentEstimates((prev) => ({
        ...prev,
        [activeToolId]: { id: estimateId, name: estimateName },
      }));
    },
    [activeToolId],
  );

  const handleEstimateLoaded = useCallback(
    (estimateId: string, estimateName: string, rows: EstimateRow[]) => {
      setEstimateRows((prev) => ({
        ...prev,
        [activeToolId]: rows,
      }));
      setCurrentEstimates((prev) => ({
        ...prev,
        [activeToolId]: { id: estimateId, name: estimateName },
      }));
    },
    [activeToolId],
  );

  const handleEstimateDeleted = useCallback(() => {
    setEstimateRows((prev) => ({
      ...prev,
      [activeToolId]: [],
    }));
    setCurrentEstimates((prev) => ({
      ...prev,
      [activeToolId]: null,
    }));
  }, [activeToolId]);

  const handleEstimateClosed = useCallback(() => {
    setEstimateRows((prev) => ({
      ...prev,
      [activeToolId]: [],
    }));
    setCurrentEstimates((prev) => ({
      ...prev,
      [activeToolId]: null,
    }));
  }, [activeToolId]);

  const activeEstimate = currentEstimates[activeToolId] ?? null;

  const canCreateCalculatorSetting = userPrivileges
    ? ((userPrivileges.RolePrivileges as Array<Record<string, unknown>>) ?? []).some(
        (priv) => priv.PrivilegeName === 'prvCreategbb_CalculatorSetting',
      )
    : null;

  return (
    <FluentProvider theme={theme}>
      <div className={styles.shell}>
      <header className={styles.header}>
        <Text className={styles.title}>{appTitle}</Text>
        <div>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                appearance="subtle"
                icon={<Settings24Regular />}
                aria-label="Administration"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<People24Regular />} onClick={() => setPage('admin-personas')}>
                  Personas
                </MenuItem>
                <MenuItem icon={<Money24Regular />} onClick={() => setPage('admin-pricing')}>
                  Pricing
                </MenuItem>
                <MenuItem icon={<Apps24Regular />} onClick={() => setPage('admin-products')}>
                  Products
                </MenuItem>
                <MenuItem icon={<Options24Regular />} onClick={() => setPage('calculator-settings')} disabled={canCreateCalculatorSetting === false}>
                  Calculator Settings
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <Button
            appearance="subtle"
            icon={isDark ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
      </header>
      <div className={styles.container}>
        {page === 'settings' ? (
          <SettingsHub
            onNavigate={(p) => setPage(p)}
            onBack={() => setPage('main')}
            userPrivileges={userPrivileges}
          />
        ) : page === 'admin-personas' ? (
          <AdminPersonas
            onBack={() => { setPage('settings'); loadPersonas(); }}
          />
        ) : page === 'admin-pricing' ? (
          <AdminPricing
            onBack={() => setPage('settings')}
          />
        ) : page === 'admin-products' ? (
          <AdminProducts
            onBack={() => setPage('settings')}
          />
        ) : page === 'calculator-settings' ? (
          <CalculatorSettings
            onBack={() => setPage('settings')}
            onSettingsChanged={(settings) => {
              for (const cat of settings) {
                for (const item of (cat as any).items ?? []) {
                  if (item.key === 'appTitle' && item.value) {
                    setAppTitle(String(item.value));
                  }
                  if (item.key === 'workingDaysPerMonth' && item.value != null) {
                    setWorkingDaysPerMonth(Number(item.value) || 22);
                  }
                }
              }
            }}
          />
        ) : (
          <>
            <ToolSelector activeToolId={activeToolId} products={products} onToolChange={setActiveToolId} />
            <PersonaSelector
              personas={personas}
              onAddPersona={handleAddPersona}
            />
            <EstimateTable
              rows={activeRows}
              personas={personas}
              workingDaysPerMonth={workingDaysPerMonth}
              toolName={activeProductName}
              productId={activeToolId}
              currentEstimateId={activeEstimate?.id ?? null}
              currentEstimateName={activeEstimate?.name ?? ''}
              onUpdateRow={handleUpdateRow}
              onRemoveRow={handleRemoveRow}
              onEstimateSaved={handleEstimateSaved}
              onEstimateLoaded={handleEstimateLoaded}
              onEstimateDeleted={handleEstimateDeleted}
              onEstimateClosed={handleEstimateClosed}
            />
          </>
        )}
      </div>
      </div>
    </FluentProvider>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
