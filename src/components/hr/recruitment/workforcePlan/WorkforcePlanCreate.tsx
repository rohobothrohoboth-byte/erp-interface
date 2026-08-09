// src/pages/hr/recruitment/workforcePlan/WorkforcePlanCreate.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '../../../ui/button.tsx';
import { Card, CardContent } from '../../../ui/card.tsx';
import WorkforcePlanForm from '../../../../components/hr/recruitment/workforcePlan/WorkforcePlanForm';
import { useCreateWorkforcePlan } from '../../../../services/hr/recruitment/workforcePlan/workforcePlan.queries.ts';
import toast from 'react-hot-toast';

const WorkforcePlanCreate: React.FC = () => {
    const navigate = useNavigate();
    const createMutation = useCreateWorkforcePlan({
        onSuccess: (data) => {
            toast.success('Workforce plan created successfully');
            navigate(`/hr/recruitment/workforce-plan/${data.id}`);
        },
        onError: (error) => toast.error(error.message)
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/hr/recruitment/workforce-plans')} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Create Workforce Plan</h1>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <WorkforcePlanForm
                        onSubmit={(data) => createMutation.mutate(data)}
                        onCancel={() => navigate('/hr/recruitment/workforce-plans')}
                        isSubmitting={createMutation.isPending}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default WorkforcePlanCreate;