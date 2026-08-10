import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, MoreHorizontal, Clock, User, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Pagination } from '@/shared/components/ui/pagination';
import TicketDetailModal from '@/modules/crm/components/customerService/tickets/TicketDetailModal';
import DeleteTicketModal from '@/modules/crm/components/customerService/tickets/DeleteTicketModal';
import ChangeTicketStatusModal from '@/modules/crm/components/customerService/tickets/ChangeTicketStatusModal';
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

interface TicketListProps {
  tickets: SupportTicket[];
  onStatusChange: (ticketId: string, newStatus: SupportTicket['status']) => void;
  onEdit: (ticket: SupportTicket) => void;
  onDelete: (ticketId: string) => void;
}

export default function TicketList({ tickets, onStatusChange, onEdit, onDelete }: TicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToChangeStatus, setTicketToChangeStatus] = useState<SupportTicket | null>(null);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // Pagination calculations
  const totalItems = tickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tickets.slice(startIndex, endIndex);
  }, [tickets, currentPage]);

  const handleViewDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (ticket: SupportTicket) => {
    setTicketToDelete(ticket);
    setIsDeleteModalOpen(true);
  };

  const handleChangeStatusClick = (ticket: SupportTicket) => {
    setTicketToChangeStatus(ticket);
    setIsChangeStatusModalOpen(true);
  };

  const handleStatusChangeConfirm = (ticketId: string, newStatus: SupportTicket['status'], note?: string) => {
    onStatusChange(ticketId, newStatus);
    setIsChangeStatusModalOpen(false);
    setTicketToChangeStatus(null);
  };

  const handleDeleteConfirm = (ticket: SupportTicket) => {
    onDelete(ticket.id);
    setIsDeleteModalOpen(false);
    setTicketToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTicketToDelete(null);
  };

  if (tickets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
        <p className="text-gray-500">All caught up! No support tickets match your current filters.</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Ticket ID / Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">#{ticket.id}</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {ticket.title}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {ticket.customerInfo.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {ticket.customerInfo.company}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{ticket.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewDetails(ticket)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(ticket)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Ticket
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatusClick(ticket)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(ticket)}>
                          <Clock className="w-4 h-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(ticket)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="tickets"
          />
        </div>
      </motion.div>

      {/* Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
      />

      {/* Delete Modal */}
      <DeleteTicketModal
        ticket={ticketToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {/* Change Status Modal */}
      <ChangeTicketStatusModal
        ticket={ticketToChangeStatus}
        isOpen={isChangeStatusModalOpen}
        onClose={() => {
          setIsChangeStatusModalOpen(false);
          setTicketToChangeStatus(null);
        }}
        onConfirm={handleStatusChangeConfirm}
      />
    </>
  );
}