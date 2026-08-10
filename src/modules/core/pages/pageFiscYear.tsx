import FiscYearSection from '@/modules/core/components/fiscalyear/FiscYearSection';
import HolidaySection from '@/modules/core/components/holiday/HolidaySection';
import PeriodSection from '@/modules/core/components/period/PeriodSection';

export default function FiscalYearOverview() {
    return (
        <div className="space-y-8">
            <FiscYearSection />
            <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
            <HolidaySection />
            <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
            <PeriodSection />
        </div>
    );
}