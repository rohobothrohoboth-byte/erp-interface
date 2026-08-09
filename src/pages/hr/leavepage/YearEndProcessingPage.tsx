// src/pages/hr/leavepage/YearEndProcessingPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { FiscalYearSelector } from '../../../components/hr/Leave/FiscalYearSelector';
import { SummaryCards } from '../../../components/hr/Leave/SummaryCards';
import { PreviewTable } from '../../../components/hr/Leave/PreviewTable';
import { ProcessResult } from '../../../components/hr/Leave/ProcessResult';
import { EncashmentHistory } from '../../../components/hr/Leave/EncashmentHistory';
import { EncashmentRequestModal } from '../../../components/hr/Leave/EncashmentRequestModal';
import { ProcessConfirmModal } from '../../../components/hr/Leave/Modals/ProcessConfirmModal';
import { RevertConfirmModal } from '../../../components/hr/Leave/Modals/RevertConfirmModal';
import { ManagerApprovals } from '../../../components/hr/Leave/ManagerApprovals';
import { EncashmentApprovals } from '../../../components/hr/Leave/EncashmentApprovals';
import { useFiscalYears } from '../../../hooks/hr/leave/useFiscalYears';
import { usePreviewData } from '../../../hooks/hr/leave/usePreviewData';
import { useEncashment } from '../../../hooks/hr/leave/useEncashment';
import { useYearEndProcess } from '../../../hooks/hr/leave/useYearEndProcess';
import { useNotifications } from '../../../hooks/useNotifications';
import { yearEndApi } from '../../../services/hr/leave/yearEndApi';

import { getAllEmployeeIds } from '../../../services/hr/employee/emp.api'; // ADD THIS
import type { CarryoverPreview, EncashmentRecord } from '../../../types/hr/leave/leaveye';
import { sendToAllEmployees, createBulkNotifications } from '../../../services/notification/notification.api';
const YearEndProcessingPage: React.FC = () => {
    const { role, employeeId: currentEmployeeId, employeeName: currentUserName } = useAuthStore();
    const { sendNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState('preview');
    const [showEncashmentRequestModal, setShowEncashmentRequestModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRevertModal, setShowRevertModal] = useState(false);
    const [selectedRequestItem, setSelectedRequestItem] = useState<CarryoverPreview | null>(null);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [allEncashments, setAllEncashments] = useState<EncashmentRecord[]>([]);

    // Custom Hooks
    const { fiscalYears, selectedYear, setSelectedYear, hasProcessedData, checkIfProcessed, refreshFiscalYears } = useFiscalYears();
    const { previewData, loading, encashmentTotals, isAlreadyProcessed: previewIsProcessed, fetchPreview } = usePreviewData();
    const {
        encashmentHistory,
        loadingEncashment,
        encashmentConfig,
        fetchEncashmentConfig,
        fetchEncashmentHistoryByEmployee,
        processEncashment
    } = useEncashment();
    const { processing, reverting, processResult, processYearEnd, revertYearEnd, fetchProcessResult, resetProcessResult } = useYearEndProcess();

    // Check if user is Admin, Manager, or CEO
    const isAdminOrManager = role === 'admin' || role === 'mgr' || role === 'Admin' || role === 'HR Manager';
    const isCEO = role === 'ceo' || role === 'CEO' || role === 'Executive';
    const canViewApprovals = isAdminOrManager || isCEO;

    // Load all encashments for admin using the API
    const loadAllEncashmentsForAdmin = useCallback(async (fiscalYearId: string) => {
        try {
            console.log('Admin - Loading all encashments via API');
            const response = await yearEndApi.getAllEncashments(fiscalYearId);
            const records = response.data?.data || [];
            console.log(`Loaded ${records.length} encashment records for admin`);
            setAllEncashments(records);
            return records;
        } catch (error) {
            console.error('Error loading all encashments:', error);
            return [];
        }
    }, []);

    // Load all data on mount
    const loadAllData = useCallback(async () => {
        if (!selectedYear || !selectedYear.id) {
            console.warn('No valid fiscal year selected');
            setInitialLoadComplete(true);
            return;
        }

        console.log('Loading all data for year:', selectedYear.name, selectedYear.id);
        console.log('User role:', role);

        try {
            await fetchPreview(selectedYear.id);
        } catch (error) {
            console.error('Failed to load preview data:', error);
        }

        try {
            const result = await fetchProcessResult(selectedYear.id);
            if (result && result.success) {
                setActiveTab('result');
            }
        } catch (error) {
            console.error('Failed to load process result:', error);
        }

        try {
            if (isAdminOrManager) {
                await loadAllEncashmentsForAdmin(selectedYear.id);
            } else if (currentEmployeeId) {
                await fetchEncashmentHistoryByEmployee(currentEmployeeId);
            }
        } catch (error) {
            console.error('Failed to load encashment history:', error);
        }

        setInitialLoadComplete(true);
    }, [selectedYear, fetchPreview, fetchProcessResult, currentEmployeeId, fetchEncashmentHistoryByEmployee, loadAllEncashmentsForAdmin, isAdminOrManager, role]);

    useEffect(() => {
        refreshFiscalYears();
        fetchEncashmentConfig();
    }, [refreshFiscalYears, fetchEncashmentConfig]);

    useEffect(() => {
        if (selectedYear && selectedYear.id && !initialLoadComplete) {
            loadAllData();
        }
    }, [selectedYear, initialLoadComplete, loadAllData]);

    useEffect(() => {
        if (!selectedYear || !selectedYear.id) return;

        const refreshTabData = async () => {
            try {
                if (activeTab === 'preview') {
                    await fetchPreview(selectedYear.id);
                } else if (activeTab === 'encashment') {
                    if (isAdminOrManager) {
                        await loadAllEncashmentsForAdmin(selectedYear.id);
                    } else if (currentEmployeeId) {
                        await fetchEncashmentHistoryByEmployee(currentEmployeeId);
                    }
                } else if (activeTab === 'result') {
                    await fetchProcessResult(selectedYear.id);
                }
            } catch (error) {
                console.error(`Failed to refresh ${activeTab} tab data:`, error);
            }
        };

        refreshTabData();
    }, [activeTab, selectedYear, currentEmployeeId, fetchPreview, fetchEncashmentHistoryByEmployee, fetchProcessResult, isAdminOrManager, loadAllEncashmentsForAdmin]);

    const handleRefresh = async () => {
        if (selectedYear && selectedYear.id) {
            try {
                await fetchPreview(selectedYear.id);
                await fetchProcessResult(selectedYear.id);
                if (isAdminOrManager) {
                    await loadAllEncashmentsForAdmin(selectedYear.id);
                } else if (currentEmployeeId) {
                    await fetchEncashmentHistoryByEmployee(currentEmployeeId);
                }
                await checkIfProcessed(selectedYear.id);
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
    };

    const handleEncashClick = (item: CarryoverPreview) => {
        setSelectedRequestItem(item);
        setShowEncashmentRequestModal(true);
    };
// In YearEndProcessingPage.tsx - Update handleProcess
// src/pages/hr/leavepage/YearEndProcessingPage.tsx - Updated handleProcess
    const handleProcess = async () => {
        if (!selectedYear || !selectedYear.id) {
            console.error('No fiscal year selected');
            return;
        }

        console.log('🔄 Starting year-end processing for:', selectedYear.name);

        try {
            const success = await processYearEnd(selectedYear.id);

            if (success) {
                console.log('✅ Year-end processing completed successfully');

                setShowConfirmModal(false);
                await checkIfProcessed(selectedYear.id);
                await fetchPreview(selectedYear.id);
                await fetchProcessResult(selectedYear.id);
                setActiveTab('result');

                // 1. Send notification to the user who initiated the process
                if (currentEmployeeId && currentEmployeeId !== '00000000-0000-0000-0000-000000000000') {
                    await sendNotification({
                        userId: currentEmployeeId,
                        title: '✅ Year-End Processing Completed',
                        message: `Year-end processing for ${selectedYear.name} has been completed successfully.`,
                        type: 'success',
                        priority: 'high',
                        moduleName: 'Year-End Processing',
                        metadata: {
                            fiscalYear: selectedYear.name,
                            status: 'COMPLETED'
                        }
                    });
                    console.log('✅ Notification sent to user');
                }

                // 2. Send notification to ALL EMPLOYEES using the backend endpoint
                try {
                    console.log('📧 Sending year-end notification to ALL employees...');

                    const result = await sendToAllEmployees(
                        '📊 Year-End Processing Complete',
                        `Year-end processing for ${selectedYear.name} is complete. ${processResult?.employeesProcessed || 0} employees processed. Please check your leave balances.`,
                        'info',
                        'medium',
                        'Year-End Processing',
                        {
                            fiscalYear: selectedYear.name,
                            employeesProcessed: processResult?.employeesProcessed || 0,
                            status: 'COMPLETED'
                        }
                    );

                    if (result) {
                        console.log('✅ Notification sent to ALL employees successfully');
                    } else {
                        console.warn('⚠️ Failed to send notification to all employees');
                    }
                } catch (bulkError) {
                    console.error('❌ Failed to send notification to all employees:', bulkError);
                }
            } else {
                console.error('❌ Year-end processing failed');
            }
        } catch (error) {
            console.error('❌ Error during year-end processing:', error);
        }
    };

// src/pages/hr/leavepage/YearEndProcessingPage.tsx - Updated handleRevert
    const handleRevert = async () => {
        if (!selectedYear) return;
        const fiscalYearNumber = parseInt(selectedYear.name);
        if (isNaN(fiscalYearNumber)) {
            console.error('Invalid fiscal year number:', selectedYear.name);
            return;
        }

        console.log('🔄 Reverting year-end processing for:', selectedYear.name);

        const success = await revertYearEnd(fiscalYearNumber, selectedYear.id);

        if (success) {
            console.log('✅ Year-end reverted successfully');

            setShowRevertModal(false);
            resetProcessResult();
            await checkIfProcessed(selectedYear.id);
            await fetchPreview(selectedYear.id);
            localStorage.removeItem(`yearEndResult_${selectedYear.id}`);
            setActiveTab('preview');
            await refreshFiscalYears();

            // 1. Send notification to the user who reverted
            if (currentEmployeeId && currentEmployeeId !== '00000000-0000-0000-0000-000000000000') {
                try {
                    await sendNotification({
                        userId: currentEmployeeId,
                        title: '↩️ Year-End Processing Reverted',
                        message: `Year-end processing for ${selectedYear.name} has been reverted. All carryover and encashment records have been rolled back.`,
                        type: 'warning',
                        priority: 'high',
                        moduleName: 'Year-End Processing',
                        metadata: {
                            fiscalYear: selectedYear.name,
                            status: 'REVERTED'
                        }
                    });
                    console.log('✅ Notification sent to user');
                } catch (notifError) {
                    console.error('❌ Failed to send notification:', notifError);
                }
            }

            // 2. Send notification to ALL EMPLOYEES about the revert
            try {
                console.log('📧 Sending revert notification to ALL employees...');

                const result = await sendToAllEmployees(
                    '↩️ Year-End Processing Reverted',
                    `Year-end processing for ${selectedYear.name} has been reverted. All carryover and encashment records have been rolled back.`,
                    'warning',
                    'medium',
                    'Year-End Processing',
                    {
                        fiscalYear: selectedYear.name,
                        status: 'REVERTED'
                    }
                );

                if (result) {
                    console.log('✅ Revert notification sent to ALL employees successfully');
                } else {
                    console.warn('⚠️ Failed to send revert notification to all employees');
                }
            } catch (bulkError) {
                console.error('❌ Failed to send revert notification to all employees:', bulkError);
            }
        } else {
            console.error('❌ Year-end revert failed');
        }
    };
    const totalRemaining = previewData.reduce((s, i) => s + (i.remainingBalance || 0), 0);
    const totalCarryover = previewData.reduce((s, i) => s + (i.carryoverAmount || 0), 0);
    const totalLost = previewData.reduce((s, i) => s + (i.lostAmount || 0), 0);

    const displayEncashmentData = isAdminOrManager ? allEncashments : encashmentHistory;

    if (!initialLoadComplete && loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                <p className="text-sm text-gray-500">Loading data...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Year-End Processing</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage leave carryover and encashment</p>
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={loading} className="flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Refresh
                </Button>
            </div>

            <FiscalYearSelector
                fiscalYears={fiscalYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                hasProcessedData={hasProcessedData}
            />

            {previewData.length > 0 && !hasProcessedData && !previewIsProcessed && (
                <SummaryCards
                    fiscalYearName={selectedYear?.name || ''}
                    totalRemaining={totalRemaining}
                    totalCarryover={totalCarryover}
                    totalLost={totalLost}
                />
            )}

            <Card>
                <CardContent className="p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="preview">📋 Preview Carryover</TabsTrigger>
                            <TabsTrigger value="encashment">💰 Encashment History</TabsTrigger>
                            <TabsTrigger value="encashmentApprovals">✓ Encashment Approvals</TabsTrigger>
                            {canViewApprovals && (
                                <TabsTrigger value="approvals">✓ Pending Approvals</TabsTrigger>
                            )}
                            <TabsTrigger value="result">📊 Process Result</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {activeTab === 'preview' && (
                <PreviewTable
                    data={previewData}
                    loading={loading}
                    fiscalYearName={selectedYear?.name || ''}
                    hasProcessedData={hasProcessedData || previewIsProcessed}
                    encashmentConfig={encashmentConfig}
                    encashmentTotals={encashmentTotals}
                    onEncashClick={handleEncashClick}
                    onYearEndProcess={() => setShowConfirmModal(true)}
                    processing={processing}
                    isAlreadyProcessed={previewIsProcessed}
                />
            )}

            {activeTab === 'approvals' && canViewApprovals && (
                <ManagerApprovals />
            )}

            {activeTab === 'encashmentApprovals' && (
                <EncashmentApprovals />
            )}

            {activeTab === 'result' && processResult && (
                <ProcessResult
                    result={processResult}
                    isAdminOrManager={isAdminOrManager}
                    onRevert={() => setShowRevertModal(true)}
                    reverting={reverting}
                />
            )}

            {activeTab === 'encashment' && (
                <EncashmentHistory
                    data={displayEncashmentData}
                    loading={loadingEncashment}
                    isAdminOrManager={isAdminOrManager}
                />
            )}

            {/* Encashment Request Modal */}
            {selectedRequestItem && (
                <EncashmentRequestModal
                    isOpen={showEncashmentRequestModal}
                    onClose={() => {
                        setShowEncashmentRequestModal(false);
                        setSelectedRequestItem(null);
                    }}
                    onSuccess={handleRefresh}
                    employeeId={selectedRequestItem.employeeId}
                    employeeName={selectedRequestItem.employeeName}
                    leaveTypeId={selectedRequestItem.leaveTypeId}
                    leaveTypeName={selectedRequestItem.leaveTypeName}
                    remainingBalance={selectedRequestItem.remainingBalance}
                    maxEncashableDays={encashmentConfig[selectedRequestItem.leaveTypeId]?.maxEncashableDays || 0}
                    ratePerDay={100}
                />
            )}

            <ProcessConfirmModal
                isOpen={showConfirmModal}
                fiscalYearName={selectedYear?.name || ''}
                onConfirm={handleProcess}
                onClose={() => setShowConfirmModal(false)}
                processing={processing}
            />

            <RevertConfirmModal
                isOpen={showRevertModal}
                fiscalYearName={selectedYear?.name || ''}
                onConfirm={handleRevert}
                onClose={() => setShowRevertModal(false)}
                reverting={reverting}
            />
        </motion.div>
    );
};

export default YearEndProcessingPage;