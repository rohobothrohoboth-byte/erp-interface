import { memo } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Briefcase,
    Landmark,
    MapPin,
    Calendar,
    Mail,
    Phone,
    Globe,
    Building2,
    Award,
    CreditCard,
    Clock,
    Heart,
    Users,
    Home
} from 'lucide-react';
import { useEmpDetailBasic } from '@/modules/hr/services/employee/empDetail/empDetail.queries';
import { useLanguage } from '@/shared/i18n/LanguageContext';

// ============ Helper Components ============

const cn = (...classes: (string | undefined | false | null)[]) => {
    return classes.filter(Boolean).join(' ');
};

// Loading Skeleton Component
const DetailSkeleton = ({ rows = 4 }: { rows?: number }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
                </div>
            </div>
            <div className="p-5 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                        <div className="h-5 w-full bg-slate-100 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Error Component
const DetailError = ({ message }: { message: string }) => {
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8 text-center border border-red-200"
        >
            <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">{t.failedToLoadData || 'Failed to Load Data'}</h3>
            <p className="text-red-600">{message}</p>
        </motion.div>
    );
};

// Read Card Component
interface ReadCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    badge?: string;
    gradient?: string;
    bgGradient?: string;
}

const ReadCard = ({
                      title,
                      icon,
                      children,
                      badge,
                      gradient = "from-emerald-500 to-teal-600",
                      bgGradient = "from-emerald-50 to-teal-50"
                  }: ReadCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="relative group h-full"
        >
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

            <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
                <div className={`bg-gradient-to-r ${bgGradient} px-5 py-4 border-b border-slate-100`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2 bg-gradient-to-r ${gradient} rounded-xl shadow-md`}>
                                <div className="text-white">{icon}</div>
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                        </div>
                        {badge && (
                            <span className="px-2.5 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-slate-600 rounded-full shadow-sm">
                {badge}
              </span>
                        )}
                    </div>
                </div>

                <div className="p-5 flex-1">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};

// Grid Component
interface GridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

const Grid = ({ children, columns = 2, className }: GridProps) => {
    const colClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={cn(`grid ${colClasses[columns]} gap-4`, className)}>
            {children}
        </div>
    );
};

// Field Component
interface FieldProps {
    label: string;
    value?: string | number;
    icon?: React.ReactNode;
    highlight?: boolean;
}

const Field = ({ label, value, icon, highlight }: FieldProps) => {
    const displayValue = value !== undefined && value !== null && value !== '' ? value : '—';

    return (
        <div className="group/field">
            <div className="flex items-center gap-1.5 mb-1">
                {icon && <span className="text-slate-400 group-hover/field:text-emerald-500 transition-colors">{icon}</span>}
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                </label>
            </div>
            <p className={cn(
                "text-sm font-medium text-slate-700 break-words",
                highlight && "font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block"
            )}>
                {displayValue}
            </p>
        </div>
    );
};

// ============ Main Component ============

export const BasicInfoTab = memo(function BasicInfoTab({ employeeId }: { employeeId: string }) {
    const { t } = useLanguage();
    const { data: b, isLoading, error } = useEmpDetailBasic(employeeId);

    if (isLoading) return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <DetailSkeleton rows={4} />
                </motion.div>
            ))}
        </div>
    );

    if (error) return <DetailError message={error.message} />;
    if (!b) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Translation labels
    const personalInfo = t.personalInformation || 'Personal Information';
    const employmentDetails = t.employmentDetails || 'Employment Details';
    const salaryInfo = t.salaryInformation || 'Salary Information';
    const addressAndContact = t.addressAndContact || 'Address & Contact';
    const employeeCode = t.employeeCode || 'Employee Code';
    const gender = t.gender || 'Gender';
    const nationality = t.nationality || 'Nationality';
    const birthDate = t.birthDate || 'Birth Date';
    const maritalStatus = t.maritalStatus || 'Marital Status';
    const employmentStatus = t.employmentStatus || 'Employment Status';
    const employmentDate = t.employmentDate || 'Employment Date';
    const department = t.department || 'Department';
    const branch = t.branch || 'Branch';
    const employmentType = t.employmentType || 'Employment Type';
    const employmentNature = t.employmentNature || 'Employment Nature';
    const workArrangement = t.workArrangement || 'Work Arrangement';
    const basicSalary = t.basicSalary || 'Basic Salary';
    const jobGrade = t.jobGrade || 'Job Grade';
    const jobGradeStep = t.jobGradeStep || 'Job Grade Step';
    const currency = t.currency || 'Currency';
    const paymentFrequency = t.paymentFrequency || 'Payment Frequency';
    const effectiveDate = t.effectiveDate || 'Effective Date';
    const country = t.country || 'Country';
    const region = t.region || 'Region';
    const subcity = t.subcity || 'Subcity';
    const zone = t.zone || 'Zone';
    const woreda = t.woreda || 'Woreda';
    const kebele = t.kebele || 'Kebele';
    const houseNo = t.houseNumber || 'House No.';
    const poBox = t.poBox || 'P.O. Box';
    const telephone = t.telephone || 'Telephone';
    const fax = t.fax || 'Fax';
    const email = t.email || 'Email';
    const website = t.website || 'Website';
    const active = t.active || 'Active';

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            {/* Personal Information Card */}
            <motion.div variants={itemVariants}>
                <ReadCard
                    title={personalInfo}
                    icon={<User className="w-4 h-4" />}
                    gradient="from-blue-500 to-indigo-600"
                    bgGradient="from-blue-50 to-indigo-50"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-md opacity-30" />
                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                    <User className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">{b.empFullName || 'N/A'}</h3>
                                <p className="text-sm text-slate-500">{t.id || 'ID'}: {b.code || 'N/A'}</p>
                            </div>
                        </div>

                        <Grid columns={2}>
                            <Field
                                label={employeeCode}
                                value={b.code}
                                icon={<CreditCard className="w-3.5 h-3.5" />}
                                highlight
                            />
                            <Field
                                label={gender}
                                value={b.gender}
                                icon={<Users className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={nationality}
                                value={b.nationality}
                                icon={<Globe className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={birthDate}
                                value={b.birthDate}
                                icon={<Calendar className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={maritalStatus}
                                value={b.maritalStatus}
                                icon={<Heart className="w-3.5 h-3.5" />}
                            />
                        </Grid>
                    </div>
                </ReadCard>
            </motion.div>

            {/* Employment Details Card */}
            <motion.div variants={itemVariants}>
                <ReadCard
                    title={employmentDetails}
                    icon={<Briefcase className="w-4 h-4" />}
                    gradient="from-emerald-500 to-teal-600"
                    bgGradient="from-emerald-50 to-teal-50"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-slate-700">{employmentStatus}</span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                {b.empState || active}
                            </span>
                        </div>

                        <Grid columns={2}>
                            <Field
                                label={employmentDate}
                                value={b.empDate}
                                icon={<Calendar className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={department}
                                value={b.department}
                                icon={<Building2 className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={branch}
                                value={b.branch}
                                icon={<Building2 className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={employmentType}
                                value={b.empType}
                                icon={<Briefcase className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={employmentNature}
                                value={b.empNature}
                                icon={<Award className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={workArrangement}
                                value={b.workArr}
                                icon={<Clock className="w-3.5 h-3.5" />}
                            />
                        </Grid>
                    </div>
                </ReadCard>
            </motion.div>

            {/* Salary Information Card */}
            <motion.div variants={itemVariants}>
                <ReadCard
                    title={salaryInfo}
                    icon={<Landmark className="w-4 h-4" />}
                    gradient="from-purple-500 to-pink-600"
                    bgGradient="from-purple-50 to-pink-50"
                >
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{basicSalary}</p>
                                    <p className="text-2xl font-bold text-purple-700">
                                        {b.salary ? `${b.currency || 'ETB'} ${Number(b.salary).toLocaleString()}` : 'N/A'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Landmark className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <Grid columns={2}>
                            <Field
                                label={jobGrade}
                                value={b.jobGrade}
                                icon={<Award className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={jobGradeStep}
                                value={b.jgStep}
                                icon={<Award className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={currency}
                                value={b.currency}
                                icon={<Landmark className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={paymentFrequency}
                                value={b.salaryPayFreq}
                                icon={<Clock className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={effectiveDate}
                                value={b.effectiveFromStr}
                                icon={<Calendar className="w-3.5 h-3.5" />}
                            />
                        </Grid>
                    </div>
                </ReadCard>
            </motion.div>

            {/* Address & Contact Card */}
            <motion.div variants={itemVariants}>
                <ReadCard
                    title={addressAndContact}
                    icon={<MapPin className="w-4 h-4" />}
                    badge={b.addressType}
                    gradient="from-amber-500 to-orange-600"
                    bgGradient="from-amber-50 to-orange-50"
                >
                    <div className="space-y-4">
                        {b.addressType && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg w-fit">
                                <Home className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs font-medium text-amber-700">{b.addressType}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                            {b.telephone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-sm text-slate-600">{b.telephone}</span>
                                </div>
                            )}
                            {b.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-sm text-slate-600 truncate">{b.email}</span>
                                </div>
                            )}
                        </div>

                        <Grid columns={2}>
                            <Field label={country} value={b.country} icon={<Globe className="w-3.5 h-3.5" />} />
                            <Field label={region} value={b.region} icon={<MapPin className="w-3.5 h-3.5" />} />
                            <Field label={subcity} value={b.subcity} />
                            <Field label={zone} value={b.zone} />
                            <Field label={woreda} value={b.woreda} />
                            <Field label={kebele} value={b.kebele} />
                            <Field label={houseNo} value={b.houseNo} icon={<Home className="w-3.5 h-3.5" />} />
                            <Field label={poBox} value={b.poBox} />
                            <Field label={telephone} value={b.telephone} icon={<Phone className="w-3.5 h-3.5" />} />
                            <Field label={fax} value={b.fax} />
                            <Field label={email} value={b.email} icon={<Mail className="w-3.5 h-3.5" />} />
                            <Field label={website} value={b.website} />
                        </Grid>
                    </div>
                </ReadCard>
            </motion.div>
        </motion.div>
    );
});

export default BasicInfoTab;