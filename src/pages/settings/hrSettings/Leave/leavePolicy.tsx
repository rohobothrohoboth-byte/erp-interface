import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Plus, RefreshCw, Shield, FileText, Calendar } from "lucide-react";
import type { UUID } from "crypto";

import type {
    LeavePolicyAddDto,
    LeavePolicyListDto,
    LeavePolicyModDto,
    LeaveTypeOptionDto,
} from "../../../../types/core/Settings/leavepolicy";
import LeavePolicySection from "../../../../components/settings/hrSettings/leave/leavepolicy/LeavePolicySection";
import { leavePolicyService } from "../../../../services/core/settings/ModHrm/LeavePolicyService";
import { hrmLeaveListApi } from "../../../../services/List/hrmLeave/hrmLeaveList.api";
import { Button } from "../../../../components/ui/button";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";

/* -------------------------------- helper functions -------------------------------- */

// Helper function to check if a policy is active (handles both "0" and "Active" formats)
const isPolicyActive = (status: string): boolean => {
    return status === "0" || status === "Active";
};

// Helper function to check if a policy is inactive (handles both "1" and "Inactive" formats)
const isPolicyInactive = (status: string): boolean => {
    return status === "1" || status === "Inactive";
};

/* -------------------------------- component -------------------------------- */

const LeavePolicy = () => {
    const [policySearchTerm, setPolicySearchTerm] = useState("");
    const [policyViewMode, setPolicyViewMode] = useState<"grid" | "list">("grid");
    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [leavePolicies, setLeavePolicies] = useState<LeavePolicyListDto[]>([]);
    const [leaveTypeOptions, setLeaveTypeOptions] = useState<LeaveTypeOptionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<LeavePolicyListDto | null>(null);
    const [deletingPolicy, setDeletingPolicy] = useState<LeavePolicyListDto | null>(null);
    const [assigning, setAssigning] = useState(false);

    /* ------------------------------- fetch data -------------------------------- */

    const fetchLeaveTypes = async () => {
        try {
            const types = await hrmLeaveListApi.getAllLeaveTypes();
            setLeaveTypeOptions(types || []);
        } catch (error) {
            console.error('Error fetching leave types:', error);
            toast.error('Failed to load leave types');
            setLeaveTypeOptions([]);
        }
    };

    const fetchLeavePolicies = async () => {
        setLoading(true);
        try {
            const policies = await leavePolicyService.getAllLeavePolicies();
            setLeavePolicies(Array.isArray(policies) ? policies : []);
        } catch (error) {
            console.error('Error fetching leave policies:', error);
            toast.error('Failed to load leave policies');
            setLeavePolicies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
        fetchLeavePolicies();
    }, []);

    /* ------------------------------- filtering -------------------------------- */
    const filteredLeavePolicies = Array.isArray(leavePolicies) ? leavePolicies.filter(
        (policy) =>
            (policy.name?.toLowerCase() || "").includes(policySearchTerm.toLowerCase()) ||
            (policy.leaveType?.toLowerCase() || "").includes(policySearchTerm.toLowerCase()) ||
            (policy.code?.toLowerCase() || "").includes(policySearchTerm.toLowerCase())
    ) : [];

    /* ----------------------------- add policy --------------------------------- */
    const handleAddLeavePolicy = async (policyData: LeavePolicyAddDto): Promise<void> => {
        setActionLoading(true);
        try {
            const newPolicy = await leavePolicyService.createLeavePolicy(policyData);
            setLeavePolicies((prev) => [newPolicy, ...(Array.isArray(prev) ? prev : [])]);
            toast.success('Leave policy created successfully');
            setIsAddPolicyModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to create leave policy');
        } finally {
            setActionLoading(false);
        }
    };

    /* ----------------------------- edit policy -------------------------------- */
    const handlePolicyEdit = async (policy: LeavePolicyModDto): Promise<void> => {
        setActionLoading(true);
        try {
            const updatedPolicy = await leavePolicyService.updateLeavePolicy(policy);
            setLeavePolicies((prev) =>
                (Array.isArray(prev) ? prev : []).map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p))
            );
            toast.success('Leave policy updated successfully');
            setEditingPolicy(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update leave policy');
        } finally {
            setActionLoading(false);
        }
    };

    /* ---------------------------- delete policy -------------------------------- */
    const handlePolicyDelete = async (policyId: UUID): Promise<void> => {
        setActionLoading(true);
        try {
            await leavePolicyService.deleteLeavePolicy(policyId);
            setLeavePolicies((prev) => (Array.isArray(prev) ? prev.filter((p) => p.id !== policyId) : []));
            toast.success('Leave policy deleted successfully');
            setDeletingPolicy(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete leave policy');
        } finally {
            setActionLoading(false);
        }
    };

    /* ---------------------------- assign policies -------------------------------- */
    const handleAssignPolicies = async (): Promise<void> => {
        setAssigning(true);
        try {
            const result = await leavePolicyService.assignPolicies();
            toast.success(result || 'Policies assigned successfully');
            await fetchLeavePolicies();
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign policies');
        } finally {
            setAssigning(false);
        }
    };

    /* ---------------------------- toggle status -------------------------------- */
    const handleToggleStatus = (policy: LeavePolicyListDto) => {
        console.log("Toggle status for:", policy);
        // TODO: Implement status toggle API
    };

    /* ---------------------------- modal control -------------------------------- */
    const handleOpenAddPolicyModal = () => setIsAddPolicyModalOpen(true);
    const handleCloseAddPolicyModal = () => setIsAddPolicyModalOpen(false);

    // Calculate stats - FIXED to handle both "0"/"1" and "Active"/"Inactive" formats
    const stats = {
        total: Array.isArray(leavePolicies) ? leavePolicies.length : 0,
        active: Array.isArray(leavePolicies) ? leavePolicies.filter(p => isPolicyActive(p.status)).length : 0,
        inactive: Array.isArray(leavePolicies) ? leavePolicies.filter(p => isPolicyInactive(p.status)).length : 0,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading leave policies...</p>
                </div>
            </div>
        );
    }

    /* -------------------------------- render ---------------------------------- */
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50"
        >
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-8 w-8 text-white" />
                                <h1 className="text-2xl font-bold text-white">Leave Policies</h1>
                            </div>
                            <p className="text-emerald-100 text-sm">
                                Manage and configure leave policies for different leave types
                            </p>
                        </div>
                        <div className="flex gap-3">

                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-6 -mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Policies</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Policies</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Inactive Policies</p>
                            <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <ErrorBoundary>
                    <LeavePolicySection
                        searchTerm={policySearchTerm}
                        setSearchTerm={setPolicySearchTerm}
                        viewMode={policyViewMode}
                        setViewMode={setPolicyViewMode}
                        leavePolicies={filteredLeavePolicies}
                        onEdit={setEditingPolicy}
                        onDelete={setDeletingPolicy}
                        onAddClick={handleOpenAddPolicyModal}
                        leaveTypeOptions={leaveTypeOptions}
                        onAddLeavePolicy={handleAddLeavePolicy}
                        isAddPolicyModalOpen={isAddPolicyModalOpen}
                        onCloseAddPolicyModal={handleCloseAddPolicyModal}
                        editingPolicy={editingPolicy}
                        deletingPolicy={deletingPolicy}
                        onSaveEdit={handlePolicyEdit}
                        onConfirmDelete={handlePolicyDelete}
                        onToggleStatus={handleToggleStatus}
                        loading={actionLoading}
                    />
                </ErrorBoundary>
            </div>
        </motion.div>
    );
};

export default LeavePolicy;