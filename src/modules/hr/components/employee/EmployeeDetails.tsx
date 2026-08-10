import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { InteractiveGridPattern } from '@/shared/components/ui/interactive-grid-pattern';
import {
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Award,
  BarChart3,
  Users,
  Star,
  Clock,
  FileText,
  Heart,
  Download,
  VenetianMask,
  Calendar,
  Building2,
  Globe,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Printer,
  Share2,
  MoreVertical
} from 'lucide-react';
import type { EmployeeListDto } from '@/modules/hr/types/employee';

// ============================================================
// TYPES
// ============================================================

type EmployeeDisplay = EmployeeListDto & {
  employmentDate?: string;
  jobGrade?: string;
  jobGradeId?: string;
  employmentType?: string;
  employmentNature?: string;
  nationality?: string;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  employeeCategory?: string;
  reportingTo?: string;
  manager?: string;
  team?: string;
  contractType?: string;
  employmentStatus?: string;
  status?: "active" | "on-leave";
  workLocation?: string;
  workSchedule?: string;
  salary?: number;
  currency?: string;
  paymentMethod?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  taxInformation?: string;
  lastCheckIn?: string;
  lastCheckOut?: string;
  totalLeavesTaken?: number;
  leaveBalance?: number;
  attendancePercentage?: number;
  performanceRating?: number;
  lastAppraisalDate?: string;
  nextAppraisalDate?: string;
  keyPerformanceIndicators?: {
    name: string;
    target: string;
    actual: string;
    weight: number;
  }[];
  skills?: string[];
  competencies?: string[];
  trainings?: {
    name: string;
    date: string;
    duration: string;
    status: "Completed" | "In Progress" | "Pending";
    certification?: string;
  }[];
  previousRoles?: {
    jobTitle: string;
    department: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
  }[];
  documents?: {
    type: string;
    name: string;
    issueDate: string;
    expiryDate?: string;
    status: string;
  }[];
  photo?: string;
  bio?: string;
  interests?: string[];
  languages?: string[];
  education?: {
    institution: string;
    degree: string;
    year: string;
  }[];
};

// ============================================================
// TAB CONFIGURATION
// ============================================================

const employeeTabs = [
  { id: 'overview', label: 'Overview', icon: User, color: 'emerald' },
  { id: 'employment', label: 'Employment', icon: Briefcase, color: 'blue' },
  { id: 'personal', label: 'Personal Info', icon: VenetianMask, color: 'purple' },
  { id: 'contact', label: 'Contact & Address', icon: MapPin, color: 'orange' },
  { id: 'emergency', label: 'Emergency', icon: Heart, color: 'red' },
  { id: 'performance', label: 'Performance', icon: BarChart3, color: 'indigo' },
  { id: 'documents', label: 'Documents', icon: FileText, color: 'gray' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const storedEmployee = sessionStorage.getItem('selectedEmployee');
    if (storedEmployee) {
      try {
        const parsedEmployee = JSON.parse(storedEmployee);
        if (parsedEmployee.id === id) {
          setEmployee(parsedEmployee);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing stored employee data:', error);
      }
    }
    setLoading(false);
  }, [id]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'on-leave':
        return 'bg-gradient-to-r from-amber-500 to-orange-500';
      default:
        return 'bg-gradient-to-r from-slate-500 to-gray-500';
    }
  };

  const getTabColor = (color: string, isActive: boolean) => {
    if (!isActive) return 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800';
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800';
      case 'orange':
        return 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800';
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200 shadow-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-800';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 shadow-sm dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-900/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">Loading Employee Details</h3>
            <p className="text-slate-500 dark:text-slate-400">Please wait while we fetch the information...</p>
          </div>
        </div>
    );
  }

  if (!employee) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center max-w-md border border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Employee Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">The employee data could not be loaded.</p>
            <button
                onClick={() => navigate('/hr/employees/record')}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Back to Employees
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <InteractiveGridPattern
                className={cn(
                    "[mask-image:radial-gradient(ellipse_at_center,_white,_transparent_70%)]",
                    "inset-0 h-full w-full"
                )}
                width={22}
                height={22}
                squares={[80, 80]}
                squaresClassName="hover:fill-emerald-400 transition-colors"
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-transparent" />

          {/* Content */}
          <div className="relative container mx-auto px-4 py-12">
            {/* Back Button */}
            <button
                onClick={() => navigate('/hr/employees/record')}
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Employees
            </button>

            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30" />
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-xl">
                  {employee.photo ? (
                      <img
                          src={`data:image/png;base64,${employee.photo}`}
                          alt={employee.empFullName}
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-emerald-400" />
                      </div>
                  )}
                </div>
              </div>

              {/* Employee Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {employee.empFullName || 'Unnamed Employee'}
                    </h1>
                    <p className="text-lg text-emerald-600 dark:text-emerald-400 font-semibold">
                      {employee.position || 'No position specified'}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                      <Building2 className="w-3.5 h-3.5" />
                      {employee.department || 'No department'}
                    </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                      <Shield className="w-3.5 h-3.5" />
                      ID: {employee.code || 'N/A'}
                    </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-4 py-2 rounded-xl text-white font-medium ${getStatusColor(employee.status)} shadow-lg`}>
                    {employee.status === 'active' ? 'Active Employee' :
                        employee.status === 'on-leave' ? 'On Leave' : 'Status Unknown'}
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <QuickStat
                      icon={<Calendar className="w-4 h-4" />}
                      label="Tenure"
                      value={employee.employmentDate ?
                          `${Math.floor((new Date().getTime() - new Date(employee.employmentDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years` :
                          'N/A'
                      }
                  />
                  <QuickStat
                      icon={<Star className="w-4 h-4" />}
                      label="Performance"
                      value={employee.performanceRating || 'N/A'}
                      suffix={employee.performanceRating ? "/5" : ""}
                  />
                  <QuickStat
                      icon={<Award className="w-4 h-4" />}
                      label="Trainings"
                      value={employee.trainings?.length || 0}
                  />
                  <QuickStat
                      icon={<Clock className="w-4 h-4" />}
                      label="Leave Balance"
                      value={employee.leaveBalance || 'N/A'}
                      suffix={employee.leaveBalance ? " days" : ""}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="container mx-auto px-4 mt-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2">
            <nav className="flex space-x-2 overflow-x-auto">
              {employeeTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap border ${
                            isActive
                                ? getTabColor(tab.color, true)
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent"
                        }`}
                    >
                      <IconComponent className={`h-4 w-4`} />
                      {tab.label}
                      {isActive && (
                          <div className={`w-1.5 h-1.5 rounded-full bg-current ml-1`} />
                      )}
                    </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
              >
                {renderTabContent(activeTab, employee)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
  );
};

// ============================================================
// RENDER TAB CONTENT
// ============================================================

const renderTabContent = (activeTab: string, employee: EmployeeDisplay) => {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab employee={employee} />;
    case 'employment':
      return <EmploymentTab employee={employee} />;
    case 'personal':
      return <PersonalTab employee={employee} />;
    case 'contact':
      return <ContactTab employee={employee} />;
    case 'emergency':
      return <EmergencyTab employee={employee} />;
    case 'performance':
      return <PerformanceTab employee={employee} />;
    case 'documents':
      return <DocumentsTab employee={employee} />;
    default:
      return null;
  }
};

// ============================================================
// TAB COMPONENTS
// ============================================================

const OverviewTab: React.FC<{ employee: EmployeeDisplay }> = ({ employee }) => (
    <div className="space-y-8">
      {/* Bio Section */}
      <Section title="About Me" icon={<User className="w-4 h-4" />}>
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl p-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{employee.bio || 'No bio available'}</p>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Section */}
        <Section title="Skills & Expertise" icon={<Award className="w-4 h-4" />}>
          <div className="flex flex-wrap gap-2">
            {(employee.skills || []).length > 0 ? (
                (employee.skills || []).map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium">
                {skill}
              </span>
                ))
            ) : (
                <p className="text-slate-500 dark:text-slate-400">No skills listed</p>
            )}
          </div>
        </Section>

        {/* Languages Section */}
        <Section title="Languages" icon={<Globe className="w-4 h-4" />}>
          <div className="flex flex-wrap gap-2">
            {(employee.languages || []).length > 0 ? (
                (employee.languages || []).map((lang: string, index: number) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                {lang}
              </span>
                ))
            ) : (
                <p className="text-slate-500 dark:text-slate-400">No languages listed</p>
            )}
          </div>
        </Section>

        {/* Education Section */}
        <Section title="Education" icon={<GraduateCap className="w-4 h-4" />}>
          <div className="space-y-4">
            {(employee.education || []).length > 0 ? (
                (employee.education || []).map((edu: any, index: number) => (
                    <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{edu.degree}</div>
                      <div className="text-slate-600 dark:text-slate-400 text-sm">{edu.institution}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs">{edu.year}</div>
                    </div>
                ))
            ) : (
                <p className="text-slate-500 dark:text-slate-400">No education information available</p>
            )}
          </div>
        </Section>

        {/* Interests Section */}
        <Section title="Interests & Hobbies" icon={<Heart className="w-4 h-4" />}>
          <div className="flex flex-wrap gap-2">
            {(employee.interests || []).length > 0 ? (
                (employee.interests || []).map((interest: string, index: number) => (
                    <span key={index} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">
                {interest}
              </span>
                ))
            ) : (
                <p className="text-slate-500 dark:text-slate-400">No interests listed</p>
            )}
          </div>
        </Section>
      </div>
    </div>
);

const EmploymentTab: React.FC<{ employee: EmployeeDisplay }> = ({ employee }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Section title="Employment Details" icon={<Briefcase className="w-4 h-4" />}>
          <InfoGrid>
            <InfoField label="Employee Code" value={employee.code} />
            <InfoField label="Employment Date" value={formatDate(employee.employmentDate)} />
            <InfoField label="Job Grade" value={employee.jobGrade} />
            <InfoField label="Position" value={employee.position} />
            <InfoField label="Department" value={employee.department} />
            <InfoField label="Reporting To" value={employee.manager} />
          </InfoGrid>
        </Section>

        <Section title="Work Arrangement" icon={<Clock className="w-4 h-4" />}>
          <InfoGrid>
            <InfoField label="Employment Type" value={employee.employmentType} />
            <InfoField label="Employment Nature" value={employee.employmentNature} />
            <InfoField label="Work Schedule" value={employee.workSchedule} />
            <InfoField label="Work Location" value={employee.workLocation} />
          </InfoGrid>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Compensation" icon={<DollarSign className="w-4 h-4" />}>
          <InfoGrid>
            {employee.salary && (
                <InfoField
                    label="Salary"
                    value={`${employee.currency || 'ETB'} ${employee.salary.toLocaleString()}`}
                />
            )}
            <InfoField label="Payment Method" value={employee.paymentMethod} />
            {employee.bankDetails && (
                <>
                  <InfoField label="Bank Name" value={employee.bankDetails.bankName} />
                  <InfoField label="Account Number" value={`••••${employee.bankDetails.accountNumber?.slice(-4)}`} />
                </>
            )}
          </InfoGrid>
        </Section>

        <Section title="Career History" icon={<TrendingUp className="w-4 h-4" />}>
          <div className="space-y-4">
            {(employee.previousRoles || []).length > 0 ? (
                (employee.previousRoles || []).map((role: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{role.jobTitle}</div>
                      <div className="text-slate-600 dark:text-slate-400 text-sm">{role.department}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs">
                        {formatDate(role.startDate)} - {role.endDate ? formatDate(role.endDate) : 'Present'}
                      </div>
                    </div>
                ))
            ) : (
                <p className="text-slate-500 dark:text-slate-400">No previous roles recorded</p>
            )}
          </div>
        </Section>
      </div>
    </div>
);

const PersonalTab: React.FC<{ employee: EmployeeDisplay }> = ({ employee }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Section title="Personal Information" icon={<User className="w-4 h-4" />}>
        <InfoGrid>
          <InfoField label="Full Name (English)" value={employee.empFullName} />
          <InfoField label="Full Name (Amharic)" value={employee.empFullNameAm} />
          <InfoField label="Gender" value={employee.gender} />
          <InfoField label="Nationality" value={employee.nationality} />
          <InfoField label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
          <InfoField label="Marital Status" value={employee.maritalStatus} />
        </InfoGrid>
      </Section>

      <Section title="System Information" icon={<Shield className="w-4 h-4" />}>
        <InfoGrid>
          <InfoField label="Employee ID" value={employee.id} />
          <InfoField label="Created Date" value={formatDate(employee.createdAt)} />
          <InfoField label="Last Updated" value={formatDate(employee.updatedAt)} />
        </InfoGrid>
      </Section>
    </div>
);

const ContactTab: React.FC<{ employee: EmployeeDisplay }> = ({ employee }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Section title="Contact Details" icon={<Mail className="w-4 h-4" />}>
        <InfoGrid>
          <InfoField label="Email Address" value={employee.email} icon={<Mail className="w-3.5 h-3.5" />} />
          <InfoField label="Phone Number" value={employee.phone} icon={<Phone className="w-3.5 h-3.5" />} />
        </InfoGrid>
      </Section>

      <Section title="Address Information" icon={<MapPin className="w-4 h-4" />}>
        <InfoGrid>
          <InfoField label="Address" value={employee.address} icon={<MapPin className="w-3.5 h-3.5" />} />
          <InfoField label="City" value={employee.city} />
          <InfoField label="Country" value={employee.country} />
          <InfoField label="Postal Code" value={employee.postalCode} />
        </InfoGrid>
      </Section>
    </div>
);

const EmergencyTab: React.FC<{ employee: EmployeeDisplay }> = ({ employee }) => (
    <div className="max-w-md mx-auto w-full">
      <Section title="Emergency Contact" icon={<Heart className="w-4 h-4" />}>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-xl p-6">
          <InfoGrid>
            <InfoField label="Full Name" value={employee.emergencyContact?.name} />
            <InfoField label="Relationship" value={employee.emergencyContact?.relationship} />
            <InfoField label="Phone Number" value={employee.emergencyContact?.phone} icon={<Phone className="w-3.5 h-3.5" />} />
          </InfoGrid>
        </div>
      </Section>
    </div>
);

const PerformanceTab: React.FC<{ employee: EmployeeDisplay }> = ({ employee }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Section title="Performance Metrics" icon={<BarChart3 className="w-4 h-4" />}>
        <InfoGrid>
          <InfoField label="Current Rating" value={employee.performanceRating ? `${employee.performanceRating}/5` : 'Not rated'} />
          <InfoField label="Last Appraisal" value={formatDate(employee.lastAppraisalDate)} />
          <InfoField label="Next Appraisal" value={formatDate(employee.nextAppraisalDate)} />
          <InfoField label="Attendance Rate" value={employee.attendancePercentage ? `${employee.attendancePercentage}%` : 'Not available'} />
          <InfoField label="Leave Balance" value={employee.leaveBalance ? `${employee.leaveBalance} days` : 'Not available'} />
        </InfoGrid>
      </Section>

      <Section title="Training & Development" icon={<Award className="w-4 h-4" />}>
        <div className="space-y-4">
          {(employee.trainings || []).length > 0 ? (
              (employee.trainings || []).map((training: any, index: number) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{training.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{training.date} • {training.duration}</p>
                        {training.certification && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{training.certification}</p>
                        )}
                      </div>
                      <StatusBadge status={training.status} />
                    </div>
                  </div>
              ))
          ) : (
              <p className="text-slate-500 dark:text-slate-400">No training records available</p>
          )}
        </div>
      </Section>
    </div>
);

const DocumentsTab: React.FC<{ employee: EmployeeDisplay }> = ({ employee }) => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No Documents Available</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">There are no documents uploaded for this employee yet.</p>
      <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all">
        <Download className="w-4 h-4" />
        Upload Documents
      </button>
    </div>
);

// ============================================================
// HELPER COMPONENTS
// ============================================================

const InfoField = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value || 'Not provided'}</p>
    </div>
);

const InfoGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
);

const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
        {icon && <div className="text-emerald-600 dark:text-emerald-400">{icon}</div>}
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
);

const QuickStat = ({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: string | number; suffix?: string }) => (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
        {icon}
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
        {value}{suffix}
      </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400';
    }
  };
  return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle()}`}>
      {status}
    </span>
  );
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not provided';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// ============================================================
// ICON COMPONENTS - FIXED
// ============================================================

const GraduateCap = ({ className }: { className?: string }) => (
    <svg
        className={className || "w-4 h-4"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
);

const DollarSign = ({ className }: { className?: string }) => (
    <svg
        className={className || "w-4 h-4"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export default EmployeeDetails;