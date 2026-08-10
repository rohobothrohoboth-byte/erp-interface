import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Heart,
  Phone,
  Mail,
  Users,
  Globe,
  Building2,
  Home,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useEmpDetailContact } from '@/modules/hr/services/employee/empDetail/empDetail.queries';
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

// Contact Summary Card Component
const ContactSummary = ({ telephone, email }: { telephone?: string; email?: string }) => {
  const { t } = useLanguage();
  if (!telephone && !email) return null;

  return (
      <div className="flex flex-wrap gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
        {telephone && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{telephone}</span>
            </div>
        )}
        {email && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">{email}</span>
            </div>
        )}
      </div>
  );
};

// ============ Main Component ============

export const EmergencyTab = memo(function EmergencyTab({ employeeId }: { employeeId: string }) {
  const { t } = useLanguage();
  const { data, isLoading, error } = useEmpDetailContact(employeeId);

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

  if (isLoading) return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
          <DetailSkeleton rows={7} />
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
          <DetailSkeleton rows={10} />
        </motion.div>
      </div>
  );

  if (error) return <DetailError message={error.message} />;

  const contact = data?.contact;

  if (!contact) return (
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center"
      >
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">{t.noEmergencyContact || 'No Emergency Contact'}</h3>
        <p className="text-sm text-slate-400">{t.noEmergencyContactDesc || 'No emergency contact information has been added for this employee.'}</p>
      </motion.div>
  );

  // Translation labels
  const emergencyContact = t.emergencyContact || 'Emergency Contact';
  const firstName = t.firstName || 'First Name';
  const middleName = t.middleName || 'Middle Name';
  const lastName = t.lastName || 'Last Name';
  const nationality = t.nationality || 'Nationality';
  const gender = t.gender || 'Gender';
  const relation = t.relation || 'Relation';
  const telephone = t.telephone || 'Telephone';
  const email = t.email || 'Email';
  const addressInformation = t.addressInformation || 'Address Information';
  const country = t.country || 'Country';
  const region = t.region || 'Region';
  const subcity = t.subcity || 'Subcity';
  const zone = t.zone || 'Zone';
  const woreda = t.woreda || 'Woreda';
  const kebele = t.kebele || 'Kebele';
  const houseNumber = t.houseNumber || 'House Number';
  const poBox = t.poBox || 'P.O. Box';
  const fax = t.fax || 'Fax';
  const website = t.website || 'Website';
  const primaryLocation = t.primaryLocation || 'Primary Location';
  const emergencyContactVerified = t.emergencyContactVerified || 'Emergency contact verified';

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
              title={emergencyContact}
              icon={<Heart className="w-4 h-4" />}
              gradient="from-rose-500 to-pink-600"
              bgGradient="from-rose-50 to-pink-50"
          >
            <div className="space-y-4">
              {/* Contact Person Highlight */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-md opacity-30" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-rose-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {contact.firstName} {contact.middleName} {contact.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{contact.relation}</p>
                </div>
              </div>

              {/* Contact Summary */}
              <ContactSummary telephone={contact.telephone} email={contact.email} />

              <Grid columns={2}>
                <Field label={firstName} value={contact.firstName} icon={<User className="w-3.5 h-3.5" />} />
                <Field label={middleName} value={contact.middleName} icon={<User className="w-3.5 h-3.5" />} />
                <Field label={lastName} value={contact.lastName} icon={<User className="w-3.5 h-3.5" />} />
                <Field label={nationality} value={contact.nationality} icon={<Globe className="w-3.5 h-3.5" />} />
                <Field label={gender} value={contact.gender} icon={<Users className="w-3.5 h-3.5" />} />
                <Field label={relation} value={contact.relation} icon={<Heart className="w-3.5 h-3.5" />} />
                <Field label={telephone} value={contact.telephone} icon={<Phone className="w-3.5 h-3.5" />} />
                <Field label={email} value={contact.email} icon={<Mail className="w-3.5 h-3.5" />} />
              </Grid>

              {/* Status Indicator */}
              <div className="mt-3 pt-3 border-t border-rose-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{emergencyContactVerified}</span>
                </div>
              </div>
            </div>
          </ReadCard>
        </motion.div>

        {/* Address Card */}
        <motion.div variants={itemVariants}>
          <ReadCard
              title={addressInformation}
              icon={<MapPin className="w-4 h-4" />}
              badge={contact.addressType}
              gradient="from-amber-500 to-orange-600"
              bgGradient="from-amber-50 to-orange-50"
          >
            <div className="space-y-4">
              {/* Address Type Badge */}
              {contact.addressType && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg w-fit">
                    <Home className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">{contact.addressType}</span>
                  </div>
              )}

              {/* Location Summary */}
              {(contact.country || contact.region) && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg">
                      <MapPin className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {[contact.region, contact.country].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-xs text-slate-500">{primaryLocation}</p>
                    </div>
                  </div>
              )}

              <Grid columns={2}>
                <Field label={country} value={contact.country} icon={<Globe className="w-3.5 h-3.5" />} />
                <Field label={region} value={contact.region} icon={<MapPin className="w-3.5 h-3.5" />} />
                <Field label={subcity} value={contact.subcity} icon={<Building2 className="w-3.5 h-3.5" />} />
                <Field label={zone} value={contact.zone} />
                <Field label={woreda} value={contact.woreda} />
                <Field label={kebele} value={contact.kebele} />
                <Field label={houseNumber} value={contact.houseNo} icon={<Home className="w-3.5 h-3.5" />} />
                <Field label={poBox} value={contact.poBox} />
                <Field label={fax} value={contact.fax} />
                <Field label={website} value={contact.website} />
              </Grid>
            </div>
          </ReadCard>
        </motion.div>
      </motion.div>
  );
});

export default EmergencyTab;