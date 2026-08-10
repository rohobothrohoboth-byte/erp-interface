import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { Contact } from '@/modules/crm/types/crm';

interface ContactEmailModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onEmailSent: (emailData: { subject: string; message: string }) => void;
}

export default function ContactEmailModal({
  contact,
  isOpen,
  onClose,
  onEmailSent,
}: ContactEmailModalProps) {
  const [emailData, setEmailData] = useState({ subject: '', message: '' });

  const emailTemplates = [
    {
      name: 'Initial Contact',
      subject: 'Thank you for your interest',
      message: `Hi ${contact.firstName},\n\nThank you for your interest in our services.\n\nWould you be available for a brief call this week?\n\nBest regards,\n[Your Name]`,
    },
    {
      name: 'Follow-up',
      subject: 'Following up on our conversation',
      message: `Hi ${contact.firstName},\n\nI wanted to follow up on our recent conversation.\n\nPlease let me know if you have any questions.\n\nBest regards,\n[Your Name]`,
    },
    {
      name: 'Product Demo',
      subject: 'Product demonstration invitation',
      message: `Hi ${contact.firstName},\n\nI would like to invite you to a personalized demo of our solution.\n\nWould you be available for 30 minutes this week?\n\nBest regards,\n[Your Name]`,
    },
    {
      name: 'Check-in',
      subject: 'Checking in',
      message: `Hi ${contact.firstName},\n\nI hope this email finds you well. Is there anything we can help you with?\n\nBest regards,\n[Your Name]`,
    },
  ];

  const handleSend = () => {
    if (!emailData.message.trim() || !emailData.subject.trim()) return;
    onEmailSent(emailData);
    setEmailData({ subject: '', message: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <Mail className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">
            Send Email to {contact.firstName} {contact.lastName}
          </h2>
        </div>

        <div className="px-6">
          <div className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>To</Label>
                <Input value={contact.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-1">
                <Label>Template</Label>
                <Select
                  onValueChange={(v) => {
                    const t = emailTemplates.find((t) => t.name === v);
                    if (t) setEmailData({ subject: t.subject, message: t.message });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Subject</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea
                value={emailData.message}
                onChange={(e) => setEmailData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Type your email message here..."
                rows={12}
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!emailData.message.trim() || !emailData.subject.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Send Email
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
