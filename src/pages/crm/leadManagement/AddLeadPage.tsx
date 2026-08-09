// src/pages/crm/leadManagement/AddLeadPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createLead } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import AddLeadHeader from '../../../components/crm/leadManagement/leadGeneration/addLead/AddLeadHeader';
import AddLeadStepProgress from '../../../components/crm/leadManagement/leadGeneration/addLead/AddLeadStepProgress';
import AddLeadSection from '../../../components/crm/leadManagement/leadGeneration/addLead/AddLeadSection';
import type { CreateLeadDto } from '../../../types/crm/crm.types';

const AddLeadPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<CreateLeadDto>({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        country: '',
        status: 'New',
        source: 'Website',
        priority: 'Medium',
        industry: '',
        title: '',
        description: '',
        budget: undefined,
        estimatedValue: undefined,
        expectedCloseDate: '',
        assignedToUserId: '',
        tags: '',
        propertyType: '',
        propertyPrice: undefined,
        propertyLocation: '',
        propertySize: undefined,
        productCategory: '',
        orderQuantity: undefined,
        requiredDeliveryDate: '',
        tenderNumber: '',
        tenderDeadline: '',
        department: '',
    });

    const steps = ['Personal Information', 'Company & Details'];

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            await createLead(formData);
            showToast.success('Lead created successfully');
            navigate('/crm/leads');
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Failed to create lead');
        } finally {
            setSaving(false);
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <AddLeadHeader
                onBack={() => navigate('/crm/leads')}
                onSave={handleSubmit}
                saving={saving}
            />

            <AddLeadStepProgress
                currentStep={currentStep}
                steps={steps}
            />

            <AddLeadSection
                currentStep={currentStep}
                formData={formData}
                onChange={(data) => setFormData({ ...formData, ...data })}
                onSubmit={handleSubmit}
                loading={saving}
            />
        </motion.div>
    );
};

export default AddLeadPage;