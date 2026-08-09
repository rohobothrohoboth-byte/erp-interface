// src/components/crm/orders/OrderPostSales.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { showToast } from '../../../layout/layout';

interface OrderPostSalesProps {
  orderId: string;
  customerId: string;
  onSendFollowUp: (data: any) => Promise<void>;
  onAddNote: (note: string) => Promise<void>;
  isProcessing?: boolean;
}

const OrderPostSales: React.FC<OrderPostSalesProps> = ({
                                                         orderId,
                                                         customerId,
                                                         onSendFollowUp,
                                                         onAddNote,
                                                         isProcessing = false,
                                                       }) => {
  const [followUpType, setFollowUpType] = useState('email');
  const [followUpSubject, setFollowUpSubject] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState<number | null>(null);

  const followUpTypes = [
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'phone', label: 'Phone Call', icon: <Phone className="h-4 w-4" /> },
    { value: 'meeting', label: 'Meeting', icon: <Calendar className="h-4 w-4" /> },
    { value: 'message', label: 'Message', icon: <MessageSquare className="h-4 w-4" /> },
  ];

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpSubject.trim() || !followUpMessage.trim()) {
      showToast.error('Please fill in all fields');
      return;
    }

    try {
      await onSendFollowUp({
        type: followUpType,
        subject: followUpSubject,
        message: followUpMessage,
      });
      showToast.success('Follow-up sent successfully');
      setFollowUpSubject('');
      setFollowUpMessage('');
    } catch (error) {
      showToast.error('Failed to send follow-up');
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      showToast.error('Please enter a note');
      return;
    }

    try {
      await onAddNote(note);
      showToast.success('Note added successfully');
      setNote('');
    } catch (error) {
      showToast.error('Failed to add note');
    }
  };

  const handleFeedback = async (rating: number) => {
    setFeedback(rating);
    // In a real app, this would send feedback to the server
    showToast.success('Thank you for your feedback!');
  };

  return (
      <div className="space-y-6">
        {/* Follow-up Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Customer Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFollowUp} className="space-y-4">
              <div>
                <Label htmlFor="followUpType">Follow-up Type</Label>
                <Select
                    value={followUpType}
                    onValueChange={setFollowUpType}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {followUpTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                                            <span className="flex items-center gap-2">
                                                {type.icon}
                                              {type.label}
                                            </span>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="followUpSubject">Subject</Label>
                <Input
                    id="followUpSubject"
                    value={followUpSubject}
                    onChange={(e) => setFollowUpSubject(e.target.value)}
                    placeholder="Enter subject..."
                    className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="followUpMessage">Message</Label>
                <Textarea
                    id="followUpMessage"
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    placeholder="Enter your message..."
                    className="mt-1"
                    rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isProcessing}
                >
                  {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                  ) : (
                      'Send Follow-up'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note">Add Note</Label>
                <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    className="mt-1"
                    rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={handleAddNote}
                    disabled={isProcessing || !note.trim()}
                >
                  Add Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Feedback Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-indigo-600" />
              Customer Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-gray-600 mb-3">
                How would you rate the overall customer experience?
              </p>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => handleFeedback(rating)}
                        className={`p-3 rounded-lg transition-all ${
                            feedback === rating
                                ? 'bg-indigo-100 border-2 border-indigo-600'
                                : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                    >
                      <Star
                          className={`h-6 w-6 ${
                              feedback && rating <= feedback
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-400'
                          }`}
                      />
                    </button>
                ))}
                {feedback && (
                    <span className="ml-2 text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Thanks for rating!
                                </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default OrderPostSales;