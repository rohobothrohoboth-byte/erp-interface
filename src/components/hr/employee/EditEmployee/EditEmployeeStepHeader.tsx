import React, { memo, useState } from 'react';
import { ArrowLeft, UserX, PauseCircle, CheckCircle, XCircle, Menu } from 'lucide-react';
import { EmpPhotoRect } from '../../../ui/EmpPhoto';
import { empStateColors } from '../../../profile/shared';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';
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
  employeeData?: {
    photo?: string;
    fullName?: string;
    fullNameAm?: string;
    position?: string;
    department?: string;
    code?: string;
    empState?: string;
  };
}

// ── Hero ───────────────────────────────────────────────────────────────────
const EditEmpHero = memo(function EditEmpHero({
  employeeData,
  onBack,
  backButtonText,
}: {
  employeeData?: EditEmployeeStepHeaderProps['employeeData'];
  onBack: () => void;
  backButtonText: string;
}) {
  const photo: EmpPhotoRes | undefined = employeeData?.photo
    ? { id: '', fileName: '', contentType: 'image/png', photoSize: '', photo: employeeData.photo }
    : undefined;

  const stateKey = employeeData?.empState
    ? Object.entries(empStateColors).find(([, v]) =>
        v.includes(employeeData.empState!.toLowerCase().replace(/\s/g, '-'))
      )?.[0] ?? '0'
    : '0';

  return (
    <div className="relative rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-200">
      <div className="absolute inset-0 bg-slate-50" />

      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,35 C240,70 480,0 720,35 C960,70 1200,0 1440,35 L1440,70 L0,70 Z" fill="#059669" fillOpacity="0.12" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,15 C360,50 720,0 1080,25 C1260,38 1380,10 1440,15 L1440,50 L0,50 Z" fill="#059669" fillOpacity="0.07" />
      </svg>
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none" />

      <div className="relative z-10 px-8 py-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 border border-emerald-300 hover:border-emerald-500 bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-all duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {backButtonText}
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-slate-50">
              <EmpPhotoRect width={116} height={130} photo={photo} name={employeeData?.fullName ?? ''} />
            </div>
            {employeeData?.empState && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-white/90 ${empStateColors[stateKey]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {employeeData.empState}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-snug truncate flex justify-center items-center">
              {employeeData?.fullName ?? <span className="inline-block h-7 w-44 bg-emerald-100 rounded-lg animate-pulse" />}
            </h1>
            {employeeData?.fullNameAm && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">{employeeData.fullNameAm}</p>
            )}
            <p className="text-sm font-medium text-emerald-600 mt-1.5 truncate">
              {employeeData?.position ?? <span className="inline-block h-4 w-28 bg-emerald-100 rounded animate-pulse" />}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

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
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
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

          {/* Actions menu */}
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
                <button
                  onClick={() => setPopoverOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" /> Terminate
                </button>
                <button
                  onClick={() => setPopoverOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" /> Stand By
                </button>
                <button
                  onClick={() => setPopoverOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg flex items-center gap-2"
                >
                  <PauseCircle className="w-4 h-4" /> Suspend
                </button>
                <button
                  onClick={() => setPopoverOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4 text-gray-500" /> Retire
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Public export ──────────────────────────────────────────────────────────
export const EditEmployeeStepHeader: React.FC<EditEmployeeStepHeaderProps> = ({
  steps,
  currentStep,
  onBack,
  onTabClick,
  backButtonText = 'Back to Employees',
  employeeData,
}) => (
  <>
    <EditEmpHero
      employeeData={employeeData}
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
