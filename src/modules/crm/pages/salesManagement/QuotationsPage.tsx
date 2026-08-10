// src/pages/crm/salesManagement/QuotationsPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Eye,
    Edit,
    Trash2,
    Plus,
    Send,
    Download,
    Printer,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
} from 'lucide-react';
import { getQuotes, deleteQuote, sendQuote, downloadQuotePDF, getQuoteById } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { SalesHeader } from '@/modules/crm/components/salesManagement/components/SalesHeader';
import { SalesStats, type SalesStatItem } from '@/modules/crm/components/salesManagement/components/SalesStats';
import { SalesFilters } from '@/modules/crm/components/salesManagement/components/SalesFilters';
import { SalesTable, type TableColumn, type TableAction } from '@/modules/crm/components/salesManagement/components/SalesTable';
import DeleteQuotationModal from '@/modules/crm/components/salesManagement/DeleteQuotationModal';
import AddQuotationModal from '@/modules/crm/components/salesManagement/components/quotations/AddQuotationModal';
import EditQuotationModal from '@/modules/crm/components/salesManagement/components/quotations/EditQuotationModal';
import ViewQuotationModal from '@/modules/crm/components/salesManagement/components/quotations/ViewQuotationModal';
import type { QuoteDto } from '@/modules/crm/types/crm.types';

const ITEMS_PER_PAGE = 10;

const QuotationsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [quotes, setQuotes] = useState<QuoteDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedQuote, setSelectedQuote] = useState<QuoteDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isViewLoading, setIsViewLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Check if we're on the add route
    useEffect(() => {
        if (location.pathname === '/crm/sales/quotes/add') {
            setIsAddModalOpen(true);
        }
    }, [location.pathname]);

    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/quotes');
    };

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/quotes');
        fetchQuotes();
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedQuote(null);
        navigate('/crm/sales/quotes');
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setSelectedQuote(null);
        navigate('/crm/sales/quotes');
        fetchQuotes();
    };

    const handleViewModalClose = () => {
        setIsViewModalOpen(false);
        setSelectedQuote(null);
        setIsViewLoading(false);
    };

    useEffect(() => {
        fetchQuotes();
    }, [currentPage, searchTerm, filterStatus]);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
            };
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            const response = await getQuotes(params);
            console.log('API Response - Quotes:', response);

            const data = response.data?.data || response.data || [];
            setQuotes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching quotes:', error);
            showToast.error('Failed to load quotes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedQuote) {
            console.warn('No quote selected for deletion');
            return;
        }

        console.log('Attempting to delete quote:', {
            id: selectedQuote.id,
            number: selectedQuote.quoteNumber,
            status: selectedQuote.status
        });

        try {
            setIsDeleting(true);
            await deleteQuote(selectedQuote.id);
            showToast.success(`Quote ${selectedQuote.quoteNumber} deleted successfully`);
            setIsDeleteModalOpen(false);
            setSelectedQuote(null);
            await fetchQuotes();
        } catch (error: any) {
            console.error('Error deleting quote:', {
                error,
                status: error?.response?.status,
                data: error?.response?.data
            });

            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to delete quote';
            showToast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSend = async (item: QuoteDto) => {
        try {
            setIsSending(true);
            await sendQuote(item.id);
            showToast.success(`Quote ${item.quoteNumber} sent successfully`);
            fetchQuotes();
        } catch (error: any) {
            console.error('Error sending quote:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to send quote';
            showToast.error(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    const handleDownloadPDF = async (item: QuoteDto) => {
        try {
            setIsDownloading(true);
            const response = await downloadQuotePDF(item.id);

            // Create a blob from the response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${item.quoteNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast.success('PDF downloaded successfully');
        } catch (error: any) {
            console.error('Error downloading PDF:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to download PDF';
            showToast.error(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = (item: QuoteDto) => {
        // Store the quote data in sessionStorage for the print view
        sessionStorage.setItem('printQuote', JSON.stringify(item));
        window.open(`/crm/sales/quotes/${item.id}/print`, '_blank');
    };

    const handleAdd = () => {
        navigate('/crm/sales/quotes/add');
    };

    const handleView = async (item: QuoteDto) => {
        try {
            setIsViewLoading(true);
            // First, set the selected quote with what we have
            setSelectedQuote(item);
            setIsViewModalOpen(true);

            // Then fetch the full quote details with line items
            const response = await getQuoteById(item.id);
            console.log('Full API response:', response);

            // The data is nested inside response.data
            const fullQuote = response.data || response;
            console.log('Full quote data:', fullQuote);
            console.log('Full quote lines:', fullQuote.quoteLines);

            // Update the selected quote with the full data
            const updatedQuote = {
                ...item,
                quoteLines: fullQuote.quoteLines || [],
                customerName: fullQuote.customerName || item.customerName,
                customerEmail: fullQuote.customerEmail || item.customerEmail,
                customerPhone: fullQuote.customerPhone || item.customerPhone,
                validUntil: fullQuote.validUntil || item.validUntil,
                notes: fullQuote.notes || item.notes,
                termsAndConditions: fullQuote.termsAndConditions || item.termsAndConditions,
            };

            console.log('Updated quote with lines:', updatedQuote);
            setSelectedQuote(updatedQuote);
            setIsViewLoading(false);
        } catch (error) {
            console.error('Error fetching full quote details:', error);
            showToast.error('Failed to load quote details');
            setIsViewLoading(false);
            // Still show the modal with the basic data
            setIsViewModalOpen(true);
        }
    };

    // In QuotationsPage.tsx - Update handleEdit

    const handleEdit = (item: QuoteDto) => {
        // Check if quote can be edited (only Draft)
        if (!canEditQuote(item)) {
            showToast.warning(`Cannot edit quote with status "${getStatusLabel(item.status)}". Only Draft quotes can be edited.`);
            return;
        }
        setSelectedQuote(item);
        setIsEditModalOpen(true);
    };

    const canEditQuote = (item: QuoteDto): boolean => {
        // Convert status to number if it's a string
        const status = typeof item.status === 'string' ? parseInt(item.status) : item.status;
        // Only Draft quotes (status = 1) can be edited
        return status === 1;
    };

    const canSendQuote = (item: QuoteDto): boolean => {
        const status = typeof item.status === 'string' ? parseInt(item.status) : item.status;
        // Can only send Draft or Sent quotes
        return status === 1 || status === 2;
    };

    const getStatusLabel = (status: number | string): string => {
        // Convert to number if string
        const statusNum = typeof status === 'string' ? parseInt(status) : status;
        const labels: Record<number, string> = {
            1: 'Draft',
            2: 'Sent',
            3: 'Viewed',
            4: 'Accepted',
            5: 'Rejected',
            6: 'Expired',
        };
        return labels[statusNum] || 'Unknown';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };



    const getStatusColor = (status: number): string => {
        const colors: Record<number, string> = {
            1: 'bg-gray-100 text-gray-700',
            2: 'bg-blue-100 text-blue-700',
            3: 'bg-cyan-100 text-cyan-700',
            4: 'bg-green-100 text-green-700',
            5: 'bg-red-100 text-red-700',
            6: 'bg-orange-100 text-orange-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    // Stats
    const stats: SalesStatItem[] = [
        {
            label: 'Total Quotes',
            value: quotes.length,
            icon: <FileText className="h-5 w-5 text-blue-600" />,
            color: 'blue',
            gradient: 'from-blue-50 to-blue-100',
        },
        {
            label: 'Accepted',
            value: quotes.filter(q => q.status === 4).length,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            color: 'green',
            gradient: 'from-green-50 to-green-100',
        },
        {
            label: 'Pending',
            value: quotes.filter(q => [1, 2, 3].includes(q.status)).length,
            icon: <Clock className="h-5 w-5 text-yellow-600" />,
            color: 'yellow',
            gradient: 'from-yellow-50 to-yellow-100',
        },
        {
            label: 'Total Value',
            value: formatCurrency(quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0)),
            icon: <DollarSign className="h-5 w-5 text-purple-600" />,
            color: 'purple',
            gradient: 'from-purple-50 to-purple-100',
        },
    ];

    // Table Columns
    const columns: TableColumn<QuoteDto>[] = [
        {
            key: 'quoteNumber',
            header: 'Quote #',
            accessor: (item) => (
                <p className="font-medium text-gray-900">{item.quoteNumber}</p>
            ),
        },
        {
            key: 'customerName',
            header: 'Customer',
            accessor: (item) => item.customerName || 'N/A',
        },
        {
            key: 'totalAmount',
            header: 'Total',
            accessor: (item) => (
                <span className="font-medium">{formatCurrency(item.totalAmount || 0)}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            accessor: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                </span>
            ),
        },
        {
            key: 'validUntil',
            header: 'Valid Until',
            accessor: (item) => {
                if (!item.validUntil) return 'N/A';
                try {
                    const date = new Date(item.validUntil);
                    if (isNaN(date.getTime())) return 'N/A';
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
                } catch {
                    return 'N/A';
                }
            },
        },
    ];

    const actions: TableAction<QuoteDto>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (item) => handleView(item),
        },
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (item) => handleEdit(item),
            disabled: (item) => item.status !== 1, // Only Draft can be edited
            className: (item) => item.status !== 1 ? 'opacity-50 cursor-not-allowed' : '',
        },
        {
            label: 'Send',
            icon: <Send className="h-4 w-4 mr-2" />,
            onClick: (item) => handleSend(item),
            disabled: (item) => !(item.status === 1 || item.status === 2), // Draft or Sent
            className: (item) => !(item.status === 1 || item.status === 2) ? 'opacity-50 cursor-not-allowed' : '',
        },
        {
            label: 'Download PDF',
            icon: <Download className="h-4 w-4 mr-2" />,
            onClick: (item) => handleDownloadPDF(item),
        },
        {
            label: 'Print',
            icon: <Printer className="h-4 w-4 mr-2" />,
            onClick: (item) => handlePrint(item),
        },
        {
            separator: true,
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (item) => {
                setSelectedQuote(item);
                setIsDeleteModalOpen(true);
            },
            className: 'text-red-600',
            disabled: (item) => item.status !== 1, // Only Draft can be deleted
        },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: '1', label: 'Draft' },
        { value: '2', label: 'Sent' },
        { value: '3', label: 'Viewed' },
        { value: '4', label: 'Accepted' },
        { value: '5', label: 'Rejected' },
        { value: '6', label: 'Expired' },
    ];

    const filters = [
        {
            key: 'status',
            label: 'Status',
            options: statusOptions,
            value: filterStatus,
            onChange: setFilterStatus,
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
                    title="Quotations"
                    subtitle="Manage sales quotes and proposals"
                    icon={<FileText className="w-5 h-5 text-indigo-600" />}
                    onRefresh={fetchQuotes}
                    onAdd={handleAdd}
                    addButtonText="Create Quote"
                />

                <SalesStats stats={stats} />

                <SalesFilters
                    searchPlaceholder="Search quotes..."
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filters}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        fetchQuotes();
                    }}
                />

                <SalesTable
                    data={quotes}
                    columns={columns}
                    actions={actions}
                    isLoading={loading}
                    onRowClick={(item) => handleView(item)}
                    emptyState={
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">No quotes found</h3>
                            <p className="text-gray-500">Create your first quote.</p>
                            <Button
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleAdd}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Quote
                            </Button>
                        </div>
                    }
                />

                <DeleteQuotationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedQuote(null);
                    }}
                    onConfirm={handleDelete}
                    quoteNumber={selectedQuote?.quoteNumber || ''}
                    customerName={selectedQuote?.customerName}
                    isDeleting={isDeleting}
                    status={selectedQuote?.status}
                />
            </motion.div>

            <AddQuotationModal
                isOpen={isAddModalOpen}
                onClose={handleAddModalClose}
                onSuccess={handleAddSuccess}
            />

            <EditQuotationModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSuccess={handleEditSuccess}
                quote={selectedQuote}
            />

            <ViewQuotationModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                onEdit={() => {
                    if (selectedQuote && canEditQuote(selectedQuote)) {
                        setIsViewModalOpen(false);
                        handleEdit(selectedQuote);
                    } else if (selectedQuote) {
                        showToast.warning(`Cannot edit quote with status "${getStatusLabel(selectedQuote.status)}"`);
                    }
                }}
                onSend={() => {
                    if (selectedQuote && canSendQuote(selectedQuote)) {
                        handleSend(selectedQuote);
                    } else if (selectedQuote) {
                        showToast.warning(`Cannot send quote with status "${getStatusLabel(selectedQuote.status)}"`);
                    }
                }}
                onDownload={() => {
                    if (selectedQuote) {
                        handleDownloadPDF(selectedQuote);
                    }
                }}
                onPrint={() => {
                    if (selectedQuote) {
                        handlePrint(selectedQuote);
                    }
                }}
                onDelete={() => {
                    if (selectedQuote) {
                        setIsViewModalOpen(false);
                        setSelectedQuote(selectedQuote);
                        setIsDeleteModalOpen(true);
                    }
                }}
                quote={selectedQuote}
                isLoading={isViewLoading}
                isSending={isSending}
                isDownloading={isDownloading}
                canEdit={selectedQuote ? canEditQuote(selectedQuote) : false}
                canSend={selectedQuote ? canSendQuote(selectedQuote) : false}
            />
        </>
    );
};

export default QuotationsPage;