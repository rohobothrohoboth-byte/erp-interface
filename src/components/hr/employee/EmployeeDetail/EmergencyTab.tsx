import { memo } from 'react';
import { User, MapPin } from 'lucide-react';
import { useEmpDetailContact } from './empDetail.queries';
import { ReadCard, Grid, Field } from './shared';
import { DetailSkeleton, DetailError } from './LoadState';

export const EmergencyTab = memo(function EmergencyTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading, error } = useEmpDetailContact(employeeId);

  if (isLoading) return <DetailSkeleton rows={6} />;
  if (error) return <DetailError message={error.message} />;

  const contact = data?.contact;

  if (!contact) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <p className="text-sm text-gray-400 italic">No emergency contact on record.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Personal Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Details</p>
          </div>
          <Grid>
            <Field label="First Name"  value={contact.firstName} />
            <Field label="Middle Name" value={contact.middleName} />
            <Field label="Last Name"   value={contact.lastName} />
            <Field label="Nationality" value={contact.nationality} />
            <Field label="Gender"      value={contact.gender} />
            <Field label="Relation"    value={contact.relation} />
            <Field label="Telephone"   value={contact.telephone} />
            <Field label="Email"       value={contact.email} />
          </Grid>
        </div>

        <div className="hidden lg:block w-px bg-gray-100 self-stretch" />
        <div className="block lg:hidden border-t border-gray-100" />

        {/* Address */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Address</p>
            </div>
            {contact.addressType && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {contact.addressType}
              </span>
            )}
          </div>
          <Grid>
            <Field label="Country"   value={contact.country} />
            <Field label="Region"    value={contact.region} />
            <Field label="Subcity"   value={contact.subcity} />
            <Field label="Zone"      value={contact.zone} />
            <Field label="Woreda"    value={contact.woreda} />
            <Field label="Kebele"    value={contact.kebele} />
            <Field label="House No." value={contact.houseNo} />
            <Field label="P.O. Box"  value={contact.poBox} />
            <Field label="Fax"       value={contact.fax} />
            <Field label="Website"   value={contact.website} />
          </Grid>
        </div>
      </div>
    </div>
  );
});
