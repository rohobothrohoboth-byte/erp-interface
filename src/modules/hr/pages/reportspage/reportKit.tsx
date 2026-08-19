// Reusable HR report toolkit: a company letterhead + printable / exportable
// (Excel, CSV) report table. This is the shared pattern used by every HR report
// page so they all share one professional, branded, letter-format output.

import { useMemo, type ReactNode } from 'react';
import * as XLSX from 'xlsx';
import { Printer, FileSpreadsheet, FileText, RefreshCw, Search, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { StatusBadge } from '@/shared/components/ModulePageShell';
import { useCompanies } from '@/modules/core/services/company/company.queries';
import { useAuthStore } from '@/shared/stores/auth.store';

// ─────────────────────────────────────────────────────────────────────────────
// Company letterhead
// ─────────────────────────────────────────────────────────────────────────────

export interface Letterhead {
  name: string;
  nameAm?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  taxId?: string;
  motto?: string;
  stampUrl?: string;
}

/** Pulls the single company's profile for use as a report letterhead. */
export function useCompanyLetterhead(): { letterhead: Letterhead; loading: boolean } {
  const { data: companies = [], isLoading } = useCompanies();
  const c: any = companies[0];
  return {
    letterhead: {
      name: c?.name || 'RST ERP',
      nameAm: c?.nameAm || undefined,
      address: c?.address || undefined,
      phone: c?.phone || undefined,
      email: c?.email || undefined,
      website: c?.website || undefined,
      logoUrl: c?.logoUrl || undefined,
      taxId: c?.taxId || undefined,
      motto: c?.motto || undefined,
      stampUrl: c?.stampUrl || undefined,
    },
    loading: isLoading,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

export type ReportRow = Record<string, string | number | null | undefined> & {
  id: string;
  status?: string;
};

export interface AppliedFilter {
  label: string;
  value: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Export / print helpers
// ─────────────────────────────────────────────────────────────────────────────

const cell = (row: ReportRow, key: string): string => {
  const v = row[key];
  return v === null || v === undefined ? '' : String(v);
};

function contactLine(l: Letterhead): string {
  return [l.phone && `Tel: ${l.phone}`, l.email, l.website].filter(Boolean).join('   |   ');
}

function stamp(): string {
  return new Date().toLocaleString();
}

/** Build an Array-of-Arrays with a branded header block, then the table. */
function buildAoa(
  l: Letterhead,
  title: string,
  subtitle: string | undefined,
  filters: AppliedFilter[],
  columns: ReportColumn[],
  rows: ReportRow[],
): (string | number)[][] {
  const aoa: (string | number)[][] = [];
  aoa.push([l.name]);
  if (l.nameAm) aoa.push([l.nameAm]);
  if (l.address) aoa.push([l.address]);
  const contact = contactLine(l);
  if (contact) aoa.push([contact]);
  if (l.taxId) aoa.push([`TIN: ${l.taxId}`]);
  aoa.push([]);
  aoa.push([title]);
  if (subtitle) aoa.push([subtitle]);
  aoa.push([`Generated: ${stamp()}`]);
  filters.forEach((f) => aoa.push([`${f.label}: ${f.value}`]));
  aoa.push([]);
  aoa.push(columns.map((c) => c.label));
  rows.forEach((r) => aoa.push(columns.map((c) => cell(r, c.key))));
  if (l.motto) {
    aoa.push([]);
    aoa.push([l.motto]);
  }
  return aoa;
}

export function exportReportExcel(
  l: Letterhead,
  title: string,
  subtitle: string | undefined,
  filters: AppliedFilter[],
  columns: ReportColumn[],
  rows: ReportRow[],
  filenameBase: string,
) {
  const aoa = buildAoa(l, title, subtitle, filters, columns, rows);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = columns.map((c) => ({ wch: Math.max(14, c.label.length + 4) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${filenameBase}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportReportCsv(
  l: Letterhead,
  title: string,
  subtitle: string | undefined,
  filters: AppliedFilter[],
  columns: ReportColumn[],
  rows: ReportRow[],
  filenameBase: string,
) {
  const aoa = buildAoa(l, title, subtitle, filters, columns, rows);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameBase}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Open a print-ready window with a professional letterhead + report table.
 * The user can send it to a printer or "Save as PDF". Waits for the logo image
 * (if any) to load before invoking print.
 */
export function printReport(
  l: Letterhead,
  title: string,
  subtitle: string | undefined,
  filters: AppliedFilter[],
  columns: ReportColumn[],
  rows: ReportRow[],
  stats: { label: string; value: string | number }[] = [],
  printedBy?: string,
) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;

  const contact = contactLine(l);
  const logo = l.logoUrl
    ? `<img src="${esc(l.logoUrl)}" alt="logo" style="max-height:72px;max-width:180px;object-fit:contain" />`
    : '';
  const stampImg = l.stampUrl
    ? `<div class="stampbox"><img src="${esc(l.stampUrl)}" alt="stamp" style="max-height:90px;max-width:150px;object-fit:contain" /><div class="stamplbl">Official Stamp</div></div>`
    : '';

  const filterHtml = filters.length
    ? `<div class="filters">${filters.map((f) => `<span><b>${esc(f.label)}:</b> ${esc(f.value)}</span>`).join('')}</div>`
    : '';

  const statsHtml = stats.length
    ? `<div class="stats">${stats
        .map((s) => `<div class="stat"><span class="sv">${esc(String(s.value))}</span><span class="sl">${esc(s.label)}</span></div>`)
        .join('')}</div>`
    : '';

  const thead = `<tr>${columns
    .map((c) => `<th style="text-align:${c.align || 'left'}">${esc(c.label)}</th>`)
    .join('')}</tr>`;

  const tbody = rows
    .map(
      (r) =>
        `<tr>${columns
          .map((c) => `<td style="text-align:${c.align || 'left'}">${esc(cell(r, c.key))}</td>`)
          .join('')}</tr>`,
    )
    .join('');

  win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; margin:32px; }
  .letterhead { display:flex; align-items:center; gap:18px; border-bottom:3px solid #0f766e; padding-bottom:14px; }
  .letterhead .info { flex:1; }
  .company { font-size:22px; font-weight:800; letter-spacing:.3px; color:#0f172a; }
  .company-am { font-size:14px; color:#334155; margin-top:2px; }
  .addr { font-size:12px; color:#475569; margin-top:4px; }
  .contact { font-size:12px; color:#0f766e; margin-top:2px; }
  .tin { font-size:11px; color:#64748b; margin-top:2px; }
  .rtitle { text-align:center; margin:22px 0 4px; font-size:17px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
  .rsub { text-align:center; color:#64748b; font-size:12px; }
  .meta { text-align:center; color:#94a3b8; font-size:11px; margin-top:4px; }
  .filters { margin:14px 0; font-size:12px; color:#475569; display:flex; gap:18px; flex-wrap:wrap; justify-content:center; }
  .stats { display:flex; gap:12px; margin:16px 0; flex-wrap:wrap; }
  .stat { border:1px solid #e2e8f0; border-radius:8px; padding:8px 14px; text-align:center; min-width:96px; }
  .stat .sv { display:block; font-size:18px; font-weight:700; color:#0f172a; }
  .stat .sl { display:block; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:.4px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; font-size:12px; }
  th { background:#0f766e; color:#fff; padding:8px 10px; font-weight:600; }
  td { padding:7px 10px; border-bottom:1px solid #e2e8f0; }
  tr:nth-child(even) td { background:#f8fafc; }
  .motto { text-align:center; font-style:italic; color:#0f766e; font-size:12px; margin-top:20px; padding-top:8px; border-top:1px solid #e2e8f0; }
  .stampbox { margin-top:22px; text-align:right; }
  .stamplbl { font-size:10px; color:#94a3b8; margin-top:2px; }
  .footer { margin-top:10px; font-size:10px; color:#94a3b8; display:flex; justify-content:space-between; }
  @media print { body { margin:12mm; } th, img { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
  <div class="letterhead">${logo}<div class="info">
    <div class="company">${esc(l.name)}</div>
    ${l.nameAm ? `<div class="company-am">${esc(l.nameAm)}</div>` : ''}
    ${l.address ? `<div class="addr">${esc(l.address)}</div>` : ''}
    ${contact ? `<div class="contact">${esc(contact)}</div>` : ''}
    ${l.taxId ? `<div class="tin">TIN: ${esc(l.taxId)}</div>` : ''}
  </div></div>
  <div class="rtitle">${esc(title)}</div>
  ${subtitle ? `<div class="rsub">${esc(subtitle)}</div>` : ''}
  <div class="meta">Generated: ${esc(stamp())} &middot; ${rows.length} record(s)</div>
  ${filterHtml}
  ${statsHtml}
  <table><thead>${thead}</thead><tbody>${tbody || `<tr><td colspan="${columns.length}" style="text-align:center;color:#94a3b8;padding:20px">No records</td></tr>`}</tbody></table>
  ${l.motto ? `<div class="motto">${esc(l.motto)}</div>` : ''}
  ${stampImg}
  <div class="footer"><span>${esc(l.name)}</span><span>${printedBy ? `Printed by: ${esc(printedBy)} &middot; ` : ''}Generated by RST ERP</span></div>
  <script>
    (function(){
      var imgs = Array.prototype.slice.call(document.images);
      Promise.all(imgs.map(function(i){ return i.complete ? true : new Promise(function(res){ i.onload = i.onerror = res; }); }))
        .then(function(){ setTimeout(function(){ window.focus(); window.print(); }, 200); });
    })();
  </script>
</body></html>`);
  win.document.close();
}

export interface LetterContent {
  title: string;
  refNo?: string;
  date?: string;
  recipient?: string;
  body: string; // free text; blank lines separate paragraphs
  closing?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  // Optional data-URL images: the signatory's handwritten signature and their
  // personal stamp (distinct from the company stamp on the letterhead).
  signatureImage?: string;
  personalStampImage?: string;
}

/**
 * Open a print-ready formal letter on the company letterhead (logo + address +
 * contact header, ref/date, recipient, body paragraphs, closing, signature).
 * For HR letters (experience, clearance, employment, recommendation, guarantee…).
 */
export function printLetter(l: Letterhead, c: LetterContent, printedBy?: string) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;

  const contact = contactLine(l);
  const logo = l.logoUrl
    ? `<img src="${esc(l.logoUrl)}" alt="logo" style="max-height:72px;max-width:180px;object-fit:contain" />`
    : '';
  const stampImg = l.stampUrl
    ? `<img src="${esc(l.stampUrl)}" alt="stamp" style="max-height:90px;max-width:150px;object-fit:contain" />`
    : '';
  const paragraphs = c.body
    .split(/\n\s*\n/)
    .map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br/>')}</p>`)
    .join('');

  win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${esc(c.title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; margin:40px; line-height:1.6; }
  .letterhead { display:flex; align-items:center; gap:18px; border-bottom:3px solid #0f766e; padding-bottom:14px; }
  .company { font-size:22px; font-weight:800; color:#0f172a; }
  .company-am { font-size:14px; color:#334155; }
  .addr { font-size:12px; color:#475569; margin-top:4px; }
  .contact { font-size:12px; color:#0f766e; }
  .meta { display:flex; justify-content:space-between; margin-top:26px; font-size:13px; }
  .recipient { margin-top:22px; font-size:14px; }
  .title { margin:22px 0 10px; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; text-decoration:underline; }
  .body { font-size:14px; text-align:justify; }
  .body p { margin:0 0 14px; }
  .sign { margin-top:48px; font-size:14px; }
  .sign .name { font-weight:700; }
  .sign .stamp { margin:8px 0; }
  .printedby { margin-top:30px; font-size:10px; color:#94a3b8; text-align:right; }
  .motto { text-align:center; font-style:italic; color:#0f766e; font-size:12px; margin-top:40px; border-top:1px solid #e2e8f0; padding-top:8px; }
  @media print { body { margin:16mm; } th, .letterhead { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
  <div class="letterhead">${logo}<div>
    <div class="company">${esc(l.name)}</div>
    ${l.nameAm ? `<div class="company-am">${esc(l.nameAm)}</div>` : ''}
    ${l.address ? `<div class="addr">${esc(l.address)}</div>` : ''}
    ${contact ? `<div class="contact">${esc(contact)}</div>` : ''}
  </div></div>
  <div class="meta"><span>${c.refNo ? `Ref: ${esc(c.refNo)}` : ''}</span><span>${esc(c.date || new Date().toLocaleDateString())}</span></div>
  ${c.recipient ? `<div class="recipient">${esc(c.recipient)}</div>` : ''}
  <div class="title">${esc(c.title)}</div>
  <div class="body">${paragraphs}</div>
  <div class="sign">
    <div>${esc(c.closing || 'Sincerely,')}</div>
    ${c.signatureImage
      ? `<div class="stamp"><img src="${esc(c.signatureImage)}" alt="signature" style="max-height:60px;max-width:180px;object-fit:contain" /></div>`
      : '<div style="height:36px"></div>'}
    <div class="name">${esc(c.signatoryName || '')}</div>
    <div>${esc(c.signatoryTitle || '')}</div>
    <div style="margin-top:8px;display:flex;gap:24px;align-items:flex-end">
      ${c.personalStampImage ? `<img src="${esc(c.personalStampImage)}" alt="personal stamp" style="max-height:80px;max-width:130px;object-fit:contain" />` : ''}
      ${stampImg ? `<div style="text-align:center">${stampImg}<div style="font-size:10px;color:#94a3b8">Company Stamp</div></div>` : ''}
    </div>
  </div>
  ${printedBy ? `<div class="printedby">Printed by: ${esc(printedBy)} &middot; ${esc(new Date().toLocaleString())}</div>` : ''}
  ${l.motto ? `<div class="motto">${esc(l.motto)}</div>` : ''}
  <script>
    (function(){
      var imgs = Array.prototype.slice.call(document.images);
      Promise.all(imgs.map(function(i){ return i.complete ? true : new Promise(function(res){ i.onload = i.onerror = res; }); }))
        .then(function(){ setTimeout(function(){ window.focus(); window.print(); }, 200); });
    })();
  </script>
</body></html>`);
  win.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// ReportView — on-screen letterhead + toolbar + table
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportViewProps {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  stats?: { label: string; value: string | number }[];
  /** Filter controls rendered in the toolbar (e.g. <select>s). */
  filters?: ReactNode;
  /** Summary of applied filters, embedded into exports/prints. */
  appliedFilters?: AppliedFilter[];
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  statusTone?: (status: string) => 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  filenameBase: string;
}

export function ReportView({
  title,
  subtitle,
  columns,
  rows,
  stats = [],
  filters,
  appliedFilters = [],
  search,
  onSearch,
  searchPlaceholder = 'Search…',
  loading,
  error,
  onRefresh,
  statusTone,
  filenameBase,
}: ReportViewProps) {
  const { letterhead } = useCompanyLetterhead();
  const printedBy = useAuthStore((s) => s.userName) || undefined;

  const contact = useMemo(
    () => [letterhead.phone && `Tel: ${letterhead.phone}`, letterhead.email, letterhead.website].filter(Boolean).join('   •   '),
    [letterhead],
  );

  const doPrint = () => printReport(letterhead, title, subtitle, appliedFilters, columns, rows, stats, printedBy);
  const doExcel = () => exportReportExcel(letterhead, title, subtitle, appliedFilters, columns, rows, filenameBase);
  const doCsv = () => exportReportCsv(letterhead, title, subtitle, appliedFilters, columns, rows, filenameBase);

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* On-screen letterhead preview */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {letterhead.logoUrl ? (
          <img
            src={letterhead.logoUrl}
            alt="Company logo"
            className="h-16 w-auto max-w-[160px] object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-900/30">
            <FileText className="h-7 w-7" />
          </div>
        )}
        <div className="min-w-0 flex-1 border-l-4 border-teal-600 pl-4">
          <div className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">
            {letterhead.name}
          </div>
          {letterhead.nameAm && (
            <div className="truncate text-sm text-slate-600 dark:text-slate-300">{letterhead.nameAm}</div>
          )}
          {letterhead.address && (
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{letterhead.address}</div>
          )}
          {contact && <div className="truncate text-xs font-medium text-teal-700 dark:text-teal-400">{contact}</div>}
          {letterhead.motto && (
            <div className="truncate text-xs italic text-slate-500 dark:text-slate-400">“{letterhead.motto}”</div>
          )}
        </div>
      </div>

      {/* Title + toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={doPrint} disabled={loading || rows.length === 0}>
            <Printer className="mr-1.5 h-4 w-4" /> Print / PDF
          </Button>
          <Button variant="outline" size="sm" onClick={doExcel} disabled={loading || rows.length === 0}>
            <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={doCsv} disabled={loading || rows.length === 0}>
            <FileText className="mr-1.5 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        {filters}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 py-12 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Try again
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 text-slate-700 dark:text-slate-200 ${c.align === 'right' ? 'text-right' : ''}`}
                    >
                      {c.key === 'status' && row.status ? (
                        <StatusBadge status={row.status} tone={statusTone?.(row.status) ?? 'neutral'} />
                      ) : (
                        <span className={c.key === columns[0]?.key ? 'font-medium text-slate-900 dark:text-slate-100' : undefined}>
                          {cell(row, c.key) || '—'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
