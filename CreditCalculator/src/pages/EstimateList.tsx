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
import { Add24Regular, Delete24Regular, Calculator24Regular, Edit24Regular } from '@fluentui/react-icons';
import { Gbb_calculatorestimatesService } from '../generated/services/Gbb_calculatorestimatesService';
import type { Gbb_calculatorestimates } from '../generated/models/Gbb_calculatorestimatesModel';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalXXL,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
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
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalXXXL,
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

interface EstimateListProps {
  onOpenEstimate: (estimateId: string) => void;
}

export const EstimateList: React.FC<EstimateListProps> = ({ onOpenEstimate }) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<Gbb_calculatorestimates[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrowth, setNewGrowth] = useState(10);
  const [newYears, setNewYears] = useState(3);

  const loadEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Gbb_calculatorestimatesService.getAll({
        filter: 'statecode eq 0',
        orderBy: ['modifiedon desc'],
      });
      setEstimates(result.data ?? []);
    } catch (err) {
      console.error('Failed to load estimates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstimates();
  }, [loadEstimates]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const result = await Gbb_calculatorestimatesService.create({
        gbb_name: newName.trim(),
        gbb_growth: newGrowth,
        gbb_years: newYears,
        statecode: 0,
      } as any);
      const newId = result.data?.gbb_calculatorestimateid;
      setCreateDialogOpen(false);
      setNewName('');
      setNewGrowth(10);
      setNewYears(3);
      if (newId) {
        onOpenEstimate(newId);
      } else {
        await loadEstimates();
      }
    } catch (err) {
      console.error('Failed to create estimate:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIndex === null) return;
    const est = estimates[selectedIndex];
    setSaving(true);
    try {
      await Gbb_calculatorestimatesService.delete(est.gbb_calculatorestimateid);
      setSelectedIndex(null);
      await loadEstimates();
    } catch (err) {
      console.error('Failed to delete estimate:', err);
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
    <div>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
          <Calculator24Regular />
          <Text className={styles.title}>Estimates</Text>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => setCreateDialogOpen(true)}>
          New Estimate
        </Button>
        <Button
          appearance="secondary"
          icon={<Edit24Regular />}
          onClick={() => selectedIndex !== null && onOpenEstimate(estimates[selectedIndex].gbb_calculatorestimateid)}
          disabled={selectedIndex === null}
        >
          Edit
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXXL }}>
          <Spinner size="large" label="Loading estimates..." />
        </div>
      ) : estimates.length === 0 ? (
        <div className={styles.emptyState}>
          <Calculator24Regular style={{ fontSize: '48px', color: tokens.colorNeutralForeground3 }} />
          <Text size={400} weight="semibold">No estimates yet</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Create a new estimate to get started with credit calculations across products.
          </Text>
          <Button appearance="primary" icon={<Add24Regular />} onClick={() => setCreateDialogOpen(true)}>
            Create Your First Estimate
          </Button>
        </div>
      ) : (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <Text className={styles.listHeaderCell}>Name</Text>
            <Text className={styles.listHeaderCell}>Growth Rate</Text>
            <Text className={styles.listHeaderCell}>Projection Years</Text>
            <Text className={styles.listHeaderCell}>Modified</Text>
          </div>
          {estimates.map((est, idx) => (
            <div
              key={est.gbb_calculatorestimateid}
              className={idx === selectedIndex ? styles.listRowSelected : styles.listRow}
              onClick={() => setSelectedIndex(idx)}
              onDoubleClick={() => onOpenEstimate(est.gbb_calculatorestimateid)}
            >
              <Text className={styles.listCell} weight="semibold">{est.gbb_name}</Text>
              <Text className={styles.listCell}>{est.gbb_growth != null ? `${est.gbb_growth}%` : '—'}</Text>
              <Text className={styles.listCell}>{est.gbb_years != null ? `${est.gbb_years} years` : '—'}</Text>
              <Text className={styles.listCell}>{formatDate(est.modifiedon)}</Text>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(_, data) => setCreateDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Estimate</DialogTitle>
            <DialogContent>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Name *</Text>
                <Input
                  value={newName}
                  onChange={(_, data) => setNewName(data.value)}
                  placeholder="e.g. FY26 Enterprise Rollout"
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Annual Growth Rate (%)</Text>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={String(newGrowth)}
                  onChange={(_, data) => setNewGrowth(Number(data.value) || 0)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Projection Years</Text>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={String(newYears)}
                  onChange={(_, data) => setNewYears(Number(data.value) || 1)}
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
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Text>
                Are you sure you want to delete &quot;{selectedIndex !== null ? estimates[selectedIndex]?.gbb_name : ''}&quot;?
                This will also remove all associated product estimates. This action cannot be undone.
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
