import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import type { SupportTicket } from '../../../../types/crm';

const statusOptions: SupportTicket['status'][] = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];

interface ChangeTicketStatusModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ticketId: string, newStatus: SupportTicket['status'], note?: string) => void;
}

export default function ChangeTicketStatusModal({
  ticket,
  isOpen,
  onClose,
  onConfirm
}: ChangeTicketStatusModalProps) {
  const [newStatus, setNewStatus] = useState<SupportTicket['status']>('Open');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (ticket && newStatus) {
      onConfirm(ticket.id, newStatus, note);
      setNote('');
      onClose();
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Change Ticket Status</h2>
        </div>

        <div className="px-6">
          <div className="py-4 space-y-3">
            <div className="space-y-1">
              <Label>New Status <span className="text-red-500">*</span></Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as SupportTicket['status'])}
                defaultValue={ticket.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status change..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleConfirm}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={!newStatus || newStatus === ticket.status}
            >
              <Save className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
