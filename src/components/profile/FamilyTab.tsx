import React, { useState } from 'react';
import { Users, Plus, Pencil, Trash2, ChevronDown, Check, X } from 'lucide-react';
import { useProfileFamily } from '../../services/profile/profile.queries';
import { useProfileStore } from '../../stores/profile/profile.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Field } from './shared';
import { ProfileSkeleton, ProfileError } from './ProfileLoadState';
import { Relation } from '../../types/hr/enum';

const EMPTY_FAMILY = { firstName: '', middleName: '', lastName: '', nationality: '', gender: '', relation: '' };

const GENDER_OPTS = [{ key: 'Male', label: 'Male' }, { key: 'Female', label: 'Female' }];
const RELATION_OPTS = Object.values(Relation).map((r) => ({ key: r, label: r }));

const LabeledSelect = ({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="w-full h-8 text-sm border-gray-200">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

const TextInput = ({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>
    <input
      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

function FamilyMemberFields({
  form,
  setForm,
}: {
  form: typeof EMPTY_FAMILY;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FAMILY>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <TextInput label="First Name"  value={form.firstName}   onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}   placeholder="First name" />
      <TextInput label="Middle Name" value={form.middleName}  onChange={(v) => setForm((p) => ({ ...p, middleName: v }))}  placeholder="Middle name" />
      <TextInput label="Last Name"   value={form.lastName}    onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}    placeholder="Last name" />
      <TextInput label="Nationality" value={form.nationality} onChange={(v) => setForm((p) => ({ ...p, nationality: v }))} placeholder="Ethiopian" />
      <LabeledSelect label="Gender"   value={form.gender}   onChange={(v) => setForm((p) => ({ ...p, gender: v }))}   options={GENDER_OPTS} />
      <LabeledSelect label="Relation" value={form.relation} onChange={(v) => setForm((p) => ({ ...p, relation: v }))} options={RELATION_OPTS} />
    </div>
  );
}

export function FamilyTab() {
  const { data, isLoading, error } = useProfileFamily();
  const { addFamilyMember, updateFamilyMember, deleteFamilyMember } = useProfileStore();

  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FAMILY);

  const members = data?.family ?? [];

  const getFullName = (m: { firstName: string; middleName: string; lastName: string }) =>
    [m.firstName, m.middleName, m.lastName].filter(Boolean).join(' ') || '—';

  const startEdit = (m: typeof members[0]) => {
    setForm({ firstName: m.firstName, middleName: m.middleName, lastName: m.lastName, nationality: m.nationality, gender: m.gender, relation: m.relation });
    setEditingId(m.id);
    setOpenId(m.id);
  };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FAMILY); };

  const saveEdit = () => {
    if (editingId) { updateFamilyMember(editingId, form); setEditingId(null); setForm(EMPTY_FAMILY); }
  };

  const saveNew = () => {
    if (!form.firstName.trim()) return;
    addFamilyMember(form);
    setForm(EMPTY_FAMILY);
    setAddingNew(false);
  };

  const FormActions = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => (
    <div className="flex justify-end gap-2 mt-4">
      <button onClick={onCancel}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
        <X className="w-3.5 h-3.5" />Cancel
      </button>
      <button onClick={onSave}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors">
        <Check className="w-3.5 h-3.5" />Save
      </button>
    </div>
  );

  if (isLoading) return <ProfileSkeleton rows={3} />;
  if (error) return <ProfileError message={error.message} />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Family Members</h3>
        </div>
        {!addingNew && (
          <button
            onClick={() => { setForm(EMPTY_FAMILY); setAddingNew(true); setEditingId(null); }}
            className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors px-2.5 py-1 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />Add Family
          </button>
        )}
      </div>

      {addingNew && (
        <div className="mb-4 p-4 rounded-xl border border-green-200 bg-white">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">New Family Member</p>
          <FamilyMemberFields form={form} setForm={setForm} />
          <FormActions onCancel={() => { setAddingNew(false); setForm(EMPTY_FAMILY); }} onSave={saveNew} />
        </div>
      )}

      {members.length === 0 && !addingNew && (
        <p className="text-sm text-gray-400 italic">No family members added yet.</p>
      )}

      <div className="space-y-2">
        {members.map((m) => {
          const isOpen = openId === m.id;
          const isEditingThis = editingId === m.id;
          const fullName = getFullName(m);
          return (
            <div key={m.id} className={`rounded-xl border transition-all ${isOpen ? 'border-green-200 shadow-sm' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between px-4 py-3">
                <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setOpenId(isOpen ? null : m.id)}>
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-bold shrink-0">
                    {(m.firstName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                    <p className="text-xs text-gray-400">{m.relation}{m.gender ? ` · ${m.gender}` : ''}</p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(m)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <Pencil className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => deleteFamilyMember(m.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                  <ChevronDown
                    onClick={() => setOpenId(isOpen ? null : m.id)}
                    className={`w-4 h-4 text-gray-400 transition-transform ml-1 cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  {isEditingThis ? (
                    <>
                      <FamilyMemberFields form={form} setForm={setForm} />
                      <FormActions onCancel={cancelEdit} onSave={saveEdit} />
                    </>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Field label="Full Name"   value={fullName} />
                      <Field label="Nationality" value={m.nationality} />
                      <Field label="Gender"      value={m.gender} />
                      <Field label="Relation"    value={m.relation} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
