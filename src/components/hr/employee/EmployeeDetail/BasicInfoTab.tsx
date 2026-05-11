import { memo } from 'react';
import { User, Briefcase, Landmark, MapPin } from 'lucide-react';
import { useEmpDetailBasic } from './empDetail.queries';
import { ReadCard, Grid, Field } from './shared';
import { DetailSkeleton, DetailError } from './LoadState';

export const BasicInfoTab = memo(function BasicInfoTab({ employeeId }: { employeeId: string }) {
  const { data: b, isLoading, error } = useEmpDetailBasic(employeeId);

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {Array.from({ length: 4 }).map((_, i) => <DetailSkeleton key={i} rows={3} />)}
    </div>
  );

  if (error) return <DetailError message={error.message} />;
  if (!b) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <ReadCard title="Personal Information" icon={<User className="w-4 h-4" />}>
        <Grid>
          <Field label="Employee Code"  value={b.code} />
          <Field label="Gender"         value={b.gender} />
          <Field label="Nationality"    value={b.nationality} />
          <Field label="Birth Date"     value={b.birthDate} />
          <Field label="Marital Status" value={b.maritalStatus} />
        </Grid>
      </ReadCard>

      <ReadCard title="Employment Details" icon={<Briefcase className="w-4 h-4" />}>
        <Grid>
          <Field label="Employment Date"   value={b.empDate} />
          <Field label="Department"        value={b.department} />
          <Field label="Branch"            value={b.branch} />
          <Field label="Employment Type"   value={b.empType} />
          <Field label="Employment Nature" value={b.empNature} />
          <Field label="Work Arrangement"  value={b.workArr} />
        </Grid>
      </ReadCard>

      <ReadCard title="Salary Information" icon={<Landmark className="w-4 h-4" />}>
        <Grid>
          <Field label="Job Grade"         value={b.jobGrade} />
          <Field label="Job Grade Step"    value={b.jgStep} />
          <Field label="Basic Salary"      value={b.salary} />
          <Field label="Currency"          value={b.currency} />
          <Field label="Payment Frequency" value={b.salaryPayFreq} />
          <Field label="Effective Date"    value={b.effectiveFromStr} />
        </Grid>
      </ReadCard>

      <ReadCard title="Address & Contact" icon={<MapPin className="w-4 h-4" />} badge={b.addressType}>
        <Grid>
          <Field label="Country"   value={b.country} />
          <Field label="Region"    value={b.region} />
          <Field label="Subcity"   value={b.subcity} />
          <Field label="Zone"      value={b.zone} />
          <Field label="Woreda"    value={b.woreda} />
          <Field label="Kebele"    value={b.kebele} />
          <Field label="House No." value={b.houseNo} />
          <Field label="P.O. Box"  value={b.poBox} />
          <Field label="Telephone" value={b.telephone} />
          <Field label="Fax"       value={b.fax} />
          <Field label="Email"     value={b.email} />
          <Field label="Website"   value={b.website} />
        </Grid>
      </ReadCard>
    </div>
  );
});
