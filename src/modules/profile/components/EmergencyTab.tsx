import { useState, useEffect } from "react";
import { MapPin, Pencil, X, Check, Loader2, User } from "lucide-react";
import {
  useProfileEmContact,
  useInvalidateProfile,
} from "@/modules/profile/services/profile.queries";
import { useProfileStore } from "@/modules/profile/stores/profile.store";
import type { EmergencyContactForm } from "@/modules/profile/stores/profile.store";
import { EditableField } from "@/modules/profile/components/EditableField";
import { Field } from "@/modules/profile/components/shared";
import { ProfileSkeleton, ProfileError } from "@/modules/profile/components/ProfileLoadState";
import { Relation, Gender, AddressType } from "@/shared/types/enum";
import { showToast } from "@/shared/layout/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const GENDER_OPTS = Object.entries(Gender).map(([key, label]) => ({
  key,
  label,
}));
const RELATION_OPTS = Object.entries(Relation).map(([key, label]) => ({
  key,
  label,
}));
const ADDR_TYPE_OPTS = Object.entries(AddressType).map(([key, label]) => ({
  key,
  label,
}));

const relationKey = (label: string) =>
    Object.entries(Relation).find(([, v]) => v === label)?.[0] ?? label;
const genderKey = (label: string) =>
    Object.entries(Gender).find(([, v]) => v === label)?.[0] ?? label;
const addrTypeKey = (label: string) =>
    Object.entries(AddressType).find(([, v]) => v === label)?.[0] ?? label;

const EMPTY_FORM: EmergencyContactForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  nationality: "",
  gender: "",
  relation: "",
  telephone: "",
  country: "",
  region: "",
  subcity: "",
  zone: "",
  woreda: "",
  kebele: "",
  houseNo: "",
  poBox: "",
  addressType: "",
  fax: "",
  email: "",
  website: "",
};

export function EmergencyTab() {
  const invalidateProfile = useInvalidateProfile();
  const { data, isLoading, error } = useProfileEmContact();
  const { savingSection, saveEmergency } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EmergencyContactForm>(EMPTY_FORM);

  const contact = data?.contact;

  useEffect(() => {
    if (contact) {
      setForm({
        firstName: contact.firstName,
        middleName: contact.middleName,
        lastName: contact.lastName,
        relation: relationKey(contact.relation),
        gender: genderKey(contact.gender),
        nationality: contact.nationality,
        addressType: addrTypeKey(contact.addressType),
        country: contact.country ?? "",
        region: contact.region,
        subcity: contact.subcity ?? "",
        zone: contact.zone ?? "",
        woreda: contact.woreda ?? "",
        kebele: contact.kebele ?? "",
        houseNo: contact.houseNo ?? "",
        telephone: contact.telephone,
        poBox: contact.poBox ?? "",
        fax: contact.fax ?? "",
        email: contact.email ?? "",
        website: contact.website ?? "",
      });
    }
  }, [contact]);

  const setField = (key: keyof EmergencyContactForm, val: string) =>
      setForm((p) => ({ ...p, [key]: val }));

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    if (contact) setForm({ ...EMPTY_FORM, ...contact });
    setIsEditing(false);
  };
  const handleSave = async () => {
    try {
      const message = await saveEmergency(form);
      invalidateProfile();
      showToast.success(message);
    } catch (error:any) {
      showToast.error(error.message);
    }
    setIsEditing(false);
  };

  if (isLoading) return <ProfileSkeleton rows={6} />;
  if (error) return <ProfileError message={error.message} />;

  return (
      <div
          className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${isEditing ? "border-green-300 shadow-green-100" : "border-gray-100"}`}
      >
        {/* Card header */}
        {/* <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <Heart className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Emergency Contact</h3>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors px-2.5 py-1 rounded-lg"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div> */}

        <div className=" space-y-6">
          {/* Two columns: Personal Details left, Address right */}
          <div className="flex flex-col lg:flex-row ">
            {/* Personal Details */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4 bg-linear-to-r from-emerald-50 via-green-50 to-emerald-100 border border-emerald-100 shadow-sm px-4 py-2 rounded-tl-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                    <User />{" "}
                  </div>

                  <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                    Personnel Details
                  </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors px-2.5 py-1.5 rounded-lg border border-green-100"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-6">
                <EditableField
                    label="First Name"
                    value={form.firstName}
                    isEditing={isEditing}
                    onChange={(v) => setField("firstName", v)}
                />
                <EditableField
                    label="Middle Name"
                    value={form.middleName}
                    isEditing={isEditing}
                    onChange={(v) => setField("middleName", v)}
                />
                <EditableField
                    label="Last Name"
                    value={form.lastName}
                    isEditing={isEditing}
                    onChange={(v) => setField("lastName", v)}
                />
                <EditableField
                    label="Nationality"
                    value={form.nationality}
                    isEditing={isEditing}
                    onChange={(v) => setField("nationality", v)}
                />
                <EditableField
                    label="Telephone"
                    value={form.telephone}
                    isEditing={isEditing}
                    onChange={(v) => setField("telephone", v)}
                />
                <EditableField
                    label="Email"
                    value={form.email}
                    isEditing={isEditing}
                    onChange={(v) => setField("email", v)}
                />

                {/* Gender */}
                <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Gender
                </span>
                  {isEditing ? (
                      <Select
                          value={form.gender}
                          onValueChange={(v) => setField("gender", v)}
                      >
                        <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTS.map(({ key, label }) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  ) : (
                      <span className="text-sm font-medium text-gray-800">
                    {contact?.gender || "—"}
                  </span>
                  )}
                </div>

                {/* Relation */}
                <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Relation
                </span>
                  {isEditing ? (
                      <Select
                          value={form.relation}
                          onValueChange={(v) => setField("relation", v)}
                      >
                        <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATION_OPTS.map(({ key, label }) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  ) : (
                      <span className="text-sm font-medium text-gray-800">
                    {contact?.relation || "—"}
                  </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vertical divider (desktop) / horizontal divider (mobile) */}
            <div className="hidden lg:block w-px bg-gray-100 self-stretch" />
            <div className="block lg:hidden border-t border-gray-100" />

            {/* Address */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4 bg-linear-to-r from-emerald-50 via-green-50 to-emerald-100 border border-emerald-100 shadow-sm px-4 py-2 rounded-tr-xl">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                    <MapPin />
                  </div>
                  <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                    Address
                  </p>
                </div>
                {!isEditing && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {contact?.addressType || "—"}
                </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-6">
                {isEditing && (
                    <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Address Type
                  </span>
                      <Select
                          value={form.addressType}
                          onValueChange={(v) => setField("addressType", v)}
                      >
                        <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ADDR_TYPE_OPTS.map(({ key, label }) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                )}
                <EditableField
                    label="Country"
                    value={form.country}
                    isEditing={isEditing}
                    onChange={(v) => setField("country", v)}
                />
                <EditableField
                    label="Region"
                    value={form.region}
                    isEditing={isEditing}
                    onChange={(v) => setField("region", v)}
                />
                <EditableField
                    label="Subcity"
                    value={form.subcity}
                    isEditing={isEditing}
                    onChange={(v) => setField("subcity", v)}
                />
                <EditableField
                    label="Zone"
                    value={form.zone}
                    isEditing={isEditing}
                    onChange={(v) => setField("zone", v)}
                />
                <EditableField
                    label="Woreda"
                    value={form.woreda}
                    isEditing={isEditing}
                    onChange={(v) => setField("woreda", v)}
                />
                <EditableField
                    label="Kebele"
                    value={form.kebele}
                    isEditing={isEditing}
                    onChange={(v) => setField("kebele", v)}
                />
                <EditableField
                    label="House No."
                    value={form.houseNo}
                    isEditing={isEditing}
                    onChange={(v) => setField("houseNo", v)}
                />
                <EditableField
                    label="P.O. Box"
                    value={form.poBox}
                    isEditing={isEditing}
                    onChange={(v) => setField("poBox", v)}
                />
                <EditableField
                    label="Fax"
                    value={form.fax}
                    isEditing={isEditing}
                    onChange={(v) => setField("fax", v)}
                />
                {isEditing ? (
                    <EditableField
                        label="Website"
                        value={form.website}
                        isEditing
                        onChange={(v) => setField("website", v)}
                    />
                ) : (
                    <Field label="Website" value={contact?.website} />
                )}
              </div>
            </div>
          </div>

          {/* Save / Cancel */}
          {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={savingSection === "emergency"}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={savingSection === "emergency"}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70"
                >
                  {savingSection === "emergency" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                  ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                  )}
                </button>
              </div>
          )}
        </div>
      </div>
  );
}
