import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  Option,
  Spinner,
  Text,
  makeStyles,
  tokens,
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
  ArrowDownload24Regular,
  ArrowUpload24Regular,
  ChevronRight20Regular,
  Money24Regular,
  TableEdit24Regular,
  List24Regular,
} from '@fluentui/react-icons';
import { Gbb_calculatorpricingsService } from '../generated/services/Gbb_calculatorpricingsService';
import type { Gbb_calculatorpricings, Gbb_calculatorpricingsgbb_billing } from '../generated/models/Gbb_calculatorpricingsModel';
import { Gbb_calculatorpricingsgbb_billing as BillingLabels } from '../generated/models/Gbb_calculatorpricingsModel';

interface AdminPricingProps {
  onBack: () => void;
}

type PricingFormData = {
  gbb_pricinggroup: string;
  gbb_name: string;
  gbb_tier: string;
  gbb_credits: number;
  gbb_costperunit: number;
  gbb_billing: Gbb_calculatorpricingsgbb_billing;
};

const BILLING_OPTIONS: { key: Gbb_calculatorpricingsgbb_billing; label: string }[] = [
  { key: 803430000, label: 'Monthly' },
  { key: 803430001, label: 'Yearly' },
];

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
    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  listHeaderCell: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  listRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  listRowSelected: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    backgroundColor: tokens.colorBrandBackground2,
  },
  listCell: {
    fontSize: tokens.fontSizeBase300,
    display: 'flex',
    alignItems: 'center',
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
  datasheetRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    alignItems: 'center',
  },
  datasheetRowDirty: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    alignItems: 'center',
    backgroundColor: tokens.colorPaletteYellowBackground1,
  },
  datasheetInput: {
    minWidth: 0,
  },
  toolbarSpacer: {
    flexGrow: 1,
  },
});

const emptyFormData: PricingFormData = {
  gbb_pricinggroup: '',
  gbb_name: '',
  gbb_tier: '',
  gbb_credits: 1000,
  gbb_costperunit: 10,
  gbb_billing: 803430000,
};

export const AdminPricing: React.FC<AdminPricingProps> = ({ onBack }) => {
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<Gbb_calculatorpricings[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState<PricingFormData>({ ...emptyFormData });
  const [editingRecord, setEditingRecord] = useState<Gbb_calculatorpricings | null>(null);
  const [datasheetMode, setDatasheetMode] = useState(false);
  const [datasheetEdits, setDatasheetEdits] = useState<Record<string, Partial<PricingFormData>>>({});
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set());

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Gbb_calculatorpricingsService.getAll({ filter: 'statecode eq 0' });
      setRecords(result.data ?? []);
    } catch (err) {
      console.error('Failed to load pricing records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

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

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return;

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const typeIdx = headers.findIndex((h) => h === 'type' || h === 'pricing group');
      const nameIdx = headers.findIndex((h) => h === 'name');
      const tierIdx = headers.findIndex((h) => h === 'tier');
      const creditsIdx = headers.findIndex((h) => h.includes('credit'));
      const costIdx = headers.findIndex((h) => h.includes('cost'));
      const billingIdx = headers.findIndex((h) => h === 'billing');

      let successCount = 0;
      let failCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length < 2) continue;

        const record = {
          gbb_pricinggroup: typeIdx >= 0 ? cols[typeIdx] : '',
          gbb_name: nameIdx >= 0 ? cols[nameIdx] : '',
          gbb_tier: tierIdx >= 0 ? cols[tierIdx] : undefined,
          gbb_credits: creditsIdx >= 0 ? Number(cols[creditsIdx]) || 0 : 0,
          gbb_costperunit: costIdx >= 0 ? Number(cols[costIdx]) || 0 : 0,
          gbb_billing: billingIdx >= 0 && cols[billingIdx]?.toLowerCase() === 'yearly' ? 803430001 as const : 803430000 as const,
          statecode: 0 as const,
        };
        console.log(`[Import] Row ${i}/${lines.length - 1} - creating:`, record);
        try {
          const result = await Promise.race([
            Gbb_calculatorpricingsService.create(record),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Dataverse request timed out — the Power Apps data client may not be available in local dev mode.')), 10000),
            ),
          ]);
          console.log(`[Import] Row ${i} succeeded:`, result);
          successCount++;
        } catch (rowErr) {
          console.error(`[Import] Row ${i} failed:`, rowErr);
          failCount++;
        }
      }

      await loadRecords();
      console.log(`[Import] Complete: ${successCount} succeeded, ${failCount} failed`);
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

  const handleExportCsv = () => {
    const headers = ['Pricing Group', 'Name', 'Tier', 'Credits Included', 'Cost per Unit', 'Billing'];
    const rows = records.map((r) => [
      r.gbb_pricinggroup,
      r.gbb_name,
      r.gbb_tier ?? '',
      String(r.gbb_credits),
      String(r.gbb_costperunit),
      BillingLabels[r.gbb_billing] ?? '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pricing-data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getDatasheetValue = <K extends keyof PricingFormData>(
    record: Gbb_calculatorpricings,
    field: K,
  ): PricingFormData[K] => {
    const edits = datasheetEdits[record.gbb_calculatorpricingid];
    if (edits && field in edits) return edits[field] as PricingFormData[K];
    if (field === 'gbb_tier') return (record.gbb_tier ?? '') as PricingFormData[K];
    return record[field as keyof Gbb_calculatorpricings] as PricingFormData[K];
  };

  const handleDatasheetChange = (
    id: string,
    field: keyof PricingFormData,
    value: string | number | Gbb_calculatorpricingsgbb_billing,
  ) => {
    setDatasheetEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleDatasheetBlur = async (record: Gbb_calculatorpricings) => {
    const edits = datasheetEdits[record.gbb_calculatorpricingid];
    if (!edits || Object.keys(edits).length === 0) return;

    const changed: Partial<Omit<Gbb_calculatorpricings, 'gbb_calculatorpricingid'>> = {};
    if (edits.gbb_pricinggroup !== undefined && edits.gbb_pricinggroup !== record.gbb_pricinggroup) changed.gbb_pricinggroup = edits.gbb_pricinggroup;
    if (edits.gbb_name !== undefined && edits.gbb_name !== record.gbb_name) changed.gbb_name = edits.gbb_name;
    if (edits.gbb_tier !== undefined && edits.gbb_tier !== (record.gbb_tier ?? '')) changed.gbb_tier = edits.gbb_tier || undefined;
    if (edits.gbb_credits !== undefined && edits.gbb_credits !== record.gbb_credits) changed.gbb_credits = edits.gbb_credits;
    if (edits.gbb_costperunit !== undefined && edits.gbb_costperunit !== record.gbb_costperunit) changed.gbb_costperunit = edits.gbb_costperunit;
    if (edits.gbb_billing !== undefined && edits.gbb_billing !== record.gbb_billing) changed.gbb_billing = edits.gbb_billing;

    if (Object.keys(changed).length === 0) {
      setDatasheetEdits((prev) => {
        const next = { ...prev };
        delete next[record.gbb_calculatorpricingid];
        return next;
      });
      return;
    }

    setSavingRows((prev) => new Set(prev).add(record.gbb_calculatorpricingid));
    try {
      await Gbb_calculatorpricingsService.update(record.gbb_calculatorpricingid, changed);
      setDatasheetEdits((prev) => {
        const next = { ...prev };
        delete next[record.gbb_calculatorpricingid];
        return next;
      });
      await loadRecords();
    } catch (err) {
      console.error('Failed to save row:', err);
    } finally {
      setSavingRows((prev) => {
        const next = new Set(prev);
        next.delete(record.gbb_calculatorpricingid);
        return next;
      });
    }
  };

  const handleNew = () => {
    setDialogForm({ ...emptyFormData });
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedIndex === null) return;
    const rec = records[selectedIndex];
    setDialogForm({
      gbb_pricinggroup: rec.gbb_pricinggroup,
      gbb_name: rec.gbb_name,
      gbb_tier: rec.gbb_tier ?? '',
      gbb_credits: rec.gbb_credits,
      gbb_costperunit: rec.gbb_costperunit,
      gbb_billing: rec.gbb_billing,
    });
    setEditingRecord(rec);
    setDialogOpen(true);
  };

  const handleDeleteClick = () => {
    if (selectedIndex === null) return;
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedIndex === null) return;
    const rec = records[selectedIndex];
    setSaving(true);
    try {
      await Gbb_calculatorpricingsService.delete(rec.gbb_calculatorpricingid);
      setSelectedIndex(null);
      await loadRecords();
    } catch (err) {
      console.error('Failed to delete pricing record:', err);
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDialogSave = async () => {
    setSaving(true);
    try {
      if (editingRecord) {
        await Gbb_calculatorpricingsService.update(editingRecord.gbb_calculatorpricingid, {
          gbb_pricinggroup: dialogForm.gbb_pricinggroup,
          gbb_name: dialogForm.gbb_name,
          gbb_tier: dialogForm.gbb_tier || undefined,
          gbb_credits: dialogForm.gbb_credits,
          gbb_costperunit: dialogForm.gbb_costperunit,
          gbb_billing: dialogForm.gbb_billing,
        });
      } else {
        await Gbb_calculatorpricingsService.create({
          gbb_pricinggroup: dialogForm.gbb_pricinggroup,
          gbb_name: dialogForm.gbb_name,
          gbb_tier: dialogForm.gbb_tier || undefined,
          gbb_credits: dialogForm.gbb_credits,
          gbb_costperunit: dialogForm.gbb_costperunit,
          gbb_billing: dialogForm.gbb_billing,
          statecode: 0,
        });
      }
      setDialogOpen(false);
      await loadRecords();
    } catch (err) {
      console.error('Failed to save pricing record:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack} aria-label="Back" />
        <div className={styles.breadcrumb}>
          <Text className={styles.breadcrumbSegment} onClick={onBack}>Settings</Text>
          <span className={styles.breadcrumbChevron}><ChevronRight20Regular /></span>
          <Money24Regular />
          <Text className={styles.breadcrumbCurrent}>Pricing</Text>
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
        <Button appearance="secondary" icon={<ArrowDownload24Regular />} onClick={handleExportCsv} disabled={records.length === 0}>
          Export CSV
        </Button>
        <Button appearance="secondary" icon={<ArrowUpload24Regular />} onClick={() => fileInputRef.current?.click()} disabled={importing}>
          {importing ? 'Importing...' : 'Import CSV'}
        </Button>
        <span className={styles.toolbarSpacer} />
        <Button
          appearance={datasheetMode ? 'primary' : 'secondary'}
          icon={datasheetMode ? <List24Regular /> : <TableEdit24Regular />}
          onClick={() => { setDatasheetMode((v) => !v); setDatasheetEdits({}); }}
        >
          {datasheetMode ? 'List View' : 'Datasheet'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleImportCsv}
        />
      </div>

      <div className={styles.listContainer}>
        <div className={styles.listHeader}>
          <Text className={styles.listHeaderCell}>Pricing Group</Text>
          <Text className={styles.listHeaderCell}>Name</Text>
          <Text className={styles.listHeaderCell}>Billing</Text>
          <Text className={styles.listHeaderCell}>Tier</Text>
          <Text className={styles.listHeaderCell}>Credits</Text>
          <Text className={styles.listHeaderCell}>Cost per Unit</Text>
        </div>
        {loading ? (
          <div style={{ padding: tokens.spacingVerticalL, textAlign: 'center' }}>
            <Spinner size="small" label="Loading pricing data..." />
          </div>
        ) : datasheetMode ? records.map((record) => {
          const id = record.gbb_calculatorpricingid;
          const isDirty = !!datasheetEdits[id];
          const isSaving = savingRows.has(id);
          return (
            <div key={id} className={isDirty ? styles.datasheetRowDirty : styles.datasheetRow}>
              <Input
                className={styles.datasheetInput}
                size="small"
                value={getDatasheetValue(record, 'gbb_pricinggroup')}
                onChange={(_, d) => handleDatasheetChange(id, 'gbb_pricinggroup', d.value)}
                onBlur={() => handleDatasheetBlur(record)}
                disabled={isSaving}
              />
              <Input
                className={styles.datasheetInput}
                size="small"
                value={getDatasheetValue(record, 'gbb_name')}
                onChange={(_, d) => handleDatasheetChange(id, 'gbb_name', d.value)}
                onBlur={() => handleDatasheetBlur(record)}
                disabled={isSaving}
              />
              <Dropdown
                className={styles.datasheetInput}
                size="small"
                value={BillingLabels[getDatasheetValue(record, 'gbb_billing')] ?? ''}
                selectedOptions={[String(getDatasheetValue(record, 'gbb_billing'))]}
                onOptionSelect={async (_, d) => {
                  const newBilling = Number(d.optionValue) as Gbb_calculatorpricingsgbb_billing;
                  if (newBilling === record.gbb_billing) return;
                  setSavingRows((prev) => new Set(prev).add(id));
                  try {
                    await Gbb_calculatorpricingsService.update(id, { gbb_billing: newBilling });
                    setDatasheetEdits((prev) => {
                      const next = { ...prev };
                      delete next[id];
                      return next;
                    });
                    await loadRecords();
                  } catch (err) {
                    console.error('Failed to save billing:', err);
                  } finally {
                    setSavingRows((prev) => {
                      const next = new Set(prev);
                      next.delete(id);
                      return next;
                    });
                  }
                }}
                disabled={isSaving}
              >
                {BILLING_OPTIONS.map((opt) => (
                  <Option key={opt.key} value={String(opt.key)}>{opt.label}</Option>
                ))}
              </Dropdown>
              <Input
                className={styles.datasheetInput}
                size="small"
                value={getDatasheetValue(record, 'gbb_tier')}
                onChange={(_, d) => handleDatasheetChange(id, 'gbb_tier', d.value)}
                onBlur={() => handleDatasheetBlur(record)}
                disabled={isSaving}
              />
              <Input
                className={styles.datasheetInput}
                size="small"
                type="number"
                value={String(getDatasheetValue(record, 'gbb_credits'))}
                onChange={(_, d) => handleDatasheetChange(id, 'gbb_credits', Number(d.value) || 0)}
                onBlur={() => handleDatasheetBlur(record)}
                disabled={isSaving}
              />
              <Input
                className={styles.datasheetInput}
                size="small"
                type="number"
                step="0.01"
                value={String(getDatasheetValue(record, 'gbb_costperunit'))}
                onChange={(_, d) => handleDatasheetChange(id, 'gbb_costperunit', Number(d.value) || 0)}
                onBlur={() => handleDatasheetBlur(record)}
                disabled={isSaving}
              />
            </div>
          );
        }) : records.map((record, idx) => (
          <div
            key={record.gbb_calculatorpricingid}
            className={idx === selectedIndex ? styles.listRowSelected : styles.listRow}
            onClick={() => setSelectedIndex(idx)}
            onDoubleClick={() => {
              setDialogForm({
                gbb_pricinggroup: record.gbb_pricinggroup,
                gbb_name: record.gbb_name,
                gbb_tier: record.gbb_tier ?? '',
                gbb_credits: record.gbb_credits,
                gbb_costperunit: record.gbb_costperunit,
                gbb_billing: record.gbb_billing,
              });
              setEditingRecord(record);
              setDialogOpen(true);
            }}
          >
            <Text className={styles.listCell}>{record.gbb_pricinggroup}</Text>
            <Text className={styles.listCell}>{record.gbb_name}</Text>
            <Text className={styles.listCell}>{BillingLabels[record.gbb_billing] ?? ''}</Text>
            <Text className={styles.listCell}>{record.gbb_tier ?? ''}</Text>
            <Text className={styles.listCell}>{record.gbb_credits.toLocaleString()}</Text>
            <Text className={styles.listCell}>{record.gbb_costperunit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text>
          </div>
        ))}
      </div>

      {/* Edit / New Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editingRecord ? 'Edit Pricing Model' : 'New Pricing Model'}</DialogTitle>
            <DialogContent>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Pricing Group</Text>
                <Input
                  value={dialogForm.gbb_pricinggroup}
                  onChange={(_, data) => setDialogForm((f) => ({ ...f, gbb_pricinggroup: data.value }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Name</Text>
                <Input
                  value={dialogForm.gbb_name}
                  onChange={(_, data) => setDialogForm((f) => ({ ...f, gbb_name: data.value }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Billing</Text>
                <Dropdown
                  value={BillingLabels[dialogForm.gbb_billing] ?? ''}
                  selectedOptions={[String(dialogForm.gbb_billing)]}
                  onOptionSelect={(_, data) => setDialogForm((f) => ({ ...f, gbb_billing: Number(data.optionValue) as Gbb_calculatorpricingsgbb_billing }))}
                >
                  {BILLING_OPTIONS.map((opt) => (
                    <Option key={opt.key} value={String(opt.key)}>{opt.label}</Option>
                  ))}
                </Dropdown>
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Tier</Text>
                <Input
                  value={dialogForm.gbb_tier}
                  onChange={(_, data) => setDialogForm((f) => ({ ...f, gbb_tier: data.value }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Credits Included</Text>
                <Input
                  type="number"
                  min={1}
                  value={String(dialogForm.gbb_credits)}
                  onChange={(_, data) => setDialogForm((f) => ({ ...f, gbb_credits: Number(data.value) || 1 }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Cost per Unit ($)</Text>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={String(dialogForm.gbb_costperunit)}
                  onChange={(_, data) => setDialogForm((f) => ({ ...f, gbb_costperunit: Number(data.value) || 0 }))}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDialogSave} disabled={saving}>
                {saving ? 'Saving...' : editingRecord ? 'Save' : 'Create'}
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
                Are you sure you want to delete &quot;{selectedIndex !== null ? records[selectedIndex]?.gbb_name : ''}&quot;?
                This action cannot be undone.
              </Text>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDeleteConfirm} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
