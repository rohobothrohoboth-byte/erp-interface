import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import type { JobPostingListDto, JobPostingModDto } from '../../../../types/hr/recruit/jobPosting';
import { JobPostingType, PostingStatus } from '../../../../types/hr/enum';

interface EditJobPostingModalProps {
  isOpen: boolean;
  item: JobPostingListDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: JobPostingModDto) => void;
}

const EditJobPostingModal: React.FC<EditJobPostingModalProps> = ({ isOpen, item, isLoading = false, onClose, onSubmit }) => {
  const [form, setForm] = useState<Omit<JobPostingModDto, 'id' | 'rowVersion'>>({
    status: '0' as any,
    postType: '0' as any,
    deadlineDate: '',
  });

  useEffect(() => {
    if (item) setForm({
      status: item.status,
      postType: item.postType,
      deadlineDate: item.deadlineDate.split('T')[0],
    });
  }, [item]);

  const handleClose = () => { if (!isLoading) onClose(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    onSubmit({ ...form, id: item.id, rowVersion: item.rowVersion });
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <Megaphone size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Edit Job Posting</h2>
              <span className="ml-auto font-mono text-xs text-gray-400">{item.postNumber}</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Post Type */}
                <div className="space-y-2">
                  <Label>Post Type <span className="text-red-500">*</span></Label>
                  <EnumSelect
                    enumObject={JobPostingType}
                    value={form.postType as string}
                    onChange={(v) => setForm(f => ({ ...f, postType: v as any }))}
                    placeholder="Select type"
                    disabled={isLoading}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status <span className="text-red-500">*</span></Label>
                  <EnumSelect
                    enumObject={PostingStatus}
                    value={form.status as string}
                    onChange={(v) => setForm(f => ({ ...f, status: v as any }))}
                    placeholder="Select status"
                    disabled={isLoading}
                  />
                </div>

                {/* Deadline Date */}
                <div className="md:col-span-2 space-y-2">
                  <Label>Deadline Date <span className="text-red-500">*</span></Label>
                  <Input type="date" required value={form.deadlineDate}
                    onChange={(e) => setForm(f => ({ ...f, deadlineDate: e.target.value }))} disabled={isLoading} />
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

export default EditJobPostingModal;
