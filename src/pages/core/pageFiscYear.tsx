import FiscYearSection from '../../components/core/fiscalyear/FiscYearSection';
import HolidaySection from '../../components/core/holiday/HolidaySection';
import PeriodSection from '../../components/core/period/PeriodSection';


export default function FiscalYearOverview() {
  return (
    <div className='space-y-6'>
        <FiscYearSection />
        <HolidaySection />
        <PeriodSection />
    </div>
  );
}
