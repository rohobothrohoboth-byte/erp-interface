import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, User, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import type { SupportTicket } from '@/modules/crm/types/crm';

interface TicketFormProps {
  ticket?: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: Partial<SupportTicket>) => void;
  mode: 'add' | 'edit';
}

export default function TicketForm({ ticket, isOpen, onClose, onSubmit, mode }: TicketFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as SupportTicket['priority'],
    category: 'General' as SupportTicket['category'],
    channel: 'email' as SupportTicket['channel'],
    assignedTo: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    customerTier: 'Basic' as 'Basic' | 'Premium' | 'Enterprise',
    tags: [] as string[],
    newTag: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ticket && mode === 'edit') {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        channel: ticket.channel,
        assignedTo: ticket.assignedTo,
        customerName: ticket.customerInfo.name,
        customerEmail: ticket.customerInfo.email,
        customerPhone: ticket.customerInfo.phone || '',
        customerCompany: ticket.customerInfo.company || '',
        customerTier: ticket.customerInfo.tier,
        tags: ticket.tags,
        newTag: ''
      });
    } else {
      // Reset form for add mode
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        category: 'General',
        channel: 'email',
        assignedTo: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerCompany: '',
        customerTier: 'Basic',
        tags: [],
        newTag: ''
      });
    }
    setErrors({});
  }, [ticket, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign the ticket to an agent or team';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    const ticketData: Partial<SupportTicket> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      category: formData.category,
      channel: formData.channel,
      assignedTo: formData.assignedTo,
      tags: formData.tags,
      customerInfo: {
        name: formData.customerName.trim(),
        email: formData.customerEmail.trim(),
        phone: formData.customerPhone.trim() || undefined,
        company: formData.customerCompany.trim() || undefined,
        tier: formData.customerTier
      }
    };

    onSubmit(ticketData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.newTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const agents = [
    'Tech Support Team',
    'Product Team',
    'Customer Success',
    'Engineering Team',
    'Sales Team'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{mode === 'add' ? 'Create New Ticket' : 'Edit Ticket'}</span>
            {mode === 'edit' && ticket && (
              <Badge variant="outline">#{ticket.id}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Ticket Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="channel">Channel *</Label>
                <Select value={formData.channel} onValueChange={(value) => handleInputChange('channel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="web">Web Form</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedTo">Assign To *</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger className={errors.assignedTo ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select agent or team" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedTo && <p className="text-sm text-red-600 mt-1">{errors.assignedTo}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName" className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Customer Name *</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Full name"
                  className={errors.customerName ? 'border-red-500' : ''}
                />
                {errors.customerName && <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <Label htmlFor="customerEmail" className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Email Address *</span>
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="customer@example.com"
                  className={errors.customerEmail ? 'border-red-500' : ''}
                />
                {errors.customerEmail && <p className="text-sm text-red-600 mt-1">{errors.customerEmail}</p>}
              </div>

              <div>
                <Label htmlFor="customerPhone" className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+1-555-0123"
                />
              </div>

              <div>
                <Label htmlFor="customerCompany" className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>Company</span>
                </Label>
                <Input
                  id="customerCompany"
                  value={formData.customerCompany}
                  onChange={(e) => handleInputChange('customerCompany', e.target.value)}
                  placeholder="Company name"
                />
              </div>

              <div>
                <Label htmlFor="customerTier">Customer Tier</Label>
                <Select value={formData.customerTier} onValueChange={(value) => handleInputChange('customerTier', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Tags</h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={formData.newTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add Tag
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-600" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              {mode === 'add' ? 'Create Ticket' : 'Update Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}