import React from 'react';
import { motion } from 'framer-motion';
import { Zap, PlusCircle, Calculator, Download, Shield, FileText, Users } from 'lucide-react';

interface PayrollQuickActionsProps {
  onAddEmployee: () => void;
  onProcessPayroll: () => void;
  onCalculateTax: () => void;
  onGenerateReports: () => void;
  onManageBenefits: () => void;
  onExportPayslips: () => void;
}

export const PayrollQuickActions: React.FC<PayrollQuickActionsProps> = ({
  onAddEmployee,
  onProcessPayroll,
  onCalculateTax,
  onGenerateReports,
  onManageBenefits,
  onExportPayslips,
}) => {
  const actions = [
    {
      label: 'Add Employee',
      icon: <PlusCircle className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      onClick: onAddEmployee,
      description: 'Register new employee'
    },
    {
      label: 'Process Payroll',
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-600',
      onClick: onProcessPayroll,
      description: 'Run payroll cycle'
    },
    {
      label: 'Tax Calculation',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600',
      onClick: onCalculateTax,
      description: 'Calculate tax deductions'
    },
    {
      label: 'Benefits',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      onClick: onManageBenefits,
      description: 'Manage benefits'
    },
    {
      label: 'Reports',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-cyan-500 to-cyan-600',
      onClick: onGenerateReports,
      description: 'Generate payroll reports'
    },
    {
      label: 'Export Payslips',
      icon: <Download className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      onClick: onExportPayslips,
      description: 'Export all payslips'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-200">
      <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-indigo-900">
        <Zap className="w-5 h-5 text-indigo-600" />
        <span>Payroll Quick Actions</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            onClick={action.onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br ${action.color} text-white p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center justify-center space-y-2 min-h-[120px]`}
          >
            {action.icon}
            <span className="text-sm font-medium text-center">{action.label}</span>
            <span className="text-xs opacity-90 text-center">{action.description}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};