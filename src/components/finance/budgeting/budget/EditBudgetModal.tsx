import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import type { Budget } from './types';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Budget, 'id' | 'createdAt'>) => void;
  budget: Budget | null;
}

type DistributionFrequency = 'Monthly' | 'Quarterly' | 'Yearly';

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  budget,
}) => {
  const [formData, setFormData] = useState({
    budgetId: '',
    title: '',
    accountId: '',
    accountName: '',
    fiscalYearId: '',
    fiscalYearName: '',
    amount: 0,
    distributionFrequency: 'Monthly' as DistributionFrequency,
    costCenterId: '',
    costCenterName: '',
  });

  // Mock data for dropdowns
  const accounts = [
    { id: '1', name: 'Operating Account' },
    { id: '2', name: 'Capital Account' },
    { id: '3', name: 'Revenue Account' },
  ];

  const fiscalYears = [
    { id: '1', name: '2024' },
    { id: '2', name: '2025' },
    { id: '3', name: '2026' },
  ];

  const costCenters = [
    { id: '1', name: 'Head Office' },
    { id: '2', name: 'Regional Office' },
    { id: '3', name: 'Branch Office' },
  ];

  const distributionFrequencies: DistributionFrequency[] = ['Monthly', 'Quarterly', 'Yearly'];

  useEffect(() => {
    if (isOpen && budget) {
      setFormData({
        budgetId: budget.budgetId,
        title: budget.title,
        accountId: budget.accountId,
        accountName: budget.accountName,
        fiscalYearId: budget.fiscalYearId,
        fiscalYearName: budget.fiscalYearName,
        amount: budget.amount,
        distributionFrequency: budget.distributionFrequency,
        costCenterId: budget.costCenterId,
        costCenterName: budget.costCenterName,
      });
    }
  }, [isOpen, budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !budget) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Edit Budget</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Budget ID */}
              <div className="space-y-2">
                <Label htmlFor="budgetId" className="text-sm text-gray-500">
                  Budget ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budgetId"
                  value={formData.budgetId}
                  onChange={(e) => setFormData({ ...formData, budgetId: e.target.value })}
                  placeholder="Enter budget ID"
                  required
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm text-gray-500">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter budget title"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Account */}
              <div className="space-y-2">
                <Label htmlFor="account" className="text-sm text-gray-500">
                  Account <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => {
                    const selectedAccount = accounts.find((acc) => acc.id === value);
                    setFormData({
                      ...formData,
                      accountId: value,
                      accountName: selectedAccount?.name || '',
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fiscal Year */}
              <div className="space-y-2">
                <Label htmlFor="fiscalYear" className="text-sm text-gray-500">
                  Fiscal Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.fiscalYearId}
                  onValueChange={(value) => {
                    const selectedYear = fiscalYears.find((year) => year.id === value);
                    setFormData({
                      ...formData,
                      fiscalYearId: value,
                      fiscalYearName: selectedYear?.name || '',
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm text-gray-500">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Distribution Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm text-gray-500">
                  Distribution Frequency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.distributionFrequency}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      distributionFrequency: value as DistributionFrequency,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {distributionFrequencies.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cost Center */}
            <div className="space-y-2">
              <Label htmlFor="costCenter" className="text-sm text-gray-500">
                Cost Center <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.costCenterId}
                onValueChange={(value) => {
                  const selectedCenter = costCenters.find((center) => center.id === value);
                  setFormData({
                    ...formData,
                    costCenterId: value,
                    costCenterName: selectedCenter?.name || '',
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select cost center" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-2 rounded-b-xl">
            <div className="flex justify-center items-center gap-1.5">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-6"
              >
                Update
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer px-6"
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditBudgetModal;
