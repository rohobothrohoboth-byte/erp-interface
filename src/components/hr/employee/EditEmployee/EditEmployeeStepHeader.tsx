import React, { memo, useState } from 'react';
import { ArrowLeft, UserX, PauseCircle, XCircle, Menu, AlertTriangle, BedDouble } from 'lucide-react';
import { EmpPhotoRect } from '../../../ui/EmpPhoto';
import { empStateColors } from '../../../profile/shared';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';
import { Button } from '../../../ui/button';
import {
  useEmpDetailInfo,
  useEmpDetailPhoto,
} from '../../../../services/hr/employee/empDetail/empDetail.queries';
import type { EmpDetailPhoto } from '../../../../types/hr/employee/empDetail';
import type { EmpPhotoRes } from '../../../../types/hr/employee/empPhoto';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
}

interface EditEmployeeStepHeaderProps {
  steps: Step[];
  currentStep: number;
  onBack: () => void;
  onTabClick: (stepId: number) => void;
  title: string;
  backButtonText?: string;
  employeeId?: string;
  // kept for fallback only — hero now fetches its own data
  employeeData?: Record<string, any>;
}

// ── Hero — fetches info & photo from same endpoints as detail header ────────
const EditEmpHero = memo(function EditEmpHero({
  employeeId,
  onBack,
  backButtonText,
}: {
  employeeId: string;
  onBack: () => void;
  backButtonText: string;
}) {
  const { data: info }      = useEmpDetailInfo(employeeId);
  const { data: photoData } = useEmpDetailPhoto(employeeId);

  const photo: EmpPhotoRes | undefined = photoData
    ? {
        id:          (photoData as EmpDetailPhoto).id,
        fileName:    (photoData as EmpDetailPhoto).fileName,
        contentType: (photoData as EmpDetailPhoto).contentType,
        photoSize:   (photoData as EmpDetailPhoto).photoSize,
        photo:       (photoData as EmpDetailPhoto).photo,
      }
    : undefined;

  const stateKey = info?.empState
    ? Object.entries(empStateColors).find(([, v]) =>
        v.includes(info.empState.toLowerCase().replace(/\s/g, '-'))
      )?.[0] ?? '0'
    : '0';

  return (
    <div className="relative rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-200">
      {/* Base */}
      <div className="absolute inset-0 bg-white" />

      {/* Diagonal mesh grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="edit-mesh" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="36" stroke="#059669" strokeWidth="1" strokeOpacity="0.18" />
            <line x1="0" y1="0" x2="36" y2="0" stroke="#059669" strokeWidth="1" strokeOpacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#edit-mesh)" />
      </svg>

      <div className="relative z-10 px-8 py-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 border border-emerald-300 hover:border-emerald-500 bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backButtonText}
        </button>

        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-slate-50">
              <EmpPhotoRect width={116} height={130} photo={photo} name={info?.fullName ?? ''} />
            </div>
            {info?.empState && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-white/90 ${empStateColors[stateKey]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {info.empState}
              </span>
            )}
          </div>

          <div className="min-w-0 -mt-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-snug truncate flex justify-center items-center">
              {info?.fullName ?? <span className="inline-block h-7 w-44 bg-emerald-100 rounded-lg animate-pulse" />}
            </h1>
            {info?.fullNameAm && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">{info.fullNameAm}</p>
            )}
            <p className="text-sm font-medium text-emerald-600 mt-1.5 truncate">
              {info?.position ?? <span className="inline-block h-4 w-28 bg-emerald-100 rounded animate-pulse" />}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Confirmation Modal ─────────────────────────────────────────────────────
function ConfirmModal({ action, onConfirm, onCancel }: {
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex flex-col items-center text-center gap-4 px-6 py-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">Are you sure?</p>
            <p className="text-sm text-gray-500 mt-1">
              This will <span className="font-medium text-gray-700">{action}</span> the employee.
            </p>
          </div>
        </div>
        <div className="border-t px-6 py-3">
          <div className="flex justify-center items-center gap-2">
            <Button variant="destructive" className="w-28" onClick={onConfirm}>Yes</Button>
            <Button variant="outline"     className="w-28" onClick={onCancel}>No</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab bar ────────────────────────────────────────────────────────────────
const EditEmpTabBar = memo(function EditEmpTabBar({
  steps,
  currentStep,
  onTabClick,
}: {
  steps: Step[];
  currentStep: number;
  onTabClick: (id: number) => void;
}) {
  const [popoverOpen, setPopoverOpen]     = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const menuItems = [
    { label: 'Terminate', icon: UserX       },
    { label: 'Stand By',  icon: BedDouble   },
    { label: 'Suspend',   icon: PauseCircle },
    { label: 'Retire',    icon: XCircle     },
  ];

  return (
    <>
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={() => setConfirmAction(null)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="pb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
          <div className="flex items-center gap-1">
            <nav className="flex gap-1 overflow-x-auto scrollbar-none flex-1">
              {steps.map(({ id, title, icon: Icon }) => {
                const active = currentStep === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onTabClick(id)}
                    className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'
                        : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {title}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
                  </button>
                );
              })}
            </nav>

            <div className="shrink-0 ml-2">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-1" align="end">
                  {menuItems.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => { setPopoverOpen(false); setConfirmAction(label); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4 text-red-500" />
                      {label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

// ── Public export ──────────────────────────────────────────────────────────
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
