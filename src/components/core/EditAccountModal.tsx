import { useState, useEffect } from "react";
import {
    Check,
    User,
    Shield,
    Key,
    ClipboardList,
    ChevronDown,
    AlertCircle,
} from "lucide-react";
import { EditAccountInfoStep } from "./steps/EditAccountInfoStep";
import { EditMenuPermissionsStep } from "./steps/EditMenuPermissionsStep";
import { EditAccessPermissionsStep } from "./steps/EditAccessPermissionsStep";
import { EditReviewStep } from "./steps/EditReviewStep";
import type { EmpSearchRes } from "../../../../types/core/EmpSearchRes";
import HelpTooltip from "../../../ui/HelpToolTip";
import { Button } from "../../../ui/button";
import { DeleteAccountModal } from "./steps/DeleteAccountModal";
import type { UUID } from "../../../../types/hr/employee";

export interface EditWizardFormData {
    step1: {
        roleId: string;
        roleName: string;
        moduleIds: string[];
        moduleNames: string[];
        password?: string;
        confirmPassword?: string;
    };
    step2: { menuIds: string[] };
    step3: { accessIds: string[] };
}

const STEPS = [
    { id: 1, label: "Account & Modules", icon: User },
    { id: 2, label: "Menu Permissions", icon: Shield },
    { id: 3, label: "Access Permissions", icon: Key },
    // { id: 4, label: "Review", icon: ClipboardList },
];

interface Props {
    employee: EmpSearchRes;
    accountData: {
        modules: string[];
        permissions: string[];
        apiPermissions: string[];
        roleId?: string;
    };
    onDone: () => void;
    onCancel: () => void;
}

export function EditAccountWizard({
                                      employee,
                                      accountData,
                                      onDone,
                                      onCancel,
                                  }: Props) {
    const [step, setStep] = useState(1);
    const [railOpen, setRailOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [unsavedSteps, setUnsavedSteps] = useState<Set<number>>(new Set());
    const [pendingStep, setPendingStep] = useState<number | null>(null);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [railWidth, setRailWidth] = useState(260);
    const [isResizing, setIsResizing] = useState(false);

    const [formData, setFormData] = useState<EditWizardFormData>({
        step1: {
            roleId: accountData.roleId ?? "",
            roleName: "",
            moduleIds: accountData.modules ?? [],
            moduleNames: [],
        },
        step2: { menuIds: accountData.permissions ?? [] },
        step3: { accessIds: accountData.apiPermissions ?? [] },
    });

    useEffect(() => {
        setFormData({
            step1: {
                roleId: accountData.roleId ?? "",
                roleName: "",
                moduleIds: accountData.modules ?? [],
                moduleNames: [],
            },
            step2: { menuIds: accountData.permissions ?? [] },
            step3: { accessIds: accountData.apiPermissions ?? [] },
        });
    }, [accountData]);

    // Resize functionality
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            // Get the aside element
            const aside = document.querySelector("aside");
            if (!aside) return;

            const rect = aside.getBoundingClientRect();
            let newWidth = e.clientX - rect.left;

            // Set min and max width limits (240px to 400px)
            const minWidth = 240;
            const maxWidth = 400;
            newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

            setRailWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            // Add classes to prevent text selection during resize
            document.body.style.userSelect = "none";
            document.body.style.cursor = "col-resize";

            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [isResizing]);

    const showToast = (msg: string) => {
        const el = document.createElement("div");
        el.textContent = msg;
        el.className =
            "fixed bottom-6 right-6 z-[9999] bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg";
        document.body.appendChild(el);
        setTimeout(() => {
            el.style.opacity = "0";
            setTimeout(() => document.body.removeChild(el), 300);
        }, 2000);
    };

    const handleStep1Save = (data: EditWizardFormData["step1"]) => {
        setSaving(true);
        setTimeout(() => {
            setFormData((f) => ({ ...f, step1: data }));
            setSaving(false);
            setUnsavedSteps((prev) => {
                const next = new Set(prev);
                next.delete(1);
                return next;
            });
            showToast("Account updated");
        }, 300);
    };

    const handleStep2Save = (data: EditWizardFormData["step2"]) => {
        setSaving(true);
        setTimeout(() => {
            setFormData((f) => ({ ...f, step2: data }));
            setSaving(false);
            setUnsavedSteps((prev) => {
                const next = new Set(prev);
                next.delete(2);
                return next;
            });
            showToast("Menu permissions updated");
        }, 300);
    };

    const handleStep3Save = (data: EditWizardFormData["step3"]) => {
        setSaving(true);
        setTimeout(() => {
            setFormData((f) => ({ ...f, step3: data }));
            setSaving(false);
            setUnsavedSteps((prev) => {
                const next = new Set(prev);
                next.delete(3);
                return next;
            });
            showToast("Access permissions updated");
        }, 300);
    };

    const handleDone = () => onDone();

    const handleStepChange = (nextStep: number) => {
        if (step === nextStep) return;
        if (unsavedSteps.has(step)) {
            setPendingStep(nextStep);
            setShowUnsavedWarning(true);
        } else {
            setStep(nextStep);
            setRailOpen(false);
        }
    };

    const handleContinueWithoutSaving = () => {
        if (pendingStep) setStep(pendingStep);
        setShowUnsavedWarning(false);
        setPendingStep(null);
        setRailOpen(false);
    };

    const handleStepMarkUnsaved = (stepNum: number) => {
        setUnsavedSteps((prev) => new Set([...prev, stepNum]));
    };

    const initials = (employee.empFullName ?? "??")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const menuCount = formData.step2.menuIds.length;
    const accessCount = formData.step3.accessIds.length;
    const moduleCount = formData.step1.moduleIds.length;

    const StepRail = () => (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                            {employee.empFullName}
                        </p>
                        <p className="text-xs text-gray-400">{employee.code}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col py-4 flex-1 space-y-2 px-3">
                <div className="flex items-center justify-between px-1 py-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Sections
                    </p>
                    <HelpTooltip text="Click to navigate between sections" />
                </div>

                {STEPS.map((s) => {
                    const active = step === s.id;
                    const hasUnsaved = unsavedSteps.has(s.id);
                    const Icon = s.icon;

                    return (
                        <Button
                            key={s.id}
                            onClick={() => handleStepChange(s.id)}
                            className={`group flex w-full items-center gap-3 text-left rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 p-3 min-w-0 ${
                                active
                                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-sm border border-emerald-200"
                                    : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                            }`}
                        >
                            {/* Icon Circle - Always visible */}
                            <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                                    active
                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                                        : "border-gray-300 text-gray-400 group-hover:border-gray-400"
                                }`}
                            >
                  {active ? (
                      <Check className="w-3 h-3" />
                  ) : (
                      <Icon className="w-3 h-3" />
                  )}
                </span>

                            {/* Label with truncation */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`font-medium transition-all duration-200 text-sm truncate ${
                                        active
                                            ? "text-emerald-700"
                                            : "text-gray-700 group-hover:text-gray-900"
                                    }`}
                                >
                                    {s.label}
                                </p>
                            </div>

                            {/* Unsaved Badge - Responsive */}
                            {hasUnsaved && (
                                <div className="shrink-0">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full whitespace-nowrap">
                      Unsaved
                    </span>
                                </div>
                            )}
                        </Button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/30 space-y-3">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                        Assigned Permissions
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-lg font-bold text-green-600">{moduleCount}</p>
                            <p className="text-xs text-gray-400">Modules</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-green-600">{menuCount}</p>
                            <p className="text-xs text-gray-400">Menus</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-green-600">{accessCount}</p>
                            <p className="text-xs text-gray-400">Actions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 m-4">
                <p className="text-xs font-semibold text-red-700 mb-3">Danger Zone</p>

                <Button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-all"
                >
                    Delete Account
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {showUnsavedWarning && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Unsaved Changes
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        You have unsaved changes in this step.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex gap-3">
                            <Button
                                onClick={() => setShowUnsavedWarning(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg"
                            >
                                Stay
                            </Button>
                            <Button
                                onClick={handleContinueWithoutSaving}
                                className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                            >
                                Discard
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="lg:hidden border-b">
                    <Button
                        onClick={() => setRailOpen((o) => !o)}
                        className="w-full flex justify-between px-4 py-3"
                    >
            <span className="text-sm font-semibold">
              {STEPS.find((s) => s.id === step)?.label}
            </span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${railOpen ? "rotate-180" : ""}`}
                        />
                    </Button>
                    {railOpen && <StepRail />}
                </div>

                <div className="flex min-h-[70vh]">
                    <aside
                        style={{ width: `${railWidth}px` }}
                        className="
              hidden
              lg:flex
              shrink-0
              bg-white
              border-r
              border-gray-200
              relative
              overflow-hidden
              select-none
            "
                    >
                        <div className="w-full h-full">
                            <StepRail />
                        </div>

                        {/* Resize Handle */}
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsResizing(true);
                            }}
                            className="
                absolute
                top-0
                right-0
                h-full
                w-1
                cursor-col-resize
                z-50
                group
                flex
                items-center
                justify-center
              "
                        >
                            {/* Visual indicator line */}
                            <div
                                className={`
                  absolute
                  right-0
                  h-full
                  w-0.5
                  transition-all
                  duration-150
                  ${
                                    isResizing
                                        ? "bg-emerald-500 shadow-sm"
                                        : "bg-transparent group-hover:bg-emerald-400/50"
                                }
                `}
                            />

                            {/* Subtle grabber indicator on hover */}
                            <div
                                className="
                absolute
                right-[-2px]
                top-1/2
                -translate-y-1/2
                w-1
                h-12
                rounded-full
                bg-gray-300
                opacity-0
                group-hover:opacity-100
                transition-opacity
                duration-150
              "
                            />
                        </div>
                    </aside>

                    <main className="flex-1 p-6 bg-gray-50">
                        {step === 1 && (
                            <EditAccountInfoStep
                                employee={employee}
                                initialData={formData.step1}
                                onSave={handleStep1Save}
                                onCancel={onCancel}
                                saving={saving}
                                onFormChange={() => handleStepMarkUnsaved(1)}
                            />
                        )}
                        {step === 2 && (
                            <EditMenuPermissionsStep
                                selectedModuleIds={formData.step1.moduleIds}
                                initialData={formData.step2}
                                onSave={handleStep2Save}
                                onCancel={onCancel}
                                saving={saving}
                                onFormChange={() => handleStepMarkUnsaved(2)}
                            />
                        )}
                        {step === 3 && (
                            <EditAccessPermissionsStep
                                selectedMenuIds={formData.step2.menuIds}
                                initialData={formData.step3}
                                onSave={handleStep3Save}
                                onCancel={onCancel}
                                saving={saving}
                                onFormChange={() => handleStepMarkUnsaved(3)}
                            />
                        )}
                        {/* {step === 4 && (
              <EditReviewStep
                employee={employee}
                formData={formData}
                onFinish={onDone}
                onBack={() => handleStepChange(3)}
              />
            )} */}

                        {showDeleteModal && (
                            <DeleteAccountModal
                                userId={"000" as UUID}
                                isOpen={showDeleteModal}
                                onClose={() => setShowDeleteModal(false)}
                            />
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
