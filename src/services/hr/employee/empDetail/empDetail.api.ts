import { api } from '../../../api';
import type {
  EmpDetailInfo,
  EmpDetailPhoto,
  EmpDetailOverview,
  EmpDetailBasic,
  EmpDetailBio,
  EmpDetailContact,
  EmpDetailFamily,
  EmpDetailGuarantor,
  EmpDetailDocument,
  EmpDetailLeaveBalance,
  EmpFileList,
} from '../../../../types/hr/employee/empDetail';

const BASE = '/hrm/profile/v1/EmpPro';

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

const get = async <T>(url: string): Promise<T> => {
  try {
    const res = await api.get(url);
    return res.data.data as T;
  } catch (e) {
    throw new Error(extractError(e));
  }
};

export const empDetailApi = {
  getInfo:      (id: string) => get<EmpDetailInfo>(`${BASE}/GetProfileInfo/${id}`),
  getPhoto:     (id: string) => get<EmpDetailPhoto>(`${BASE}/GetPhotoThumbnail/${id}`),
  getOverview:  (id: string) => get<EmpDetailOverview>(`${BASE}/GetProOverview/${id}`),
  getBasic:     (id: string) => get<EmpDetailBasic>(`${BASE}/GetProBasic/${id}`),
  getBio:       (id: string) => get<EmpDetailBio>(`${BASE}/GetProBio/${id}`),
  getContact:   (id: string) => get<EmpDetailContact>(`${BASE}/GetProEmContact/${id}`),
  getFamily:    (id: string) => get<EmpDetailFamily>(`${BASE}/GetProFamily/${id}`),
  getGuarantor: async (id: string): Promise<EmpDetailGuarantor | null> => {
    try {
      const res = await api.get(`${BASE}/GetEmpGuaranty/${id}`);
      return res.data.data as EmpDetailGuarantor;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw new Error(extractError(e));
    }
  },
  // Documents endpoint — update path once available
  getDocuments: (id: string) => get<EmpDetailDocument[]>(`${BASE}/GetEmpDocuments/${id}`),
  // All employee certificates
  getCertAll:   (id: string) => get<EmpFileList[]>(`/hrm/profile/v1/EmpMod/EmpCertAll/${id}`),
  // Leave balance — no dedicated endpoint yet, returns empty
  getLeave:     (_id: string): Promise<EmpDetailLeaveBalance[]> => Promise.resolve([]),
};
