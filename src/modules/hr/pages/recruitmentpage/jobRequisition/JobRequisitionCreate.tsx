// src/pages/hr/recruitmentpage/jobRequisition/JobRequisitionCreate.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import EnumSelect from '@/shared/components/ui/enumSelect';
import { showToast } from '@/shared/layout/layout';
import { useCreateJobRequisition } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.queries';
import { useWorkforcePlan } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { workforcePlanApi } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.api';
import { hrmmNamesApi } from '@/modules/list/services/hrmmNames/hrmmNames.api';
import { jgStepService } from '@/modules/core/services/settings/ModHrm/JgStepService';
import { Gender, EmpNature, WorkArrangement } from '@/modules/hr/types/enum';
import type { JobReqAddDto } from '@/modules/hr/types/recruit/jobRequisition';

const makeDefault = (workforcePlanId: string): JobReqAddDto => ({
    reqReason: '', reqPositions: 1, budgetCode: '',
    startDate: '', positionId: '', jgStepId: '', workforcePlanId,
    keyRespo: '', desc: '', reqQual: '', keySkills: '',
    workLocation: '', preGender: '0', empNature: '0', workArr: '0',
});

const JobRequisitionCreate: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('planId') || '';

    const [form, setForm] = useState<JobReqAddDto>(makeDefault(planId));
    const [jobGradeId, setJobGradeId] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: plan } = useWorkforcePlan(planId);

    // When no plan was pre-selected (e.g. arriving from the global "New Requisition"
    // button), let the user pick one here instead of dead-ending.
    const { data: allPlans = [] } = useQuery({
        queryKey: ['workforcePlans'],
        queryFn: () => workforcePlanApi.getAll(),
        enabled: !planId,
        staleTime: 60 * 1000,
    });
    const selectablePlans = (allPlans as any[]).filter(
        (p) => ['Approved', 'Approve', 'Active'].includes(p.statusStr) || String(p.status) === '0' || String(p.status) === '1',
    );

    const { data: positions = [] } = useQuery({
        queryKey: ['positionNames'],
        queryFn: () => hrmmNamesApi.getAllPositionNames(),
        staleTime: 5 * 60 * 1000,
    });
    const { data: jobGrades = [] } = useQuery({
        queryKey: ['jobGradeNames'],
        queryFn: () => hrmmNamesApi.getAllJobGradeNames(),
        staleTime: 5 * 60 * 1000,
    });
    const { data: steps = [] } = useQuery({
        queryKey: ['jobGradeSteps', jobGradeId],
        queryFn: () => jgStepService.getJgStepsByJobGrade(jobGradeId),
        enabled: !!jobGradeId,
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useCreateJobRequisition({
        onSuccess: (data) => {
            showToast.success('Job requisition created successfully');
            navigate(`/hr/recruitment/requisition/${data.id}`);
        },
        onError: (error) => {
            showToast.error(error.message || 'Failed to create job requisition');
            setIsSubmitting(false);
        },
    });

    const set = <K extends keyof JobReqAddDto>(k: K, v: JobReqAddDto[K]) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => ({ ...e, [k as string]: '' }));
    };

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.workforcePlanId) e.workforcePlanId = 'Workforce plan is required';
        if (!form.positionId) e.positionId = 'Position is required';
        if (!form.jgStepId) e.jgStepId = 'Job grade step is required';
        if (!form.reqPositions || form.reqPositions < 1) e.reqPositions = 'At least 1 position';
        if (!form.budgetCode.trim()) e.budgetCode = 'Budget code is required';
        if (!form.startDate) e.startDate = 'Start date is required';
        if (!form.reqReason.trim()) e.reqReason = 'Reason is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        createMutation.mutate(form);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/hr/recruitment/requisitions')} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Job Requisition</h1>
                    {plan && (
                        <p className="text-sm text-gray-500 mt-1">
                            For workforce plan: {(plan as any).planCode} - {(plan as any).title}
                        </p>
                    )}
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Workforce plan (picker when none was pre-selected) */}
                        <div className="space-y-2">
                            <Label>Workforce Plan <span className="text-red-500">*</span></Label>
                            {planId ? (
                                <Input value={plan ? `${(plan as any).planCode} — ${(plan as any).title}` : 'Selected plan'} disabled readOnly className="bg-gray-50" />
                            ) : (
                                <Select value={form.workforcePlanId} onValueChange={(v) => set('workforcePlanId', v)} disabled={isSubmitting}>
                                    <SelectTrigger className={`w-full ${errors.workforcePlanId ? 'border-red-500' : ''}`}><SelectValue placeholder="Select an approved workforce plan" /></SelectTrigger>
                                    <SelectContent>
                                        {selectablePlans.length === 0 && (
                                            <div className="px-3 py-2 text-xs text-gray-400">No approved workforce plans yet</div>
                                        )}
                                        {selectablePlans.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.planCode ? `${p.planCode} — ` : ''}{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.workforcePlanId && <p className="text-xs text-red-500">{errors.workforcePlanId}</p>}
                        </div>

                        {/* Requisition info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Position <span className="text-red-500">*</span></Label>
                                <Select value={form.positionId} onValueChange={(v) => set('positionId', v)} disabled={isSubmitting}>
                                    <SelectTrigger className={`w-full ${errors.positionId ? 'border-red-500' : ''}`}><SelectValue placeholder="Select position" /></SelectTrigger>
                                    <SelectContent>
                                        {positions.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.positionId && <p className="text-xs text-red-500">{errors.positionId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Number of Openings <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input type="number" min={1} value={form.reqPositions}
                                        onChange={(e) => set('reqPositions', parseInt(e.target.value) || 1)}
                                        className={`pl-9 ${errors.reqPositions ? 'border-red-500' : ''}`} disabled={isSubmitting} />
                                </div>
                                {errors.reqPositions && <p className="text-xs text-red-500">{errors.reqPositions}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Job Grade <span className="text-red-500">*</span></Label>
                                <Select value={jobGradeId} onValueChange={(v) => { setJobGradeId(v); set('jgStepId', ''); }} disabled={isSubmitting}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select job grade" /></SelectTrigger>
                                    <SelectContent>
                                        {jobGrades.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Job Grade Step <span className="text-red-500">*</span></Label>
                                <Select value={form.jgStepId} onValueChange={(v) => set('jgStepId', v)} disabled={!jobGradeId || isSubmitting}>
                                    <SelectTrigger className={`w-full ${errors.jgStepId ? 'border-red-500' : ''}`}><SelectValue placeholder="Select grade step" /></SelectTrigger>
                                    <SelectContent>
                                        {steps.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.jgStepId && <p className="text-xs text-red-500">{errors.jgStepId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Budget Code <span className="text-red-500">*</span></Label>
                                <Input value={form.budgetCode} onChange={(e) => set('budgetCode', e.target.value)}
                                    placeholder="e.g. BDG-2024-001" className={errors.budgetCode ? 'border-red-500' : ''} disabled={isSubmitting} />
                                {errors.budgetCode && <p className="text-xs text-red-500">{errors.budgetCode}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Start Date <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                                        className={`pl-9 ${errors.startDate ? 'border-red-500' : ''}`} disabled={isSubmitting} />
                                </div>
                                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason for Requisition <span className="text-red-500">*</span></Label>
                            <Textarea value={form.reqReason} onChange={(e) => set('reqReason', e.target.value)}
                                placeholder="Why is this position needed?" rows={2}
                                className={errors.reqReason ? 'border-red-500' : ''} disabled={isSubmitting} />
                            {errors.reqReason && <p className="text-xs text-red-500">{errors.reqReason}</p>}
                        </div>

                        {/* Job description */}
                        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Work Location</Label>
                                <Input value={form.workLocation} onChange={(e) => set('workLocation', e.target.value)}
                                    placeholder="e.g. Addis Ababa / Remote" disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Preferred Gender</Label>
                                <EnumSelect enumObject={Gender} value={form.preGender} onChange={(v) => set('preGender', v)}
                                    placeholder="Select gender" disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Employment Nature</Label>
                                <EnumSelect enumObject={EmpNature} value={form.empNature} onChange={(v) => set('empNature', v)}
                                    placeholder="Select type" disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Work Arrangement</Label>
                                <EnumSelect enumObject={WorkArrangement} value={form.workArr} onChange={(v) => set('workArr', v)}
                                    placeholder="Select arrangement" disabled={isSubmitting} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Key Responsibilities</Label>
                            <Textarea value={form.keyRespo} onChange={(e) => set('keyRespo', e.target.value)}
                                placeholder="List key responsibilities..." rows={3} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label>Required Qualifications</Label>
                            <Textarea value={form.reqQual} onChange={(e) => set('reqQual', e.target.value)}
                                placeholder="e.g. BSc Computer Science, 3+ years experience..." rows={3} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label>Key Skills</Label>
                            <Textarea value={form.keySkills} onChange={(e) => set('keySkills', e.target.value)}
                                placeholder="e.g. React, TypeScript, Node.js..." rows={2} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.desc} onChange={(e) => set('desc', e.target.value)}
                                placeholder="Describe the role..." rows={4} disabled={isSubmitting} />
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Requisition Information</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        The requisition will be reviewed and approved by HR. Once approved, you can create job postings from it.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate('/hr/recruitment/requisitions')} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Creating...</>
                                ) : (
                                    <><FileText className="w-4 h-4 mr-2" />Create Requisition</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default JobRequisitionCreate;
