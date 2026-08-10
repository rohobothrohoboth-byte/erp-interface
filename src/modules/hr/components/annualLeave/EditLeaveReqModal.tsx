import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { LeaveRequestListDto, LeaveRequestModDto } from '@/modules/hr/types/leaverequest';
import type { ListItem } from '@/modules/list/types/list';
import type { UUID } from 'crypto';

interface EditLeaveReqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: UUID, data: Partial<LeaveRequestModDto>) => Promise<void>;
  leave: LeaveRequestListDto;
  leaveTypes: ListItem[];
  loading: boolean;
}

const EditLeaveReqModal: React.FC<EditLeaveReqModalProps> = ({ isOpen, onClose, onSave, leave, leaveTypes, loading }) => {
  const [formData, setFormData] = useState({
    leaveTypeId: leave.leaveTypeId,
    startDate: leave.startDate?.split('T')[0] || '',
    endDate: leave.endDate?.split('T')[0] || '',
    isHalfDay: leave.isHalfDayStr === 'Yes' || leave.isHalfDay === true,
    comments: leave.comments || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      leaveTypeId: leave.leaveTypeId,
      startDate: leave.startDate?.split('T')[0] || '',
      endDate: leave.endDate?.split('T')[0] || '',
      isHalfDay: leave.isHalfDayStr === 'Yes' || leave.isHalfDay === true,
      comments: leave.comments || '',
    });
  }, [leave]);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };
  const totalDays = calculateDays();
  const isSingleDay = totalDays === 1;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.leaveTypeId) newErrors.leaveTypeId = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.endDate) < new Date(formData.startDate)) newErrors.endDate = 'End date cannot be before start date';
    if (!formData.comments.trim()) newErrors.comments = 'Reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(leave.id, formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">Edit Leave Request</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Leave Type <span className="text-red-500">*</span></Label>
              <Select value={formData.leaveTypeId} onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value as UUID })}>
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>{leaveTypes.map((type) => (<SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} min={new Date().toISOString().split('T')[0]} /></div>
              <div><Label>End Date</Label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate} /></div>
            </div>
            {isSingleDay && (<div className="flex items-center space-x-2"><Checkbox checked={formData.isHalfDay} onCheckedChange={(checked) => setFormData({ ...formData, isHalfDay: checked as boolean })} /><Label>Half Day Leave</Label></div>)}
            <div><Label>Reason</Label><Textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} placeholder="Reason for leave..." className="min-h-[80px]" /></div>
          </div>
          <div className="border-t p-4 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Update</Button>
          </div>
        </motion.div>
      </div>
  );
};

export default EditLeaveReqModal;