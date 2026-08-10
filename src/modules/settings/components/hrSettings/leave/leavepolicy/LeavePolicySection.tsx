import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import type {
    LeavePolicyListDto,
    LeavePolicyAddDto,
    LeavePolicyModDto,
    LeaveTypeOptionDto,
    UUID,
} from "@/modules/core/types/Settings/leavepolicy";
import LeavePolicyHeader from "@/modules/settings/components/hrSettings/leave/leavepolicy/LeavePolicyHeader";
import LeavePolicySearchFilters from "@/modules/settings/components/hrSettings/leave/leavepolicy/LeavePolicySearchFilter";
import AddLeavePolicyModal from "@/modules/settings/components/hrSettings/leave/leavepolicy/AddLeavePolicyModal";
import EditLeavePolicyModal from "@/modules/settings/components/hrSettings/leave/leavepolicy/EditLeavePolicyModal";
import DeleteLeavePolicyModal from "@/modules/settings/components/hrSettings/leave/leavepolicy/DeleteLeavePolicyModal";
import LeavePolicyTable from "@/modules/settings/components/hrSettings/leave/leavepolicy/LeavePolicyTable";
import { leavePolicyService } from "@/modules/core/services/settings/ModHrm/LeavePolicyService";
import { hrmLeaveListApi } from "@/modules/list/services/hrmLeave/hrmLeaveList.api";
import AssignPolicyConfirmationModal from "@/modules/settings/components/hrSettings/leave/leavepolicy/AssignPolicyConfirmationModal";

const LeavePolicySection: React.FC = () => {
    const [leavePolicies, setLeavePolicies] = useState<LeavePolicyListDto[]>([]);
    const [leaveTypeOptions, setLeaveTypeOptions] = useState<
        LeaveTypeOptionDto[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<LeavePolicyListDto | null>(
        null
    );
    const [deletingPolicy, setDeletingPolicy] =
        useState<LeavePolicyListDto | null>(null);

    const itemsPerPage = 10;

    // Fetch policies and leave types
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [policies, leaveTypes] = await Promise.all([
                    leavePolicyService.getAllLeavePolicies(),
                    hrmLeaveListApi.getAllLeaveTypes(),
                ]);
                setLeavePolicies(policies);
                setLeaveTypeOptions(
                    leaveTypes.map((lt) => ({ id: lt.id, name: lt.name }))
                );
            } catch (err) {
                console.error(err);
                setError("Failed to load leave policies. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredLeavePolicies = leavePolicies.filter(
        (policy) =>
            policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalItems = filteredLeavePolicies.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedPolicies = filteredLeavePolicies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when search changes
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    // Refresh data function
    const loadData = async () => {
        try {
            const policies = await leavePolicyService.getAllLeavePolicies();
            setLeavePolicies(policies);
        } catch (err) {
            console.error("Error refreshing policies:", err);
        }
    };

    // CRUD handlers
    const handleAddLeavePolicy = async (policyData: LeavePolicyAddDto) => {
        try {
            const newPolicy = await leavePolicyService.createLeavePolicy(policyData);
            setLeavePolicies((prev) => [...prev, newPolicy]);
            setIsAddPolicyModalOpen(false);
            toast.success("Leave policy created successfully!");
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Failed to create leave policy. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleEditLeavePolicy = async (updatedPolicy: LeavePolicyModDto) => {
        try {
            const result = await leavePolicyService.updateLeavePolicy(updatedPolicy);
            setLeavePolicies((prev) =>
                prev.map((p) => (p.id === result.id ? result : p))
            );
            setEditingPolicy(null);
            toast.success("Leave policy updated successfully!");
        } catch (err: any) {
            console.error('Update error:', err);
            const errorMessage = err?.message || "Failed to update leave policy. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleDeleteLeavePolicy = async (policyId: UUID) => {
        try {
            await leavePolicyService.deleteLeavePolicy(policyId);
            setLeavePolicies((prev) => prev.filter((p) => p.id !== policyId));
            setDeletingPolicy(null);
            toast.success("Leave policy deleted successfully!");
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete leave policy. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleToggleStatus = async (leavePolicy: LeavePolicyListDto) => {
        try {
            // TODO: Implement status toggle API call
            console.log("Toggle status for:", leavePolicy);
            setError(null);
        } catch (err) {
            console.error("Failed to toggle approval chain status:", err);
            setError("Failed to update approval chain status. Please try again.");
        }
    };

    // Handle policy assignment to employees - FIXED
    const handleAssignPolicy = async () => {
        try {
            setIsAssigning(true);
            const result = await leavePolicyService.assignPolicies();
            toast.success(result || "Policies assigned successfully to eligible employees!");
            console.log("Assignment result:", result);
            // Refresh the list after assignment
            await loadData();
        } catch (err: any) {
            console.error("Failed to assign policies:", err);
            // Extract error message correctly - err is already an Error object from our service
            const errorMsg = err?.message || "Failed to assign policies. Please try again.";
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setIsAssigning(false);
            setIsAssignPolicyModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <LeavePolicyHeader />
            </motion.div>

            {/* Error Banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
                >
                    <div className="flex justify-between items-center">
                        <span className="font-medium">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
            )}

            {/* Search Filters */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pb-2"
                >
                    <LeavePolicySearchFilters
                        searchTerm={searchTerm}
                        setSearchTerm={handleSearchChange}
                        onAddClick={() => setIsAddPolicyModalOpen(true)}
                        onAssignPolicy={() => setIsAssignPolicyModalOpen(true)}
                    />
                </motion.div>
            )}

            {/* LeavePolicyTable always visible */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-0 pb-0"
                >
                    <LeavePolicyTable
                        leavePolicies={paginatedPolicies}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        isLoading={loading}
                        onPageChange={setCurrentPage}
                        onEdit={setEditingPolicy as any}
                        onDelete={setDeletingPolicy as any}
                        onToggleStatus={handleToggleStatus}
                    />
                </motion.div>
            )}

            {/* Modals */}
            <AddLeavePolicyModal
                isOpen={isAddPolicyModalOpen}
                onClose={() => setIsAddPolicyModalOpen(false)}
                onAddLeavePolicy={handleAddLeavePolicy}
                leaveTypeOptions={leaveTypeOptions}
            />
            <EditLeavePolicyModal
                isOpen={!!editingPolicy}
                onClose={() => setEditingPolicy(null)}
                onSave={handleEditLeavePolicy}
                policy={editingPolicy}
                leaveTypeOptions={leaveTypeOptions}
            />
            <DeleteLeavePolicyModal
                isOpen={!!deletingPolicy}
                onClose={() => setDeletingPolicy(null)}
                onConfirm={() =>
                    deletingPolicy && handleDeleteLeavePolicy(deletingPolicy.id)
                }
                policy={deletingPolicy}
            />
            <AssignPolicyConfirmationModal
                isOpen={isAssignPolicyModalOpen}
                onClose={() => setIsAssignPolicyModalOpen(false)}
                onConfirm={handleAssignPolicy}
                isLoading={isAssigning}
            />
        </div>
    );
};

export default LeavePolicySection;