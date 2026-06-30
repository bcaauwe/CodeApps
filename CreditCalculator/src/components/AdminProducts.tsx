import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
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
  Apps24Regular,
  TableEdit24Regular,
  List24Regular,
  Image24Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import JSZip from 'jszip';
import { Gbb_calculatorproductsService } from '../generated/services/Gbb_calculatorproductsService';
import type { Gbb_calculatorproducts } from '../generated/models/Gbb_calculatorproductsModel';

interface AdminProductsProps {
  onBack: () => void;
}

type ProductFormData = {
  gbb_name: string;
  gbb_sortorder: number;
};

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
  toolbarSpacer: {
    flexGrow: 1,
  },
  listContainer: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '48px 2fr 1fr',
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
    gridTemplateColumns: '48px 2fr 1fr',
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
    gridTemplateColumns: '48px 2fr 1fr',
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
  requiredIndicator: {
    color: tokens.colorPaletteRedForeground1,
    fontWeight: tokens.fontWeightBold,
    marginLeft: '2px',
  },
  datasheetRow: {
    display: 'grid',
    gridTemplateColumns: '48px 2fr 1fr',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    alignItems: 'center',
  },
  datasheetRowDirty: {
    display: 'grid',
    gridTemplateColumns: '48px 2fr 1fr',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    alignItems: 'center',
    backgroundColor: tokens.colorPaletteYellowBackground1,
  },
  datasheetInput: {
    minWidth: 0,
  },
  thumbnail: {
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusSmall,
    objectFit: 'cover' as const,
  },
  thumbnailPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
  },
  imageUploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalL,
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
  },
  imagePreview: {
    width: '120px',
    height: '120px',
    borderRadius: tokens.borderRadiusMedium,
    objectFit: 'cover' as const,
  },
  imagePreviewContainer: {
    position: 'relative' as const,
    display: 'inline-block',
  },
  imageRemoveButton: {
    position: 'absolute' as const,
    top: '-8px',
    right: '-8px',
  },
});

const emptyFormData: ProductFormData = {
  gbb_name: '',
  gbb_sortorder: 0,
};

export const AdminProducts: React.FC<AdminProductsProps> = ({ onBack }) => {
  const styles = useStyles();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [records, setRecords] = useState<Gbb_calculatorproducts[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState<ProductFormData>({ ...emptyFormData });
  const [editingRecord, setEditingRecord] = useState<Gbb_calculatorproducts | null>(null);
  const [datasheetMode, setDatasheetMode] = useState(false);
  const [datasheetEdits, setDatasheetEdits] = useState<Record<string, Partial<ProductFormData>>>({});
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set());
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);

  const loadImageForRecord = useCallback(async (record: Gbb_calculatorproducts) => {
    if (!record.gbb_productimageid) return;
    try {
      const result = await Gbb_calculatorproductsService.downloadImage(record.gbb_calculatorproductid, 'gbb_productimage');
      if (result.data) {
        const uint8 = new Uint8Array(result.data);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
        const url = `data:image/png;base64,${btoa(binary)}`;
        setImageUrls((prev) => ({ ...prev, [record.gbb_calculatorproductid]: url }));
      }
    } catch {
      // Image not available
    }
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Gbb_calculatorproductsService.getAll({ filter: 'statecode eq 0', orderBy: ['gbb_sortorder asc'] });
      const data = result.data ?? [];
      setRecords(data);
      // Load images for records that have one
      for (const rec of data) {
        loadImageForRecord(rec);
      }
    } catch (err) {
      console.error('Failed to load product records:', err);
    } finally {
      setLoading(false);
    }
  }, [loadImageForRecord]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getDatasheetValue = <K extends keyof ProductFormData>(
    record: Gbb_calculatorproducts,
    field: K,
  ): ProductFormData[K] => {
    const edits = datasheetEdits[record.gbb_calculatorproductid];
    if (edits && field in edits) return edits[field] as ProductFormData[K];
    if (field === 'gbb_sortorder') return (record.gbb_sortorder ?? 0) as ProductFormData[K];
    return record[field as keyof Gbb_calculatorproducts] as ProductFormData[K];
  };

  const handleDatasheetChange = (
    id: string,
    field: keyof ProductFormData,
    value: string | number,
  ) => {
    setDatasheetEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleDatasheetBlur = async (record: Gbb_calculatorproducts) => {
    const edits = datasheetEdits[record.gbb_calculatorproductid];
    if (!edits || Object.keys(edits).length === 0) return;

    const changed: Partial<Omit<Gbb_calculatorproducts, 'gbb_calculatorproductid'>> = {};
    if (edits.gbb_name !== undefined && edits.gbb_name !== record.gbb_name) changed.gbb_name = edits.gbb_name;
    if (edits.gbb_sortorder !== undefined && edits.gbb_sortorder !== (record.gbb_sortorder ?? 0)) changed.gbb_sortorder = edits.gbb_sortorder;

    if (Object.keys(changed).length === 0) {
      setDatasheetEdits((prev) => {
        const next = { ...prev };
        delete next[record.gbb_calculatorproductid];
        return next;
      });
      return;
    }

    setSavingRows((prev) => new Set(prev).add(record.gbb_calculatorproductid));
    try {
      await Gbb_calculatorproductsService.update(record.gbb_calculatorproductid, changed);
      setDatasheetEdits((prev) => {
        const next = { ...prev };
        delete next[record.gbb_calculatorproductid];
        return next;
      });
      await loadRecords();
    } catch (err) {
      console.error('Failed to save row:', err);
    } finally {
      setSavingRows((prev) => {
        const next = new Set(prev);
        next.delete(record.gbb_calculatorproductid);
        return next;
      });
    }
  };

  const handleNew = () => {
    setDialogForm({ ...emptyFormData });
    setEditingRecord(null);
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedIndex === null) return;
    const rec = records[selectedIndex];
    setDialogForm({
      gbb_name: rec.gbb_name,
      gbb_sortorder: rec.gbb_sortorder ?? 0,
    });
    setEditingRecord(rec);
    setPendingImageFile(null);
    setPendingImagePreview(imageUrls[rec.gbb_calculatorproductid] ?? null);
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
      await Gbb_calculatorproductsService.delete(rec.gbb_calculatorproductid);
      setSelectedIndex(null);
      await loadRecords();
    } catch (err) {
      console.error('Failed to delete product record:', err);
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDialogSave = async () => {
    setSaving(true);
    try {
      let recordId: string | undefined;
      if (editingRecord) {
        await Gbb_calculatorproductsService.update(editingRecord.gbb_calculatorproductid, {
          gbb_name: dialogForm.gbb_name,
          gbb_sortorder: dialogForm.gbb_sortorder,
        });
        recordId = editingRecord.gbb_calculatorproductid;
      } else {
        const result = await Gbb_calculatorproductsService.create({
          gbb_name: dialogForm.gbb_name,
          gbb_sortorder: dialogForm.gbb_sortorder,
          statecode: 0,
        });
        recordId = result.data?.gbb_calculatorproductid;
      }
      // Upload image if a new file was selected
      if (pendingImageFile && recordId) {
        try {
          await Gbb_calculatorproductsService.upload(recordId, 'gbb_productimage', pendingImageFile);
        } catch (imgErr) {
          console.error('Failed to upload product image:', imgErr);
        }
      }
      // Remove image if user cleared it on an existing record
      if (!pendingImagePreview && !pendingImageFile && editingRecord?.gbb_productimageid) {
        try {
          await Gbb_calculatorproductsService.deleteFileOrImage(editingRecord.gbb_calculatorproductid, 'gbb_productimage');
        } catch (imgErr) {
          console.error('Failed to delete product image:', imgErr);
        }
      }
      setPendingImageFile(null);
      setPendingImagePreview(null);
      setDialogOpen(false);
      await loadRecords();
    } catch (err) {
      console.error('Failed to save product record:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();

      // Build CSV
      const headers = ['Name', 'Sort Order', 'Image Filename'];
      const csvRows: string[] = [headers.map((h) => `"${h}"`).join(',')];

      for (const rec of records) {
        let imageFilename = '';
        if (rec.gbb_productimageid) {
          try {
            const imgResult = await Gbb_calculatorproductsService.downloadImage(rec.gbb_calculatorproductid, 'gbb_productimage', true);
            if (imgResult.data) {
              imageFilename = `${rec.gbb_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${rec.gbb_calculatorproductid.slice(0, 8)}.png`;
              zip.file(`images/${imageFilename}`, new Uint8Array(imgResult.data));
            }
          } catch {
            // Image download failed, skip
          }
        }
        csvRows.push([
          `"${rec.gbb_name.replace(/"/g, '""')}"`,
          String(rec.gbb_sortorder ?? 0),
          `"${imageFilename}"`,
        ].join(','));
      }

      zip.file('products.csv', csvRows.join('\n'));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products-export.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  };

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

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const zip = await JSZip.loadAsync(file);

      // Read CSV
      const csvFile = zip.file('products.csv');
      if (!csvFile) {
        alert('No products.csv found in the ZIP file.');
        return;
      }
      const csvText = await csvFile.async('string');
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        alert('CSV file is empty or has no data rows.');
        return;
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const nameIdx = headers.findIndex((h) => h === 'name');
      const sortIdx = headers.findIndex((h) => h.includes('sort'));
      const imageIdx = headers.findIndex((h) => h.includes('image'));

      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length < 1 || !cols[nameIdx >= 0 ? nameIdx : 0]) continue;

        const name = nameIdx >= 0 ? cols[nameIdx] : '';
        const sortOrder = sortIdx >= 0 ? Number(cols[sortIdx]) || 0 : 0;
        const imageFilename = imageIdx >= 0 ? cols[imageIdx] : '';

        try {
          const result = await Gbb_calculatorproductsService.create({
            gbb_name: name,
            gbb_sortorder: sortOrder,
            statecode: 0,
          });
          const newId = result.data?.gbb_calculatorproductid;

          // Upload image if referenced and exists in the ZIP
          if (imageFilename && newId) {
            const imgFile = zip.file(`images/${imageFilename}`);
            if (imgFile) {
              const imgData = await imgFile.async('uint8array');
              const imgBlob = new File([new Uint8Array(imgData)], imageFilename, { type: 'image/png' });
              try {
                await Gbb_calculatorproductsService.upload(newId, 'gbb_productimage', imgBlob);
              } catch (imgErr) {
                console.error(`[Import] Image upload for row ${i} failed:`, imgErr);
              }
            }
          }
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
      console.error('Import failed:', err);
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPendingImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const renderThumbnail = (record: Gbb_calculatorproducts) => {
    const url = imageUrls[record.gbb_calculatorproductid];
    if (url) {
      return <img src={url} alt={record.gbb_name} className={styles.thumbnail} />;
    }
    return (
      <div className={styles.thumbnailPlaceholder}>
        <Image24Regular style={{ fontSize: '20px' }} />
      </div>
    );
  };

  return (
    <div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFileChange}
      />
      <div className={styles.header}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack} aria-label="Back" />
        <div className={styles.breadcrumb}>
          <Text className={styles.breadcrumbSegment} onClick={onBack}>Settings</Text>
          <span className={styles.breadcrumbChevron}><ChevronRight20Regular /></span>
          <Apps24Regular />
          <Text className={styles.breadcrumbCurrent}>Products</Text>
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
        <Button appearance="secondary" icon={<ArrowDownload24Regular />} onClick={handleExportZip} disabled={records.length === 0 || exporting}>
          {exporting ? 'Exporting...' : 'Export ZIP'}
        </Button>
        <Button appearance="secondary" icon={<ArrowUpload24Regular />} onClick={() => csvInputRef.current?.click()} disabled={importing}>
          {importing ? 'Importing...' : 'Import ZIP'}
        </Button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".zip"
          style={{ display: 'none' }}
          onChange={handleImportZip}
        />
        <span className={styles.toolbarSpacer} />
        <Button
          appearance={datasheetMode ? 'primary' : 'secondary'}
          icon={datasheetMode ? <List24Regular /> : <TableEdit24Regular />}
          onClick={() => { setDatasheetMode((v) => !v); setDatasheetEdits({}); }}
        >
          {datasheetMode ? 'List View' : 'Datasheet'}
        </Button>
      </div>

      <div className={styles.listContainer}>
        <div className={styles.listHeader}>
          <Text className={styles.listHeaderCell}></Text>
          <Text className={styles.listHeaderCell}>Name</Text>
          <Text className={styles.listHeaderCell}>Sort Order</Text>
        </div>
        {loading ? (
          <div style={{ padding: tokens.spacingVerticalL, textAlign: 'center' }}>
            <Spinner size="small" label="Loading products..." />
          </div>
        ) : datasheetMode ? records.map((record) => {
          const id = record.gbb_calculatorproductid;
          const isDirty = !!datasheetEdits[id];
          const isSaving = savingRows.has(id);
          return (
            <div key={id} className={isDirty ? styles.datasheetRowDirty : styles.datasheetRow}>
              {renderThumbnail(record)}
              <Input
                className={styles.datasheetInput}
                size="small"
                value={getDatasheetValue(record, 'gbb_name')}
                onChange={(_, d) => handleDatasheetChange(id, 'gbb_name', d.value)}
                onBlur={() => handleDatasheetBlur(record)}
                disabled={isSaving}
              />
              <Input
                className={styles.datasheetInput}
                size="small"
                type="number"
                value={String(getDatasheetValue(record, 'gbb_sortorder'))}
                onChange={(_, d) => handleDatasheetChange(id, 'gbb_sortorder', Number(d.value) || 0)}
                onBlur={() => handleDatasheetBlur(record)}
                disabled={isSaving}
              />
            </div>
          );
        }) : records.map((record, idx) => (
          <div
            key={record.gbb_calculatorproductid}
            className={idx === selectedIndex ? styles.listRowSelected : styles.listRow}
            onClick={() => setSelectedIndex(idx)}
            onDoubleClick={() => {
              setDialogForm({
                gbb_name: record.gbb_name,
                gbb_sortorder: record.gbb_sortorder ?? 0,
              });
              setEditingRecord(record);
              setPendingImageFile(null);
              setPendingImagePreview(imageUrls[record.gbb_calculatorproductid] ?? null);
              setDialogOpen(true);
            }}
          >
            {renderThumbnail(record)}
            <Text className={styles.listCell}>{record.gbb_name}</Text>
            <Text className={styles.listCell}>{record.gbb_sortorder ?? 0}</Text>
          </div>
        ))}
      </div>

      {/* Edit / New Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editingRecord ? 'Edit Product' : 'New Product'}</DialogTitle>
            <DialogContent>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Name<span className={styles.requiredIndicator}> *</span></Text>
                <Input
                  value={dialogForm.gbb_name}
                  onChange={(_, data) => setDialogForm((f) => ({ ...f, gbb_name: data.value }))}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Sort Order</Text>
                <Input
                  type="number"
                  min={0}
                  value={String(dialogForm.gbb_sortorder)}
                  onChange={(_, data) => setDialogForm((f) => ({ ...f, gbb_sortorder: Number(data.value) || 0 }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Product Image</Text>
                {pendingImagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img src={pendingImagePreview} alt="Preview" className={styles.imagePreview} />
                    <Button
                      className={styles.imageRemoveButton}
                      appearance="subtle"
                      icon={<Dismiss16Regular />}
                      size="small"
                      shape="circular"
                      onClick={() => {
                        setPendingImagePreview(null);
                        setPendingImageFile(null);
                      }}
                      aria-label="Remove image"
                    />
                  </div>
                ) : (
                  <div
                    className={styles.imageUploadArea}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Image24Regular style={{ fontSize: '32px', color: tokens.colorNeutralForeground3 }} />
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      Click to upload an image
                    </Text>
                  </div>
                )}
                {pendingImagePreview && (
                  <Button
                    appearance="secondary"
                    size="small"
                    style={{ marginTop: tokens.spacingVerticalXS, alignSelf: 'flex-start' }}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                )}
                <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginTop: tokens.spacingVerticalXS }}>
                  Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF
                </Text>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDialogSave} disabled={saving || !dialogForm.gbb_name.trim()}>
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
