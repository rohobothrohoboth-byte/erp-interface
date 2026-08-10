// src/pages/crm/salesManagement/OpportunitiesPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Target,
    TrendingUp,
    DollarSign,
    Users,
    AlertCircle,
    Eye,
    Edit,
    Trash2,
    Plus,
    FileText,
} from 'lucide-react';
import { getOpportunities, deleteOpportunity, createQuote, sendQuote, getQuotes } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { SalesHeader } from '@/modules/crm/components/salesManagement/components/SalesHeader';
import { SalesPipeline,type PipelineStage } from '@/modules/crm/components/salesManagement/components/SalesPipeline';
import { SalesStats, type SalesStatItem } from '@/modules/crm/components/salesManagement/components/SalesStats';
import { SalesFilters } from '@/modules/crm/components/salesManagement/components/SalesFilters';
import { SalesTable, type TableColumn, type TableAction } from '@/modules/crm/components/salesManagement/components/SalesTable';
import DeleteOpportunityModal from '@/modules/crm/components/salesManagement/components/opportunities/DeleteOpportunityModal';
import AddOpportunityModal from '@/modules/crm/components/salesManagement/components/opportunities/AddOpportunityModal';
import EditOpportunityModal from '@/modules/crm/components/salesManagement/components/opportunities/EditOpportunityModal';
import OpportunityDetails from '@/modules/crm/components/salesManagement/components/opportunities/OpportunityDetails';
import type { OpportunityDto } from '@/modules/crm/types/crm.types';

const ITEMS_PER_PAGE = 10;

const OpportunitiesPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Check if we're on the add route
    useEffect(() => {
        if (location.pathname === '/crm/sales/opportunities/add') {
            setIsAddModalOpen(true);
        }
    }, [location.pathname]);

    // When modal closes, navigate back to opportunities list
    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/opportunities');
    };

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/opportunities');
        fetchOpportunities();
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedOpportunity(null);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setSelectedOpportunity(null);
        fetchOpportunities();
    };

    const handleViewModalClose = () => {
        setIsViewModalOpen(false);
        setSelectedOpportunity(null);
    };

    useEffect(() => {
        fetchOpportunities();
    }, [currentPage]);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
            };
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
            setSelectedOpportunity(null);
            fetchOpportunities();
        } catch (error) {
            showToast.error('Failed to delete opportunity');
        } finally {
            setIsDeleting(false);
        }
    };

    // ✅ UPDATED: Send Quote from Opportunity - Creates and sends a quote
    const handleSendQuote = async () => {
        if (!selectedOpportunity) return;

        try {
            setIsSending(true);

            // Check if a quote already exists for this opportunity
            const quotesResponse = await getQuotes({
                opportunityId: selectedOpportunity.id,
                page: 1,
                pageSize: 1
            });
            const existingQuotes = quotesResponse.data?.data || quotesResponse.data || [];

            let quoteId: string;
            let quoteNumber: string;

            if (existingQuotes.length > 0) {
                // If quote exists, send it
                const existingQuote = existingQuotes[0];
                await sendQuote(existingQuote.id);
                quoteId = existingQuote.id;
                quoteNumber = existingQuote.quoteNumber;
                showToast.success(`Quote ${quoteNumber} sent successfully`);
            } else {
                // Create a new quote from opportunity data
                const quoteData = {
                    customerId: selectedOpportunity.customerId,
                    opportunityId: selectedOpportunity.id,
                    leadId: selectedOpportunity.leadId,
                    subTotal: selectedOpportunity.amount || 0,
                    taxAmount: (selectedOpportunity.amount || 0) * 0.1,
                    discountAmount: 0,
                    shippingCost: 0,
                    totalAmount: (selectedOpportunity.amount || 0) * 1.1,
                    validUntil: selectedOpportunity.expectedCloseDate,
                    termsAndConditions: `Quote for opportunity: ${selectedOpportunity.name}`,
                    notes: selectedOpportunity.description || '',
                    quoteLines: [
                        {
                            description: `Opportunity: ${selectedOpportunity.name}`,
                            quantity: 1,
                            unitPrice: selectedOpportunity.amount || 0,
                            discount: 0,
                            taxRate: 10,
                            notes: selectedOpportunity.description || ''
                        }
                    ]
                };

                const createResponse = await createQuote(quoteData);
                const newQuote = createResponse.data?.data || createResponse.data;
                quoteId = newQuote.id;
                quoteNumber = newQuote.quoteNumber;

                // Send the newly created quote
                await sendQuote(quoteId);
                showToast.success(`Quote ${quoteNumber} created and sent successfully`);
            }

            // Close the view modal if open
            setIsViewModalOpen(false);

            // Navigate to the quote to view it
            navigate(`/crm/sales/quotes/${quoteId}`);

        } catch (error: any) {
            console.error('Error sending quote:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to send quote';
            showToast.error(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    // Create Quote (without sending) - navigates to quote creation
    const handleCreateQuote = () => {
        if (!selectedOpportunity) return;
        setIsViewModalOpen(false);
        navigate(`/crm/sales/quotes/add?opportunityId=${selectedOpportunity.id}`);
    };

    // Navigation handlers
    const handleAdd = () => {
        navigate('/crm/sales/opportunities/add');
    };

    const handleView = (item: OpportunityDto) => {
        setSelectedOpportunity(item);
        setIsViewModalOpen(true);
    };

    const handleEdit = (item: OpportunityDto) => {
        setSelectedOpportunity(item);
        setIsEditModalOpen(true);
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
        {
            name: 'Discovery',
            count: opportunities.filter(o => o.stage === 'Discovery').length,
            value: opportunities.filter(o => o.stage === 'Discovery').reduce((sum, o) => sum + (o.amount || 0), 0),
            probability: 20
        },
        {
            name: 'Qualification',
            count: opportunities.filter(o => o.stage === 'Qualification').length,
            value: opportunities.filter(o => o.stage === 'Qualification').reduce((sum, o) => sum + (o.amount || 0), 0),
            probability: 40
        },
        {
            name: 'Proposal',
            count: opportunities.filter(o => o.stage === 'Proposal').length,
            value: opportunities.filter(o => o.stage === 'Proposal').reduce((sum, o) => sum + (o.amount || 0), 0),
            probability: 60
        },
        {
            name: 'Negotiation',
            count: opportunities.filter(o => o.stage === 'Negotiation').length,
            value: opportunities.filter(o => o.stage === 'Negotiation').reduce((sum, o) => sum + (o.amount || 0), 0),
            probability: 80
        },
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

    // Actions
    const actions: TableAction<OpportunityDto>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (item) => handleView(item),
        },
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (item) => handleEdit(item),
        },
        {
            label: 'Send Quote',
            icon: <FileText className="h-4 w-4 mr-2" />,
            onClick: (item) => {
                setSelectedOpportunity(item);
                handleSendQuote();
            },
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
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 p-6"
            >
                <SalesHeader
                    title="Opportunities"
                    subtitle="Track and manage sales opportunities"
                    icon={<Target className="w-5 h-5 text-indigo-600" />}
                    onRefresh={fetchOpportunities}
                    onAdd={handleAdd}
                    addButtonText="Add Opportunity"
                />

                <SalesStats stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
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
                            onRowClick={(item) => handleView(item)}
                            emptyState={
                                <div className="text-center py-12">
                                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700">No opportunities found</h3>
                                    <p className="text-gray-500">Create your first sales opportunity.</p>
                                    <Button
                                        className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                                        onClick={handleAdd}
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
            </motion.div>

            {/* View Opportunity Modal */}
            <OpportunityDetails
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                onEdit={() => {
                    if (selectedOpportunity) {
                        setIsViewModalOpen(false);
                        handleEdit(selectedOpportunity);
                    }
                }}
                onDelete={() => {
                    if (selectedOpportunity) {
                        setIsViewModalOpen(false);
                        setSelectedOpportunity(selectedOpportunity);
                        setIsDeleteModalOpen(true);
                    }
                }}
                onCreateQuote={() => {
                    if (selectedOpportunity) {
                        handleCreateQuote();
                    }
                }}
                onSendQuote={() => {
                    if (selectedOpportunity) {
                        handleSendQuote();
                    }
                }}
                opportunity={selectedOpportunity}
                isSending={isSending}
            />

            {/* Add Opportunity Modal */}
            <AddOpportunityModal
                isOpen={isAddModalOpen}
                onClose={handleAddModalClose}
                onSuccess={handleAddSuccess}
            />

            {/* Edit Opportunity Modal */}
            <EditOpportunityModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSuccess={handleEditSuccess}
                opportunity={selectedOpportunity}
            />

            {/* Delete Opportunity Modal */}
            <DeleteOpportunityModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedOpportunity(null);
                }}
                onConfirm={handleDelete}
                itemName={selectedOpportunity?.name || ''}
                itemType="opportunity"
                isDeleting={isDeleting}
            />
        </>
    );
};

export default OpportunitiesPage;