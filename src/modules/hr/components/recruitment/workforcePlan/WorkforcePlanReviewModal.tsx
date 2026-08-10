import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import EnumSelect from '@/shared/components/ui/enumSelect';
import { showToast } from '@/shared/layout/layout';
import { useReviewWorkforcePlan } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { ReviewStat } from '@/modules/hr/types/enum';
import type { WorkforcePlanListDto } from '@/modules/hr/types/recruit/workforcePlan';

interface WorkforcePlanReviewModalProps {
  isOpen: boolean;
  item: WorkforcePlanListDto | null;
  onClose: () => void;
}

const defaultForm = { appCount: 0, status: '', comment: '' };

const WorkforcePlanReviewModal: React.FC<WorkforcePlanReviewModalProps> = ({ isOpen, item, onClose }) => {
  const [form, setForm] = useState(defaultForm);

  const reviewMutation = useReviewWorkforcePlan({
    onSuccess: () => {
      showToast.success('Review submitted successfully');
      setForm(defaultForm);
      onClose();
    },
    onError: (e) => showToast.error(e.message || 'Failed to submit review'),
  });

  const handleClose = () => { if (!reviewMutation.isPending) { setForm(defaultForm); onClose(); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    reviewMutation.mutate({
      id: item.id,
      appCount: form.appCount,
      status: form.status as any,
      comment: form.comment,
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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full">

            {/* Header */}
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <ClipboardCheck size={20} className="text-green-600" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Review Workforce Plan</h2>
                <p className="text-xs text-gray-500">{item.planCode} — {item.title}</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                {item.statusStr}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Approved Positions</Label>
                  <Input type="number" min={0} value={form.appCount}
                    onChange={(e) => setForm(f => ({ ...f, appCount: parseInt(e.target.value) || 0 }))}
                    disabled={reviewMutation.isPending} />
                </div>
                <div className="space-y-2">
                  <Label>Decision <span className="text-red-500">*</span></Label>
                  <EnumSelect
                    enumObject={ReviewStat}
                    value={form.status}
                    onChange={(v) => setForm(f => ({ ...f, status: v }))}
                    placeholder="Select decision"
                    disabled={reviewMutation.isPending}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Comment</Label>
                  <textarea rows={3} value={form.comment}
                    onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
                    placeholder="Add review notes..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50"
                    disabled={reviewMutation.isPending} />
                </div>
              </div>

              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
                <Button type="button" variant="outline" onClick={handleClose}
                  disabled={reviewMutation.isPending} className="px-6 cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={reviewMutation.isPending || !form.status}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                  {reviewMutation.isPending
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Submitting...</>
                    : <><Send className="w-4 h-4 mr-2" />Submit Review</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkforcePlanReviewModal;
