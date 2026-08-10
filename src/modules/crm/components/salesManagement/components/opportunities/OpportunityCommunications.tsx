import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Mail, MessageSquare, Calendar, User, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';

interface Communication {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  contactPerson: string;
  contactEmail?: string;
  contactPhone?: string;
  duration?: number; // in minutes
  scheduledAt?: string;
  completedAt: string;
  createdBy: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  attachments?: string[];
}

interface OpportunityCommunicationsProps {
  opportunityId: string;
  communications: Communication[];
  onAdd: (communication: Partial<Communication>) => void;
  onEdit: (communication: Communication) => void;
  onDelete: (communicationId: string) => void;
}

const typeIcons = {
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />
};

const typeColors = {
  call: 'bg-blue-100 text-blue-800',
  email: 'bg-green-100 text-green-800',
  meeting: 'bg-purple-100 text-purple-800',
  note: 'bg-yellow-100 text-yellow-800'
};

const directionColors = {
  inbound: 'bg-emerald-100 text-emerald-800',
  outbound: 'bg-orange-100 text-orange-800'
};

export default function OpportunityCommunications({
  opportunityId,
  communications,
  onAdd,
  onEdit,
  onDelete
}: OpportunityCommunicationsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [formData, setFormData] = useState<Partial<Communication>>({
    type: 'call',
    direction: 'outbound',
    subject: '',
    content: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    outcome: '',
    followUpRequired: false,
    followUpDate: ''
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleAdd = () => {
    if (formData.subject && formData.content && formData.contactPerson) {
      const newCommunication: Communication = {
        ...formData,
        id: Date.now().toString(),
        completedAt: new Date().toISOString(),
        createdBy: 'Current User'
      } as Communication;
      
      onAdd(newCommunication);
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEdit = () => {
    if (selectedCommunication && formData.subject && formData.content) {
      const updatedCommunication: Communication = {
        ...selectedCommunication,
        ...formData
      } as Communication;
      
      onEdit(updatedCommunication);
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedCommunication(null);
    }
  };

  const openEditDialog = (communication: Communication) => {
    setSelectedCommunication(communication);
    setFormData({
      type: communication.type,
      direction: communication.direction,
      subject: communication.subject,
      content: communication.content,
      contactPerson: communication.contactPerson,
      contactEmail: communication.contactEmail || '',
      contactPhone: communication.contactPhone || '',
      duration: communication.duration,
      outcome: communication.outcome || '',
      followUpRequired: communication.followUpRequired,
      followUpDate: communication.followUpDate || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'call',
      direction: 'outbound',
      subject: '',
      content: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      outcome: '',
      followUpRequired: false,
      followUpDate: ''
    });
  };

  const sortedCommunications = [...communications].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Communications</h3>
          <p className="text-sm text-gray-600">Track all interactions and communications</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Communication
        </Button>
      </div>

      {/* Communications Timeline */}
      <div className="space-y-4">
        {sortedCommunications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No communications logged</h3>
                <p className="text-gray-500 mb-4">Start logging communications to track your interactions.</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log First Communication
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedCommunications.map((communication, index) => (
            <motion.div
              key={communication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start space-x-4">
                    {/* Type Icon */}
                    <div className={`p-2 rounded-full ${typeColors[communication.type]}`}>
                      {typeIcons[communication.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-medium text-gray-900">
                            {communication.subject}
                          </h4>
                          <Badge className={typeColors[communication.type]}>
                            {communication.type}
                          </Badge>
                          <Badge className={directionColors[communication.direction]}>
                            {communication.direction}
                          </Badge>
                          {communication.followUpRequired && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              Follow-up Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(communication)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(communication.id)}
                            className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{communication.content}</p>

                      {communication.outcome && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs font-medium text-blue-800 mb-1">Outcome:</div>
                          <div className="text-xs text-blue-700">{communication.outcome}</div>
                        </div>
                      )}

                      {communication.followUpRequired && communication.followUpDate && (
                        <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-xs font-medium text-orange-800 mb-1">Follow-up Date:</div>
                          <div className="text-xs text-orange-700">
                            {formatDate(communication.followUpDate)}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Contact: {communication.contactPerson}</span>
                          </div>
                          {communication.contactEmail && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{communication.contactEmail}</span>
                            </div>
                          )}
                          {communication.contactPhone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{communication.contactPhone}</span>
                            </div>
                          )}
                          {communication.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(communication.duration)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>By {communication.createdBy}</span>
                          <span>•</span>
                          <span>{formatDate(communication.completedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Communication Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="direction">Direction</Label>
              <Select value={formData.direction} onValueChange={(value) => setFormData(prev => ({ ...prev, direction: value as any }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief subject of the communication"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="Name of the person contacted"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>

            {formData.type === 'call' && (
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  placeholder="30"
                  className="mt-1"
                />
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Detailed description of the communication..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Textarea
                id="outcome"
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                placeholder="What was the result or outcome of this communication?"
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={formData.followUpRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="followUpRequired">Follow-up required</Label>
            </div>

            {formData.followUpRequired && (
              <div className="col-span-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
              Log Communication
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Communication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Communication</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editType">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editDirection">Direction</Label>
              <Select value={formData.direction} onValueChange={(value) => setFormData(prev => ({ ...prev, direction: value as any }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="editSubject">Subject</Label>
              <Input
                id="editSubject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="editContent">Content</Label>
              <Textarea
                id="editContent"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="editOutcome">Outcome</Label>
              <Textarea
                id="editOutcome"
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-green-600 hover:bg-green-700">
              Update Communication
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}