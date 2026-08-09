// src/components/crm/leadManagement/leadGeneration/LeadGenerationSection.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../../../layout/layout';
import { getLeads, deleteLead, assignLead } from '../../../../services/crm/crm.api';
import type { LeadDto } from '../../../../types/crm/crm.types';
import LeadGenerationHeader from './LeadGenerationHeader';
import LeadGenerationSearchFilter from './LeadGenerationSearchFilter';
import LeadGenerationTable from './LeadGenerationTable';
import DeleteLeadModal from './DeleteLeadModal';
import ReassignLeadModal from './ReassignLeadModal';

interface FilterState {
  searchTerm: string;
  status: string;
  source: string;
  assignedTo: string;
  scoreRange: string;
  dateRange: string;
}

export default function LeadGenerationSection() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    scoreRange: 'all',
    dateRange: 'all'
  });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLeads({ isActive: true });
      if (response.data.success) {
        setLeads(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
        (lead.fullName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || false) ||
        (lead.email?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || false) ||
        (lead.companyName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || false);

    const matchesStatus = filters.status === 'all' || lead.status === filters.status;
    const matchesSource = filters.source === 'all' || lead.source === filters.source;
    const matchesAssignedTo = filters.assignedTo === 'all' ||
        (filters.assignedTo === 'unassigned' ? !lead.assignedToUserId : lead.assignedToUserId === filters.assignedTo);

    const matchesScore = filters.scoreRange === 'all' ||
        (filters.scoreRange === 'hot' && (lead.score || 0) >= 80) ||
        (filters.scoreRange === 'warm' && (lead.score || 0) >= 60 && (lead.score || 0) < 80) ||
        (filters.scoreRange === 'cold' && (lead.score || 0) < 60);

    return matchesSearch && matchesStatus && matchesSource && matchesAssignedTo && matchesScore;
  });

  const handleDelete = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      showToast.success('Lead deleted successfully');
      await fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast.error('Failed to delete lead');
    }
  };

  const handleReassign = async (leadId: string, userId: string) => {
    try {
      await assignLead(leadId, userId);
      showToast.success('Lead reassigned successfully');
      await fetchLeads();
    } catch (error) {
      console.error('Error reassigning lead:', error);
      showToast.error('Failed to reassign lead');
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      source: 'all',
      assignedTo: 'all',
      scoreRange: 'all',
      dateRange: 'all'
    });
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
      >
        <LeadGenerationHeader totalCount={leads.length} filteredCount={filteredLeads.length} />

        <LeadGenerationSearchFilter
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
        />

        <LeadGenerationTable
            leads={filteredLeads}
            loading={loading}
            onEdit={(lead) => navigate(`/crm/leads/${lead.id}/edit`)}
            onDelete={(lead) => {
              setSelectedLead(lead);
              setIsDeleteModalOpen(true);
            }}
            onReassign={(lead) => {
              setSelectedLead(lead);
              setIsReassignModalOpen(true);
            }}
            onRefresh={fetchLeads}
        />

        <DeleteLeadModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedLead(null);
            }}
            onConfirm={() => {
              if (selectedLead) {
                handleDelete(selectedLead.id);
                setIsDeleteModalOpen(false);
                setSelectedLead(null);
              }
            }}
            leadName={selectedLead?.fullName || ''}
        />

        <ReassignLeadModal
            isOpen={isReassignModalOpen}
            onClose={() => {
              setIsReassignModalOpen(false);
              setSelectedLead(null);
            }}
            onConfirm={(userId) => {
              if (selectedLead) {
                handleReassign(selectedLead.id, userId);
                setIsReassignModalOpen(false);
                setSelectedLead(null);
              }
            }}
            lead={selectedLead}
        />
      </motion.div>
  );
}