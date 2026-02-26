import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Code } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { fiscalYearApi } from '../../../../services/core/fiscalyear/fisc.api';
import type { BudgetCode } from './BudgetCodeSection';
import type { FiscYearListDto } from '../../../../types/core/fisc';

interface AddBudgetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budgetCode: Omit<BudgetCode, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
}

const AddBudgetCodeModal: React.FC<AddBudgetCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    budgetCode: '',
    description: '',
    fiscalYear: '',
    status: 'Active',
  });

  const [fiscalYears, setFiscalYears] = useState<FiscYearListDto[]>([]);
  const [loadingFiscalYears, setLoadingFiscalYears] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFiscalYears();
    }
  }, [isOpen]);

  const fetchFiscalYears = async () => {
    setLoadingFiscalYears(true);
    try {
      const data = await fiscalYearApi.getAllFiscalYears();
      setFiscalYears(data);
    } catch (error) {
      console.error('Error fetching fiscal years:', error);
    } finally {
      setLoadingFiscalYears(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      budgetCode: '',
      description: '',
      fiscalYear: '',
      status: 'Active',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Code size={20} />
            <h2 className="text-lg font-bold text-gray-800">Add New</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6">
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budgetCode" className="text-sm text-gray-500">
                  Budget Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budgetCode"
                  value={formData.budgetCode}
                  onChange={(e) => setFormData({ ...formData, budgetCode: e.target.value })}
                  placeholder="Enter budget code"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm text-gray-500">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYear" className="text-sm text-gray-500">
                  Fiscal Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.fiscalYear}
                  onValueChange={(value) => setFormData({ ...formData, fiscalYear: value })}
                  required
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={loadingFiscalYears ? "Loading..." : "Select fiscal year"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingFiscalYears ? (
                      <SelectItem value="loading" disabled>Loading fiscal years...</SelectItem>
                    ) : fiscalYears.length === 0 ? (
                      <SelectItem value="empty" disabled>No fiscal years available</SelectItem>
                    ) : (
                      fiscalYears.map((fy) => (
                        <SelectItem key={fy.id} value={fy.name}>
                          {fy.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm text-gray-500">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t px-6 py-2">
            <div className="mx-auto flex justify-center items-center gap-1.5">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-6"
              >
                Save
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="cursor-pointer px-6"
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

export default AddBudgetCodeModal;
