import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Pencil, Globe, X, Check, Loader2, User } from 'lucide-react';
import { useProfileEmContact } from '../../services/profile/profile.queries';
import { useProfileStore } from '../../stores/profile/profile.store';
import { EditableField } from './EditableField';
import { Field } from './shared';
import { ProfileSkeleton, ProfileError } from './ProfileLoadState';
import { Relation } from '../../types/hr/enum';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';

const RELATION_OPTS = Object.values(Relation);
const ADDRESS_TYPE_OPTS = ['Home', 'Work', 'Permanent', 'Temporary', 'Other'];

const EMPTY_CONTACT = {
  firstName: '', firstNameAm: '', middleName: '', middleNameAm: '',
  lastName: '', lastNameAm: '', nationality: '', gender: '', relation: '',
  telephone: '', country: '', region: '', subcity: '', zone: '', woreda: '',
  kebele: '', houseNo: '', poBox: '', addressType: '', fax: '', email: '', website: '',
};

export function EmergencyTab() {
  const { data, isLoading, error } = useProfileEmContact();
  const { savingSection, saveEmergency } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_CONTACT);

  const contact = data?.contact ?? EMPTY_CONTACT;

  useEffect(() => {
    if (data?.contact) setForm(data.contact);
  }, [data]);

  const set = (key: keyof typeof form, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleEdit = () => { setForm(contact); setIsEditing(true); };
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => saveEmergency(form).then(() => setIsEditing(false));

  if (isLoading) return <ProfileSkeleton rows={6} />;
  if (error) return <ProfileError message={error.message} />;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${isEditing ? 'border-green-300 shadow-green-100' : 'border-gray-100'}`}>
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

      <div className="p-6 space-y-6">
        {/* Two columns: Personal Details left, Address right */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Personal Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Details</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <EditableField label="First Name"  value={form.firstName}   isEditing={isEditing} onChange={(v) => set('firstName', v)} />
            <EditableField label="Middle Name" value={form.middleName}  isEditing={isEditing} onChange={(v) => set('middleName', v)} />
            <EditableField label="Last Name"   value={form.lastName}    isEditing={isEditing} onChange={(v) => set('lastName', v)} />
            <EditableField label="Nationality" value={form.nationality} isEditing={isEditing} onChange={(v) => set('nationality', v)} />
            <EditableField label="Telephone"   value={form.telephone}   isEditing={isEditing} onChange={(v) => set('telephone', v)} />
            <EditableField label="Email"       value={form.email}       isEditing={isEditing} onChange={(v) => set('email', v)} />

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Gender</span>
              {isEditing ? (
                <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                  <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm font-medium text-gray-800">{contact.gender || '—'}</span>
              )}
            </div>

            {/* Relation */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Relation</span>
              {isEditing ? (
                <Select value={form.relation} onValueChange={(v) => set('relation', v)}>
                  <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATION_OPTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm font-medium text-gray-800">{contact.relation || '—'}</span>
              )}
            </div>
          </div>
          </div>

          {/* Vertical divider (desktop) / horizontal divider (mobile) */}
          <div className="hidden lg:block w-px bg-gray-100 self-stretch" />
          <div className="block lg:hidden border-t border-gray-100" />

          {/* Address */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Address</p>
              </div>
              <div className="flex items-center gap-2">
              {!isEditing && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {contact.addressType || '—'}
                </span>
              )}
               {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors px-2.5 py-1 rounded-lg"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {/* Address Type — only shown in edit mode */}
            {isEditing && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Address Type</span>
                <Select value={form.addressType} onValueChange={(v) => set('addressType', v)}>
                  <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDRESS_TYPE_OPTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <EditableField label="Country"   value={form.country}  isEditing={isEditing} onChange={(v) => set('country', v)} />
            <EditableField label="Region"    value={form.region}   isEditing={isEditing} onChange={(v) => set('region', v)} />
            <EditableField label="Subcity"   value={form.subcity}  isEditing={isEditing} onChange={(v) => set('subcity', v)} />
            <EditableField label="Zone"      value={form.zone}     isEditing={isEditing} onChange={(v) => set('zone', v)} />
            <EditableField label="Woreda"    value={form.woreda}   isEditing={isEditing} onChange={(v) => set('woreda', v)} />
            <EditableField label="Kebele"    value={form.kebele}   isEditing={isEditing} onChange={(v) => set('kebele', v)} />
            <EditableField label="House No." value={form.houseNo}  isEditing={isEditing} onChange={(v) => set('houseNo', v)} />
            <EditableField label="P.O. Box"  value={form.poBox}    isEditing={isEditing} onChange={(v) => set('poBox', v)} />
            <EditableField label="Fax"       value={form.fax}      isEditing={isEditing} onChange={(v) => set('fax', v)} />
            {isEditing ? (
              <EditableField label="Website" value={form.website}  isEditing onChange={(v) => set('website', v)} />
            ) : (
              <Field label="Website" value={contact.website}  />
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
              disabled={savingSection === 'emergency'}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={savingSection === 'emergency'}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70"
            >
              {savingSection === 'emergency'
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</>
                : <><Check className="w-3.5 h-3.5" />Save Changes</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
