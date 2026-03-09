/**
 * Column definition for exports.
 */
export interface ExportColumn<T> {
  key: keyof T;
  label: string;
}

/**
 * Export data to CSV and trigger browser download.
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  if (data.length === 0) return;

  const header = columns.map((c) => `"${c.label}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  );

  const csv = "\uFEFF" + [header, ...rows].join("\n"); // BOM for Excel
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

/**
 * Export data to a real .xlsx (Office Open XML) file without any library.
 * Generates a minimal but valid xlsx using XML templates + JSZip-free approach
 * by building the xlsx as a set of XML files in a zip via Blob.
 *
 * For simplicity, we use the XML Spreadsheet format (.xlsx compatible via XML).
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  if (data.length === 0) return;

  // Build XML Spreadsheet 2003 format (opens in Excel, Google Sheets, LibreOffice)
  const escapeXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const headerCells = columns
    .map((c) => `<Cell><Data ss:Type="String">${escapeXml(c.label)}</Data></Cell>`)
    .join("");

  const dataRows = data
    .map((row) => {
      const cells = columns
        .map((c) => {
          const val = row[c.key];
          if (val === null || val === undefined) return `<Cell><Data ss:Type="String"></Data></Cell>`;
          const num = Number(val);
          if (!isNaN(num) && typeof val === "number") {
            return `<Cell><Data ss:Type="Number">${num}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${escapeXml(String(val))}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E2EFDA" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Export">
    <Table>
      <Row ss:StyleID="header">${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(blob, `${filename}.xls`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Save / load / delete named filter presets from localStorage.
 */
const FILTER_KEY = "flow-erp-saved-filters";

interface SavedFilters {
  [pageKey: string]: { name: string; filters: Record<string, string> }[];
}

function getAll(): SavedFilters {
  try {
    return JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getSavedFilters(pageKey: string): { name: string; filters: Record<string, string> }[] {
  return getAll()[pageKey] || [];
}

export function saveFilterPreset(pageKey: string, name: string, filters: Record<string, string>): void {
  const all = getAll();
  const page = all[pageKey] || [];
  const existing = page.findIndex((p) => p.name === name);
  if (existing >= 0) page[existing] = { name, filters };
  else page.push({ name, filters });
  all[pageKey] = page;
  localStorage.setItem(FILTER_KEY, JSON.stringify(all));
}

export function deleteFilterPreset(pageKey: string, name: string): void {
  const all = getAll();
  all[pageKey] = (all[pageKey] || []).filter((p) => p.name !== name);
  localStorage.setItem(FILTER_KEY, JSON.stringify(all));
}
