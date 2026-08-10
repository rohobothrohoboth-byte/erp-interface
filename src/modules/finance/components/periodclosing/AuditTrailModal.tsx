import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

type AuditEntry = {
  id: string;
  action: string;
  user: string;
  at: string;
};

type AuditTrailModalProps = {
  open?: boolean;
  entries?: AuditEntry[];
  onClose?: () => void;
};

const DEFAULT_ENTRIES: AuditEntry[] = [
  { id: 'a1', action: 'Period opened', user: 'Controller', at: '2026-08-01 09:12' },
  { id: 'a2', action: 'Adjusting entry posted', user: 'Accountant', at: '2026-08-05 14:40' },
  { id: 'a3', action: 'Close requested', user: 'Controller', at: '2026-08-09 17:05' },
];

export default function AuditTrailModal({
  open = false,
  entries = DEFAULT_ENTRIES,
  onClose,
}: AuditTrailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Period audit trail</DialogTitle>
        </DialogHeader>
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <div className="font-medium text-slate-900">{entry.action}</div>
              <div className="text-xs text-slate-500">
                {entry.user} · {entry.at}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
