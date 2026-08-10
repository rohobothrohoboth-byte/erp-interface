import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  UserX,
  PauseCircle,
  XCircle,
  Menu,
  AlertTriangle,
  BedDouble,
  User,
  Briefcase,
  Shield,
  Stamp,
  PenTool,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { EmpPhotoRect } from '@/shared/components/ui/EmpPhoto';
import { empStateColors } from '@/modules/profile/components/shared';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import {
  useEmpDetailInfo,
  useEmpDetailPhoto,
} from '@/modules/hr/services/employee/empDetail/empDetail.queries';
import type { EmpDetailPhoto } from '@/modules/hr/types/employee/empDetail';
import type { EmpPhotoRes } from '@/modules/hr/types/employee/empPhoto';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  color?: string;
}

interface EditEmployeeStepHeaderProps {
  steps: Step[];
  currentStep: number;
  onBack: () => void;
  onTabClick: (stepId: number) => void;
  title: string;
  backButtonText?: string;
  employeeId?: string;
  employeeData?: Record<string, any>;
}

// Get tab color styles
const getTabColorStyles = (color: string, isActive: boolean) => {
  if (!isActive) return 'text-slate-500 hover:text-slate-700 hover:bg-slate-50';

  switch (color) {
    case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm';
    case 'purple': return 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm';
    case 'amber': return 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm';
    case 'emerald': return 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm';
    case 'rose': return 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm';
    default: return 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm';
  }
};

const getTabIconColor = (color: string, isActive: boolean) => {
  if (!isActive) return 'text-slate-400';

  switch (color) {
    case 'blue': return 'text-blue-600';
    case 'purple': return 'text-purple-600';
    case 'amber': return 'text-amber-600';
    case 'emerald': return 'text-emerald-600';
    case 'rose': return 'text-rose-600';
    default: return 'text-emerald-600';
  }
};

// ── Hero Component ─────────────────────────────────────────────────────────
const EditEmpHero = memo(function EditEmpHero({
                                                employeeId,
                                                onBack,
                                                backButtonText,
                                              }: {
  employeeId: string;
  onBack: () => void;
  backButtonText: string;
}) {
  const { data: info } = useEmpDetailInfo(employeeId);
  const { data: photoData } = useEmpDetailPhoto(employeeId);

  const photo: EmpPhotoRes | undefined = photoData
      ? {
        id: (photoData as EmpDetailPhoto).id,
        fileName: (photoData as EmpDetailPhoto).fileName,
        contentType: (photoData as EmpDetailPhoto).contentType,
        photoSize: (photoData as EmpDetailPhoto).photoSize,
        photo: (photoData as EmpDetailPhoto).photo,
      }
      : undefined;

  const stateKey = info?.empState
      ? Object.entries(empStateColors).find(([, v]) =>
      v.includes(info.empState.toLowerCase().replace(/\s/g, '-'))
  )?.[0] ?? '0'
      : '0';

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden mb-6 shadow-xl border border-slate-200"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-transparent" />

        {/* Diagonal mesh grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="edit-mesh" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <line x1="0" y1="0" x2="0" y2="36" stroke="#059669" strokeWidth="1" strokeOpacity="0.12" />
              <line x1="0" y1="0" x2="36" y2="0" stroke="#059669" strokeWidth="1" strokeOpacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#edit-mesh)" />
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
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg hover:bg-white hover:border-emerald-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {backButtonText}
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
                Edit Employee Profile
              </motion.h1>

              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2"
              >
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                <User className="w-3 h-3" />
                {info?.fullName || 'Loading...'}
              </span>
                {info?.position && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  <Briefcase className="w-3 h-3" />
                      {info.position}
                </span>
                )}
              </motion.div>

              <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-slate-500 mt-2"
              >
                Update employee information across all sections. Changes are saved in real-time.
              </motion.p>
            </div>

            {/* Edit Mode Badge */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="shrink-0"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-white" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wide">Edit Mode</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
  );
});

// ── Confirmation Modal ─────────────────────────────────────────────────────
interface ConfirmModalProps {
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ action, onConfirm, onCancel }: ConfirmModalProps) => {
  const getActionColor = () => {
    switch (action.toLowerCase()) {
      case 'terminate': return 'from-red-500 to-rose-600';
      case 'stand by': return 'from-amber-500 to-orange-600';
      case 'suspend': return 'from-yellow-500 to-amber-600';
      case 'retire': return 'from-slate-500 to-gray-600';
      default: return 'from-red-500 to-rose-600';
    }
  };

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${getActionColor()} px-6 py-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Action</h3>
                <p className="text-sm text-white/80 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-slate-600">
              Are you sure you want to <span className="font-semibold text-slate-800">{action}</span> this employee?
            </p>
          </div>

          <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white cursor-pointer"
            >
              Confirm {action}
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

// ── Tab Bar ────────────────────────────────────────────────────────────────
interface EditEmpTabBarProps {
  steps: Step[];
  currentStep: number;
  onTabClick: (id: number) => void;
}

const EditEmpTabBar = memo(function EditEmpTabBar({
                                                    steps,
                                                    currentStep,
                                                    onTabClick,
                                                  }: EditEmpTabBarProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const menuItems = [
    { label: 'Terminate', icon: UserX, color: 'red' },
    { label: 'Stand By', icon: BedDouble, color: 'amber' },
    { label: 'Suspend', icon: PauseCircle, color: 'yellow' },
    { label: 'Retire', icon: XCircle, color: 'slate' },
  ];

  return (
      <>
        <AnimatePresence>
          {confirmAction && (
              <ConfirmModal
                  action={confirmAction}
                  onConfirm={() => setConfirmAction(null)}
                  onCancel={() => setConfirmAction(null)}
              />
          )}
        </AnimatePresence>

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-1.5">
            <div className="flex items-center gap-1">
              <nav className="flex gap-1 overflow-x-auto scrollbar-none flex-1">
                {steps.map(({ id, title, icon: Icon, color = 'emerald' }) => {
                  const isActive = currentStep === id;

                  return (
                      <motion.button
                          key={id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onTabClick(id)}
                          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                              isActive
                                  ? getTabColorStyles(color, true)
                                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? getTabIconColor(color, true) : 'text-slate-400'}`} />
                        {title}
                        {isActive && (
                            <motion.span
                                layoutId="activeEditTabIndicator"
                                className={`w-1.5 h-1.5 rounded-full ${
                                    color === 'blue' ? 'bg-blue-500' :
                                        color === 'purple' ? 'bg-purple-500' :
                                            color === 'amber' ? 'bg-amber-500' :
                                                color === 'rose' ? 'bg-rose-500' :
                                                    'bg-emerald-500'
                                } ml-1`}
                            />
                        )}
                      </motion.button>
                  );
                })}
              </nav>

              {/* Actions Menu */}
              <div className="shrink-0 ml-2">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-1 rounded-xl shadow-lg border-slate-100" align="end">
                    <div className="py-1">
                      <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100 mb-1">
                        Employee Actions
                      </div>
                      {menuItems.map(({ label, icon: Icon, color }) => (
                          <button
                              key={label}
                              onClick={() => { setPopoverOpen(false); setConfirmAction(label); }}
                              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                                  color === 'red' ? 'text-red-600 hover:bg-red-50' :
                                      color === 'amber' ? 'text-amber-600 hover:bg-amber-50' :
                                          color === 'yellow' ? 'text-yellow-600 hover:bg-yellow-50' :
                                              'text-slate-600 hover:bg-slate-50'
                              }`}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </motion.div>
      </>
  );
});

// ── Public Export ──────────────────────────────────────────────────────────
export const EditEmployeeStepHeader: React.FC<EditEmployeeStepHeaderProps> = ({
                                                                                steps,
                                                                                currentStep,
                                                                                onBack,
                                                                                onTabClick,
                                                                                backButtonText = 'Back to Employees',
                                                                                employeeId = '',
                                                                              }) => (
    <>
      <EditEmpHero
          employeeId={employeeId}
          onBack={onBack}
          backButtonText={backButtonText}
      />
      <EditEmpTabBar
          steps={steps}
          currentStep={currentStep}
          onTabClick={onTabClick}
      />
    </>
);

export default EditEmployeeStepHeader;