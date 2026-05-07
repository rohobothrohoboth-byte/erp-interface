import { create } from 'zustand';
import { api } from '../../services/api';

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/Profile`;

// ── Mutable form shapes (what the user edits) ──────────────────────────────
export interface BiographicalForm {
  birthLocation: string;
  motherFullName: string;
  hasBirthCert: string;
  birthCertFile?: File | null;
  birthCertFileName?: string;
  hasMarriageCert: string;
  marriageCertFile?: File | null;
  marriageCertFileName?: string;
}

export interface FinancialForm {
  tin: string;
  bankAccountNo: string;
  pensionNumber: string;
}

export interface EmergencyContactForm {
  firstName: string;
  firstNameAm: string;
  middleName: string;
  middleNameAm: string;
  lastName: string;
  lastNameAm: string;
  nationality: string;
  gender: string;
  relation: string;
  telephone: string;
  // address fields
  country: string;
  region: string;
  subcity: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNo: string;
  poBox: string;
  addressType: string;
  fax: string;
  email: string;
  website: string;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nationality: string;
  gender: string;
  relation: string;
}

export interface GuarantorData {
  firstName: string;
  middleName: string;
  lastName: string;
  nationality: string;
  gender: string;
  relation: string;
  telephone: string;
  // address fields
  country: string;
  region: string;
  subcity: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNo: string;
  poBox: string;
  addressType: string;
  fax: string;
  email: string;
  website: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}

type EditingSection = 'biographical' | 'financial' | 'emergency' | null;

// ── Store interface ────────────────────────────────────────────────────────
interface ProfileStore {
  // Edit-mode tracking
  editingSection: EditingSection;
  savingSection: EditingSection;

  // Emergency contact (editable, not from bio endpoint)
  emergency: EmergencyContactForm;

  // Guarantor (read from store, populated from API or defaults)
  guarantor: GuarantorData;

  // Family members (client-managed list)
  family: FamilyMember[];

  // Actions
  setEditingSection: (section: EditingSection) => void;

  saveBiographical: (data: BiographicalForm) => Promise<void>;
  saveFinancial: (data: FinancialForm) => Promise<void>;
  saveEmergency: (data: EmergencyContactForm) => Promise<void>;

  addFamilyMember:    (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, member: Omit<FamilyMember, 'id'>) => void;
  deleteFamilyMember: (id: string) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useProfileStore = create<ProfileStore>((set) => ({
  editingSection: null,
  savingSection: null,

  emergency: {
    firstName: '', firstNameAm: '',
    middleName: '', middleNameAm: '',
    lastName: '', lastNameAm: '',
    nationality: '', gender: '',
    relation: '', telephone: '',
    country: '', region: '', subcity: '',
    zone: '', woreda: '', kebele: '',
    houseNo: '', poBox: '', addressType: '',
    fax: '', email: '', website: '',
  },

  guarantor: {
    firstName: '', middleName: '', lastName: '',
    nationality: '', gender: '', relation: '',
    telephone: '',
    country: '', region: '', subcity: '',
    zone: '', woreda: '', kebele: '',
    houseNo: '', poBox: '', addressType: '',
    fax: '', email: '', website: '',
  },

  family: [],

  setEditingSection: (section) => set({ editingSection: section }),

  saveBiographical: async (data) => {
    set({ savingSection: 'biographical' });
    try {
      await api.put(`${BASE}/UpdateProBio`, {
        birthLocation:    data.birthLocation,
        motherFullName:   data.motherFullName,
        hasBirthCert:     data.hasBirthCert === 'Yes',
        hasMarriageCert:  data.hasMarriageCert === 'Yes',
        tin:              undefined,
        bankAccountNo:    undefined,
        pensionNumber:    undefined,
      });
      set({ editingSection: null });
    } finally {
      set({ savingSection: null });
    }
  },

  saveFinancial: async (data) => {
    set({ savingSection: 'financial' });
    try {
      await api.put(`${BASE}/UpdateProBio`, {
        tin:           data.tin,
        bankAccountNo: data.bankAccountNo,
        pensionNumber: data.pensionNumber,
      });
      set({ editingSection: null });
    } finally {
      set({ savingSection: null });
    }
  },

  saveEmergency: async (data) => {
    set({ savingSection: 'emergency' });
    try {
      await api.put(`${BASE}/UpdateEmergency`, data);
      set({ emergency: data, editingSection: null });
    } finally {
      set({ savingSection: null });
    }
  },

  addFamilyMember: (member) =>
    set((s) => ({ family: [...s.family, { id: crypto.randomUUID(), ...member }] })),

  updateFamilyMember: (id, member) =>
    set((s) => ({ family: s.family.map((m) => (m.id === id ? { id, ...member } : m)) })),

  deleteFamilyMember: (id) =>
    set((s) => ({ family: s.family.filter((m) => m.id !== id) })),
}));
