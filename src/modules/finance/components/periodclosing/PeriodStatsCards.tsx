import { Card, CardContent } from '@/shared/components/ui/card';

type Stat = { label: string; value: string | number; hint?: string };

type PeriodStatsCardsProps = {
  stats?: Stat[];
};

const DEFAULT_STATS: Stat[] = [
  { label: 'Open periods', value: 3 },
  { label: 'Closed periods', value: 9 },
  { label: 'Pending reviews', value: 2, hint: 'Awaiting controller sign-off' },
];

export default function PeriodStatsCards({ stats = DEFAULT_STATS }: PeriodStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-slate-200 shadow-none">
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</div>
            {stat.hint && <div className="mt-1 text-xs text-slate-400">{stat.hint}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
