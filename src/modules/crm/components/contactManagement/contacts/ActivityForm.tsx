import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { showToast } from '@/shared/layout/layout';

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  contactId: string;
}

export default function ActivityForm({ isOpen, onClose, onSubmit, contactId }: ActivityFormProps) {
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

    // Reset form
    setFormData({
      type: '',
      subject: '',
      description: '',
      date: new Date(),
      duration: '',
      outcome: '',
      status: 'completed'
    });

    showToast.success('Activity added successfully');
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
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
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
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
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Enter activity subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the activity details..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && handleChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g., 30"
                min="1"
              />
            </div>
          </div>

          {formData.status === "completed" && (
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Textarea
                id="outcome"
                value={formData.outcome}
                onChange={(e) => handleChange("outcome", e.target.value)}
                placeholder="What was the outcome of this activity?"
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-center space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}