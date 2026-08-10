// src/components/crm/salesManagement/opportunitiesSection/OpportunitiesSection.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Target, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { SalesHeader } from '@/modules/crm/components/salesManagement/components/SalesHeader';
import { SalesStats, SalesStatItem } from '@/modules/crm/components/salesManagement/components/SalesStats';
import { SalesFilters } from '@/modules/crm/components/salesManagement/components/SalesFilters';
import { SalesTable, TableColumn, TableAction } from '@/modules/crm/components/salesManagement/components/SalesTable';
import { SalesPipeline, PipelineStage } from '@/modules/crm/components/salesManagement/components/SalesPipeline';
import { SalesForecasting, ForecastData } from '@/modules/crm/components/salesManagement/components/SalesForecasting';
import DeleteOpportunityModal from '@/modules/crm/components/salesManagement/DeleteOpportunityModal';
import OpportunityDetailPage from '@/modules/crm/components/salesManagement/components/opportunities/OpportunityDetails';
import { getOpportunities, deleteOpportunity } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import type { OpportunityDto } from '@/modules/crm/types/crm.types';

const OpportunitiesSection: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityDto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.searchTerm = searchTerm;
      if (filterStage !== 'all') params.stage = filterStage;

      const response = await getOpportunities(params);
      const data = response.data?.data || response.data || [];
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      showToast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOpportunity) return;
    try {
      setIsDeleting(true);
      await deleteOpportunity(selectedOpportunity.id);
      showToast.success('Opportunity deleted successfully');
      setIsDeleteModalOpen(false);
      fetchOpportunities();
    } catch (error) {
      showToast.error('Failed to delete opportunity');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stats
  const stats: SalesStatItem[] = [
    {
      label: 'Total Opportunities',
      value: opportunities.length,
      icon: <Target className="h-5 w-5 text-blue-600" />,
      color: 'blue',
      gradient: 'from-blue-50 to-blue-100',
    },
    {
      label: 'Closed Won',
      value: opportunities.filter(o => o.stage === 'ClosedWon').length,
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      color: 'green',
      gradient: 'from-green-50 to-green-100',
    },
    {
      label: 'Active Pipeline',
      value: opportunities.filter(o => ['Discovery', 'Qualification', 'Proposal', 'Negotiation'].includes(o.stage)).length,
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      color: 'yellow',
      gradient: 'from-yellow-50 to-yellow-100',
    },
    {
      label: 'Total Value',
      value: formatCurrency(opportunities.reduce((sum, o) => sum + (o.amount || 0), 0)),
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      color: 'purple',
      gradient: 'from-purple-50 to-purple-100',
    },
  ];

  // Pipeline Data
  const pipelineStages: PipelineStage[] = [
    { name: 'Discovery', count: opportunities.filter(o => o.stage === 'Discovery').length, value: opportunities.filter(o => o.stage === 'Discovery').reduce((sum, o) => sum + (o.amount || 0), 0), probability: 20 },
    { name: 'Qualification', count: opportunities.filter(o => o.stage === 'Qualification').length, value: opportunities.filter(o => o.stage === 'Qualification').reduce((sum, o) => sum + (o.amount || 0), 0), probability: 40 },
    { name: 'Proposal', count: opportunities.filter(o => o.stage === 'Proposal').length, value: opportunities.filter(o => o.stage === 'Proposal').reduce((sum, o) => sum + (o.amount || 0), 0), probability: 60 },
    { name: 'Negotiation', count: opportunities.filter(o => o.stage === 'Negotiation').length, value: opportunities.filter(o => o.stage === 'Negotiation').reduce((sum, o) => sum + (o.amount || 0), 0), probability: 80 },
  ];

  // Table Columns
  const columns: TableColumn<OpportunityDto>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (item) => (
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            {item.customerName && (
                <p className="text-xs text-gray-500">{item.customerName}</p>
            )}
          </div>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      accessor: (item) => {
        const stageColors: Record<string, string> = {
          'Discovery': 'bg-blue-100 text-blue-700',
          'Qualification': 'bg-cyan-100 text-cyan-700',
          'Proposal': 'bg-purple-100 text-purple-700',
          'Negotiation': 'bg-orange-100 text-orange-700',
          'ClosedWon': 'bg-green-100 text-green-700',
          'ClosedLost': 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageColors[item.stage] || 'bg-gray-100 text-gray-700'}`}>
                        {item.stage}
                    </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (item) => (
          <span className="font-medium">{formatCurrency(item.amount || 0)}</span>
      ),
    },
    {
      key: 'winProbability',
      header: 'Probability',
      accessor: (item) => {
        const prob = item.winProbability || 0;
        const color = prob >= 70 ? 'text-green-600' : prob >= 40 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-medium ${color}`}>{prob}%</span>;
      },
    },
    {
      key: 'expectedCloseDate',
      header: 'Expected Close',
      accessor: (item) => {
        if (!item.expectedCloseDate) return 'N/A';
        return new Date(item.expectedCloseDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      },
    },
    {
      key: 'assignedToUserName',
      header: 'Assigned To',
      accessor: (item) => item.assignedToUserName || 'Unassigned',
    },
  ];

  const actions: TableAction<OpportunityDto>[] = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (item) => window.location.href = `/crm/sales/opportunities/${item.id}`,
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (item) => window.location.href = `/crm/sales/opportunities/edit/${item.id}`,
    },
    {
      separator: true,
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: (item) => {
        setSelectedOpportunity(item);
        setIsDeleteModalOpen(true);
      },
      className: 'text-red-600',
    },
  ];

  const stageOptions = [
    { value: 'Discovery', label: 'Discovery' },
    { value: 'Qualification', label: 'Qualification' },
    { value: 'Proposal', label: 'Proposal' },
    { value: 'Negotiation', label: 'Negotiation' },
    { value: 'ClosedWon', label: 'Closed Won' },
    { value: 'ClosedLost', label: 'Closed Lost' },
  ];

  const filters = [
    {
      key: 'stage',
      label: 'Stage',
      options: stageOptions,
      value: filterStage,
      onChange: setFilterStage,
    },
  ];

  return (
      <div className="space-y-6 p-6">
        <SalesHeader
            title="Opportunities"
            subtitle="Track and manage sales opportunities"
            icon={<Target className="w-5 h-5 text-indigo-600" />}
            onRefresh={fetchOpportunities}
            onAdd={() => window.location.href = '/crm/sales/opportunities/add'}
            addButtonText="Add Opportunity"
        />

        <SalesStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesFilters
                searchPlaceholder="Search opportunities..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onClearFilters={() => {
                  setSearchTerm('');
                  setFilterStage('all');
                  fetchOpportunities();
                }}
            />

            <SalesTable
                data={opportunities}
                columns={columns}
                actions={actions}
                isLoading={loading}
                emptyState={
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No opportunities found</h3>
                    <p className="text-gray-500">Create your first sales opportunity.</p>
                    <Button
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => window.location.href = '/crm/sales/opportunities/add'}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Opportunity
                    </Button>
                  </div>
                }
            />
          </div>

          <div className="space-y-6">
            <SalesPipeline stages={pipelineStages} />
          </div>
        </div>

        <DeleteOpportunityModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            itemName={selectedOpportunity?.name || ''}
            itemType="opportunity"
            isDeleting={isDeleting}
        />

        <Routes>
          <Route path="/" element={null} />
          <Route path=":id" element={<OpportunityDetailPage />} />
        </Routes>
      </div>
  );
};

export default OpportunitiesSection;