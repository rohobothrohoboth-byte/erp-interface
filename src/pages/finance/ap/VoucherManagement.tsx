// src/pages/finance/ap/VoucherManagement.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, RefreshCw, Download, Printer } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useReportExport } from '../../../hooks/useReportExport';
import { showToast } from '../../../layout/layout';
import { VoucherReport } from '../../../services/finance/report/voucher.report';

// Import API functions
import {
    approveVoucher,
    rejectVoucher,
    deleteVoucher,
    updateVoucher, // ✅ Add this import
    getVoucherById,
} from '../../../services/finance/finance.api';

// Components
import { VoucherStats } from './components/VoucherStats';
import { VoucherFilters } from './components/VoucherFilters';
import { VoucherTable } from './components/VoucherTable';
import { VoucherAddModal } from './components/VoucherModals/VoucherAddModal';
import { VoucherApproveModal } from './components/VoucherModals/VoucherApproveModal';
import { VoucherDeleteModal } from './components/VoucherModals/VoucherDeleteModal';
import { VoucherEditModal } from './components/VoucherModals/VoucherEditModal';
import { VoucherExportModal } from './components/VoucherModals/VoucherExportModal';
import { VoucherRejectModal } from './components/VoucherModals/VoucherRejectModal';
import { VoucherViewModal } from './components/VoucherModals/VoucherViewModal';

// Hooks
import { useVoucherData }from './components/hooks/useVoucherData';
import { useVoucherForm } from './components/hooks/useVoucherForm';

// Types
import type{ Voucher } from './components/types/voucher.types';

// Constants
import { ITEMS_PER_PAGE } from './components/constants/voucher.constants';

const VoucherManagement: React.FC = () => {
    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [forceUpdate, setForceUpdate] = useState(false);

    // Custom Hooks
    const {
        filteredVouchers,
        stats,
        vendors,
        periods,
        accounts,
        loading,
        loadingPeriods,
        isRefreshing,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        filterPeriodId,
        setFilterPeriodId,
        fetchData,
        fetchPeriods,
    } = useVoucherData();

    const {
        formData,
        updateField,
        addLine,
        removeLine,
        updateLine,
        resetForm,
        submitForm,
        submitting,
        totals,
        isBalanced,
    } = useVoucherForm(undefined, () => {
        setIsAddModalOpen(false);
        fetchData();
    });

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
        title,
    } = useReportExport('voucher');

    // Effects
    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        fetchData();
    }, [filterPeriodId]);

    // Handlers
    const handleAddVoucher = async () => {
        await submitForm();
    };
    // src/pages/finance/ap/VoucherManagement.tsx

// ✅ Print function - uses browser print dialog
    const handlePrint = () => {
        try {
            if (!filteredVouchers || filteredVouchers.length === 0) {
                showToast.warning('No vouchers to print');
                return;
            }

            // Open print window
            const printWindow = window.open('', '_blank', 'width=1200,height=800');
            if (!printWindow) {
                showToast.error('Please allow popups for printing');
                return;
            }

            const companyName = 'RST ERP System';
            const periodName = periods.find(p => p.id === filterPeriodId)?.name || 'All Periods';
            const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            // Calculate totals
            const totalDebit = filteredVouchers.reduce((sum, v) => sum + v.totalDebit, 0);
            const totalCredit = filteredVouchers.reduce((sum, v) => sum + v.totalCredit, 0);

            // Build HTML content for printing
            let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Voucher Report</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Times New Roman', serif; 
                        padding: 20px; 
                        color: #1a1a1a;
                        background: white;
                    }
                    .print-container {
                        max-width: 1100px;
                        margin: 0 auto;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 25px;
                        border-bottom: 2px solid #1a1a1a;
                        padding-bottom: 15px;
                    }
                    .header h1 { 
                        font-size: 22px; 
                        margin: 0;
                        letter-spacing: 2px;
                    }
                    .header .company-name { 
                        font-size: 18px; 
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .header .subtitle { 
                        font-size: 16px; 
                        font-weight: bold;
                        margin: 5px 0;
                    }
                    .header .meta { 
                        font-size: 12px; 
                        color: #555;
                        margin-top: 5px;
                    }
                    .header .meta span {
                        margin: 0 10px;
                    }
                    .summary-cards {
                        display: grid;
                        grid-template-columns: repeat(6, 1fr);
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    .summary-card {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: center;
                        background: #f9fafb;
                        border-radius: 4px;
                    }
                    .summary-card .label {
                        font-size: 10px;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .summary-card .value {
                        font-size: 16px;
                        font-weight: bold;
                        margin-top: 3px;
                    }
                    .summary-card .value.blue { color: #2563eb; }
                    .summary-card .value.green { color: #16a34a; }
                    .summary-card .value.yellow { color: #ca8a04; }
                    .summary-card .value.red { color: #dc2626; }
                    .summary-card .value.purple { color: #7c3aed; }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 15px 0;
                        font-size: 11px;
                    }
                    th { 
                        background-color: #f3f4f6; 
                        padding: 8px 6px; 
                        text-align: left; 
                        font-weight: bold;
                        border: 1px solid #d1d5db;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    td { 
                        padding: 6px 6px; 
                        border: 1px solid #d1d5db;
                        vertical-align: middle;
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .status-badge { 
                        padding: 2px 8px; 
                        border-radius: 3px; 
                        font-size: 10px;
                        display: inline-block;
                        font-weight: bold;
                    }
                    .status-Draft { background: #f3f4f6; color: #374151; }
                    .status-Pending { background: #fef3c7; color: #92400e; }
                    .status-Approved { background: #dbeafe; color: #1e40af; }
                    .status-Posted { background: #d1fae5; color: #065f46; }
                    .status-Rejected { background: #fee2e2; color: #991b1b; }
                    .status-Void { background: #f3f4f6; color: #6b7280; }
                    .type-badge {
                        padding: 2px 8px;
                        border-radius: 3px;
                        font-size: 10px;
                        display: inline-block;
                        font-weight: bold;
                    }
                    .type-Payment { background: #fee2e2; color: #991b1b; }
                    .type-Receipt { background: #d1fae5; color: #065f46; }
                    .type-Journal { background: #dbeafe; color: #1e40af; }
                    .type-Contra { background: #f3e8ff; color: #6b21a8; }
                    .type-Transfer { background: #ffedd5; color: #9a3412; }
                    .footer { 
                        text-align: center; 
                        margin-top: 25px; 
                        padding-top: 15px; 
                        border-top: 1px solid #d1d5db; 
                        font-size: 10px; 
                        color: #6b7280;
                    }
                    .totals-row {
                        background: #f9fafb;
                        font-weight: bold;
                    }
                    .totals-row td {
                        padding: 8px 6px;
                        border-top: 2px solid #1a1a1a;
                    }
                    @media print {
                        body { padding: 10px; }
                        .no-print { display: none !important; }
                        .summary-card { background: #f9fafb; }
                    }
                    @media screen {
                        .print-button {
                            position: fixed;
                            bottom: 20px;
                            right: 20px;
                            padding: 12px 24px;
                            background: #2563eb;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-size: 16px;
                            cursor: pointer;
                            z-index: 1000;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .print-button:hover {
                            background: #1d4ed8;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <!-- Header -->
                    <div class="header">
                        <div class="company-name">${companyName}</div>
                        <div class="subtitle">VOUCHER REPORT</div>
                        <div class="meta">
                            <span>Period: ${periodName}</span>
                            <span>|</span>
                            <span>Date: ${dateStr}</span>
                            <span>|</span>
                            <span>Time: ${timeStr}</span>
                            <span>|</span>
                            <span>Total Vouchers: ${filteredVouchers.length}</span>
                        </div>
                    </div>

                    <!-- Summary Cards -->
                    <div class="summary-cards">
                        <div class="summary-card">
                            <div class="label">Total Vouchers</div>
                            <div class="value blue">${stats.totalVouchers}</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">Total Amount</div>
                            <div class="value blue">${formatCurrency(stats.totalAmount)}</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">Posted</div>
                            <div class="value green">${stats.postedCount}</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">Pending</div>
                            <div class="value yellow">${stats.pendingCount}</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">Rejected</div>
                            <div class="value red">${stats.rejectedCount}</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">Approval Rate</div>
                            <div class="value purple">${stats.totalVouchers > 0 ? Math.round(((stats.approvedCount + stats.postedCount) / stats.totalVouchers) * 100) : 0}%</div>
                        </div>
                    </div>

                    <!-- Vouchers Table -->
                    <table>
                        <thead>
                            <tr>
                                <th style="width:12%">Voucher #</th>
                                <th style="width:8%">Type</th>
                                <th style="width:18%">Vendor</th>
                                <th style="width:10%">Period</th>
                                <th style="width:10%">Date</th>
                                <th style="width:12%;text-align:right">Debit</th>
                                <th style="width:12%;text-align:right">Credit</th>
                                <th style="width:10%;text-align:center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

            // Add rows for each voucher
            filteredVouchers.forEach(v => {
                htmlContent += `
                <tr>
                    <td><strong>${v.voucherNumber || ''}</strong></td>
                    <td><span class="type-badge type-${v.voucherType}">${v.voucherType || 'Journal'}</span></td>
                    <td>${v.vendorName || '-'}</td>
                    <td>${v.periodName || '-'}</td>
                    <td>${new Date(v.voucherDate).toLocaleDateString()}</td>
                    <td class="text-right">${formatCurrency(v.totalDebit)}</td>
                    <td class="text-right">${formatCurrency(v.totalCredit)}</td>
                    <td class="text-center"><span class="status-badge status-${v.status}">${v.status}</span></td>
                </tr>
            `;
            });

            // Add totals row
            htmlContent += `
                        <tr class="totals-row">
                            <td colspan="5" style="text-align:right;"><strong>TOTALS</strong></td>
                            <td class="text-right"><strong>${formatCurrency(totalDebit)}</strong></td>
                            <td class="text-right"><strong>${formatCurrency(totalCredit)}</strong></td>
                            <td></td>
                        </tr>
        `;

            htmlContent += `
                        </tbody>
                    </table>

                    <!-- Footer -->
                    <div class="footer">
                        <p>This report was generated from RST ERP System</p>
                        <p>Generated on ${dateStr} at ${timeStr}</p>
                    </div>
                </div>

                <!-- Print Button (only visible on screen) -->
                <button class="print-button no-print" onclick="window.print()">
                    🖨️ Print
                </button>

                <script>
                    // Auto-print when the window loads
                    window.onload = function() {
                        // Small delay to ensure everything is rendered
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

        } catch (error) {
            console.error('Print error:', error);
            showToast.error('Failed to print report');
        }
    };

// Helper function for currency formatting
    const formatCurrency = (amount: number): string => {
        if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
        return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    };

    // src/pages/finance/ap/VoucherManagement.tsx

// ✅ Export function - uses VoucherReport for PDF
    const handleExportReport = () => {
        try {
            if (!filteredVouchers || filteredVouchers.length === 0) {
                showToast.warning('No data to export');
                return;
            }

            const companyName = 'RST ERP System';
            const periodName = periods.find(p => p.id === filterPeriodId)?.name || 'All Periods';

            if (exportFormat === 'pdf') {
                // Use VoucherReport for PDF
                const doc = VoucherReport.generatePDF(
                    filteredVouchers,
                    stats,
                    companyName,
                    periodName
                );
                doc.save(`voucher-report-${new Date().toISOString().slice(0, 10)}.pdf`);
                showToast.success('PDF exported successfully');
            } else if (exportFormat === 'excel') {
                // Export to Excel
                exportToExcel(filteredVouchers, periodName);
            } else if (exportFormat === 'csv') {
                // Export to CSV
                exportToCSV(filteredVouchers, periodName);
            }

            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            showToast.error('Failed to export report');
        }
    };

// Excel export helper
    const exportToExcel = (data: any[], periodName: string) => {
        try {
            const XLSX = require('xlsx');
            const ws = XLSX.utils.json_to_sheet(data.map(v => ({
                'Voucher #': v.voucherNumber || '',
                'Type': v.voucherType || '',
                'Vendor': v.vendorName || '',
                'Period': v.periodName || '',
                'Date': new Date(v.voucherDate).toLocaleDateString(),
                'Debit': v.totalDebit || 0,
                'Credit': v.totalCredit || 0,
                'Status': v.status || ''
            })));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Vouchers');
            XLSX.writeFile(wb, `voucher-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
            showToast.success('Excel exported successfully');
        } catch (error) {
            console.error('Excel export error:', error);
            showToast.error('Failed to export Excel');
        }
    };

// CSV export helper
    const exportToCSV = (data: any[], periodName: string) => {
        try {
            const headers = ['Voucher #', 'Type', 'Vendor', 'Period', 'Date', 'Debit', 'Credit', 'Status'];
            const rows = data.map(v => [
                v.voucherNumber || '',
                v.voucherType || '',
                v.vendorName || '',
                v.periodName || '',
                new Date(v.voucherDate).toLocaleDateString(),
                v.totalDebit || 0,
                v.totalCredit || 0,
                v.status || ''
            ]);
            const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `voucher-report-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast.success('CSV exported successfully');
        } catch (error) {
            console.error('CSV export error:', error);
            showToast.error('Failed to export CSV');
        }
    };
    const handleOpenAddModal = async () => {
        // Ensure periods are loaded
        if (periods.length === 0) {
            console.log('📡 [VoucherManagement] Loading periods before opening modal...');
            await fetchPeriods();
            setForceUpdate(prev => !prev);
        }
        const activePeriod = periods.find((p: any) => !p.isClosed);
        resetForm(activePeriod?.id);
        setIsAddModalOpen(true);
    };

    const handleApproveVoucher = async () => {
        if (!selectedVoucher) return;
        try {
            await approveVoucher(selectedVoucher.id);
            showToast.success(`Voucher ${selectedVoucher.voucherNumber} approved successfully`);
            setIsApproveModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error approving voucher:', error);
            showToast.error(error.response?.data?.message || 'Failed to approve voucher');
        }
    };

    const handleRejectVoucher = async () => {
        if (!selectedVoucher || !rejectionReason) return;
        try {
            await rejectVoucher(selectedVoucher.id, { reason: rejectionReason });
            showToast.success(`Voucher ${selectedVoucher.voucherNumber} rejected`);
            setIsRejectModalOpen(false);
            setRejectionReason('');
            await fetchData();
        } catch (error: any) {
            console.error('Error rejecting voucher:', error);
            showToast.error(error.response?.data?.message || 'Failed to reject voucher');
        }
    };

    const handleDeleteVoucher = async () => {
        if (!selectedVoucher) return;
        try {
            await deleteVoucher(selectedVoucher.id);
            showToast.success(`Voucher ${selectedVoucher.voucherNumber} deleted successfully`);
            setIsDeleteModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting voucher:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete voucher');
        }
    };

    // ✅ Fixed handleSaveVoucher - now updateVoucher is imported
    // src/pages/finance/ap/VoucherManagement.tsx

    // src/pages/finance/ap/VoucherManagement.tsx

    const handleSaveVoucher = async (id: string, data: any) => {
        try {
            console.log('📡 [VoucherManagement] handleSaveVoucher called');
            console.log('📡 [VoucherManagement] ID received:', id);
            console.log('📡 [VoucherManagement] Data received:', data);

            // ✅ Validate ID - this is the key fix
            if (!id) {
                console.error('❌ [VoucherManagement] ID is undefined or empty');
                showToast.error('Voucher ID is missing');
                return;
            }

            // ✅ Ensure the data includes the ID
            const updateData = {
                ...data,
                id: id, // Make sure ID is in the data
                dateMod: new Date().toISOString(),
            };

            console.log('📡 [VoucherManagement] Calling updateVoucher with ID:', id);
            console.log('📡 [VoucherManagement] Update data:', updateData);

            // ✅ Call updateVoucher with the ID and data
            const response = await updateVoucher(id, updateData);

            console.log('✅ [VoucherManagement] Update successful:', response.data);
            showToast.success('Voucher updated successfully');
            setIsEditModalOpen(false);

            // Refresh data
            await fetchData();

            // Update selected voucher

        } catch (error: any) {
            console.error('❌ [VoucherManagement] Error updating voucher:', error);

            // Handle specific errors
            if (error.response?.status === 405) {
                showToast.error('API method not supported. Please check the endpoint configuration.');
            } else if (error.response?.status === 409) {
                showToast.error('The voucher was modified by another user. Please refresh and try again.');
                await fetchData();
                setIsEditModalOpen(false);
            } else if (error.response?.data?.message) {
                showToast.error(error.response.data.message);
            } else {
                showToast.error('Failed to update voucher. Please try again.');
            }
            throw error;
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('All');
        setFilterType('All');
        setFilterPeriodId('all');
        fetchData();
    };

    const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Voucher Management</h1>
                        <p className="text-sm text-gray-500">Create and manage financial vouchers</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handleRefresh(fetchData)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={exporting}
                    >
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handlePrint}  // ✅ Uses the browser print
                        disabled={!filteredVouchers || filteredVouchers.length === 0}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        New Voucher
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <VoucherStats stats={stats} />

            {/* Filters */}
            <VoucherFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterPeriodId={filterPeriodId}
                onPeriodChange={setFilterPeriodId}
                periods={periods}
                filterType={filterType}
                onTypeChange={setFilterType}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                onClearFilters={handleClearFilters}
                onRefresh={() => fetchData()}
                isRefreshing={isRefreshing}
            />

            {/* Table */}
            <VoucherTable
                vouchers={filteredVouchers.slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE
                )}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                onView={(voucher) => {
                    setSelectedVoucher(voucher);
                    setIsViewModalOpen(true);
                }}
                onEdit={(voucher) => {
                    setSelectedVoucher(voucher);
                    setIsEditModalOpen(true);
                }}
                onApprove={(voucher) => {
                    setSelectedVoucher(voucher);
                    setIsApproveModalOpen(true);
                }}
                onReject={(voucher) => {
                    setSelectedVoucher(voucher);
                    setIsRejectModalOpen(true);
                }}
                onDelete={(voucher) => {
                    setSelectedVoucher(voucher);
                    setIsDeleteModalOpen(true);
                }}
            />

            {/* Modals */}
            <VoucherAddModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                formData={formData}
                onUpdateField={updateField}
                onAddLine={addLine}
                onRemoveLine={removeLine}
                onUpdateLine={updateLine}
                onSubmit={handleAddVoucher}
                isSubmitting={submitting}
                periods={periods}
                vendors={vendors}
                accounts={accounts}
                totals={totals}
                isBalanced={isBalanced}
                loadingPeriods={loadingPeriods}
            />

            <VoucherViewModal
                isOpen={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                voucher={selectedVoucher}
                onEdit={() => {
                    setIsViewModalOpen(false);
                    if (selectedVoucher) {
                        setSelectedVoucher(selectedVoucher);
                        setIsEditModalOpen(true);
                    }
                }}
                onApprove={() => {
                    setIsViewModalOpen(false);
                    if (selectedVoucher) {
                        setSelectedVoucher(selectedVoucher);
                        setIsApproveModalOpen(true);
                    }
                }}
                onReject={() => {
                    setIsViewModalOpen(false);
                    if (selectedVoucher) {
                        setSelectedVoucher(selectedVoucher);
                        setIsRejectModalOpen(true);
                    }
                }}
            />

            <VoucherEditModal
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                voucher={selectedVoucher}
                onSave={handleSaveVoucher}

                accounts={accounts}
                periods={periods}
                vendors={vendors}
                isSubmitting={submitting}
            />

            <VoucherApproveModal
                isOpen={isApproveModalOpen}
                onOpenChange={setIsApproveModalOpen}
                voucher={selectedVoucher}
                onConfirm={handleApproveVoucher}
                isSubmitting={submitting}
            />

            <VoucherRejectModal
                isOpen={isRejectModalOpen}
                onOpenChange={setIsRejectModalOpen}
                voucher={selectedVoucher}
                rejectionReason={rejectionReason}
                onReasonChange={setRejectionReason}
                onConfirm={handleRejectVoucher}
                isSubmitting={submitting}
            />

            <VoucherDeleteModal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                voucher={selectedVoucher}
                onConfirm={handleDeleteVoucher}
                isSubmitting={submitting}
            />

            <VoucherExportModal
                isOpen={isExportModalOpen}
                onOpenChange={setIsExportModalOpen}
                exportFormat={exportFormat}
                onFormatChange={setExportFormat}
                onExport={handleExportReport}  // ✅ Use the new export handler
                isExporting={exporting}
                stats={stats}
                periodName={periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'}
            />
        </motion.div>
    );
};

export default VoucherManagement;