// LeaveAppChainManagement.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from '@/shared/components/ui/button'
import LeaveAppChainSection from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/LeaveAppChainSection";
import { leavePolicyService } from "@/modules/core/services/settings/ModHrm/LeavePolicyService";
import type { UUID } from "@/modules/core/types/Settings/leaveAppChain";

const LeaveAppChainManagement: React.FC = () => {
    const { policyId } = useParams<{ policyId: string }>();
    const navigate = useNavigate();
    const [policyName, setPolicyName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPolicyDetails = async () => {
            if (!policyId) {
                setError("No policy ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const policy = await leavePolicyService.getLeavePolicyById(policyId as UUID);
                setPolicyName(policy.name);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch policy:", err);
                setError(err?.message || "Failed to load policy details");
            } finally {
                setLoading(false);
            }
        };

        fetchPolicyDetails();
    }, [policyId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading policy details...</p>
                </div>
            </div>
        );
    }

    if (error || !policyId) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
                    <p className="text-red-600 mb-4">{error || "Invalid policy ID"}</p>
                    <Button
                        onClick={() => navigate("/settings/hr/leave/policies")}
                        variant="outline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Policies
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <LeaveAppChainSection leavePolicyId={policyId as UUID} />
        </div>
    );
};

export default LeaveAppChainManagement;