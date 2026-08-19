// src/modules/auth/pages/Setup.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Check,
    Building2,
    MapPin,
    Users,
    Briefcase,
    Shield,
    Sparkles,
    AlertCircle,
    KeyRound,
    User,
    Mail,
    Lock,
    Copy,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/shared/services/api";

// ============================================================
// TYPES
// ============================================================

interface SetupData {
    modules: { key: string; name: string }[];
    roles: { name: string; description: string }[];
    jobGrades: string[];
}

interface CompanyForm {
    name: string;
    nameAm: string;
    taxId: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    motto: string;
    mission: string;
    vision: string;
    values: string;
    structure: string;
}

interface BranchForm {
    name: string;
    nameAm: string;
    location: string;
    branchType: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    managerName: string;
}

interface DepartmentForm {
    name: string;
    nameAm: string;
}

interface PositionForm {
    name: string;
    nameAm: string;
    jobGradeName: string;
    noOfPosition: number;
}

interface AdminForm {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    firstNameAm: string;
    lastName: string;
    lastNameAm: string;
}

interface FormData {
    company: CompanyForm;
    branch: BranchForm;
    department: DepartmentForm;
    position: PositionForm;
    admin: AdminForm;
}

// ============================================================
// STEP DEFINITIONS
// ============================================================

const STEP_DEFS = [
    {
        number: 1,
        title: "Company",
        icon: Building2,
        description: "Company information",
        shortLabel: "Company"
    },
    {
        number: 2,
        title: "Branch",
        icon: MapPin,
        description: "Branch location",
        shortLabel: "Branch"
    },
    {
        number: 3,
        title: "Department",
        icon: Users,
        description: "First department",
        shortLabel: "Dept"
    },
    {
        number: 4,
        title: "Position",
        icon: Briefcase,
        description: "Job positions",
        shortLabel: "Position"
    },
    {
        number: 5,
        title: "Admin",
        icon: Shield,
        description: "Admin account",
        shortLabel: "Admin"
    },
] as const;

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Setup() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const [tempCredentials, setTempCredentials] = useState({ username: "", password: "" });

    const [formData, setFormData] = useState<FormData>({
        company: { name: "", nameAm: "", taxId: "", phone: "", email: "", address: "", website: "", motto: "", mission: "", vision: "", values: "", structure: "" },
        branch: { name: "", nameAm: "", location: "", branchType: "Main", phone: "", email: "", address: "", city: "", managerName: "" },
        department: { name: "", nameAm: "" },
        position: { name: "", nameAm: "", jobGradeName: "Senior", noOfPosition: 1 },
        admin: {
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            firstNameAm: "",
            lastName: "",
            lastNameAm: "",
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const response = await api.get('/auth/v1/Setup/status');
                const status = response.data?.data;
                if (status?.isSetupComplete) {
                    navigate('/login');
                    return;
                }
                const dataResponse = await api.get('/auth/v1/Setup/data');
                setSetupData(dataResponse.data?.data);
            } catch (error) {
                console.error('Failed to check setup status:', error);
            }
        };
        checkSetup();
    }, [navigate]);

    // ============================================================
    // VALIDATION
    // ============================================================

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.company.name) newErrors.companyName = 'Company name is required';
            if (!formData.company.nameAm) newErrors.companyNameAm = 'Company name (Amharic) is required';
        } else if (step === 2) {
            if (!formData.branch.name) newErrors.branchName = 'Branch name is required';
            if (!formData.branch.location) newErrors.branchLocation = 'Location is required';
        } else if (step === 3) {
            if (!formData.department.name) newErrors.deptName = 'Department name is required';
        } else if (step === 4) {
            if (!formData.position.name) newErrors.posName = 'Position name is required';
        } else if (step === 5) {
            if (!formData.admin.userName) newErrors.adminUserName = 'Username is required';
            if (!formData.admin.email) newErrors.adminEmail = 'Email is required';
            if (!formData.admin.password) newErrors.adminPassword = 'Password is required';
            if (formData.admin.password !== formData.admin.confirmPassword) {
                newErrors.adminConfirm = 'Passwords do not match';
            }
            if (formData.admin.password && formData.admin.password.length < 8) {
                newErrors.adminPassword = 'Password must be at least 8 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ============================================================
    // NAVIGATION
    // ============================================================

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < STEP_DEFS.length) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async () => {
        if (!validateStep(5)) return;

        setIsSubmitting(true);
        try {
            const response = await api.post('/auth/v1/Setup/complete', {
                company: formData.company,
                branch: formData.branch,
                department: formData.department,
                position: formData.position,
                adminUser: formData.admin,
            });

            if (response.data?.success) {
                setTempCredentials({
                    username: formData.admin.userName,
                    password: formData.admin.password,
                });
                setShowCredentials(true);
                toast.success('System setup completed successfully!');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to complete setup';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToLogin = () => {
        setShowCredentials(false);
        navigate('/login');
    };

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Step1CompanyForm formData={formData} setFormData={setFormData} errors={errors} />;
            case 2:
                return <Step2BranchForm formData={formData} setFormData={setFormData} errors={errors} />;
            case 3:
                return <Step3DepartmentForm formData={formData} setFormData={setFormData} errors={errors} />;
            case 4:
                return <Step4PositionForm formData={formData} setFormData={setFormData} errors={errors} setupData={setupData} />;
            case 5:
                return <Step5AdminForm formData={formData} setFormData={setFormData} errors={errors} />;
            default:
                return null;
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <>
            <Toaster
                position="top-right"
                gutter={12}
                toastOptions={{
                    duration: 3000,
                    success: {
                        style: { background: "#10b981", color: "#fff" },
                        iconTheme: { primary: "#fff", secondary: "#10b981" },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: { primary: "#ef4444", secondary: "#fff" },
                    },
                }}
            />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-start justify-center p-4">
                <div className="w-full max-w-6xl">
                    {/* Main Layout - Sidebar + Content */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Steps List */}
                        <div className="lg:w-72 flex-shrink-0">
                            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-xl sticky top-4">
                                <CardContent className="p-4">
                                    <div className="space-y-1">
                                        {STEP_DEFS.map((step) => {
                                            const isActive = currentStep === step.number;
                                            const isCompleted = currentStep > step.number;

                                            return (
                                                <button
                                                    key={step.number}
                                                    onClick={() => {
                                                        if (isCompleted || step.number === currentStep) {
                                                            setCurrentStep(step.number);
                                                        }
                                                    }}
                                                    className={`
                                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left
                                                        ${isActive
                                                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                                                        : isCompleted
                                                            ? 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                                            : 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                                                    }
                                                        ${!isCompleted && step.number > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'}
                                                    `}
                                                    disabled={!isCompleted && step.number > currentStep}
                                                >
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                                                        ${isActive
                                                        ? 'bg-blue-600 text-white'
                                                        : isCompleted
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                    }
                                                    `}>
                                                        {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                                                            {step.title}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                                                    )}
                                                    {isCompleted && (
                                                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
                                            <span>Progress</span>
                                            <span>{currentStep} / {STEP_DEFS.length}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(currentStep / STEP_DEFS.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Area - Header + Form */}
                        <div className="flex-1 min-w-0">
                            {/* Header - Centered above the form card */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-3">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                    System Setup
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Set up your organization in 5 easy steps
                                </p>
                            </div>

                            {/* Form Card */}
                            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-xl">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                                                {STEP_DEFS[currentStep - 1].title}
                                            </CardTitle>
                                            <CardDescription>
                                                Step {currentStep} of {STEP_DEFS.length} • {STEP_DEFS[currentStep - 1].description}
                                            </CardDescription>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                                                {currentStep}/{STEP_DEFS.length}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-2">
                                    {/* Scrollable Form Area */}
                                    <div className="max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentStep}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {renderStepContent()}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                                        <Button
                                            variant="outline"
                                            onClick={prevStep}
                                            disabled={currentStep === 1}
                                            className="gap-2 order-2 sm:order-1"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Back
                                        </Button>
                                        {currentStep < STEP_DEFS.length ? (
                                            <Button
                                                onClick={nextStep}
                                                className="gap-2 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                                            >
                                                Next <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 order-1 sm:order-2"
                                            >
                                                {isSubmitting ? (
                                                    <>Setting up...</>
                                                ) : (
                                                    <>Complete Setup <Check className="w-4 h-4" /></>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credentials Modal */}
            {showCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center gap-3 sticky top-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Setup Complete!</p>
                                <p className="text-[11px] text-emerald-200">
                                    Save these credentials before continuing
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Your organization has been configured. Use the credentials below to log in.
                            </p>
                            <CredRow
                                icon={<User className="h-3.5 w-3.5" />}
                                label="Username"
                                value={tempCredentials.username}
                            />
                            <CredRow
                                icon={<KeyRound className="h-3.5 w-3.5" />}
                                label="Password"
                                value={tempCredentials.password}
                            />
                            <div className="rounded-lg border border-amber-100 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>You can change your password after first login.</span>
                                </p>
                            </div>
                            <Button
                                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                                onClick={handleGoToLogin}
                            >
                                Go to Login <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}

// ============================================================
// CREDENTIAL ROW COMPONENT
// ============================================================

function CredRow({
                     icon,
                     label,
                     value,
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                {icon} {label}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
                <span className="font-mono text-sm text-slate-800 dark:text-slate-200 break-all">{value}</span>
                <button
                    type="button"
                    className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors ml-2 shrink-0"
                    onClick={() => {
                        navigator.clipboard.writeText(value);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}

// ============================================================
// STEP 1: COMPANY FORM
// ============================================================

function Step1CompanyForm({
                              formData,
                              setFormData,
                              errors,
                          }: {
    formData: FormData;
    setFormData: (data: FormData) => void;
    errors: Record<string, string>;
}) {
    const updateCompany = (field: keyof CompanyForm, value: string) => {
        setFormData({
            ...formData,
            company: { ...formData.company, [field]: value },
        });
    };

    return (
        <div className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                    <Label>Company Name <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.company.name}
                        onChange={(e) => updateCompany('name', e.target.value)}
                        placeholder="Enter company name"
                        className={errors.companyName ? 'border-red-500' : ''}
                    />
                    {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
                </div>
                <div className="sm:col-span-2">
                    <Label>Company Name (Amharic) <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.company.nameAm}
                        onChange={(e) => updateCompany('nameAm', e.target.value)}
                        placeholder="የኩባንያውን ስም ያስገቡ"
                        className={errors.companyNameAm ? 'border-red-500' : ''}
                    />
                    {errors.companyNameAm && <p className="text-xs text-red-500 mt-1">{errors.companyNameAm}</p>}
                </div>
                <div>
                    <Label>Tax ID</Label>
                    <Input
                        value={formData.company.taxId}
                        onChange={(e) => updateCompany('taxId', e.target.value)}
                        placeholder="Enter tax ID"
                    />
                </div>
                <div>
                    <Label>Phone</Label>
                    <Input
                        value={formData.company.phone}
                        onChange={(e) => updateCompany('phone', e.target.value)}
                        placeholder="Enter phone number"
                    />
                </div>
                <div>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={formData.company.email}
                        onChange={(e) => updateCompany('email', e.target.value)}
                        placeholder="Enter email"
                    />
                </div>
                <div>
                    <Label>Website</Label>
                    <Input
                        value={formData.company.website}
                        onChange={(e) => updateCompany('website', e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Label>Address</Label>
                    <Input
                        value={formData.company.address}
                        onChange={(e) => updateCompany('address', e.target.value)}
                        placeholder="Enter address"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Label>Motto / Slogan</Label>
                    <Input
                        value={formData.company.motto}
                        onChange={(e) => updateCompany('motto', e.target.value)}
                        placeholder="Enter company motto"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Label>Mission</Label>
                    <textarea
                        value={formData.company.mission}
                        onChange={(e) => updateCompany('mission', e.target.value)}
                        placeholder="Enter company mission"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm resize-y min-h-[56px]"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Label>Vision</Label>
                    <textarea
                        value={formData.company.vision}
                        onChange={(e) => updateCompany('vision', e.target.value)}
                        placeholder="Enter company vision"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm resize-y min-h-[56px]"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Label>Values</Label>
                    <textarea
                        value={formData.company.values}
                        onChange={(e) => updateCompany('values', e.target.value)}
                        placeholder="Enter company values"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm resize-y min-h-[56px]"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Label>Structure</Label>
                    <textarea
                        value={formData.company.structure}
                        onChange={(e) => updateCompany('structure', e.target.value)}
                        placeholder="Describe organizational structure"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm resize-y min-h-[56px]"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// STEP 2: BRANCH FORM
// ============================================================

function Step2BranchForm({
                             formData,
                             setFormData,
                             errors,
                         }: {
    formData: FormData;
    setFormData: (data: FormData) => void;
    errors: Record<string, string>;
}) {
    const updateBranch = (field: keyof BranchForm, value: string) => {
        setFormData({
            ...formData,
            branch: { ...formData.branch, [field]: value },
        });
    };

    return (
        <div className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Label>Branch Name <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.branch.name}
                        onChange={(e) => updateBranch('name', e.target.value)}
                        placeholder="Enter branch name"
                        className={errors.branchName ? 'border-red-500' : ''}
                    />
                    {errors.branchName && <p className="text-xs text-red-500 mt-1">{errors.branchName}</p>}
                </div>
                <div>
                    <Label>Branch Name (Amharic)</Label>
                    <Input
                        value={formData.branch.nameAm}
                        onChange={(e) => updateBranch('nameAm', e.target.value)}
                        placeholder="የቅርንጫፉን ስም ያስገቡ"
                    />
                </div>
                <div>
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.branch.location}
                        onChange={(e) => updateBranch('location', e.target.value)}
                        placeholder="Enter location"
                        className={errors.branchLocation ? 'border-red-500' : ''}
                    />
                    {errors.branchLocation && <p className="text-xs text-red-500 mt-1">{errors.branchLocation}</p>}
                </div>
                <div>
                    <Label>Branch Type</Label>
                    <select
                        value={formData.branch.branchType}
                        onChange={(e) => updateBranch('branchType', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm"
                    >
                        <option value="Main">Main</option>
                        <option value="Sub">Sub</option>
                    </select>
                </div>
                <div>
                    <Label>City</Label>
                    <Input
                        value={formData.branch.city}
                        onChange={(e) => updateBranch('city', e.target.value)}
                        placeholder="Enter city"
                    />
                </div>
                <div>
                    <Label>Manager Name</Label>
                    <Input
                        value={formData.branch.managerName}
                        onChange={(e) => updateBranch('managerName', e.target.value)}
                        placeholder="Enter manager name"
                    />
                </div>
                <div>
                    <Label>Phone</Label>
                    <Input
                        value={formData.branch.phone}
                        onChange={(e) => updateBranch('phone', e.target.value)}
                        placeholder="Enter phone number"
                    />
                </div>
                <div>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={formData.branch.email}
                        onChange={(e) => updateBranch('email', e.target.value)}
                        placeholder="Enter email"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Label>Address</Label>
                    <Input
                        value={formData.branch.address}
                        onChange={(e) => updateBranch('address', e.target.value)}
                        placeholder="Enter address"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// STEP 3: DEPARTMENT FORM
// ============================================================

function Step3DepartmentForm({
                                 formData,
                                 setFormData,
                                 errors,
                             }: {
    formData: FormData;
    setFormData: (data: FormData) => void;
    errors: Record<string, string>;
}) {
    const updateDepartment = (field: keyof DepartmentForm, value: string) => {
        setFormData({
            ...formData,
            department: { ...formData.department, [field]: value },
        });
    };

    return (
        <div className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Label>Department Name <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.department.name}
                        onChange={(e) => updateDepartment('name', e.target.value)}
                        placeholder="Enter department name"
                        className={errors.deptName ? 'border-red-500' : ''}
                    />
                    {errors.deptName && <p className="text-xs text-red-500 mt-1">{errors.deptName}</p>}
                </div>
                <div>
                    <Label>Department Name (Amharic)</Label>
                    <Input
                        value={formData.department.nameAm}
                        onChange={(e) => updateDepartment('nameAm', e.target.value)}
                        placeholder="የክፍሉን ስም ያስገቡ"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// STEP 4: POSITION FORM
// ============================================================

function Step4PositionForm({
                               formData,
                               setFormData,
                               errors,
                               setupData,
                           }: {
    formData: FormData;
    setFormData: (data: FormData) => void;
    errors: Record<string, string>;
    setupData: SetupData | null;
}) {
    const updatePosition = (field: keyof PositionForm, value: string | number) => {
        setFormData({
            ...formData,
            position: { ...formData.position, [field]: value as any },
        });
    };

    return (
        <div className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Label>Position Name <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.position.name}
                        onChange={(e) => updatePosition('name', e.target.value)}
                        placeholder="Enter position name"
                        className={errors.posName ? 'border-red-500' : ''}
                    />
                    {errors.posName && <p className="text-xs text-red-500 mt-1">{errors.posName}</p>}
                </div>
                <div>
                    <Label>Position Name (Amharic)</Label>
                    <Input
                        value={formData.position.nameAm}
                        onChange={(e) => updatePosition('nameAm', e.target.value)}
                        placeholder="የአመራር ስም ያስገቡ"
                    />
                </div>
                <div>
                    <Label>Job Grade</Label>
                    <select
                        value={formData.position.jobGradeName}
                        onChange={(e) => updatePosition('jobGradeName', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm"
                    >
                        {setupData?.jobGrades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label>Number of Positions</Label>
                    <Input
                        type="number"
                        value={formData.position.noOfPosition}
                        onChange={(e) => updatePosition('noOfPosition', parseInt(e.target.value) || 1)}
                        min={1}
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// STEP 5: ADMIN FORM
// ============================================================

function Step5AdminForm({
                            formData,
                            setFormData,
                            errors,
                        }: {
    formData: FormData;
    setFormData: (data: FormData) => void;
    errors: Record<string, string>;
}) {
    const updateAdmin = (field: keyof AdminForm, value: string) => {
        setFormData({
            ...formData,
            admin: { ...formData.admin, [field]: value },
        });
    };

    return (
        <div className="space-y-4 pb-2">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
                <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>This admin user will have full system access.</span>
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Label>First Name</Label>
                    <Input
                        value={formData.admin.firstName}
                        onChange={(e) => updateAdmin('firstName', e.target.value)}
                        placeholder="Enter first name"
                    />
                </div>
                <div>
                    <Label>First Name (Amharic)</Label>
                    <Input
                        value={formData.admin.firstNameAm}
                        onChange={(e) => updateAdmin('firstNameAm', e.target.value)}
                        placeholder="የመጠሪያ ስም ያስገቡ"
                    />
                </div>
                <div>
                    <Label>Last Name</Label>
                    <Input
                        value={formData.admin.lastName}
                        onChange={(e) => updateAdmin('lastName', e.target.value)}
                        placeholder="Enter last name"
                    />
                </div>
                <div>
                    <Label>Last Name (Amharic)</Label>
                    <Input
                        value={formData.admin.lastNameAm}
                        onChange={(e) => updateAdmin('lastNameAm', e.target.value)}
                        placeholder="የአያት ስም ያስገቡ"
                    />
                </div>

                <div>
                    <Label>Username <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={formData.admin.userName}
                            onChange={(e) => updateAdmin('userName', e.target.value)}
                            placeholder="Enter username"
                            className={`pl-10 ${errors.adminUserName ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.adminUserName && <p className="text-xs text-red-500 mt-1">{errors.adminUserName}</p>}
                </div>
                <div>
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="email"
                            value={formData.admin.email}
                            onChange={(e) => updateAdmin('email', e.target.value)}
                            placeholder="Enter email"
                            className={`pl-10 ${errors.adminEmail ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail}</p>}
                </div>
                <div>
                    <Label>Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="password"
                            value={formData.admin.password}
                            onChange={(e) => updateAdmin('password', e.target.value)}
                            placeholder="Enter password (min 8 chars)"
                            className={`pl-10 ${errors.adminPassword ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.adminPassword && <p className="text-xs text-red-500 mt-1">{errors.adminPassword}</p>}
                </div>
                <div>
                    <Label>Confirm Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="password"
                            value={formData.admin.confirmPassword}
                            onChange={(e) => updateAdmin('confirmPassword', e.target.value)}
                            placeholder="Confirm password"
                            className={`pl-10 ${errors.adminConfirm ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.adminConfirm && <p className="text-xs text-red-500 mt-1">{errors.adminConfirm}</p>}
                </div>
            </div>
        </div>
    );
}