import React, { useState, useEffect } from 'react';
import { FileText, Landmark, Pencil, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileBio } from '../../services/profile/profile.queries';
import { profileKeys } from '../../services/profile/profile.queries';
import { useProfileStore } from '../../stores/profile/profile.store';
import type { BiographicalForm, FinancialForm } from '../../stores/profile/profile.store';
import { InlineEditCard } from './InlineEditCard';
import { EditableField } from './EditableField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Field, Grid } from './shared';
import { ProfileSkeleton, ProfileError } from './ProfileLoadState';

export function BiographicalTab() {
  const queryClient = useQueryClient();
  const { data: bio, isLoading, error } = useProfileBio();

  const {
    editingSection, savingSection,
    setEditingSection,
    saveBiographical, saveFinancial,
  } = useProfileStore();

  const bioEditing = editingSection === 'biographical';
  const finEditing = editingSection === 'financial';

  // Seed form state from API data
  const [bioForm, setBioForm] = useState<BiographicalForm>({
    birthLocation: '', motherFullName: '',
    hasBirthCert: '', hasMarriageCert: '',
  });

  const [finForm, setFinForm] = useState<FinancialForm>({
    tin: '', bankAccountNo: '', pensionNumber: '',
  });

  useEffect(() => {
    if (bio) {
      setBioForm({
        birthLocation:  bio.birthLocation,
        motherFullName: bio.motherFullName,
        hasBirthCert:   bio.hasBirthCertStr,
        hasMarriageCert: bio.hasMarriageCertStr,
      });
      setFinForm({
        tin:           bio.tin,
        bankAccountNo: bio.bankAccountNo,
        pensionNumber: bio.pensionNumber,
      });
    }
  }, [bio]);

  const bioHasData = !!(bio?.birthLocation || bio?.motherFullName);
  const finHasData = !!(bio?.tin || bio?.bankAccountNo || bio?.pensionNumber);

  const handleSaveBio = async () => {
    await saveBiographical(bioForm);
    queryClient.invalidateQueries({ queryKey: profileKeys.bio() });
  };

  const handleSaveFin = async () => {
    await saveFinancial(finForm);
    queryClient.invalidateQueries({ queryKey: profileKeys.bio() });
  };

  const ActionBtn = ({ hasData, onEdit }: { hasData: boolean; onEdit: () => void }) => (
    <button
      onClick={onEdit}
      className="flex items-center gap-1.5 text-xs font-medium transition-colors px-2.5 py-1 rounded-lg text-green-600 bg-green-50 hover:bg-green-100"
    >
      {hasData ? <><Pencil className="w-3.5 h-3.5" />Edit</> : <><Plus className="w-3.5 h-3.5" />Add</>}
    </button>
  );

  const CertUpload = ({ fileKey, nameKey, label }: {
    fileKey: 'birthCertFile' | 'marriageCertFile';
    nameKey: 'birthCertFileName' | 'marriageCertFileName';
    label: string;
  }) => {
    const fileName = bioForm[nameKey];
    return (
      <div className="col-span-2 flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>
        <label className="flex items-center gap-3 cursor-pointer border border-dashed border-green-300 bg-green-50/40 rounded-xl px-4 py-3 hover:bg-green-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            {fileName
              ? <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
              : <p className="text-sm text-gray-400">Click to upload file</p>
            }
            <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG accepted</p>
          </div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setBioForm((p) => ({ ...p, [fileKey]: file, [nameKey]: file?.name ?? '' }));
            }}
          />
        </label>
      </div>
    );
  };

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <ProfileSkeleton rows={3} />
      <ProfileSkeleton rows={2} />
    </div>
  );

  if (error) return <ProfileError message={error.message} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Personal Details */}
      <InlineEditCard
        title="Personal Details"
        icon={<FileText className="w-4 h-4" />}
        isEditing={bioEditing}
        isSaving={savingSection === 'biographical'}
        onEdit={() => { setBioForm({ birthLocation: bio?.birthLocation ?? '', motherFullName: bio?.motherFullName ?? '', hasBirthCert: bio?.hasBirthCertStr ?? '', hasMarriageCert: bio?.hasMarriageCertStr ?? '' }); setEditingSection('biographical'); }}
        onCancel={() => setEditingSection(null)}
        onSave={handleSaveBio}
        actionOverride={!bioEditing ? <ActionBtn hasData={bioHasData} onEdit={() => { setBioForm({ birthLocation: bio?.birthLocation ?? '', motherFullName: bio?.motherFullName ?? '', hasBirthCert: bio?.hasBirthCertStr ?? '', hasMarriageCert: bio?.hasMarriageCertStr ?? '' }); setEditingSection('biographical'); }} /> : undefined}
      >
        {!bioHasData && !bioEditing ? (
          <p className="text-sm text-gray-400 italic">No personal details added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <EditableField label="Birth Location" value={bioForm.birthLocation} isEditing={bioEditing}
              onChange={(v) => setBioForm((p) => ({ ...p, birthLocation: v }))} placeholder="Addis Ababa" />
            <EditableField label="Mother's Full Name" value={bioForm.motherFullName} isEditing={bioEditing}
              onChange={(v) => setBioForm((p) => ({ ...p, motherFullName: v }))} placeholder="Full name" />

            {bioEditing ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Has Birth Certificate</label>
                  <Select value={bioForm.hasBirthCert || ''} onValueChange={(v) => setBioForm((p) => ({ ...p, hasBirthCert: v }))}>
                    <SelectTrigger className="w-full h-8 text-sm border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {bioForm.hasBirthCert === 'Yes' && (
                  <CertUpload fileKey="birthCertFile" nameKey="birthCertFileName" label="Upload Birth Certificate" />
                )}
              </>
            ) : (
              <Field label="Has Birth Certificate" value={bio?.hasBirthCertStr} />
            )}

            {bioEditing ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Has Marriage Certificate</label>
                  <Select value={bioForm.hasMarriageCert || ''} onValueChange={(v) => setBioForm((p) => ({ ...p, hasMarriageCert: v }))}>
                    <SelectTrigger className="w-full h-8 text-sm border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {bioForm.hasMarriageCert === 'Yes' && (
                  <CertUpload fileKey="marriageCertFile" nameKey="marriageCertFileName" label="Upload Marriage Certificate" />
                )}
              </>
            ) : (
              <Field label="Has Marriage Certificate" value={bio?.hasMarriageCertStr} />
            )}
          </div>
        )}
      </InlineEditCard>

      {/* Financial Information */}
      <InlineEditCard
        title="Financial Information"
        icon={<Landmark className="w-4 h-4" />}
        isEditing={finEditing}
        isSaving={savingSection === 'financial'}
        onEdit={() => { setFinForm({ tin: bio?.tin ?? '', bankAccountNo: bio?.bankAccountNo ?? '', pensionNumber: bio?.pensionNumber ?? '' }); setEditingSection('financial'); }}
        onCancel={() => setEditingSection(null)}
        onSave={handleSaveFin}
        actionOverride={!finEditing ? <ActionBtn hasData={finHasData} onEdit={() => { setFinForm({ tin: bio?.tin ?? '', bankAccountNo: bio?.bankAccountNo ?? '', pensionNumber: bio?.pensionNumber ?? '' }); setEditingSection('financial'); }} /> : undefined}
      >
        {!finHasData && !finEditing ? (
          <p className="text-sm text-gray-400 italic">No financial information added yet.</p>
        ) : (
          <Grid>
            <EditableField label="TIN Number" value={finForm.tin} isEditing={finEditing}
              onChange={(v) => setFinForm((p) => ({ ...p, tin: v }))} placeholder="123456789" />
            <EditableField label="Bank Account No." value={finForm.bankAccountNo} isEditing={finEditing}
              onChange={(v) => setFinForm((p) => ({ ...p, bankAccountNo: v }))} placeholder="100023456789" />
            <EditableField label="Pension Number" value={finForm.pensionNumber} isEditing={finEditing}
              onChange={(v) => setFinForm((p) => ({ ...p, pensionNumber: v }))} placeholder="PEN-12345" />
          </Grid>
        )}
      </InlineEditCard>
    </div>
  );
}
