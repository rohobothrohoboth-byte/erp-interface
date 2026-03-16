import React from 'react';
import { CheckCircle, User, Target } from 'lucide-react';

const steps = [
  { id: 1, title: 'Contact & Company Info', icon: User },
  { id: 2, title: 'Lead Details', icon: Target },
];

interface EditLeadStepProgressProps {
  currentStep: number;
}

export default function EditLeadStepProgress({ currentStep }: EditLeadStepProgressProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 relative">
                <div className="relative">
                  <div
                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                        : isCurrent
                        ? 'border-orange-500 bg-white text-orange-600 shadow-lg shadow-orange-100'
                        : 'border-gray-200 bg-gray-50 text-gray-400'
                    } ${isCurrent ? 'scale-110 ring-4 ring-orange-50' : 'scale-100'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                    <div
                      className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 ${
                        isCompleted
                          ? 'bg-white text-orange-600 border-orange-500'
                          : isCurrent
                          ? 'bg-orange-500 text-white border-white'
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}
                    >
                      {stepNumber}
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <span className={`block text-sm font-semibold transition-colors ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  <span className={`text-xs mt-1 font-medium transition-colors ${isCompleted ? 'text-orange-600' : isCurrent ? 'text-orange-500' : 'text-gray-400'}`}>
                    {isCompleted ? 'Complete' : isCurrent ? 'Active' : 'Pending'}
                  </span>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 relative">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ease-out ${
                        isCompleted ? 'bg-orange-500 w-full' : isCurrent ? 'bg-orange-500 w-1/2' : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
