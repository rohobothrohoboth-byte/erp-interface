// src/components/crm/leadManagement/leadGeneration/addLead/AddLeadStepProgress.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface AddLeadStepProgressProps {
    currentStep: number;
    steps: string[];
}

const AddLeadStepProgress: React.FC<AddLeadStepProgressProps> = ({
                                                                     currentStep,
                                                                     steps,
                                                                 }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const stepNumber = index + 1;

                    return (
                        <React.Fragment key={index}>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                        isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isActive
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {isCompleted ? <Check size={16} /> : stepNumber}
                                </div>
                                <span
                                    className={`text-sm font-medium ${
                                        isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                    }`}
                                >
                  {step}
                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-1 mx-2 rounded ${
                                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default AddLeadStepProgress;