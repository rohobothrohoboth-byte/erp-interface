import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import type { Budget } from './types';
import { fiscalYearApi } from '../../../../services/core/fiscalyear/fisc.api';
import type { FiscYearListDto } from '../../../../types/core/fisc';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (data: Budget) => void;
  budget: Budget;
}

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  budget,
}) => {
  const [formData, setFormData] = useState<Budget>(budget);
  const [fiscalYears, setFiscalYears] = useState<FiscYearListDto[]>([]);
  const [loadingFiscalYears, setLoadingFiscalYears] = useState(false);

  // Sample cost center data
  const costCenters = [
    { id: '1', code: 'CC001', name: 'Head Office' },
    { id: '2', code: 'CC002', name: 'Regional Office - North' },
    { id: '3', code: 'CC003', name: 'Regional Office - South' },
    { id: '4', code: 'CC004', name: 'Branch Office - Downtown' },
    { id: '5', code: 'CC005', name: 'Branch Office - Uptown' },
    { id: '6', code: 'CC006', name: 'Manufacturing Plant' },
    { id: '7', code: 'CC007', name: 'Warehouse' },
    { id: '8', code: 'CC008', name: 'IT Department' },
    { id: '9', code: 'CC009', name: 'HR Department' },
    { id: '10', code: 'CC010', name: 'Finance Department' },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData(budget);
      fetchFiscalYears();
    }
  }, [isOpen, budget]);

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
    onEdit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-indigo-200 px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-indigo-900">Edit Budget</h2>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 transition-colors duration-200"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Budget Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-indigo-700">
                Budget Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter budget name"
                className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fiscal Year */}
              <div className="space-y-2">
                <Label htmlFor="fiscalYear" className="text-sm text-indigo-700">
                  Fiscal Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.fiscalYear}
                  onValueChange={(value) => setFormData({ ...formData, fiscalYear: value })}
                  required
                  disabled={loadingFiscalYears}
                >
                  <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder={loadingFiscalYears ? "Loading..." : "Select fiscal year"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingFiscalYears ? (
                      <SelectItem value="loading" disabled>
                        Loading fiscal years...
                      </SelectItem>
                    ) : fiscalYears.length === 0 ? (
                      <SelectItem value="no-data" disabled>
                        No fiscal years available
                      </SelectItem>
                    ) : (
                      fiscalYears.map((year) => (
                        <SelectItem key={year.id} value={year.name}>
                          {year.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost Center */}
              <div className="space-y-2">
                <Label htmlFor="costCenter" className="text-sm text-indigo-700">
                  Cost Center <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.costCenter}
                  onValueChange={(value) => setFormData({ ...formData, costCenter: value })}
                  required
                >
                  <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Select cost center" />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.length === 0 ? (
                      <SelectItem value="no-data" disabled>
                        No cost centers available
                      </SelectItem>
                    ) : (
                      costCenters.map((center) => (
                        <SelectItem key={center.id} value={center.name}>
                          {center.code} - {center.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Total Amount */}
              <div className="space-y-2">
                <Label htmlFor="totalAmount" className="text-sm text-indigo-700">
                  Total Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter total amount"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm text-indigo-700">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'Draft' | 'Active' | 'Closed' })}
                >
                  <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm text-indigo-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter budget description (optional)"
                className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-indigo-200 px-6 py-4 rounded-b-xl bg-gray-50">
            <div className="flex justify-end items-center gap-2">
              <Button
                variant="outline"
                className="cursor-pointer px-6 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-6"
              >
                Update Budget
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditBudgetModal;
