import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, AlertCircle, CheckCircle, User, Tag, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { mockSupportTickets } from '@/modules/crm/data/crmMockData';
import type { SupportTicket } from '@/modules/crm/types/crm';

const statusColors = {
  'Open': 'bg-red-100 text-red-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Pending': 'bg-orange-100 text-orange-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Closed': 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  'Low': 'bg-blue-100 text-blue-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};

const categoryColors = {
  'Technical': 'bg-purple-100 text-purple-800',
  'Billing': 'bg-green-100 text-green-800',
  'General': 'bg-blue-100 text-blue-800',
  'Feature Request': 'bg-indigo-100 text-indigo-800'
};

export default function CustomerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newTicket, setNewTicket] = useState<Partial<SupportTicket>>({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    category: 'General',
    customerId: '',
    assignedTo: '',
    tags: [],
    attachments: []
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Calculate metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => ['Open', 'In Progress', 'Pending'].includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const criticalTickets = tickets.filter(t => t.priority === 'Critical').length;

  const handleAddTicket = () => {
    const ticket: SupportTicket = {
      ...newTicket,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    } as SupportTicket;
    
    setTickets([...tickets, ticket]);
    setNewTicket({
      title: '',
      description: '',
      status: 'Open',
      priority: 'Medium',
      category: 'General',
      customerId: '',
      assignedTo: '',
      tags: [],
      attachments: []
    });
    setIsAddDialogOpen(false);
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket['status']) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        const updatedTicket = { 
          ...ticket, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        };
        
        if (newStatus === 'Resolved' && !ticket.resolvedAt) {
          updatedTicket.resolvedAt = new Date().toISOString();
        }
        
        return updatedTicket;
      }
      return ticket;
    });
    setTickets(updatedTickets);
  };

  const handlePriorityChange = (ticketId: string, newPriority: SupportTicket['priority']) => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, priority: newPriority, updatedAt: new Date().toISOString() }
        : ticket
    );
    setTickets(updatedTickets);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const isOverdue = (slaDeadline: string) => {
    return new Date(slaDeadline) < new Date();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-gray-600">Manage customer support tickets and requests</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  value={newTicket.customerId}
                  onChange={(e) => setNewTicket({...newTicket, customerId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={newTicket.assignedTo}
                  onChange={(e) => setNewTicket({...newTicket, assignedTo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value as SupportTicket['priority']})}>
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
                <Label htmlFor="category">Category</Label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value as SupportTicket['category']})}>
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
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTicket} className="bg-orange-600 hover:bg-orange-700">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-red-600">{openTickets}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedTickets}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalTickets}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Billing">Billing</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Feature Request">Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{ticket.customerId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => handleStatusChange(ticket.id, value as SupportTicket['status'])}
                    >
                      <SelectTrigger className="w-32">
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.priority}
                      onValueChange={(value) => handlePriorityChange(ticket.id, value as SupportTicket['priority'])}
                    >
                      <SelectTrigger className="w-24">
                        <Badge className={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryColors[ticket.category]}>
                      {ticket.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{getTimeAgo(ticket.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm ${isOverdue(ticket.slaDeadline) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {isOverdue(ticket.slaDeadline) ? 'Overdue' : 'On Time'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ticket ID</Label>
                  <p className="font-mono">{selectedTicket.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Customer ID</Label>
                  <p>{selectedTicket.customerId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <Badge className={priorityColors[selectedTicket.priority]}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Category</Label>
                  <Badge className={categoryColors[selectedTicket.category]}>
                    {selectedTicket.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                  <p>{selectedTicket.assignedTo}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Title</Label>
                <p className="text-lg font-semibold">{selectedTicket.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTicket.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p>{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p>{new Date(selectedTicket.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">SLA Deadline</Label>
                  <p className={isOverdue(selectedTicket.slaDeadline) ? 'text-red-600 font-medium' : ''}>
                    {new Date(selectedTicket.slaDeadline).toLocaleString()}
                  </p>
                </div>
                {selectedTicket.resolvedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Resolved</Label>
                    <p>{new Date(selectedTicket.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}