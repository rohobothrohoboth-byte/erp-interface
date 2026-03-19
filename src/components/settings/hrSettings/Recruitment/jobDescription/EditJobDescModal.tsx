import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import { Checkbox } from '../../../../ui/checkbox';
import type { JobDescriptionListDto, JobDescriptionAddDto } from '../../../../../types/hr/jobDescription';

interface EditJobDescModalProps {
  isOpen: boolean;
  item: JobDescriptionListDto | null;
  onClose: () => void;
  onSubmit: (data: JobDescriptionAddDto) => void;
}

const EditJobDescModal: React.FC<EditJobDescModalProps> = ({ isOpen, item, onClose, onSubmit }) => {
  const [form, setForm] = useState<JobDescriptionAddDto>({
    title: '',
    department: '',
    responsibilities: '',
    requirements: '',
    isActive: true,
  });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        department: item.department,
        responsibilities: item.responsibilities,
        requirements: item.requirements,
        isActive: item.isActive,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <FileText size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Edit Job Description</h2>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-title"
                        required
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-dept" className="text-sm font-medium text-gray-700">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-dept"
                        required
                        value={form.department}
                        onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <div className="flex items-center space-x-2 h-10">
                        <Checkbox
                          id="edit-isActive"
                          checked={form.isActive}
                          onCheckedChange={checked => setForm(f => ({ ...f, isActive: checked as boolean }))}
                        />
                        <Label htmlFor="edit-isActive" className="text-sm font-medium text-gray-700">
                          Active
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-resp" className="text-sm font-medium text-gray-700">
                        Responsibilities <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="edit-resp"
                        required
                        rows={4}
                        value={form.responsibilities}
                        onChange={e => setForm(f => ({ ...f, responsibilities: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-req" className="text-sm font-medium text-gray-700">
                        Requirements <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="edit-req"
                        required
                        rows={4}
                        value={form.requirements}
                        onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
                <div className="flex justify-center items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="cursor-pointer px-6 min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6 min-w-[100px]"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditJobDescModal;
