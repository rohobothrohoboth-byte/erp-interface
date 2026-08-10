import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Shield,
  Heart,
  Users
} from 'lucide-react';

// ============ Status Colors Configuration ============

export const empStateColors: Record<string, string> = {
  '0': 'bg-amber-50 text-amber-700 border-amber-200',
  '1': 'bg-blue-50 text-blue-700 border-blue-200',
  '2': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '3': 'bg-orange-50 text-orange-700 border-orange-200',
  '4': 'bg-rose-50 text-rose-700 border-rose-200',
  '5': 'bg-slate-50 text-slate-600 border-slate-200',
  '6': 'bg-purple-50 text-purple-700 border-purple-200',
  '7': 'bg-sky-50 text-sky-700 border-sky-200',
};

// Get status color by key
export const getStatusColor = (statusKey: string | number): string => {
  return empStateColors[String(statusKey)] || empStateColors['5'];
};

// Get status badge with icon
export const StatusBadge = memo(({ statusKey, statusText }: { statusKey: string | number; statusText?: string }) => {
  const colorClass = getStatusColor(statusKey);
  const text = statusText || getStatusLabel(statusKey);

  return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        {text}
    </span>
  );
});

// Helper to get status label
const getStatusLabel = (statusKey: string | number): string => {
  const labels: Record<string, string> = {
    '0': 'Pending',
    '1': 'Under Probation',
    '2': 'Active',
    '3': 'On Leave',
    '4': 'Terminated',
    '5': 'Retired',
    '6': 'Standby',
    '7': 'Approved',
  };
  return labels[String(statusKey)] || 'Unknown';
};

// ============ Field Component ============

interface FieldProps {
  label: string;
  value?: string | number | React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
  copyable?: boolean;
}

export const Field = memo(({ label, value, icon, highlight, copyable }: FieldProps) => {
  const displayValue = value !== undefined && value !== null && value !== '' ? value : '—';

  const handleCopy = () => {
    if (copyable && typeof displayValue === 'string' && displayValue !== '—') {
      navigator.clipboard.writeText(displayValue);
    }
  };

  return (
      <div className="group/field">
        <div className="flex items-center gap-1.5 mb-1">
          {icon && (
              <span className="text-slate-400 group-hover/field:text-emerald-500 transition-colors">
            {icon}
          </span>
          )}
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </label>
          {copyable && displayValue !== '—' && (
              <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-slate-400 hover:text-emerald-600"
                  title="Copy to clipboard"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
          )}
        </div>
        <p className={cn(
            "text-sm font-medium text-slate-800 break-words",
            highlight && "font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block"
        )}>
          {displayValue}
        </p>
      </div>
  );
});

// ============ ReadCard Component ============

interface ReadCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
  gradient?: string;
  bgGradient?: string;
  action?: React.ReactNode;
}

export const ReadCard = memo(({
                                title,
                                icon,
                                children,
                                badge,
                                gradient = "from-emerald-500 to-teal-600",
                                bgGradient = "from-emerald-50 to-teal-50",
                                action
                              }: ReadCardProps) => {
  return (
      <motion.div
          whileHover={{ y: -2 }}
          className="relative group h-full"
      >
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

        {/* Card Content */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className={`bg-gradient-to-r ${bgGradient} px-5 py-4 border-b border-slate-100`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 bg-gradient-to-r ${gradient} rounded-xl shadow-md`}>
                  <div className="text-white">{icon}</div>
                </div>
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {badge && (
                    <span className="px-2.5 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-slate-600 rounded-full shadow-sm">
                  {badge}
                </span>
                )}
                {action}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 flex-1">
            {children}
          </div>
        </div>
      </motion.div>
  );
});

// ============ Grid Component ============

interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid = memo(({ children, columns = 2, gap = 'md', className }: GridProps) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
      <div className={cn(`grid ${colClasses[columns]} ${gapClasses[gap]}`, className)}>
        {children}
      </div>
  );
});

// ============ InfoRow Component ============

interface InfoRowProps {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
}

export const InfoRow = memo(({ label, value, icon }: InfoRowProps) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
    </div>
));

// ============ Section Component ============

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const Section = memo(({ title, children, icon, collapsible = false, defaultOpen = true }: SectionProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
            onClick={() => collapsible && setIsOpen(!isOpen)}
            className={cn(
                "w-full px-5 py-3 bg-gradient-to-r from-slate-50 to-gray-50 flex items-center justify-between",
                collapsible && "hover:bg-slate-100 transition-colors cursor-pointer"
            )}
        >
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-emerald-600">{icon}</div>}
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h4>
          </div>
          {collapsible && (
              <svg
                  className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
          )}
        </button>
        {(!collapsible || isOpen) && (
            <div className="p-5">
              {children}
            </div>
        )}
      </div>
  );
});

// ============ Divider Component ============

export const Divider = memo(({ className }: { className?: string }) => (
    <div className={cn("border-t border-slate-200 my-4", className)} />
));

// ============ Helper Functions ============

const cn = (...classes: (string | undefined | false | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

// ============ Predefined Icon Components ============

export const FieldIcons = {
  user: <User className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  phone: <Phone className="w-3.5 h-3.5" />,
  location: <MapPin className="w-3.5 h-3.5" />,
  calendar: <Calendar className="w-3.5 h-3.5" />,
  briefcase: <Briefcase className="w-3.5 h-3.5" />,
  award: <Award className="w-3.5 h-3.5" />,
  shield: <Shield className="w-3.5 h-3.5" />,
  heart: <Heart className="w-3.5 h-3.5" />,
  users: <Users className="w-3.5 h-3.5" />,
};

// ============ Export All ============

export default {
  empStateColors,
  getStatusColor,
  StatusBadge,
  Field,
  ReadCard,
  Grid,
  InfoRow,
  Section,
  Divider,
  FieldIcons,
};