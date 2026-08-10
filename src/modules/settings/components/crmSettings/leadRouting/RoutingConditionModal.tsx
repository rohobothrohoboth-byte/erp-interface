import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';

export interface RoutingCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface RoutingConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleId: string;
  ruleName: string;
}

interface ConditionFormData {
  field: string;
  operator: string;
  value: string;
}

// Mock conditions storage (in real app, this would be API calls)
const mockConditionsStorage: Record<string, RoutingCondition[]> = {};

const conditionFields = [
  { value: 'source', label: 'Lead Source' },
  { value: 'industry', label: 'Industry' },
  { value: 'budget', label: 'Budget' },
  { value: 'score', label: 'Lead Score' },
  { value: 'company', label: 'Company Name' },
  { value: 'location', label: 'Location' }
];

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' }
];

export default function RoutingConditionModal({
  isOpen,
  onClose,
  ruleId,
  ruleName
}: RoutingConditionModalProps) {
  const [conditions, setConditions] = useState<RoutingCondition[]>([]);
  const [editingCondition, setEditingCondition] = useState<RoutingCondition | null>(null);
  const [formData, setFormData] = useState<ConditionFormData>({
    field: '',
    operator: '',
    value: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load conditions for this rule
  useEffect(() => {
    if (isOpen && ruleId) {
      const ruleConditions = mockConditionsStorage[ruleId] || [];
      setConditions(ruleConditions);
      setCurrentPage(1);
    }
  }, [isOpen, ruleId]);

  // Pagination
  const totalItems = conditions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedConditions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return conditions.slice(startIndex, startIndex + itemsPerPage);
  }, [conditions, currentPage]);

  const handleClose = () => {
    setEditingCondition(null);
    setFormData({ field: '', operator: '', value: '' });
    setCurrentPage(1);
    onClose();
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCondition = (condition: RoutingCondition) => {
    setEditingCondition(condition);
    setFormData({
      field: condition.field,
      operator: condition.operator,
      value: condition.value
    });
  };

  const handleDeleteCondition = (conditionId: string) => {
    if (window.confirm('Are you sure you want to delete this condition?')) {
      const updatedConditions = conditions.filter(c => c.id !== conditionId);
      setConditions(updatedConditions);
      mockConditionsStorage[ruleId] = updatedConditions;
      showToast.success('Condition deleted successfully');
    }
  };

  const handleSaveCondition = () => {
    if (!formData.field || !formData.operator || !formData.value) {
      showToast.error('Please fill in all fields');
      return;
    }

    if (editingCondition) {
      const updatedConditions = conditions.map(c =>
        c.id === editingCondition.id
          ? { ...c, ...formData }
          : c
      );
      setConditions(updatedConditions);
      mockConditionsStorage[ruleId] = updatedConditions;
      showToast.success('Condition updated successfully');
    } else {
      const newCondition: RoutingCondition = {
        id: Date.now().toString(),
        ...formData
      };
      const updatedConditions = [...conditions, newCondition];
      setConditions(updatedConditions);
      mockConditionsStorage[ruleId] = updatedConditions;
      showToast.success('Condition added successfully');
    }

    setEditingCondition(null);
    setFormData({ field: '', operator: '', value: '' });
  };

  const handleCancelCondition = () => {
    setEditingCondition(null);
    setFormData({ field: '', operator: '', value: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] sm:h-[75vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 sm:px-6 py-3 bg-white rounded-lg">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {ruleName} - Conditions
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body - Responsive Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden rounded-lg">
          {/* Form Section */}
          <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 p-3 sm:p-4 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Plus size={14} className="sm:w-4 sm:h-4 text-orange-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                  {editingCondition ? 'Edit' : 'Add'} Condition
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4 flex-1">
                {/* Field */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Field <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.field}
                    onValueChange={(value) => handleSelectChange('field', value)}
                  >
                    <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionFields.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operator */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Operator <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.operator}
                    onValueChange={(value) => handleSelectChange('operator', value)}
                  >
                    <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Value <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value"
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="space-y-2 mt-4 sm:mt-8">
                <Button
                  onClick={handleSaveCondition}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
                  disabled={!formData.field || !formData.operator || !formData.value}
                >
                  {editingCondition ? 'Update' : 'Add'}
                </Button>
                {editingCondition && (
                  <Button
                    onClick={handleCancelCondition}
                    variant="outline"
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="w-full lg:w-3/5 flex flex-col bg-white">
            <div className="flex-1 overflow-hidden">
              <div className="rounded-lg shadow-sm overflow-hidden bg-white h-full flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Operator
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {conditions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 sm:py-12 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                <Plus size={16} className="sm:w-5 sm:h-5 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium mb-1 text-sm">
                                No conditions configured
                              </p>
                              <p className="text-gray-400 text-xs sm:text-sm">
                                Add your first condition using the form
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedConditions.map((condition, index) => (
                          <motion.tr
                            key={condition.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {conditionFields.find(f => f.value === condition.field)?.label}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {condition.operator}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-sm text-gray-900">
                                {condition.operator}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {condition.value}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEditCondition(condition)}
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                  title="Edit condition"
                                >
                                  <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCondition(condition.id)}
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete condition"
                                >
                                  <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                          <span className="font-medium">{totalItems}</span> conditions
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft size={16} />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight size={16} />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
