import { memo, useMemo } from 'react';
import { Clock, Star, Award, UserCheck, Calendar } from 'lucide-react';
import { useEmpDetailOverview, useEmpDetailLeave } from './empDetail.queries';
import { ReadCard } from './shared';
import { DetailSkeleton, DetailError } from './LoadState';
import { EmpPhotoCircle } from '../../../ui/EmpPhoto';

const WORKING_DAYS = 23;

const COLOR_MAP: Record<string, { color: string; track: string; text: string }> = {
  vacation: { color: 'bg-green-500',  track: 'bg-green-100',  text: 'text-green-700'  },
  sick:     { color: 'bg-blue-500',   track: 'bg-blue-100',   text: 'text-blue-700'   },
  personal: { color: 'bg-purple-500', track: 'bg-purple-100', text: 'text-purple-700' },
  annual:   { color: 'bg-green-500',  track: 'bg-green-100',  text: 'text-green-700'  },
};

const AttendanceBars = memo(({ filledDays }: { filledDays: number }) => (
  <div className="w-full flex gap-0.5 mt-1">
    {Array.from({ length: WORKING_DAYS }).map((_, i) => (
      <div key={i} className={`flex-1 h-1.5 rounded-full ${i < filledDays ? 'bg-emerald-500' : 'bg-emerald-100'}`} />
    ))}
  </div>
));

export const OverviewTab = memo(function OverviewTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading, error } = useEmpDetailOverview(employeeId);
  const { data: leaveData, isLoading: leaveLoading } = useEmpDetailLeave(employeeId);

  const attendPct     = Number(data?.attendPer) || 0;
  const filledDays    = Math.round((attendPct / 100) * WORKING_DAYS);
  const attendDisplay = `${attendPct}%`;
  const currentMonth  = data?.attendMonth ?? new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const statCards = useMemo(() => [
    { icon: <Clock className="h-5 w-5" />, label: 'Tenure',      value: data?.tenure,   color: 'text-green-600',  bg: 'bg-green-50'  },
    { icon: <Star className="h-5 w-5" />,  label: 'Performance', value: data?.perStr,   color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: <Award className="h-5 w-5" />, label: 'Training',    value: data?.training, color: 'text-blue-600',   bg: 'bg-blue-50'   },
  ], [data?.tenure, data?.perStr, data?.training]);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-100 mx-auto mb-3" />
            <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailSkeleton rows={1} />
        <DetailSkeleton rows={3} />
      </div>
    </div>
  );

  if (error) return <DetailError message={error.message} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>{icon}</div>
            <span className="text-2xl font-bold text-gray-900">{value ?? '—'}</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
          </div>
        ))}

        {/* Attendance card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{attendDisplay}</span>
          <span className="text-sm text-gray-400">{currentMonth}</span>
          <AttendanceBars filledDays={filledDays} />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-1">Attendance</span>
        </div>
      </div>

      {/* Reports To + Leave Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadCard title="Reports To" icon={<UserCheck className="w-4 h-4" />}>
          <div className="flex items-center gap-4">
            <EmpPhotoCircle size={42} name={data.repToName} />
            <div>
              <p className="font-semibold text-gray-900">{data.repToName}</p>
              <p className="text-sm text-gray-500">{data.repToPos}</p>
            </div>
          </div>
        </ReadCard>

        <ReadCard title="Time Off Balance" icon={<Calendar className="w-4 h-4" />}>
          {leaveLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : !leaveData || leaveData.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center">Leave policy is not configured.</p>
          ) : (
            <div className="space-y-4">
              {leaveData.map((leave) => {
                const used  = parseFloat(leave.usedDays)  || 0;
                const total = parseFloat(leave.totalDays) || 0;
                const pct   = total > 0 ? Math.min((used / total) * 100, 100) : 0;
                const colors = COLOR_MAP[leave.leaveType.toLowerCase()] ?? { color: 'bg-gray-500', track: 'bg-gray-100', text: 'text-gray-700' };
                return (
                  <div key={leave.leavePolicyId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{leave.leaveType}</span>
                      <span className={`text-xs font-medium ${colors.text}`}>{used}/{total} days</span>
                    </div>
                    <div className="relative pt-2">
                      <div className={`h-2 rounded-full ${colors.track} overflow-visible`}>
                        <div className={`h-2 rounded-full ${colors.color} relative`} style={{ width: `${pct}%` }}>
                          <div className={`absolute -top-7 right-0 translate-x-1/2 ${colors.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap`}>
                            {used}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                              style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTopWidth: '4px', borderTopStyle: 'solid', borderTopColor: 'inherit' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ReadCard>
      </div>
    </div>
  );
});
