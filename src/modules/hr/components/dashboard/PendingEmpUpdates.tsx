// PendingEmployeeUpdates.tsx - With separate counts from education/experience queries

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Briefcase,
  Clock,
  ChevronRight,
  Users,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { usePendEmpEduExpList } from '@/modules/hr/services/dashboard/dashboard.queries';
// ✅ Import education and experience queries to get actual counts
import { useEducations } from '@/modules/profile/services/Education/education.queries';
import { useExperiences } from '@/modules/profile/services/Experiance/experiance.queries';

interface PendingEmployeeUpdatesProps {
  onClick?: () => void;
}

const PendingEmployeeUpdates: React.FC<PendingEmployeeUpdatesProps> = ({ onClick }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: pendingEduExp = [], isLoading: dashboardLoading } = usePendEmpEduExpList();

  // ✅ Fetch actual education and experience data for counts
  const { data: educations = [], isLoading: eduLoading } = useEducations();
  const { data: experiences = [], isLoading: expLoading } = useExperiences();

  const loading = dashboardLoading || eduLoading || expLoading;

  // ✅ Count actual pending records
  const pendingEducationCount = educations.filter(
      (edu) => edu.status === '0' || edu.status === 'Pending' || edu.status === 'pending'
  ).length;

  const pendingExperienceCount = experiences.filter(
      (exp) => exp.status === '0' || exp.status === 'Pending' || exp.status === 'pending'
  ).length;

  const totalPending = pendingEducationCount + pendingExperienceCount;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/hr/employees/pending-edu-exp');
    }
  };

  if (loading) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <div className="w-4 h-4 animate-pulse bg-purple-300 rounded" />
              </div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
            ))}
          </div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={handleClick}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t.pendingUpdates || 'Pending Updates'}
              </h3>
            </div>
            {totalPending > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalPending}
                </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-slate-600 dark:text-slate-400">
                {t.education || 'Education'}
              </span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
              {pendingEducationCount}
            </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">
                {t.experience || 'Experience'}
              </span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
              {pendingExperienceCount}
            </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                {t.totalPending || 'Total Pending Approvals'}
              </span>
              </div>
              <span className="font-bold text-amber-600 dark:text-amber-400">
              {totalPending}
            </span>
            </div>
          </div>

          {/* View all link */}
          {totalPending > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {t.viewAll || 'View all pending updates'}
              </span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                </div>
              </div>
          )}

          {/* Empty state */}
          {totalPending === 0 && !loading && (
              <div className="flex items-center justify-center py-3">
                <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{t.allReviewed || 'All education and experience records reviewed'}</span>
                </div>
              </div>
          )}
        </div>
      </motion.div>
  );
};

export default PendingEmployeeUpdates;