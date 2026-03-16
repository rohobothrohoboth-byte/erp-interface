import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../../../ui/button';
import { showToast } from '../../../../../layout/layout';
import { useCRMSettings } from '../../../../../hooks/useCRMSettings';
import { mockLeads } from '../../../../../data/crmMockData';
import EditLeadHeader from './EditLeadHeader';
import EditLeadStepProgress from './EditLeadStepProgress';
import ContactCompanyStep from './steps/ContactCompanyStep';
import LeadDetailsStep from './steps/LeadDetailsStep';
import type { Lead } from '../../../../../types/crm';

const TOTAL_STEPS = 2;

export default function EditLeadSection() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!id) {
      navigate('/crm/leads/generation');
      return;
    }

    const stored = JSON.parse(localStorage.getItem('leads') || '[]');
    let lead = stored.find((l: Lead) => l.id === id);

    if (!lead) {
      lead = mockLeads.find((l: Lead) => l.id === id);
      if (lead && stored.length === 0) {
        localStorage.setItem('leads', JSON.stringify(mockLeads));
      }
    }

    if (lead) {
      setFormData(lead);
      setLoading(false);
    } else {
      setLoading(false);
      showToast.error('Lead not found');
      navigate('/crm/leads/generation');
    }
  }, [id, navigate]);

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
      const updatedLead: Lead = {
        ...formData,
        id: id!,
        updatedAt: new Date().toISOString(),
      } as Lead;

      const existing = JSON.parse(localStorage.getItem('leads') || '[]');
      const updated = existing.map((l: Lead) => (l.id === id ? updatedLead : l));
      localStorage.setItem('leads', JSON.stringify(updated));
      showToast.success('Lead updated successfully');
      navigate('/crm/leads/generation');
    } catch {
      showToast.error('Failed to update lead');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading lead data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 mb-4">
        <EditLeadHeader />
        <EditLeadStepProgress currentStep={currentStep} />
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
              <Button type="button" onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700 px-6">
                Update Lead
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
