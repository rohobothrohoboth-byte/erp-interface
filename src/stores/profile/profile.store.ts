import { create } from 'zustand';

export interface BiographicalData {
  birthLocation: string;
  motherFullName: string;
  hasBirthCert: string;
  hasMarriageCert: string;
}

export interface FinancialData {
  tin: string;
  bankAccountNo: string;
  pensionNumber: string;
}

export interface EmergencyContactData {
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
  address: string;
}

export interface GuarantorData {
  firstName: string;
  middleName: string;
  lastName: string;
  nationality: string;
  gender: string;
  relation: string;
  telephone: string;
  address: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}

// Which card is currently in edit mode — only one at a time
type EditingSection = 'biographical' | 'financial' | 'emergency' | null;

interface ProfileState {
  biographical: BiographicalData;
  financial: FinancialData;
  emergency: EmergencyContactData;
  guarantor: GuarantorData;
  editingSection: EditingSection;
  savingSection: EditingSection;
  guarantorModalOpen: boolean;

  setEditingSection: (section: EditingSection) => void;
  setSavingSection: (section: EditingSection) => void;
  setGuarantorModalOpen: (open: boolean) => void;

  saveBiographical: (data: BiographicalData) => Promise<void>;
  saveFinancial: (data: FinancialData) => Promise<void>;
  saveEmergency: (data: EmergencyContactData) => Promise<void>;
  // saveGuarantor: (data: GuarantorData) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial data — replace with API fetch
  biographical: {
    birthLocation: 'Addis Ababa',
    motherFullName: 'Mary Smith',
    hasBirthCert: 'Yes',
    hasMarriageCert: 'No',
  },
  financial: {
    tin: '123456789',
    bankAccountNo: '100023456789',
    pensionNumber: 'PEN-12345',
  },
  emergency: {
    firstName: 'Michael',
    firstNameAm: 'ማይክል',
    middleName: 'James',
    middleNameAm: 'ጄምስ',
    lastName: 'Smith',
    lastNameAm: 'ሚት',
    nationality: 'Ethiopian',
    gender: 'Male',
    relation: 'Brother',
    telephone: '+251-911-345-678',
    address: 'Bole, Addis Ababa',
  },
  guarantor: {
    firstName: 'Robert',
    middleName: 'Lee',
    lastName: 'Johnson',
    nationality: 'Ethiopian',
    gender: 'Male',
    relation: 'Family Friend',
    telephone: '+251-922-123-456',
    address: 'Kirkos, Addis Ababa',
    fileName: 'guarantor_agreement.pdf',
    fileSize: '2.4 MB',
    fileType: 'PDF',
  },

  editingSection: null,
  savingSection: null,
  guarantorModalOpen: false,

  setEditingSection: (section) => set({ editingSection: section }),
  setSavingSection: (section) => set({ savingSection: section }),
  setGuarantorModalOpen: (open) => set({ guarantorModalOpen: open }),

  saveBiographical: async (data) => {
    set({ savingSection: 'biographical' });
    try {
      // TODO: await api call
      await new Promise((r) => setTimeout(r, 600));
      set({ biographical: data, editingSection: null });
    } finally {
      set({ savingSection: null });
    }
  },

  saveFinancial: async (data) => {
    set({ savingSection: 'financial' });
    try {
      await new Promise((r) => setTimeout(r, 600));
      set({ financial: data, editingSection: null });
    } finally {
      set({ savingSection: null });
    }
  },

  saveEmergency: async (data) => {
    set({ savingSection: 'emergency' });
    try {
      await new Promise((r) => setTimeout(r, 600));
      set({ emergency: data, editingSection: null });
    } finally {
      set({ savingSection: null });
    }
  },

  // saveGuarantor: async (data) => {
  //   set({ savingSection: 'guarantor' });
  //   try {
  //     await new Promise((r) => setTimeout(r, 600));
  //     set({ guarantor: data, guarantorModalOpen: false });
  //   } finally {
  //     set({ savingSection: null });
  //   }
  // },
}));
