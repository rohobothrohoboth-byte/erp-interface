import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveGridPattern } from '../components/ui/interactive-grid-pattern';
import { cn } from '../lib/utils';
import {
  User, Briefcase, Shield, MapPin, Mail, Globe, Phone,
  Heart, FileText, Download, Edit, Building2, Calendar,
  UserCheck, Landmark, Clock, Star, Award, Users,
  Plus, Trash2, ChevronDown, Check, X, Pencil,
} from 'lucide-react';
import { useProfileStore } from '../stores/profile/profile.store';
import { InlineEditCard } from '../components/profile/InlineEditCard';
import { EditableField } from '../components/profile/EditableField';
import { EmpPhotoCircle } from '../components/ui/EmpPhoto';
import type { EmpPhotoRes } from '../types/hr/employee/empPhoto';
import { EmpState } from '../types/hr/enum';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Attendance data for current month
const attendanceData = {
  attended: 18,
  workingDays: 23,
  month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
};

// Static (HR-managed) employee data
const empData = {
  photo: '/api/placeholder/150/150',
  fullName: 'John Smith',
  fullNameAm: 'ጆን ሚት',
  code: 'EMP-001',
  gender: 'Male',
  nationality: 'Ethiopian',
  employmentDate: '2023-01-15',
  jobGrade: 'Senior Specialist',
  jobGradeStep: 'level 3',
  basicSalary: 'ETB 25,000',
  salaryCurrency: 'ETB',
  paymentFrequency: 'Monthly',
  salaryEffectiveDate: '2024-01-01',
  position: 'Senior Software Engineer',
  department: 'Technology',
  branch: 'Head Office',
  employmentType: 'Full-time',
  employmentNature: 'Permanent',
  workArrangement: 'Hybrid',
  birthDate: '1990-05-20',
  maritalStatus: 'Single',
  address: 'Bole, Addis Ababa',
  addressType: 'Permanent',
  country: 'Ethiopia',
  region: 'Addis Ababa',
  subcity: 'Bole',
  zone: 'Zone 3',
  woreda: '08',
  kebele: '09',
  houseNo: 'H-123',
  poBox: '1234',
  fax: '+251-11-123-4567',
  telephone: '+251-911-234-567',
  email: 'john.smith@company.com',
  website: 'www.johnsmith.dev',
  reportsTo: { name: 'Sarah Johnson', position: 'Tech Lead' },
  empState: '2' as keyof typeof EmpState,
  timeOffBalance: {
    vacation:  { used: 12, allowed: 18 },
    sick:      { used: 3,  allowed: 10 },
    personal:  { used: 2,  allowed: 5  },
  },
};

const empStateColors: Record<string, string> = {
  '0': 'bg-yellow-50 text-yellow-700 border-yellow-200',   // Pending
  '1': 'bg-blue-50 text-blue-700 border-blue-200',         // Approved
  '2': 'bg-green-50 text-green-700 border-green-200',      // Active
  '3': 'bg-orange-50 text-orange-700 border-orange-200',   // Under Probation
  '4': 'bg-red-50 text-red-700 border-red-200',            // Terminated
  '5': 'bg-gray-50 text-gray-600 border-gray-200',         // StandBy
  '6': 'bg-purple-50 text-purple-700 border-purple-200',   // Retired
  '7': 'bg-sky-50 text-sky-700 border-sky-200',            // On Leave
};

const YES_NO = [{ key: 'Yes', label: 'Yes' }, { key: 'No', label: 'No' }];

const tabs = [
  { id: 'overview',  label: 'Overview',         icon: User },
  { id: 'basic',     label: 'Basic Info',        icon: Briefcase },
  { id: 'bio',       label: 'Biographical',      icon: FileText },
  { id: 'emergency', label: 'Emergency Contact', icon: Heart },
  { id: 'family',    label: 'Family',            icon: Users },
  { id: 'guarantor', label: 'Guarantor',         icon: Shield },
];

/* ── shared read-only pieces ── */
const Field = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">{icon}{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
  </div>
);

const DEMO_PHOTO: EmpPhotoRes = {
  id: 'demo-id',
  fileName: 'demo.png',
  contentType: 'image/png',
  photoSize: '1 KB',
  photo: 'https://github.com/shadcn.png',
};


const ReadCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center gap-2 mb-5">
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">{children}</div>
);

/* ── Overview tab ── */
function OverviewTab() {
  const { timeOffBalance } = empData;
  const { attended, workingDays, month } = attendanceData;
  const attendancePct = Math.round((attended / workingDays) * 100);

  const tenure = Math.floor(
    (new Date().getTime() - new Date(empData.employmentDate).getTime()) /
    (1000 * 60 * 60 * 24 * 365)
  );

  const statCards = [
    { icon: <Clock className="h-5 w-5" />, label: 'Tenure',      value: `${tenure} yrs`, color: 'text-green-600',  bg: 'bg-green-50'  },
    { icon: <Star className="h-5 w-5" />,  label: 'Performance', value: '4.5 / 5',       color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: <Award className="h-5 w-5" />, label: 'Training',    value: '2',             color: 'text-blue-600',   bg: 'bg-blue-50'   },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>{icon}</div>
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
          </div>
        ))}

        {/* Attendance card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{attendancePct}%</span>
           <span className="text-sm text-gray-400"> {month}</span>
          {/* Segmented dot bar */}
          <div className="w-full flex gap-0.5 mt-1">
            {Array.from({ length: workingDays }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${i < attended ? 'bg-emerald-500' : 'bg-emerald-100'}`}
              />
            ))}
          </div>
         
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-1">Attendance</span>
        </div>
      </div>

      {/* Reports To + Time Off */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadCard title="Reports To" icon={<UserCheck className="w-4 h-4" />}>
          <div className="flex items-center gap-4">
            {/* <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-green-600" />
            </div> */}
            <EmpPhotoCircle size={42} name={empData.reportsTo.name}/>
            <div>
              <p className="font-semibold text-gray-900">{empData.reportsTo.name}</p>
              <p className="text-sm text-gray-500">{empData.reportsTo.position}</p>
            </div>
          </div>
        </ReadCard>

        <ReadCard title="Time Off Balance" icon={<Calendar className="w-4 h-4" />}>
          <div className="space-y-4">
            {[
              { label: 'Vacation',   data: timeOffBalance.vacation,  color: 'bg-green-500',  track: 'bg-green-100',  text: 'text-green-700',  tip: 'bg-green-500'  },
              { label: 'Sick Leave', data: timeOffBalance.sick,      color: 'bg-blue-500',   track: 'bg-blue-100',   text: 'text-blue-700',   tip: 'bg-blue-500'   },
              { label: 'Personal',   data: timeOffBalance.personal,  color: 'bg-purple-500', track: 'bg-purple-100', text: 'text-purple-700', tip: 'bg-purple-500' },
            ].map(({ label, data, color, track, text, tip }) => {
              const pct = Math.min((data.used / data.allowed) * 100, 100);
              return (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`text-xs font-medium ${text}`}>{data.used}/{data.allowed} days</span>
                  </div>
                  <div className="relative pt-2">
                    <div className={`h-2 rounded-full ${track} overflow-visible`}>
                      <div className={`h-2 rounded-full ${color} relative`} style={{ width: `${pct}%` }}>
                        {/* Tooltip at bar end */}
                        <div
                          className={`absolute -top-7 right-0 translate-x-1/2 ${tip} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap`}
                        >
                          {data.used}
                          {/* Arrow */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                            style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTopWidth: '4px', borderTopStyle: 'solid', borderTopColor: 'inherit' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ReadCard>
      </div>

    </div>
  );
}

/* ── Basic Info tab (read-only — HR managed) ── */
function BasicInfoTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <ReadCard title="Personal Information" icon={<User className="w-4 h-4" />}>
        <Grid>
          <Field label="Employee Code" value={empData.code} />
          <Field label="Gender" value={empData.gender} />
          <Field label="Nationality" value={empData.nationality} />
          <Field label="Birth Date" value={empData.birthDate} />
          <Field label="Marital Status" value={empData.maritalStatus} />
        </Grid>
      </ReadCard>
      <ReadCard title="Employment Details" icon={<Briefcase className="w-4 h-4" />}>
        <Grid>
          <Field label="Employment Date" value={empData.employmentDate} />
          <Field label="Department" value={empData.department} />
          <Field label="Branch" value={empData.branch} />
          <Field label="Employment Type" value={empData.employmentType} />
          <Field label="Employment Nature" value={empData.employmentNature} />
          <Field label="Work Arrangement" value={empData.workArrangement} />
        </Grid>
      </ReadCard>
      <ReadCard title="Salary Information" icon={<Landmark className="w-4 h-4" />}>
        <Grid>
          <Field label="Job Grade" value={empData.jobGrade} />
          <Field label="Job Grade Step" value={empData.jobGradeStep} />
          <Field label="Basic Salary" value={empData.basicSalary} />
          <Field label="Currency" value={empData.salaryCurrency} />
          <Field label="Payment Frequency" value={empData.paymentFrequency} />
          <Field label="Effective Date" value={empData.salaryEffectiveDate} />
        </Grid>
      </ReadCard>
      {/* Address & Contact — badge for address type in header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Address & Contact</h3>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            {empData.addressType}
          </span>
        </div>
        <Grid>
          <Field label="Country" value={empData.country} />
          <Field label="Region" value={empData.region} />
          <Field label="Subcity" value={empData.subcity} />
          <Field label="Zone" value={empData.zone} />
          <Field label="Woreda" value={empData.woreda} />
          <Field label="Kebele" value={empData.kebele} />
          <Field label="House No." value={empData.houseNo} />
          <Field label="P.O. Box" value={empData.poBox} />
          <Field label="Telephone" value={empData.telephone} icon={<Phone className="w-3 h-3" />} />
          <Field label="Fax" value={empData.fax} />
          <Field label="Email" value={empData.email} icon={<Mail className="w-3 h-3" />} />
          <Field label="Website" value={empData.website} icon={<Globe className="w-3 h-3" />} />
        </Grid>
      </div>
    </div>
  );
}

/* ── Biographical tab (inline editable) ── */
function BiographicalTab() {
  const {
    biographical, financial,
    editingSection, savingSection,
    setEditingSection,
    saveBiographical, saveFinancial,
  } = useProfileStore();

  const [bioForm, setBioForm] = useState(biographical);
  const [finForm, setFinForm] = useState(financial);

  const bioEditing = editingSection === 'biographical';
  const finEditing = editingSection === 'financial';

  // treat as empty if all editable fields are blank
  const bioHasData = !!(biographical.birthLocation || biographical.motherFullName);
  const finHasData = !!(financial.tin || financial.bankAccountNo || financial.pensionNumber);

  const ActionBtn = ({ hasData, onEdit }: { hasData: boolean; onEdit: () => void }) => (
    <button
      onClick={onEdit}
      className="flex items-center gap-1.5 text-xs font-medium transition-colors px-2.5 py-1 rounded-lg text-green-600 bg-green-50 hover:bg-green-100"
    >
      {hasData ? <><Pencil className="w-3.5 h-3.5" />Edit</> : <><Plus className="w-3.5 h-3.5" />Add</>}
    </button>
  );

  // Conditional file upload shown when cert answer is Yes
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Biographical */}
      <InlineEditCard
        title="Personal Details"
        icon={<FileText className="w-4 h-4" />}
        isEditing={bioEditing}
        isSaving={savingSection === 'biographical'}
        onEdit={() => { setBioForm(biographical); setEditingSection('biographical'); }}
        onCancel={() => setEditingSection(null)}
        onSave={() => saveBiographical(bioForm)}
        actionOverride={!bioEditing ? <ActionBtn hasData={bioHasData} onEdit={() => { setBioForm(biographical); setEditingSection('biographical'); }} /> : undefined}
      >
        {!bioHasData && !bioEditing ? (
          <p className="text-sm text-gray-400 italic">No personal details added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <EditableField label="Birth Location" value={bioForm.birthLocation} isEditing={bioEditing}
              onChange={(v) => setBioForm((p) => ({ ...p, birthLocation: v }))} placeholder="Addis Ababa" />
            <EditableField label="Mother's Full Name" value={bioForm.motherFullName} isEditing={bioEditing}
              onChange={(v) => setBioForm((p) => ({ ...p, motherFullName: v }))} placeholder="Full name" />

            {/* Birth Certificate */}
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
              <Field label="Has Birth Certificate" value={bioForm.hasBirthCert} />
            )}

            {/* Marriage Certificate */}
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
              <Field label="Has Marriage Certificate" value={bioForm.hasMarriageCert} />
            )}
          </div>
        )}
      </InlineEditCard>

      {/* Financial */}
      <InlineEditCard
        title="Financial Information"
        icon={<Landmark className="w-4 h-4" />}
        isEditing={finEditing}
        isSaving={savingSection === 'financial'}
        onEdit={() => { setFinForm(financial); setEditingSection('financial'); }}
        onCancel={() => setEditingSection(null)}
        onSave={() => saveFinancial(finForm)}
        actionOverride={!finEditing ? <ActionBtn hasData={finHasData} onEdit={() => { setFinForm(financial); setEditingSection('financial'); }} /> : undefined}
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

/* ── Emergency Contact tab (inline editable) ── */
function EmergencyTab() {
  const { emergency, editingSection, savingSection, setEditingSection, saveEmergency } = useProfileStore();
  const [form, setForm] = useState(emergency);
  const isEditing = editingSection === 'emergency';
  const set = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const hasData = !!(emergency.firstName || emergency.lastName || emergency.telephone);

  return (
    <InlineEditCard
      title="Emergency Contact"
      icon={<Heart className="w-4 h-4" />}
      isEditing={isEditing}
      isSaving={savingSection === 'emergency'}
      onEdit={() => { setForm(emergency); setEditingSection('emergency'); }}
      onCancel={() => setEditingSection(null)}
      onSave={() => saveEmergency(form)}
      actionOverride={!isEditing ? (
        <button
          onClick={() => { setForm(emergency); setEditingSection('emergency'); }}
          className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors px-2.5 py-1 rounded-lg"
        >
          {hasData ? <><Pencil className="w-3.5 h-3.5" />Edit</> : <><Plus className="w-3.5 h-3.5" />Add</>}
        </button>
      ) : undefined}
    >
      {!hasData && !isEditing ? (
        <p className="text-sm text-gray-400 italic">No emergency contact added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          <EditableField label="First Name" value={form.firstName} isEditing={isEditing} onChange={(v) => set('firstName', v)} />
          <EditableField label="Middle Name" value={form.middleName} isEditing={isEditing} onChange={(v) => set('middleName', v)} />
          <EditableField label="Last Name" value={form.lastName} isEditing={isEditing} onChange={(v) => set('lastName', v)} />
          <EditableField label="Nationality" value={form.nationality} isEditing={isEditing} onChange={(v) => set('nationality', v)} />
          <EditableField label="Gender" value={form.gender} isEditing={isEditing} type="select"
            options={[{ key: 'Male', label: 'Male' }, { key: 'Female', label: 'Female' }]}
            onChange={(v) => set('gender', v)} />
          <EditableField label="Relation" value={form.relation} isEditing={isEditing} onChange={(v) => set('relation', v)} />
          <EditableField label="Telephone" value={form.telephone} isEditing={isEditing} onChange={(v) => set('telephone', v)} />
          <EditableField label="Address" value={form.address} isEditing={isEditing} onChange={(v) => set('address', v)} />
        </div>
      )}
    </InlineEditCard>
  );
}

/* ── Family tab ── */
const EMPTY_FAMILY = { fullName: '', nationality: '', gender: '', relation: '' };

// Reusable labeled select using ui/select
const LabeledSelect = ({ label, value, onChange, options, placeholder = 'Select' }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="w-full h-8 text-sm border-gray-200">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

// Standalone form fields — defined outside FamilyTab to avoid remount on every render
const GENDER_OPTS = [{ key: 'Male', label: 'Male' }, { key: 'Female', label: 'Female' }];
const RELATION_OPTS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'].map((r) => ({ key: r, label: r }));

function FamilyMemberFields({
  form,
  setForm,
}: {
  form: typeof EMPTY_FAMILY;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FAMILY>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full Name</label>
        <input
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          value={form.fullName}
          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
          placeholder="Full name"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nationality</label>
        <input
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          value={form.nationality}
          onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))}
          placeholder="Ethiopian"
        />
      </div>
      <LabeledSelect label="Gender" value={form.gender} onChange={(v) => setForm((p) => ({ ...p, gender: v }))} options={GENDER_OPTS} />
      <LabeledSelect label="Relation" value={form.relation} onChange={(v) => setForm((p) => ({ ...p, relation: v }))} options={RELATION_OPTS} />
    </div>
  );
}

function FamilyTab() {
  const { family, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useProfileStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FAMILY);

  const startEdit = (m: typeof family[0]) => {
    setForm({ fullName: m.fullName, nationality: m.nationality, gender: m.gender, relation: m.relation });
    setEditingId(m.id);
    setOpenId(m.id);
  };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FAMILY); };

  const saveEdit = () => {
    if (editingId) { updateFamilyMember(editingId, form); setEditingId(null); setForm(EMPTY_FAMILY); }
  };

  const saveNew = () => {
    if (!form.fullName.trim()) return;
    addFamilyMember(form);
    setForm(EMPTY_FAMILY);
    setAddingNew(false);
  };

  const formActions = (onCancel: () => void, onSave: () => void) => (
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
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

      {/* Add new form */}
      {addingNew && (
        <div className="mb-4 p-4 rounded-xl border border-green-200 bg-white">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">New Family Member</p>
          <FamilyMemberFields form={form} setForm={setForm} />
          {formActions(() => { setAddingNew(false); setForm(EMPTY_FAMILY); }, saveNew)}
        </div>
      )}

      {/* Empty state */}
      {family.length === 0 && !addingNew && (
        <p className="text-sm text-gray-400 italic">No family members added yet.</p>
      )}

      {/* Accordion list */}
      <div className="space-y-2">
        {family.map((m) => {
          const isOpen = openId === m.id;
          const isEditingThis = editingId === m.id;
          return (
            <div key={m.id} className={`rounded-xl border transition-all ${isOpen ? 'border-green-200 shadow-sm' : 'border-gray-100'}`}>
              {/* Accordion header */}
              <div className="flex items-center justify-between px-4 py-3">
                <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setOpenId(isOpen ? null : m.id)}>
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-bold shrink-0">
                    {m.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{m.fullName}</p>
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

              {/* Accordion body */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  {isEditingThis ? (
                    <>
                      <FamilyMemberFields form={form} setForm={setForm} />
                      {formActions(cancelEdit, saveEdit)}
                    </>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Field label="Full Name" value={m.fullName} />
                      <Field label="Nationality" value={m.nationality} />
                      <Field label="Gender" value={m.gender} />
                      <Field label="Relation" value={m.relation} />
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

/* ── Guarantor tab (read-only) ── */
function GuarantorTab() {
  const { guarantor } = useProfileStore();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ReadCard title="Guarantor Details" icon={<Shield className="w-4 h-4" />}>
        <Grid>
          <Field label="Full Name" value={`${guarantor.firstName} ${guarantor.middleName} ${guarantor.lastName}`} />
          <Field label="Nationality" value={guarantor.nationality} />
          <Field label="Gender" value={guarantor.gender} />
          <Field label="Relation" value={guarantor.relation} />
          <Field label="Telephone" value={guarantor.telephone} />
          <Field label="Address" value={guarantor.address} />
        </Grid>
      </ReadCard>

      {/* Document card */}
      <ReadCard title="Guarantor Document" icon={<FileText className="w-4 h-4" />}>
        {guarantor.fileName ? (
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{guarantor.fileName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{guarantor.fileType} · {guarantor.fileSize}</p>
              <button className="mt-3 flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                <Download className="w-4 h-4" />Download
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No document uploaded</p>
        )}
      </ReadCard>
    </div>
  );
}

/* ── Main page ── */
function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const content: Record<string, React.ReactNode> = {
    overview:  <OverviewTab />,
    basic:     <BasicInfoTab />,
    bio:       <BiographicalTab />,
    emergency: <EmergencyTab />,
    family:    <FamilyTab />,
    guarantor: <GuarantorTab />,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 -mt-6">
      {/* Hero banner */}
      <div className="relative w-full flex flex-col items-center justify-center overflow-visible rounded-xl">
        <InteractiveGridPattern
          className={cn('[mask-image:radial-gradient(ellipse_at_center,_grey,_transparent_70%)]', 'inset-0 h-full w-full skew-y-6')}
          width={22} height={22} squares={[80, 80]} squaresClassName="hover:fill-green-400"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-green-200 blur-[90px] opacity-30" />
        </div>
        <div className="relative z-10 text-center py-10 px-6 flex flex-col items-center">
          <div className=" rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-green-100 to-blue-100 hover:scale-105 transition-transform duration-300">
           <EmpPhotoCircle size={80} photo={DEMO_PHOTO} name={empData.fullName}/>
            {/* <img src={empData.photo} alt={empData.fullName} className="w-full h-full object-cover" /> */}
          </div>


          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">{empData.fullName}</h1>
          <p className="text-gray-500 mt-0.5 text-md">{empData.fullNameAm}</p>
          <p className="text-green-600 font-semibold mt-1">{empData.position}</p>
          <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${empStateColors[empData.empState]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {EmpState[empData.empState]}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="pb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    active ? 'bg-green-50 border border-green-200 text-green-700 shadow-sm' : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-green-600' : 'text-gray-400'}`} />
                  {label}
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div>{content[activeTab]}</div>
    </div>
  );
}

export default ProfilePage;
