import { api } from '../api';
import type {
  ProfileInfoDto,
  ProfileCardDto,
  ProfileBasicDto,
  ProfileBioDto,
  ProfilePhotoDto,
  ProfileEmContactDto,
  ProfileFamilyDto,
  EmpLeaveBalDto,
  EmpGuarantyaDto,
  EmpBioModDto,
  EmpFinanceModDto,
  EmContactModDto,
  EmpFamilyAddDto,
  EmpFamilyModDto,
} from '../../types/profile/profile.types';

const BASE    = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/MyPro`;
const MOD_BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/MyProMod`;
const LEAVE_BASE = '/api/hrm/leave/v1/LeaveBalance';

const extractError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const e = error as any;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.data?.errors)
      return (Object.values(e.response.data.errors) as string[][]).flat().join(', ');
    if (e.message) return e.message;
  }
  return 'An unexpected error occurred';
};

const get = async <T>(endpoint: string): Promise<T> => {
  try {
    const res = await api.get(`${BASE}/${endpoint}`);
    return res.data.data as T;
  } catch (e) {
    throw new Error(extractError(e));
  }
};

const mod = async (endpoint: string, body: unknown, isForm = false): Promise<void> => {
  try {
    const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    await api.post(`${MOD_BASE}/${endpoint}`, body, config);
  } catch (e) {
    throw new Error(extractError(e));
  }
};

const modPost = async (endpoint: string, body: unknown): Promise<void> => {
  try {
    await api.post(`${MOD_BASE}/${endpoint}`, body);
  } catch (e) {
    throw new Error(extractError(e));
  }
};

const modDel = async (endpoint: string): Promise<void> => {
  try {
    await api.delete(`${MOD_BASE}/${endpoint}`);
  } catch (e) {
    throw new Error(extractError(e));
  }
};

export const profileApi = {
  // ── Queries ──────────────────────────────────────────────────────────────
  getPhoto:        (): Promise<ProfilePhotoDto>      => get('GetEmpPhoto'),
  getInfo:         (): Promise<ProfileInfoDto>       => get('GetProfileInfo'),
  getCard:         (): Promise<ProfileCardDto>       => get('GetProOverview'),
  getBasic:        (): Promise<ProfileBasicDto>      => get('GetProBasic'),
  getBio:          (): Promise<ProfileBioDto>        => get('GetProBio'),
  getEmContact:    (): Promise<ProfileEmContactDto>  => get('GetProEmContact'),
  getFamily:       (): Promise<ProfileFamilyDto>     => get('GetProFamily'),
  getGurantor: async (): Promise<EmpGuarantyaDto | null> => {
    try {
      const res = await api.get(`${BASE}/GetEmpGuaranty`);
      return res.data.data as EmpGuarantyaDto;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw new Error(extractError(e));
    }
  },
  getLeaveBalance: async (): Promise<EmpLeaveBalDto[]> => {
    try {
      const res = await api.get(`${LEAVE_BASE}/MyLeaveBalance`);
      return res.data.data as EmpLeaveBalDto[];
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ── Mutations ─────────────────────────────────────────────────────────────
  updateBio: (dto: EmpBioModDto): Promise<void> => {
    const form = new FormData();
    form.append('Id',              dto.id);
    form.append('BirthLocation',   dto.birthLocation);
    form.append('MotherFullName',  dto.motherFullName);
    form.append('HasBirthCert',    dto.hasBirthCert);
    form.append('HasMarriageCert', dto.hasMarriageCert);
    if (dto.file1) form.append('File1', dto.file1);
    if (dto.file2) form.append('File2', dto.file2);
    return mod('EmpBioMod', form, true);
  },

  updateFinance: (dto: EmpFinanceModDto): Promise<void> =>
    mod('EmpFinanceMod', dto),

  updateEmContact: (dto: EmContactModDto): Promise<void> =>
    mod('EmContactMod', dto),

  addFamily: (dto: EmpFamilyAddDto): Promise<void> =>
    modPost('EmpFamilyAdd', dto),

  updateFamily: (id: string, dto: EmpFamilyModDto): Promise<void> => {
    try {
      return api.put(`${MOD_BASE}/EmpFamilyMod/${id}`, dto).then(() => undefined);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  deleteFamily: (id: string): Promise<void> =>
    modDel(`EmpFamilyDel/${id}`),
};
