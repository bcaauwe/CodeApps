import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Spinner,
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';
import { FolderOpen24Regular, Delete24Regular } from '@fluentui/react-icons';
import type { EstimateRow, ComplexityKey } from '../types';
import { Gbb_calculatorproductestimatesService } from '../generated/services/Gbb_calculatorproductestimatesService';
import { Gbb_calculatorestimatelinesService } from '../generated/services/Gbb_calculatorestimatelinesService';
import type { Gbb_calculatorproductestimates } from '../generated/models/Gbb_calculatorproductestimatesModel';

const useStyles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  listItemSelected: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    border: `2px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
});

const COMPLEXITY_CHOICE_TO_KEY: Record<number, ComplexityKey> = {
  803430000: 'low',
  803430001: 'medium',
  803430002: 'high',
  803430003: 'veryHigh',
};

interface LoadEstimateDialogProps {
  productId: string;
  onLoad: (estimateId: string, estimateName: string, rows: EstimateRow[]) => void;
}

export const LoadEstimateDialog: React.FC<LoadEstimateDialogProps> = ({
  productId,
  onLoad,
}) => {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [estimates, setEstimates] = useState<Gbb_calculatorproductestimates[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await Gbb_calculatorproductestimatesService.getAll({
        filter: `_gbb_product_value eq '${productId}' and statecode eq 0`,
      });
      setEstimates(result.data ?? []);
    } catch (err) {
      console.error('Failed to load estimates:', err);
      setError('Failed to load estimates.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (open) {
      fetchEstimates();
      setSelectedId(null);
    }
  }, [open, fetchEstimates]);

  const handleLoad = async () => {
    if (!selectedId) return;

    setLoadingEstimate(true);
    setError('');

    try {
      const linesResult = await Gbb_calculatorestimatelinesService.getAll({
        filter: `_gbb_productestimate_value eq '${selectedId}' and statecode eq 0`,
      });

      const lines = linesResult.data ?? [];
      const rows: EstimateRow[] = lines.map((line, idx) => {
        const complexityChoice = line._gbb_complexity_value
          ? undefined // will be resolved below
          : undefined;
        void complexityChoice;

        return {
          id: String(Date.now() + idx),
          personaId: '', // will be resolved from complexity record
          complexityLevel: 'medium' as ComplexityKey,
          userCount: line.gbb_users,
          sessionsPerDay: line.gbb_sessions,
          months: line.gbb_months ?? 12,
          _complexityId: line._gbb_complexity_value,
        } as EstimateRow & { _complexityId?: string };
      });

      // Resolve persona and complexity level from the complexity records
      for (const row of rows as (EstimateRow & { _complexityId?: string })[]) {
        if (row._complexityId) {
          try {
            const complexityResult = await (await import('../generated/services/Gbb_calculatorpersonacomplexitiesService')).Gbb_calculatorpersonacomplexitiesService.get(row._complexityId);
            const rec = complexityResult.data;
            if (rec) {
              row.personaId = rec._gbb_persona_value ?? '';
              const level = rec.gbb_complexity !== undefined ? COMPLEXITY_CHOICE_TO_KEY[rec.gbb_complexity] : undefined;
              if (level) {
                row.complexityLevel = level;
              }
            }
          } catch {
            // skip
          }
        }
        delete row._complexityId;
      }

      const selectedEstimate = estimates.find((e) => e.gbb_calculatorproductestimateid === selectedId);
      onLoad(selectedId, selectedEstimate?.gbb_name ?? '', rows);
      setOpen(false);
    } catch (err) {
      console.error('Failed to load estimate lines:', err);
      setError('Failed to load estimate. Please try again.');
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleOpenChange = (_: unknown, data: { open: boolean }) => {
    setOpen(data.open);
  };

  const handleDelete = async (estimateId: string) => {
    try {
      // Delete estimate lines first
      const linesResult = await Gbb_calculatorestimatelinesService.getAll({
        filter: `_gbb_productestimate_value eq '${estimateId}' and statecode eq 0`,
      });
      for (const line of linesResult.data ?? []) {
        await Gbb_calculatorestimatelinesService.delete(line.gbb_calculatorestimatelineid);
      }
      // Delete the estimate record
      await Gbb_calculatorproductestimatesService.delete(estimateId);
      // Remove from local list
      setEstimates((prev) => prev.filter((e) => e.gbb_calculatorproductestimateid !== estimateId));
      if (selectedId === estimateId) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error('Failed to delete estimate:', err);
      setError('Failed to delete estimate. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="secondary"
          icon={<FolderOpen24Regular />}
          size="small"
        >
          Load
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Load Estimate</DialogTitle>
          <DialogContent>
            {loading ? (
              <div style={{ padding: tokens.spacingVerticalL, textAlign: 'center' }}>
                <Spinner size="small" label="Loading saved estimates..." />
              </div>
            ) : estimates.length === 0 ? (
              <div className={styles.emptyState}>
                <Text>No saved estimates found for this product.</Text>
              </div>
            ) : (
              <div className={styles.list}>
                {estimates.map((est) => (
                  <div
                    key={est.gbb_calculatorproductestimateid}
                    className={selectedId === est.gbb_calculatorproductestimateid ? styles.listItemSelected : styles.listItem}
                    onClick={() => setSelectedId(est.gbb_calculatorproductestimateid)}
                  >
                    <div>
                      <Text weight="semibold">{est.gbb_name}</Text>
                      {est.modifiedon && (
                        <Text className={styles.meta} block>
                          Modified: {new Date(est.modifiedon).toLocaleDateString()}
                        </Text>
                      )}
                    </div>
                    <Button
                      appearance="subtle"
                      icon={<Delete24Regular />}
                      size="small"
                      aria-label="Delete estimate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(est.gbb_calculatorproductestimateid);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            {error && <div className={styles.error}>{error}</div>}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={handleLoad}
              disabled={!selectedId || loadingEstimate}
              icon={loadingEstimate ? <Spinner size="tiny" /> : undefined}
            >
              {loadingEstimate ? 'Loading...' : 'Load'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
