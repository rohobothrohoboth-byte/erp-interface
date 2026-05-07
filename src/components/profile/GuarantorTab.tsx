import React from 'react';
import { Shield, FileText, MapPin, Mail, Globe } from 'lucide-react';
import { useProfileStore } from '../../stores/profile/profile.store';
import { ReadCard, Grid, Field } from './shared';

export function GuarantorTab() {
  const { guarantor } = useProfileStore();

  const fullName = [guarantor?.firstName, guarantor?.middleName, guarantor?.lastName]
    .filter(Boolean).join(' ') || '—';

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left column: Details + Document */}
      <div className="flex flex-col gap-6 flex-1 w-full">
        <ReadCard title="Guarantor Details" icon={<Shield className="w-4 h-4" />}>
          <Grid>
            <Field label="Full Name"   value={fullName} />
            <Field label="Nationality" value={guarantor?.nationality} />
            <Field label="Gender"      value={guarantor?.gender} />
            <Field label="Relation"    value={guarantor?.relation} />
            <Field label="Telephone"   value={guarantor?.telephone} />
            <Field label="Email"       value={guarantor?.email} icon={<Mail className="w-3 h-3" />} />
          </Grid>
        </ReadCard>

        <ReadCard title="Guarantor Document" icon={<FileText className="w-4 h-4" />}>
          <Grid>
            <Field label="File Name" value={guarantor.fileName} />
            <Field label="File Type" value={guarantor.fileType} />
            <Field label="File Size" value={guarantor.fileSize} />
          </Grid>
        </ReadCard>
      </div>

      {/* Right column: Address */}
      <div className="flex-1 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Address</h3>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {guarantor.addressType || '—'}
            </span>
          </div>
          <Grid>
            {/* <Field label="Address Type" value={guarantor.addressType} /> */}
            <Field label="Country"      value={guarantor.country} />
            <Field label="Region"       value={guarantor.region} />
            <Field label="Subcity"      value={guarantor.subcity} />
            <Field label="Zone"         value={guarantor.zone} />
            <Field label="Woreda"       value={guarantor.woreda} />
            <Field label="Kebele"       value={guarantor.kebele} />
            <Field label="House No."    value={guarantor.houseNo} />
            <Field label="P.O. Box"     value={guarantor.poBox} />
            <Field label="Fax"          value={guarantor.fax} />
            <Field label="Website"      value={guarantor.website} icon={<Globe className="w-3 h-3" />} />
          </Grid>
        </div>
      </div>
    </div>
  );
}
