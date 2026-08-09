import { Shield, FileText, MapPin } from "lucide-react";
import { useEmpGurantor } from "../../services/profile/profile.queries";
import { ReadCard, Grid, Field } from "./shared";
import { ProfileSkeleton, ProfileError } from "./ProfileLoadState";

export function GuarantorTab() {
  const { data: g, isLoading, error } = useEmpGurantor();

  if (isLoading)
    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex flex-col gap-6 flex-1 w-full">
            <ProfileSkeleton rows={3} />
            <ProfileSkeleton rows={2} />
          </div>
          <div className="flex-1 w-full">
            <ProfileSkeleton rows={5} />
          </div>
        </div>
    );
  if (error) return <ProfileError message={error.message} />;

  return (
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left column: Details + Document */}
        <div className="flex flex-col gap-6 flex-1 w-full">
          <ReadCard
              title="Guarantor Details"
              icon={<Shield className="w-4 h-4" />}
          >
            <Grid>
              <Field label="Full Name" value={g?.fullName} />
              <Field label="Nationality" value={g?.nationality} />
              <Field label="Gender" value={g?.gender} />
              <Field label="Relation" value={g?.relation} />
              <Field label="Telephone" value={g?.telephone} />
              <Field label="Email" value={g?.email} />
            </Grid>
          </ReadCard>

          <ReadCard
              title="Guarantor Document"
              icon={<FileText className="w-4 h-4" />}
          >
            <Grid>
              <Field label="File Name" value={g?.fileName} />
              <Field label="File Type" value={g?.contentType} />
              <Field label="File Size" value={g?.fileSizeStr} />
            </Grid>
          </ReadCard>
        </div>

        {/* Right column: Address */}
        <div className="flex-1 w-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5 px-5 py-2 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 border-b border-emerald-100 rounded-t-2xl">
              <div className="flex items-center gap-2 ">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                  Address
                </h3>
              </div>
              {g?.addressType && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {g.addressType}
              </span>
              )}
            </div>
            <div className="px-6 pb-4">
              <Grid>
                <Field label="Country" value={g?.country} />
                <Field label="Region" value={g?.region} />
                <Field label="Subcity" value={g?.subcity} />
                <Field label="Zone" value={g?.zone} />
                <Field label="Woreda" value={g?.woreda} />
                <Field label="Kebele" value={g?.kebele} />
                <Field label="House No." value={g?.houseNo} />
                <Field label="P.O. Box" value={g?.poBox} />
                <Field label="Fax" value={g?.fax} />
                <Field label="Website" value={g?.website} />
              </Grid>
            </div>
          </div>
        </div>
      </div>
  );
}
