import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveGridPattern } from '../components/ui/interactive-grid-pattern';
import { cn } from '../lib/utils';
import {
  User, Briefcase, Shield, MapPin, Mail, Globe, Phone,
  Heart, FileText, Download, Edit, Building2, Calendar,
  UserCheck, Landmark, Clock, Star, Award, Users,
} from 'lucide-react';
import { useProfileStore } from '../stores/profile/profile.store';
import { InlineEditCard } from '../components/profile/InlineEditCard';
import { EditableField } from '../components/profile/EditableField';

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
  position: 'Senior Software Engineer',
  department: 'Technology',
  branch: 'Head Office',
  employmentType: 'Full-time',
  employmentNature: 'Permanent',
  workArrangement: 'Hybrid',
  birthDate: '1990-05-20',
  maritalStatus: 'Single',
  address: 'Bole, Addis Ababa',
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
  timeOffBalance: { vacation: 18, sick: 10, personal: 5 },
};

const YES_NO = [{ key: 'Yes', label: 'Yes' }, { key: 'No', label: 'No' }];

const tabs = [
  { id: 'overview',  label: 'Overview',         icon: User },
  { id: 'basic',     label: 'Basic Info',        icon: Briefcase },
  { id: 'bio',       label: 'Biographical',      icon: FileText },
  { id: 'emergency', label: 'Emergency Contact', icon: Heart },
  { id: 'guarantor', label: 'Guarantor',         icon: Shield },
];

/* ── shared read-only pieces ── */
const Field = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">{icon}{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
  </div>
);

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

  const tenure = Math.floor(
    (new Date().getTime() - new Date(empData.employmentDate).getTime()) /
    (1000 * 60 * 60 * 24 * 365)
  );

  const statCards = [
    { icon: <Clock className="h-5 w-5" />, label: 'Tenure',        value: `${tenure} yrs`,  color: 'text-green-600',  bg: 'bg-green-50'  },
    { icon: <Star className="h-5 w-5" />,  label: 'Performance',   value: '4.5 / 5',         color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: <Award className="h-5 w-5" />, label: 'Certifications', value: '2',               color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { icon: <Users className="h-5 w-5" />, label: 'Team Members',  value: '2',               color: 'text-purple-600', bg: 'bg-purple-50' },
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
      </div>

      {/* Reports To + Time Off */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadCard title="Reports To" icon={<UserCheck className="w-4 h-4" />}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{empData.reportsTo.name}</p>
              <p className="text-sm text-gray-500">{empData.reportsTo.position}</p>
            </div>
          </div>
        </ReadCard>

        <ReadCard title="Time Off Balance" icon={<Calendar className="w-4 h-4" />}>
          <div className="space-y-3">
            {[
              { label: 'Vacation',   days: timeOffBalance.vacation, color: 'bg-green-500',  track: 'bg-green-100',  text: 'text-green-700' },
              { label: 'Sick Leave', days: timeOffBalance.sick,     color: 'bg-blue-500',   track: 'bg-blue-100',   text: 'text-blue-700' },
              { label: 'Personal',   days: timeOffBalance.personal, color: 'bg-purple-500', track: 'bg-purple-100', text: 'text-purple-700' },
            ].map(({ label, days, color, track, text }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-sm font-semibold ${text}`}>{days} days</span>
                </div>
                <div className={`h-2 rounded-full ${track}`}>
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min((days / 30) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ReadCard>
      </div>
    </div>
  );
}

/* ── Basic Info tab (read-only — HR managed) ── */
function BasicInfoTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ReadCard title="Personal Information" icon={<User className="w-4 h-4" />}>
        <Grid>
          <Field label="Full Name" value={empData.fullName} />
          <Field label="ሙሉ ስም" value={empData.fullNameAm} />
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
          <Field label="Job Grade" value={empData.jobGrade} />
          <Field label="Position" value={empData.position} />
          <Field label="Department" value={empData.department} />
          <Field label="Branch" value={empData.branch} />
          <Field label="Employment Type" value={empData.employmentType} />
          <Field label="Employment Nature" value={empData.employmentNature} />
          <Field label="Work Arrangement" value={empData.workArrangement} />
        </Grid>
      </ReadCard>
      <ReadCard title="Address & Contact" icon={<MapPin className="w-4 h-4" />}>
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
      </ReadCard>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Biographical */}
      <InlineEditCard
        title="Personal Details"
        icon={<FileText className="w-4 h-4" />}
        isEditing={bioEditing}
        isSaving={savingSection === 'biographical'}
        onEdit={() => { setBioForm(biographical); setEditingSection('biographical'); }}
        onCancel={() => setEditingSection(null)}
        onSave={() => saveBiographical(bioForm)}
      >
        <Grid>
          {/* Always visible in view mode, hidden in edit mode */}
          {!bioEditing && (
            <>
              <Field label="Birth Date" value={empData.birthDate} />
              <Field label="Marital Status" value={empData.maritalStatus} />
            </>
          )}
          <EditableField label="Birth Location" value={bioForm.birthLocation} isEditing={bioEditing}
            onChange={(v) => setBioForm((p) => ({ ...p, birthLocation: v }))} placeholder="Addis Ababa" />
          <EditableField label="Mother's Full Name" value={bioForm.motherFullName} isEditing={bioEditing}
            onChange={(v) => setBioForm((p) => ({ ...p, motherFullName: v }))} placeholder="Full name" />
          <EditableField label="Has Birth Certificate" value={bioForm.hasBirthCert} isEditing={bioEditing}
            type="select" options={YES_NO} onChange={(v) => setBioForm((p) => ({ ...p, hasBirthCert: v }))} />
          <EditableField label="Has Marriage Certificate" value={bioForm.hasMarriageCert} isEditing={bioEditing}
            type="select" options={YES_NO} onChange={(v) => setBioForm((p) => ({ ...p, hasMarriageCert: v }))} />
        </Grid>
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
      >
        <Grid>
          <EditableField label="TIN Number" value={finForm.tin} isEditing={finEditing}
            onChange={(v) => setFinForm((p) => ({ ...p, tin: v }))} placeholder="123456789"
          />
          <EditableField label="Bank Account No." value={finForm.bankAccountNo} isEditing={finEditing}
            onChange={(v) => setFinForm((p) => ({ ...p, bankAccountNo: v }))} placeholder="100023456789"
          />
          <EditableField label="Pension Number" value={finForm.pensionNumber} isEditing={finEditing}
            onChange={(v) => setFinForm((p) => ({ ...p, pensionNumber: v }))} placeholder="PEN-12345"
          />
        </Grid>
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

  return (
    <InlineEditCard
      title="Emergency Contact"
      icon={<Heart className="w-4 h-4" />}
      isEditing={isEditing}
      isSaving={savingSection === 'emergency'}
      onEdit={() => { setForm(emergency); setEditingSection('emergency'); }}
      onCancel={() => setEditingSection(null)}
      onSave={() => saveEmergency(form)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        <EditableField label="First Name" value={form.firstName} isEditing={isEditing} onChange={(v) => set('firstName', v)} />
        <EditableField label="ስም" value={form.firstNameAm} isEditing={isEditing} onChange={(v) => set('firstNameAm', v)} />
        <EditableField label="Middle Name" value={form.middleName} isEditing={isEditing} onChange={(v) => set('middleName', v)} />
        <EditableField label="የአባት ስም" value={form.middleNameAm} isEditing={isEditing} onChange={(v) => set('middleNameAm', v)} />
        <EditableField label="Last Name" value={form.lastName} isEditing={isEditing} onChange={(v) => set('lastName', v)} />
        <EditableField label="የአያት ስም" value={form.lastNameAm} isEditing={isEditing} onChange={(v) => set('lastNameAm', v)} />
        <EditableField label="Nationality" value={form.nationality} isEditing={isEditing} onChange={(v) => set('nationality', v)} />
        <EditableField label="Gender" value={form.gender} isEditing={isEditing} type="select"
          options={[{ key: 'Male', label: 'Male' }, { key: 'Female', label: 'Female' }]}
          onChange={(v) => set('gender', v)} />
        <EditableField label="Relation" value={form.relation} isEditing={isEditing} onChange={(v) => set('relation', v)} />
        <EditableField label="Telephone" value={form.telephone} isEditing={isEditing} onChange={(v) => set('telephone', v)} />
        <EditableField label="Address" value={form.address} isEditing={isEditing} onChange={(v) => set('address', v)} />
      </div>
    </InlineEditCard>
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
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 hover:scale-105 transition-transform duration-300">
            <img src={empData.photo} alt={empData.fullName} className="w-full h-full object-cover" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">{empData.fullName}</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{empData.fullNameAm}</p>
          <p className="text-green-600 font-semibold mt-1">{empData.position}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Building2 className="w-4 h-4" />
            <span>{empData.department}</span>
            <span className="text-gray-300">·</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">{empData.code}</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-6 mb-6">
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
