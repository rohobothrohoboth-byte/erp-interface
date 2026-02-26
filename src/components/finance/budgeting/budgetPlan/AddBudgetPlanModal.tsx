import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { fiscalYearApi } from '../../../../services/core/fiscalyear/fisc.api';
import type { BudgetPlan } from './BudgetPlanSection';
import type { FiscYearListDto } from '../../../../types/core/fisc';

interface AddBudgetPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: Omit<BudgetPlan, 'id' | 'submittedDate' | 'totalRequested' | 'expenseCount' | 'createdAt' | 'updatedAt'>) => void;
}

export default function AddBudgetPlanModal({
  isOpen,
  onClose,
  onSubmit
}: AddBudgetPlanModalProps) {
  const [formData, setFormData] = useState({
    fiscalYear: '',
    costCenter: '',
    status: 'Draft' as 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Returned'
  });

  const [fiscalYears, setFiscalYears] = useState<FiscYearListDto[]>([]);
  const [costCenters, setCostCenters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fyData = await fiscalYearApi.getAllFiscalYears();
      setFiscalYears(fyData);
      
      // Fetch cost centers from localStorage
      const storedCostCenters = localStorage.getItem('costCenters');
      if (storedCostCenters) {
        const centersData = JSON.parse(storedCostCenters);
        // Flatten the hierarchy to get all cost centers
        const flattenCostCenters = (centers: any[]): any[] => {
          let result: any[] = [];
          centers.forEach(center => {
            result.push(center);
            if (center.children && center.children.length > 0) {
              result = result.concat(flattenCostCenters(center.children));
            }
          });
          return result;
        };
        
        const allCenters = flattenCostCenters(centersData);
        const centerCodes = allCenters.map((cc: any) => `${cc.costCenterCode} - ${cc.name}`);
        setCostCenters(centerCodes);
      } else {
        // Mock cost centers if none exist
        setCostCenters([
          'CC-001 - Operations',
          'CC-002 - Sales & Marketing',
          'CC-003 - IT Department',
          'CC-004 - Human Resources',
          'CC-005 - Finance'
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      fiscalYear: '',
      costCenter: '',
      status: 'Draft'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h2 className="text-lg font-bold text-gray-800">Add Budget Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6">
            <div className="py-4 space-y-4">
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
                    <SelectValue placeholder={loading ? "Loading..." : "Select fiscal year"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map((fy) => (
                      <SelectItem key={fy.id} value={fy.name}>
                        {fy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costCenter" className="text-sm text-gray-500">
                  Cost Center <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.costCenter}
                  onValueChange={(value) => setFormData({ ...formData, costCenter: value })}
                  required
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={loading ? "Loading..." : "Select cost center"} />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.length === 0 ? (
                      <SelectItem value="empty" disabled>No cost centers available</SelectItem>
                    ) : (
                      costCenters.map((center) => (
                        <SelectItem key={center} value={center}>
                          {center}
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
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

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
}
