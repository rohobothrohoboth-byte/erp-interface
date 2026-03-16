import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../layout/layout';
import { mockLeads } from '../../../../data/crmMockData';
import LeadGenerationHeader from './LeadGenerationHeader';
import LeadGenerationSearchFilter from './LeadGenerationSearchFilter';
import LeadGenerationTable from './LeadGenerationTable';
import type { Lead } from '../../../../types/crm';

interface FilterState {
  searchTerm: string;
  status: string;
  source: string;
  assignedTo: string;
  scoreRange: string;
  dateRange: string;
}

export default function LeadGenerationSection() {
  const loadLeads = () => {
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      try {
        return JSON.parse(storedLeads);
      } catch (error) {
        console.error('Error parsing stored leads:', error);
        return mockLeads;
      }
    }
    // Persist mock leads to localStorage so edit page can find them
    localStorage.setItem('leads', JSON.stringify(mockLeads));
    return mockLeads;
  };

  const [leads, setLeads] = useState<Lead[]>(loadLeads());
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    scoreRange: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    const reloadLeads = () => {
      const storedLeads = localStorage.getItem('leads');
      if (storedLeads) {
        try {
          const parsedLeads = JSON.parse(storedLeads);
          setLeads(parsedLeads);
        } catch (error) {
          console.error('Error parsing stored leads:', error);
        }
      }
    };

    reloadLeads();
    window.addEventListener('storage', reloadLeads);
    window.addEventListener('focus', reloadLeads);

    return () => {
      window.removeEventListener('storage', reloadLeads);
      window.removeEventListener('focus', reloadLeads);
    };
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || lead.status === filters.status;
    const matchesSource = filters.source === 'all' || lead.source === filters.source;
    const matchesAssignedTo = filters.assignedTo === 'all' || 
      (filters.assignedTo === 'unassigned' ? !lead.assignedTo : lead.assignedTo === filters.assignedTo);
    
    const matchesScore = filters.scoreRange === 'all' || 
      (filters.scoreRange === 'hot' && lead.score >= 80) ||
      (filters.scoreRange === 'warm' && lead.score >= 60 && lead.score < 80) ||
      (filters.scoreRange === 'cold' && lead.score < 60);
    
    const matchesDate = filters.dateRange === 'all' || (() => {
      const leadDate = new Date(lead.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          return leadDate >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return leadDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          return leadDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
          return leadDate >= quarterAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesSource && matchesAssignedTo && matchesScore && matchesDate;
  });

  const handleEditLead = (lead: Lead) => {
    console.log('Edit lead:', lead);
  };

  const handleDeleteLead = (leadId: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    showToast.success('Lead deleted successfully');
  };

  const handleAssignRep = (leadId: string, repName: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, assignedTo: repName, updatedAt: new Date().toISOString() }
        : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
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
      <LeadGenerationHeader
        totalCount={leads.length}
        filteredCount={filteredLeads.length}
        selectedCount={0}
      />

      <LeadGenerationSearchFilter
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <LeadGenerationTable
        leads={filteredLeads}
        onEdit={handleEditLead}
        onDelete={handleDeleteLead}
        onAssignRep={handleAssignRep}
      />
    </motion.div>
  );
}
