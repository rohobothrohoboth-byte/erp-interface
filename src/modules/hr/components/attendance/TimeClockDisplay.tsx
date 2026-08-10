import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, User, Pencil } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { ShiftSchedule } from '@/modules/hr/types/attendance';

type DayWindow = {
  clockInStart?: string;
  clockInEnd?: string;
  clockOutStart?: string;
  clockOutEnd?: string;
};

type TimeClockDisplayProps = {
  schedule?: ShiftSchedule;
  employeeName?: string;
  employeeId?: string;
  onEdit?: () => void;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getTodayKey(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function resolveTodayWindow(schedule?: ShiftSchedule): DayWindow | null {
  if (!schedule) return null;
  const key = getTodayKey();
  const keyed = schedule[key] as DayWindow | undefined;
  if (keyed && typeof keyed === 'object') return keyed;

  const days = schedule.days;
  if (Array.isArray(days)) {
    const match = days.find(
      (d) => String(d.day || '').toLowerCase() === key.toLowerCase()
    );
    if (match) {
      return {
        clockInStart: String(match.startTime || match.clockInStart || ''),
        clockInEnd: String(match.clockInEnd || ''),
        clockOutStart: String(match.endTime || match.clockOutStart || ''),
        clockOutEnd: String(match.clockOutEnd || ''),
      };
    }
  }
  return null;
}

function parseMinutes(hhmm?: string): number | null {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function shiftStatus(window: DayWindow | null, now: Date): {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
} {
  if (!window || (!window.clockInStart && !window.clockOutStart)) {
    return { label: 'Off shift', tone: 'neutral' };
  }
  const mins = now.getHours() * 60 + now.getMinutes();
  const inStart = parseMinutes(window.clockInStart);
  const inEnd = parseMinutes(window.clockInEnd);
  const outStart = parseMinutes(window.clockOutStart);
  const outEnd = parseMinutes(window.clockOutEnd);

  if (inStart != null && inEnd != null && mins >= inStart && mins <= inEnd) {
    return { label: 'Clock-in window', tone: 'info' };
  }
  if (outStart != null && outEnd != null && mins >= outStart && mins <= outEnd) {
    return { label: 'Clock-out window', tone: 'warning' };
  }
  if (inEnd != null && outStart != null && mins > inEnd && mins < outStart) {
    return { label: 'On shift', tone: 'success' };
  }
  return { label: 'Outside shift', tone: 'danger' };
}

const toneClass: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function TimeClockDisplay({
  schedule,
  employeeName = 'Employee',
  employeeId,
  onEdit,
}: TimeClockDisplayProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const todayWindow = useMemo(() => resolveTodayWindow(schedule), [schedule]);
  const status = useMemo(() => shiftStatus(todayWindow, now), [todayWindow, now]);

  const timeLabel = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-200 text-sm">
                <Clock className="h-4 w-4" />
                Live time clock
              </div>
              <div className="mt-3 font-mono text-5xl md:text-6xl tracking-tight tabular-nums">
                {timeLabel}
              </div>
              <p className="mt-2 text-sm text-slate-300">{dateLabel}</p>
            </div>
            <Badge variant="outline" className={toneClass[status.tone]}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className="rounded-lg border border-slate-100 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <User className="h-3.5 w-3.5" />
              Employee
            </div>
            <div className="mt-2 font-medium text-slate-900">{employeeName}</div>
            {employeeId && <div className="text-xs text-slate-500">{employeeId}</div>}
          </div>
          <div className="rounded-lg border border-slate-100 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Today&apos;s window
            </div>
            <div className="mt-2 text-sm text-slate-800">
              {todayWindow?.clockInStart || todayWindow?.clockOutStart ? (
                <>
                  In {todayWindow.clockInStart || '—'}
                  {todayWindow.clockInEnd ? `–${todayWindow.clockInEnd}` : ''}
                  <br />
                  Out {todayWindow.clockOutStart || '—'}
                  {todayWindow.clockOutEnd ? `–${todayWindow.clockOutEnd}` : ''}
                </>
              ) : (
                'No shift scheduled'
              )}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Schedule</div>
              <div className="mt-2 text-sm text-slate-800">Edit weekly clock windows</div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
