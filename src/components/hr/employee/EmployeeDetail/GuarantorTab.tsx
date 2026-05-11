import { memo } from 'react';
import { Shield, FileText, MapPin } from 'lucide-react';
import { useEmpDetailGuarantor } from './empDetail.queries';
import { ReadCard, Grid, Field } from './shared';
import { DetailSkeleton, DetailError } from './LoadState';

export const GuarantorTab = memo(function GuarantorTab({ employeeId }: { employeeId: string }) {
  const { data: g, isLoading, error } = useEmpDetailGuarantor(employeeId);

  if (isLoading) return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex flex-col gap-6 flex-1 w-full">
        <DetailSkeleton rows={3} />
        <DetailSkeleton rows={2} />
      </div>
      <div className="flex-1 w-full"><DetailSkeleton rows={5} /></div>
    </div>
  );
  if (error) return <DetailError message={error.message} />;
  if (!g) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <p className="text-sm text-gray-400 italic">No guarantor on record.</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex flex-col gap-6 flex-1 w-full">
        <ReadCard title="Guarantor Details" icon={<Shield className="w-4 h-4" />}>
          <Grid>
            <Field label="Full Name"   value={g.fullName} />
            <Field label="Nationality" value={g.nationality} />
            <Field label="Gender"      value={g.gender} />
            <Field label="Relation"    value={g.relation} />
            <Field label="Telephone"   value={g.telephone} />
            <Field label="Email"       value={g.email} />
          </Grid>
        </ReadCard>

        <ReadCard title="Guarantor Document" icon={<FileText className="w-4 h-4" />}>
          <Grid>
            <Field label="File Name" value={g.fileName} />
            <Field label="File Type" value={g.contentType} />
            <Field label="File Size" value={g.fileSizeStr} />
          </Grid>
        </ReadCard>
      </div>

      <div className="flex-1 w-full">
        <ReadCard title="Address" icon={<MapPin className="w-4 h-4" />} badge={g.addressType}>
          <Grid>
            <Field label="Country"   value={g.country} />
            <Field label="Region"    value={g.region} />
            <Field label="Subcity"   value={g.subcity} />
            <Field label="Zone"      value={g.zone} />
            <Field label="Woreda"    value={g.woreda} />
            <Field label="Kebele"    value={g.kebele} />
            <Field label="House No." value={g.houseNo} />
            <Field label="P.O. Box"  value={g.poBox} />
            <Field label="Fax"       value={g.fax} />
            <Field label="Website"   value={g.website} />
          </Grid>
        </ReadCard>
      </div>
    </div>
  );
});
