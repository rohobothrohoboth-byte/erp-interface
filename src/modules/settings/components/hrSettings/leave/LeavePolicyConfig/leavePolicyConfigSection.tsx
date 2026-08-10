// src/components/settings/hrSettings/leave/LeavePolicyConfig/leavePolicyConfigSection.tsx
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import type { LeavePolicyConfigAddDto, LeavePolicyConfigListDto, LeavePolicyConfigModDto, UUID } from "@/modules/core/types/Settings/leavePolicyConfig";
import LeavePolicyConfigHeader from "@/modules/settings/components/hrSettings/leave/LeavePolicyConfig/LeavePolicyConfig/leaveConfigHeader";
import LeavePolicyConfigTable from "@/modules/settings/components/hrSettings/leave/LeavePolicyConfig/LeavePolicyConfig/LeavePolicyConfigTable";
import AddLeavePolicyConfig from "@/modules/settings/components/hrSettings/leave/LeavePolicyConfig/LeavePolicyConfig/AddLeavePolicyConfig";
import EditLeavePolicyConfigModal from "@/modules/settings/components/hrSettings/leave/LeavePolicyConfig/LeavePolicyConfig/EdiLeavePolicyConfig";
import { useActiveFiscalYear } from "@/modules/core/services/fiscalyear/fiscNames.api";
import { useActiveLeavePolicyConfig, useCreateLeavePolicyConfig, useUpdateLeavePolicyConfig } from "@/modules/core/services/settings/ModHrm/LeavePolicyConfigService/leavePolicyConfig.queries";
import type { NameListItem } from "@/modules/list/types/NameList/nameList";
import toast from "react-hot-toast";

interface LeavePolicyConfigSectionProps {
    leavePolicyId: UUID;
}

const LeavePolicyConfigSection: React.FC<LeavePolicyConfigSectionProps> = ({ leavePolicyId }) => {
    const {
        data: activeConfig,
        isLoading,
        isError,
        error,
        refetch,
    } = useActiveLeavePolicyConfig(leavePolicyId);

    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<LeavePolicyConfigListDto | null>(null);
    const [fiscalYearsList, setFiscalYearsList] = useState<NameListItem[]>([]);
    const { data: activeFiscalYear } = useActiveFiscalYear();

    const createPolicyConfig = useCreateLeavePolicyConfig();
    const updatePolicyConfig = useUpdateLeavePolicyConfig();

    useEffect(() => {
        const fetchFiscalYears = async () => {
            try {
                const { fiscalYearApi } = await import("@/modules/core/services/fiscalyear/fisc.api");
                const years = await fiscalYearApi.getAllFiscalYears();
                const mappedYears = years.map(y => ({ id: y.id, name: y.name }));
                setFiscalYearsList(mappedYears);
            } catch (error) {
                console.error("Error fetching fiscal years:", error);
            }
        };
        fetchFiscalYears();
    }, []);

    const handleAddLeavePolicyConfig = async (leavePolicyConfig: LeavePolicyConfigAddDto) => {
        try {
            await createPolicyConfig.mutateAsync(leavePolicyConfig);
            toast.success("Policy configuration added successfully");
            setIsAddPolicyModalOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Failed to create policy configuration");
        }
    };

    // Edit handler - opens the edit modal
    const handleEditConfig = (config: LeavePolicyConfigListDto) => {
        console.log("Opening edit modal for config:", config);
        setSelectedConfig(config);
        setIsEditModalOpen(true);
    };

    // Update handler - saves the edited config
    const handleUpdateConfig = async (configData: LeavePolicyConfigModDto) => {
        try {
            await updatePolicyConfig.mutateAsync(configData);
            toast.success("Policy configuration updated successfully");
            setIsEditModalOpen(false);
            setSelectedConfig(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Failed to update policy configuration");
        }
    };

    // Delete handler (optional)
    const handleDeleteConfig = async (config: LeavePolicyConfigListDto) => {
        // Implement delete logic if needed
        console.log("Delete config:", config);
    };

    // Toggle status handler (optional)
    const handleToggleStatus = async (config: LeavePolicyConfigListDto) => {
        // Implement status toggle if needed
        console.log("Toggle status for:", config);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Show error state
    if (isError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">Error loading configuration: {error?.message}</p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Show existing configuration if present */}
            {activeConfig ? (
                <div>
                    <LeavePolicyConfigHeader onAddClick={() => setIsAddPolicyModalOpen(true)} />
                    <LeavePolicyConfigTable
                        leavePolicyConfig={[activeConfig]}
                        currentPage={1}
                        totalPages={1}
                        totalItems={1}
                        isLoading={false}
                        onPageChange={() => {}}
                        onEdit={handleEditConfig}  // ← FIXED: Use the actual edit handler
                        onDelete={handleDeleteConfig}
                        onToggleStatus={handleToggleStatus}
                    />
                </div>
            ) : (
                /* Show empty state with add button */
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Policy Configuration</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Configure how leave days are earned, accrual rates, and usage limits.
                        </p>
                        <button
                            onClick={() => setIsAddPolicyModalOpen(true)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            + Add Configuration
                        </button>
                    </div>
                </div>
            )}

            {/* Add Configuration Modal */}
            <AddLeavePolicyConfig
                isOpen={isAddPolicyModalOpen}
                onClose={() => setIsAddPolicyModalOpen(false)}
                leavePolicyId={leavePolicyId}
                fiscalYear={fiscalYearsList}
                onAddLeavePolicyConfig={handleAddLeavePolicyConfig}
            />

            {/* Edit Configuration Modal - ADD THIS */}
            <EditLeavePolicyConfigModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedConfig(null);
                }}
                config={selectedConfig}
                fiscalYears={fiscalYearsList}
                onUpdateConfig={handleUpdateConfig}
            />
        </div>
    );
};

export default LeavePolicyConfigSection;