import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { JobReqListDto, JobReqModDto } from '../../../../types/hr/recruit/jobRequisition';
import { Gender, EmpNature, WorkArrangement } from '../../../../types/hr/enum';
import { nameListService } from '../../../../services/List/HrmmNameListService';
import { jgStepService } from '../../../../services/core/settings/ModHrm/JgStepService';

interface EditJobRequisitionModalProps {
  isOpen: boolean;
  item: JobReqListDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: JobReqModDto) => void;
}

const EditJobRequisitionModal: React.FC<EditJobRequisitionModalProps> = ({
  isOpen, item, isLoading = false, onClose, onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [jobGradeId, setJobGradeId] = useState('');
  const [form, setForm] = useState({
    reqReason: '', reqPositions: 1, budgetCode: '', startDate: '',
    positionId: '', jgStepId: '',
    keyRespo: '', desc: '', reqQual: '', keySkills: '',
    workLocation: '', preGender: '0', empNature: '0', workArr: '0',
  });

  useEffect(() => {
    if (item) {
      setStep(1);
      setForm({
        reqReason: item.reqReason ?? '',
        reqPositions: item.reqQuantity ?? 1,
        budgetCode: item.budgetCode ?? '',
        startDate: item.startDate?.split('T')[0] ?? '',
        positionId: '',
        jgStepId: '',
        keyRespo: '', desc: '', reqQual: '', keySkills: '',
        workLocation: '', preGender: '0', empNature: '0', workArr: '0',
      });
    }
  }, [item]);

  const { data: positions = [] } = useQuery({
    queryKey: ['positionNames'],
    queryFn: () => nameListService.getAllPositionNames(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const { data: jobGrades = [] } = useQuery({
    queryKey: ['jobGradeNames'],
    queryFn: () => nameListService.getAllJobGradeNames(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const { data: steps = [] } = useQuery({
    queryKey: ['jobGradeSteps', jobGradeId],
    queryFn: () => jgStepService.getJgStepsByJobGrade(jobGradeId),
    enabled: !!jobGradeId,
    staleTime: 5 * 60 * 1000,
  });

  const handleClose = () => { if (!isLoading) { setStep(1); onClose(); } };
  const step1Valid = !!(form.reqReason && form.budgetCode && form.startDate && form.positionId && form.jgStepId);

  const handleSubmit = () => {
    if (!item) return;
    onSubmit({
      id: item.id, rowVersion: item.rowVersion,
      reqReason: form.reqReason, reqPositions: form.reqPositions,
      budgetCode: form.budgetCode, startDate: form.startDate,
      positionId: form.positionId, jgStepId: form.jgStepId,
      keyRespo: form.keyRespo, desc: form.desc, reqQual: form.reqQual,
      keySkills: form.keySkills, workLocation: form.workLocation,
      preGender: form.preGender, empNature: form.empNature, workArr: form.workArr,
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
              <FileText size={20} className="text-green-600" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Edit Job Requisition</h2>
                <p className="text-xs text-gray-500">Step {step} of 2 — {step === 1 ? 'Requisition Info' : 'Job Description'} · {item.reqNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-2 w-8 rounded-full transition-colors ${s <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Positions <span className="text-red-500">*</span></Label>
                  <Input type="number" min={1} value={form.reqPositions}
                    onChange={(e) => setForm(f => ({ ...f, reqPositions: parseInt(e.target.value) || 1 }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Budget Code <span className="text-red-500">*</span></Label>
                  <Input value={form.budgetCode}
                    onChange={(e) => setForm(f => ({ ...f, budgetCode: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Position <span className="text-red-500">*</span></Label>
                  <Select value={form.positionId} onValueChange={(v) => setForm(f => ({ ...f, positionId: v }))} disabled={isLoading}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>{positions.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Grade</Label>
                  <Select value={jobGradeId} onValueChange={(v) => { setJobGradeId(v); setForm(f => ({ ...f, jgStepId: '' })); }} disabled={isLoading}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select job grade" /></SelectTrigger>
                    <SelectContent>{jobGrades.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Grade Step <span className="text-red-500">*</span></Label>
                  <Select value={form.jgStepId} onValueChange={(v) => setForm(f => ({ ...f, jgStepId: v }))} disabled={isLoading}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select grade step" /></SelectTrigger>
                    <SelectContent>{steps.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Reason <span className="text-red-500">*</span></Label>
                  <textarea rows={2} value={form.reqReason}
                    onChange={(e) => setForm(f => ({ ...f, reqReason: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50"
                    disabled={isLoading} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Location</Label>
                  <Input value={form.workLocation} onChange={(e) => setForm(f => ({ ...f, workLocation: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input value={form.reqQual} onChange={(e) => setForm(f => ({ ...f, reqQual: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Gender</Label>
                  <EnumSelect enumObject={Gender} value={form.preGender} onChange={(v) => setForm(f => ({ ...f, preGender: v }))} placeholder="Select gender" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Employment Nature</Label>
                  <EnumSelect enumObject={EmpNature} value={form.empNature} onChange={(v) => setForm(f => ({ ...f, empNature: v }))} placeholder="Select type" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Work Arrangement</Label>
                  <EnumSelect enumObject={WorkArrangement} value={form.workArr} onChange={(v) => setForm(f => ({ ...f, workArr: v }))} placeholder="Select arrangement" disabled={isLoading} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Key Skills</Label>
                  <Input value={form.keySkills} onChange={(e) => setForm(f => ({ ...f, keySkills: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Key Responsibilities</Label>
                  <textarea rows={3} value={form.keyRespo}
                    onChange={(e) => setForm(f => ({ ...f, keyRespo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50"
                    disabled={isLoading} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <textarea rows={3} value={form.desc}
                    onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50"
                    disabled={isLoading} />
                </div>
              </div>
            )}

            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-between items-center">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">Cancel</Button>
              <div className="flex gap-2">
                {step === 2 && (
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isLoading}
                    className="px-4 cursor-pointer flex items-center gap-1">
                    <ChevronLeft size={16} /> Back
                  </Button>
                )}
                {step === 1 ? (
                  <Button type="button" onClick={() => setStep(2)} disabled={!step1Valid || isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer flex items-center gap-1">
                    Next <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                    {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</> : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditJobRequisitionModal;
