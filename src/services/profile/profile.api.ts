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
} from '../../types/profile/profile.types';

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/Profile`;
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

export const profileApi = {
  getPhoto:        (): Promise<ProfilePhotoDto>      => get('GetEmpPhoto'),
  getInfo:         (): Promise<ProfileInfoDto>       => get('GetProfileInfo'),
  getCard:         (): Promise<ProfileCardDto>       => get('GetProOverview'),
  getBasic:        (): Promise<ProfileBasicDto>      => get('GetProBasic'),
  getBio:          (): Promise<ProfileBioDto>        => get('GetProBio'),
  getEmContact:    (): Promise<ProfileEmContactDto>  => get('GetProEmContact'),
  getFamily:       (): Promise<ProfileFamilyDto>     => get('GetProFamily'),
  getLeaveBalance: async (): Promise<EmpLeaveBalDto[]> => {
    try {
      const res = await api.get(`${LEAVE_BASE}/MyLeaveBalance`);
      return res.data.data as EmpLeaveBalDto[];
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};
