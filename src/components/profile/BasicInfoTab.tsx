import { User, Briefcase, Landmark, MapPin } from 'lucide-react';
import { useProfileBasic } from '../../services/profile/profile.queries';
import { ReadCard, Grid, Field } from './shared';
import { ProfileSkeleton, ProfileError } from './ProfileLoadState';

export function BasicInfoTab() {
  const { data: b, isLoading, error } = useProfileBasic();

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {Array.from({ length: 4 }).map((_, i) => <ProfileSkeleton key={i} rows={3} />)}
    </div>
  );

  if (error) return <ProfileError message={error.message} />;
  if (!b) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <ReadCard title="Personal Information" icon={<User className="w-4 h-4" />}>
        <Grid>
          <Field label="Employee Code"   value={b.code} />
          <Field label="Gender"          value={b.gender} />
          <Field label="Nationality"     value={b.nationality} />
          <Field label="Birth Date"      value={b.birthDate} />
          <Field label="Marital Status"  value={b.maritalStatus} />
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
          <Field label="Job Grade"          value={b.jobGrade} />
          <Field label="Job Grade Step"     value={b.jgStep} />
          <Field label="Basic Salary"       value={b.salary} />
          <Field label="Currency"           value={b.currency} />
          <Field label="Payment Frequency"  value={b.salaryPayFreq} />
          <Field label="Effective Date"     value={b.effectiveFromStr} />
        </Grid>
      </ReadCard>

      {/* Address & Contact — address type as badge */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Address & Contact</h3>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            {b.addressTypeStr}
          </span>
        </div>
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
      </div>
    </div>
  );
}
