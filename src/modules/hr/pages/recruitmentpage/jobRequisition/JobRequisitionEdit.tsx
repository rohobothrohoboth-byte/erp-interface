// src/pages/hr/recruitmentpage/jobRequisition/JobRequisitionEdit.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import EnumSelect from '@/shared/components/ui/enumSelect';
import { showToast } from '@/shared/layout/layout';
import { jobRequisitionApi } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.api';
import { useUpdateJobRequisition } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.queries';
import { hrmmNamesApi } from '@/modules/list/services/hrmmNames/hrmmNames.api';
import { Gender, EmpNature, WorkArrangement } from '@/modules/hr/types/enum';

const JobRequisitionEdit: React.FC = () => {
    const { reqId = '' } = useParams<{ reqId: string }>();
    const navigate = useNavigate();

    const { data: detail, isLoading } = useQuery({
        queryKey: ['jobRequisition', 'detail', reqId],
        queryFn: () => jobRequisitionApi.getDetail(reqId),
        enabled: !!reqId,
    });

    const { data: positions = [] } = useQuery({
        queryKey: ['positionNames'],
        queryFn: () => hrmmNamesApi.getAllPositionNames(),
        staleTime: 5 * 60 * 1000,
    });

    const [form, setForm] = useState<any>({
        reqReason: '', reqPositions: 1, budgetCode: '', startDate: '',
        positionId: '', jgStepId: '', keyRespo: '', desc: '', reqQual: '',
        keySkills: '', workLocation: '', preGender: '0', empNature: '0', workArr: '0',
        rowVersion: '',
    });
    const [jgStepName, setJgStepName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateMutation = useUpdateJobRequisition({
        onSuccess: (data) => {
            showToast.success('Job requisition updated successfully');
            navigate(`/hr/recruitment/requisition/${data.id}`);
        },
        onError: (error) => {
            showToast.error(error.message || 'Failed to update job requisition');
            setIsSubmitting(false);
        },
    });

    useEffect(() => {
        if (detail) {
            setForm({
                reqReason: detail.reqReason || '',
                reqPositions: detail.reqQuantity || 1,
                budgetCode: detail.budgetCode || '',
                startDate: detail.startDate ? String(detail.startDate).slice(0, 10) : '',
                positionId: detail.positionId || '',
                jgStepId: detail.jgStepId || '',
                keyRespo: detail.keyRespo || '',
                desc: detail.desc || '',
                reqQual: detail.reqQual || '',
                keySkills: detail.keySkills || '',
                workLocation: detail.workLocation || '',
                preGender: detail.preGender || '0',
                empNature: detail.empNature || '0',
                workArr: detail.workArr || '0',
                rowVersion: detail.rowVersion || '',
            });
            setJgStepName(detail.jgStep || '');
        }
    }, [detail]);

    const set = (k: string, v: any) => {
        setForm((f: any) => ({ ...f, [k]: v }));
        setErrors((e) => ({ ...e, [k]: '' }));
    };

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.positionId) e.positionId = 'Position is required';
        if (!form.reqPositions || form.reqPositions < 1) e.reqPositions = 'At least 1 position';
        if (!form.budgetCode.trim()) e.budgetCode = 'Budget code is required';
        if (!form.startDate) e.startDate = 'Start date is required';
        if (!form.reqReason.trim()) e.reqReason = 'Reason is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate() || !detail) return;
        setIsSubmitting(true);
        updateMutation.mutate({
            id: reqId as any,
            reqReason: form.reqReason,
            reqPositions: Number(form.reqPositions),
            budgetCode: form.budgetCode,
            startDate: new Date(form.startDate).toISOString(),
            positionId: form.positionId,
            jgStepId: form.jgStepId,
            keyRespo: form.keyRespo,
            desc: form.desc,
            reqQual: form.reqQual,
            keySkills: form.keySkills,
            workLocation: form.workLocation,
            preGender: form.preGender,
            empNature: form.empNature,
            workArr: form.workArr,
            rowVersion: form.rowVersion,
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading requisition...</span>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Requisition not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/hr/recruitment/requisitions')}>
                    Back to Requisitions
                </Button>
            </div>
        );
    }

    // Editable while awaiting approval (Draft / Pending Approval).
    const canEdit = ['Draft', 'Pending Approval', 'Pending'].includes(detail.statusStr);
    if (!canEdit) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-600">This requisition cannot be edited</p>
                <p className="text-sm text-gray-400">Current status: {detail.statusStr}</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(`/hr/recruitment/requisition/${reqId}`)}>
                    View Requisition
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate(`/hr/recruitment/requisition/${reqId}`)} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Job Requisition</h1>
                    <p className="text-sm text-gray-500 mt-1">#{detail.reqNumber} - {detail.position}</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                <Label>Job Grade Step</Label>
                                <Input value={jgStepName} disabled readOnly className="bg-gray-50" />
                                <p className="text-[11px] text-gray-400">Grade step is fixed for an existing requisition.</p>
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
                                <Label>Budget Code <span className="text-red-500">*</span></Label>
                                <Input value={form.budgetCode} onChange={(e) => set('budgetCode', e.target.value)}
                                    className={errors.budgetCode ? 'border-red-500' : ''} disabled={isSubmitting} />
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
                                rows={2} className={errors.reqReason ? 'border-red-500' : ''} disabled={isSubmitting} />
                            {errors.reqReason && <p className="text-xs text-red-500">{errors.reqReason}</p>}
                        </div>

                        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Work Location</Label>
                                <Input value={form.workLocation} onChange={(e) => set('workLocation', e.target.value)} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Preferred Gender</Label>
                                <EnumSelect enumObject={Gender} value={form.preGender} onChange={(v) => set('preGender', v)} placeholder="Select gender" disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Employment Nature</Label>
                                <EnumSelect enumObject={EmpNature} value={form.empNature} onChange={(v) => set('empNature', v)} placeholder="Select type" disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Work Arrangement</Label>
                                <EnumSelect enumObject={WorkArrangement} value={form.workArr} onChange={(v) => set('workArr', v)} placeholder="Select arrangement" disabled={isSubmitting} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Key Responsibilities</Label>
                            <Textarea value={form.keyRespo} onChange={(e) => set('keyRespo', e.target.value)} rows={3} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label>Required Qualifications</Label>
                            <Textarea value={form.reqQual} onChange={(e) => set('reqQual', e.target.value)} rows={3} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label>Key Skills</Label>
                            <Textarea value={form.keySkills} onChange={(e) => set('keySkills', e.target.value)} rows={2} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.desc} onChange={(e) => set('desc', e.target.value)} rows={4} disabled={isSubmitting} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate(`/hr/recruitment/requisition/${reqId}`)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Updating...</>
                                ) : (
                                    <><FileText className="w-4 h-4 mr-2" />Update Requisition</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default JobRequisitionEdit;
