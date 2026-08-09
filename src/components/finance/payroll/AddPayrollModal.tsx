import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  UserPlus,
  User,
  Briefcase,
  Building,
  DollarSign,
  Percent,
  CreditCard,
  Shield,
  Heart,
  Trophy,
  Award,
  GraduationCap,
  Star,
  Cpu,
  Users as UsersIcon,
  UserCheck,
  BarChart,
  FileCheck,
  Clock
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import type { JobGradeListDto } from '../../../types/hr/jobgrade';

interface AddPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employeeData: any) => Promise<any>;
  jobGrades: JobGradeListDto[];
}

interface EmployeeFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    ssn: string;
  };
  employmentInfo: {
    employeeId: string;
    department: string;
    position: string;
    jobGradeId: string;
    employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
    hireDate: string;
    reportsTo: string;
    workLocation: string;
    employmentStatus: 'active' | 'on-leave' | 'terminated' | 'pending';
  };
  compensation: {
    baseSalary: number | '';
    payFrequency: 'monthly' | 'bi-weekly' | 'weekly' | 'semi-monthly';
    hourlyRate: number | '';
    overtimeRate: number | '';
    bonus: number | '';
    commissionRate: number | '';
    currency: string;
    salaryBasedOnGrade: boolean;
  };
  benefits: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    retirementPlan: boolean;
    retirementMatch: number | '';
    paidTimeOff: number | '';
    sickDays: number | '';
    otherBenefits: string;
  };
  taxInfo: {
    taxWithholding: 'single' | 'married' | 'married-separate' | 'head-of-household';
    allowances: number | '';
    additionalWithholding: number | '';
    exemptFromFederal: boolean;
    exemptFromState: boolean;
    exemptFromLocal: boolean;
  };
  bankInfo: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
  };
  attendanceSettings: {
    workingDaysPerMonth: number;
    hoursPerDay: number;
    overtimeRate: number;
    latePenaltyMinutes: number;
    gracePeriodMinutes: number;
    paidLeaveDays: number;
    sickLeaveDays: number;
    holidayPayRate: number;
    weekendPayRate: number;
  };
}

// Helper function to extract grade code from name (e.g., "G7 - Senior Developer" → "G7")
const extractGradeCode = (name: string): string => {
  const match = name.match(/^(G\d+)/);
  return match ? match[1] : 'G0';
};

// Helper function to extract title from name (e.g., "G7 - Senior Developer" → "Senior Developer")
const extractTitle = (name: string): string => {
  const parts = name.split(' - ');
  return parts.length > 1 ? parts[1] : name;
};

// Helper function to get experience level based on grade code
const getExperienceLevel = (gradeCode: string): string => {
  switch (gradeCode) {
    case 'G5': return '0-4 years';
    case 'G6': return '3-6 years';
    case 'G7': return '5-8 years';
    case 'G8': return '8+ years';
    case 'G9': return '10+ years';
    default: return 'Varies';
  }
};

// Helper function to get skill level based on grade code
const getSkillLevel = (gradeCode: string): string => {
  switch (gradeCode) {
    case 'G5': return 'Beginner';
    case 'G6': return 'Intermediate';
    case 'G7': return 'Advanced';
    case 'G8':
    case 'G9': return 'Expert';
    default: return 'Varies';
  }
};

// Helper function to get department based on job title
const getDepartment = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('software') || lowerTitle.includes('developer')) return 'IT';
  if (lowerTitle.includes('engineer')) return 'Engineering';
  if (lowerTitle.includes('hr') || lowerTitle.includes('human resources')) return 'HR';
  if (lowerTitle.includes('finance') || lowerTitle.includes('accountant') || lowerTitle.includes('analyst')) return 'Finance';
  if (lowerTitle.includes('sales')) return 'Sales';
  if (lowerTitle.includes('marketing')) return 'Marketing';
  if (lowerTitle.includes('operation') || lowerTitle.includes('director')) return 'Operations';
  if (lowerTitle.includes('customer') || lowerTitle.includes('support')) return 'Customer Service';
  return 'General';
};

// Helper function to get icon based on job title
const getIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('software') || lowerTitle.includes('developer')) return Cpu;
  if (lowerTitle.includes('engineer')) return Trophy;
  if (lowerTitle.includes('hr') || lowerTitle.includes('human resources')) return UserCheck;
  if (lowerTitle.includes('finance') || lowerTitle.includes('accountant')) return BarChart;
  if (lowerTitle.includes('sales')) return Briefcase;
  if (lowerTitle.includes('marketing')) return FileCheck;
  if (lowerTitle.includes('operation') || lowerTitle.includes('director')) return Building;
  if (lowerTitle.includes('customer') || lowerTitle.includes('support')) return UsersIcon;
  return Briefcase;
};

// Helper function to get roles based on grade code and title
const getRoles = (gradeCode: string, title: string): string[] => {
  const isManager = title.toLowerCase().includes('manager') || title.toLowerCase().includes('director');
  const isSenior = gradeCode === 'G7' || gradeCode === 'G8' || gradeCode === 'G9';
  const isJunior = gradeCode === 'G5';

  if (isManager) {
    return [
      'Lead team and set performance targets',
      'Develop strategies and operational plans',
      'Manage budgets and resources',
      'Handle team development and performance reviews'
    ];
  }

  if (isSenior) {
    return [
      'Lead projects and mentor junior staff',
      'Make technical or strategic decisions',
      'Collaborate with cross-functional teams',
      'Contribute to process improvements'
    ];
  }

  if (isJunior) {
    return [
      'Assist with assigned tasks and projects',
      'Learn and apply best practices',
      'Participate in training and development',
      'Support team objectives'
    ];
  }

  return [
    'Execute assigned responsibilities',
    'Participate in team meetings',
    'Contribute to departmental goals',
    'Maintain professional development'
  ];
};

const AddPayrollModal: React.FC<AddPayrollModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onAddEmployee,
                                                           jobGrades = []
                                                         }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedJobGrade, setSelectedJobGrade] = useState<JobGradeListDto | null>(null);
  const [showSalaryRange, setShowSalaryRange] = useState(false);

  const [formData, setFormData] = useState<EmployeeFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      ssn: ''
    },
    employmentInfo: {
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: '',
      position: '',
      jobGradeId: '',
      employmentType: 'full-time',
      hireDate: new Date().toISOString().split('T')[0],
      reportsTo: '',
      workLocation: 'Office',
      employmentStatus: 'active'
    },
    compensation: {
      baseSalary: '',
      payFrequency: 'monthly',
      hourlyRate: '',
      overtimeRate: '',
      bonus: '',
      commissionRate: '',
      currency: 'USD',
      salaryBasedOnGrade: true
    },
    benefits: {
      healthInsurance: true,
      dentalInsurance: true,
      visionInsurance: false,
      retirementPlan: true,
      retirementMatch: 3,
      paidTimeOff: 15,
      sickDays: 10,
      otherBenefits: ''
    },
    taxInfo: {
      taxWithholding: 'single',
      allowances: 1,
      additionalWithholding: 0,
      exemptFromFederal: false,
      exemptFromState: false,
      exemptFromLocal: false
    },
    bankInfo: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking'
    },
    attendanceSettings: {
      workingDaysPerMonth: 22,
      hoursPerDay: 8,
      overtimeRate: 1.5,
      latePenaltyMinutes: 15,
      gracePeriodMinutes: 5,
      paidLeaveDays: 20,
      sickLeaveDays: 10,
      holidayPayRate: 2,
      weekendPayRate: 1.5
    }
  });

  // Process job grades for UI display
  const processedJobGrades = jobGrades.map(grade => {
    const gradeCode = extractGradeCode(grade.name);
    const title = extractTitle(grade.name);
    const department = getDepartment(title);
    const Icon = getIcon(title);

    return {
      ...grade,
      gradeCode,
      title,
      department,
      Icon,
      experience: getExperienceLevel(gradeCode),
      skill: getSkillLevel(gradeCode),
      roles: getRoles(gradeCode, title),
      midSalary: Math.round((grade.startSalary + grade.maxSalary) / 2)
    };
  });

  // Extract unique departments from processed job grades
  const departments = Array.from(new Set(processedJobGrades.map(grade => grade.department).filter(Boolean)));

  // Extract positions from processed job grades
  const positions = Array.from(new Set(processedJobGrades.map(grade => grade.title).filter(Boolean)));

  // Filter job grades by selected department
  const filteredJobGrades = formData.employmentInfo.department
      ? processedJobGrades.filter(grade => grade.department === formData.employmentInfo.department)
      : processedJobGrades;

  useEffect(() => {
    if (formData.employmentInfo.jobGradeId) {
      const grade = processedJobGrades.find(g => g.id === formData.employmentInfo.jobGradeId);
      setSelectedJobGrade(grade || null);

      // Auto-fill position if job grade is selected
      if (grade && !formData.employmentInfo.position) {
        handleInputChange('employmentInfo', 'position', grade.title);
      }

      // Auto-fill department if not set
      if (grade?.department && !formData.employmentInfo.department) {
        handleInputChange('employmentInfo', 'department', grade.department);
      }

      // Set salary based on grade mid-point if enabled
      if (grade && formData.compensation.salaryBasedOnGrade) {
        handleInputChange('compensation', 'baseSalary', grade.midSalary);
      }
    }
  }, [formData.employmentInfo.jobGradeId, formData.compensation.salaryBasedOnGrade, processedJobGrades]);

  const handleInputChange = (section: keyof EmployeeFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (section: keyof EmployeeFormData, field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
      }
    }));
  };

  const calculateHourlyRate = () => {
    const baseSalary = Number(formData.compensation.baseSalary) || 0;
    const payFrequency = formData.compensation.payFrequency;

    let hoursPerYear = 2080;

    switch(payFrequency) {
      case 'weekly':
        return baseSalary > 0 ? baseSalary / 52 / 40 : 0;
      case 'bi-weekly':
        return baseSalary > 0 ? baseSalary / 26 / 40 : 0;
      case 'semi-monthly':
        return baseSalary > 0 ? baseSalary / 24 / 40 : 0;
      case 'monthly':
        return baseSalary > 0 ? baseSalary / 12 / 173.33 : 0;
      default:
        return 0;
    }
  };

  const getSalaryRecommendation = () => {
    if (!selectedJobGrade) return null;

    const currentSalary = Number(formData.compensation.baseSalary) || 0;

    if (currentSalary < selectedJobGrade.startSalary) {
      return {
        type: 'below-range',
        message: `Salary is below grade minimum ($${selectedJobGrade.startSalary.toLocaleString()})`,
        color: 'text-red-600 bg-red-50'
      };
    } else if (currentSalary > selectedJobGrade.maxSalary) {
      return {
        type: 'above-range',
        message: `Salary is above grade maximum ($${selectedJobGrade.maxSalary.toLocaleString()})`,
        color: 'text-amber-600 bg-amber-50'
      };
    } else if (currentSalary >= selectedJobGrade.startSalary && currentSalary <= selectedJobGrade.midSalary) {
      return {
        type: 'in-range-low',
        message: `Salary is in lower range ($${selectedJobGrade.startSalary.toLocaleString()} - $${selectedJobGrade.midSalary.toLocaleString()})`,
        color: 'text-blue-600 bg-blue-50'
      };
    } else {
      return {
        type: 'in-range-high',
        message: `Salary is in upper range ($${selectedJobGrade.midSalary.toLocaleString()} - $${selectedJobGrade.maxSalary.toLocaleString()})`,
        color: 'text-emerald-600 bg-emerald-50'
      };
    }
  };

  const validateForm = () => {
    // Personal Info Validation
    if (!formData.personalInfo.firstName.trim() || !formData.personalInfo.lastName.trim()) {
      setError('First name and last name are required');
      return false;
    }

    if (!formData.personalInfo.email.trim()) {
      setError('Email address is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.personalInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.personalInfo.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    // Employment Info Validation
    if (!formData.employmentInfo.department.trim() || !formData.employmentInfo.position.trim()) {
      setError('Department and position are required');
      return false;
    }

    if (!formData.employmentInfo.hireDate) {
      setError('Hire date is required');
      return false;
    }

    // Compensation Validation
    if (!formData.compensation.baseSalary && !formData.compensation.hourlyRate) {
      setError('Either base salary or hourly rate must be provided');
      return false;
    }

    if (formData.compensation.baseSalary && Number(formData.compensation.baseSalary) < 0) {
      setError('Base salary cannot be negative');
      return false;
    }

    if (formData.compensation.hourlyRate && Number(formData.compensation.hourlyRate) < 0) {
      setError('Hourly rate cannot be negative');
      return false;
    }

    // Validate salary against job grade range if selected
    if (selectedJobGrade && formData.compensation.salaryBasedOnGrade) {
      const currentSalary = Number(formData.compensation.baseSalary) || 0;

      if (currentSalary < selectedJobGrade.startSalary) {
        setError(`Salary must be at least $${selectedJobGrade.startSalary.toLocaleString()} for ${selectedJobGrade.gradeCode} grade`);
        return false;
      }

      if (currentSalary > selectedJobGrade.maxSalary) {
        setError(`Salary cannot exceed $${selectedJobGrade.maxSalary.toLocaleString()} for ${selectedJobGrade.gradeCode} grade`);
        return false;
      }
    }

    // Bank Info Validation (if provided)
    if (formData.bankInfo.bankName.trim() && !formData.bankInfo.accountNumber.trim()) {
      setError('Account number is required when bank name is provided');
      return false;
    }

    if (formData.bankInfo.accountNumber.trim() && !formData.bankInfo.routingNumber.trim()) {
      setError('Routing number is required when account number is provided');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    const loadingToastId = toast.loading('Adding employee...');

    try {
      // Auto-calculate hourly rate if not provided but salary is
      let finalData = { ...formData };
      if (!formData.compensation.hourlyRate && formData.compensation.baseSalary) {
        const calculatedHourlyRate = calculateHourlyRate();
        finalData = {
          ...finalData,
          compensation: {
            ...finalData.compensation,
            hourlyRate: Number(calculatedHourlyRate.toFixed(2))
          }
        };
      }

      // Calculate annual salary from hourly rate if needed
      if (!formData.compensation.baseSalary && formData.compensation.hourlyRate) {
        const hourlyRate = Number(formData.compensation.hourlyRate);
        const annualSalary = hourlyRate * 2080;
        finalData = {
          ...finalData,
          compensation: {
            ...finalData.compensation,
            baseSalary: Number(annualSalary.toFixed(2))
          }
        };
      }

      // Add job grade details to the submission
      const submissionData = {
        ...finalData,
        jobGrade: selectedJobGrade
      };

      const response = await onAddEmployee(submissionData);
      toast.dismiss(loadingToastId);

      const successMessage =
          response?.data?.message ||
          response?.message ||
          'Employee added successfully!';

      toast.success(successMessage);

      resetForm();
      onClose();

    } catch (error: any) {
      toast.dismiss(loadingToastId);

      const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to add employee. Please try again.';

      toast.error(errorMessage);
      setError(errorMessage);
      console.error('Error adding employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        ssn: ''
      },
      employmentInfo: {
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        department: '',
        position: '',
        jobGradeId: '',
        employmentType: 'full-time',
        hireDate: new Date().toISOString().split('T')[0],
        reportsTo: '',
        workLocation: 'Office',
        employmentStatus: 'active'
      },
      compensation: {
        baseSalary: '',
        payFrequency: 'monthly',
        hourlyRate: '',
        overtimeRate: '',
        bonus: '',
        commissionRate: '',
        currency: 'USD',
        salaryBasedOnGrade: true
      },
      benefits: {
        healthInsurance: true,
        dentalInsurance: true,
        visionInsurance: false,
        retirementPlan: true,
        retirementMatch: 3,
        paidTimeOff: 15,
        sickDays: 10,
        otherBenefits: ''
      },
      taxInfo: {
        taxWithholding: 'single',
        allowances: 1,
        additionalWithholding: 0,
        exemptFromFederal: false,
        exemptFromState: false,
        exemptFromLocal: false
      },
      bankInfo: {
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking'
      },
      attendanceSettings: {
        workingDaysPerMonth: 22,
        hoursPerDay: 8,
        overtimeRate: 1.5,
        latePenaltyMinutes: 15,
        gracePeriodMinutes: 5,
        paidLeaveDays: 20,
        sickLeaveDays: 10,
        holidayPayRate: 2,
        weekendPayRate: 1.5
      }
    });
    setSelectedJobGrade(null);
    setActiveTab('personal');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const salaryRecommendation = getSalaryRecommendation();

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 h-dvh">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <UserPlus size={24} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Add New Employee</h2>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-8 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="employment" className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <span className="hidden sm:inline">Employment</span>
                </TabsTrigger>
                <TabsTrigger value="jobgrade" className="flex items-center gap-2">
                  <Trophy size={16} />
                  <span className="hidden sm:inline">Job Grade</span>
                </TabsTrigger>
                <TabsTrigger value="compensation" className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span className="hidden sm:inline">Compensation</span>
                </TabsTrigger>
                <TabsTrigger value="benefits" className="flex items-center gap-2">
                  <Heart size={16} />
                  <span className="hidden sm:inline">Benefits</span>
                </TabsTrigger>
                <TabsTrigger value="tax" className="flex items-center gap-2">
                  <Percent size={16} />
                  <span className="hidden sm:inline">Tax</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span className="hidden sm:inline">Bank</span>
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="hidden sm:inline">Attendance</span>
                </TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm text-gray-500">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="firstName"
                        value={formData.personalInfo.firstName}
                        onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm text-gray-500">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="lastName"
                        value={formData.personalInfo.lastName}
                        onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-500">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.personalInfo.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-gray-500">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="phone"
                        value={formData.personalInfo.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm text-gray-500">
                      Date of Birth
                    </Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.personalInfo.dateOfBirth}
                        onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ssn" className="text-sm text-gray-500">
                      SSN/Tax ID
                    </Label>
                    <Input
                        id="ssn"
                        value={formData.personalInfo.ssn}
                        onChange={(e) => handleInputChange('personalInfo', 'ssn', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        placeholder="XXX-XX-XXXX"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-sm text-gray-500">
                      Address
                    </Label>
                    <Input
                        id="address"
                        value={formData.personalInfo.address}
                        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm text-gray-500">
                      City
                    </Label>
                    <Input
                        id="city"
                        value={formData.personalInfo.city}
                        onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm text-gray-500">
                      State
                    </Label>
                    <Input
                        id="state"
                        value={formData.personalInfo.state}
                        onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm text-gray-500">
                      Zip Code
                    </Label>
                    <Input
                        id="zipCode"
                        value={formData.personalInfo.zipCode}
                        onChange={(e) => handleInputChange('personalInfo', 'zipCode', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm text-gray-500">
                      Country
                    </Label>
                    <Select
                        value={formData.personalInfo.country}
                        onValueChange={(value) => handleInputChange('personalInfo', 'country', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="CAN">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AUS">Australia</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Employment Info Tab */}
              <TabsContent value="employment" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-sm text-gray-500">
                      Employee ID
                    </Label>
                    <Input
                        id="employeeId"
                        value={formData.employmentInfo.employeeId}
                        onChange={(e) => handleInputChange('employmentInfo', 'employeeId', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hireDate" className="text-sm text-gray-500">
                      Hire Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="hireDate"
                        type="date"
                        value={formData.employmentInfo.hireDate}
                        onChange={(e) => handleInputChange('employmentInfo', 'hireDate', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm text-gray-500">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.employmentInfo.department}
                        onValueChange={(value) => handleInputChange('employmentInfo', 'department', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Select department</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm text-gray-500">
                      Position <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.employmentInfo.position}
                        onValueChange={(value) => handleInputChange('employmentInfo', 'position', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Select position</SelectItem>
                        {positions.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentType" className="text-sm text-gray-500">
                      Employment Type
                    </Label>
                    <Select
                        value={formData.employmentInfo.employmentType}
                        onValueChange={(value) => handleInputChange('employmentInfo', 'employmentType', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentStatus" className="text-sm text-gray-500">
                      Employment Status
                    </Label>
                    <Select
                        value={formData.employmentInfo.employmentStatus}
                        onValueChange={(value) => handleInputChange('employmentInfo', 'employmentStatus', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workLocation" className="text-sm text-gray-500">
                      Work Location
                    </Label>
                    <Select
                        value={formData.employmentInfo.workLocation}
                        onValueChange={(value) => handleInputChange('employmentInfo', 'workLocation', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportsTo" className="text-sm text-gray-500">
                      Reports To
                    </Label>
                    <Input
                        id="reportsTo"
                        value={formData.employmentInfo.reportsTo}
                        onChange={(e) => handleInputChange('employmentInfo', 'reportsTo', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        placeholder="Manager name or ID"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Job Grade Tab */}
              <TabsContent value="jobgrade" className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="jobGrade" className="text-sm text-gray-500 flex items-center gap-2">
                        <Award size={16} />
                        Job Grade
                      </Label>
                      <Select
                          value={formData.employmentInfo.jobGradeId}
                          onValueChange={(value) => handleInputChange('employmentInfo', 'jobGradeId', value)}
                          disabled={isLoading || !formData.employmentInfo.department}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Select job grade</SelectItem>
                          {filteredJobGrades.map((grade) => (
                              <SelectItem key={grade.id} value={grade.id}>
                                <div className="flex flex-col">
                                  <span>{grade.gradeCode} - {grade.title}</span>
                                  <span className="text-xs text-gray-500">{grade.experience}</span>
                                </div>
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!formData.employmentInfo.department && (
                          <p className="text-sm text-amber-600 mt-1">
                            Please select a department first to view available job grades
                          </p>
                      )}
                    </div>
                  </div>

                  {selectedJobGrade && (
                      <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                      >
                        <Card className="border-indigo-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                  {selectedJobGrade.Icon && (
                                      <selectedJobGrade.Icon className="h-6 w-6 text-indigo-600" />
                                  )}
                                </div>
                                <div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {selectedJobGrade.gradeCode} - {selectedJobGrade.title}
                                    <Badge variant="outline" className="ml-2">
                                      {selectedJobGrade.skill}
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription className="flex items-center gap-2">
                                    <GraduationCap size={14} />
                                    {selectedJobGrade.experience}
                                  </CardDescription>
                                </div>
                              </div>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowSalaryRange(!showSalaryRange)}
                                  className="text-indigo-600"
                              >
                                {showSalaryRange ? 'Hide Range' : 'Show Range'}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {showSalaryRange && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3"
                                >
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-xs text-blue-600 mb-1">Minimum</div>
                                        <div className="font-bold text-blue-700">
                                          ${selectedJobGrade.startSalary.toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs text-purple-600 mb-1">Maximum</div>
                                        <div className="font-bold text-purple-700">
                                          ${selectedJobGrade.maxSalary.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                            )}

                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities</h4>
                              <ul className="space-y-1">
                                {selectedJobGrade.roles.slice(0, 3).map((role, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <Star className="h-3 w-3 text-indigo-500 mt-1 flex-shrink-0" />
                                      <span className="text-gray-600">{role}</span>
                                    </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600">
                                Use grade salary range for compensation?
                              </div>
                              <Checkbox
                                  checked={formData.compensation.salaryBasedOnGrade}
                                  onCheckedChange={(checked) =>
                                      handleInputChange('compensation', 'salaryBasedOnGrade', checked)
                                  }
                                  disabled={isLoading}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  )}
                </div>
              </TabsContent>

              {/* Compensation Tab */}
              <TabsContent value="compensation" className="space-y-6">
                {selectedJobGrade && salaryRecommendation && (
                    <div className={`p-3 rounded-lg ${salaryRecommendation.color} border`}>
                      <div className="flex items-center gap-2">
                        <Trophy size={16} />
                        <span className="text-sm font-medium">{salaryRecommendation.message}</span>
                      </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary" className="text-sm text-gray-500">
                      Base Salary (Annual) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                      <Input
                          id="baseSalary"
                          type="number"
                          value={formData.compensation.baseSalary}
                          onChange={(e) => handleInputChange('compensation', 'baseSalary', e.target.value)}
                          disabled={isLoading}
                          className="w-full pl-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                      />
                    </div>
                    {selectedJobGrade && (
                        <p className="text-xs text-gray-500 mt-1">
                          Grade range: ${selectedJobGrade.startSalary.toLocaleString()} - ${selectedJobGrade.maxSalary.toLocaleString()}
                        </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payFrequency" className="text-sm text-gray-500">
                      Pay Frequency
                    </Label>
                    <Select
                        value={formData.compensation.payFrequency}
                        onValueChange={(value) => handleInputChange('compensation', 'payFrequency', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="text-sm text-gray-500">
                      Hourly Rate
                    </Label>
                    <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                      <Input
                          id="hourlyRate"
                          type="number"
                          value={formData.compensation.hourlyRate}
                          onChange={(e) => handleInputChange('compensation', 'hourlyRate', e.target.value)}
                          disabled={isLoading}
                          className="w-full pl-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.compensation.baseSalary && `Calculated: $${calculateHourlyRate().toFixed(2)}/hour`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overtimeRate" className="text-sm text-gray-500">
                      Overtime Rate
                    </Label>
                    <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                      <Input
                          id="overtimeRate"
                          type="number"
                          value={formData.compensation.overtimeRate}
                          onChange={(e) => handleInputChange('compensation', 'overtimeRate', e.target.value)}
                          disabled={isLoading}
                          className="w-full pl-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bonus" className="text-sm text-gray-500">
                      Annual Bonus
                    </Label>
                    <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                      <Input
                          id="bonus"
                          type="number"
                          value={formData.compensation.bonus}
                          onChange={(e) => handleInputChange('compensation', 'bonus', e.target.value)}
                          disabled={isLoading}
                          className="w-full pl-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commissionRate" className="text-sm text-gray-500">
                      Commission Rate (%)
                    </Label>
                    <div className="relative">
                      <Input
                          id="commissionRate"
                          type="number"
                          value={formData.compensation.commissionRate}
                          onChange={(e) => handleInputChange('compensation', 'commissionRate', e.target.value)}
                          disabled={isLoading}
                          className="w-full pr-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm text-gray-500">
                      Currency
                    </Label>
                    <Select
                        value={formData.compensation.currency}
                        onValueChange={(value) => handleInputChange('compensation', 'currency', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id="healthInsurance"
                        checked={formData.benefits.healthInsurance}
                        onCheckedChange={(checked) => handleCheckboxChange('benefits', 'healthInsurance', checked as boolean)}
                        disabled={isLoading}
                    />
                    <Label htmlFor="healthInsurance" className="text-sm">
                      Health Insurance
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id="dentalInsurance"
                        checked={formData.benefits.dentalInsurance}
                        onCheckedChange={(checked) => handleCheckboxChange('benefits', 'dentalInsurance', checked as boolean)}
                        disabled={isLoading}
                    />
                    <Label htmlFor="dentalInsurance" className="text-sm">
                      Dental Insurance
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id="visionInsurance"
                        checked={formData.benefits.visionInsurance}
                        onCheckedChange={(checked) => handleCheckboxChange('benefits', 'visionInsurance', checked as boolean)}
                        disabled={isLoading}
                    />
                    <Label htmlFor="visionInsurance" className="text-sm">
                      Vision Insurance
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id="retirementPlan"
                        checked={formData.benefits.retirementPlan}
                        onCheckedChange={(checked) => handleCheckboxChange('benefits', 'retirementPlan', checked as boolean)}
                        disabled={isLoading}
                    />
                    <Label htmlFor="retirementPlan" className="text-sm">
                      Retirement Plan (401k)
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retirementMatch" className="text-sm text-gray-500">
                      Retirement Match (%)
                    </Label>
                    <div className="relative">
                      <Input
                          id="retirementMatch"
                          type="number"
                          value={formData.benefits.retirementMatch}
                          onChange={(e) => handleInputChange('benefits', 'retirementMatch', e.target.value)}
                          disabled={isLoading}
                          className="w-full pr-8"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paidTimeOff" className="text-sm text-gray-500">
                      Paid Time Off (days/year)
                    </Label>
                    <Input
                        id="paidTimeOff"
                        type="number"
                        value={formData.benefits.paidTimeOff}
                        onChange={(e) => handleInputChange('benefits', 'paidTimeOff', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        min="0"
                        step="0.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sickDays" className="text-sm text-gray-500">
                      Sick Days (days/year)
                    </Label>
                    <Input
                        id="sickDays"
                        type="number"
                        value={formData.benefits.sickDays}
                        onChange={(e) => handleInputChange('benefits', 'sickDays', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        min="0"
                        step="0.5"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="otherBenefits" className="text-sm text-gray-500">
                      Other Benefits
                    </Label>
                    <Textarea
                        id="otherBenefits"
                        value={formData.benefits.otherBenefits}
                        onChange={(e) => handleInputChange('benefits', 'otherBenefits', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        placeholder="Additional benefits information..."
                        rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tax Tab */}
              <TabsContent value="tax" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxWithholding" className="text-sm text-gray-500">
                      Tax Withholding Status
                    </Label>
                    <Select
                        value={formData.taxInfo.taxWithholding}
                        onValueChange={(value) => handleInputChange('taxInfo', 'taxWithholding', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="married-separate">Married (Separate)</SelectItem>
                        <SelectItem value="head-of-household">Head of Household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowances" className="text-sm text-gray-500">
                      Allowances
                    </Label>
                    <Input
                        id="allowances"
                        type="number"
                        value={formData.taxInfo.allowances}
                        onChange={(e) => handleInputChange('taxInfo', 'allowances', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalWithholding" className="text-sm text-gray-500">
                      Additional Withholding
                    </Label>
                    <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                      <Input
                          id="additionalWithholding"
                          type="number"
                          value={formData.taxInfo.additionalWithholding}
                          onChange={(e) => handleInputChange('taxInfo', 'additionalWithholding', e.target.value)}
                          disabled={isLoading}
                          className="w-full pl-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Tax Exemptions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                            id="exemptFromFederal"
                            checked={formData.taxInfo.exemptFromFederal}
                            onCheckedChange={(checked) => handleCheckboxChange('taxInfo', 'exemptFromFederal', checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="exemptFromFederal" className="text-sm">
                          Federal Tax Exempt
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                            id="exemptFromState"
                            checked={formData.taxInfo.exemptFromState}
                            onCheckedChange={(checked) => handleCheckboxChange('taxInfo', 'exemptFromState', checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="exemptFromState" className="text-sm">
                          State Tax Exempt
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                            id="exemptFromLocal"
                            checked={formData.taxInfo.exemptFromLocal}
                            onCheckedChange={(checked) => handleCheckboxChange('taxInfo', 'exemptFromLocal', checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="exemptFromLocal" className="text-sm">
                          Local Tax Exempt
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Bank Info Tab */}
              <TabsContent value="bank" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-sm text-gray-500">
                      Bank Name
                    </Label>
                    <Input
                        id="bankName"
                        value={formData.bankInfo.bankName}
                        onChange={(e) => handleInputChange('bankInfo', 'bankName', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType" className="text-sm text-gray-500">
                      Account Type
                    </Label>
                    <Select
                        value={formData.bankInfo.accountType}
                        onValueChange={(value) => handleInputChange('bankInfo', 'accountType', value)}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-sm text-gray-500">
                      Account Number
                    </Label>
                    <Input
                        id="accountNumber"
                        value={formData.bankInfo.accountNumber}
                        onChange={(e) => handleInputChange('bankInfo', 'accountNumber', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        type="password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routingNumber" className="text-sm text-gray-500">
                      Routing Number
                    </Label>
                    <Input
                        id="routingNumber"
                        value={formData.bankInfo.routingNumber}
                        onChange={(e) => handleInputChange('bankInfo', 'routingNumber', e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                        type="password"
                    />
                  </div>

                  <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <Shield className="inline mr-2" size={16} />
                      Bank information is encrypted and stored securely. We use bank-level security standards to protect your data.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Attendance Settings Tab */}
              <TabsContent value="attendance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Working Days per Month</Label>
                    <Input
                        type="number"
                        value={formData.attendanceSettings.workingDaysPerMonth}
                        onChange={(e) => handleInputChange('attendanceSettings', 'workingDaysPerMonth', Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full"
                        min="1"
                        max="31"
                    />
                    <p className="text-xs text-gray-400">Standard working days in a month</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Working Hours per Day</Label>
                    <Input
                        type="number"
                        value={formData.attendanceSettings.hoursPerDay}
                        onChange={(e) => handleInputChange('attendanceSettings', 'hoursPerDay', Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full"
                        min="1"
                        max="24"
                        step="0.5"
                    />
                    <p className="text-xs text-gray-400">Standard hours per working day</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Overtime Rate</Label>
                    <Select
                        value={formData.attendanceSettings.overtimeRate.toString()}
                        onValueChange={(value) => handleInputChange('attendanceSettings', 'overtimeRate', parseFloat(value))}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">Multiplier for overtime hours</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Late Penalty (minutes)</Label>
                    <Input
                        type="number"
                        value={formData.attendanceSettings.latePenaltyMinutes}
                        onChange={(e) => handleInputChange('attendanceSettings', 'latePenaltyMinutes', Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full"
                        min="0"
                        step="5"
                    />
                    <p className="text-xs text-gray-400">Minutes after grace period that triggers penalty</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Grace Period (minutes)</Label>
                    <Input
                        type="number"
                        value={formData.attendanceSettings.gracePeriodMinutes}
                        onChange={(e) => handleInputChange('attendanceSettings', 'gracePeriodMinutes', Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full"
                        min="0"
                        step="5"
                    />
                    <p className="text-xs text-gray-400">Allowed minutes before marking as late</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Paid Leave Days (Annual)</Label>
                    <Input
                        type="number"
                        value={formData.attendanceSettings.paidLeaveDays}
                        onChange={(e) => handleInputChange('attendanceSettings', 'paidLeaveDays', Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full"
                        min="0"
                        step="0.5"
                    />
                    <p className="text-xs text-gray-400">Annual paid leave entitlement</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Sick Leave Days (Annual)</Label>
                    <Input
                        type="number"
                        value={formData.attendanceSettings.sickLeaveDays}
                        onChange={(e) => handleInputChange('attendanceSettings', 'sickLeaveDays', Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full"
                        min="0"
                        step="0.5"
                    />
                    <p className="text-xs text-gray-400">Annual sick leave entitlement</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Holiday Pay Rate</Label>
                    <Select
                        value={formData.attendanceSettings.holidayPayRate.toString()}
                        onValueChange={(value) => handleInputChange('attendanceSettings', 'holidayPayRate', parseFloat(value))}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="2.5">2.5x</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">Multiplier for holiday work</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Weekend Pay Rate</Label>
                    <Select
                        value={formData.attendanceSettings.weekendPayRate.toString()}
                        onValueChange={(value) => handleInputChange('attendanceSettings', 'weekendPayRate', parseFloat(value))}
                        disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">Multiplier for weekend work</p>
                  </div>
                </div>

                {/* Attendance Settings Summary */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="text-sm font-medium text-indigo-700 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Attendance Policy Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Working Days:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.workingDaysPerMonth}/month</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hours/Day:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.hoursPerDay}h</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Overtime:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.overtimeRate}x</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Grace Period:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.gracePeriodMinutes}min</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Paid Leave:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.paidLeaveDays} days</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sick Leave:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.sickLeaveDays} days</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Holiday Pay:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.holidayPayRate}x</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Weekend Pay:</span>
                      <span className="ml-1 font-medium">{formData.attendanceSettings.weekendPayRate}x</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-6">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Summary Card */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="font-medium">
                    {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="font-medium">{formData.employmentInfo.position}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Job Grade</p>
                  <p className="font-medium">
                    {selectedJobGrade ? selectedJobGrade.gradeCode : 'Not selected'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Annual Compensation</p>
                  <p className="font-medium">
                    ${(Number(formData.compensation.baseSalary) ||
                      (Number(formData.compensation.hourlyRate) * 2080) || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tabs = ['personal', 'employment', 'jobgrade', 'compensation', 'benefits', 'tax', 'bank', 'attendance'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                    disabled={activeTab === 'personal' || isLoading}
                >
                  Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tabs = ['personal', 'employment', 'jobgrade', 'compensation', 'benefits', 'tax', 'bank', 'attendance'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                    disabled={activeTab === 'attendance' || isLoading}
                >
                  Next
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6"
                >
                  Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-8 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                >
                  {isLoading ? 'Saving...' : 'Add Payroll'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default AddPayrollModal;