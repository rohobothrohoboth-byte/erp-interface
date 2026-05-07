import React from 'react';
import { User, Briefcase, Shield, FileText, Heart, Users, ArrowLeft } from 'lucide-react';
import { InteractiveGridPattern } from '../ui/interactive-grid-pattern';
import { cn } from '../../lib/utils';
import { EmpPhotoCircle } from '../ui/EmpPhoto';
import { useProfileInfo, useProfilePhoto } from '../../services/profile/profile.queries';
import { empStateColors } from './shared';
import type { EmpPhotoRes } from '../../types/hr/employee/empPhoto';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const TAB_ICONS: Record<string, React.ElementType> = {
  User, Briefcase, Shield, FileText, Heart, Users,
};

export const PROFILE_TABS = [
  { id: 'overview',  label: 'Overview',         icon: 'User'      },
  { id: 'basic',     label: 'Basic Info',        icon: 'Briefcase' },
  { id: 'bio',       label: 'Biographical',      icon: 'FileText'  },
  { id: 'emergency', label: 'Emergency Contact', icon: 'Heart'     },
  { id: 'family',    label: 'Family',            icon: 'Users'     },
  { id: 'guarantor', label: 'Guarantor',         icon: 'Shield'    },
];

interface ProfileHeaderProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function ProfileHeader({ activeTab, onTabChange }: ProfileHeaderProps) {
  const { data: info } = useProfileInfo();
  const { data: photoData } = useProfilePhoto();

  // Map API photo response to EmpPhotoRes shape
  const photo: EmpPhotoRes | undefined = photoData
    ? {
        id: photoData.id,
        fileName: photoData.fileName,
        contentType: photoData.contentType,
        photoSize: photoData.photoSize,
        photo: photoData.photo,
      }
    : undefined;

  // empState from API is a string label — find matching color key
  const stateKey = info?.empState
    ? Object.entries(empStateColors).find(([, v]) =>
        v.includes(info.empState.toLowerCase().replace(/\s/g, '-'))
      )?.[0] ?? '0'
    : '0';
    
   const navigate = useNavigate();
   const handleBack = () => {
    if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate('/modules');
  }
  };

  return (
    <>
      {/* Hero banner */}
      <div className="relative w-full flex flex-col ioverflow-visible rounded-xl">
        <InteractiveGridPattern
          className={cn(
            '[mask-image:radial-gradient(ellipse_at_center,_grey,_transparent_70%)]',
            'inset-0 h-full w-full skew-y-6 pointer-events-none',
          )}
          width={22} height={22} squares={[80, 80]} squaresClassName="hover:fill-green-400"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-green-200 blur-[90px] opacity-30" />
        </div>
          <motion.div
      className="relative z-50 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end pt-4 "
    >
      <div className="flex items-center">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer border-green-100 border-2 hover:bg-green-50"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
      </div>
    </motion.div>

        <div className="relative z-10 text-center pb-6 px-6 flex flex-col items-center">
          <div className="rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-green-100 to-blue-100 hover:scale-105 transition-transform duration-300">
            <EmpPhotoCircle size={80} photo={photo} name={info?.fullName ?? ''} />
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
            {info?.fullName ?? <span className="inline-block h-8 w-48 bg-gray-100 rounded animate-pulse" />}
          </h1>
          <p className="text-gray-500 mt-0.5 text-md">{info?.fullNameAm}</p>
          <p className="text-green-600 font-semibold mt-1">{info?.position}</p>

          {info?.empState && (
            <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${empStateColors[stateKey]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {info.empState}
            </span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="pb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
          <nav className="flex gap-1 overflow-x-auto">
            {PROFILE_TABS.map(({ id, label, icon }) => {
              const Icon = TAB_ICONS[icon];
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    active
                      ? 'bg-green-50 border border-green-200 text-green-700 shadow-sm'
                      : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-green-600' : 'text-gray-400'}`} />
                  {label}
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
