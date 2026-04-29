import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface AddEmployeeStepHeaderProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  onBack?: () => void;
  title?: string;
  backButtonText?: string;
}

export const AddEmployeeStepHeader: React.FC<AddEmployeeStepHeaderProps> = ({
  steps,
  currentStep,
  onStepClick,
  onBack,
  title = 'Add Employee',
  backButtonText = 'Back to Employees',
}) => {
  return (
    <div className="space-y-8 mb-8">
      {/* Modern Header - Only show if onBack is provided */}
      {onBack && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="cursor-pointer hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-gray-700">{backButtonText}</span>
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 via-green-700 to-green-800 bg-clip-text text-transparent mb-2 tracking-tight">
              {title}
            </h1>
          </div>
          
          <div className="w-40"></div> {/* Spacer for balance */}
        </div>
      )}

      {/* 2-Step Progress Indicator */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 px-8 py-4">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepNumber = step.id;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isUpcoming = currentStep < stepNumber;
            const isClickable = step.id < currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 relative max-w-xs">
                  {/* Step Container with Progress */}
                  <motion.div 
                    className="relative"
                    whileHover={isClickable ? { scale: 1.05 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                  >
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
                    <motion.button
                      type="button"
                      onClick={() => isClickable && onStepClick(step.id)}
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 cursor-pointer hover:shadow-xl hover:shadow-green-300'
                          : isCurrent
                          ? 'border-red-500 bg-white text-red-600 shadow-lg shadow-red-100 cursor-default'
                          : isUpcoming
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-default'
                          : 'border-gray-200 bg-white text-gray-400 cursor-pointer'
                      } ${
                        isCurrent ? 'scale-110 ring-4 ring-red-50' : 'scale-100'
                      } ${isClickable ? 'hover:scale-105 hover:shadow-lg' : ''}`}
                      disabled={!isClickable}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
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
                    </motion.button>
                  </motion.div>
                  
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
                
                {/* Connector Line for 2 Steps */}
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
                      <motion.div 
                        className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-green-300"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                    {isCurrent && (
                      <motion.div 
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-red-300"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
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