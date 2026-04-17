import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import type { JobPostingAddDto } from '../../../../types/hr/recruit/jobPosting';
import { JobPostingType } from '../../../../types/hr/enum';

interface AddJobPostingModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  reqId: string;
  onClose: () => void;
  onSubmit: (data: JobPostingAddDto) => void;
}

const makeDefault = (reqId: string): JobPostingAddDto => ({
  id: reqId,
  postType: '0' as any,
  deadlineDate: '',
});

const AddJobPostingModal: React.FC<AddJobPostingModalProps> = ({ isOpen, isLoading = false, reqId, onClose, onSubmit }) => {
  const [form, setForm] = useState<JobPostingAddDto>(makeDefault(reqId));

  const reset = () => setForm(makeDefault(reqId));
  const handleClose = () => { if (!isLoading) { reset(); onClose(); } };
  const handleSubmit = () => {
    onSubmit({
      id: reqId,  // always use the prop directly, not form.id
      postType: form.postType,
      deadlineDate: form.deadlineDate ? new Date(form.deadlineDate).toISOString() : '',
    });
    reset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <Megaphone size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Add Job Posting</h2>
            </div>
            <div>
              <div className="p-6 space-y-4">
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
                <div className="space-y-2">
                  <Label>Deadline Date <span className="text-red-500">*</span></Label>
                  <Input type="date" required value={form.deadlineDate}
                    onChange={(e) => setForm(f => ({ ...f, deadlineDate: e.target.value }))} disabled={isLoading} />
                </div>
              </div>
              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">Cancel</Button>
                <Button type="button" disabled={isLoading || !form.deadlineDate} onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                  {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Adding...</> : 'Add Posting'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddJobPostingModal;
