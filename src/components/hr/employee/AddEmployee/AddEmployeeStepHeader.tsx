import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
}

interface AddEmployeeStepHeaderProps {
  steps: Step[];
  currentStep: number;
  title: string;
}

export const AddEmployeeStepHeader: React.FC<AddEmployeeStepHeaderProps> = ({
  steps,
  currentStep,
  title,
}) => {
  return (
    <div className="space-y-8 mb-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 via-green-700 to-green-800 bg-clip-text text-transparent mb-2 tracking-tight">
            {title}
          </h1>
        </div>
        
        <div className="w-40"></div> {/* Spacer for balance */}
      </div>

      {/* Sleek Progress Steps */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 px-8 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber; // Fixed: currentStep should be greater than step number
            const isCurrent = currentStep === stepNumber; // Fixed: currentStep should equal step number
            const isUpcoming = currentStep < stepNumber; // Fixed: currentStep should be less than step number
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 relative">
                  {/* Step Container with Progress */}
                  <div className="relative">
                    {/* Progress Ring */}
                    <div className="absolute inset-0 transform -rotate-90">
                      <svg className="w-16 h-16" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={isCompleted ? "#10B981" : isCurrent ? "#EF4444" : "transparent"}
                          strokeWidth="3"
                          strokeDasharray="100"
                          strokeDashoffset={isCompleted ? "0" : isCurrent ? "25" : "100"}
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                    </div>

                    {/* Step Circle */}
                    <div
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200'
                          : isCurrent
                          ? 'border-red-500 bg-white text-red-600 shadow-lg shadow-red-100'
                          : isUpcoming
                          ? 'border-gray-200 bg-gray-50 text-gray-400'
                          : 'border-gray-200 bg-white text-gray-400'
                      } ${
                        isCurrent ? 'scale-110 ring-4 ring-red-50' : 'scale-100'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                      
                      {/* Step Number Badge */}
                      <div
                        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'bg-white text-green-600 border-green-500'
                            : isCurrent
                            ? 'bg-red-500 text-white border-white'
                            : 'bg-gray-200 text-gray-500 border-gray-300'
                        }`}
                      >
                        {stepNumber}
                      </div>
                    </div>
                  </div>
                  
                  {/* Step Title */}
                  <div className="text-center mt-4">
                    <span
                      className={`block text-sm font-semibold transition-colors ${
                        isCompleted || isCurrent
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span
                      className={`text-xs mt-1 font-medium transition-colors ${
                        isCompleted
                          ? 'text-green-600'
                          : isCurrent
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {isCompleted ? 'Complete' : isCurrent ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                {/* Connector Line with Progress */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 relative">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ease-out ${
                          isCompleted 
                            ? 'bg-green-500 w-full' 
                            : isCurrent 
                            ? 'bg-red-500 w-1/2' 
                            : 'bg-transparent w-0'
                        }`}
                      />
                    </div>
                    
                    {/* Animated Progress Dot */}
                    {isCompleted && (
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-green-300 animate-pulse"></div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-red-300 animate-bounce"></div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};