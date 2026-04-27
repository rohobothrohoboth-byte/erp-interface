import React from 'react';
import {
  Briefcase, MapPin, Building2, GraduationCap, Star,
  FileText, Users, User, Layers, ListChecks, Calendar,
} from 'lucide-react';
import type { JobPostingViewDto } from '../../../../../types/hr/recruit/jobPosting';

// ── Field row ─────────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; value?: string | number | null; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
      {icon && <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
};

// ── Compact grid cell ─────────────────────────────────────────────────────────
const GridCell: React.FC<{ label: string; value?: string | number | null; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
    {icon && <span className="text-green-600 mt-0.5 shrink-0">{icon}</span>}
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium mt-0.5 truncate ${value ? 'text-gray-800' : 'text-gray-300'}`}>
        {value ?? '—'}
      </p>
    </div>
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</p>
    {children}
  </div>
);

// ── Chip tags ─────────────────────────────────────────────────────────────────
const ChipList: React.FC<{ value?: string | null; color?: 'green' | 'emerald' }> = ({ value, color = 'green' }) => {
  if (!value) return <p className="text-sm text-gray-300 italic">Not provided</p>;
  const items = value.split(/[,\n•]+/).map(s => s.trim()).filter(Boolean);
  if (items.length === 0) return <p className="text-sm text-gray-300 italic">Not provided</p>;
  const cls = color === 'emerald'
    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
    : 'bg-green-50 text-green-800 border-green-100';
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${cls}`}>
          {item}
        </span>
      ))}
    </div>
  );
};

interface JobPostingInfoCardProps {
  post: JobPostingViewDto;
}

const JobPostingInfoCard: React.FC<JobPostingInfoCardProps> = ({ post }) => (
  <div className="space-y-5">

    {/* : Requisition Info */}
    <Section title=" Requisition Info">
      {/* Compact grid for the key fields */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <GridCell label="Position" value={post.position} icon={<Briefcase size={13} />} />
        <GridCell label="Job Grade / Step" value={post.jgStep} icon={<Layers size={13} />} />
        <GridCell label="Open Positions" value={post.reqQuantity} icon={<Users size={13} />} />
        <GridCell label="Status" value={post.statusStr} icon={<FileText size={13} />} />
        <GridCell label="Published Date" value={post.publishedDateStr} icon={<Calendar size={13} />} />
        <GridCell label="Deadline" value={post.deadlineDateStr} icon={<Calendar size={13} />} />
      </div>
      {/* Full-width fields */}
      <div className="divide-y divide-gray-100">
        <Field label="Department" value={post.department} icon={<Building2 size={13} />} />
        <Field label="Period" value={post.period} />
        <Field label="Requested By" value={post.requistionBy} icon={<User size={13} />} />
        <Field label="Reason for Requisition" value={post.reqReason} icon={<FileText size={13} />} />
      </div>
    </Section>

    {/* ── Step 2: Job Description ── */}
    <Section title=" Job Description">
      {/* Compact grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <GridCell label="Work Location" value={post.workLocation} icon={<MapPin size={13} />} />
        <GridCell label="Preferred Gender" value={post.preGenderStr} icon={<User size={13} />} />
        <GridCell label="Employment Nature" value={post.contractTypeStr} icon={<Briefcase size={13} />} />
      </div>

      {/* Description */}
      {post.desc && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Description</p>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{post.desc}</p>
        </div>
      )}

      {/* Key Responsibilities */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <ListChecks size={12} /> Key Responsibilities
        </p>
        {/* keyRespo is stored in desc on the backend for now — show if available */}
        <p className="text-sm text-gray-300 italic">Not returned by API yet</p>
      </div>

      {/* Required Qualifications */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <GraduationCap size={12} /> Required Qualifications
        </p>
        <ChipList value={post.qualification} color="green" />
      </div>

      {/* Key Skills */}
      <div>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Star size={12} /> Key Skills
        </p>
        <ChipList value={post.keySkills} color="emerald" />
      </div>
    </Section>

  </div>
);

export default JobPostingInfoCard;
