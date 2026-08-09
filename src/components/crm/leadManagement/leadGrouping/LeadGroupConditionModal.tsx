// src/components/crm/leadManagement/leadGrouping/LeadGroupConditionModal.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { showToast } from '../../../../layout/layout';

export interface LeadGroupCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface LeadGroupConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

interface ConditionFormData {
  field: string;
  operator: string;
  value: string;
}

// Mock conditions storage
const mockConditionsStorage: Record<string, LeadGroupCondition[]> = {
  '1': [
    { id: '1', field: 'Score', operator: 'Greater Than', value: '80' },
    { id: '2', field: 'Industry', operator: 'Equals', value: 'Technology' }
  ],
  '2': [
    { id: '1', field: 'Source', operator: 'Equals', value: 'Website' }
  ],
  '3': [
    { id: '1', field: 'Budget', operator: 'Greater Than', value: '100000' },
    { id: '2', field: 'Status', operator: 'Equals', value: 'Qualified' }
  ]
};

const leadFields = [
  { value: 'Source', label: 'Source' },
  { value: 'Industry', label: 'Industry' },
  { value: 'Score', label: 'Score' },
  { value: 'Status', label: 'Status' },
  { value: 'Priority', label: 'Priority' },
  { value: 'Budget', label: 'Budget' },
  { value: 'CompanyName', label: 'Company Name' },
  { value: 'Title', label: 'Job Title' },
];

const operators = [
  { value: 'Equals', label: 'Equals' },
  { value: 'Contains', label: 'Contains' },
  { value: 'Greater Than', label: 'Greater Than' },
  { value: 'Less Than', label: 'Less Than' },
  { value: 'Not Equals', label: 'Not Equals' },
  { value: 'Starts With', label: 'Starts With' },
  { value: 'Ends With', label: 'Ends With' },
];

const sourceOptions = ['Website', 'Referral', 'SocialMedia', 'Email', 'ColdCall', 'Event', 'Partner', 'Advertisement', 'Other'];
const industryOptions = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Government', 'RealEstate', 'Consulting', 'Other'];
const statusOptions = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost', 'Archived'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

export default function LeadGroupConditionModal({
                                                  isOpen,
                                                  onClose,
                                                  groupId,
                                                  groupName
                                                }: LeadGroupConditionModalProps) {
  const [conditions, setConditions] = useState<LeadGroupCondition[]>([]);
  const [editingCondition, setEditingCondition] = useState<LeadGroupCondition | null>(null);
  const [formData, setFormData] = useState<ConditionFormData>({
    field: '',
    operator: '',
    value: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (isOpen && groupId) {
      const groupConditions = mockConditionsStorage[groupId] || [];
      setConditions(groupConditions);
      setCurrentPage(1);
    }
  }, [isOpen, groupId]);

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
      [name]: value,
      ...(name === 'field' && { value: '' })
    }));
  };

  const handleEditCondition = (condition: LeadGroupCondition) => {
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
      mockConditionsStorage[groupId] = updatedConditions;
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
      mockConditionsStorage[groupId] = updatedConditions;
      showToast.success('Condition updated successfully');
    } else {
      const newCondition: LeadGroupCondition = {
        id: Date.now().toString(),
        ...formData
      };
      const updatedConditions = [...conditions, newCondition];
      setConditions(updatedConditions);
      mockConditionsStorage[groupId] = updatedConditions;
      showToast.success('Condition added successfully');
    }

    setEditingCondition(null);
    setFormData({ field: '', operator: '', value: '' });
  };

  const handleCancelCondition = () => {
    setEditingCondition(null);
    setFormData({ field: '', operator: '', value: '' });
  };

  const getValueOptions = (field: string) => {
    switch (field) {
      case 'Source': return sourceOptions;
      case 'Industry': return industryOptions;
      case 'Status': return statusOptions;
      case 'Priority': return priorityOptions;
      default: return [];
    }
  };

  const renderValueInput = () => {
    const valueOptions = getValueOptions(formData.field);

    if (['Score', 'Budget'].includes(formData.field)) {
      return (
          <Input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Enter value"
              className="w-full"
              min="0"
          />
      );
    }

    if (valueOptions.length > 0) {
      return (
          <Select
              value={formData.value}
              onValueChange={(value) => handleSelectChange('value', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {valueOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
      );
    }

    return (
        <Input
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Enter value"
            className="w-full"
        />
    );
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col"
        >
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {groupName} - Conditions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Define conditions for this lead group
                </p>
              </div>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {editingCondition ? 'Edit' : 'Add'} Condition
                  </h3>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      Field <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.field}
                        onValueChange={(value) => handleSelectChange('field', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadFields.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      Operator <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.operator}
                        onValueChange={(value) => handleSelectChange('operator', value)}
                    >
                      <SelectTrigger className="w-full">
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

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      Value <span className="text-red-500">*</span>
                    </Label>
                    {renderValueInput()}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Button
                      onClick={handleSaveCondition}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={!formData.field || !formData.operator || !formData.value}
                  >
                    {editingCondition ? 'Update' : 'Add'} Condition
                  </Button>
                  {editingCondition && (
                      <Button
                          onClick={handleCancelCondition}
                          variant="outline"
                          className="w-full"
                      >
                        Cancel Edit
                      </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-3/5 flex flex-col">
              <div className="flex-1 overflow-hidden p-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden h-full flex flex-col">
                  <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Operator</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {conditions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                  <Plus className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No conditions configured</p>
                                <p className="text-gray-400 text-sm">Add your first condition using the form</p>
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
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center justify-center w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {condition.field}
                                  </div>
                                  <div className="text-xs text-gray-500 sm:hidden">
                                    {condition.operator}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {condition.operator}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {condition.value}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                        onClick={() => handleEditCondition(condition)}
                                        className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded transition-colors"
                                        title="Edit condition"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCondition(condition.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                                        title="Delete condition"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                          ))
                      )}
                      </tbody>
                    </table>
                  </div>

                  {totalItems > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                          <span className="font-medium">{totalItems}</span> conditions
                        </div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
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
                                          ? 'z-10 bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-600 dark:text-orange-400'
                                          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                  }`}
                              >
                                {page}
                              </button>
                          ))}
                          <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight size={16} />
                          </button>
                        </nav>
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