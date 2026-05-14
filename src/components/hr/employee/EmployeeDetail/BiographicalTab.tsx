import { memo } from 'react';
import { FileText, Landmark } from 'lucide-react';
import { ReadCard, Grid, Field } from './shared';
import { DetailSkeleton, DetailError } from './LoadState';
import { useEmpDetailBio } from '../../../../services/hr/employee/empDetail/empDetail.queries';

export const BiographicalTab = memo(function BiographicalTab({ employeeId }: { employeeId: string }) {
  const { data: bio, isLoading, error } = useEmpDetailBio(employeeId);

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <DetailSkeleton rows={3} />
      <DetailSkeleton rows={2} />
    </div>
  );

  if (error) return <DetailError message={error.message} />;
  if (!bio) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <ReadCard title="Personal Details" icon={<FileText className="w-4 h-4" />}>
        <Grid>
          <Field label="Birth Location"          value={bio.birthLocation} />
          <Field label="Mother's Full Name"      value={bio.motherFullName} />
          <Field label="Has Birth Certificate"   value={bio.hasBirthCert} />
          <Field label="Has Marriage Certificate" value={bio.hasMarriageCert} />
        </Grid>
      </ReadCard>

      <ReadCard title="Financial Information" icon={<Landmark className="w-4 h-4" />}>
        <Grid>
          <Field label="TIN Number"      value={bio.tin} />
          <Field label="Bank Account No." value={bio.bankAccountNo} />
          <Field label="Pension Number"  value={bio.pensionNumber} />
        </Grid>
      </ReadCard>
    </div>
  );
});

