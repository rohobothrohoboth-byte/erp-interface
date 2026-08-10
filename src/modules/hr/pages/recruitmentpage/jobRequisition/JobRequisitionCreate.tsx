// src/pages/hr/recruitmentpage/jobRequisition/JobRequisitionCreate.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, Users, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { showToast } from '@/shared/layout/layout';
import { useCreateJobRequisition } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.queries';
import { useWorkforcePlan } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { useDepartments } from '@/modules/core/services/department/dept.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { JobReqAddDto } from '@/modules/hr/types/recruit/jobRequisition';

const JobRequisitionCreate: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('planId') || '';
    const { user } = useAuthStore();

    // ✅ Get employee ID from auth store
    const employeeId = user?.employeeId || user?.id || '';

    const [form, setForm] = useState<JobReqAddDto>({
        workforcePlanId: planId || '', // ✅ Will be converted to GUID
        position: '',
        departmentId: '',
        numOpen: 1,
        jobGrade: '',
        salary: 0,
        salaryCurrency: 'USD',
        desc: '',
        qualification: '',
        keySkills: '',
        employmentType: 'FullTime',
        preferredGender: 'Any',
        workLocation: '',
        reqReason: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: departments = [] } = useDepartments();
    const { data: plan } = useWorkforcePlan(planId);
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

    const employmentTypes = ['FullTime', 'PartTime', 'Contract', 'Internship', 'Temporary'];
    const genders = ['Any', 'Male', 'Female'];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'NGN', 'KES'];

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.workforcePlanId) {
            newErrors.workforcePlanId = 'Workforce plan is required';
        }
        if (!form.position.trim()) {
            newErrors.position = 'Position is required';
        }
        if (!form.departmentId) {
            newErrors.departmentId = 'Department is required';
        }
        if (!form.numOpen || form.numOpen < 1) {
            newErrors.numOpen = 'Must have at least 1 opening';
        }
        if (!form.jobGrade) {
            newErrors.jobGrade = 'Job grade is required';
        }
        if (!form.desc.trim()) {
            newErrors.desc = 'Job description is required';
        }
        if (!form.workLocation.trim()) {
            newErrors.workLocation = 'Work location is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        // ✅ Prepare the data with correct types
        const submitData = {
            workforcePlanId: form.workforcePlanId, // This will be sent as string, backend will convert to GUID
            position: form.position.trim(),
            departmentId: form.departmentId,
            numOpen: Number(form.numOpen),
            jobGrade: form.jobGrade.trim(),
            salary: Number(form.salary) || 0,
            salaryCurrency: form.salaryCurrency || 'USD',
            desc: form.desc.trim(),
            qualification: form.qualification?.trim() || '',
            keySkills: form.keySkills?.trim() || '',
            employmentType: form.employmentType || 'FullTime',
            preferredGender: form.preferredGender || 'Any',
            workLocation: form.workLocation.trim(),
            reqReason: form.reqReason?.trim() || '',
        };

        console.log('📤 Submitting requisition data:', submitData);
        createMutation.mutate(submitData);
    };

    // ✅ If no planId is provided, show error
    if (!planId) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h2 className="text-lg font-semibold text-red-700">No Workforce Plan Selected</h2>
                    <p className="text-sm text-red-600 mt-1">
                        Please select a workforce plan first before creating a requisition.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate('/hr/recruitment/workforce-plans')}
                    >
                        Go to Workforce Plans
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/hr/recruitment/requisitions')} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Job Requisition</h1>
                    {plan && (
                        <p className="text-sm text-gray-500 mt-1">
                            For workforce plan: {plan.planCode} - {plan.title}
                        </p>
                    )}
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Workforce Plan ID - Hidden */}
                        <input type="hidden" name="workforcePlanId" value={form.workforcePlanId} />

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Position <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={form.position}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, position: e.target.value }));
                                        setErrors(e => ({ ...e, position: '' }));
                                    }}
                                    placeholder="e.g. Senior Software Engineer"
                                    className={errors.position ? 'border-red-500' : ''}
                                    disabled={isSubmitting}
                                />
                                {errors.position && <p className="text-xs text-red-500">{errors.position}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Department <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    value={form.departmentId}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, departmentId: e.target.value }));
                                        setErrors(e => ({ ...e, departmentId: '' }));
                                    }}
                                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        errors.departmentId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId}</p>}
                            </div>
                        </div>

                        {/* Number of Openings & Job Grade */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Number of Openings <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="number"
                                        min={1}
                                        value={form.numOpen}
                                        onChange={(e) => {
                                            setForm(f => ({ ...f, numOpen: parseInt(e.target.value) || 1 }));
                                            setErrors(e => ({ ...e, numOpen: '' }));
                                        }}
                                        className={`pl-9 ${errors.numOpen ? 'border-red-500' : ''}`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.numOpen && <p className="text-xs text-red-500">{errors.numOpen}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Job Grade <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={form.jobGrade}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, jobGrade: e.target.value }));
                                        setErrors(e => ({ ...e, jobGrade: '' }));
                                    }}
                                    placeholder="e.g. Level 5 / Senior"
                                    className={errors.jobGrade ? 'border-red-500' : ''}
                                    disabled={isSubmitting}
                                />
                                {errors.jobGrade && <p className="text-xs text-red-500">{errors.jobGrade}</p>}
                            </div>
                        </div>

                        {/* Salary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Salary</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={form.salary || ''}
                                        onChange={(e) => setForm(f => ({ ...f, salary: parseFloat(e.target.value) || 0 }))}
                                        className="pl-9"
                                        disabled={isSubmitting}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Currency</Label>
                                <select
                                    value={form.salaryCurrency}
                                    onChange={(e) => setForm(f => ({ ...f, salaryCurrency: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={isSubmitting}
                                >
                                    {currencies.map(curr => (
                                        <option key={curr} value={curr}>{curr}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Employment Type & Preferred Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Employment Type</Label>
                                <select
                                    value={form.employmentType}
                                    onChange={(e) => setForm(f => ({ ...f, employmentType: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={isSubmitting}
                                >
                                    {employmentTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Preferred Gender</Label>
                                <select
                                    value={form.preferredGender}
                                    onChange={(e) => setForm(f => ({ ...f, preferredGender: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={isSubmitting}
                                >
                                    {genders.map(gender => (
                                        <option key={gender} value={gender}>{gender}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Work Location */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Work Location <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={form.workLocation}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, workLocation: e.target.value }));
                                        setErrors(e => ({ ...e, workLocation: '' }));
                                    }}
                                    placeholder="e.g. New York Office / Remote"
                                    className={`pl-9 ${errors.workLocation ? 'border-red-500' : ''}`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.workLocation && <p className="text-xs text-red-500">{errors.workLocation}</p>}
                        </div>

                        {/* Reason for Requisition */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Reason for Requisition</Label>
                            <Textarea
                                value={form.reqReason || ''}
                                onChange={(e) => setForm(f => ({ ...f, reqReason: e.target.value }))}
                                placeholder="Why is this position needed?"
                                rows={2}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Job Description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Job Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                value={form.desc}
                                onChange={(e) => {
                                    setForm(f => ({ ...f, desc: e.target.value }));
                                    setErrors(e => ({ ...e, desc: '' }));
                                }}
                                placeholder="Detailed job description..."
                                rows={6}
                                className={errors.desc ? 'border-red-500' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.desc && <p className="text-xs text-red-500">{errors.desc}</p>}
                        </div>

                        {/* Qualifications */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Qualifications</Label>
                            <Textarea
                                value={form.qualification || ''}
                                onChange={(e) => setForm(f => ({ ...f, qualification: e.target.value }))}
                                placeholder="Required qualifications and experience..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Key Skills */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Key Skills</Label>
                            <Textarea
                                value={form.keySkills || ''}
                                onChange={(e) => setForm(f => ({ ...f, keySkills: e.target.value }))}
                                placeholder="List key skills required..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Requisition Information</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        The requisition will be reviewed and approved by HR. Once approved, you can create job postings from this requisition.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/hr/recruitment/requisitions')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Create Requisition
                                    </>
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