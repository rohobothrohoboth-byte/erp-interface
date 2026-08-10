import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import EnumSelect from '@/shared/components/ui/enumSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import RichTextEditor, { htmlToPlainText } from '@/shared/components/ui/RichTextEditor';
import type { JobReqAddDto } from '@/modules/hr/types/recruit/jobRequisition';
import { Gender, EmpNature, WorkArrangement } from '@/modules/hr/types/enum';
import { hrmmNamesApi } from '@/modules/list/services/hrmmNames/hrmmNames.api';
import { jgStepService } from '@/modules/core/services/settings/ModHrm/JgStepService';

interface AddJobRequisitionModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  workforcePlanId: string;
  onClose: () => void;
  onSubmit: (data: JobReqAddDto) => void;
}

const makeDefault = (workforcePlanId: string): JobReqAddDto => ({
  reqReason: '', reqPositions: 1, budgetCode: '',
  startDate: '', positionId: '', jgStepId: '', workforcePlanId,
  keyRespo: '', desc: '', reqQual: '', keySkills: '',
  workLocation: '', preGender: '0', empNature: '0', workArr: '0',
});

const AddJobRequisitionModal: React.FC<AddJobRequisitionModalProps> = ({
  isOpen, isLoading = false, workforcePlanId, onClose, onSubmit,
}) => {
  const [form, setForm] = useState<JobReqAddDto>(makeDefault(workforcePlanId));
  const [step, setStep] = useState(1);
  const [jobGradeId, setJobGradeId] = useState('');
  // Rich text HTML state (converted to plain text on submit)
  const [keyRespoHtml, setKeyRespoHtml] = useState('');
  const [reqQualHtml, setReqQualHtml] = useState('');
  const [keySkillsHtml, setKeySkillsHtml] = useState('');
  const [descHtml, setDescHtml] = useState('');

  const { data: positions = [] } = useQuery({
    queryKey: ['positionNames'],
    queryFn: () => hrmmNamesApi.getAllPositionNames(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const { data: jobGrades = [] } = useQuery({
    queryKey: ['jobGradeNames'],
    queryFn: () => hrmmNamesApi.getAllJobGradeNames(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const { data: steps = [] } = useQuery({
    queryKey: ['jobGradeSteps', jobGradeId],
    queryFn: () => jgStepService.getJgStepsByJobGrade(jobGradeId),
    enabled: !!jobGradeId,
    staleTime: 5 * 60 * 1000,
  });

  const reset = () => {
    setForm(makeDefault(workforcePlanId));
    setStep(1);
    setJobGradeId('');
    setKeyRespoHtml('');
    setReqQualHtml('');
    setKeySkillsHtml('');
    setDescHtml('');
  };
  const handleClose = () => { if (!isLoading) { reset(); onClose(); } };

  // Step 1 validation — no form required attrs, manual check
  const step1Valid = !!(form.reqReason && form.budgetCode && form.startDate && form.positionId && form.jgStepId);

  const handleNext = () => { if (step1Valid) setStep(2); };
  const handleSubmit = () => {
    onSubmit({
      ...form,
      keyRespo: htmlToPlainText(keyRespoHtml),
      reqQual: htmlToPlainText(reqQualHtml),
      keySkills: htmlToPlainText(keySkillsHtml),
      desc: htmlToPlainText(descHtml),
    });
    reset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.75, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <FileText size={20} className="text-green-600" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Add Job Requisition</h2>
                <p className="text-xs text-gray-500">Step {step} of 2 — {step === 1 ? 'Requisition Info' : 'Job Description'}</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-2 w-8 rounded-full transition-colors ${s <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>

            {/* STEP 1 — plain div, no form, no required attrs */}
            {step === 1 && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Positions <span className="text-red-500">*</span></Label>
                  <Input type="number" min={1} value={form.reqPositions}
                    onChange={(e) => setForm(f => ({ ...f, reqPositions: parseInt(e.target.value) || 1 }))}
                    disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Budget Code <span className="text-red-500">*</span></Label>
                  <Input value={form.budgetCode}
                    onChange={(e) => setForm(f => ({ ...f, budgetCode: e.target.value }))}
                    placeholder="e.g. BDG-2024-001" disabled={isLoading} />
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
                    <SelectContent>
                      {positions.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Grade <span className="text-red-500">*</span></Label>
                  <Select value={jobGradeId} onValueChange={(v) => { setJobGradeId(v); setForm(f => ({ ...f, jgStepId: '' })); }} disabled={isLoading}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select job grade" /></SelectTrigger>
                    <SelectContent>
                      {jobGrades.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Grade Step <span className="text-red-500">*</span></Label>
                  <Select value={form.jgStepId} onValueChange={(v) => setForm(f => ({ ...f, jgStepId: v }))} disabled={!jobGradeId || isLoading}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select grade step" /></SelectTrigger>
                    <SelectContent>
                      {steps.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Reason <span className="text-red-500">*</span></Label>
                  <textarea rows={2} value={form.reqReason}
                    onChange={(e) => setForm(f => ({ ...f, reqReason: e.target.value }))}
                    placeholder="Reason for this requisition..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50"
                    disabled={isLoading} />
                </div>
              </div>
            )}

            {/* STEP 2 — job description fields */}
            {step === 2 && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Location</Label>
                  <Input value={form.workLocation}
                    onChange={(e) => setForm(f => ({ ...f, workLocation: e.target.value }))}
                    placeholder="e.g. Addis Ababa" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Gender</Label>
                  <EnumSelect enumObject={Gender} value={form.preGender}
                    onChange={(v) => setForm(f => ({ ...f, preGender: v }))}
                    placeholder="Select gender" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Employment Nature</Label>
                  <EnumSelect enumObject={EmpNature} value={form.empNature}
                    onChange={(v) => setForm(f => ({ ...f, empNature: v }))}
                    placeholder="Select type" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Work Arrangement</Label>
                  <EnumSelect enumObject={WorkArrangement} value={form.workArr}
                    onChange={(v) => setForm(f => ({ ...f, workArr: v }))}
                    placeholder="Select arrangement" disabled={isLoading} />
                </div>
                <div className=" space-y-2">
                  <Label>Key Skills</Label>
                  <RichTextEditor
                    value={keySkillsHtml}
                    onChange={setKeySkillsHtml}
                    placeholder="e.g. React, TypeScript, Node.js..."
                    disabled={isLoading}
                    minHeight="70px"
                  />
                </div>
                <div className=" space-y-2">
                  <Label>Key Responsibilities</Label>
                  <RichTextEditor
                    value={keyRespoHtml}
                    onChange={setKeyRespoHtml}
                    placeholder="List key responsibilities..."
                    disabled={isLoading}
                    minHeight="70px"
                  />
                </div>
                <div className=" space-y-2">
                  <Label>Required Qualifications</Label>
                  <RichTextEditor
                    value={reqQualHtml}
                    onChange={setReqQualHtml}
                    placeholder="e.g. BSc Computer Science, 3+ years experience..."
                    disabled={isLoading}
                    minHeight="70px"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={descHtml}
                    onChange={setDescHtml}
                    placeholder="Describe the role..."
                    disabled={isLoading}
                    minHeight="70px"
                  />
                </div>
              </div>
            )}

            {/* Footer — no form, all buttons are type="button" */}
            <div className="relative border-t px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center items-center">
              {step === 2 && (
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isLoading}
                    className=" absolute left-6  px-4 cursor-pointer flex items-center gap-1">
                    <ChevronLeft size={16} /> Back
                  </Button>
                )}
              <div className="flex gap-2 items-center justify-center">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">
                Cancel
              </Button>
                {step === 1 ? (
                  <Button type="button" onClick={handleNext} disabled={!step1Valid || isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer flex items-center gap-1">
                    Next <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
                    {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Adding...</> : 'Add Requisition'}
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

export default AddJobRequisitionModal;
