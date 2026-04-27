import React from 'react';
import { Users, Briefcase, Calendar, Clock } from 'lucide-react';
import type { JobPostingViewDto } from '../../../../../types/hr/recruit/jobPosting';

const KpiCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; accent: string }> = ({ label, value, icon, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

interface JobPostingKpiCardsProps {
  post: JobPostingViewDto;
  applicantCount: number;
}

const JobPostingKpiCards: React.FC<JobPostingKpiCardsProps> = ({ post, applicantCount }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <KpiCard label="Total Applicants" value={applicantCount} icon={<Users size={18} className="text-green-600" />} accent="bg-green-100" />
    <KpiCard label="Open Positions" value={post.reqQuantity ?? '—'} icon={<Briefcase size={18} className="text-emerald-600" />} accent="bg-emerald-100" />
    <KpiCard label="Deadline" value={post.deadlineDateStr ?? '—'} icon={<Calendar size={18} className="text-orange-500" />} accent="bg-orange-100" />
    <KpiCard label="Published" value={post.publishedDateStr ?? '—'} icon={<Clock size={18} className="text-blue-500" />} accent="bg-blue-100" />
  </div>
);

export default JobPostingKpiCards;
