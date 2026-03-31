import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import type { WorkforcePlanListDto, WorkforcePlanModDto } from '../../../../types/hr/recruit/workforcePlan';

interface EditWorkforcePlanModalProps {
  isOpen: boolean;
  item: WorkforcePlanListDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: WorkforcePlanModDto) => void;
}

const EditWorkforcePlanModal: React.FC<EditWorkforcePlanModalProps> = ({ isOpen, item, isLoading = false, onClose, onSubmit }) => {
  const [form, setForm] = useState({ title: '', desc: '', startDate: '', endDate: '', totalPositions: 1 });

  useEffect(() => {
    if (item) setForm({
      title: item.title,
      desc: item.desc,
      startDate: item.startDate.split('T')[0],
      endDate: item.endDate.split('T')[0],
      totalPositions: item.totalPositions,
    });
  }, [item]);

  const handleClose = () => { if (!isLoading) onClose(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    onSubmit({
      id: item.id,
      rowVersion: item.rowVersion,
      title: form.title,
      desc: form.desc,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      totalPositions: form.totalPositions,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <ClipboardList size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Edit Workforce Plan</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input required value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Description <span className="text-red-500">*</span></Label>
                  <textarea required rows={3} value={form.desc}
                    onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Input type="date" required value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Input type="date" required value={form.endDate}
                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Total Positions <span className="text-red-500">*</span></Label>
                  <Input type="number" min={1} required value={form.totalPositions}
                    onChange={(e) => setForm(f => ({ ...f, totalPositions: parseInt(e.target.value) || 1 }))} disabled={isLoading} />
                </div>
              </div>
              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                  {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditWorkforcePlanModal;
