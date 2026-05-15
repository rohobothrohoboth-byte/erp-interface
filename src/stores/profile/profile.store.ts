import { create } from 'zustand';
import { profileApi } from '../../services/profile/profile.api';
import { queryClient } from '../../lib/queryClient';
import type {
  EmpBioModDto,
  EmpFinanceModDto,
  EmContactModDto,
  EmpFamilyAddDto,
  EmpFamilyModDto,
} from '../../types/profile/profile.types';

// ── Re-exported form types used by components ──────────────────────────────
export type BiographicalForm = Omit<EmpBioModDto, 'id'> & {
  birthCertFile?:      File | null;
  birthCertFileName?:  string;
  marriageCertFile?:   File | null;
  marriageCertFileName?: string;
};
export type FinancialForm    = Omit<EmpFinanceModDto, 'id'>;
export type EmergencyContactForm = {
  employeeId?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  nationality: string;
  relation: string;
  addressType: string;
  country: string;
  region: string;
  subcity: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNo: string;
  telephone: string;
  poBox: string;
  fax: string;
  email: string;
  website: string;
};
export type FamilyAddForm    = EmpFamilyAddDto;
export type FamilyModForm    = EmpFamilyModDto;

type SavingSection = 'biographical' | 'financial' | 'emergency' | null;
type EditingSection = SavingSection;

// ── Store interface ────────────────────────────────────────────────────────
interface ProfileStore {
  editingSection: EditingSection;
  savingSection:  SavingSection;

  setEditingSection: (section: EditingSection) => void;

  saveBiographical: (id: string, data: BiographicalForm) => Promise<void>;
  saveFinancial:    (id: string, data: FinancialForm)    => Promise<void>;
  saveEmergency:    (data: EmergencyContactForm)         => Promise<void>;

  addFamily:    (dto: FamilyAddForm) => Promise<void>;
  updateFamily: (id: string, dto: FamilyModForm) => Promise<void>;
  deleteFamily: (id: string) => Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useProfileStore = create<ProfileStore>((set) => ({
  editingSection: null,
  savingSection:  null,

  setEditingSection: (section) => set({ editingSection: section }),

  saveBiographical: async (id, data) => {
    set({ savingSection: 'biographical' });
    try {
      await profileApi.updateBio({
        id,
        birthLocation:   data.birthLocation,
        motherFullName:  data.motherFullName,
        hasBirthCert:    data.hasBirthCert,
        hasMarriageCert: data.hasMarriageCert,
        file1: data.file1 ?? data.birthCertFile ?? null,
        file2: data.file2 ?? data.marriageCertFile ?? null,
      });
      set({ editingSection: null });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['empDetail'] });
    } catch (e) {
      throw e; // rethrow so callers can show error toast
    } finally {
      set({ savingSection: null });
    }
  },

  saveFinancial: async (id, data) => {
    set({ savingSection: 'financial' });
    try {
      await profileApi.updateFinance({ id, ...data });
      set({ editingSection: null });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['empDetail'] });
    } catch (e) {
      throw e;
    } finally {
      set({ savingSection: null });
    }
  },

  saveEmergency: async (data) => {
    set({ savingSection: 'emergency' });
    try {
      await profileApi.updateEmContact(data as EmContactModDto);
      set({ editingSection: null });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['empDetail'] });
    } catch (e) {
      throw e;
    } finally {
      set({ savingSection: null });
    }
  },

  addFamily: async (dto) => {
    await profileApi.addFamily(dto);
  },

  updateFamily: async (id, dto) => {
    await profileApi.updateFamily(id, dto);
  },

  deleteFamily: async (id) => {
    await profileApi.deleteFamily(id);
  },
}));
