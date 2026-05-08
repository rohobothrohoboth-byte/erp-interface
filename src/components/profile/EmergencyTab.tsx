import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Pencil, Globe, X, Check, Loader2 } from 'lucide-react';
import { useProfileEmContact } from '../../services/profile/profile.queries';
import { useProfileStore } from '../../stores/profile/profile.store';
import { EditableField } from './EditableField';
import { Grid, Field } from './shared';
import { InlineEditCard } from './InlineEditCard';
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

type EditingSection = 'contact' | 'address' | null;

export function EmergencyTab() {
  const { data, isLoading, error } = useProfileEmContact();
  const { savingSection, saveEmergency } = useProfileStore();

  const [editing, setEditing] = useState<EditingSection>(null);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT);
  const [addressForm, setAddressForm] = useState(EMPTY_CONTACT);

  // Seed forms from API data
  useEffect(() => {
    if (data?.contact) {
      setContactForm(data.contact);
      setAddressForm(data.contact);
    }
  }, [data]);

  const contact = data?.contact ?? EMPTY_CONTACT;

  const setC = (key: keyof typeof contactForm, val: string) =>
    setContactForm((p) => ({ ...p, [key]: val }));
  const setA = (key: keyof typeof addressForm, val: string) =>
    setAddressForm((p) => ({ ...p, [key]: val }));

  const isEditingContact = editing === 'contact';
  const isEditingAddress = editing === 'address';

  const handleEditContact = () => { setContactForm(contact); setEditing('contact'); };
  const handleEditAddress = () => { setAddressForm(contact); setEditing('address'); };
  const handleSaveContact = () => saveEmergency({ ...contact, ...contactForm });
  const handleSaveAddress = () => saveEmergency({ ...contact, ...addressForm });

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <ProfileSkeleton rows={4} />
      <ProfileSkeleton rows={4} />
    </div>
  );

  if (error) return <ProfileError message={error.message} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Contact details */}
      <InlineEditCard
        title="Emergency Contact"
        icon={<Heart className="w-4 h-4" />}
        isEditing={isEditingContact}
        isSaving={savingSection === 'emergency'}
        onEdit={handleEditContact}
        onCancel={() => setEditing(null)}
        onSave={handleSaveContact}
        actionOverride={!isEditingContact ? (
          <button
            onClick={handleEditContact}
            className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors px-2.5 py-1 rounded-lg"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        ) : undefined}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <EditableField label="First Name"  value={contactForm.firstName}   isEditing={isEditingContact} onChange={(v) => setC('firstName', v)} />
            <EditableField label="Middle Name" value={contactForm.middleName}  isEditing={isEditingContact} onChange={(v) => setC('middleName', v)} />
            <EditableField label="Last Name"   value={contactForm.lastName}    isEditing={isEditingContact} onChange={(v) => setC('lastName', v)} />
            <EditableField label="Nationality" value={contactForm.nationality} isEditing={isEditingContact} onChange={(v) => setC('nationality', v)} />
            <EditableField label="Telephone"   value={contactForm.telephone}   isEditing={isEditingContact} onChange={(v) => setC('telephone', v)} />
            <EditableField label="Email"       value={contactForm.email}       isEditing={isEditingContact} onChange={(v) => setC('email', v)} />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Gender</span>
              {isEditingContact ? (
                <Select value={contactForm.gender} onValueChange={(v) => setC('gender', v)}>
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

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Relation</span>
              {isEditingContact ? (
                <Select value={contactForm.relation} onValueChange={(v) => setC('relation', v)}>
                  <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATION_OPTS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm font-medium text-gray-800">{contact.relation || '—'}</span>
              )}
            </div>
          </div>
      </InlineEditCard>

      {/* Address */}
      <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-all duration-200 ${isEditingAddress ? 'border-green-300 shadow-green-100' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Address</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {contact.addressType || '—'}
            </span>
            {!isEditingAddress && (
              <button
                onClick={handleEditAddress}
                className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors px-2.5 py-1 rounded-lg"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>

        {isEditingAddress ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Address Type</span>
              <Select value={addressForm.addressType} onValueChange={(v) => setA('addressType', v)}>
                <SelectTrigger className="w-full text-sm border-gray-200 focus:border-green-400">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_TYPE_OPTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <EditableField label="Country"   value={addressForm.country}  isEditing onChange={(v) => setA('country', v)} />
            <EditableField label="Region"    value={addressForm.region}   isEditing onChange={(v) => setA('region', v)} />
            <EditableField label="Subcity"   value={addressForm.subcity}  isEditing onChange={(v) => setA('subcity', v)} />
            <EditableField label="Zone"      value={addressForm.zone}     isEditing onChange={(v) => setA('zone', v)} />
            <EditableField label="Woreda"    value={addressForm.woreda}   isEditing onChange={(v) => setA('woreda', v)} />
            <EditableField label="Kebele"    value={addressForm.kebele}   isEditing onChange={(v) => setA('kebele', v)} />
            <EditableField label="House No." value={addressForm.houseNo}  isEditing onChange={(v) => setA('houseNo', v)} />
            <EditableField label="P.O. Box"  value={addressForm.poBox}    isEditing onChange={(v) => setA('poBox', v)} />
            <EditableField label="Fax"       value={addressForm.fax}      isEditing onChange={(v) => setA('fax', v)} />
            <EditableField label="Website"   value={addressForm.website}  isEditing onChange={(v) => setA('website', v)} />
          </div>
        ) : (
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
            <Field label="Website"   value={contact.website} icon={<Globe className="w-3 h-3" />} />
          </Grid>
        )}

        {isEditingAddress && (
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={savingSection === 'emergency'}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAddress}
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
