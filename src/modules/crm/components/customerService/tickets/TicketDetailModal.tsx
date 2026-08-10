import { motion } from 'framer-motion';
import { X, User, Building, Mail, Phone, Calendar, Clock, Tag, Paperclip, MessageSquare, FileText, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { SupportTicket } from '@/modules/crm/types/crm';

const statusColors = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Pending': 'bg-purple-100 text-purple-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Closed': 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};

const channelColors = {
  'email': 'bg-blue-100 text-blue-800',
  'chat': 'bg-green-100 text-green-800',
  'phone': 'bg-purple-100 text-purple-800',
  'web': 'bg-orange-100 text-orange-800',
  'social': 'bg-pink-100 text-pink-800'
};

interface TicketDetailModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({ ticket, isOpen, onClose }: TicketDetailModalProps) {
  if (!ticket) return null;

  const getSLAStatus = (ticket: SupportTicket) => {
    const now = new Date();
    const deadline = new Date(ticket.slaDeadline);
    const timeLeft = deadline.getTime() - now.getTime();
    const twoHours = 2 * 60 * 60 * 1000;

    if (['Resolved', 'Closed'].includes(ticket.status)) {
      return { status: 'completed', color: 'text-green-600', icon: CheckCircle };
    } else if (timeLeft < 0) {
      return { status: 'overdue', color: 'text-red-600', icon: AlertTriangle };
    } else if (timeLeft < twoHours) {
      return { status: 'at-risk', color: 'text-orange-600', icon: Clock };
    } else {
      return { status: 'on-track', color: 'text-green-600', icon: CheckCircle };
    }
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeLeft = deadlineDate.getTime() - now.getTime();
    
    if (timeLeft < 0) {
      const overdue = Math.abs(timeLeft);
      const hours = Math.floor(overdue / (1000 * 60 * 60));
      const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m overdue`;
    } else {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m left`;
    }
  };

  const slaStatus = getSLAStatus(ticket);
  const SLAIcon = slaStatus.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">#{ticket.id}</h2>
                <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                <Badge className={channelColors[ticket.channel]}>{ticket.channel}</Badge>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{ticket.title}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Content - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Column 1: Ticket Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Ticket Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Category</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{ticket.category}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500">Assigned To</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{ticket.assignedTo}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Created</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Last Updated</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{new Date(ticket.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {ticket.resolvedAt && (
                    <div>
                      <label className="text-xs text-gray-500">Resolved</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{new Date(ticket.resolvedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Attachments</label>
                  <div className="space-y-2">
                    {ticket.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                        <Paperclip className="w-4 h-4" />
                        <span>{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Customer & Description */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{ticket.customerInfo.name}</div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          ticket.customerInfo.tier === 'Enterprise' ? 'border-purple-300 text-purple-700' :
                          ticket.customerInfo.tier === 'Premium' ? 'border-blue-300 text-blue-700' :
                          'border-gray-300 text-gray-700'
                        }`}
                      >
                        {ticket.customerInfo.tier}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{ticket.customerInfo.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{ticket.customerInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{ticket.customerInfo.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </div>

              {/* CSAT */}
              {ticket.customerSatisfaction && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer Satisfaction</h4>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold">{ticket.customerSatisfaction.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: SLA, Notes & History */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">SLA Status</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className={`flex items-center space-x-2 ${slaStatus.color}`}>
                    <SLAIcon className="w-5 h-5" />
                    <span className="text-sm font-semibold capitalize">
                      {slaStatus.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Deadline: {new Date(ticket.slaDeadline).toLocaleString()}</div>
                    <div className="font-medium mt-1">{formatTimeLeft(ticket.slaDeadline)}</div>
                  </div>
                  {ticket.slaPolicy && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <div>Policy: {ticket.slaPolicy.name}</div>
                      <div>Response Time: {ticket.slaPolicy.responseTime} min</div>
                      <div>Resolution Time: {ticket.slaPolicy.resolutionTime} min</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              {ticket.internalNotes && ticket.internalNotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Internal Notes</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ticket.internalNotes.map((note) => (
                      <div key={note.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{note.createdBy}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Replies */}
              {ticket.publicReplies && ticket.publicReplies.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Communication History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ticket.publicReplies.map((reply) => (
                      <div 
                        key={reply.id} 
                        className={`rounded-lg p-3 ${
                          reply.isFromCustomer 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{reply.createdBy}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Tickets */}
              {ticket.relatedTickets && ticket.relatedTickets.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Related Tickets</h4>
                  <div className="space-y-1">
                    {ticket.relatedTickets.map((relatedId) => (
                      <div key={relatedId} className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                        #{relatedId}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
