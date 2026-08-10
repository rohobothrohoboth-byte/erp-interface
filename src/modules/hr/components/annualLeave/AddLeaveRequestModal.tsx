// src/components/hr/Leave/Modals/AddLeaveRequestModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MessageSquare, Loader2, AlertCircle, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { LeaveRequestAddDto } from '@/modules/hr/types/leaverequest';
import type { ListItem } from '@/modules/list/types/list';
import type { UUID } from 'crypto';

interface AddLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  leaveTypes: ListItem[];
  employeeId: UUID;
  loading: boolean;
}

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

const AddLeaveRequestModal: React.FC<AddLeaveRequestModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSave,
                                                                     leaveTypes,
                                                                     employeeId,
                                                                     loading,
                                                                   }) => {
  const [formData, setFormData] = useState<LeaveRequestAddDto>({
    leaveTypeId: '' as UUID,
    startDate: '',
    endDate: '',
    isHalfDay: false,
    comments: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();
  const isSingleDay = totalDays === 1;

  // Parse backend validation errors
  const parseValidationErrors = (errorMessage: string): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    if (errorMessage.includes('Insufficient leave balance')) {
      const balanceMatch = errorMessage.match(/Available: (\d+) days/);
      const requestedMatch = errorMessage.match(/Requested: (\d+) working days/);
      issues.push({
        type: 'error',
        message: balanceMatch && requestedMatch
            ? `Insufficient leave balance. You requested ${requestedMatch[1]} days but only have ${balanceMatch[1]} days available.`
            : 'Insufficient leave balance. You don\'t have enough days available for this request.'
      });
    }

    if (errorMessage.includes('overlaps with existing leave')) {
      const overlapMatch = errorMessage.match(/overlaps with existing leave\(s\): (.+?)(?:,|$)/);
      issues.push({
        type: 'error',
        message: overlapMatch
            ? `This leave request overlaps with: ${overlapMatch[1]}`
            : 'This leave request overlaps with an existing approved leave request.'
      });
    }

    if (errorMessage.includes('minimum service requirement')) {
      const serviceMatch = errorMessage.match(/Required: (\d+) months, Current: (\d+) months/);
      issues.push({
        type: 'error',
        message: serviceMatch
            ? `You need ${serviceMatch[1]} months of service to request this leave. You have only ${serviceMatch[2]} months.`
            : 'You don\'t meet the minimum service requirement for this leave type.'
      });
    }

    if (errorMessage.includes('Leave policy is not active')) {
      issues.push({
        type: 'error',
        message: 'The leave policy for this type is currently inactive. Please contact HR.'
      });
    }

    if (errorMessage.includes('Cannot request leave for past dates')) {
      issues.push({
        type: 'error',
        message: 'You cannot request leave for past dates. Please select a future start date.'
      });
    }

    if (errorMessage.includes('Start date cannot be after end date')) {
      issues.push({
        type: 'error',
        message: 'Start date must be before or on the end date.'
      });
    }

    if (errorMessage.includes('Duplicate request')) {
      issues.push({
        type: 'error',
        message: 'You already have a pending or approved request for this leave type in the selected period.'
      });
    }

    // If no specific issues were parsed, show the raw error
    if (issues.length === 0 && errorMessage) {
      issues.push({
        type: 'error',
        message: errorMessage.replace('Leave request VALIDATION FAILED: ', '')
      });
    }

    return issues;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.leaveTypeId) newErrors.leaveTypeId = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    if (!formData.comments.trim()) newErrors.comments = 'Reason is required';

    setErrors(newErrors);
    setValidationIssues([]);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setValidationIssues([]);

    try {
      // CRITICAL FIX: Include employeeId in the request data
      const requestData = {
        ...formData,
        employeeId: employeeId,  // Add employeeId from props
      };

      console.log('📤 Submitting leave request with data:', {
        ...requestData,
        employeeId: employeeId,
      });

      await onSave(requestData);

      // Only reset form and close on success
      setFormData({ leaveTypeId: '' as UUID, startDate: '', endDate: '', isHalfDay: false, comments: '' });
      setErrors({});
      setValidationIssues([]);
    } catch (error: any) {
      console.error('❌ Error submitting leave request:', error);

      // Extract error message from the error object
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit leave request';

      // Parse validation errors
      if (errorMessage.includes('VALIDATION FAILED') || errorMessage.includes('Validation failed')) {
        const issues = parseValidationErrors(errorMessage);
        setValidationIssues(issues);
      } else {
        setValidationIssues([{ type: 'error', message: errorMessage }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ leaveTypeId: '' as UUID, startDate: '', endDate: '', isHalfDay: false, comments: '' });
      setErrors({});
      setValidationIssues([]);
      onClose();
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear validation issues when user makes changes
    if (validationIssues.length > 0) {
      setValidationIssues([]);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-900">Request Leave</h2>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Employee Info (read-only) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Employee ID:</span> {employeeId}
              </p>
            </div>

            {/* Validation Issues Alert */}
            {validationIssues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium text-red-800">Validation Issues</p>
                  </div>
                  <div className="space-y-1.5">
                    {validationIssues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          {issue.type === 'error' && <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                          <span className="text-red-700">{issue.message}</span>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            <div className="space-y-2">
              <Label>Leave Type <span className="text-red-500">*</span></Label>
              <Select
                  value={formData.leaveTypeId}
                  onValueChange={(value) => handleFormChange('leaveTypeId', value as UUID)}
                  disabled={isSubmitting || loading}
              >
                <SelectTrigger className={errors.leaveTypeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveTypeId && <p className="text-xs text-red-500">{errors.leaveTypeId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                      type="date"
                      value={formData.startDate as string}
                      onChange={(e) => handleFormChange('startDate', e.target.value)}
                      className="pl-9"
                      min={new Date().toISOString().split('T')[0]}
                      disabled={isSubmitting || loading}
                  />
                </div>
                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label>End Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                      type="date"
                      value={formData.endDate as string}
                      onChange={(e) => handleFormChange('endDate', e.target.value)}
                      className="pl-9"
                      min={formData.startDate as string}
                      disabled={isSubmitting || loading}
                  />
                </div>
                {errors.endDate && <p className="text-xs text-red-500">{errors.endDate}</p>}
              </div>
            </div>

            {formData.startDate && formData.endDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    Total days: <span className="font-semibold text-emerald-600">{totalDays}</span> day(s)
                  </p>
                </div>
            )}

            {formData.startDate && formData.endDate && formData.startDate === formData.endDate && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                      id="halfDay"
                      checked={formData.isHalfDay}
                      onCheckedChange={(checked) => handleFormChange('isHalfDay', checked as boolean)}
                      disabled={isSubmitting || loading}
                  />
                  <Label htmlFor="halfDay" className="text-sm font-normal">Half Day Leave (Morning/Afternoon)</Label>
                </div>
            )}

            <div className="space-y-2">
              <Label>Reason <span className="text-red-500">*</span></Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                    value={formData.comments}
                    onChange={(e) => handleFormChange('comments', e.target.value)}
                    placeholder="Please provide a reason for your leave request..."
                    className="pl-9 min-h-[100px]"
                    disabled={isSubmitting || loading}
                />
              </div>
              {errors.comments && <p className="text-xs text-red-500">{errors.comments}</p>}
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ Please note: Leave requests are subject to approval by your manager.
                You will be notified once your request is reviewed.
              </p>
            </div>
          </div>

          <div className="border-t p-4 flex justify-end gap-3 bg-gray-50 sticky bottom-0">
            <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || loading}
                className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
              ) : (
                  'Submit Request'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

export default AddLeaveRequestModal;