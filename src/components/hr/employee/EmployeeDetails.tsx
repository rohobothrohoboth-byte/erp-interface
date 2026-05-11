import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { InteractiveGridPattern } from '../../ui/interactive-grid-pattern';
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
  VenetianMask
} from 'lucide-react';
import type { EmployeeListDto } from '../../../types/hr/employee';

// Extended type for display purposes
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

const employeeTabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'personal', label: 'Personal Info', icon: VenetianMask },
  { id: 'contact', label: 'Contact & Address', icon: MapPin },
  { id: 'emergency', label: 'Emergency Contact', icon: Heart },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const greenTheme = {
  primary: {
    light: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-200"
  }
};

const EmployeeDetails = () => {
  const { id } = useParams();
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

  const renderTabContent = () => {
    if (!employee) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard 
                icon={<Clock className="h-6 w-6" />}
                label="Tenure"
                value={employee.employmentDate ? 
                  `${Math.floor((new Date().getTime() - new Date(employee.employmentDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years` : 
                  'Not specified'
                }
              />
              <StatCard 
                icon={<Star className="h-6 w-6" />}
                label="Performance"
                value={employee.performanceRating || 'N/A'}
                suffix={employee.performanceRating ? "/5" : ""}
              />
              <StatCard 
                icon={<Award className="h-6 w-6" />}
                label="Trainings"
                value={employee.trainings?.length || 0}
              />
              <StatCard 
                icon={<Users className="h-6 w-6" />}
                label="Leave Balance"
                value={employee.leaveBalance || 'N/A'}
                suffix={employee.leaveBalance ? " days" : ""}
              />
            </div>

            {/* Bio & Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                <Section title="About Me">
                  <p className="text-gray-700 leading-relaxed">{employee.bio || 'No bio available'}</p>
                </Section>

                {/* Skills */}
                <Section title="Skills & Expertise">
                  <div className="flex flex-wrap gap-2">
                    {(employee.skills || []).length > 0 ? (
                      (employee.skills || []).map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed</p>
                    )}
                  </div>
                </Section>

                {/* Education */}
                <Section title="Education">
                  <div className="space-y-4">
                    {(employee.education || []).length > 0 ? (
                      (employee.education || []).map((edu: { degree: string; institution: string; year: string }, index: number) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <div className="font-semibold text-gray-800">{edu.degree}</div>
                          <div className="text-gray-600">{edu.institution}</div>
                          <div className="text-gray-500 text-sm">{edu.year}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No education information available</p>
                    )}
                  </div>
                </Section>
              </div>

              <div className="space-y-6">
                {/* Contact Info */}
                <Section title="Contact Information">
                  <div className="space-y-3">
                    <ContactField icon={<Mail className="h-4 w-4" />} value={employee.email} />
                    <ContactField icon={<Phone className="h-4 w-4" />} value={employee.phone} />
                    <ContactField icon={<MapPin className="h-4 w-4" />} value={employee.address} />
                  </div>
                </Section>

                {/* Organization */}
                <Section title="Organization">
                  <div className="space-y-3">
                    <InfoField label="Department" value={employee.department} />
                    <InfoField label="Position" value={employee.position} />
                    <InfoField label="Team" value={employee.team} />
                    <InfoField label="Work Location" value={employee.workLocation} />
                  </div>
                </Section>

                {/* Languages & Interests */}
                <Section title="Languages">
                  <div className="flex flex-wrap gap-2">
                    {(employee.languages || []).length > 0 ? (
                      (employee.languages || []).map((lang: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No languages listed</p>
                    )}
                  </div>
                </Section>
              </div>
            </div>
          </div>
        );

      case 'employment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section title="Employment Details">
                <InfoField label="Employee Code" value={employee.code} />
                <InfoField label="Employment Date" value={formatDate(employee.employmentDate)} />
                <InfoField label="Job Grade" value={employee.jobGrade} />
                <InfoField label="Position" value={employee.position} />
                <InfoField label="Department" value={employee.department} />
              </Section>
              
              <Section title="Work Arrangement">
                <InfoField label="Employment Type" value={employee.employmentType} />
                <InfoField label="Employment Nature" value={employee.employmentNature} />
                <InfoField label="Work Schedule" value={employee.workSchedule} />
                <InfoField label="Work Location" value={employee.workLocation} />
              </Section>
            </div>
            
            <div className="space-y-6">
              <Section title="Compensation">
                {employee.salary && (
                  <InfoField 
                    label="Salary" 
                    value={`${employee.currency || ''} ${employee.salary.toLocaleString()}`} 
                  />
                )}
                {employee.paymentMethod && (
                  <InfoField label="Payment Method" value={employee.paymentMethod} />
                )}
                {employee.bankDetails && (
                  <>
                    <InfoField label="Bank Name" value={employee.bankDetails.bankName} />
                    <InfoField label="Account Number" value={`••••${employee.bankDetails.accountNumber?.slice(-4)}`} />
                  </>
                )}
              </Section>

              <Section title="Career History">
                <div className="space-y-4">
                  {(employee.previousRoles || []).length > 0 ? (
                    (employee.previousRoles || []).map((role: { jobTitle: string; department: string; startDate: string; endDate: string; responsibilities: string }, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="font-semibold text-gray-800">{role.jobTitle}</div>
                        <div className="text-gray-600">{role.department}</div>
                        <div className="text-gray-500 text-sm">
                          {formatDate(role.startDate)} - {role.endDate ? formatDate(role.endDate) : 'Present'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No previous roles recorded</p>
                  )}
                </div>
              </Section>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section title="Personal Information">
                <InfoField label="Full Name (English)" value={employee.empFullName} />
                <InfoField label="Full Name (Amharic)" value={employee.empFullNameAm} />
                <InfoField label="Gender" value={employee.gender} />
                <InfoField label="Nationality" value={employee.nationality} />
                <InfoField label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                <InfoField label="Marital Status" value={employee.maritalStatus} />
              </Section>
            </div>
            
            <div className="space-y-6">
              <Section title="Additional Information">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(employee.interests || []).length > 0 ? (
                    (employee.interests || []).map((interest: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests listed</p>
                  )}
                </div>
              </Section>

              <Section title="System Information">
                <InfoField label="Created Date" value={formatDate(employee.createdAt)} />
                <InfoField label="Last Updated" value={formatDate(employee.updatedAt)} />
              </Section>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Section title="Contact Details">
                <InfoField label="Email Address" value={employee.email} icon={<Mail className="h-4 w-4" />} />
                <InfoField label="Phone Number" value={employee.phone} icon={<Phone className="h-4 w-4" />} />
              </Section>
              
              <Section title="Address Information">
                <InfoField label="Address" value={employee.address} icon={<MapPin className="h-4 w-4" />} />
                {employee.city && <InfoField label="City" value={employee.city} />}
                {employee.country && <InfoField label="Country" value={employee.country} />}
              </Section>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section title="Emergency Contact Details">
                <InfoField label="Full Name" value={employee.emergencyContact?.name} />
                <InfoField label="Relationship" value={employee.emergencyContact?.relationship} />
                <InfoField label="Phone Number" value={employee.emergencyContact?.phone} />
              </Section>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section title="Performance Metrics">
                <InfoField label="Current Rating" value={employee.performanceRating ? `${employee.performanceRating}/5` : 'Not rated'} />
                <InfoField label="Last Appraisal" value={formatDate(employee.lastAppraisalDate)} />
                <InfoField label="Next Appraisal" value={formatDate(employee.nextAppraisalDate)} />
                <InfoField label="Attendance Rate" value={employee.attendancePercentage ? `${employee.attendancePercentage}%` : 'Not available'} />
                <InfoField label="Leave Balance" value={employee.leaveBalance ? `${employee.leaveBalance} days` : 'Not available'} />
              </Section>
            </div>
            
            <div className="space-y-6">
              <Section title="Training & Development">
                <div className="space-y-4">
                  {(employee.trainings || []).length > 0 ? (
                    (employee.trainings || []).map((training: { name: string; date: string; duration: string; status: string; certification?: string }, index: number) => (
                      <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{training.name}</p>
                            <p className="text-sm text-gray-500">{training.date} • {training.duration}</p>
                            {training.certification && (
                              <p className="text-sm text-blue-600">{training.certification}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            training.status === "Completed" ? "bg-green-100 text-green-800" :
                            training.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {training.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No training records available</p>
                  )}
                </div>
              </Section>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <Section title="Employee Documents">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No documents available</p>
                <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mt-3 mx-auto">
                  <Download className="h-4 w-4" />
                  Upload Documents
                </button>
              </div>
            </Section>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Employee Not Found</h1>
          <p>The employee data could not be loaded.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8 -mt-6">
      <div className="relative -mt-6 w-full flex flex-col items-center justify-center overflow-hidden rounded-xl">
        {/* Decorative Pattern Layer */}
        <InteractiveGridPattern
          className={cn(
            "[mask-image:radial-gradient(ellipse_at_center,_grey,_transparent_70%)]",
            "inset-0 h-full w-full skew-y-6"
          )}
          width={22}
          height={22}
          squares={[80, 80]}
          squaresClassName="hover:fill-green-400"
        />

        {/* Floating Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-green-200 blur-[90px] opacity-30" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center p-10 flex flex-col items-center">
          {/* Profile Image - Updated base64 handling */}
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 transform transition-transform duration-500 hover:scale-105">
            {employee.photo ? (
              <img 
                src={`data:image/png;base64,${employee.photo}`}
                alt={employee.empFullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Text */}
          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
            {employee.empFullName || 'Unnamed Employee'}
          </h1>
          <p className="text-green-600 font-semibold mt-1 text-lg">
            {employee.position || 'No position specified'}
          </p>
          <p className="text-gray-600 mt-1">
            {employee.department || 'No department'} • {employee.code || 'No code'}
          </p>
          <div className="mt-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              employee.status === 'active' ? 'bg-green-100 text-green-800' : 
              employee.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {employee.status === 'active' ? 'Active' : 
               employee.status === 'on-leave' ? 'On Leave' : 'Status Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-8 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-2">
          <nav className="flex space-x-2 overflow-x-auto">
            {employeeTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? `${greenTheme.primary.light} border border-green-300 text-green-700 shadow-sm`
                      : "text-gray-500 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <IconComponent
                    className={`h-5 w-5 ${
                      isActive ? greenTheme.primary.icon : "text-gray-400"
                    }`}
                  />
                  {tab.label}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-green-500 ml-1"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Reusable Components
const InfoField = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
  <div className="flex flex-col space-y-1 mb-4">
    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <div className="text-gray-800 font-medium">{value || 'Not provided'}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

const StatCard = ({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: string | number; suffix?: string }) => (
  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-100 text-center">
    <div className="flex justify-center text-green-600 mb-2">
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-900">
      {value}{suffix}
    </div>
    <div className="text-sm text-gray-600 mt-1">{label}</div>
  </div>
);

const ContactField = ({ icon, value }: { icon: React.ReactNode; value?: string }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="text-gray-400">{icon}</div>
    <span className="text-gray-700">{value || 'Not provided'}</span>
  </div>
);

// Helper function to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not provided';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export default EmployeeDetails;