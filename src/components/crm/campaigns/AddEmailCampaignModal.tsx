import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';

interface AddEmailCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: any) => void;
  editingCampaign?: any;
}

const statusOptions = ['Draft', 'Scheduled', 'Sent', 'Cancelled'];
const targetTypeOptions = ['Leads', 'Customers', 'Contacts'];

const emailTemplates = [
  { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to {{company_name}}!', previewText: "We're excited to have you on board", body: 'Dear {{first_name}},\n\nWelcome to {{company_name}}! We\'re thrilled to have you join our community.\n\nBest regards,\nThe Team' },
  { id: 'promotion', name: 'Promotional Email', subject: 'Special Offer Just for You!', previewText: "Don't miss out on this exclusive deal", body: 'Hi {{first_name}},\n\nWe have an exclusive offer just for you! Get {{discount}}% off on your next purchase.\n\nUse code: {{promo_code}}\n\nBest regards,\nSales Team' },
  { id: 'newsletter', name: 'Newsletter', subject: '{{company_name}} Monthly Newsletter', previewText: 'Your monthly update is here', body: 'Hello {{first_name}},\n\nHere\'s what\'s new this month at {{company_name}}.\n\n{{newsletter_content}}\n\nStay connected,\nThe Team' },
  { id: 'followup', name: 'Follow-up Email', subject: 'Following up on our conversation', previewText: "Let's continue our discussion", body: 'Hi {{first_name}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nLooking forward to hearing from you.\n\nBest regards,\n{{sender_name}}' }
];

const emptyForm = {
  campaignId: '', templateId: '', subject: '', previewText: '', body: '',
  sendToAll: true, targetType: 'Leads', selectedRecipients: [] as string[],
  scheduledDate: '', status: 'Draft'
};

export default function AddEmailCampaignModal({ isOpen, onClose, onSubmit, editingCampaign }: AddEmailCampaignModalProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = (key: string) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; };
    setCampaigns(stored('campaigns'));
    setLeads(stored('leads'));
    const allContacts = stored('contacts');
    setContacts(allContacts);
    setCustomers(allContacts.filter((c: any) => c.type === 'Customer'));
  }, []);

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        campaignId: editingCampaign.campaignId || '',
        templateId: editingCampaign.templateId || '',
        subject: editingCampaign.subject || '',
        previewText: editingCampaign.previewText || '',
        body: editingCampaign.body || '',
        sendToAll: editingCampaign.sendToAll !== undefined ? editingCampaign.sendToAll : true,
        targetType: editingCampaign.targetType || 'Leads',
        selectedRecipients: editingCampaign.selectedRecipients || [],
        scheduledDate: editingCampaign.scheduledDate || '',
        status: editingCampaign.status || 'Draft'
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editingCampaign, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.campaignId) e.campaignId = 'Campaign is required';
    if (!formData.subject.trim()) e.subject = 'Subject is required';
    if (!formData.body.trim()) e.body = 'Message is required';
    if (!formData.sendToAll && formData.selectedRecipients.length === 0) e.selectedRecipients = 'Please select at least one recipient';
    if (formData.status === 'Scheduled' && !formData.scheduledDate) e.scheduledDate = 'Scheduled date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'templateId') {
      const t = emailTemplates.find(t => t.id === value);
      if (t) {
        setFormData(prev => ({ ...prev, templateId: value, subject: t.subject, previewText: t.previewText, body: t.body }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleRecipient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRecipients: prev.selectedRecipients.includes(id)
        ? prev.selectedRecipients.filter(r => r !== id)
        : [...prev.selectedRecipients, id]
    }));
  };

  const getRecipients = () => {
    if (formData.targetType === 'Leads') return leads;
    if (formData.targetType === 'Customers') return customers;
    return contacts;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (!editingCampaign) setFormData(emptyForm);
      setErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <Mail className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">
            {editingCampaign ? 'Edit Email Campaign' : 'Create New Email Campaign'}
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Campaign <span className="text-red-500">*</span></Label>
                <Select value={formData.campaignId} onValueChange={v => handleChange('campaignId', v)}>
                  <SelectTrigger className={errors.campaignId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.length === 0
                      ? <SelectItem value="none" disabled>No campaigns available</SelectItem>
                      : campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
                {errors.campaignId && <p className="text-xs text-red-500">{errors.campaignId}</p>}
                {selectedCampaign && <p className="text-xs text-gray-500">Target: {selectedCampaign.targetAudience} | Budget: ${selectedCampaign.budget}</p>}
              </div>

              <div className="space-y-1">
                <Label>Subject <span className="text-red-500">*</span></Label>
                <Input value={formData.subject} onChange={e => handleChange('subject', e.target.value)} placeholder="Email subject" className={errors.subject ? 'border-red-500' : ''} />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
              </div>

              <div className="space-y-1">
                <Label>Preview Text</Label>
                <Input value={formData.previewText} onChange={e => handleChange('previewText', e.target.value)} placeholder="Preview text shown in inbox" />
              </div>

              <div className="space-y-1">
                <Label>Message <span className="text-red-500">*</span></Label>
                <Textarea value={formData.body} onChange={e => handleChange('body', e.target.value)} placeholder="Type your email message here..." rows={8} className={errors.body ? 'border-red-500' : ''} />
                {errors.body && <p className="text-xs text-red-500">{errors.body}</p>}
              </div>

              <div className="space-y-1">
                <Label>Email Template (Optional)</Label>
                <Select value={formData.templateId} onValueChange={v => handleChange('templateId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select template to auto-fill" /></SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Target Type <span className="text-red-500">*</span></Label>
                <Select value={formData.targetType} onValueChange={v => { handleChange('targetType', v); handleChange('selectedRecipients', []); handleChange('sendToAll', false); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {targetTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Select Recipients <span className="text-red-500">*</span></Label>
                <Select value={formData.sendToAll ? 'all' : ''} onValueChange={v => { if (v === 'all') { handleChange('sendToAll', true); handleChange('selectedRecipients', []); } else { handleChange('sendToAll', false); toggleRecipient(v); } }}>
                  <SelectTrigger className={errors.selectedRecipients ? 'border-red-500' : ''}>
                    <SelectValue placeholder={formData.sendToAll ? `All ${formData.targetType}` : formData.selectedRecipients.length > 0 ? `${formData.selectedRecipients.length} selected` : 'Select recipients'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={formData.sendToAll} onCheckedChange={c => { handleChange('sendToAll', c); if (c) handleChange('selectedRecipients', []); }} className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
                        <span className="font-medium">Select All {formData.targetType}</span>
                      </div>
                    </SelectItem>
                    {getRecipients().length === 0
                      ? <SelectItem value="none" disabled>No {formData.targetType.toLowerCase()} available</SelectItem>
                      : getRecipients().map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={formData.selectedRecipients.includes(r.id)} onCheckedChange={() => { handleChange('sendToAll', false); toggleRecipient(r.id); }} className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
                            <div>
                              <div className="text-sm font-medium">{r.firstName} {r.lastName}</div>
                              <div className="text-xs text-gray-500">{r.email}{r.company && ` • ${r.company}`}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {errors.selectedRecipients && <p className="text-xs text-red-500">{errors.selectedRecipients}</p>}
                {(formData.sendToAll || formData.selectedRecipients.length > 0) && (
                  <p className="text-xs text-orange-600 font-medium">✓ {formData.sendToAll ? `All ${formData.targetType}` : `${formData.selectedRecipients.length} recipient(s)`} selected</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Scheduled Date {formData.status === 'Scheduled' && <span className="text-red-500">*</span>}</Label>
                <Input type="datetime-local" value={formData.scheduledDate} onChange={e => handleChange('scheduledDate', e.target.value)} className={errors.scheduledDate ? 'border-red-500' : ''} />
                {errors.scheduledDate && <p className="text-xs text-red-500">{errors.scheduledDate}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isSubmitting
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />{editingCampaign ? 'Updating...' : 'Creating...'}</>
                : editingCampaign ? 'Update Campaign' : 'Create Campaign'
              }
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
