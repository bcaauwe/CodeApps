import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ArrowLeft24Regular, ArrowDownload24Regular, DataPie24Regular } from '@fluentui/react-icons';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Gbb_calculatorestimatesService } from '../generated/services/Gbb_calculatorestimatesService';
import { Gbb_calculatorproductestimatesService } from '../generated/services/Gbb_calculatorproductestimatesService';
import { Gbb_calculatorestimatelinesService } from '../generated/services/Gbb_calculatorestimatelinesService';
import { Gbb_calculatorpersonacomplexitiesService } from '../generated/services/Gbb_calculatorpersonacomplexitiesService';
import { Gbb_calculatorproductsService } from '../generated/services/Gbb_calculatorproductsService';
import { Gbb_calculatorpricingsService } from '../generated/services/Gbb_calculatorpricingsService';
import type { Gbb_calculatorestimates } from '../generated/models/Gbb_calculatorestimatesModel';
import type { Gbb_calculatorpricings } from '../generated/models/Gbb_calculatorpricingsModel';
import { Gbb_calculatorpricingsgbb_billing as BillingLabels } from '../generated/models/Gbb_calculatorpricingsModel';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalXXL,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
    paddingTop: tokens.spacingVerticalXS,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalXXL,
    marginBottom: tokens.spacingVerticalXXL,
  },
  card: {
    padding: tokens.spacingVerticalL,
  },
  cardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    marginBottom: tokens.spacingVerticalM,
  },
  totalCard: {
    padding: tokens.spacingVerticalXXL,
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalXXL,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  totalItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
  },
  totalValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  totalLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  procurementCard: {
    padding: tokens.spacingVerticalL,
  },
  procurementTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: tokens.spacingVerticalM,
  },
});

const COLORS = [
  '#0078d4', '#00b7c3', '#8764b8', '#e3008c',
  '#107c10', '#ffb900', '#d83b01', '#5c2d91',
];

interface ProductCredits {
  productId: string;
  productName: string;
  minCredits: number;
  maxCredits: number;
  monthlyMin: number;
  monthlyMax: number;
}

interface EstimateSummaryProps {
  estimateId: string;
  onBack: () => void;
  workingDaysPerMonth: number;
  products?: { id: string; name: string; imageUrl?: string }[];
}

export const EstimateSummary: React.FC<EstimateSummaryProps> = ({ estimateId, onBack, workingDaysPerMonth, products: productItems }) => {
  const styles = useStyles();
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState<Gbb_calculatorestimates | null>(null);
  const [productCredits, setProductCredits] = useState<ProductCredits[]>([]);
  const [pricingRecords, setPricingRecords] = useState<Gbb_calculatorpricings[]>([]);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      // Load the estimate record
      const estResult = await Gbb_calculatorestimatesService.get(estimateId);
      const est = estResult.data ?? null;
      setEstimate(est);

      // Load all product estimates linked to this estimate
      const prodEstResult = await Gbb_calculatorproductestimatesService.getAll({
        filter: `_gbb_estimate_value eq '${estimateId}' and statecode eq 0`,
      });
      const productEstimates = prodEstResult.data ?? [];

      // Load all products for name resolution
      const productsResult = await Gbb_calculatorproductsService.getAll({ filter: 'statecode eq 0' });
      const productsMap = new Map((productsResult.data ?? []).map(p => [p.gbb_calculatorproductid, p.gbb_name]));

      // Load pricing records
      const pricingResult = await Gbb_calculatorpricingsService.getAll({ filter: 'statecode eq 0' });
      setPricingRecords(pricingResult.data ?? []);

      // For each product estimate, load lines and compute credits
      const credits: ProductCredits[] = [];

      for (const pe of productEstimates) {
        const linesResult = await Gbb_calculatorestimatelinesService.getAll({
          filter: `_gbb_productestimate_value eq '${pe.gbb_calculatorproductestimateid}' and statecode eq 0`,
        });
        const lines = linesResult.data ?? [];

        let totalMin = 0;
        let totalMax = 0;
        let monthlyMin = 0;
        let monthlyMax = 0;

        for (const line of lines) {
          // Load complexity to get min/max
          if (line._gbb_complexity_value) {
            try {
              const compResult = await Gbb_calculatorpersonacomplexitiesService.get(line._gbb_complexity_value);
              const comp = compResult.data;
              if (comp) {
                const days = (pe.gbb_workingdays ?? workingDaysPerMonth);
                const months = line.gbb_months ?? 12;
                const minMonthly = (comp.gbb_minimum ?? 0) * line.gbb_users * line.gbb_sessions * days;
                const maxMonthly = (comp.gbb_maximum ?? 0) * line.gbb_users * line.gbb_sessions * days;
                monthlyMin += minMonthly;
                monthlyMax += maxMonthly;
                totalMin += minMonthly * months;
                totalMax += maxMonthly * months;
              }
            } catch {
              // skip
            }
          }
        }

        const productName = productsMap.get(pe._gbb_product_value ?? '') ?? pe.gbb_productname ?? 'Unknown';
        if (totalMin > 0 || totalMax > 0) {
          credits.push({
            productId: pe._gbb_product_value ?? '',
            productName,
            minCredits: totalMin,
            maxCredits: totalMax,
            monthlyMin,
            monthlyMax,
          });
        }
      }

      setProductCredits(credits);
    } catch (err) {
      console.error('Failed to load summary:', err);
    } finally {
      setLoading(false);
    }
  }, [estimateId, workingDaysPerMonth]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleExportPdf = useCallback(async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      let yOffset = 0;
      let remainingHeight = imgHeight;

      while (remainingHeight > 0) {
        if (yOffset > 0) pdf.addPage();
        const sourceY = (yOffset / imgHeight) * canvas.height;
        const sliceHeight = Math.min(
          ((pageHeight - margin * 2) / imgHeight) * canvas.height,
          canvas.height - sourceY
        );
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const sliceData = sliceCanvas.toDataURL('image/png');
          const sliceImgHeight = (sliceHeight * contentWidth) / canvas.width;
          pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceImgHeight);
        }
        yOffset += pageHeight - margin * 2;
        remainingHeight -= pageHeight - margin * 2;
      }

      const fileName = `${estimate?.gbb_name ?? 'Estimate'} - Summary.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [estimate]);

  const totalMin = productCredits.reduce((sum, p) => sum + p.minCredits, 0);
  const totalMax = productCredits.reduce((sum, p) => sum + p.maxCredits, 0);
  const totalMonthlyMax = productCredits.reduce((sum, p) => sum + p.monthlyMax, 0);
  const growthRate = (estimate?.gbb_growth ?? 10) / 100;
  const projectionYears = estimate?.gbb_years ?? 3;

  // Compute procurement options for year 1
  const procurementOptions = useMemo(() => {
    if (totalMax <= 0 || pricingRecords.length === 0) return [];

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
        const qty = monthlyCredits > 0 ? Math.ceil(totalMonthlyMax / monthlyCredits) : 1;
        const cost = qty * rec.gbb_costperunit;
        if (cost < bestCost) {
          bestOption = [{ rec, qty }];
          bestCost = cost;
        }
      }

      // Yearly tiers: multiple quantities allowed per tier
      const yearlyTiers = tiers
        .filter((rec) => rec.gbb_billing === 803430001)
        .sort((a, b) => b.gbb_credits - a.gbb_credits);

      if (yearlyTiers.length > 0) {
        // Try each single tier with multiple quantities
        for (const tier of yearlyTiers) {
          const qty = tier.gbb_credits > 0 ? Math.ceil(totalMax / tier.gbb_credits) : 1;
          const cost = qty * tier.gbb_costperunit;
          if (cost < bestCost) {
            bestOption = [{ rec: tier, qty }];
            bestCost = cost;
          }
        }

        // Try greedy combinations: fill with largest tier first, then remainder with smaller
        for (let startIdx = 0; startIdx < yearlyTiers.length - 1; startIdx++) {
          let remaining = totalMax;
          let totalCost = 0;
          const combo: ProcurementOption = [];
          for (let i = startIdx; i < yearlyTiers.length && remaining > 0; i++) {
            const tier = yearlyTiers[i];
            const qty = Math.floor(remaining / tier.gbb_credits);
            if (qty > 0) {
              combo.push({ rec: tier, qty });
              remaining -= qty * tier.gbb_credits;
              totalCost += qty * tier.gbb_costperunit;
            }
          }
          // Cover any remainder with the smallest tier that fits
          if (remaining > 0) {
            const smallestTier = yearlyTiers[yearlyTiers.length - 1];
            const extraQty = Math.ceil(remaining / smallestTier.gbb_credits);
            const existingEntry = combo.find(c => c.rec === smallestTier);
            if (existingEntry) {
              existingEntry.qty += extraQty;
            } else {
              combo.push({ rec: smallestTier, qty: extraQty });
            }
            totalCost += extraQty * smallestTier.gbb_costperunit;
          }
          if (combo.length > 0 && totalCost < bestCost) {
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
  }, [totalMax, totalMonthlyMax, pricingRecords]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXXL }}>
        <Spinner size="large" label="Loading summary..." />
      </div>
    );
  }

  // Pie chart data (using max credits for the split)
  const pieData = productCredits.map(p => ({
    name: p.productName,
    value: p.maxCredits,
  }));

  // Growth projection data
  const growthData: Record<string, string | number>[] = [];
  for (let year = 1; year <= projectionYears; year++) {
    const row: Record<string, string | number> = { year: `Year ${year}` };
    for (const p of productCredits) {
      row[p.productName] = Math.round(p.maxCredits * Math.pow(1 + growthRate, year - 1));
    }
    row['Total'] = Math.round(totalMax * Math.pow(1 + growthRate, year - 1));
    growthData.push(row);
  }

  const formatCredits = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(Math.round(n));
  };

  return (
    <div>
      <div className={styles.header}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack} aria-label="Back" />
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
            <DataPie24Regular />
            <Text className={styles.title}>{estimate?.gbb_name ?? 'Estimate'}</Text>
          </div>
          <Text className={styles.subtitle} style={{ display: 'block', marginTop: '4px' }}>Executive Summary</Text>
        </div>
        <Button
          appearance="primary"
          icon={<ArrowDownload24Regular />}
          onClick={handleExportPdf}
          disabled={exporting}
        >
          {exporting ? 'Exporting…' : 'Export PDF'}
        </Button>
      </div>
      <div ref={contentRef}>

      {/* Totals */}
      <div className={styles.totalCard}>
        <div className={styles.totalItem}>
          <Text className={styles.totalValue}>{formatCredits(totalMin)}</Text>
          <Text className={styles.totalLabel}>Min Annual Credits</Text>
        </div>
        <div className={styles.totalItem}>
          <Text className={styles.totalValue}>{formatCredits(totalMax)}</Text>
          <Text className={styles.totalLabel}>Max Annual Credits</Text>
        </div>
        <div className={styles.totalItem}>
          <Text className={styles.totalValue}>{productCredits.length}</Text>
          <Text className={styles.totalLabel}>Products</Text>
        </div>
        <div className={styles.totalItem}>
          <Text className={styles.totalValue}>{estimate?.gbb_growth ?? 10}%</Text>
          <Text className={styles.totalLabel}>Annual Growth</Text>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Credits by Product - Pie Chart */}
        <Card className={styles.card}>
          <Text className={styles.cardTitle}>Credits by Product</Text>
          {pieData.length === 0 ? (
            <Text style={{ color: tokens.colorNeutralForeground3 }}>No credit data available.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCredits(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Credits Table by Product */}
        <Card className={styles.card}>
          <Text className={styles.cardTitle}>Product Breakdown</Text>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Product</th>
                <th style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Min Credits</th>
                <th style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Max Credits</th>
                <th style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {productCredits.map((p, idx) => {
                const productImage = productItems?.find(pi => pi.id === p.productId)?.imageUrl;
                return (
                <tr key={p.productId}>
                  <td style={{ padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                      {productImage ? (
                        <img src={productImage} alt={p.productName} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: COLORS[idx % COLORS.length] }} />
                      )}
                      {p.productName}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{formatCredits(p.minCredits)}</td>
                  <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{formatCredits(p.maxCredits)}</td>
                  <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{totalMax > 0 ? `${((p.maxCredits / totalMax) * 100).toFixed(1)}%` : '—'}</td>
                </tr>
                );
              })}
              <tr>
                <td style={{ padding: tokens.spacingVerticalS, fontWeight: 600 }}>Total</td>
                <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, fontWeight: 600 }}>{formatCredits(totalMin)}</td>
                <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, fontWeight: 600 }}>{formatCredits(totalMax)}</td>
                <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, fontWeight: 600 }}>100%</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Annual Credit Projections */}
        {projectionYears > 0 && (
          <Card className={styles.card}>
            <Text className={styles.cardTitle}>Annual Credit Projections ({estimate?.gbb_growth ?? 10}% growth)</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Year</th>
                  <th style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Min Credits</th>
                  <th style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Max Credits</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: projectionYears }, (_, i) => {
                  const year = i + 1;
                  return (
                    <tr key={year}>
                      <td style={{ padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, fontWeight: year === 1 ? 600 : 400 }}>
                        Year {year}{year === 1 ? ' (Baseline)' : ''}
                      </td>
                      <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, fontWeight: year === 1 ? 600 : 400 }}>
                        {formatCredits(Math.round(totalMin * Math.pow(1 + growthRate, year - 1)))}
                      </td>
                      <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, fontWeight: year === 1 ? 600 : 400 }}>
                        {formatCredits(Math.round(totalMax * Math.pow(1 + growthRate, year - 1)))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {/* Growth Projection - Line Chart */}
        <Card className={`${styles.card} ${styles.fullWidth}`}>
          <Text className={styles.cardTitle}>
            Growth Projection ({estimate?.gbb_growth ?? 10}% annually over {projectionYears} years)
          </Text>
          {growthData.length === 0 ? (
            <Text style={{ color: tokens.colorNeutralForeground3 }}>No data to project.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(v) => formatCredits(Number(v))} />
                {productCredits.map((p, idx) => (
                  <Line
                    key={p.productId}
                    type="monotone"
                    dataKey={p.productName}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke={tokens.colorNeutralForeground1}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
                <Tooltip formatter={(value) => formatCredits(Number(value))} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Procurement Options */}
        {procurementOptions.length > 0 && (
          <Card className={styles.procurementCard} style={{ gridColumn: '1 / -1' }}>
            <Text className={styles.cardTitle}>Year 1 Procurement Options</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              Recommended combination to cover {formatCredits(totalMonthlyMax)} credits/month ({formatCredits(totalMax)} credits/year)
            </Text>
            <table className={styles.procurementTable}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Purchase Model</th>
                  <th style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Tier</th>
                  <th style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Credits Provided</th>
                  <th style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Cost/Unit</th>
                  <th style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Units</th>
                  <th style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Total Credits</th>
                  <th style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Cost</th>
                  <th style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `2px solid ${tokens.colorNeutralStroke1}`, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Billing</th>
                </tr>
              </thead>
              <tbody>
                {procurementOptions.flatMap((r, gIdx) =>
                  r.options.map((c, idx) => {
                    const cost = c.qty * c.rec.gbb_costperunit;
                    const billingLabel = BillingLabels[c.rec.gbb_billing] ?? '';
                    return (
                      <tr key={`${gIdx}-${idx}`}>
                        <td style={{ padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{c.rec.gbb_name}</td>
                        <td style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{c.rec.gbb_tier ?? ''}</td>
                        <td style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{c.rec.gbb_credits.toLocaleString()}</td>
                        <td style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                          ${c.rec.gbb_costperunit.toLocaleString('en-US', { minimumFractionDigits: c.rec.gbb_costperunit % 1 === 0 ? 0 : 4, maximumFractionDigits: c.rec.gbb_costperunit % 1 === 0 ? 0 : 4 })}
                        </td>
                        <td style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{c.qty}</td>
                        <td style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{(c.qty * c.rec.gbb_credits).toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                          ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'center', padding: tokens.spacingVerticalS, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>{billingLabel}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
};
