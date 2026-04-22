import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { useWorkforcePlans } from '../../../../services/hr/recruitment/workforcePlan/workforcePlan.queries';
import { JobPostingType } from '../../../../types/hr/enum';

interface PostAllModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (wfpId: string, postType: string, deadlineDate: string) => void;
}

const PostAllModal: React.FC<PostAllModalProps> = ({ isOpen, isLoading = false, onClose, onSubmit }) => {
  const [wfpId, setWfpId] = useState('');
  const [postType, setPostType] = useState('0');
  const [deadlineDate, setDeadlineDate] = useState('');

  const { data: plans = [] } = useWorkforcePlans();

  const reset = () => { setWfpId(''); setPostType('0'); setDeadlineDate(''); };
  const handleClose = () => { if (!isLoading) { reset(); onClose(); } };
  const handleSubmit = () => {
    if (!wfpId || !deadlineDate) return;
    onSubmit(wfpId, postType, new Date(deadlineDate).toISOString());
    reset();
  };

  const isValid = !!wfpId && !!deadlineDate;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 border-b px-6 py-4">
              <Megaphone size={20} className="text-green-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">Post All Job Requisitions</h2>
                <p className="text-xs text-gray-500">Creates postings for all approved requisitions in the selected plan</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Workforce Plan <span className="text-red-500">*</span></Label>
                <Select value={wfpId} onValueChange={setWfpId} disabled={isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select workforce plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.planCode} — {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Post Type <span className="text-red-500">*</span></Label>
                <EnumSelect
                  enumObject={JobPostingType}
                  value={postType}
                  onChange={setPostType}
                  placeholder="Select type"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline Date <span className="text-red-500">*</span></Label>
                <Input type="date" value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={!isValid || isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                {isLoading
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Posting...</>
                  : <><Megaphone className="w-4 h-4 mr-2" />Post All</>}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostAllModal;
