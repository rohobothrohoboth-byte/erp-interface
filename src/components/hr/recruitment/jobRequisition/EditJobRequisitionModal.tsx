import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import type { JobReqListDto, JobReqModDto } from '../../../../types/hr/recruit/jobRequisition';
import { Gender, EmpNature } from '../../../../types/hr/enum';
import { nameListService } from '../../../../services/List/HrmmNameListService';
import { useWorkforcePlans } from '../../../../services/hr/recruitment/workforcePlan/workforcePlan.queries';
import { api } from '../../../../services/api';

interface EditJobRequisitionModalProps {
  isOpen: boolean;
  item: JobReqListDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: JobReqModDto) => void;
}

const BASE_JD = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JobDec`;

const EditJobRequisitionModal: React.FC<EditJobRequisitionModalProps> = ({ isOpen, item, isLoading = false, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    reqReason: '', reqPositions: 1, budgetCode: '', startDate: '',
    positionId: '', jgStepId: '',
    title: '', desc: '', qualification: '', keySkills: '',
    workLocation: '', preGender: '0', contractType: '0',
  });

  useEffect(() => {
    if (item) setForm({
      reqReason: item.reqReason,
      reqPositions: item.reqQuantity ?? 1,
      budgetCode: item.budgetCode,
      startDate: item.startDate?.split('T')[0] ?? '',
      positionId: item.positionId,
      jgStepId: item.jgStepId,
      title: '', desc: '', qualification: '', keySkills: '',
      workLocation: '', preGender: '0', contractType: '0',
    });
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

  const { data: workforcePlans = [] } = useWorkforcePlans();

  const { data: jobDescriptions = [] } = useQuery({
    queryKey: ['jobDescNames'],
    queryFn: async () => {
      const res = await api.get(`${BASE_JD}/AllJobDec`);
      return (res.data?.data ?? []) as { id: string; title: string }[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const handleClose = () => { if (!isLoading) onClose(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    onSubmit({
      id: item.id,
      rowVersion: item.rowVersion,
      reqReason: form.reqReason,
      reqPositions: form.reqPositions,
      budgetCode: form.budgetCode,
      startDate: form.startDate,
      positionId: form.positionId,
      jgStepId: form.jgStepId,
      title: form.title,
      desc: form.desc,
      qualification: form.qualification,
      keySkills: form.keySkills,
      workLocation: form.workLocation,
      preGender: form.preGender as any,
      contractType: form.contractType as any,
    });
  };

  const SelectField = ({ label, value, onChange, options, required = false }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { id: string; name: string }[]; required?: boolean;
  }) => (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        required={required} disabled={isLoading}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50">
        <option value="">— Select —</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
              <FileText size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Edit Job Requisition</h2>
              <span className="ml-auto font-mono text-xs text-gray-400">{item.reqNumber}</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Positions <span className="text-red-500">*</span></Label>
                  <Input type="number" min={1} required value={form.reqPositions}
                    onChange={(e) => setForm(f => ({ ...f, reqPositions: parseInt(e.target.value) || 1 }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Budget Code <span className="text-red-500">*</span></Label>
                  <Input required value={form.budgetCode}
                    onChange={(e) => setForm(f => ({ ...f, budgetCode: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Reason <span className="text-red-500">*</span></Label>
                  <textarea required rows={2} value={form.reqReason}
                    onChange={(e) => setForm(f => ({ ...f, reqReason: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Input type="date" required value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Work Location</Label>
                  <Input value={form.workLocation}
                    onChange={(e) => setForm(f => ({ ...f, workLocation: e.target.value }))} disabled={isLoading} />
                </div>

                <SelectField label="Position" value={form.positionId} required
                  onChange={(v) => setForm(f => ({ ...f, positionId: v }))} options={positions} />
                <SelectField label="Job Grade Step" value={form.jgStepId} required
                  onChange={(v) => setForm(f => ({ ...f, jgStepId: v }))} options={jobGrades} />
                <SelectField label="Workforce Plan" value={''}
                  onChange={(_v) => {}}
                  options={workforcePlans.map(p => ({ id: p.id, name: `${p.planCode} — ${p.title}` }))} />
                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <select value={form.title} onChange={(e) => {
                    const jd = jobDescriptions.find(j => j.id === e.target.value);
                    setForm(f => ({ ...f, title: jd?.title ?? '' }));
                  }} disabled={isLoading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50">
                    <option value="">— Select —</option>
                    {jobDescriptions.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Gender</Label>
                  <EnumSelect enumObject={Gender} value={form.preGender}
                    onChange={(v) => setForm(f => ({ ...f, preGender: v }))}
                    placeholder="Select gender" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <EnumSelect enumObject={EmpNature} value={form.contractType}
                    onChange={(v) => setForm(f => ({ ...f, contractType: v }))}
                    placeholder="Select type" disabled={isLoading} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <textarea rows={2} value={form.desc}
                    onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input value={form.qualification}
                    onChange={(e) => setForm(f => ({ ...f, qualification: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Key Skills</Label>
                  <Input value={form.keySkills}
                    onChange={(e) => setForm(f => ({ ...f, keySkills: e.target.value }))} disabled={isLoading} />
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

export default EditJobRequisitionModal;
