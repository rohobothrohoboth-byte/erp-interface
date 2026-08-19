import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  Shield,
  FileText,
  Heart,
  Users,
  FolderOpen,
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmpPhotoRect } from '@/shared/components/ui/EmpPhoto';
import { empStateColors } from '@/modules/hr/components/employee/EmployeeDetail/shared';
import type { EmpDetailPhoto } from '@/modules/hr/types/employee/empDetail';
import type { EmpPhotoRes } from '@/modules/hr/types/employee/empPhoto';
import { useEmpDetailInfo, useEmpDetailPhoto } from '@/modules/hr/services/employee/empDetail/empDetail.queries';
import { useLanguage } from '@/shared/i18n/LanguageContext';

const TAB_ICONS: Record<string, React.ElementType> = {
  User, Briefcase, Shield, FileText, Heart, Users, FolderOpen,
};

export const EMP_DETAIL_TABS = (t: any) => [
  { id: 'overview',  label: t.overview || 'Overview',         icon: 'User',       color: 'emerald' },
  { id: 'basic',     label: t.basicInfo || 'Basic Info',       icon: 'Briefcase',  color: 'blue' },
  { id: 'bio',       label: t.biographical || 'Biographical',     icon: 'FileText',   color: 'purple' },
  { id: 'emergency', label: t.emergency || 'Emergency',        icon: 'Heart',      color: 'rose' },
  { id: 'family',    label: t.family || 'Family',           icon: 'Users',      color: 'indigo' },
  { id: 'guarantor', label: t.guarantor || 'Guarantor',        icon: 'Shield',     color: 'amber' },
  { id: 'documents', label: t.documents || 'Documents',        icon: 'FolderOpen', color: 'slate' },
];

// Get tab color styles
const getTabColorStyles = (color: string, isActive: boolean) => {
  if (!isActive) return 'text-slate-500 hover:text-slate-700 hover:bg-slate-50';

  switch (color) {
    case 'emerald':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm';
    case 'blue':
      return 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm';
    case 'purple':
      return 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm';
    case 'rose':
      return 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm';
    case 'indigo':
      return 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm';
    case 'amber':
      return 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-700 shadow-sm';
  }
};

const getTabIconColor = (color: string, isActive: boolean) => {
  if (!isActive) return 'text-slate-400';

  switch (color) {
    case 'emerald': return 'text-emerald-600';
    case 'blue': return 'text-blue-600';
    case 'purple': return 'text-purple-600';
    case 'rose': return 'text-rose-600';
    case 'indigo': return 'text-indigo-600';
    case 'amber': return 'text-amber-600';
    default: return 'text-slate-600';
  }
};

// ── Hero ───────────────────────────────────────────────────────────────────
const EmpDetailHero = memo(function EmpDetailHero({ employeeId }: { employeeId: string }) {
  const { t } = useLanguage();
  const { data: info }      = useEmpDetailInfo(employeeId);
  const { data: photoData } = useEmpDetailPhoto(employeeId);

  const photo: EmpPhotoRes | undefined = photoData
      ? {
        id: (photoData as EmpDetailPhoto).id,
        fileName: (photoData as EmpDetailPhoto).fileName,
        contentType: (photoData as EmpDetailPhoto).contentType,
        photoSize: (photoData as EmpDetailPhoto).photoSize,
        photo: (photoData as EmpDetailPhoto).photo
      }
      : undefined;

  const stateKey = info?.empState
      ? Object.entries(empStateColors).find(([, v]) =>
      v.includes(info.empState.toLowerCase().replace(/\s/g, '-'))
  )?.[0] ?? '0'
      : '0';

  const navigate = useNavigate();
  const handleBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/hr/employees/record');
  }, [navigate]);

  const positionLabel = info?.position || t.position || 'Position';
  const idLabel = t.id || 'ID';

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl mb-6 shadow-xl border border-slate-200"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-transparent" />

        {/* Diagonal mesh grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="detail-mesh" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <line x1="0" y1="0" x2="0" y2="36" stroke="#059669" strokeWidth="1" strokeOpacity="0.12" />
              <line x1="0" y1="0" x2="36" y2="0" stroke="#059669" strokeWidth="1" strokeOpacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#detail-mesh)" />
        </svg>

        {/* Floating Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 py-5">
          {/* Back Button */}
          <div className="mb-4">
            <motion.button
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg hover:bg-white hover:border-emerald-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.backToEmployees || 'Back to Employees'}
            </motion.button>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 mt-2">
            {/* Avatar */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="shrink-0"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-lg opacity-30" />
                <div className="relative rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-white">
                  <EmpPhotoRect width={120} height={136} photo={photo} name={info?.fullName ?? ''} />
                </div>
              </div>
              {info?.empState && (
                  <div className="mt-3 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-white/90 backdrop-blur-sm shadow-sm ${empStateColors[stateKey]}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
                  {info.empState}
                </span>
                  </div>
              )}
            </motion.div>

            {/* Employee Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight"
              >
                {info?.fullName ? info.fullName : <span className="inline-block h-8 w-48 bg-emerald-100 rounded-lg animate-pulse" />}
              </motion.h1>

              {info?.fullNameAm && (
                  <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="text-sm text-slate-500 mt-1"
                  >
                    {info.fullNameAm}
                  </motion.p>
              )}

              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3"
              >
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  <Briefcase className="w-3 h-3" />
                  {positionLabel}
                </span>

                {info?.department && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    <Users className="w-3 h-3" />
                      {info.department}
                  </span>
                )}

                {info?.employeeCode && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded-full">
                    <Shield className="w-3 h-3" />
                      {idLabel}: {info.employeeCode}
                  </span>
                )}
              </motion.div>
            </div>

            {/* Quick Stats (Optional) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="shrink-0 hidden lg:block"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t.joined || 'Joined'}: {info?.joinDate || 'N/A'}</span>
                  </div>
                  {info?.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[180px]">{info.email}</span>
                      </div>
                  )}
                  {info?.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{info.phone}</span>
                      </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
  );
});

// ── Tab bar ────────────────────────────────────────────────────────────────
const EmpDetailTabBar = memo(function EmpDetailTabBar({
                                                        activeTab,
                                                        onTabChange,
                                                      }: {
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  const { t } = useLanguage();
  const tabs = EMP_DETAIL_TABS(t);

  return (
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-1.5">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map(({ id, label, icon, color }) => {
              const Icon = TAB_ICONS[icon];
              const isActive = activeTab === id;

              return (
                  <motion.button
                      key={id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTabChange(id)}
                      className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                          isActive
                              ? getTabColorStyles(color, true)
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? getTabIconColor(color, true) : 'text-slate-400'}`} />
                    {label}
                    {isActive && (
                        <motion.span
                            layoutId="activeTabIndicator"
                            className={`w-1.5 h-1.5 rounded-full ${
                                color === 'emerald' ? 'bg-emerald-500' :
                                    color === 'blue' ? 'bg-blue-500' :
                                        color === 'purple' ? 'bg-purple-500' :
                                            color === 'rose' ? 'bg-rose-500' :
                                                color === 'indigo' ? 'bg-indigo-500' :
                                                    color === 'amber' ? 'bg-amber-500' :
                                                        'bg-slate-500'
                            } ml-1`}
                        />
                    )}
                  </motion.button>
              );
            })}
          </nav>
        </div>
      </motion.div>
  );
});

// ── Public export ──────────────────────────────────────────────────────────
export const EmpDetailHeader = memo(function EmpDetailHeader({
                                                               employeeId,
                                                               activeTab,
                                                               onTabChange,
                                                             }: {
  employeeId: string;
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
      <>
        <EmpDetailHero employeeId={employeeId} />
        <EmpDetailTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </>
  );
});

export default EmpDetailHeader;