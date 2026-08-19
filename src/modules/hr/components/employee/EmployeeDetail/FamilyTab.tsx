import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ChevronDown,
  User,
  Heart,
  Globe,
  Calendar,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  UserPlus,
  Baby,
  GraduationCap,
  Sparkles,
  Shield,
  Award
} from 'lucide-react';
import { useEmpDetailFamily } from '@/modules/hr/services/employee/empDetail/empDetail.queries';
import type { EmpDetailFamilyMember } from '@/modules/hr/types/employee/empDetail';
import { useLanguage } from '@/shared/i18n/LanguageContext';

// ============ Helper Components ============

const cn = (...classes: (string | undefined | false | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Loading Skeleton Component
const DetailSkeleton = ({ rows = 3 }: { rows?: number }) => {
  const { t } = useLanguage();
  return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                      <div className="h-3 bg-slate-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="w-5 h-5 bg-slate-200 rounded" />
                </div>
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
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">{t.failedToLoadFamilyData || 'Failed to Load Family Data'}</h3>
        <p className="text-red-600">{message}</p>
        <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          {t.tryAgain || 'Try Again'}
        </button>
      </motion.div>
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
          {icon && <span className="text-slate-400 group-hover/field:text-purple-500 transition-colors">{icon}</span>}
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </label>
        </div>
        <p className={cn(
            "text-sm font-medium text-slate-700 break-words",
            highlight && "font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block"
        )}>
          {displayValue}
        </p>
      </div>
  );
};

// Family Member Card Component
const FamilyMemberCard = ({ member, isOpen, onToggle, index }: {
  member: EmpDetailFamilyMember;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) => {
  const { t } = useLanguage();
  const fullName = member.fullName || [member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ') || t.unknown || 'Unknown';

  const getRelationIcon = (relation: string) => {
    const r = relation?.toLowerCase() || '';
    if (r.includes('spouse') || r.includes('wife') || r.includes('husband')) return Heart;
    if (r.includes('child') || r.includes('son') || r.includes('daughter')) return Baby;
    if (r.includes('parent') || r.includes('father') || r.includes('mother')) return UserCheck;
    if (r.includes('sibling') || r.includes('brother') || r.includes('sister')) return Users;
    return User;
  };

  const getRelationColor = (relation: string) => {
    const r = relation?.toLowerCase() || '';
    if (r.includes('spouse') || r.includes('wife') || r.includes('husband')) return 'from-rose-500 to-pink-600';
    if (r.includes('child') || r.includes('son') || r.includes('daughter')) return 'from-blue-500 to-cyan-600';
    if (r.includes('parent') || r.includes('father') || r.includes('mother')) return 'from-emerald-500 to-teal-600';
    if (r.includes('sibling') || r.includes('brother') || r.includes('sister')) return 'from-purple-500 to-indigo-600';
    return 'from-slate-500 to-gray-600';
  };

  const getRelationBadgeColor = (relation: string) => {
    const r = relation?.toLowerCase() || '';
    if (r.includes('spouse')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (r.includes('child')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (r.includes('parent')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (r.includes('sibling')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getRelationLabel = (relation: string): string => {
    const r = relation?.toLowerCase() || '';
    if (r.includes('spouse')) return t.spouse || 'Spouse';
    if (r.includes('child')) return t.child || 'Child';
    if (r.includes('parent')) return t.parent || 'Parent';
    if (r.includes('sibling')) return t.sibling || 'Sibling';
    return relation || t.family || 'Family';
  };

  const RelationIcon = getRelationIcon(member.relation);
  const relationColor = getRelationColor(member.relation);
  const relationBadgeColor = getRelationBadgeColor(member.relation);
  const relationLabel = getRelationLabel(member.relation);

  return (
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isOpen ? 'border-purple-300 shadow-lg' : 'border-slate-200 hover:border-purple-200 hover:shadow-md'
          }`}
      >
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${relationColor} rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${relationColor} flex items-center justify-center shadow-md`}>
              <span className="text-white text-sm font-bold">
                {(member.firstName || '?').charAt(0).toUpperCase()}
              </span>
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">{fullName}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${relationBadgeColor}`}>
                  <RelationIcon className="w-3 h-3" />
                  <span>{relationLabel}</span>
                </div>
              </div>
            </div>
          </div>
          <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-3 border-t border-purple-100 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                  {/* Member Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <Field label={t.fullName || 'Full Name'} value={fullName} icon={<User className="w-3.5 h-3.5" />} highlight />
                    <Field label={t.nationality || 'Nationality'} value={member.nationality} icon={<Globe className="w-3.5 h-3.5" />} />
                    <Field label={t.gender || 'Gender'} value={member.gender} icon={<Users className="w-3.5 h-3.5" />} />
                    <Field label={t.relation || 'Relation'} value={relationLabel} icon={<Heart className="w-3.5 h-3.5" />} />
                    {member.dateOfBirth && (
                        <Field label={t.dateOfBirth || 'Date of Birth'} value={member.dateOfBirth} icon={<Calendar className="w-3.5 h-3.5" />} />
                    )}
                    {member.occupation && (
                        <Field label={t.occupation || 'Occupation'} value={member.occupation} icon={<GraduationCap className="w-3.5 h-3.5" />} />
                    )}
                    {member.phone && (
                        <Field label={t.phone || 'Phone'} value={member.phone} icon={<Phone className="w-3.5 h-3.5" />} />
                    )}
                    {member.email && (
                        <Field label={t.email || 'Email'} value={member.email} icon={<Mail className="w-3.5 h-3.5" />} />
                    )}
                  </div>

                  {/* Additional Info Note */}
                  <div className="mt-4 pt-3 border-t border-purple-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Shield className="w-3 h-3 text-purple-500" />
                      <span>{t.verifiedFamilyMember || 'Verified family member for benefits eligibility'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
};

// ============ Main Component ============

export const FamilyTab = memo(function FamilyTab({ employeeId }: { employeeId: string }) {
  const { t } = useLanguage();
  const { data, isLoading, error } = useEmpDetailFamily(employeeId);
  const [openId, setOpenId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  if (isLoading) return <DetailSkeleton rows={3} />;
  if (error) return <DetailError message={error.message} />;

  const members: EmpDetailFamilyMember[] = data?.family ?? [];

  // Calculate family stats
  const totalMembers = members.length;
  const spouseCount = members.filter(m => m.relation?.toLowerCase().includes('spouse')).length;
  const childrenCount = members.filter(m => m.relation?.toLowerCase().includes('child')).length;
  const dependentCount = members.filter(m => m.relation?.toLowerCase().includes('child') || m.relation?.toLowerCase().includes('spouse')).length;

  // Translation labels
  const familyMembers = t.familyMembers || 'Family Members';
  const immediateFamily = t.immediateFamily || 'Immediate family and dependents';
  const member = t.member || 'member';
  const membersText = t.members || 'members';
  const dependentsEligible = t.dependentsEligible || 'dependents eligible for benefits';
  const verifiedFamilyRecords = t.verifiedFamilyRecords || 'Verified family records';
  const noFamilyMembers = t.noFamilyMembers || 'No Family Members';
  const noFamilyMembersDesc = t.noFamilyMembersDesc || 'No family members have been added for this employee yet. Family information helps with benefits administration.';
  const immediateFamilyListed = t.immediateFamilyListed || 'Immediate family members listed';
  const forDependentBenefits = t.forDependentBenefits || 'For dependent benefits and emergency contact';
  const informationIsConfidential = t.informationIsConfidential || 'Information is confidential';

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
      >
        {/* Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 blur-lg opacity-20 rounded-xl" />
                  <div className="relative p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{familyMembers}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{immediateFamily}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Stats Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-xs font-medium text-slate-600">
                      {totalMembers} {totalMembers === 1 ? member : membersText}
                    </span>
                  </div>
                  {spouseCount > 0 && (
                      <>
                        <span className="w-px h-3 bg-slate-300" />
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" />
                          <span className="text-xs text-slate-500">{spouseCount}</span>
                        </div>
                      </>
                  )}
                  {childrenCount > 0 && (
                      <>
                        <span className="w-px h-3 bg-slate-300" />
                        <div className="flex items-center gap-1">
                          <Baby className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-slate-500">{childrenCount}</span>
                        </div>
                      </>
                  )}
                </div>
              </div>
            </div>

            {/* Family Summary Banner */}
            {totalMembers > 0 && (
                <div className="mt-4 pt-3 border-t border-purple-100">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{dependentCount} {dependentsEligible}</span>
                    </div>
                    <div className="w-px h-3 bg-purple-200" />
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{verifiedFamilyRecords}</span>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {members.length === 0 ? (
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-10" />
                  <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-full mb-4">
                    <Users className="w-14 h-14 text-purple-400" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">{noFamilyMembers}</h4>
                <p className="text-sm text-slate-400 max-w-sm">
                  {noFamilyMembersDesc}
                </p>
              </motion.div>
          ) : (
              <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
              >
                {members.map((member, index) => (
                    <FamilyMemberCard
                        key={member.id}
                        member={member}
                        isOpen={openId === member.id}
                        onToggle={() => setOpenId(openId === member.id ? null : member.id)}
                        index={index}
                    />
                ))}
              </motion.div>
          )}
        </div>

        {/* Footer (if members exist) */}
        {members.length > 0 && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-3 border-t border-slate-100"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{immediateFamilyListed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5 text-purple-500" />
                  <span>{forDependentBenefits}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{informationIsConfidential}</span>
                </div>
              </div>
            </motion.div>
        )}
      </motion.div>
  );
});

export default FamilyTab;