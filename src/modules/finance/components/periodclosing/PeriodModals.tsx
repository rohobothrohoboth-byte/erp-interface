import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

type PeriodModalsProps = {
  open?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  onClose?: () => void;
};

export default function PeriodModals({
  open = false,
  title = 'Close period',
  description = 'Closing a period prevents further journal postings.',
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}: PeriodModalsProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
