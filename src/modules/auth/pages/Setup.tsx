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

// ============================================================
// STEP DEFINITIONS
// ============================================================

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

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Setup() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const [tempCredentials, setTempCredentials] = useState({ username: "", password: "" });

    // Form data
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

    // Check if system needs setup
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
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-3xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                            System Setup
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Welcome! Let's set up your organization.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-between mb-8 px-4">
                        {STEP_DEFS.map((step, index) => {
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;
                            const Icon = step.icon;
                            return (
                                <div key={step.number} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`
                        w-10 h-10 rounded-full flex items-center justify-center 
                        ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900/50' :
                                                isCompleted ? 'bg-emerald-500 text-white' :
                                                    'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
                        transition-all duration-300
                      `}
                                        >
                                            {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-xs mt-1 font-medium ${
                                            isActive ? 'text-blue-600 dark:text-blue-400' :
                                                isCompleted ? 'text-emerald-600 dark:text-emerald-400' :
                                                    'text-slate-400 dark:text-slate-500'
                                        }`}>
                      {step.title}
                    </span>
                                    </div>
                                    {index < STEP_DEFS.length - 1 && (
                                        <div className={`w-12 h-0.5 mx-2 ${
                                            isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Card */}
                    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                                {STEP_DEFS[currentStep - 1].title}
                            </CardTitle>
                            <CardDescription>
                                Step {currentStep} of {STEP_DEFS.length} • {STEP_DEFS[currentStep - 1].description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStepContent()}
                            </motion.div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </Button>
                                {currentStep < STEP_DEFS.length ? (
                                    <Button onClick={nextStep} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                        Next <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
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

            {/* Credentials Modal */}
            {showCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center gap-3">
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
                            <div className="rounded-lg border border-amber-100 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>You can change your password after your first login from account settings.</span>
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
                <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{value}</span>
                <button
                    type="button"
                    className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Company Name <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.company.name}
                        onChange={(e) => updateCompany('name', e.target.value)}
                        placeholder="Enter company name"
                        className={errors.companyName ? 'border-red-500' : ''}
                    />
                    {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
                </div>
                <div>
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
                <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Input
                        value={formData.company.address}
                        onChange={(e) => updateCompany('address', e.target.value)}
                        placeholder="Enter address"
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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                        <option value="Main">Main</option>
                        <option value="Sub">Sub</option>
                    </select>
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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
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
        <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>This admin user will have full system access. Please keep these credentials secure.</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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