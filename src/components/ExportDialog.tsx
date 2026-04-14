import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

export interface ExportColumn {
  key: string;
  label: string;
  defaultSelected?: boolean;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  filename?: string;
}

function escapeCSV(val: unknown): string {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function generateCSV(data: Record<string, unknown>[], columns: ExportColumn[], selected: Set<string>): string {
  const cols = columns.filter(c => selected.has(c.key));
  const header = cols.map(c => escapeCSV(c.label)).join(',');
  const rows = data.map(row => cols.map(c => escapeCSV(row[c.key])).join(','));
  return [header, ...rows].join('\n');
}

function generateExcelXML(data: Record<string, unknown>[], columns: ExportColumn[], selected: Set<string>): string {
  const cols = columns.filter(c => selected.has(c.key));
  const escXML = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const headerCells = cols.map(c => `<Cell ss:StyleID="header"><Data ss:Type="String">${escXML(c.label)}</Data></Cell>`).join('');
  const rows = data.map(row => {
    const cells = cols.map(c => {
      const v = row[c.key];
      const type = typeof v === 'number' ? 'Number' : 'String';
      return `<Cell><Data ss:Type="${type}">${escXML(v)}</Data></Cell>`;
    }).join('');
    return `<Row>${cells}</Row>`;
  }).join('\n');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/></Style></Styles>
<Worksheet ss:Name="Export"><Table>
<Row>${headerCells}</Row>
${rows}
</Table></Worksheet></Workbook>`;
}

export function ExportDialog({ open, onOpenChange, title, columns, data, filename = 'export' }: ExportDialogProps) {
  const { t } = useTranslation();
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(columns.filter(c => c.defaultSelected !== false).map(c => c.key)));

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(columns.map(c => c.key)));
  const selectNone = () => setSelected(new Set());

  const handleExport = () => {
    if (selected.size === 0) { toast.error(t('export.selectAtLeastOne')); return; }

    let content: string, mime: string, ext: string;
    if (format === 'csv') {
      content = generateCSV(data, columns, selected);
      mime = 'text/csv;charset=utf-8;';
      ext = 'csv';
    } else {
      content = generateExcelXML(data, columns, selected);
      mime = 'application/vnd.ms-excel';
      ext = 'xls';
    }

    const blob = new Blob(['\uFEFF' + content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.${ext}`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('export.exportSuccess', { count: data.length, format: ext.toUpperCase() }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            {title || t('export.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('export.format')}</Label>
            <Select value={format} onValueChange={v => setFormat(v as 'csv' | 'excel')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csv"><div className="flex items-center gap-2"><FileText className="h-4 w-4" />CSV</div></SelectItem>
                <SelectItem value="excel"><div className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Excel (XLS)</div></SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('export.columns')} ({selected.size}/{columns.length})</Label>
              <div className="flex gap-2">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={selectAll}>{t('export.selectAll')}</Button>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={selectNone}>{t('export.selectNone')}</Button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
              {columns.map(col => (
                <div key={col.key} className="flex items-center gap-2">
                  <Checkbox id={`col-${col.key}`} checked={selected.has(col.key)} onCheckedChange={() => toggle(col.key)} />
                  <Label htmlFor={`col-${col.key}`} className="text-sm font-normal cursor-pointer">{col.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            {t('export.rowCount', { count: data.length })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleExport} disabled={selected.size === 0} className="gap-2">
            <Download className="h-4 w-4" />{t('common.export')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}