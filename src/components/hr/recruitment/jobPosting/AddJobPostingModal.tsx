import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { JobPostingAddDto } from '../../../../types/hr/recruit/jobPosting';
import { JobPostingType } from '../../../../types/hr/enum';
import { jobRequisitionApi } from '../../../../services/hr/recruitment/jobRequisition/jobRequisition.api';

interface AddJobPostingModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: JobPostingAddDto) => void;
}

const defaultForm: JobPostingAddDto = {
  id: '',
  postType: '0' as any,
  deadlineDate: '',
};

const AddJobPostingModal: React.FC<AddJobPostingModalProps> = ({ isOpen, isLoading = false, onClose, onSubmit }) => {
  const [form, setForm] = useState<JobPostingAddDto>(defaultForm);

  const { data: jobReqs = [] } = useQuery({
    queryKey: ['jobReqList'],
    queryFn: () => jobRequisitionApi.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const reset = () => setForm(defaultForm);
  const handleClose = () => { if (!isLoading) { reset(); onClose(); } };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form); reset(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <Megaphone size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Add Job Posting</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Requisition select */}
                <div className="md:col-span-2 space-y-2">
                  <Label>Job Requisition <span className="text-red-500">*</span></Label>
                  <Select value={form.id} onValueChange={(v) => setForm(f => ({ ...f, id: v }))} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="— Select requisition —" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobReqs.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.reqNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Post Type — enum */}
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

                {/* Deadline Date */}
                <div className="space-y-2">
                  <Label>Deadline Date <span className="text-red-500">*</span></Label>
                  <Input type="date" required value={form.deadlineDate}
                    onChange={(e) => setForm(f => ({ ...f, deadlineDate: e.target.value }))} disabled={isLoading} />
                </div>
              </div>

              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={isLoading || !form.id} className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                  {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Adding...</> : 'Add Posting'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddJobPostingModal;
