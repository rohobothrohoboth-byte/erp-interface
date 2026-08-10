// src/pages/hr/recruitment/workforcePlan/WorkforcePlanEdit.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import WorkforcePlanForm from '@/modules/hr/components/recruitment/workforcePlan/WorkforcePlanForm';
import { useWorkforcePlan, useUpdateWorkforcePlan } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import toast from 'react-hot-toast';

const WorkforcePlanEdit: React.FC = () => {
    const { planId = '' } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    const { data: plan, isLoading } = useWorkforcePlan(planId);
    const updateMutation = useUpdateWorkforcePlan({
        onSuccess: (data) => {
            toast.success('Workforce plan updated successfully');
            navigate(`/hr/recruitment/workforce-plan/${data.id}`);
        },
        onError: (error) => toast.error(error.message)
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Workforce plan not found</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate(`/hr/recruitment/workforce-plan/${planId}`)} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Edit Workforce Plan</h1>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <WorkforcePlanForm
                        initialData={{
                            planCode: plan.planCode,
                            title: plan.title,
                            desc: plan.desc,
                            departmentId: plan.departmentId,
                            year: plan.year,
                            startDate: plan.startDate.split('T')[0],
                            endDate: plan.endDate.split('T')[0],
                            totalPositions: plan.totalPositions,
                            budget: plan.budget,
                            budgetCurrency: plan.budgetCurrency,
                        }}
                        onSubmit={(data) => updateMutation.mutate({ ...data, id: planId, rowVersion: plan.rowVersion, statusStr: plan.statusStr })}
                        onCancel={() => navigate(`/hr/recruitment/workforce-plan/${planId}`)}
                        isSubmitting={updateMutation.isPending}
                        isEdit
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default WorkforcePlanEdit;