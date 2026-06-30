import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Label,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { SaveCopy24Regular } from '@fluentui/react-icons';
import type { EstimateRow } from '../types';
import { Gbb_calculatorproductestimatesService } from '../generated/services/Gbb_calculatorproductestimatesService';
import { Gbb_calculatorestimatelinesService } from '../generated/services/Gbb_calculatorestimatelinesService';
import { Gbb_calculatorpersonacomplexitiesService } from '../generated/services/Gbb_calculatorpersonacomplexitiesService';

const useStyles = makeStyles({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalM,
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  success: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

interface SaveEstimateDialogProps {
  rows: EstimateRow[];
  productId: string;
  productName: string;
  workingDaysPerMonth: number;
  onSaved: (estimateId: string, estimateName: string) => void;
}

const COMPLEXITY_KEY_TO_CHOICE: Record<string, number> = {
  low: 803430000,
  medium: 803430001,
  high: 803430002,
  veryHigh: 803430003,
};

export const SaveEstimateDialog: React.FC<SaveEstimateDialogProps> = ({
  rows,
  productId,
  productName,
  workingDaysPerMonth,
  onSaved,
}) => {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [estimateName, setEstimateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!estimateName.trim()) {
      setError('Estimate name is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Create the product estimate header record
      const estimateResult = await Gbb_calculatorproductestimatesService.create({
        gbb_name: estimateName.trim(),
        "gbb_Product@odata.bind": `/gbb_calculatorproducts(${productId})`,
        gbb_workingdays: workingDaysPerMonth,
        statecode: 0,
      } as any);

      const estimateId = estimateResult.data?.gbb_calculatorproductestimateid;
      if (!estimateId) {
        throw new Error('Failed to create estimate record.');
      }

      // For each row, resolve the complexity record ID and create estimate lines
      for (const row of rows) {
        // Find the matching complexity record for this persona + complexity level
        const complexityChoice = COMPLEXITY_KEY_TO_CHOICE[row.complexityLevel];
        const complexityResult = await Gbb_calculatorpersonacomplexitiesService.getAll({
          filter: `_gbb_persona_value eq '${row.personaId}' and gbb_complexity eq ${complexityChoice} and statecode eq 0`,
        });

        const complexityRecords = complexityResult.data ?? [];
        const complexityId = complexityRecords.length > 0
          ? complexityRecords[0].gbb_calculatorpersonacomplexityid
          : undefined;

        if (!complexityId) {
          console.warn(`No complexity record found for persona ${row.personaId} at level ${row.complexityLevel}`);
          continue;
        }

        await Gbb_calculatorestimatelinesService.create({
          gbb_name: `${estimateName.trim()} - Line`,
          "gbb_Complexity@odata.bind": `/gbb_calculatorpersonacomplexities(${complexityId})`,
          "gbb_ProductEstimate@odata.bind": `/gbb_calculatorproductestimates(${estimateId})`,
          gbb_sessions: row.sessionsPerDay,
          gbb_users: row.userCount,
          gbb_months: row.months,
          statecode: 0,
        } as any);
      }

      setSuccess('Estimate saved successfully!');
      onSaved(estimateId, estimateName.trim());
      setEstimateName('');
      setTimeout(() => {
        setOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Failed to save estimate:', err);
      setError('Failed to save estimate. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (_: unknown, data: { open: boolean }) => {
    setOpen(data.open);
    if (data.open) {
      setEstimateName('');
      setError('');
      setSuccess('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="primary"
          icon={<SaveCopy24Regular />}
          size="small"
          disabled={rows.length === 0}
        >
          Save As
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Save Estimate As</DialogTitle>
          <DialogContent>
            <div className={styles.field}>
              <Label htmlFor="estimate-name" required>
                Estimate Name
              </Label>
              <Input
                id="estimate-name"
                placeholder={`e.g. ${productName} - Q1 Estimate`}
                value={estimateName}
                onChange={(_, data) => setEstimateName(data.value)}
                disabled={saving}
              />
            </div>
            <div className={styles.field}>
              <Label>Product</Label>
              <Input value={productName} disabled readOnly />
            </div>
            <div className={styles.field}>
              <Label>Estimate Lines</Label>
              <Input value={`${rows.length} line(s) will be saved`} disabled readOnly />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" disabled={saving}>
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={handleSave}
              disabled={saving || !estimateName.trim()}
              icon={saving ? <Spinner size="tiny" /> : undefined}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
