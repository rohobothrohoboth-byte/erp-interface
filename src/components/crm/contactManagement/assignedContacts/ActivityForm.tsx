import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { showToast } from '../../../../layout/layout';

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  contactId: string;
}

export default function ActivityForm({ isOpen, onClose, onSubmit, contactId }: ActivityFormProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: '',
    date: new Date(),
    duration: '',
    outcome: '',
    status: 'completed'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.subject || !formData.description) {
      showToast.error('Please fill in all required fields');
      return;
    }
    onSubmit({
      ...formData,
      date: formData.date.toISOString(),
      duration: formData.duration ? parseInt(formData.duration) : undefined
    });
    setFormData({ type: '', subject: '', description: '', date: new Date(), duration: '', outcome: '', status: 'completed' });
    showToast.success('Activity added successfully');
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <Plus className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold">Add New Activity</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Activity Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select activity type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} placeholder="Enter activity subject" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe the activity details..." rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formData.date} onSelect={(date) => date && handleChange('date', date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} placeholder="e.g., 30" min="1" />
              </div>
            </div>

            {formData.status === 'completed' && (
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea id="outcome" value={formData.outcome} onChange={(e) => handleChange('outcome', e.target.value)} placeholder="What was the outcome of this activity?" rows={3} />
              </div>
            )}
          </div>

          <div className="border-t px-6 py-2">
            <div className="flex justify-center items-center gap-1.5">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Add Activity</Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
