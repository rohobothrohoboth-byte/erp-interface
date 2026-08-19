import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X, Edit, DollarSign, Calendar, Clock, Bell, Users,
  Briefcase, Shield, TrendingUp, AlertCircle, CheckCircle,
  ChevronLeft, ChevronRight, UserCheck, Building2, Crown, UserCog, GitBranch, BadgePlus
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import type { LeaveTypeListDto, LeaveTypeModDto, UUID } from '@/modules/core/types/Settings/leavetype';

// Approval Step Interface
interface ApprovalStep {
  id: string;
  stepOrder: number;
  stepName: string;
  approverType: 'Manager' | 'HR' | 'HOD' | 'CEO' | 'SpecificPerson' | 'Role';
  approverValue?: string;
  isFinal: boolean;
  timeoutHours?: number;
}

interface EditLeaveTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leaveType: LeaveTypeModDto) => Promise<void>;
  leaveType: LeaveTypeListDto | null;
  loading?: boolean;
}

const EditLeaveTypeModal: React.FC<EditLeaveTypeModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onSave,
                                                                 leaveType,
                                                                 loading: externalLoading = false,
                                                               }) => {
  const [formData, setFormData] = useState<Partial<LeaveTypeModDto>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Approval Chain State
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([
    { id: '1', stepOrder: 1, stepName: 'Manager Approval', approverType: 'Manager', isFinal: false },
    { id: '2', stepOrder: 2, stepName: 'HR Approval', approverType: 'HR', isFinal: true }
  ]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    'HR Manager', 'HR Director', 'Department Head', 'Team Lead', 'CEO', 'CFO', 'COO'
  ]);

  const loading = externalLoading || isLoading;

  const tabs = ['Basic', 'Accrual', 'Rules', 'Eligibility', 'Notifications', 'Approval Chain'];

  const approverTypeOptions = [
    { value: 'Manager', label: 'Direct Manager', icon: UserCheck, description: 'Employee\'s immediate supervisor' },
    { value: 'HR', label: 'HR Personnel', icon: Users, description: 'HR staff or manager' },
    { value: 'HOD', label: 'Head of Department', icon: Building2, description: 'Department director' },
    { value: 'CEO', label: 'CEO/Executive', icon: Crown, description: 'Top executive' },
    { value: 'SpecificPerson', label: 'Specific Person', icon: UserCog, description: 'Designated individual' },
    { value: 'Role', label: 'Role Based', icon: Shield, description: 'Any user with specific role' }
  ];

  // Initialize form when leaveType changes
  useEffect(() => {
    if (leaveType) {
      setFormData({
        id: leaveType.id,
        name: leaveType.name || '',
        nameAm: leaveType.nameAm || '',
        code: leaveType.code || '',
        leaveCategory: leaveType.leaveCategory || 'Paid',
        description: leaveType.description || '',
        accrualFrequency: leaveType.accrualFrequency || 'Annual',
        accrualRate: leaveType.accrualRate || 12,
        maxAccrual: leaveType.maxAccrual || 30,
        allowCarryover: leaveType.allowCarryover ?? true,
        maxCarryoverDays: leaveType.maxCarryoverDays || 5,
        carryoverExpiryMonths: leaveType.carryoverExpiryMonths || 3,
        maxDaysPerRequest: leaveType.maxDaysPerRequest || 30,
        maxDaysPerYear: leaveType.maxDaysPerYear || 30,
        minDaysPerRequest: leaveType.minDaysPerRequest || 0.5,
        requiresAttachment: leaveType.requiresAttachment ?? false,
        requiresDoctorNote: leaveType.requiresDoctorNote ?? false,
        requiresApproval: leaveType.requiresApproval ?? true,
        allowHalfDay: leaveType.allowHalfDay ?? true,
        allowNegativeBalance: leaveType.allowNegativeBalance ?? false,
        holidaysAsLeave: leaveType.holidaysAsLeave ?? false,
        minServiceMonths: leaveType.minServiceMonths || 0,
        probationPeriodOnly: leaveType.probationPeriodOnly ?? false,
        eligibleEmploymentTypes: leaveType.eligibleEmploymentTypes || ['Permanent'],
        sendReminderDays: leaveType.sendReminderDays || [30, 14, 7, 3],
        notifyManagerOnRequest: leaveType.notifyManagerOnRequest ?? true,
        icon: leaveType.icon || 'Calendar',
        color: leaveType.color || 'emerald',
        priority: leaveType.priority || 0,
        isActive: leaveType.isActive ?? true,
        rowVersion: leaveType.rowVersion || ''
      });

      // Load approval steps from leaveType if available
      if (leaveType.approvalSteps && leaveType.approvalSteps.length > 0) {
        setApprovalSteps(leaveType.approvalSteps);
      }
    }
  }, [leaveType]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormErrors({ name: 'Leave type name is required' });
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        approvalChain: {
          effectiveFrom: new Date().toISOString().split('T')[0],
          steps: approvalSteps.map(step => ({
            stepOrder: step.stepOrder,
            stepName: step.stepName,
            role: step.approverType,
            approverValue: step.approverValue || null,
            isFinal: step.isFinal,
            timeoutHours: step.timeoutHours || null
          }))
        }
      };
      await onSave(submitData as LeaveTypeModDto);
      handleClose();
    } catch (error) {
      console.error('Error saving leave type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleArrayItem = (field: string, value: any, array: any[]) => {
    const newArray = array.includes(value)
        ? array.filter(v => v !== value)
        : [...array, value].sort((a, b) => a - b);
    updateField(field, newArray);
  };

  // Approval Chain Functions
  const addApprovalStep = () => {
    const newStep: ApprovalStep = {
      id: Date.now().toString(),
      stepOrder: approvalSteps.length + 1,
      stepName: `Step ${approvalSteps.length + 1}`,
      approverType: 'Manager',
      isFinal: false
    };
    setApprovalSteps([...approvalSteps, newStep]);
  };

  const removeApprovalStep = (id: string) => {
    if (approvalSteps.length <= 1) {
      alert("At least one approval step is required");
      return;
    }
    const newSteps = approvalSteps.filter(step => step.id !== id);
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      stepOrder: index + 1,
      isFinal: index === newSteps.length - 1
    }));
    setApprovalSteps(reorderedSteps);
  };

  const updateApprovalStep = (id: string, field: keyof ApprovalStep, value: any) => {
    const updatedSteps = approvalSteps.map(step =>
        step.id === id ? { ...step, [field]: value } : step
    );
    setApprovalSteps(updatedSteps);
  };

  if (!isOpen || !leaveType) return null;

  const categoryOptions = [
    { value: 'Paid', label: 'Paid Leave', icon: DollarSign, color: 'emerald', description: 'Employee receives full/partial pay' },
    { value: 'Unpaid', label: 'Unpaid Leave', icon: DollarSign, color: 'orange', description: 'No payment during leave' },
    { value: 'Special', label: 'Special Leave', icon: Calendar, color: 'purple', description: 'Special circumstances (wedding, bereavement, etc.)' }
  ];

  const accrualOptions = [
    { value: 'Annual', label: 'Annual', description: 'Accrued once per year' },
    { value: 'Monthly', label: 'Monthly', description: 'Accrued each month' },
    { value: 'Daily', label: 'Daily', description: 'Accrued daily' },
    { value: 'None', label: 'None', description: 'No automatic accrual' }
  ];

  const employmentTypeOptions = [
    { value: 'Permanent', label: 'Permanent', icon: Shield },
    { value: 'Contract', label: 'Contract', icon: Briefcase },
    { value: 'Probation', label: 'Probation', icon: Clock },
    { value: 'Intern', label: 'Intern', icon: Users },
    { value: 'PartTime', label: 'Part-time', icon: Briefcase }
  ];

  const selectedCategory = categoryOptions.find(c => c.value === formData.leaveCategory) || categoryOptions[0];

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 h-screen">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <Edit size={20} className="text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Edit Leave Type</h2>
                <p className="text-sm text-gray-500">Update leave policy configuration and approval workflow</p>
              </div>
            </div>
            <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b px-6 pt-2">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab, index) => (
                  <button
                      key={index}
                      type="button"
                      onClick={() => setActiveTab(index)}
                      className={`px-4 py-2 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                          activeTab === index
                              ? 'border-emerald-500 text-emerald-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab}
                  </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Tab 0: Basic Information */}
              {activeTab === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Leave Type Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="e.g., Annual Leave"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={formData.code || ''}
                            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                            placeholder="e.g., AL, SL, ML"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Name (Amharic)</Label>
                      <Input
                          value={formData.nameAm || ''}
                          onChange={(e) => updateField('nameAm', e.target.value)}
                          placeholder="የዕረፍት አይነት ስም"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                          value={formData.description || ''}
                          onChange={(e) => updateField('description', e.target.value)}
                          placeholder="Describe the purpose and conditions of this leave type"
                          rows={2}
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Leave Category</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {categoryOptions.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = formData.leaveCategory === cat.value;
                          return (
                              <button
                                  key={cat.value}
                                  type="button"
                                  onClick={() => updateField('leaveCategory', cat.value)}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                      isSelected
                                          ? `border-${cat.color}-500 bg-${cat.color}-50 shadow-sm`
                                          : 'border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className={`p-2 rounded-full ${
                                      isSelected ? `bg-${cat.color}-100 text-${cat.color}-600` : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    <Icon size={20} />
                                  </div>
                                  <span className="text-sm font-medium">{cat.label}</span>
                                  <span className="text-xs text-gray-500 text-center">{cat.description}</span>
                                </div>
                              </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between py-2 border-t pt-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <p className="text-xs text-gray-500">Active or Inactive</p>
                      </div>
                      <button
                          type="button"
                          onClick={() => updateField('isActive', !formData.isActive)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                      >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                      </button>
                    </div>
                  </div>
              )}

              {/* Tab 1: Accrual Settings */}
              {activeTab === 1 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Accrual Configuration</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Accrual Frequency</Label>
                      <select
                          value={formData.accrualFrequency}
                          onChange={(e) => updateField('accrualFrequency', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {accrualOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} - {opt.description}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-gray-700">Days per Period</Label>
                        <span className="text-sm text-emerald-600 font-medium">{formData.accrualRate} days</span>
                      </div>
                      <input
                          type="range"
                          value={formData.accrualRate}
                          onChange={(e) => updateField('accrualRate', Number(e.target.value))}
                          min={0}
                          max={formData.accrualFrequency === 'Annual' ? 30 : formData.accrualFrequency === 'Monthly' ? 5 : 30}
                          step={0.5}
                          className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-gray-700">Maximum Accrual</Label>
                        <span className="text-sm text-emerald-600 font-medium">{formData.maxAccrual} days</span>
                      </div>
                      <input
                          type="range"
                          value={formData.maxAccrual}
                          onChange={(e) => updateField('maxAccrual', Number(e.target.value))}
                          min={formData.accrualRate}
                          max={90}
                          step={1}
                          className="w-full"
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Allow Carryover</span>
                          <p className="text-xs text-gray-500">Unused days carry over to next period</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateField('allowCarryover', !formData.allowCarryover)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                formData.allowCarryover ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                        >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.allowCarryover ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                        </button>
                      </div>

                      {formData.allowCarryover && (
                          <div className="space-y-3 pl-4 border-l-2 border-emerald-200">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Max Carryover Days</Label>
                              <Input
                                  type="number"
                                  value={formData.maxCarryoverDays}
                                  onChange={(e) => updateField('maxCarryoverDays', Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Carryover Expiry (months)</Label>
                              <Input
                                  type="number"
                                  value={formData.carryoverExpiryMonths}
                                  onChange={(e) => updateField('carryoverExpiryMonths', Number(e.target.value))}
                              />
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              )}

              {/* Tab 2: Rules */}
              {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Max Days Per Request</Label>
                        <Input
                            type="number"
                            value={formData.maxDaysPerRequest}
                            onChange={(e) => updateField('maxDaysPerRequest', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Max Days Per Year</Label>
                        <Input
                            type="number"
                            value={formData.maxDaysPerYear}
                            onChange={(e) => updateField('maxDaysPerYear', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Minimum Days Per Request</Label>
                      <Input
                          type="number"
                          step={0.5}
                          value={formData.minDaysPerRequest}
                          onChange={(e) => updateField('minDaysPerRequest', Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      {[
                        { key: 'requiresApproval', label: 'Requires Approval', desc: 'Manager must approve before leave is taken', value: formData.requiresApproval },
                        { key: 'requiresAttachment', label: 'Requires Attachment', desc: 'Supporting documents required', value: formData.requiresAttachment },
                        { key: 'requiresDoctorNote', label: "Requires Doctor's Note", desc: 'Medical certificate required for sick leave', value: formData.requiresDoctorNote },
                        { key: 'allowHalfDay', label: 'Allow Half Day Leave', desc: 'Employee can take half day leave', value: formData.allowHalfDay },
                        { key: 'allowNegativeBalance', label: 'Allow Negative Balance', desc: 'Allow leave when balance is insufficient', value: formData.allowNegativeBalance },
                        { key: 'holidaysAsLeave', label: 'Holidays as Leave', desc: 'Count holidays as leave days', value: formData.holidaysAsLeave }
                      ].map(rule => (
                          <div key={rule.key} className="flex items-center justify-between py-2">
                            <div>
                              <span className="text-sm text-gray-700">{rule.label}</span>
                              <p className="text-xs text-gray-500">{rule.desc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => updateField(rule.key, !rule.value)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    rule.value ? 'bg-emerald-600' : 'bg-gray-300'
                                }`}
                            >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            rule.value ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* Tab 3: Eligibility */}
              {activeTab === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Minimum Service Months</Label>
                      <Input
                          type="number"
                          value={formData.minServiceMonths}
                          onChange={(e) => updateField('minServiceMonths', Number(e.target.value))}
                      />
                      <p className="text-xs text-gray-500">Months employee must be employed before eligible</p>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-gray-700">Probation Period Only</span>
                        <p className="text-xs text-gray-500">Only available during probation</p>
                      </div>
                      <button
                          type="button"
                          onClick={() => updateField('probationPeriodOnly', !formData.probationPeriodOnly)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData.probationPeriodOnly ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                      >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.probationPeriodOnly ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Eligible Employment Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {employmentTypeOptions.map(type => {
                          const Icon = type.icon;
                          const isSelected = (formData.eligibleEmploymentTypes || []).includes(type.value);
                          return (
                              <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => {
                                    const current = formData.eligibleEmploymentTypes || [];
                                    const updated = current.includes(type.value)
                                        ? current.filter(t => t !== type.value)
                                        : [...current, type.value];
                                    updateField('eligibleEmploymentTypes', updated);
                                  }}
                                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                                      isSelected
                                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                  }`}
                              >
                                <Icon size={14} />
                                {type.label}
                                {isSelected && <CheckCircle size={14} />}
                              </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
              )}

              {/* Tab 4: Notifications */}
              {activeTab === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-gray-700">Notify Manager on Request</span>
                        <p className="text-xs text-gray-500">Send notification when leave is requested</p>
                      </div>
                      <button
                          type="button"
                          onClick={() => updateField('notifyManagerOnRequest', !formData.notifyManagerOnRequest)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData.notifyManagerOnRequest ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                      >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.notifyManagerOnRequest ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Send Reminders (days before)</Label>
                      <div className="flex flex-wrap gap-2">
                        {[30, 14, 7, 3, 1].map(days => {
                          const isSelected = (formData.sendReminderDays || []).includes(days);
                          return (
                              <button
                                  key={days}
                                  type="button"
                                  onClick={() => toggleArrayItem('sendReminderDays', days, formData.sendReminderDays || [])}
                                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                                      isSelected
                                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                                  }`}
                              >
                                {days} days
                              </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <Label className="text-sm font-medium text-gray-700">Display Priority</Label>
                      <Input
                          type="number"
                          value={formData.priority}
                          onChange={(e) => updateField('priority', Number(e.target.value))}
                      />
                      <p className="text-xs text-gray-500">Lower number = higher priority in lists</p>
                    </div>
                  </div>
              )}

              {/* Tab 5: Approval Chain */}
              {activeTab === 5 && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <GitBranch size={18} className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Approval Workflow Configuration</span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        Define who needs to approve leave requests and in what order
                      </p>
                    </div>

                    <div className="space-y-3">
                      {approvalSteps.map((step) => {
                        const ApproverIcon = approverTypeOptions.find(o => o.value === step.approverType)?.icon || UserCheck;

                        return (
                            <div key={step.id} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                    {step.stepOrder}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">Step {step.stepOrder}</span>
                                  {step.isFinal && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                        Final Step
                                      </span>
                                  )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeApprovalStep(step.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-600">Step Name</Label>
                                  <Input
                                      value={step.stepName}
                                      onChange={(e) => updateApprovalStep(step.id, 'stepName', e.target.value)}
                                      placeholder="e.g., Manager Approval"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-600">Approver Type</Label>
                                  <select
                                      value={step.approverType}
                                      onChange={(e) => updateApprovalStep(step.id, 'approverType', e.target.value as any)}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                  >
                                    {approverTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {(step.approverType === 'SpecificPerson' || step.approverType === 'Role') && (
                                  <div className="mt-2 space-y-1">
                                    <Label className="text-xs font-medium text-gray-600">
                                      {step.approverType === 'SpecificPerson' ? 'Person Name/ID' : 'Role Name'}
                                    </Label>
                                    {step.approverType === 'Role' ? (
                                        <select
                                            value={step.approverValue || ''}
                                            onChange={(e) => updateApprovalStep(step.id, 'approverValue', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                        >
                                          <option value="">Select Role</option>
                                          {availableRoles.map(role => (
                                              <option key={role} value={role}>{role}</option>
                                          ))}
                                        </select>
                                    ) : (
                                        <Input
                                            value={step.approverValue || ''}
                                            onChange={(e) => updateApprovalStep(step.id, 'approverValue', e.target.value)}
                                            placeholder="Enter person name or ID"
                                        />
                                    )}
                                  </div>
                              )}

                              <div className="mt-2 space-y-1">
                                <Label className="text-xs font-medium text-gray-600">Timeout Hours (Optional)</Label>
                                <Input
                                    type="number"
                                    value={step.timeoutHours || ''}
                                    onChange={(e) => updateApprovalStep(step.id, 'timeoutHours', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="Auto-escalate after hours"
                                />
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`edit-final-step-${step.id}`}
                                    checked={step.isFinal}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const updatedSteps = approvalSteps.map(s => ({
                                          ...s,
                                          isFinal: s.id === step.id
                                        }));
                                        setApprovalSteps(updatedSteps);
                                      } else {
                                        updateApprovalStep(step.id, 'isFinal', false);
                                      }
                                    }}
                                    className="h-4 w-4 accent-purple-600"
                                />
                                <Label htmlFor={`edit-final-step-${step.id}`} className="text-sm text-gray-600">
                                  Mark as final approval step
                                </Label>
                              </div>
                            </div>
                        );
                      })}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addApprovalStep}
                        className="w-full border-dashed border-2 hover:bg-purple-50"
                    >
                      <BadgePlus size={16} className="mr-2" />
                      Add Approval Step
                    </Button>

                    {/* Preview of Approval Flow */}
                    {approvalSteps.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 mb-2">Approval Flow Preview:</p>
                          <div className="flex items-center flex-wrap gap-2">
                            {approvalSteps.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                  <div className="bg-white px-3 py-1 rounded-full text-xs shadow-sm">
                                    {step.stepName}
                                  </div>
                                  {idx < approvalSteps.length - 1 && (
                                      <ChevronRight size={14} className="text-gray-400" />
                                  )}
                                </React.Fragment>
                            ))}
                          </div>
                        </div>
                    )}
                  </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Step {activeTab + 1} of {tabs.length}
                </div>
                <div className="flex gap-3">
                  {activeTab > 0 && (
                      <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab(activeTab - 1)}
                          className="flex items-center gap-1"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </Button>
                  )}
                  {activeTab < tabs.length - 1 ? (
                      <Button
                          type="button"
                          onClick={() => setActiveTab(activeTab + 1)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Next
                      </Button>
                  ) : (
                      <Button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={loading || !formData.name?.trim()}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                  )}
                  <Button
                      variant="outline"
                      onClick={handleClose}
                      type="button"
                      disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default EditLeaveTypeModal;