import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  Dropdown,
  Input,
  Link,
  Option,
  Spinner,
  Text,
  Textarea,
  makeStyles,
  tokens,
  Divider,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
  ChevronRight20Regular,
  People24Regular,
  ArrowSortDown20Regular,
  ArrowSortUp20Regular,
  ArrowSort20Regular,
  Filter20Regular,
  ArrowDownload24Regular,
  ArrowUpload24Regular,
} from '@fluentui/react-icons';
import { iconMap, availableIcons } from '../data/icons';
import type { ProductItem } from './ToolSelector';
import { Gbb_calculatorproductsService } from '../generated/services/Gbb_calculatorproductsService';
import { Gbb_calculatorpersonasService } from '../generated/services/Gbb_calculatorpersonasService';
import { Gbb_calculatorpersonacomplexitiesService } from '../generated/services/Gbb_calculatorpersonacomplexitiesService';
import type { Gbb_calculatorpersonas } from '../generated/models/Gbb_calculatorpersonasModel';
import type { Gbb_calculatorpersonacomplexities } from '../generated/models/Gbb_calculatorpersonacomplexitiesModel';
import type { PersonaComplexity } from '../types';
import { ComplexityTooltip } from './ComplexityTooltip';

interface AdminPersonasProps {
  onBack: () => void;
}

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalXXL,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  breadcrumbSegment: {
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground3,
    cursor: 'pointer',
    '&:hover': {
      textDecorationLine: 'underline',
      color: tokens.colorBrandForeground1,
    },
  },
  breadcrumbCurrent: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  breadcrumbChevron: {
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
  },
  toolbar: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalL,
  },
  listContainer: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr 1fr 2fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  listHeaderCell: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
      color: tokens.colorNeutralForeground1,
    },
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr 1fr 2fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  listRow: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr 1fr 2fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  listRowSelected: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr 1fr 2fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    alignItems: 'center',
    backgroundColor: tokens.colorBrandBackground2,
  },
  listCell: {
    fontSize: tokens.fontSizeBase300,
    display: 'flex',
    alignItems: 'center',
  },
  listIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalM,
  },
  fieldLabel: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  requiredIndicator: {
    color: tokens.colorPaletteRedForeground1,
    fontWeight: tokens.fontWeightBold,
    marginLeft: '2px',
  },
  intensityGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
  intensityColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
  },
  intensityLabel: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    textAlign: 'center' as const,
  },
  intensityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  intensityInput: {
    width: '90px',
  },
  intensityError: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase100,
    textAlign: 'center' as const,
    marginTop: tokens.spacingVerticalXXS,
  },
  iconPickerTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    minWidth: '140px',
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground1,
  },
  iconPickerOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  iconPickerPanel: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingVerticalL,
    width: '680px',
    maxWidth: '90vw',
    boxShadow: tokens.shadow64,
  },
  iconPickerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalM,
  },
  iconSearchInput: {
    width: '100%',
    marginBottom: tokens.spacingVerticalS,
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: tokens.spacingHorizontalM,
    maxHeight: '360px',
    overflowY: 'auto' as const,
    padding: tokens.spacingVerticalXS,
  },
  iconGridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    gap: tokens.spacingVerticalXXS,
    color: tokens.colorNeutralForeground1,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  iconGridItemSelected: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    gap: tokens.spacingVerticalXXS,
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  iconName: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center' as const,
    lineHeight: '1.2',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXXL,
  },
  toolbarSpacer: {
    flexGrow: 1,
  },
});

const defaultComplexity: PersonaComplexity = {
  low: { creditsPerSessionMin: 10, creditsPerSessionMax: 20 },
  medium: { creditsPerSessionMin: 25, creditsPerSessionMax: 50 },
  high: { creditsPerSessionMin: 50, creditsPerSessionMax: 80 },
  veryHigh: { creditsPerSessionMin: 80, creditsPerSessionMax: 120 },
};

interface DialogPersona {
  id: string;
  name: string;
  icon: string;
  description: string;
  productId: string;
  complexity: PersonaComplexity;
}

const IconPicker: React.FC<{ value: string; onChange: (icon: string) => void }> = ({
  value,
  onChange,
}) => {
  const styles = useStyles();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = search
    ? availableIcons.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : availableIcons;

  return (
    <>
      <button type="button" className={styles.iconPickerTrigger} onClick={() => setOpen(true)}>
        {iconMap[value]}
        <Text size={200}>{value}</Text>
      </button>
      {open && (
        <div className={styles.iconPickerOverlay} onClick={() => { setOpen(false); setSearch(''); }}>
          <div className={styles.iconPickerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.iconPickerHeader}>
              <Text weight="semibold" size={400}>Select Icon</Text>
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={() => { setOpen(false); setSearch(''); }}
                aria-label="Close"
              />
            </div>
            <Input
              className={styles.iconSearchInput}
              placeholder="Search icons..."
              value={search}
              onChange={(_, data) => setSearch(data.value)}
              size="small"
            />
            <div className={styles.iconGrid}>
              {filtered.map((iconName) => (
                <div
                  key={iconName}
                  className={
                    iconName === value ? styles.iconGridItemSelected : styles.iconGridItem
                  }
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  {iconMap[iconName]}
                  <span className={styles.iconName}>{iconName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const emptyDialogPersona: DialogPersona = {
  id: '',
  name: '',
  icon: 'Person',
  description: '',
  productId: '',
  complexity: { ...defaultComplexity },
};

const COMPLEXITY_MAP: Record<string, number> = {
  low: 803430000,
  medium: 803430001,
  high: 803430002,
  veryHigh: 803430003,
};

const COMPLEXITY_REVERSE: Record<number, keyof PersonaComplexity> = {
  803430000: 'low',
  803430001: 'medium',
  803430002: 'high',
  803430003: 'veryHigh',
};

function buildComplexityFromRecords(records: Gbb_calculatorpersonacomplexities[]): PersonaComplexity {
  const result: PersonaComplexity = { ...defaultComplexity };
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

export const AdminPersonas: React.FC<AdminPersonasProps> = ({ onBack }) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [personas, setPersonas] = useState<Gbb_calculatorpersonas[]>([]);
  const [complexities, setComplexities] = useState<Record<string, Gbb_calculatorpersonacomplexities[]>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogPersona, setDialogPersona] = useState<DialogPersona>({ ...emptyDialogPersona });
  const [editingRecord, setEditingRecord] = useState<Gbb_calculatorpersonas | null>(null);
  const [sortColumn, setSortColumn] = useState<'name' | 'product' | 'description' | null>('product');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<{ name: string; product: string; description: string }>({ name: '', product: '', description: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    const result = await Gbb_calculatorproductsService.getAll({ filter: 'statecode eq 0', orderBy: ['gbb_sortorder asc'] });
    const data = result.data ?? [];
    const items: ProductItem[] = data.map((p) => ({
      id: p.gbb_calculatorproductid,
      name: p.gbb_name,
      sortOrder: p.gbb_sortorder,
    }));
    setProducts(items);
  }, []);

  const loadPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Gbb_calculatorpersonasService.getAll({
        filter: 'statecode eq 0',
      });
      const data = result.data ?? [];
      setPersonas(data);

      // Load complexities for all personas
      const complexityMap: Record<string, Gbb_calculatorpersonacomplexities[]> = {};
      for (const persona of data) {
        const cResult = await Gbb_calculatorpersonacomplexitiesService.getAll({
          filter: `_gbb_persona_value eq '${persona.gbb_calculatorpersonaid}' and statecode eq 0`,
        });
        complexityMap[persona.gbb_calculatorpersonaid] = cResult.data ?? [];
      }
      setComplexities(complexityMap);
    } catch (err) {
      console.error('Failed to load personas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadPersonas();
  }, [loadProducts, loadPersonas]);

  const handleNew = () => {
    setDialogPersona({ ...emptyDialogPersona });
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedIndex === null) return;
    const persona = sortedFilteredPersonas[selectedIndex];
    const personaComplexities = complexities[persona.gbb_calculatorpersonaid] ?? [];
    setDialogPersona({
      id: persona.gbb_calculatorpersonaid,
      name: persona.gbb_name,
      icon: persona.gbb_icon ?? 'Person',
      description: persona.gbb_description ?? '',
      productId: persona._gbb_product_value ?? '',
      complexity: buildComplexityFromRecords(personaComplexities),
    });
    setEditingRecord(persona);
    setDialogOpen(true);
  };

  const handleDeleteClick = () => {
    if (selectedIndex === null) return;
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedIndex === null) return;
    const persona = sortedFilteredPersonas[selectedIndex];
    setSaving(true);
    try {
      // Delete complexities first
      const personaComplexities = complexities[persona.gbb_calculatorpersonaid] ?? [];
      for (const c of personaComplexities) {
        await Gbb_calculatorpersonacomplexitiesService.delete(c.gbb_calculatorpersonacomplexityid);
      }
      await Gbb_calculatorpersonasService.delete(persona.gbb_calculatorpersonaid);
      setSelectedIndex(null);
      setDeleteDialogOpen(false);
      await loadPersonas();
    } catch (err) {
      console.error('Failed to delete persona:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDialogSave = async () => {
    setSaving(true);
    try {
      if (editingRecord) {
        // Update existing persona
        await Gbb_calculatorpersonasService.update(editingRecord.gbb_calculatorpersonaid, {
          gbb_name: dialogPersona.name,
          gbb_icon: dialogPersona.icon,
          gbb_description: dialogPersona.description,
          "gbb_Product@odata.bind": `/gbb_calculatorproducts(${dialogPersona.productId})`,
        });

        // Update complexities
        const existingComplexities = complexities[editingRecord.gbb_calculatorpersonaid] ?? [];
        for (const [level, choiceValue] of Object.entries(COMPLEXITY_MAP)) {
          const key = level as keyof PersonaComplexity;
          const existing = existingComplexities.find((c) => c.gbb_complexity === choiceValue);
          if (existing) {
            await Gbb_calculatorpersonacomplexitiesService.update(existing.gbb_calculatorpersonacomplexityid, {
              gbb_minimum: dialogPersona.complexity[key].creditsPerSessionMin,
              gbb_maximum: dialogPersona.complexity[key].creditsPerSessionMax,
            });
          } else {
            await Gbb_calculatorpersonacomplexitiesService.create({
              gbb_complexity: choiceValue as any,
              gbb_minimum: dialogPersona.complexity[key].creditsPerSessionMin,
              gbb_maximum: dialogPersona.complexity[key].creditsPerSessionMax,
              "gbb_Persona@odata.bind": `/gbb_calculatorpersonas(${editingRecord.gbb_calculatorpersonaid})`,
              statecode: 0,
            });
          }
        }
      } else {
        // Create new persona
        const createResult = await Gbb_calculatorpersonasService.create({
          gbb_name: dialogPersona.name,
          gbb_icon: dialogPersona.icon,
          gbb_description: dialogPersona.description,
          "gbb_Product@odata.bind": `/gbb_calculatorproducts(${dialogPersona.productId})`,
          statecode: 0,
        });

        const newId = createResult.data?.gbb_calculatorpersonaid;
        if (newId) {
          // Create complexity records
          for (const [level, choiceValue] of Object.entries(COMPLEXITY_MAP)) {
            const key = level as keyof PersonaComplexity;
            await Gbb_calculatorpersonacomplexitiesService.create({
              gbb_complexity: choiceValue as any,
              gbb_minimum: dialogPersona.complexity[key].creditsPerSessionMin,
              gbb_maximum: dialogPersona.complexity[key].creditsPerSessionMax,
              "gbb_Persona@odata.bind": `/gbb_calculatorpersonas(${newId})`,
              statecode: 0,
            });
          }
        }
      }

      setDialogOpen(false);
      await loadPersonas();
    } catch (err) {
      console.error('Failed to save persona:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateDialogComplexity = (level: 'low' | 'medium' | 'high' | 'veryHigh', field: 'creditsPerSessionMin' | 'creditsPerSessionMax', value: number) => {
    setDialogPersona((p) => ({
      ...p,
      complexity: {
        ...p.complexity,
        [level]: { ...p.complexity[level], [field]: value },
      },
    }));
  };

  const getProductName = useCallback((productId?: string) => {
    if (!productId) return '';
    return products.find((p) => p.id === productId)?.name ?? '';
  }, [products]);

  const handleSort = (column: 'name' | 'product' | 'description') => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setSelectedIndex(null);
  };

  const sortedFilteredPersonas = useMemo(() => {
    let result = [...personas];

    // Filter
    if (filters.name) {
      const f = filters.name.toLowerCase();
      result = result.filter((p) => p.gbb_name?.toLowerCase().includes(f));
    }
    if (filters.product) {
      const f = filters.product.toLowerCase();
      result = result.filter((p) => getProductName(p._gbb_product_value).toLowerCase().includes(f));
    }
    if (filters.description) {
      const f = filters.description.toLowerCase();
      result = result.filter((p) => (p.gbb_description ?? '').toLowerCase().includes(f));
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal = '';
        let bVal = '';
        switch (sortColumn) {
          case 'name':
            aVal = a.gbb_name?.toLowerCase() ?? '';
            bVal = b.gbb_name?.toLowerCase() ?? '';
            break;
          case 'product':
            aVal = getProductName(a._gbb_product_value).toLowerCase();
            bVal = getProductName(b._gbb_product_value).toLowerCase();
            break;
          case 'description':
            aVal = (a.gbb_description ?? '').toLowerCase();
            bVal = (b.gbb_description ?? '').toLowerCase();
            break;
        }
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [personas, filters, sortColumn, sortDirection, getProductName]);

  const getSortIcon = (column: 'name' | 'product' | 'description') => {
    if (sortColumn !== column) return <ArrowSort20Regular />;
    return sortDirection === 'asc' ? <ArrowSortUp20Regular /> : <ArrowSortDown20Regular />;
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'Product', 'Icon', 'Description', 'Low Min', 'Low Max', 'Medium Min', 'Medium Max', 'High Min', 'High Max', 'Very High Min', 'Very High Max'];
    const rows = personas.map((p) => {
      const c = buildComplexityFromRecords(complexities[p.gbb_calculatorpersonaid] ?? []);
      return [
        p.gbb_name,
        getProductName(p._gbb_product_value),
        p.gbb_icon ?? 'Person',
        p.gbb_description ?? '',
        String(c.low.creditsPerSessionMin),
        String(c.low.creditsPerSessionMax),
        String(c.medium.creditsPerSessionMin),
        String(c.medium.creditsPerSessionMax),
        String(c.high.creditsPerSessionMin),
        String(c.high.creditsPerSessionMax),
        String(c.veryHigh.creditsPerSessionMin),
        String(c.veryHigh.creditsPerSessionMax),
      ];
    });
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personas.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();

      // Parse CSV properly handling multi-line quoted fields
      const parseCsvText = (input: string, delim: string): string[][] => {
        const rows: string[][] = [];
        let current = '';
        let inQuotes = false;
        const fields: string[] = [];
        for (let i = 0; i < input.length; i++) {
          const ch = input[i];
          if (inQuotes) {
            if (ch === '"' && input[i + 1] === '"') {
              current += '"';
              i++;
            } else if (ch === '"') {
              inQuotes = false;
            } else {
              current += ch;
            }
          } else {
            if (ch === '"') {
              inQuotes = true;
            } else if (ch === delim) {
              fields.push(current.trim());
              current = '';
            } else if (ch === '\r' || ch === '\n') {
              if (ch === '\r' && input[i + 1] === '\n') i++;
              fields.push(current.trim());
              current = '';
              if (fields.some((f) => f.length > 0)) {
                rows.push([...fields]);
              }
              fields.length = 0;
            } else {
              current += ch;
            }
          }
        }
        fields.push(current.trim());
        if (fields.some((f) => f.length > 0)) {
          rows.push(fields);
        }
        return rows;
      };

      // Auto-detect delimiter
      const commaRows = parseCsvText(text, ',');
      const tabRows = parseCsvText(text, '\t');
      const commaHeaderLen = commaRows[0]?.length ?? 0;
      const tabHeaderLen = tabRows[0]?.length ?? 0;
      let parsedRows: string[][];
      if (tabHeaderLen > commaHeaderLen) {
        parsedRows = tabRows;
      } else {
        parsedRows = commaRows;
      }

      if (parsedRows.length < 2) return;

      const headers = parsedRows[0].map((h) => h.toLowerCase().replace(/\s+/g, ' ').trim());
      const nameIdx = headers.findIndex((h) => h === 'name');
      const productIdx = headers.findIndex((h) => h === 'product');
      const iconIdx = headers.findIndex((h) => h === 'icon');
      const descIdx = headers.findIndex((h) => h.startsWith('descri'));
      const lowMinIdx = headers.findIndex((h) => h === 'low min');
      const lowMaxIdx = headers.findIndex((h) => h === 'low max');
      const medMinIdx = headers.findIndex((h) => h === 'medium min');
      const medMaxIdx = headers.findIndex((h) => h === 'medium max');
      const highMinIdx = headers.findIndex((h) => h === 'high min');
      const highMaxIdx = headers.findIndex((h) => h === 'high max');
      const vhMinIdx = headers.findIndex((h) => h === 'very high min');
      const vhMaxIdx = headers.findIndex((h) => h === 'very high max');

      let successCount = 0;
      let failCount = 0;
      for (let i = 1; i < parsedRows.length; i++) {
        const cols = parsedRows[i];
        if (cols.length < 2) continue;

        const personaName = nameIdx >= 0 ? cols[nameIdx] : '';
        const productName = productIdx >= 0 ? cols[productIdx] : '';
        const icon = iconIdx >= 0 ? cols[iconIdx] : 'Person';
        const description = descIdx >= 0 ? cols[descIdx] : '';

        // Resolve product ID from name
        const product = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        if (!product) {
          failCount++;
          continue;
        }

        try {
          const createResult = await Gbb_calculatorpersonasService.create({
            gbb_name: personaName,
            gbb_icon: icon,
            gbb_description: description,
            "gbb_Product@odata.bind": `/gbb_calculatorproducts(${product.id})`,
            statecode: 0,
          });

          const newId = createResult.data?.gbb_calculatorpersonaid;
          if (newId) {
            const complexityData: { level: string; choiceValue: number; min: number; max: number }[] = [
              { level: 'low', choiceValue: COMPLEXITY_MAP.low, min: lowMinIdx >= 0 ? Number(cols[lowMinIdx]) || 0 : 0, max: lowMaxIdx >= 0 ? Number(cols[lowMaxIdx]) || 0 : 0 },
              { level: 'medium', choiceValue: COMPLEXITY_MAP.medium, min: medMinIdx >= 0 ? Number(cols[medMinIdx]) || 0 : 0, max: medMaxIdx >= 0 ? Number(cols[medMaxIdx]) || 0 : 0 },
              { level: 'high', choiceValue: COMPLEXITY_MAP.high, min: highMinIdx >= 0 ? Number(cols[highMinIdx]) || 0 : 0, max: highMaxIdx >= 0 ? Number(cols[highMaxIdx]) || 0 : 0 },
              { level: 'veryHigh', choiceValue: COMPLEXITY_MAP.veryHigh, min: vhMinIdx >= 0 ? Number(cols[vhMinIdx]) || 0 : 0, max: vhMaxIdx >= 0 ? Number(cols[vhMaxIdx]) || 0 : 0 },
            ];
            for (const cd of complexityData) {
              await Gbb_calculatorpersonacomplexitiesService.create({
                gbb_complexity: cd.choiceValue as any,
                gbb_minimum: cd.min,
                gbb_maximum: cd.max,
                "gbb_Persona@odata.bind": `/gbb_calculatorpersonas(${newId})`,
                statecode: 0 as const,
              });
            }
          }
          successCount++;
        } catch (rowErr) {
          console.error(`[Import] Row ${i} failed:`, rowErr);
          failCount++;
        }
      }

      await loadPersonas();
      if (failCount > 0) {
        alert(`Import complete: ${successCount} succeeded, ${failCount} failed. Check console for details.`);
      }
    } catch (err) {
      console.error('CSV import failed:', err);
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack} aria-label="Back" />
        <div className={styles.breadcrumb}>
          <Text className={styles.breadcrumbSegment} onClick={onBack}>Settings</Text>
          <span className={styles.breadcrumbChevron}><ChevronRight20Regular /></span>
          <People24Regular />
          <Text className={styles.breadcrumbCurrent}>Personas</Text>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Button appearance="primary" icon={<Add24Regular />} onClick={handleNew}>
          New
        </Button>
        <Button appearance="secondary" icon={<Edit24Regular />} onClick={handleEdit} disabled={selectedIndex === null}>
          Edit
        </Button>
        <Button appearance="secondary" icon={<Delete24Regular />} onClick={handleDeleteClick} disabled={selectedIndex === null}>
          Delete
        </Button>
        <Button appearance="secondary" icon={<ArrowDownload24Regular />} onClick={handleExportCsv} disabled={personas.length === 0}>
          Export CSV
        </Button>
        <Button appearance="secondary" icon={<ArrowUpload24Regular />} onClick={() => fileInputRef.current?.click()} disabled={importing}>
          {importing ? 'Importing...' : 'Import CSV'}
        </Button>
        <span className={styles.toolbarSpacer} />
        <Button
          appearance={showFilters ? 'primary' : 'secondary'}
          icon={<Filter20Regular />}
          onClick={() => {
            setShowFilters((v) => !v);
            if (showFilters) setFilters({ name: '', product: '', description: '' });
          }}
        >
          Filter
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleImportCsv}
        />
      </div>

      <Text size={200} style={{ display: 'block', marginBottom: tokens.spacingVerticalM, color: tokens.colorNeutralForeground3 }}>
        Need help estimating complexity levels? Use the{' '}
        <Link href="https://microsoft.github.io/copilot-studio-estimator/" target="_blank" rel="noopener noreferrer" inline>
          Copilot Credit Estimator
        </Link>{' '}
        for guidance.
      </Text>

      {loading ? (
        <Spinner label="Loading personas..." />
      ) : (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <span />
            <Text className={styles.listHeaderCell} onClick={() => handleSort('name')}>
              Name {getSortIcon('name')}
            </Text>
            <Text className={styles.listHeaderCell} onClick={() => handleSort('product')}>
              Product {getSortIcon('product')}
            </Text>
            <Text className={styles.listHeaderCell} onClick={() => handleSort('description')}>
              Description {getSortIcon('description')}
            </Text>
          </div>
          {showFilters && (
            <div className={styles.filterRow}>
              <span />
              <Input
                size="small"
                placeholder="Filter name..."
                value={filters.name}
                onChange={(_, data) => { setFilters((f) => ({ ...f, name: data.value })); setSelectedIndex(null); }}
              />
              <Input
                size="small"
                placeholder="Filter product..."
                value={filters.product}
                onChange={(_, data) => { setFilters((f) => ({ ...f, product: data.value })); setSelectedIndex(null); }}
              />
              <Input
                size="small"
                placeholder="Filter description..."
                value={filters.description}
                onChange={(_, data) => { setFilters((f) => ({ ...f, description: data.value })); setSelectedIndex(null); }}
              />
            </div>
          )}
          {sortedFilteredPersonas.map((persona, idx) => (
            <div
              key={persona.gbb_calculatorpersonaid}
              className={idx === selectedIndex ? styles.listRowSelected : styles.listRow}
              onClick={() => setSelectedIndex(idx)}
              onDoubleClick={() => {
                const personaComplexities = complexities[persona.gbb_calculatorpersonaid] ?? [];
                setDialogPersona({
                  id: persona.gbb_calculatorpersonaid,
                  name: persona.gbb_name,
                  icon: persona.gbb_icon ?? 'Person',
                  description: persona.gbb_description ?? '',
                  productId: persona._gbb_product_value ?? '',
                  complexity: buildComplexityFromRecords(personaComplexities),
                });
                setEditingRecord(persona);
                setDialogOpen(true);
              }}
            >
              <span className={styles.listIcon}>{iconMap[persona.gbb_icon ?? 'Person']}</span>
              <Text className={styles.listCell}>{persona.gbb_name}</Text>
              <Text className={styles.listCell}>{getProductName(persona._gbb_product_value)}</Text>
              <Text className={styles.listCell}>{persona.gbb_description ?? ''}</Text>
            </div>
          ))}
        </div>
      )}

      {/* Edit / New Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
        <DialogSurface style={{ maxWidth: '900px', width: '90vw' }}>
          <DialogBody>
            <DialogTitle>{editingRecord ? 'Edit Persona' : 'New Persona'}</DialogTitle>
            <DialogContent>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Name<span className={styles.requiredIndicator}> *</span></Text>
                <Input
                  value={dialogPersona.name}
                  onChange={(_, data) => setDialogPersona((p) => ({ ...p, name: data.value }))}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Product<span className={styles.requiredIndicator}> *</span></Text>
                <Dropdown
                  value={getProductName(dialogPersona.productId)}
                  selectedOptions={dialogPersona.productId ? [dialogPersona.productId] : []}
                  onOptionSelect={(_, data) => setDialogPersona((p) => ({ ...p, productId: data.optionValue ?? '' }))}
                >
                  {products.map((p) => (
                    <Option key={p.id} value={p.id}>{p.name}</Option>
                  ))}
                </Dropdown>
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Icon</Text>
                <IconPicker
                  value={dialogPersona.icon}
                  onChange={(icon) => setDialogPersona((p) => ({ ...p, icon }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Description</Text>
                <Textarea
                  value={dialogPersona.description}
                  rows={3}
                  onChange={(_, data) =>
                    setDialogPersona((p) => ({ ...p, description: data.value }))
                  }
                />
              </div>

              <Divider style={{ margin: `${tokens.spacingVerticalM} 0` }} />

              <Text className={styles.fieldLabel} style={{ marginBottom: tokens.spacingVerticalS, display: 'inline-flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
                Credits per Session (Min – Max)
                <ComplexityTooltip />
              </Text>
              <div className={styles.intensityGrid}>
                {(['low', 'medium', 'high', 'veryHigh'] as const).map((level) => {
                  const min = dialogPersona.complexity[level].creditsPerSessionMin;
                  const max = dialogPersona.complexity[level].creditsPerSessionMax;
                  const hasError = max <= min;
                  return (
                  <div key={level} className={styles.intensityColumn}>
                    <Text className={styles.intensityLabel}>
                      {level === 'veryHigh' ? 'Very High' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                    <div className={styles.intensityRow}>
                      <Input
                        className={styles.intensityInput}
                        type="number"
                        value={String(dialogPersona.complexity[level].creditsPerSessionMin)}
                        onChange={(_, data) =>
                          updateDialogComplexity(level, 'creditsPerSessionMin', Number(data.value) || 0)
                        }
                      />
                      <Text size={200}>–</Text>
                      <Input
                        className={styles.intensityInput}
                        type="number"
                        value={String(dialogPersona.complexity[level].creditsPerSessionMax)}
                        onChange={(_, data) =>
                          updateDialogComplexity(level, 'creditsPerSessionMax', Number(data.value) || 0)
                        }
                      />
                    </div>
                    {hasError && (
                      <Text className={styles.intensityError}>Max must be greater than Min</Text>
                    )}
                  </div>
                  );
                })}
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDialogSave} disabled={saving || !dialogPersona.name.trim() || !dialogPersona.productId || (['low', 'medium', 'high', 'veryHigh'] as const).some((l) => dialogPersona.complexity[l].creditsPerSessionMax <= dialogPersona.complexity[l].creditsPerSessionMin)}>
                {saving ? <Spinner size="tiny" /> : editingRecord ? 'Save' : 'Create'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Text>
                Are you sure you want to delete &quot;{selectedIndex !== null ? sortedFilteredPersonas[selectedIndex]?.gbb_name : ''}&quot;?
                This action cannot be undone.
              </Text>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDeleteConfirm} disabled={saving}>
                {saving ? <Spinner size="tiny" /> : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
