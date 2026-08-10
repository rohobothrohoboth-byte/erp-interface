// src/components/crm/leadManagement/assignedLeads/AssignedLeadsSection.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { showToast } from '@/shared/layout/layout';
import { getLeads, assignLead, bulkAssignLeads } from '@/modules/crm/services/crm.api';
import type { LeadDto } from '@/modules/crm/types/crm.types';
import AssignedLeadsHeader from '@/modules/crm/components/leadManagement/assignedLeads/AssignedLeadsHeader';
import AssignedLeadsTable from '@/modules/crm/components/leadManagement/assignedLeads/AssignedLeadsTable';
import { useAuthStore } from '@/shared/stores/auth.store';

export default function AssignedLeadsSection() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const fetchAssignedLeads = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch leads assigned to current user or all assigned leads
      const response = await getLeads({
        assignedToUserId: user?.id,
        isActive: true
      });

      if (response.data.success) {
        setLeads(response.data.data || []);
      } else {
        showToast.error('Failed to fetch assigned leads');
      }
    } catch (error) {
      console.error('Error fetching assigned leads:', error);
      showToast.error('Failed to load assigned leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAssignedLeads();
  }, [fetchAssignedLeads]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssignedLeads();
    showToast.success('Leads refreshed');
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      // Update lead status
      const response = await getLeads({
        status: newStatus,
        isActive: true
      });

      if (response.data.success) {
        await fetchAssignedLeads();
        showToast.success(`Lead status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      showToast.error('Failed to update lead status');
    }
  };

  const handleBulkAssign = async (userId: string) => {
    if (selectedLeads.length === 0) {
      showToast.warning('No leads selected');
      return;
    }

    try {
      const response = await bulkAssignLeads(selectedLeads, userId);
      if (response.data.success) {
        showToast.success(`Successfully assigned ${selectedLeads.length} leads`);
        setSelectedLeads([]);
        await fetchAssignedLeads();
      }
    } catch (error) {
      console.error('Error bulk assigning leads:', error);
      showToast.error('Failed to assign leads');
    }
  };

  const handleViewDetail = (leadId: string) => {
    navigate(`/crm/leads/assigned/${leadId}`);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading assigned leads...</p>
          </div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <AssignedLeadsHeader />
          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => navigate('/crm/leads/generate')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </div>
        </div>

        <AssignedLeadsTable
            leads={leads}
            onStatusChange={handleStatusChange}
            onViewDetail={handleViewDetail}
            selectedLeads={selectedLeads}
            onSelectionChange={setSelectedLeads}
            onBulkAssign={handleBulkAssign}
            loading={loading}
        />
      </motion.div>
  );
}