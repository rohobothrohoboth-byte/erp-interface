// src/components/crm/leadManagement/leadGeneration/editLead/steps/EditLeadDetailsStep.tsx
import React from 'react';
import { User, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import type { UpdateLeadDto } from '../../../../../types/crm/crm.types';

interface EditLeadDetailsStepProps {
    formData: UpdateLeadDto;
    onChange: (data: Partial<UpdateLeadDto>) => void;
    onNext: () => void;
}

const EditLeadDetailsStep: React.FC<EditLeadDetailsStepProps> = ({
                                                                     formData,
                                                                     onChange,
                                                                     onNext,
                                                                 }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium">First Name</Label>
                        <Input
                            value={formData.firstName || ''}
                            onChange={(e) => onChange({ firstName: e.target.value })}
                            className="mt-1"
                            placeholder="John"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Last Name</Label>
                        <Input
                            value={formData.lastName || ''}
                            onChange={(e) => onChange({ lastName: e.target.value })}
                            className="mt-1"
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => onChange({ email: e.target.value })}
                            className="mt-1"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input
                            value={formData.phone || ''}
                            onChange={(e) => onChange({ phone: e.target.value })}
                            className="mt-1"
                            placeholder="+1 234 567 890"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium">Mobile</Label>
                        <Input
                            value={formData.mobile || ''}
                            onChange={(e) => onChange({ mobile: e.target.value })}
                            className="mt-1"
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Company Name</Label>
                        <Input
                            value={formData.companyName || ''}
                            onChange={(e) => onChange({ companyName: e.target.value })}
                            className="mt-1"
                            placeholder="Acme Corp"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        Next Step →
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default EditLeadDetailsStep;