import React, { useState, useCallback, useEffect } from 'react';
import {
  FluentProvider,
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Spinner,
} from '@fluentui/react-components';
import { WeatherMoon24Regular, WeatherSunny24Regular, Settings24Regular, People24Regular, Money24Regular, Options24Regular, Apps24Regular, Warning16Regular, Warning24Regular, ArrowLeft24Regular, DataPie24Regular, Scales24Regular } from '@fluentui/react-icons';
import { useConfigurationStatus } from './hooks/useConfigurationStatus';
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
import { EstimateList } from './pages/EstimateList';
import { EstimateSummary } from './pages/EstimateSummary';
import { Gbb_calculatorproductsService } from './generated/services/Gbb_calculatorproductsService';
import { Gbb_calculatorpersonasService } from './generated/services/Gbb_calculatorpersonasService';
import { Gbb_calculatorpersonacomplexitiesService } from './generated/services/Gbb_calculatorpersonacomplexitiesService';
import { Gbb_calculatorsettingsService } from './generated/services/Gbb_calculatorsettingsService';
import { Gbb_calculatorestimatesService } from './generated/services/Gbb_calculatorestimatesService';
import { Gbb_calculatorproductestimatesService } from './generated/services/Gbb_calculatorproductestimatesService';
import { Gbb_calculatorestimatelinesService } from './generated/services/Gbb_calculatorestimatelinesService';
import { WhoAmIService } from './generated/services/WhoAmIService';
import { RetrieveUserPrivilegesService } from './generated/services/RetrieveUserPrivilegesService';
import type { Gbb_calculatorpersonacomplexities } from './generated/models/Gbb_calculatorpersonacomplexitiesModel';
import type { Gbb_calculatorestimates } from './generated/models/Gbb_calculatorestimatesModel';
import type { ToolId, Persona, PersonaComplexity, EstimateRow, ComplexityKey } from './types';

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
  estimateBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalXXL,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  estimateBarFields: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    flexGrow: 1,
  },
  estimateField: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  estimateFieldLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: 'nowrap',
  },
  estimateFieldInput: {
    width: '80px',
  },
  estimateName: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
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

type Page = 'home' | 'estimate-detail' | 'summary' | 'settings' | 'admin-personas' | 'admin-pricing' | 'admin-products' | 'calculator-settings';

let nextRowId = 1;

const AppContent: React.FC = () => {
  const styles = useStyles();
  const { theme, isDark, toggleTheme } = useTheme();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeToolId, setActiveToolId] = useState<ToolId>('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [page, setPage] = useState<Page>('home');
  const [appTitle, setAppTitle] = useState('Copilot Credit Calculator');
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(22);

  // Active estimate state
  const [activeEstimateId, setActiveEstimateId] = useState<string | null>(null);
  const [activeEstimateRecord, setActiveEstimateRecord] = useState<Gbb_calculatorestimates | null>(null);
  const [estimateGrowth, setEstimateGrowth] = useState(10);
  const [estimateYears, setEstimateYears] = useState(3);

  const [estimateRows, setEstimateRows] = useState<Record<ToolId, EstimateRow[]>>({});
  const [currentEstimates, setCurrentEstimates] = useState<Record<ToolId, { id: string; name: string } | null>>({});
  const [userPrivileges, setUserPrivileges] = useState<Record<string, unknown> | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

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

  // Open an estimate: load its record and pre-load linked product estimates
  const handleOpenEstimate = useCallback(async (estimateId: string) => {
    const COMPLEXITY_CHOICE_TO_KEY: Record<number, ComplexityKey> = {
      803430000: 'low',
      803430001: 'medium',
      803430002: 'high',
      803430003: 'veryHigh',
    };

    try {
      const result = await Gbb_calculatorestimatesService.get(estimateId);
      const est = result.data ?? null;
      setActiveEstimateId(estimateId);
      setActiveEstimateRecord(est);
      setEstimateGrowth(est?.gbb_growth ?? 10);
      setEstimateYears(est?.gbb_years ?? 3);

      // Pre-load product estimates linked to this calculator estimate
      const newRows: Record<ToolId, EstimateRow[]> = {};
      const newCurrentEstimates: Record<ToolId, { id: string; name: string } | null> = {};

      const prodEstResult = await Gbb_calculatorproductestimatesService.getAll({
        filter: `_gbb_estimate_value eq '${estimateId}' and statecode eq 0`,
      });
      const productEstimates = prodEstResult.data ?? [];

      for (const pe of productEstimates) {
        const productId = pe._gbb_product_value;
        if (!productId) continue;

        // Load estimate lines for this product estimate
        const linesResult = await Gbb_calculatorestimatelinesService.getAll({
          filter: `_gbb_productestimate_value eq '${pe.gbb_calculatorproductestimateid}' and statecode eq 0`,
        });
        const lines = linesResult.data ?? [];

        const rows: EstimateRow[] = [];
        for (let idx = 0; idx < lines.length; idx++) {
          const line = lines[idx];
          let personaId = '';
          let complexityLevel: ComplexityKey = 'medium';

          if (line._gbb_complexity_value) {
            try {
              const complexityResult = await Gbb_calculatorpersonacomplexitiesService.get(line._gbb_complexity_value);
              const rec = complexityResult.data;
              if (rec) {
                personaId = rec._gbb_persona_value ?? '';
                const level = rec.gbb_complexity !== undefined ? COMPLEXITY_CHOICE_TO_KEY[rec.gbb_complexity] : undefined;
                if (level) complexityLevel = level;
              }
            } catch { /* skip */ }
          }

          rows.push({
            id: String(Date.now() + idx),
            personaId,
            complexityLevel,
            userCount: line.gbb_users,
            sessionsPerDay: line.gbb_sessions,
            months: line.gbb_months ?? 12,
          });
        }

        newRows[productId] = rows;
        newCurrentEstimates[productId] = { id: pe.gbb_calculatorproductestimateid, name: pe.gbb_name ?? '' };
      }

      setEstimateRows(newRows);
      setCurrentEstimates(newCurrentEstimates);
      setPage('estimate-detail');
    } catch (err) {
      console.error('Failed to open estimate:', err);
    }
  }, []);

  // Save growth/years back to Dataverse when changed
  const handleGrowthChange = useCallback((value: number) => {
    setEstimateGrowth(value);
    if (activeEstimateId) {
      Gbb_calculatorestimatesService.update(activeEstimateId, { gbb_growth: value }).catch(console.error);
    }
  }, [activeEstimateId]);

  const handleYearsChange = useCallback((value: number) => {
    setEstimateYears(value);
    if (activeEstimateId) {
      Gbb_calculatorestimatesService.update(activeEstimateId, { gbb_years: value }).catch(console.error);
    }
  }, [activeEstimateId]);

  const loadProducts = useCallback(async () => {
    const result = await Gbb_calculatorproductsService.getAll({ filter: 'statecode eq 0', orderBy: ['gbb_sortorder asc'] });
    const data = result.data ?? [];
    const items: ProductItem[] = data.map((p) => ({
      id: p.gbb_calculatorproductid,
      name: p.gbb_name,
      sortOrder: p.gbb_sortorder,
      complexityTooltip: p.gbb_complexitytooltip,
    }));
    setProducts(items);
    if (items.length > 0 && !activeToolId) {
      setActiveToolId(items[0].id);
    }
    setInitialLoading(false);
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
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
    if (page === 'estimate-detail') {
      loadPersonas();
    }
  }, [loadPersonas, page]);

  const activeProduct = products.find((p) => p.id === activeToolId);
  const activeProductName = activeProduct?.name ?? '';
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

  const configStatus = useConfigurationStatus();

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
                <MenuItem icon={<Apps24Regular />} onClick={() => setPage('admin-products')}>
                  Products {configStatus.products === false && <Warning16Regular color={tokens.colorPaletteYellowForeground2} />}
                </MenuItem>
                <MenuItem icon={<People24Regular />} onClick={() => setPage('admin-personas')}>
                  Personas {configStatus.personas === false && <Warning16Regular color={tokens.colorPaletteYellowForeground2} />}
                </MenuItem>
                <MenuItem icon={<Money24Regular />} onClick={() => setPage('admin-pricing')}>
                  Pricing {configStatus.pricing === false && <Warning16Regular color={tokens.colorPaletteYellowForeground2} />}
                </MenuItem>
                <MenuItem icon={<Options24Regular />} onClick={() => setPage('calculator-settings')} disabled={canCreateCalculatorSetting === false}>
                  Calculator Settings {configStatus.calculatorSettings === false && <Warning16Regular color={tokens.colorPaletteYellowForeground2} />}
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
        {initialLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: tokens.spacingVerticalXXXL }}>
            <Spinner size="large" label="Loading..." />
          </div>
        ) : page === 'home' ? (
          !configStatus.loading && (configStatus.products === false || configStatus.personas === false || configStatus.pricing === false || configStatus.calculatorSettings === false) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacingVerticalL, marginTop: tokens.spacingVerticalXXXL }}>
              <Warning24Regular style={{ fontSize: '48px', color: tokens.colorPaletteYellowForeground2 }} />
              <Text size={400} weight="semibold">Configuration Needed</Text>
              <Text size={300} style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', maxWidth: '480px' }}>
                The calculator requires configuration before estimates can be created. Please complete the setup in the Settings Hub.
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS, alignItems: 'flex-start', marginTop: tokens.spacingVerticalM }}>
                {configStatus.products === false && (
                  <Text size={200} style={{ color: tokens.colorPaletteYellowForeground2 }}>
                    <Warning16Regular /> Products not configured
                  </Text>
                )}
                {configStatus.personas === false && (
                  <Text size={200} style={{ color: tokens.colorPaletteYellowForeground2 }}>
                    <Warning16Regular /> Personas not configured
                  </Text>
                )}
                {configStatus.pricing === false && (
                  <Text size={200} style={{ color: tokens.colorPaletteYellowForeground2 }}>
                    <Warning16Regular /> Pricing not configured
                  </Text>
                )}
                {configStatus.calculatorSettings === false && (
                  <Text size={200} style={{ color: tokens.colorPaletteYellowForeground2 }}>
                    <Warning16Regular /> Calculator settings not configured
                  </Text>
                )}
              </div>
              <Button appearance="primary" icon={<Settings24Regular />} onClick={() => setPage('settings')} style={{ marginTop: tokens.spacingVerticalM }}>
                Go to Settings Hub
              </Button>
            </div>
          ) : (
            <>
              <EstimateList onOpenEstimate={handleOpenEstimate} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacingHorizontalM, marginTop: tokens.spacingVerticalXXL, padding: tokens.spacingVerticalM, backgroundColor: tokens.colorNeutralBackground3, borderRadius: tokens.borderRadiusMedium }}>
                <Scales24Regular style={{ color: tokens.colorNeutralForeground3, flexShrink: 0, marginTop: '2px' }} />
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  The Copilot Credit calculator is not a binding offer nor a guarantee of the final cost or availability of any product. The estimates should be regarded only as directional in nature and intended solely to support business planning and NOT incorporated into a contractual agreement. The actual amount of message consumption and associated cost may vary depending on the region, availability, workload usage, number of users, and other factors. You may contact your Microsoft representative before making any customer recommendations or purchase decisions. 
                </Text>
              </div>
            </>
          )
        ) : page === 'summary' && activeEstimateId ? (
          <EstimateSummary
            estimateId={activeEstimateId}
            onBack={() => setPage('estimate-detail')}
            workingDaysPerMonth={workingDaysPerMonth}
            products={products}
          />
        ) : page === 'settings' ? (
          <SettingsHub
            onNavigate={(p) => setPage(p)}
            onBack={() => setPage(activeEstimateId ? 'estimate-detail' : 'home')}
            userPrivileges={userPrivileges}
          />
        ) : page === 'admin-personas' ? (
          <AdminPersonas
            onBack={() => { setPage('settings'); loadPersonas(); configStatus.refresh(); }}
            onPersonasChanged={loadPersonas}
          />
        ) : page === 'admin-pricing' ? (
          <AdminPricing
            onBack={() => { setPage('settings'); configStatus.refresh(); }}
          />
        ) : page === 'admin-products' ? (
          <AdminProducts
            onBack={() => { setPage('settings'); configStatus.refresh(); }}
            onProductsChanged={loadProducts}
          />
        ) : page === 'calculator-settings' ? (
          <CalculatorSettings
            onBack={() => { setPage('settings'); configStatus.refresh(); }}
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
        ) : products.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacingVerticalL, marginTop: tokens.spacingVerticalXXXL }}>
            <Apps24Regular style={{ fontSize: '48px', color: tokens.colorNeutralForeground3 }} />
            <Text size={400} weight="semibold">No products configured</Text>
            <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
              To get started, add products in the Products settings screen.
            </Text>
            <Button appearance="primary" icon={<Apps24Regular />} onClick={() => setPage('admin-products')}>
              Go to Products
            </Button>
          </div>
        ) : (
          <>
            {/* Estimate header bar with back, name, growth, years, summary */}
            <div className={styles.estimateBar}>
              <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => { setPage('home'); setActiveEstimateId(null); setActiveEstimateRecord(null); }} aria-label="Back to estimates" />
              <Text className={styles.estimateName}>{activeEstimateRecord?.gbb_name ?? 'Estimate'}</Text>
              <div className={styles.estimateBarFields}>
                <div className={styles.estimateField}>
                  <Text className={styles.estimateFieldLabel}>Growth %</Text>
                  <Input
                    className={styles.estimateFieldInput}
                    type="number"
                    size="small"
                    min={0}
                    max={100}
                    value={String(estimateGrowth)}
                    onChange={(_, d) => setEstimateGrowth(Number(d.value) || 0)}
                    onBlur={() => handleGrowthChange(estimateGrowth)}
                  />
                </div>
                <div className={styles.estimateField}>
                  <Text className={styles.estimateFieldLabel}>Years</Text>
                  <Input
                    className={styles.estimateFieldInput}
                    type="number"
                    size="small"
                    min={1}
                    max={10}
                    value={String(estimateYears)}
                    onChange={(_, d) => setEstimateYears(Number(d.value) || 1)}
                    onBlur={() => handleYearsChange(estimateYears)}
                  />
                </div>
              </div>
              <Button appearance="primary" icon={<DataPie24Regular />} onClick={() => setPage('summary')}>
                View Summary
              </Button>
            </div>

            <ToolSelector activeToolId={activeToolId} products={products} onToolChange={setActiveToolId} />
            {personas.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacingVerticalL, marginTop: tokens.spacingVerticalXXXL }}>
                <People24Regular style={{ fontSize: '48px', color: tokens.colorNeutralForeground3 }} />
                <Text size={400} weight="semibold">No personas configured</Text>
                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
                  To get started, add personas for this product in the Personas settings screen.
                </Text>
                <Button appearance="primary" icon={<People24Regular />} onClick={() => setPage('admin-personas')}>
                  Go to Personas
                </Button>
              </div>
            ) : (
              <>
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
                  complexityTooltip={activeProduct?.complexityTooltip}
                  currentEstimateId={activeEstimate?.id ?? null}
                  currentEstimateName={activeEstimate?.name ?? ''}
                  parentEstimateId={activeEstimateId}
                  onUpdateRow={handleUpdateRow}
                  onRemoveRow={handleRemoveRow}
                  onEstimateSaved={handleEstimateSaved}
                  onEstimateLoaded={handleEstimateLoaded}
                  onEstimateDeleted={handleEstimateDeleted}
                  onEstimateClosed={handleEstimateClosed}
                  onNavigateToPricing={() => setPage('admin-pricing')}
                />
              </>
            )}
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
