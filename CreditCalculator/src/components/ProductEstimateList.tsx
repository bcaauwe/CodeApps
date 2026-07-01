import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Spinner,
  Text,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular, Edit24Regular, DocumentBulletList24Regular } from '@fluentui/react-icons';
import { Gbb_calculatorproductestimatesService } from '../generated/services/Gbb_calculatorproductestimatesService';
import { Gbb_calculatorestimatelinesService } from '../generated/services/Gbb_calculatorestimatelinesService';
import { Gbb_calculatorpersonacomplexitiesService } from '../generated/services/Gbb_calculatorpersonacomplexitiesService';
import type { Gbb_calculatorproductestimates } from '../generated/models/Gbb_calculatorproductestimatesModel';
import type { EstimateRow, ComplexityKey } from '../types';

const COMPLEXITY_CHOICE_TO_KEY: Record<number, ComplexityKey> = {
  803430000: 'low',
  803430001: 'medium',
  803430002: 'high',
  803430003: 'veryHigh',
};

const useStyles = makeStyles({
  root: {
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalM,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  toolbar: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  listContainer: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
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
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  listRowSelected: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    backgroundColor: tokens.colorBrandBackground2,
  },
  listCell: {
    fontSize: tokens.fontSizeBase300,
    display: 'flex',
    alignItems: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
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
});

interface ProductEstimateListProps {
  productId: string;
  productName: string;
  parentEstimateId: string;
  onEstimateLoaded: (estimateId: string, estimateName: string, rows: EstimateRow[]) => void;
  onNewEstimate: (estimateId: string, estimateName: string) => void;
  onEstimateDeleted: (estimateId: string) => void;
}

export const ProductEstimateList: React.FC<ProductEstimateListProps> = ({
  productId,
  productName,
  parentEstimateId,
  onEstimateLoaded,
  onNewEstimate,
  onEstimateDeleted,
}) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<Gbb_calculatorproductestimates[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [newName, setNewName] = useState('');

  const loadEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Gbb_calculatorproductestimatesService.getAll({
        filter: `_gbb_product_value eq '${productId}' and _gbb_estimate_value eq '${parentEstimateId}' and statecode eq 0`,
        orderBy: ['modifiedon desc'],
      });
      setEstimates(result.data ?? []);
    } catch (err) {
      console.error('Failed to load product estimates:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, parentEstimateId]);

  useEffect(() => {
    loadEstimates();
  }, [loadEstimates]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const result = await Gbb_calculatorproductestimatesService.create({
        gbb_name: newName.trim(),
        "gbb_Product@odata.bind": `/gbb_calculatorproducts(${productId})`,
        "gbb_Estimate@odata.bind": `/gbb_calculatorestimates(${parentEstimateId})`,
        statecode: 0,
      } as any);
      const newId = result.data?.gbb_calculatorproductestimateid;
      setCreateDialogOpen(false);
      setNewName('');
      if (newId) {
        onNewEstimate(newId, newName.trim());
        await loadEstimates();
      }
    } catch (err) {
      console.error('Failed to create product estimate:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (selectedIndex === null) return;
    const est = estimates[selectedIndex];
    setLoadingEstimate(true);
    try {
      const linesResult = await Gbb_calculatorestimatelinesService.getAll({
        filter: `_gbb_productestimate_value eq '${est.gbb_calculatorproductestimateid}' and statecode eq 0`,
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

      onEstimateLoaded(est.gbb_calculatorproductestimateid, est.gbb_name ?? '', rows);
    } catch (err) {
      console.error('Failed to load product estimate:', err);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIndex === null) return;
    const est = estimates[selectedIndex];
    setSaving(true);
    try {
      // Delete estimate lines first
      const linesResult = await Gbb_calculatorestimatelinesService.getAll({
        filter: `_gbb_productestimate_value eq '${est.gbb_calculatorproductestimateid}' and statecode eq 0`,
      });
      for (const line of linesResult.data ?? []) {
        await Gbb_calculatorestimatelinesService.delete(line.gbb_calculatorestimatelineid);
      }
      // Delete the product estimate record
      await Gbb_calculatorproductestimatesService.delete(est.gbb_calculatorproductestimateid);
      onEstimateDeleted(est.gbb_calculatorproductestimateid);
      setSelectedIndex(null);
      await loadEstimates();
    } catch (err) {
      console.error('Failed to delete product estimate:', err);
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
          <DocumentBulletList24Regular />
          <Text className={styles.title}>{productName} Estimates</Text>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => setCreateDialogOpen(true)}>
          New
        </Button>
        <Button
          appearance="secondary"
          icon={loadingEstimate ? <Spinner size="tiny" /> : <Edit24Regular />}
          onClick={handleEdit}
          disabled={selectedIndex === null || loadingEstimate}
        >
          {loadingEstimate ? 'Loading...' : 'Edit'}
        </Button>
        <Button
          appearance="secondary"
          icon={<Delete24Regular />}
          onClick={() => setDeleteDialogOpen(true)}
          disabled={selectedIndex === null}
        >
          Delete
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalL }}>
          <Spinner size="small" label="Loading product estimates..." />
        </div>
      ) : estimates.length === 0 ? (
        <div className={styles.emptyState}>
          <DocumentBulletList24Regular style={{ fontSize: '32px', color: tokens.colorNeutralForeground3 }} />
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            No product estimates yet. Create one to start estimating credits for {productName}.
          </Text>
        </div>
      ) : (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <Text className={styles.listHeaderCell}>Name</Text>
            <Text className={styles.listHeaderCell}>Working Days</Text>
            <Text className={styles.listHeaderCell}>Modified</Text>
          </div>
          {estimates.map((est, idx) => (
            <div
              key={est.gbb_calculatorproductestimateid}
              className={idx === selectedIndex ? styles.listRowSelected : styles.listRow}
              onClick={() => setSelectedIndex(idx)}
              onDoubleClick={() => { setSelectedIndex(idx); handleEdit(); }}
            >
              <Text className={styles.listCell} weight="semibold">{est.gbb_name}</Text>
              <Text className={styles.listCell}>{est.gbb_workingdays != null ? `${est.gbb_workingdays} days` : '—'}</Text>
              <Text className={styles.listCell}>{formatDate(est.modifiedon)}</Text>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(_, data) => setCreateDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Product Estimate</DialogTitle>
            <DialogContent>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Name *</Text>
                <Input
                  value={newName}
                  onChange={(_, data) => setNewName(data.value)}
                  placeholder={`e.g. ${productName} - Phase 1`}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleCreate} disabled={saving || !newName.trim()}>
                {saving ? 'Creating...' : 'Create'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Product Estimate</DialogTitle>
            <DialogContent>
              <Text>
                Are you sure you want to delete &quot;{selectedIndex !== null ? estimates[selectedIndex]?.gbb_name : ''}&quot;?
                This will also delete all associated estimate lines.
              </Text>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
