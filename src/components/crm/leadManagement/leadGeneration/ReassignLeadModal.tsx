import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { Lead } from '../../../../types/crm';

const salesReps = ['Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'Robert Chen', 'Lisa Anderson'];

interface ReassignLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  selectedRep: string;
  onRepChange: (rep: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ReassignLeadModal({
  lead,
  isOpen,
  selectedRep,
  onRepChange,
  onConfirm,
  onClose,
}: ReassignLeadModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10 rounded-t-xl">
          <UserPlus size={20} className="text-orange-600" />
          <h2 className="text-lg font-bold text-gray-800">Reassign Lead</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">

          <div className="space-y-2">
            <Label htmlFor="salesRep" className="text-sm text-gray-500">
              Select Sales Rep <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedRep} onValueChange={onRepChange}>
              <SelectTrigger
                id="salesRep"
                className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              >
                <SelectValue placeholder="Choose a sales rep" />
              </SelectTrigger>
              <SelectContent>
                {salesReps.map((rep) => (
                  <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 rounded-b-xl">
          <div className="flex justify-center items-center gap-2">
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              onClick={onConfirm}
              disabled={!selectedRep}
            >
              Assign
            </Button>
            <Button variant="outline" className="px-6" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
