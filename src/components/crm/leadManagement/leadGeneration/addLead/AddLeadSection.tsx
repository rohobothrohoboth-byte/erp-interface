import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../../../ui/button';
import { showToast } from '../../../../../layout/layout';
import { RoutingService } from '../../../../../services/routingService';
import { useCRMSettings } from '../../../../../hooks/useCRMSettings';
import AddLeadHeader from './AddLeadHeader';
import AddLeadStepProgress from './AddLeadStepProgress';
import ContactCompanyStep from './steps/ContactCompanyStep';
import LeadDetailsStep from './steps/LeadDetailsStep';
import type { Lead } from '../../../../../types/crm';

const TOTAL_STEPS = 2;

export default function AddLeadSection() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    leadSourceNames,
    leadStatusNames,
    leadCategoryNames,
    industryNames,
    contactMethodNames,
    loading: settingsLoading,
  } = useCRMSettings();

  const [formData, setFormData] = useState<Partial<Lead>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    source: 'Website',
    status: 'New',
    assignedTo: '',
    notes: '',
    budget: 0,
    timeline: '',
    industry: '',
    score: 0,
    leadQuality: 'Warm',
    preferredContactMethod: 'Any',
  });

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email?.trim() && !formData.phone?.trim())
        newErrors.contact = 'Either email or phone is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Please enter a valid email address';
      if (!formData.company?.trim()) newErrors.company = 'Company is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((p) => Math.min(p + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((p) => Math.max(p - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    try {
      let finalData = { ...formData };
      if (!finalData.assignedTo) {
        const rep = RoutingService.assignLeadToSalesRep(finalData);
        if (rep) finalData.assignedTo = rep;
      }
      const newLead: Lead = {
        ...finalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Lead;

      const existing = JSON.parse(localStorage.getItem('leads') || '[]');
      localStorage.setItem('leads', JSON.stringify([newLead, ...existing]));
      showToast.success('Lead added successfully');
      navigate('/crm/leads/generation');
    } catch {
      showToast.error('Failed to add lead');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 mb-4">
        <AddLeadHeader />
        <AddLeadStepProgress currentStep={currentStep} />
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-8"
      >
        {currentStep === 1 && (
          <ContactCompanyStep
            formData={formData}
            errors={errors}
            industryNames={industryNames}
            settingsLoading={settingsLoading}
            onChange={handleChange}
          />
        )}
        {currentStep === 2 && (
          <LeadDetailsStep
            formData={formData}
            errors={errors}
            leadSourceNames={leadSourceNames}
            leadStatusNames={leadStatusNames}
            leadCategoryNames={leadCategoryNames}
            contactMethodNames={contactMethodNames}
            settingsLoading={settingsLoading}
            onChange={handleChange}
          />
        )}

        <div className="flex justify-between pt-4 border-t mt-5">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} className="px-6">
              Previous
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/crm/leads/generation')}
              className="px-6"
            >
              Cancel
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={handleNext} className="bg-orange-600 hover:bg-orange-700 px-6">
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 px-6">
                Save Lead
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
