import React, { memo } from 'react';

export const empStateColors: Record<string, string> = {
  '0': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  '1': 'bg-blue-50 text-blue-700 border-blue-200',
  '2': 'bg-green-50 text-green-700 border-green-200',
  '3': 'bg-orange-50 text-orange-700 border-orange-200',
  '4': 'bg-red-50 text-red-700 border-red-200',
  '5': 'bg-gray-50 text-gray-600 border-gray-200',
  '6': 'bg-purple-50 text-purple-700 border-purple-200',
  '7': 'bg-sky-50 text-sky-700 border-sky-200',
};

export const Field = memo(({ label, value, icon }: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
      {icon}{label}
    </span>
    <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
  </div>
));

export const ReadCard = memo(({ title, icon, children, badge }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      {badge && (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
));

export const Grid = memo(({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">{children}</div>
));
