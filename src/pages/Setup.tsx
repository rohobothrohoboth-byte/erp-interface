import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Check,
    ChevronLeft,
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../services/api";

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
}

interface BranchForm {
    name: string;
    nameAm: string;
    location: string;
    branchType: string;
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

const STEP_DEFS = [
    {
        number: 1,
        title: "Company Setup",
        icon: Building2,
        description: "Company information & tax details"
    },
    {
        number: 2,
        title: "Branch Setup",
        icon: MapPin,
        description: "Configure your first branch location"
    },
    {
        number: 3,
        title: "Department",
        icon: Users,
        description: "Create your first department"
    },
    {
        number: 4,
        title: "Position",
        icon: Briefcase,
        description: "Define initial job positions"
    },
    {
        number: 5,
        title: "Admin User",
        icon: Shield,
        description: "Create system administrator account"
    },
] as const;

export default function Setup() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const [tempCredentials, setTempCredentials] = useState({ username: "", password: "" });
    const contentRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<FormData>({
        company: { name: "", nameAm: "", taxId: "", phone: "", email: "", address: "" },
        branch: { name: "", nameAm: "", location: "", branchType: "Main" },
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

    const scrollContentToTop = () => {
        requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((step) => Math.min(step + 1, STEP_DEFS.length));
            scrollContentToTop();
        }
    };

    const prevStep = () => {
        setCurrentStep((step) => Math.max(step - 1, 1));
        scrollContentToTop();
    };

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

            <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
                <div ref={contentRef} className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
                    {/* Header */}
                    <div className="mb-6 shrink-0 text-center sm:mb-8">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg sm:h-16 sm:w-16">
                            <Sparkles className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                        </div>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
                            System Setup
                        </h1>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                            Welcome! Let's set up your organization step by step.
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="mb-6 shrink-0 overflow-x-auto pb-2 sm:mb-8">
                        <div className="mx-auto flex min-w-[640px] max-w-4xl items-start justify-between px-2 sm:px-4">
                            {STEP_DEFS.map((step, index) => {
                                const isActive = currentStep === step.number;
                                const isCompleted = currentStep > step.number;
                                const Icon = step.icon;

                                return (
                                    <div key={step.number} className="flex min-w-0 flex-1 items-start">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isCompleted) {
                                                    setCurrentStep(step.number);
                                                    scrollContentToTop();
                                                }
                                            }}
                                            disabled={!isCompleted}
                                            className="group flex min-w-0 flex-col items-center text-center disabled:cursor-default"
                                            aria-current={isActive ? "step" : undefined}
                                        >
                                            <div
                                                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-12 sm:w-12 ${
                                                    isActive
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100 dark:shadow-none dark:ring-blue-900/40'
                                                        : isCompleted
                                                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                                                            : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                                                }`}
                                            >
                                                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                            </div>
                                            <span className={`mt-2 max-w-[110px] text-[11px] font-semibold leading-tight sm:text-xs ${
                                                isActive
                                                    ? 'text-blue-700 dark:text-blue-400'
                                                    : isCompleted
                                                        ? 'text-emerald-700 dark:text-emerald-400'
                                                        : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {step.title}
                                            </span>
                                        </button>

                                        {index < STEP_DEFS.length - 1 && (
                                            <div className={`mt-5 h-0.5 flex-1 min-w-6 transition-colors duration-300 sm:mt-6 ${
                                                isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Card */}
                    <Card className="min-h-0 flex-1 overflow-hidden border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-none">
                        <CardHeader className="shrink-0 border-b border-slate-100 bg-white/70 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl text-slate-800 dark:text-slate-100 sm:text-2xl">
                                        {STEP_DEFS[currentStep - 1].title}
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm">
                                        Step {currentStep} of {STEP_DEFS.length} • {STEP_DEFS[currentStep - 1].description}
                                    </CardDescription>
                                </div>
                                <div className="hidden shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 sm:block">
                                    {Math.round((currentStep / STEP_DEFS.length) * 100)}%
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex min-h-0 flex-1 flex-col px-5 py-6 sm:px-7 sm:py-7">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25 }}
                                className="min-h-0 flex-1"
                            >
                                {renderStepContent()}
                            </motion.div>

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="h-11 w-full gap-2 rounded-xl border-slate-200 bg-white px-5 sm:w-auto dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </Button>

                                {currentStep < STEP_DEFS.length ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 sm:w-auto dark:shadow-none"
                                    >
                                        Next <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 sm:w-auto dark:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <>Setting up...</>
                                        ) : (
                                            <>Complete Setup <Check className="h-4 w-4" /></>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="my-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900"
                    >
                        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
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
                        <div className="space-y-4 px-6 py-5">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Your organization has been configured. Use the credentials below to log in as the system admin.
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
                            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
                                <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    Keep these credentials secure and change the password after your first login.
                                </p>
                            </div>
                            <Button onClick={handleGoToLogin} className="h-11 w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                                Continue to Login
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
