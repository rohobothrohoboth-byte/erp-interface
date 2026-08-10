import { memo } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Landmark,
    Calendar,
    Heart,
    Shield,
    CreditCard,
    Banknote,
    Award,
    User,
    MapPin,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useEmpDetailBio } from '@/modules/hr/services/employee/empDetail/empDetail.queries';
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
                <AlertCircle className="w-8 h-8 text-red-600" />
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
    value?: string | number | React.ReactNode;
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

// Status Badge Component
const StatusBadge = ({ status, type }: { status?: string; type?: 'birth' | 'marriage' }) => {
    const { t } = useLanguage();
    if (!status) return null;

    const isYes = status.toLowerCase() === 'yes';
    const yesText = t.yes || 'Yes';
    const noText = t.no || 'No';
    const displayStatus = isYes ? yesText : noText;

    const colors = type === 'birth'
        ? { bg: isYes ? 'bg-emerald-100' : 'bg-amber-100', text: isYes ? 'text-emerald-700' : 'text-amber-700', border: isYes ? 'border-emerald-200' : 'border-amber-200' }
        : { bg: isYes ? 'bg-blue-100' : 'bg-amber-100', text: isYes ? 'text-blue-700' : 'text-amber-700', border: isYes ? 'border-blue-200' : 'border-amber-200' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {isYes ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {displayStatus}
        </span>
    );
};

// ============ Main Component ============

export const BiographicalTab = memo(function BiographicalTab({ employeeId }: { employeeId: string }) {
    const { t } = useLanguage();
    const { data: bio, isLoading, error } = useEmpDetailBio(employeeId);

    if (isLoading) return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <DetailSkeleton rows={4} />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <DetailSkeleton rows={3} />
            </motion.div>
        </div>
    );

    if (error) return <DetailError message={error.message} />;
    if (!bio) return null;

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
    const personalDetails = t.personalDetails || 'Personal Details';
    const financialInformation = t.financialInformation || 'Financial Information';
    const birthLocation = t.birthLocation || 'Birth Location';
    const mothersFullName = t.mothersFullName || "Mother's Full Name";
    const hasBirthCertificate = t.hasBirthCertificate || 'Has Birth Certificate';
    const hasMarriageCertificate = t.hasMarriageCertificate || 'Has Marriage Certificate';
    const taxIdentificationNumber = t.taxIdentificationNumber || 'Tax Identification Number';
    const bankAccountNumber = t.bankAccountNumber || 'Bank Account Number';
    const pensionNumber = t.pensionNumber || 'Pension Number';
    const financialInfoNote = t.financialInfoNote || 'Financial information is used for payroll and tax purposes only.';

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            {/* Personal Details Card */}
            <motion.div variants={itemVariants}>
                <ReadCard
                    title={personalDetails}
                    icon={<FileText className="w-4 h-4" />}
                    gradient="from-blue-500 to-indigo-600"
                    bgGradient="from-blue-50 to-indigo-50"
                >
                    <div className="space-y-4">
                        {/* Birth Location Highlight */}
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{birthLocation}</p>
                                <p className="text-sm font-semibold text-slate-800">{bio.birthLocation || '—'}</p>
                            </div>
                        </div>

                        <Grid columns={2}>
                            <Field
                                label={mothersFullName}
                                value={bio.motherFullName}
                                icon={<Heart className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={hasBirthCertificate}
                                value={<StatusBadge status={bio.hasBirthCert} type="birth" />}
                                icon={<Shield className="w-3.5 h-3.5" />}
                            />
                            <Field
                                label={hasMarriageCertificate}
                                value={<StatusBadge status={bio.hasMarriageCert} type="marriage" />}
                                icon={<Shield className="w-3.5 h-3.5" />}
                            />
                        </Grid>
                    </div>
                </ReadCard>
            </motion.div>

            {/* Financial Information Card */}
            <motion.div variants={itemVariants}>
                <ReadCard
                    title={financialInformation}
                    icon={<Landmark className="w-4 h-4" />}
                    gradient="from-purple-500 to-pink-600"
                    bgGradient="from-purple-50 to-pink-50"
                >
                    <div className="space-y-4">
                        {/* TIN Number Highlight */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{taxIdentificationNumber}</span>
                            </div>
                            <span className="font-mono text-sm font-semibold text-purple-700 bg-white px-2 py-1 rounded-md">
                                {bio.tin || '—'}
                            </span>
                        </div>

                        <Grid columns={2}>
                            <Field
                                label={bankAccountNumber}
                                value={bio.bankAccountNo}
                                icon={<Banknote className="w-3.5 h-3.5" />}
                                highlight
                            />
                            <Field
                                label={pensionNumber}
                                value={bio.pensionNumber}
                                icon={<Award className="w-3.5 h-3.5" />}
                                highlight
                            />
                        </Grid>

                        {/* Info Note */}
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-start gap-2">
                                <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                <p className="text-xs text-slate-500">
                                    {financialInfoNote}
                                </p>
                            </div>
                        </div>
                    </div>
                </ReadCard>
            </motion.div>
        </motion.div>
    );
});

export default BiographicalTab;