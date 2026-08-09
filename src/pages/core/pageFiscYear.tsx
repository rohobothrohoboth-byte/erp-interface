import FiscYearSection from '../../components/core/fiscalyear/FiscYearSection';
import HolidaySection from '../../components/core/holiday/HolidaySection';
import PeriodSection from '../../components/core/period/PeriodSection';

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