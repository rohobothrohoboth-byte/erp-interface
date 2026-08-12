import { api } from '@/shared/services/api';
import type {
  EmpDetailInfo, EmpDetailPhoto, EmpDetailOverview, EmpDetailBasic,
  EmpDetailBio, EmpDetailContact, EmpDetailFamily, EmpDetailGuarantor,
  EmpDetailDocument, EmpDetailLeaveBalance, EmpFileList,
} from '@/modules/hr/types/employee/empDetail';

// FIXED: Use gateway path for profile service
const BASE = 'hrm/profile/v1/EmpPro';

const get = async <T>(url: string): Promise<T> => {
  try {
    const res = await api.get(url);
    return res.data.data as T;
  } catch (e: any) {
    // Return empty/null for 401/404 instead of throwing
    if (e?.response?.status === 401 || e?.response?.status === 404) {
      return (e?.response?.status === 404 ? null : []) as unknown as T;
    }
    throw e;
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
      if (e?.response?.status === 404 || e?.response?.status === 401) return null;
      throw e;
    }
  },
  getDocuments: (id: string) => get<EmpDetailDocument[]>(`${BASE}/GetEmpDocuments/${id}`),
  getCertAll:   (id: string) => get<EmpFileList[]>(`hrm/profile/v1/EmpMod/EmpCertAll/${id}`),
  getLeave: async (id: string): Promise<EmpDetailLeaveBalance[]> => {
    try {
      const res = await api.get(`hrm/leave/v1/Balance/Employee/${id}`);
      const data = res.data?.data ?? res.data ?? [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};

export async function fetchCertBlobUrl(certId: string): Promise<string> {
  try {
    const res = await api.get(`hrm/profile/v1/EmpMod/EmpCertById/${certId}`, { responseType: 'blob' });
    return URL.createObjectURL(res.data as Blob);
  } catch {
    return '';
  }
}