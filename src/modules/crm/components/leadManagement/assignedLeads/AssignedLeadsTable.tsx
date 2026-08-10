// src/components/crm/leadManagement/assignedLeads/AssignedLeadsTable.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, MoreHorizontal, Phone, Mail, User, Building,
  RefreshCw, Star, Calendar, Tag, Filter
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/shared/components/ui/dropdown-menu';
import { Pagination } from '@/shared/components/ui/pagination';
import { Input } from '@/shared/components/ui/input';
import { showToast } from '@/shared/layout/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import ChangeLeadStatusModal from '@/modules/crm/components/leadManagement/assignedLeads/ChangeLeadStatusModal';
import type { LeadDto } from '@/modules/crm/types/crm.types';

interface AssignedLeadsTableProps {
  leads: LeadDto[];
  onStatusChange: (leadId: string, newStatus: string) => void;
  onViewDetail: (leadId: string) => void;
  selectedLeads: string[];
  onSelectionChange: (selected: string[]) => void;
  onBulkAssign: (userId: string) => void;
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Qualified': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Proposal': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Negotiation': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Converted': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Lost': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Archived': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
};

const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
  'Medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function AssignedLeadsTable({
                                             leads,
                                             onStatusChange,
                                             onViewDetail,
                                             selectedLeads,
                                             onSelectionChange,
                                             onBulkAssign,
                                             loading = false
                                           }: AssignedLeadsTableProps) {
  const navigate = useNavigate();
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [changingStatusLead, setChangingStatusLead] = useState<LeadDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const itemsPerPage = 10;

  // Filter leads
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
          (lead.fullName?.toLowerCase().includes(term) || false) ||
          (lead.companyName?.toLowerCase().includes(term) || false) ||
          (lead.email?.toLowerCase().includes(term) || false) ||
          (lead.phone?.includes(term) || false)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    return filtered;
  }, [leads, searchTerm, statusFilter, priorityFilter]);

  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, currentPage]);

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleChangeStatus = (lead: LeadDto) => {
    setChangingStatusLead(lead);
    setIsChangeStatusModalOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (changingStatusLead) {
      onStatusChange(changingStatusLead.id, newStatus);
      setIsChangeStatusModalOpen(false);
      setChangingStatusLead(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(paginatedLeads.map(lead => lead.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedLeads, leadId]);
    } else {
      onSelectionChange(selectedLeads.filter(id => id !== leadId));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </div>
    );
  }

  if (leads.length === 0) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assigned leads</h3>
          <p className="text-gray-500 dark:text-gray-400">Leads will appear here once they are assigned to you.</p>
        </motion.div>
    );
  }

  return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.keys(STATUS_COLORS).map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {Object.keys(PRIORITY_COLORS).map((priority) => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLeads.length > 0 && (
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAssign('')}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Bulk Assign ({selectedLeads.length})
              </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="w-10">
                  <input
                      type="checkbox"
                      checked={paginatedLeads.length > 0 && selectedLeads.length === paginatedLeads.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.map((lead) => (
                  <TableRow
                      key={lead.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => onViewDetail(lead.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                          className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {lead.fullName || `${lead.firstName} ${lead.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{lead.title || 'No title'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                        )}
                        {lead.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{lead.companyName || 'N/A'}</span>
                      </div>
                      {lead.budget && (
                          <div className="text-xs text-gray-500 mt-1">
                            Budget: ${lead.budget.toLocaleString()}
                          </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        {lead.source || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status || 'New'}
                      </Badge>
                      {lead.isConverted && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ml-1">
                            Converted
                          </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                    <span className={`font-bold text-lg ${
                        (lead.score || 0) >= 70 ? 'text-green-600' :
                            (lead.score || 0) >= 40 ? 'text-yellow-600' :
                                'text-red-600'
                    }`}>
                      {lead.score || 0}
                    </span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                              className={`h-1.5 rounded-full ${
                                  (lead.score || 0) >= 70 ? 'bg-green-600' :
                                      (lead.score || 0) >= 40 ? 'bg-yellow-600' :
                                          'bg-red-600'
                              }`}
                              style={{ width: `${Math.min(lead.score || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetail(lead.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeStatus(lead)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Change Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(lead.email || '');
                            showToast.success('Email copied to clipboard');
                          }}>
                            <Mail className="h-4 w-4 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="leads"
        />

        <ChangeLeadStatusModal
            isOpen={isChangeStatusModalOpen}
            onClose={() => {
              setIsChangeStatusModalOpen(false);
              setChangingStatusLead(null);
            }}
            onSubmit={handleStatusChange}
            lead={changingStatusLead}
        />
      </div>
  );
}