import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Text,
  Badge,
  Card,
  Divider,
  Input,
  Dropdown,
  Option,
  Button,
  Spinner,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Delete24Regular, ArrowDownload24Regular, Save24Regular, Dismiss24Regular, PersonSwap24Regular, Warning16Regular, Money24Regular } from '@fluentui/react-icons';
import type { Persona, EstimateRow, ComplexityKey } from '../types';
import { iconMap } from '../data/icons';
import { Gbb_calculatorpricingsService } from '../generated/services/Gbb_calculatorpricingsService';
import type { Gbb_calculatorpricings } from '../generated/models/Gbb_calculatorpricingsModel';
import { Gbb_calculatorpricingsgbb_billing as BillingLabels } from '../generated/models/Gbb_calculatorpricingsModel';
import { SaveEstimateDialog } from './SaveEstimateDialog';
import { ComplexityTooltip } from './ComplexityTooltip';
import { LoadEstimateDialog } from './LoadEstimateDialog';
import { Gbb_calculatorproductestimatesService } from '../generated/services/Gbb_calculatorproductestimatesService';
import { Gbb_calculatorestimatelinesService } from '../generated/services/Gbb_calculatorestimatelinesService';
import { Gbb_calculatorpersonacomplexitiesService } from '../generated/services/Gbb_calculatorpersonacomplexitiesService';

const useStyles = makeStyles({
  root: {
    marginTop: tokens.spacingVerticalXXL,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalL,
  },
  card: {
    padding: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase' as const,
  },
  thRight: {
    textAlign: 'right' as const,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase' as const,
  },
  thCenter: {
    textAlign: 'center' as const,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase' as const,
  },
  td: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    verticalAlign: 'middle' as const,
  },
  tdRight: {
    textAlign: 'right' as const,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    verticalAlign: 'middle' as const,
  },
  tdCenter: {
    textAlign: 'center' as const,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    verticalAlign: 'middle' as const,
  },
  narrowInput: {
    width: '90px',
  },
  dropdown: {
    minWidth: '110px',
    marginRight: tokens.spacingHorizontalS,
  },
  grandTotal: {
    marginTop: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalValue: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase600,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: tokens.spacingVerticalXXXL,
    color: tokens.colorNeutralForeground3,
  },
  creditsCell: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  exportRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  procurementCard: {
    padding: tokens.spacingVerticalL,
    marginTop: tokens.spacingVerticalL,
  },
  procurementTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: tokens.spacingVerticalM,
  },
  bestValue: {
    backgroundColor: tokens.colorBrandBackground2,
  },
  personaPickerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  personaPickerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  personaPickerItemSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    border: `2px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
    cursor: 'pointer',
  },
  personaPickerIcon: {
    color: tokens.colorBrandForeground1,
    display: 'flex',
    alignItems: 'center',
  },
  unknownPersona: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

const complexityLabels: Record<ComplexityKey, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  veryHigh: 'Very High',
};

const COMPLEXITY_KEY_TO_CHOICE: Record<string, number> = {
  low: 803430000,
  medium: 803430001,
  high: 803430002,
  veryHigh: 803430003,
};

interface SaveButtonProps {
  rows: EstimateRow[];
  currentEstimateId: string;
  currentEstimateName: string;
  workingDaysPerMonth: number;
  parentEstimateId?: string | null;
}

const SaveButton: React.FC<SaveButtonProps> = ({ rows, currentEstimateId, currentEstimateName, workingDaysPerMonth, parentEstimateId }) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update the estimate name and link to parent calculator estimate
      await Gbb_calculatorproductestimatesService.update(currentEstimateId, {
        gbb_name: currentEstimateName,
        gbb_workingdays: workingDaysPerMonth,
        ...(parentEstimateId ? { "gbb_Estimate@odata.bind": `/gbb_calculatorestimates(${parentEstimateId})` } : {}),
      });

      // Delete existing lines for this estimate
      const existingLines = await Gbb_calculatorestimatelinesService.getAll({
        filter: `_gbb_productestimate_value eq '${currentEstimateId}' and statecode eq 0`,
      });
      for (const line of existingLines.data ?? []) {
        await Gbb_calculatorestimatelinesService.delete(line.gbb_calculatorestimatelineid);
      }

      // Re-create lines from current rows
      for (const row of rows) {
        const complexityChoice = COMPLEXITY_KEY_TO_CHOICE[row.complexityLevel];
        const complexityResult = await Gbb_calculatorpersonacomplexitiesService.getAll({
          filter: `_gbb_persona_value eq '${row.personaId}' and gbb_complexity eq ${complexityChoice} and statecode eq 0`,
        });
        const complexityRecords = complexityResult.data ?? [];
        const complexityId = complexityRecords.length > 0
          ? complexityRecords[0].gbb_calculatorpersonacomplexityid
          : undefined;

        if (!complexityId) continue;

        await Gbb_calculatorestimatelinesService.create({
          "gbb_Complexity@odata.bind": `/gbb_calculatorpersonacomplexities(${complexityId})`,
          "gbb_ProductEstimate@odata.bind": `/gbb_calculatorproductestimates(${currentEstimateId})`,
          gbb_sessions: row.sessionsPerDay,
          gbb_users: row.userCount,
          gbb_months: row.months,
          statecode: 0,
        } as any);
      }
    } catch (err) {
      console.error('Failed to save estimate:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      appearance="primary"
      icon={saving ? <Spinner size="tiny" /> : <Save24Regular />}
      onClick={handleSave}
      disabled={saving || rows.length === 0}
    >
      {saving ? 'Saving...' : 'Save'}
    </Button>
  );
};

interface DeleteEstimateButtonProps {
  currentEstimateId: string;
  onDeleted: () => void;
}

const DeleteEstimateButton: React.FC<DeleteEstimateButtonProps> = ({ currentEstimateId, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete estimate lines first
      const linesResult = await Gbb_calculatorestimatelinesService.getAll({
        filter: `_gbb_productestimate_value eq '${currentEstimateId}' and statecode eq 0`,
      });
      for (const line of linesResult.data ?? []) {
        await Gbb_calculatorestimatelinesService.delete(line.gbb_calculatorestimatelineid);
      }
      // Delete the estimate record
      await Gbb_calculatorproductestimatesService.delete(currentEstimateId);
      onDeleted();
    } catch (err) {
      console.error('Failed to delete estimate:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      appearance="secondary"
      icon={deleting ? <Spinner size="tiny" /> : <Delete24Regular />}
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
};

function formatCredits(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface PersonaPickerDialogProps {
  open: boolean;
  personas: Persona[];
  onSelect: (personaId: string) => void;
  onClose: () => void;
}

const PersonaPickerDialog: React.FC<PersonaPickerDialogProps> = ({ open, personas, onSelect, onClose }) => {
  const styles = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setSelectedId(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Select Persona</DialogTitle>
          <DialogContent>
            {personas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
                <Text style={{ color: tokens.colorNeutralForeground3 }}>No personas available for this product.</Text>
              </div>
            ) : (
              <div className={styles.personaPickerList}>
                {personas.map((p) => (
                  <div
                    key={p.id}
                    className={selectedId === p.id ? styles.personaPickerItemSelected : styles.personaPickerItem}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span className={styles.personaPickerIcon}>
                      {iconMap[p.icon] ?? iconMap['Person']}
                    </span>
                    <div>
                      <Text weight="semibold">{p.name}</Text>
                      {p.bullets.length > 0 && (
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>
                          {p.bullets[0]}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Cancel</Button>
            <Button
              appearance="primary"
              disabled={!selectedId}
              onClick={() => { if (selectedId) onSelect(selectedId); }}
            >
              Select
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

interface EstimateTableProps {
  rows: EstimateRow[];
  personas: Persona[];
  workingDaysPerMonth: number;
  toolName: string;
  productId: string;
  complexityTooltip?: string;
  currentEstimateId: string | null;
  currentEstimateName: string;
  parentEstimateId?: string | null;
  onUpdateRow: (rowId: string, field: keyof Pick<EstimateRow, 'personaId' | 'complexityLevel' | 'userCount' | 'sessionsPerDay' | 'months'>, value: string | number) => void;
  onRemoveRow: (rowId: string) => void;
  onEstimateSaved: (estimateId: string, estimateName: string) => void;
  onEstimateLoaded: (estimateId: string, estimateName: string, rows: EstimateRow[]) => void;
  onEstimateDeleted: () => void;
  onEstimateClosed: () => void;
  onNavigateToPricing?: () => void;
}

export const EstimateTable: React.FC<EstimateTableProps> = ({
  rows,
  personas,
  workingDaysPerMonth,
  toolName,
  productId,
  complexityTooltip,
  currentEstimateId,
  currentEstimateName,
  parentEstimateId,
  onUpdateRow,
  onRemoveRow,
  onEstimateSaved,
  onEstimateLoaded,
  onEstimateDeleted,
  onEstimateClosed,
  onNavigateToPricing,
}) => {
  const styles = useStyles();
  const [pricingRecords, setPricingRecords] = useState<Gbb_calculatorpricings[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [personaPickerRowId, setPersonaPickerRowId] = useState<string | null>(null);

  const loadPricing = useCallback(async () => {
    setPricingLoading(true);
    try {
      const result = await Gbb_calculatorpricingsService.getAll({ filter: 'statecode eq 0' });
      setPricingRecords(result.data ?? []);
    } catch (err) {
      console.error('Failed to load pricing records:', err);
    } finally {
      setPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const getPersona = (personaId: string) => personas.find((p) => p.id === personaId);

  const calcCreditsRange = (row: EstimateRow): { low: number; high: number } => {
    const persona = getPersona(row.personaId);
    if (!persona) return { low: 0, high: 0 };
    const level = persona.complexity[row.complexityLevel];
    if (!level) return { low: 0, high: 0 };
    const base = row.userCount * row.sessionsPerDay * workingDaysPerMonth;
    return {
      low: base * level.creditsPerSessionMin,
      high: base * level.creditsPerSessionMax,
    };
  };

  const grandTotalLow = rows.reduce((sum, row) => sum + calcCreditsRange(row).low, 0);
  const grandTotalHigh = rows.reduce((sum, row) => sum + calcCreditsRange(row).high, 0);
  const grandTotalYearlyLow = rows.reduce((sum, row) => sum + calcCreditsRange(row).low * row.months, 0);
  const grandTotalYearlyHigh = rows.reduce((sum, row) => sum + calcCreditsRange(row).high * row.months, 0);
  const totalUsers = rows.reduce((sum, row) => sum + row.userCount, 0);

  // Compute procurement options reactively whenever rows/pricing/personas change
  const procurementOptions = useMemo(() => {
    if (grandTotalHigh <= 0 || pricingRecords.length === 0) return [];

    const groupedRecords = new Map<string, Gbb_calculatorpricings[]>();
    for (const rec of pricingRecords) {
      const group = rec.gbb_pricinggroup;
      const existing = groupedRecords.get(group) ?? [];
      existing.push(rec);
      groupedRecords.set(group, existing);
    }

    type ProcurementOption = { rec: Gbb_calculatorpricings; qty: number }[];
    const results: { group: string; options: ProcurementOption }[] = [];

    for (const [group, tiers] of groupedRecords) {
      let bestOption: ProcurementOption = [];
      let bestCost = Infinity;

      // Monthly tiers: multiple units allowed, compare against monthly credits needed
      const monthlyTiers = tiers.filter((rec) => rec.gbb_billing === 803430000);
      for (const rec of monthlyTiers) {
        const monthlyCredits = rec.gbb_credits;
        const qty = monthlyCredits > 0 ? Math.ceil(grandTotalHigh / monthlyCredits) : 1;
        const cost = qty * rec.gbb_costperunit;
        if (cost < bestCost) {
          bestOption = [{ rec, qty }];
          bestCost = cost;
        }
      }

      // Yearly tiers: only 1 unit each, compare against yearly credits needed
      const yearlyTiers = tiers
        .filter((rec) => rec.gbb_billing === 803430001)
        .sort((a, b) => b.gbb_credits - a.gbb_credits);

      if (yearlyTiers.length > 0) {
        const maxSubsetSize = Math.min(yearlyTiers.length, 10);
        for (let mask = 1; mask < (1 << maxSubsetSize); mask++) {
          let totalYearlyCredits = 0;
          let totalCost = 0;
          const combo: ProcurementOption = [];
          for (let bit = 0; bit < maxSubsetSize; bit++) {
            if (mask & (1 << bit)) {
              const tier = yearlyTiers[bit];
              totalYearlyCredits += tier.gbb_credits;
              totalCost += tier.gbb_costperunit;
              combo.push({ rec: tier, qty: 1 });
            }
          }
          if (totalYearlyCredits >= grandTotalYearlyHigh && totalCost < bestCost) {
            bestOption = combo;
            bestCost = totalCost;
          }
        }
      }

      if (bestOption.length > 0) {
        results.push({ group, options: bestOption });
      }
    }

    return results;
  }, [rows, personas, workingDaysPerMonth, pricingRecords, grandTotalHigh, grandTotalYearlyHigh]);

  const exportCsv = () => {
    const headers = ['Persona', 'Complexity', 'Users', 'Sessions/Day', 'Months', 'Cr/Session (Min)', 'Cr/Session (Max)', 'Days/Month', 'Credits/Mo (Min)', 'Credits/Mo (Max)'];
    const csvRows = rows.map((row) => {
      const persona = getPersona(row.personaId);
      const level = persona?.complexity[row.complexityLevel];
      const range = calcCreditsRange(row);
      return [
        persona?.name ?? 'Unknown',
        complexityLabels[row.complexityLevel],
        row.userCount,
        row.sessionsPerDay,
        row.months,
        level?.creditsPerSessionMin ?? 0,
        level?.creditsPerSessionMax ?? 0,
        workingDaysPerMonth,
        range.low,
        range.high,
      ].join(',');
    });
    csvRows.push(['Total', '', totalUsers, '', '', '', '', '', grandTotalLow, grandTotalHigh].join(','));

    // Procurement options
    if (grandTotalHigh > 0 && pricingRecords.length > 0) {
      csvRows.push('');
      csvRows.push('Procurement Options');
      csvRows.push(['Purchase Model', 'Tier', 'Credits Provided', 'Cost/Unit', 'Units', 'Total Credits', 'Cost', 'Billing'].join(','));

      const groupedRecords = new Map<string, Gbb_calculatorpricings[]>();
      for (const rec of pricingRecords) {
        const group = rec.gbb_pricinggroup;
        const existing = groupedRecords.get(group) ?? [];
        existing.push(rec);
        groupedRecords.set(group, existing);
      }

      for (const [, tiers] of groupedRecords) {
        let bestOption: { rec: Gbb_calculatorpricings; qty: number }[] = [];
        let bestCost = Infinity;

        // Monthly tiers: multiple units allowed
        const monthlyTiers = tiers.filter((rec) => rec.gbb_billing === 803430000);
        for (const rec of monthlyTiers) {
          const monthlyCredits = rec.gbb_credits;
          const qty = monthlyCredits > 0 ? Math.ceil(grandTotalHigh / monthlyCredits) : 1;
          const cost = qty * rec.gbb_costperunit;
          if (cost < bestCost) {
            bestOption = [{ rec, qty }];
            bestCost = cost;
          }
        }

        // Yearly tiers: only 1 unit each, compare against yearly credits needed
        const yearlyTiers = tiers
          .filter((rec) => rec.gbb_billing === 803430001)
          .sort((a, b) => b.gbb_credits - a.gbb_credits);

        if (yearlyTiers.length > 0) {
          const maxSubsetSize = Math.min(yearlyTiers.length, 10);
          for (let mask = 1; mask < (1 << maxSubsetSize); mask++) {
            let totalYearlyCredits = 0;
            let totalCost = 0;
            const combo: { rec: Gbb_calculatorpricings; qty: number }[] = [];
            for (let bit = 0; bit < maxSubsetSize; bit++) {
              if (mask & (1 << bit)) {
                const tier = yearlyTiers[bit];
                totalYearlyCredits += tier.gbb_credits;
                totalCost += tier.gbb_costperunit;
                combo.push({ rec: tier, qty: 1 });
              }
            }
            if (totalYearlyCredits >= grandTotalYearlyHigh && totalCost < bestCost) {
              bestOption = combo;
              bestCost = totalCost;
            }
          }
        }

        for (const c of bestOption) {
          const cost = c.qty * c.rec.gbb_costperunit;
          const billingLabel = BillingLabels[c.rec.gbb_billing] ?? '';
          csvRows.push([
            `"${c.rec.gbb_name}"`,
            `"${c.rec.gbb_tier ?? ''}"`,
            c.rec.gbb_credits,
            c.rec.gbb_costperunit,
            c.qty,
            c.qty * c.rec.gbb_credits,
            cost.toFixed(2),
            `"${billingLabel}"`,
          ].join(','));
        }
      }
    }

    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolName.replace(/\s+/g, '_')}_Credit_Estimate.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (rows.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.sectionHeader}>
          <Badge appearance="filled" color="brand" shape="circular" size="large">2</Badge>
          <Text size={400} weight="semibold">ESTIMATE</Text>
        </div>
        <div className={styles.exportRow}>
          <LoadEstimateDialog
            productId={productId}
            parentEstimateId={parentEstimateId}
            onLoad={onEstimateLoaded}
          />
        </div>
        <div className={styles.emptyState}>
          <Text size={300}>Click "Add to Estimate" on a persona above to start building your credit estimate.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.sectionHeader}>
        <Badge appearance="filled" color="brand" shape="circular" size="large">2</Badge>
        <Text size={400} weight="semibold">ESTIMATE</Text>
      </div>
      <div className={styles.exportRow}>
        {currentEstimateId && currentEstimateName && (
          <Text size={300} weight="semibold" style={{ marginRight: 'auto' }}>
            {currentEstimateName}
          </Text>
        )}
        {currentEstimateId && (
          <SaveButton
            rows={rows}
            currentEstimateId={currentEstimateId}
            currentEstimateName={currentEstimateName}
            workingDaysPerMonth={workingDaysPerMonth}
            parentEstimateId={parentEstimateId}
          />
        )}
        <SaveEstimateDialog
          rows={rows}
          productId={productId}
          productName={toolName}
          workingDaysPerMonth={workingDaysPerMonth}
          parentEstimateId={parentEstimateId}
          onSaved={onEstimateSaved}
        />
        {currentEstimateId && (
          <DeleteEstimateButton
            currentEstimateId={currentEstimateId}
            onDeleted={onEstimateDeleted}
          />
        )}
        <Button
          appearance="secondary"
          icon={<Dismiss24Regular />}
          onClick={onEstimateClosed}
        >
          Close
        </Button>
      </div>
      <Card className={styles.card}>
        <Text weight="semibold" size={400}>
          {toolName} — Monthly Credit Estimate
        </Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          Based on {workingDaysPerMonth} working days per month
        </Text>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Persona</th>
              <th className={styles.thCenter}>Complexity <ComplexityTooltip key={productId} tooltipJson={complexityTooltip} /></th>
              <th className={styles.thCenter}>Users</th>
              <th className={styles.thCenter}>Sessions/Day</th>
              <th className={styles.thCenter}>Months</th>
              <th className={styles.thRight}>Credits/Mo</th>
              <th className={styles.thCenter}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const range = calcCreditsRange(row);
              const persona = getPersona(row.personaId);
              const isUnknown = !persona;
              return (
                <tr key={row.id}>
                  <td className={styles.td}>
                    {isUnknown ? (
                      <div className={styles.unknownPersona}>
                        <Text weight="semibold" style={{ color: tokens.colorPaletteRedForeground1 }}>Unknown</Text>
                        <Button
                          appearance="subtle"
                          icon={<PersonSwap24Regular />}
                          size="small"
                          onClick={() => setPersonaPickerRowId(row.id)}
                        >
                          Assign
                        </Button>
                      </div>
                    ) : (
                      <Text weight="semibold">{persona.name}</Text>
                    )}
                  </td>
                  <td className={styles.tdCenter}>
                    <Dropdown
                      className={styles.dropdown}
                      value={complexityLabels[row.complexityLevel]}
                      selectedOptions={[row.complexityLevel]}
                      onOptionSelect={(_, data) => {
                        if (data.optionValue) {
                          onUpdateRow(row.id, 'complexityLevel', data.optionValue);
                        }
                      }}
                      size="small"
                    >
                      {(['low', 'medium', 'high', 'veryHigh'] as const)
                        .filter((key) => persona?.complexity[key])
                        .map((key) => (
                          <Option key={key} value={key}>{complexityLabels[key]}</Option>
                        ))}
                    </Dropdown>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginTop: '2px' }}>
                      {persona?.complexity[row.complexityLevel]?.creditsPerSessionMin ?? 0}–{persona?.complexity[row.complexityLevel]?.creditsPerSessionMax ?? 0} cr/session
                    </Text>
                  </td>
                  <td className={styles.tdCenter}>
                    <Input
                      className={styles.narrowInput}
                      type="number"
                      min={0}
                      value={String(row.userCount)}
                      onChange={(_, data) => {
                        const v = parseInt(data.value, 10);
                        onUpdateRow(row.id, 'userCount', isNaN(v) ? 0 : Math.max(0, v));
                      }}
                      size="small"
                    />
                  </td>
                  <td className={styles.tdCenter}>
                    <Input
                      className={styles.narrowInput}
                      type="number"
                      min={0}
                      step="any"
                      value={String(row.sessionsPerDay)}
                      onChange={(_, data) => {
                        const v = parseFloat(data.value);
                        onUpdateRow(row.id, 'sessionsPerDay', isNaN(v) ? 0 : Math.max(0, v));
                      }}
                      size="small"
                    />
                  </td>
                  <td className={styles.tdCenter}>
                    <Input
                      className={styles.narrowInput}
                      type="number"
                      min={1}
                      max={12}
                      value={String(row.months)}
                      onChange={(_, data) => {
                        const v = parseInt(data.value, 10);
                        onUpdateRow(row.id, 'months', isNaN(v) ? 12 : Math.max(1, Math.min(12, v)));
                      }}
                      size="small"
                    />
                  </td>
                  <td className={styles.tdRight}>
                    <Text className={styles.creditsCell}>{formatCredits(range.low)} – {formatCredits(range.high)}</Text>
                  </td>
                  <td className={styles.tdCenter}>
                    <Button
                      appearance="subtle"
                      icon={<Delete24Regular />}
                      onClick={() => onRemoveRow(row.id)}
                      size="small"
                      aria-label="Remove row"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Divider style={{ margin: `${tokens.spacingVerticalM} 0` }} />
        <div className={styles.grandTotal}>
          <div>
            <Text className={styles.grandTotalValue}>Total Estimated Credits</Text>
            <Text size={200} block style={{ color: tokens.colorNeutralForeground3 }}>
              {totalUsers.toLocaleString()} users across {rows.length} row{rows.length > 1 ? 's' : ''}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text weight="semibold" size={400} block>
              {formatCredits(grandTotalLow)} – {formatCredits(grandTotalHigh)}{' '}
              <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>per month</Text>
            </Text>
            <Text weight="semibold" size={400} block style={{ marginTop: tokens.spacingVerticalXS }}>
              {formatCredits(grandTotalYearlyLow)} – {formatCredits(grandTotalYearlyHigh)}{' '}
              <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>per year</Text>
            </Text>
          </div>
        </div>
      </Card>
      <Text size={200} style={{ color: tokens.colorNeutralForeground3, fontStyle: 'italic' }}>
        Credits = Users × Sessions/Day × Credits/Session (Min–Max) × {workingDaysPerMonth} days/month
      </Text>
      {grandTotalHigh > 0 && (
        <Card className={styles.procurementCard}>
          <Text weight="semibold" size={400}>
            Procurement Options
          </Text>
          {!pricingLoading && pricingRecords.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacingVerticalM, padding: tokens.spacingVerticalL }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, color: tokens.colorPaletteYellowForeground2 }}>
                <Warning16Regular />
                <Text style={{ color: tokens.colorPaletteYellowForeground2, fontWeight: tokens.fontWeightSemibold }}>
                  Configuration Required — No pricing data has been configured.
                </Text>
              </div>
              {onNavigateToPricing && (
                <Button appearance="primary" icon={<Money24Regular />} onClick={onNavigateToPricing}>
                  Go to Pricing
                </Button>
              )}
            </div>
          ) : (
          <>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            Recommended combination to cover {formatCredits(grandTotalLow)} – {formatCredits(grandTotalHigh)} credits/month
          </Text>
          {pricingLoading ? (
            <div style={{ padding: tokens.spacingVerticalL, textAlign: 'center' }}>
              <Spinner size="small" label="Loading pricing data..." />
            </div>
          ) : (
          <table className={styles.procurementTable}>
            <thead>
              <tr>
                <th className={styles.th}>Purchase Model</th>
                <th className={styles.thCenter}>Tier</th>
                <th className={styles.thCenter}>Credits Provided</th>
                <th className={styles.thCenter}>Cost/Unit</th>
                <th className={styles.thCenter}>Units</th>
                <th className={styles.thCenter}>Total Credits</th>
                <th className={styles.thRight}>Cost</th>
                <th className={styles.thCenter}>Billing</th>
              </tr>
            </thead>
            <tbody>
              {procurementOptions.flatMap((r, gIdx) =>
                r.options.map((c, idx) => {
                  const cost = c.qty * c.rec.gbb_costperunit;
                  const billingLabel = BillingLabels[c.rec.gbb_billing] ?? '';
                  return (
                    <tr key={`${gIdx}-${idx}`}>
                      <td className={styles.td}>
                        <Text>{c.rec.gbb_name}</Text>
                      </td>
                      <td className={styles.tdCenter}>{c.rec.gbb_tier ?? ''}</td>
                      <td className={styles.tdCenter}>{c.rec.gbb_credits.toLocaleString()}</td>
                      <td className={styles.tdCenter}>
                        ${c.rec.gbb_costperunit.toLocaleString('en-US', { minimumFractionDigits: c.rec.gbb_costperunit % 1 === 0 ? 0 : 4, maximumFractionDigits: c.rec.gbb_costperunit % 1 === 0 ? 0 : 4 })}
                      </td>
                      <td className={styles.tdCenter}>{c.qty}</td>
                      <td className={styles.tdCenter}>{(c.qty * c.rec.gbb_credits).toLocaleString()}</td>
                      <td className={styles.tdRight}>
                        ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={styles.tdCenter}>{billingLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          )}
          </>
          )}
        </Card>
      )}
      <PersonaPickerDialog
        open={personaPickerRowId !== null}
        personas={personas}
        onSelect={(personaId) => {
          if (personaPickerRowId) {
            onUpdateRow(personaPickerRowId, 'personaId', personaId);
          }
          setPersonaPickerRowId(null);
        }}
        onClose={() => setPersonaPickerRowId(null)}
      />
    </div>
  );
};
