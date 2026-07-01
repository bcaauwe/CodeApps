import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Input,
  Option,
  Spinner,
  Switch,
  Text,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add24Regular, ArrowDownload24Regular, ArrowLeft24Regular, ArrowUpload24Regular, ChevronRight20Regular, Delete20Regular, Options24Regular } from '@fluentui/react-icons';
import { Gbb_calculatorsettingsService } from '../generated/services/Gbb_calculatorsettingsService';
import type { Gbb_calculatorsettings } from '../generated/models/Gbb_calculatorsettingsModel';

export interface CalculatorSettingsData {
  [key: string]: unknown;
}

interface SettingsCard {
  key: string;
  label: string;
  description?: string;
  category: string;
  type: 'number' | 'text' | 'boolean';
  value: unknown;
}

interface CalculatorSettingsProps {
  onBack: () => void;
  onSettingsChanged?: (settings: { category: string; items: { key: string; value: unknown }[] }[]) => void;
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function parseConfigToCards(config: string): SettingsCard[] {
  try {
    const parsed = JSON.parse(config);
    if (typeof parsed !== 'object' || parsed === null) {
      return [];
    }

    // Expected format: { "settings": [ { "category": "...", "items": [...] } ] }
    const settingsArray = parsed.settings;
    if (!Array.isArray(settingsArray)) return [];

    const cards: SettingsCard[] = [];
    for (const category of settingsArray as { category?: string; items?: unknown[] }[]) {
      const items = category.items as { key?: string; label?: string; description?: string; type?: string; value?: unknown }[] ?? [];
      for (const item of items) {
        cards.push({
          key: item.key ?? '',
          label: item.label ?? formatLabel(item.key ?? ''),
          description: item.description,
          category: category.category ?? '',
          type: item.type === 'boolean' ? 'boolean' : item.type === 'number' ? 'number' : 'text',
          value: item.value,
        });
      }
    }
    return cards;
  } catch {
    return [];
  }
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
  categorySection: {
    marginBottom: tokens.spacingVerticalXXL,
  },
  categoryHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: tokens.spacingVerticalL,
  },
  categoryHeader: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  card: {
    padding: tokens.spacingVerticalL,
    position: 'relative' as const,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    marginBottom: tokens.spacingVerticalXS,
  },
  cardDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalM,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  inputNumber: {
    width: '120px',
  },
  inputText: {
    width: '250px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXXL,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
  },
  dialogField: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalM,
  },
  dialogLabel: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
});

export const CalculatorSettings: React.FC<CalculatorSettingsProps> = ({ onBack, onSettingsChanged }) => {
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cards, setCards] = useState<SettingsCard[]>([]);
  const [recordId, setRecordId] = useState<string>('');
  const [editedValues, setEditedValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', label: '', description: '', type: 'text' as 'number' | 'text' | 'boolean', category: '' });

  useEffect(() => {
    let cancelled = false;
    Gbb_calculatorsettingsService.getAll({ filter: 'statecode eq 0' }).then((result) => {
      if (cancelled) return;
      const records: Gbb_calculatorsettings[] = result.data ?? [];
      if (records.length === 0) {
        setLoading(false);
        return;
      }
      const firstRecord = records[0];
      setRecordId(firstRecord.gbb_calculatorsettingid);
      const parsed = parseConfigToCards(firstRecord.gbb_configuration ?? '');
      setCards(parsed);

      // Initialize edited values from parsed cards
      const initial: Record<string, unknown> = {};
      for (const card of parsed) {
        initial[card.key] = card.value;
      }
      setEditedValues(initial);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleFieldChange = (key: string, value: unknown) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddSetting = () => {
    if (!newSetting.key.trim()) return;
    const defaultValue = newSetting.type === 'number' ? 0 : newSetting.type === 'boolean' ? false : '';
    const card: SettingsCard = {
      key: newSetting.key.trim(),
      label: newSetting.label.trim() || formatLabel(newSetting.key.trim()),
      description: newSetting.description.trim() || undefined,
      category: newSetting.category.trim() || 'General',
      type: newSetting.type,
      value: defaultValue,
    };
    setCards((prev) => [...prev, card]);
    setEditedValues((prev) => ({ ...prev, [card.key]: defaultValue }));
    setNewSetting({ key: '', label: '', description: '', type: 'text', category: '' });
    setAddDialogOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['Key', 'Label', 'Description', 'Type', 'Category', 'Value'];
    const rows = cards.map((card) => [
      card.key,
      card.label,
      card.description ?? '',
      card.type,
      card.category,
      String(editedValues[card.key] ?? card.value ?? ''),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calculator-settings.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return;

      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') {
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
            } else if (ch === ',') {
              result.push(current.trim());
              current = '';
            } else {
              current += ch;
            }
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const keyIdx = headers.findIndex((h) => h === 'key');
      const labelIdx = headers.findIndex((h) => h === 'label');
      const descIdx = headers.findIndex((h) => h === 'description');
      const typeIdx = headers.findIndex((h) => h === 'type');
      const catIdx = headers.findIndex((h) => h === 'category');
      const valIdx = headers.findIndex((h) => h === 'value');

      const importedCards: SettingsCard[] = [];
      const importedValues: Record<string, unknown> = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length < 2) continue;
        const key = keyIdx >= 0 ? cols[keyIdx] : '';
        if (!key) continue;
        const type = (typeIdx >= 0 ? cols[typeIdx] : 'text') as 'number' | 'text' | 'boolean';
        let value: unknown = valIdx >= 0 ? cols[valIdx] : '';
        if (type === 'number') value = Number(value) || 0;
        if (type === 'boolean') value = value === 'true';
        importedCards.push({
          key,
          label: labelIdx >= 0 ? cols[labelIdx] : formatLabel(key),
          description: descIdx >= 0 && cols[descIdx] ? cols[descIdx] : undefined,
          type,
          category: catIdx >= 0 ? cols[catIdx] : 'General',
          value,
        });
        importedValues[key] = value;
      }
      setCards(importedCards);
      setEditedValues(importedValues);
    } catch (err) {
      console.error('CSV import failed:', err);
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteSetting = (key: string) => {
    setCards((prev) => prev.filter((c) => c.key !== key));
    setEditedValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSave = async () => {
    // Rebuild the configuration JSON in the original format
    // Group cards back by category
    const categoryMap = new Map<string, SettingsCard[]>();
    for (const card of cards) {
      const existing = categoryMap.get(card.category) ?? [];
      existing.push(card);
      categoryMap.set(card.category, existing);
    }
    const config = {
      settings: Array.from(categoryMap.entries()).map(([category, items]) => ({
        category,
        items: items.map((c) => ({
          key: c.key,
          label: c.label,
          description: c.description,
          type: c.type,
          value: editedValues[c.key] ?? c.value,
        })),
      })),
    };
    const configJson = JSON.stringify(config);
    if (recordId) {
      await Gbb_calculatorsettingsService.update(recordId, {
        gbb_configuration: configJson,
      });
    } else {
      const result = await Gbb_calculatorsettingsService.create({
        gbb_name: 'default',
        gbb_configuration: configJson,
        statecode: 0,
      });
      if (result.data) {
        setRecordId(result.data.gbb_calculatorsettingid);
      }
    }
    onSettingsChanged?.(config.settings);
    onBack();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading settings..." />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack} aria-label="Back" />
        <div className={styles.breadcrumb}>
          <Text className={styles.breadcrumbSegment} onClick={onBack}>Settings</Text>
          <span className={styles.breadcrumbChevron}><ChevronRight20Regular /></span>
          <Options24Regular />
          <Text className={styles.breadcrumbCurrent}>Calculator</Text>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => setAddDialogOpen(true)}>
          New
        </Button>
        <Button appearance="secondary" icon={<ArrowDownload24Regular />} onClick={handleExportCsv} disabled={cards.length === 0}>
          Export CSV
        </Button>
        <Button appearance="secondary" icon={<ArrowUpload24Regular />} onClick={() => fileInputRef.current?.click()} disabled={importing}>
          {importing ? 'Importing...' : 'Import CSV'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleImportCsv}
        />
      </div>

      {Array.from(new Set(cards.map((c) => c.category))).map((category) => (
        <div key={category} className={styles.categorySection}>
          <div className={styles.categoryHeaderRow}>
            <Text className={styles.categoryHeader}>{category}</Text>
          </div>
          <div className={styles.cardsGrid}>
            {cards.filter((c) => c.category === category).map((card) => (
              <Card key={card.key} className={styles.card}>
                <div className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>{card.label}</Text>
                  <Button
                    appearance="subtle"
                    icon={<Delete20Regular />}
                    size="small"
                    onClick={() => handleDeleteSetting(card.key)}
                    aria-label={`Delete ${card.label}`}
                  />
                </div>
                {card.description && (
                  <Text className={styles.cardDescription}>{card.description}</Text>
                )}
                <div className={styles.fieldGroup}>
                  {card.type === 'boolean' ? (
                    <Switch
                      checked={Boolean(editedValues[card.key])}
                      onChange={(_, data) => handleFieldChange(card.key, data.checked)}
                    />
                  ) : card.type === 'number' ? (
                    <Input
                      className={styles.inputNumber}
                      type="number"
                      value={String(editedValues[card.key] ?? '')}
                      onChange={(_, data) => {
                        const v = parseFloat(data.value);
                        handleFieldChange(card.key, isNaN(v) ? 0 : v);
                      }}
                    />
                  ) : (
                    <Input
                      className={styles.inputText}
                      value={String(editedValues[card.key] ?? '')}
                      onChange={(_, data) => handleFieldChange(card.key, data.value)}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={addDialogOpen} onOpenChange={(_, data) => setAddDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Setting</DialogTitle>
            <DialogContent>
              <div className={styles.dialogField}>
                <Text className={styles.dialogLabel}>Key *</Text>
                <Input
                  value={newSetting.key}
                  onChange={(_, data) => setNewSetting((p) => ({ ...p, key: data.value }))}
                  placeholder="e.g. workingDaysPerMonth"
                />
              </div>
              <div className={styles.dialogField}>
                <Text className={styles.dialogLabel}>Label</Text>
                <Input
                  value={newSetting.label}
                  onChange={(_, data) => setNewSetting((p) => ({ ...p, label: data.value }))}
                  placeholder="e.g. Working Days per Month"
                />
              </div>
              <div className={styles.dialogField}>
                <Text className={styles.dialogLabel}>Description</Text>
                <Textarea
                  value={newSetting.description}
                  onChange={(_, data) => setNewSetting((p) => ({ ...p, description: data.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className={styles.dialogField}>
                <Text className={styles.dialogLabel}>Type</Text>
                <Dropdown
                  value={newSetting.type}
                  selectedOptions={[newSetting.type]}
                  onOptionSelect={(_, data) => setNewSetting((p) => ({ ...p, type: (data.optionValue as 'number' | 'text' | 'boolean') ?? 'text' }))}
                >
                  <Option value="text">Text</Option>
                  <Option value="number">Number</Option>
                  <Option value="boolean">Boolean</Option>
                </Dropdown>
              </div>
              <div className={styles.dialogField}>
                <Text className={styles.dialogLabel}>Category</Text>
                <Input
                  value={newSetting.category}
                  onChange={(_, data) => setNewSetting((p) => ({ ...p, category: data.value }))}
                  placeholder="e.g. General"
                />
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleAddSetting} disabled={!newSetting.key.trim()}>
                Add
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <div className={styles.footer}>
        <Button appearance="secondary" onClick={onBack}>
          Cancel
        </Button>
        <Button appearance="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
