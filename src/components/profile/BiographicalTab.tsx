import { memo, useState, useEffect, useCallback } from 'react';
import { FileText, Landmark, Pencil, ExternalLink } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileBio, profileKeys } from '../../services/profile/profile.queries';
import { useProfileStore } from '../../stores/profile/profile.store';
import type { BiographicalForm, FinancialForm } from '../../stores/profile/profile.store';
import { InlineEditCard } from './InlineEditCard';
import { EditableField } from './EditableField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Field, Grid } from './shared';
import { ProfileSkeleton, ProfileError } from './ProfileLoadState';
import { fetchCertBlobUrl } from '../../services/hr/employee/empDetail/empDetail.api';
import { showToast } from '../../layout/layout';

async function openCertBlob(certId: string) {
  const url = await fetchCertBlobUrl(certId);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
import EnumSelect from '../ui/enumSelect';
import { YesNo } from '../../types/hr/enum';
import SelectEnum from '../ui/selectEnum';

// ── Sub-components defined outside BiographicalTab so they never remount ──

const ActionBtn = memo(({ onEdit }: { onEdit: () => void }) => (
  <button
    onClick={onEdit}
    className="flex items-center gap-1.5 text-xs font-medium transition-colors px-2.5 py-1 rounded-lg text-green-600 bg-green-50 hover:bg-green-100"
  >
    <Pencil className="w-3.5 h-3.5" /> Edit
  </button>
));

const CertUpload = memo(({ fileName, onFile, label }: {
  fileName?: string;
  onFile: (file: File | null, name: string) => void;
  label: string;
}) => (
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
          onFile(file, file?.name ?? '');
        }}
      />
    </label>
  </div>
));

// ── Main component ─────────────────────────────────────────────────────────

export const BiographicalTab = memo(function BiographicalTab() {
  const queryClient = useQueryClient();
  const { data: bio, isLoading, error } = useProfileBio();
  const { editingSection, savingSection, setEditingSection, saveBiographical, saveFinancial } = useProfileStore();

  const bioEditing = editingSection === 'biographical';
  const finEditing = editingSection === 'financial';

  const [bioForm, setBioForm] = useState<BiographicalForm>({
    birthLocation: '', motherFullName: '', hasBirthCert: '', hasMarriageCert: '',
  });
  const [finForm, setFinForm] = useState<FinancialForm>({
    tin: '', bankAccountNo: '', pensionNumber: '',
  });

  useEffect(() => {
    if (bio) {
      setBioForm({ birthLocation: bio.birthLocation, motherFullName: bio.motherFullName, hasBirthCert: bio.hasBirthCert, hasMarriageCert: bio.hasMarriageCert });
      setFinForm({ tin: bio.tin, bankAccountNo: bio.bankAccountNo, pensionNumber: bio.pensionNumber });
    }
  }, [bio]);

  const handleSaveBio = useCallback(async () => {
    try {
      await saveBiographical(bio?.id ?? '', bioForm);
      queryClient.invalidateQueries({ queryKey: profileKeys.bio() });
      showToast.success('Personal details updated successfully!');
    } catch {
      showToast.error('Failed to update personal details.');
    }
  }, [bio?.id, bioForm, saveBiographical, queryClient]);

  const handleSaveFin = useCallback(async () => {
    try {
      await saveFinancial(bio?.id ?? '', finForm);
      queryClient.invalidateQueries({ queryKey: profileKeys.bio() });
      showToast.success('Financial information updated successfully!');
    } catch {
      showToast.error('Failed to update financial information.');
    }
  }, [bio?.id, finForm, saveFinancial, queryClient]);

  const openBioEdit = useCallback(() => {
    setBioForm({ birthLocation: bio?.birthLocation ?? '', motherFullName: bio?.motherFullName ?? '', hasBirthCert: bio?.hasBirthCert ?? '', hasMarriageCert: bio?.hasMarriageCert ?? '' });
    setEditingSection('biographical');
  }, [bio, setEditingSection]);

  const openFinEdit = useCallback(() => {
    setFinForm({ tin: bio?.tin ?? '', bankAccountNo: bio?.bankAccountNo ?? '', pensionNumber: bio?.pensionNumber ?? '' });
    setEditingSection('financial');
  }, [bio, setEditingSection]);

  const cancelEdit = useCallback(() => setEditingSection(null), [setEditingSection]);

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
        onEdit={openBioEdit}
        onCancel={cancelEdit}
        onSave={handleSaveBio}
        actionOverride={!bioEditing ? <ActionBtn onEdit={openBioEdit} /> : undefined}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <EditableField label="Birth Location"    value={bioForm.birthLocation}  isEditing={bioEditing} onChange={(v) => setBioForm((p) => ({ ...p, birthLocation: v }))}  placeholder="Addis Ababa" />
          <EditableField label="Mother's Full Name" value={bioForm.motherFullName} isEditing={bioEditing} onChange={(v) => setBioForm((p) => ({ ...p, motherFullName: v }))} placeholder="Full name" />

          {bioEditing ? (
          <>
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
      Has Birth Certificate
    </label>

    <SelectEnum
      enumObject={YesNo}
      value={bioForm.hasBirthCert || ''}
      onChange={(value) =>
        setBioForm((p) => ({
          ...p,
          hasBirthCert: value,
        }))
      }
      placeholder="Select"
    />
  </div>

  {bioForm.hasBirthCert === '0' && (
    <CertUpload
      fileName={bioForm.birthCertFileName}
      label="Upload Birth Certificate"
      onFile={(file, name) =>
        setBioForm((p) => ({
          ...p,
          birthCertFile: file,
          birthCertFileName: name,
        }))
      }
    />
  )}
</>
          ) : (
            <Field label="Has Birth Certificate" value={bio?.hasBirthCert} />
          )}

          {bioEditing ? (
            <>
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
      Has Marriage Certificate
    </label>

    <SelectEnum
      enumObject={YesNo}
      value={bioForm.hasMarriageCert || ''}
      onChange={(value) =>
        setBioForm((p) => ({
          ...p,
          hasMarriageCert: value,
        }))
      }
      placeholder="Select"
    />
  </div>

  {bioForm.hasMarriageCert === '0' && (
    <CertUpload
      fileName={bioForm.marriageCertFileName}
      label="Upload Marriage Certificate"
      onFile={(file, name) =>
        setBioForm((p) => ({
          ...p,
          marriageCertFile: file,
          marriageCertFileName: name,
        }))
      }
    />
  )}
</>
          ) : (
            <Field label="Has Marriage Certificate" value={bio?.hasMarriageCert} />
          )}
        </div>

        {/* Document pills — split left/right */}
        {!bioEditing && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Documents</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Birth Certificate */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full w-fit">
                  Birth Certificate
                </span>
                {bio?.biCertId ? (
                  <>
                    <p className="text-xs text-gray-500">{bio.biCertType} · {bio.biCertSize}</p>
                    <button
                      onClick={() => openCertBlob(bio.biCertId!)}
                      className="flex items-center gap-1 text-[11px] font-medium text-green-600 hover:text-green-700 w-fit"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic">No file uploaded</p>
                )}
              </div>

              {/* Marriage Certificate */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full w-fit">
                  Marriage Certificate
                </span>
                {bio?.maCertId ? (
                  <>
                    <p className="text-xs text-gray-500">{bio.maCertType} · {bio.maCertSize}</p>
                    <button
                      onClick={() => openCertBlob(bio.maCertId!)}
                      className="flex items-center gap-1 text-[11px] font-medium text-green-600 hover:text-green-700 w-fit"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic">No file uploaded</p>
                )}
              </div>
            </div>
          </div>
        )}
      </InlineEditCard>

      {/* Financial Information */}
      <InlineEditCard
        title="Financial Information"
        icon={<Landmark className="w-4 h-4" />}
        isEditing={finEditing}
        isSaving={savingSection === 'financial'}
        onEdit={openFinEdit}
        onCancel={cancelEdit}
        onSave={handleSaveFin}
        actionOverride={!finEditing ? <ActionBtn onEdit={openFinEdit} /> : undefined}
      >
        <Grid>
          <EditableField label="TIN Number"       value={finForm.tin}           isEditing={finEditing} onChange={(v) => setFinForm((p) => ({ ...p, tin: v }))}           placeholder="123456789" />
          <EditableField label="Bank Account No."  value={finForm.bankAccountNo} isEditing={finEditing} onChange={(v) => setFinForm((p) => ({ ...p, bankAccountNo: v }))} placeholder="100023456789" />
          <EditableField label="Pension Number"    value={finForm.pensionNumber} isEditing={finEditing} onChange={(v) => setFinForm((p) => ({ ...p, pensionNumber: v }))} placeholder="PEN-12345" />
        </Grid>
      </InlineEditCard>

    </div>
  );
});

