// src/components/crm/leadManagement/assignedLeads/LeadCommunication.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MessageSquare, Calendar, Send,
  X, Clock, User, Building, FileText, Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import type { LeadDto } from '@/modules/crm/types/crm.types';

interface Communication {
  type: 'email' | 'call' | 'sms' | 'meeting';
  subject?: string;
  message: string;
  scheduledFor?: string;
  duration?: number;
  attendees?: string[];
}

interface LeadCommunicationProps {
  lead: LeadDto;
  isOpen: boolean;
  onClose: () => void;
  onCommunicationSent: (communication: Communication) => void;
}

const EMAIL_TEMPLATES = [
  {
    name: 'Initial Contact',
    subject: 'Thank you for your interest in our solution',
    message: `Hi {firstName},\n\nThank you for your interest in our solution. I'd love to learn more about your specific needs and how we can help.\n\nWould you be available for a brief call this week to discuss your requirements?\n\nBest regards,\n{userName}`
  },
  {
    name: 'Follow-up',
    subject: 'Following up on our conversation',
    message: `Hi {firstName},\n\nI wanted to follow up on our recent conversation about your project requirements.\n\nAs discussed, I'm attaching some additional information that might be helpful.\n\nPlease let me know if you have any questions or if you'd like to schedule a demo.\n\nBest regards,\n{userName}`
  },
  {
    name: 'Product Demo',
    subject: 'Product demonstration invitation',
    message: `Hi {firstName},\n\nI'd like to invite you to a personalized demonstration of our solution.\n\nBased on our conversation, I believe our platform can address your specific needs around {industry}.\n\nWould you be available for a 30-minute demo this week?\n\nBest regards,\n{userName}`
  },
  {
    name: 'Proposal',
    subject: 'Proposal for your consideration',
    message: `Hi {firstName},\n\nI'm pleased to share our proposal for {companyName}.\n\nThis proposal outlines how our solution can help you achieve your goals.\n\nPlease review the attached document and let me know if you have any questions.\n\nLooking forward to working with you,\n{userName}`
  }
];

export default function LeadCommunication({ lead, isOpen, onClose, onCommunicationSent }: LeadCommunicationProps) {
  if (!isOpen || !lead) return null;

  const [activeTab, setActiveTab] = useState('email');
  const [isSending, setIsSending] = useState(false);
  const [communication, setCommunication] = useState<Communication>({
    type: 'email',
    subject: '',
    message: '',
    scheduledFor: '',
    duration: 30,
    attendees: []
  });

  const handleTemplateSelect = (templateName: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      const firstName = lead.firstName || 'Valued Customer';
      const companyName = lead.companyName || 'your company';
      const industry = lead.industry || 'your industry';
      const userName = 'Your Name'; // Get from user context

      setCommunication({
        ...communication,
        subject: template.subject,
        message: template.message
            .replace(/{firstName}/g, firstName)
            .replace(/{companyName}/g, companyName)
            .replace(/{industry}/g, industry)
            .replace(/{userName}/g, userName)
      });
    }
  };

  const handleSend = async () => {
    if (!communication.message.trim()) {
      showToast.warning('Please enter a message');
      return;
    }

    setIsSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onCommunicationSent(communication);
      showToast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} sent successfully`);
      onClose();
    } catch (error) {
      console.error('Error sending communication:', error);
      showToast.error(`Failed to send ${activeTab}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCommunication(prev => ({ ...prev, type: tab as Communication['type'] }));
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Communicate with {lead.fullName || `${lead.firstName} ${lead.lastName}`}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Lead Summary */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {lead.companyName || 'No company'}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {lead.email || 'No email'}
              </div>
              {lead.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {lead.phone}
                  </div>
              )}
              <Badge className="bg-orange-100 text-orange-800">
                {lead.status || 'New'}
              </Badge>
            </div>
          </div>

          <div className="px-6 py-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                {['email', 'call', 'sms', 'meeting'].map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="flex items-center gap-2">
                      {getTabIcon(tab)}
                      <span className="capitalize">{tab}</span>
                    </TabsTrigger>
                ))}
              </TabsList>

              {/* Email Tab */}
              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input value={lead.email || ''} disabled className="bg-gray-50 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TEMPLATES.map((t) => (
                            <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                      value={communication.subject}
                      onChange={(e) => setCommunication(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                      value={communication.message}
                      onChange={(e) => setCommunication(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Type your email message here..."
                      rows={8}
                      className="font-mono text-sm"
                  />
                </div>
              </TabsContent>

              {/* Call Tab */}
              <TabsContent value="call" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={lead.phone || lead.mobile || ''} disabled className="bg-gray-50 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                        type="number"
                        value={communication.duration}
                        onChange={(e) => setCommunication(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        min="5"
                        max="120"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Call Notes / Agenda</Label>
                  <Textarea
                      value={communication.message}
                      onChange={(e) => setCommunication(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter call notes or talking points..."
                      rows={6}
                  />
                </div>
              </TabsContent>

              {/* SMS Tab */}
              <TabsContent value="sms" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={lead.phone || lead.mobile || ''} disabled className="bg-gray-50 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                      value={communication.message}
                      onChange={(e) => setCommunication(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Type your SMS message here..."
                      rows={4}
                      maxLength={160}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{communication.message.length}/160 characters</span>
                    {communication.message.length > 140 && (
                        <span className="text-yellow-500">Message will be split into multiple parts</span>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Meeting Tab */}
              <TabsContent value="meeting" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input
                        type="datetime-local"
                        value={communication.scheduledFor?.slice(0, 16)}
                        onChange={(e) => setCommunication(prev => ({ ...prev, scheduledFor: new Date(e.target.value).toISOString() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                        type="number"
                        value={communication.duration}
                        onChange={(e) => setCommunication(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        min="15"
                        max="240"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meeting Subject</Label>
                  <Input
                      value={communication.subject}
                      onChange={(e) => setCommunication(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Meeting subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agenda / Notes</Label>
                  <Textarea
                      value={communication.message}
                      onChange={(e) => setCommunication(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Meeting agenda, topics to discuss, or additional notes..."
                      rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attendees</Label>
                  <Input
                      value={communication.attendees?.join(', ') || ''}
                      onChange={(e) => setCommunication(prev => ({
                        ...prev,
                        attendees: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      placeholder="Enter email addresses separated by commas"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex justify-center items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                  onClick={handleSend}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isSending || !communication.message.trim()}
              >
                {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {activeTab === 'email' && 'Send Email'}
                      {activeTab === 'call' && 'Log Call'}
                      {activeTab === 'sms' && 'Send SMS'}
                      {activeTab === 'meeting' && 'Schedule Meeting'}
                    </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
}