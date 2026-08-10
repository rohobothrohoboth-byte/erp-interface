// src/pages/settings/hr/leave/leavePolicyConfig/LeavePolicyConfig.tsx
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    Settings,
    GitBranch,
    Shield,
    CheckCircle,
    ChevronRight,
    Home
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import LeavePolicyConfigSection from "@/modules/settings/components/hrSettings/leave/LeavePolicyConfig/leavePolicyConfigSection";
import LeaveAppChainSection from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/LeaveAppChainSection";
import PolicyAssignmentRuleSection from "@/modules/settings/components/hrSettings/leave/PolicyAssignmentRule/PolicyAssignmenRuleSection";
import type { UUID } from "@/modules/core/types/Settings/leavePolicyConfig";

const LeavePolicyConfig: React.FC = () => {
    const { leavePolicyId } = useParams<{ leavePolicyId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("config");

    if (!leavePolicyId) {
        navigate("/settings/hr/leave");
        return null;
    }

    // Define the 3-step configuration process
    const steps = [
        { id: "config", label: "1. Policy Configuration", icon: Settings, description: "Set leave accrual rules and limits" },
        { id: "approval", label: "2. Approval Workflow", icon: GitBranch, description: "Define who approves leave requests" },
        { id: "assignment", label: "3. Assignment Rules", icon: Shield, description: "Set rules for automatic policy assignment" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 min-h-screen p-6"
        >
            {/* Breadcrumb Navigation */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button
                        onClick={() => navigate("/settings/hr/leave/leavePolicy")}
                        className="hover:text-emerald-600 flex items-center gap-1"
                    >
                        <Home size={14} />
                        Leave Management
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-700 font-medium">Policy Configuration</span>
                </div>
            </div>

            {/* Main Card */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5">
                    <h1 className="text-xl font-bold text-white">Leave Policy Configuration Wizard</h1>
                    <p className="text-emerald-100 text-sm mt-1">
                        Follow these steps in order to fully configure your leave policy
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="border-b bg-gray-50 px-6 py-3">
                    <div className="flex items-center justify-between max-w-2xl">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = activeTab === step.id;
                            const isCompleted = idx < steps.findIndex(s => s.id === activeTab);

                            return (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        onClick={() => setActiveTab(step.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                            isActive
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                            isActive
                                                ? "bg-emerald-600 text-white"
                                                : isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-300 text-gray-500"
                                        }`}>
                                            {isCompleted ? <CheckCircle size={14} /> : idx + 1}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <div className="text-xs font-medium">{step.label.split(". ")[0]}</div>
                                            <div className="text-xs opacity-75">{step.label.split(". ")[1]}</div>
                                        </div>
                                        <Icon size={16} />
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <ChevronRight size={16} className="text-gray-400 mx-1" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Step 1: Policy Configuration */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="hidden">
                            {steps.map(step => (
                                <TabsTrigger key={step.id} value={step.id}>{step.label}</TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Step 1 - Basic Configuration */}
                        <TabsContent value="config">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-medium text-blue-800 flex items-center gap-2">
                                        <Settings size={16} />
                                        Step 1: Configure Policy Rules
                                    </h3>
                                    <p className="text-sm text-blue-600 mt-1">
                                        Set up how leave days are earned (accrual frequency, rate, annual entitlement)
                                        and basic usage limits (max days per request, carryover limits).
                                    </p>
                                </div>
                                <LeavePolicyConfigSection leavePolicyId={leavePolicyId as UUID} />
                                <div className="mt-6 flex justify-end">
                                    <Button
                                        onClick={() => setActiveTab("approval")}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Next: Configure Approval Workflow
                                        <ChevronRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        </TabsContent>

                        {/* Step 2 - Approval Chain */}
                        <TabsContent value="approval">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h3 className="font-medium text-purple-800 flex items-center gap-2">
                                        <GitBranch size={16} />
                                        Step 2: Define Approval Workflow
                                    </h3>
                                    <p className="text-sm text-purple-600 mt-1">
                                        Create the approval chain that determines who needs to approve leave requests
                                        and in what order (Manager → HR → CEO, etc.).
                                    </p>
                                </div>
                                <LeaveAppChainSection leavePolicyId={leavePolicyId as UUID} />
                                <div className="mt-6 flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab("config")}
                                    >
                                        Previous: Policy Configuration
                                    </Button>
                                    <Button
                                        onClick={() => setActiveTab("assignment")}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Next: Configure Assignment Rules
                                        <ChevronRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        </TabsContent>

                        {/* Step 3 - Assignment Rules */}
                        <TabsContent value="assignment">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <h3 className="font-medium text-amber-800 flex items-center gap-2">
                                        <Shield size={16} />
                                        Step 3: Set Assignment Rules
                                    </h3>
                                    <p className="text-sm text-amber-600 mt-1">
                                        Define rules that automatically assign this policy to employees based on
                                        department, position, employment type, or service years.
                                    </p>
                                </div>
                                <PolicyAssignmentRuleSection leavePolicyId={leavePolicyId as UUID} />
                                <div className="mt-6 flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab("approval")}
                                    >
                                        Previous: Approval Workflow
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/settings/hr/leave/leavePolicy")}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Complete Setup
                                        <CheckCircle size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Helpful Tips Footer */}
                <div className="border-t bg-gray-50 px-6 py-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-600 text-sm font-bold">i</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Need help?</span>
                            <p className="mt-1">
                                Configure these steps in order. Each step builds on the previous one:
                                <span className="block mt-1 text-xs text-gray-500">
                                    • Step 1: Set up how many days employees get and how they accrue<br />
                                    • Step 2: Define who approves leave requests (Manager, HR, etc.)<br />
                                    • Step 3: Automatically assign this policy to the right employees
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LeavePolicyConfig;