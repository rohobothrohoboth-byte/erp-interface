import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, MoreHorizontal, Phone, Mail, User, Building, Trash2, UserPlus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../ui/dropdown-menu';
import { Pagination } from '../../../ui/pagination';
import { showToast } from '../../../../layout/layout';
import DeleteLeadModal from './DeleteLeadModal';
import ReassignLeadModal from './ReassignLeadModal';
import type { Lead } from '../../../../types/crm';

interface LeadGenerationTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onAssignRep: (leadId: string, repName: string) => void;
}

export default function LeadGenerationTable({
  leads,
  onEdit,
  onDelete,
  onAssignRep
}: LeadGenerationTableProps) {
  const navigate = useNavigate();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState<Lead | null>(null);
  const [selectedRep, setSelectedRep] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLeadForDelete, setSelectedLeadForDelete] = useState<Lead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // Pagination calculations
  const totalItems = leads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return leads.slice(startIndex, endIndex);
  }, [leads, currentPage]);
  
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'New': 'bg-orange-100 text-orange-800',
      'Contacted': 'bg-orange-100 text-orange-800',
      'Qualified': 'bg-orange-100 text-orange-800',
      'Proposal Sent': 'bg-orange-100 text-orange-800',
      'Closed Won': 'bg-orange-100 text-orange-800',
      'Closed Lost': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSourceColor = (source: string) => {
    return 'bg-orange-100 text-orange-800';
  };

  const handleAssignRep = (lead: Lead) => {
    setSelectedLeadForAssign(lead);
    setSelectedRep(lead.assignedTo || '');
    setIsAssignDialogOpen(true);
  };

  const handleAssignSubmit = () => {
    if (selectedLeadForAssign && selectedRep) {
      onAssignRep(selectedLeadForAssign.id, selectedRep);
      setIsAssignDialogOpen(false);
      setSelectedLeadForAssign(null);
      setSelectedRep('');
      showToast.success(`Lead assigned to ${selectedRep}`);
    }
  };

  const handleDeleteWithConfirmation = (lead: Lead) => {
    setSelectedLeadForDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (lead: Lead) => {
    onDelete(lead.id);
    setIsDeleteModalOpen(false);
    setSelectedLeadForDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedLeadForDelete(null);
  };

  if (leads.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-500">Get started by adding your first lead or adjust your filters.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedLeads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                    <div className="text-sm text-gray-500">{lead.jobTitle}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{lead.company}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{lead.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getSourceColor(lead.source)}>
                  {lead.source}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{lead.score}</span>
                </div>
              </TableCell>
              <TableCell>{lead.assignedTo || '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/crm/leads/${lead.id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAssignRep(lead)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Reassign Lead
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteWithConfirmation(lead)}
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
        itemLabel="leads"
      />

      {/* Reassign Lead Modal */}
      <ReassignLeadModal
        lead={selectedLeadForAssign}
        isOpen={isAssignDialogOpen}
        selectedRep={selectedRep}
        onRepChange={setSelectedRep}
        onConfirm={handleAssignSubmit}
        onClose={() => {
          setIsAssignDialogOpen(false);
          setSelectedLeadForAssign(null);
          setSelectedRep('');
        }}
      />

      {/* Delete Lead Modal */}
      <DeleteLeadModal
        lead={selectedLeadForDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </motion.div>
  );
}
