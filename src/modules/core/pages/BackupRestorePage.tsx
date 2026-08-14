import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, Download, HardDrive, History, RefreshCw, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';

const backups = [
  { id: 1, name: 'erp-full-2026-08-14-0900.bak', type: 'Full', size: '2.4 GB', created: '14 Aug 2026, 09:00', status: 'Completed' },
  { id: 2, name: 'erp-full-2026-08-13-1800.bak', type: 'Full', size: '2.3 GB', created: '13 Aug 2026, 18:00', status: 'Completed' },
  { id: 3, name: 'erp-diff-2026-08-13-1200.bak', type: 'Differential', size: '486 MB', created: '13 Aug 2026, 12:00', status: 'Completed' },
];

export default function BackupRestorePage() {
  const [showRestore, setShowRestore] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [creating, setCreating] = useState(false);

  const createBackup = () => { setCreating(true); window.setTimeout(() => setCreating(false), 900); };

  return (
    <ModulePageShell title="Backup & Restore" subtitle="Protect ERP data with controlled backups and safe recovery operations." onRefresh={() => window.location.reload()} primaryActionLabel={creating ? 'Creating...' : 'Create Backup'} onPrimaryAction={createBackup}>
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 shadow-none"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-emerald-50 p-3"><Database className="h-6 w-6 text-emerald-600" /></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Last Backup</p><p className="mt-1 font-semibold text-slate-900">Today, 09:00</p><p className="text-xs text-slate-400">Full backup</p></div></CardContent></Card>
          <Card className="border-slate-200 shadow-none"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-sky-50 p-3"><HardDrive className="h-6 w-6 text-sky-600" /></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Storage Used</p><p className="mt-1 font-semibold text-slate-900">5.2 GB</p><p className="text-xs text-slate-400">3 backup files</p></div></CardContent></Card>
          <Card className="border-slate-200 shadow-none"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-amber-50 p-3"><History className="h-6 w-6 text-amber-600" /></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Retention</p><p className="mt-1 font-semibold text-slate-900">30 days</p><p className="text-xs text-slate-400">Automatic cleanup</p></div></CardContent></Card>
        </div>

        <Card className="border-slate-200 shadow-none"><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="text-base">Backup History</CardTitle><p className="mt-1 text-sm text-slate-500">Recent database backups available for download or restoration.</p></div><Button variant="outline" onClick={() => alert('Backup settings can be connected to the backend service.') }><RefreshCw className="mr-2 h-4 w-4" />Settings</Button></div></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-y bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Backup</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Created</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{backups.map((backup) => <tr key={backup.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-medium text-slate-800">{backup.name}</div><div className="text-xs text-slate-400">Database backup</div></td><td className="px-5 py-4"><Badge variant="outline">{backup.type}</Badge></td><td className="px-5 py-4 text-slate-600">{backup.size}</td><td className="px-5 py-4 text-slate-600">{backup.created}</td><td className="px-5 py-4"><StatusBadge status={backup.status} tone="success" /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" title="Download"><Download className="h-4 w-4" /></Button><Button size="sm" variant="ghost" title="Restore" onClick={() => { setSelectedBackup(backup.name); setShowRestore(true); }}><RotateCcw className="h-4 w-4" /></Button><Button size="sm" variant="ghost" title="Delete"><Trash2 className="h-4 w-4 text-rose-500" /></Button></div></td></tr>)}</tbody></table></div></CardContent></Card>

        <Card className="border-amber-200 bg-amber-50/50 shadow-none"><CardContent className="flex gap-3 p-4"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="font-medium text-amber-900">Restore is a destructive operation</p><p className="mt-1 text-sm text-amber-800">Restoring a backup may replace current ERP data. Always create a current backup before starting a restore operation.</p></div></CardContent></Card>

        <div className="grid gap-4 md:grid-cols-2"><Card className="border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">Upload Backup</CardTitle></CardHeader><CardContent><div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center"><Upload className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-medium text-slate-700">Upload a backup file</p><p className="mt-1 text-xs text-slate-400">Supported database backup files</p><Button variant="outline" className="mt-4">Choose File</Button></div></CardContent></Card><Card className="border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">Recovery Readiness</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm font-medium text-emerald-900">Backup protection is active</p><p className="text-xs text-emerald-700">Latest backup completed successfully.</p></div></div><div className="text-xs text-slate-500">For production recovery, connect these actions to your secured backup service and require administrator authorization.</div></CardContent></Card></div>
      </div>

      {showRestore && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Confirm Restore</h2><p className="mt-1 text-sm text-slate-500">You are about to restore the selected backup.</p></div><button onClick={() => setShowRestore(false)}><X className="h-5 w-5 text-slate-400" /></button></div><div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-medium text-amber-900">{selectedBackup}</p><p className="mt-1 text-xs text-amber-800">Current data may be replaced. This action should only be performed by an authorized administrator.</p></div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowRestore(false)}>Cancel</Button><Button variant="destructive" onClick={() => setShowRestore(false)}><RotateCcw className="mr-2 h-4 w-4" />Confirm Restore</Button></div></div></div>}
    </ModulePageShell>
  );
}
