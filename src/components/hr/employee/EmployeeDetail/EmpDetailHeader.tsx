import { memo, useCallback } from 'react';
import { User, Briefcase, Shield, FileText, Heart, Users, FolderOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmpPhotoRect } from '../../../ui/EmpPhoto';
import { useEmpDetailInfo, useEmpDetailPhoto } from './empDetail.queries';
import { empStateColors } from './shared';
import type { EmpDetailPhoto } from './types';
import type { EmpPhotoRes } from '../../../../types/hr/employee/empPhoto';

const TAB_ICONS: Record<string, React.ElementType> = {
  User, Briefcase, Shield, FileText, Heart, Users, FolderOpen,
};

export const EMP_DETAIL_TABS = [
  { id: 'overview',  label: 'Overview',         icon: 'User'       },
  { id: 'basic',     label: 'Basic Info',        icon: 'Briefcase'  },
  { id: 'bio',       label: 'Biographical',      icon: 'FileText'   },
  { id: 'emergency', label: 'Emergency Contact', icon: 'Heart'      },
  { id: 'family',    label: 'Family',            icon: 'Users'      },
  { id: 'guarantor', label: 'Guarantor',         icon: 'Shield'     },
  { id: 'documents', label: 'Documents',         icon: 'FolderOpen' },
];

// ── Hero ───────────────────────────────────────────────────────────────────
const EmpDetailHero = memo(function EmpDetailHero({ employeeId }: { employeeId: string }) {
  const { data: info }      = useEmpDetailInfo(employeeId);
  const { data: photoData } = useEmpDetailPhoto(employeeId);

  const photo: EmpPhotoRes | undefined = photoData
    ? { id: (photoData as EmpDetailPhoto).id, fileName: (photoData as EmpDetailPhoto).fileName, contentType: (photoData as EmpDetailPhoto).contentType, photoSize: (photoData as EmpDetailPhoto).photoSize, photo: (photoData as EmpDetailPhoto).photo }
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

  return (
    <div className="relative rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-200">
      {/* Base */}
      <div className="absolute inset-0 bg-white" />

      {/* Diagonal mesh grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="detail-mesh" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="36" stroke="#059669" strokeWidth="1" strokeOpacity="0.18" />
            <line x1="0" y1="0" x2="36" y2="0" stroke="#059669" strokeWidth="1" strokeOpacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#detail-mesh)" />
      </svg>

      <div className="relative z-10 px-8 py-6">
        <div>
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 border border-emerald-300 hover:border-emerald-500 bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-all duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

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

// ── Tab bar ────────────────────────────────────────────────────────────────
const EmpDetailTabBar = memo(function EmpDetailTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="pb-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
        <nav className="flex gap-1 overflow-x-auto scrollbar-none">
          {EMP_DETAIL_TABS.map(({ id, label, icon }) => {
            const Icon = TAB_ICONS[icon];
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  active
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                {label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
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
