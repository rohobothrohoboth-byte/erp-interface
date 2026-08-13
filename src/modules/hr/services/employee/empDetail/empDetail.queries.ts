import { useQuery } from '@tanstack/react-query';
import { empDetailApi } from '@/modules/hr/services/employee/empDetail/empDetail.api';

// ── Query keys ─────────────────────────────────────────────────────────────
export const empDetailKeys = {
  all:      (id: string) => ['empDetail', id] as const,
  info:     (id: string) => ['empDetail', id, 'info']     as const,
  photo:    (id: string) => ['empDetail', id, 'photo']    as const,
  overview: (id: string) => ['empDetail', id, 'overview'] as const,
  basic:    (id: string) => ['empDetail', id, 'basic']    as const,
  bio:      (id: string) => ['empDetail', id, 'bio']      as const,
  contact:  (id: string) => ['empDetail', id, 'contact']  as const,
  family:   (id: string) => ['empDetail', id, 'family']   as const,
  guarantor:(id: string) => ['empDetail', id, 'guarantor']as const,
  documents:(id: string) => ['empDetail', id, 'documents']as const,
  leave:    (id: string) => ['empDetail', id, 'leave']    as const,
};

const STALE = 5 * 60 * 1000;

export const useEmpDetailInfo     = (id: string) => useQuery({ queryKey: empDetailKeys.info(id),      queryFn: () => empDetailApi.getInfo(id),      staleTime: STALE, enabled: !!id });
export const useEmpDetailPhoto    = (id: string) => useQuery({ queryKey: empDetailKeys.photo(id),     queryFn: () => empDetailApi.getPhoto(id),     staleTime: STALE, enabled: !!id });
export const useEmpDetailOverview = (id: string) => useQuery({ queryKey: empDetailKeys.overview(id),  queryFn: () => empDetailApi.getOverview(id),  staleTime: STALE, enabled: !!id });
export const useEmpDetailBasic    = (id: string) => useQuery({ queryKey: empDetailKeys.basic(id),     queryFn: () => empDetailApi.getBasic(id),     staleTime: STALE, enabled: !!id });
export const useEmpDetailBio      = (id: string) => useQuery({ queryKey: empDetailKeys.bio(id),       queryFn: () => empDetailApi.getBio(id),       staleTime: STALE, enabled: !!id });
export const useEmpDetailContact  = (id: string) => useQuery({ queryKey: empDetailKeys.contact(id),   queryFn: () => empDetailApi.getContact(id),   staleTime: STALE, enabled: !!id });
export const useEmpDetailFamily   = (id: string) => useQuery({ queryKey: empDetailKeys.family(id),    queryFn: () => empDetailApi.getFamily(id),    staleTime: STALE, enabled: !!id });
export const useEmpDetailGuarantor= (id: string) => useQuery({ queryKey: empDetailKeys.guarantor(id), queryFn: () => empDetailApi.getGuarantor(id), staleTime: STALE, enabled: !!id });
export const useEmpDetailDocuments= (id: string) => useQuery({ queryKey: empDetailKeys.documents(id), queryFn: () => empDetailApi.getDocuments(id), staleTime: STALE, enabled: !!id });
export const useEmpCertAll        = (id: string) => useQuery({ queryKey: [...empDetailKeys.documents(id), 'certs'], queryFn: () => empDetailApi.getCertAll(id), staleTime: STALE, enabled: !!id });
export const useEmpDetailLeave    = (id: string) => useQuery({ queryKey: empDetailKeys.leave(id),     queryFn: () => empDetailApi.getLeave(id),     staleTime: STALE, enabled: !!id });
export const useEmpDetailPhotoFull= (id: string) => useQuery({ queryKey: [...empDetailKeys.photo(id), 'full'], queryFn: () => empDetailApi.getPhotoFull(id), staleTime: STALE, enabled: !!id, retry: false });
export const useEmpDetailStamp    = (id: string) => useQuery({ queryKey: [...empDetailKeys.all(id), 'stamp'], queryFn: () => empDetailApi.getStamp(id), staleTime: STALE, enabled: !!id, retry: false });
export const useEmpDetailSign     = (id: string) => useQuery({ queryKey: [...empDetailKeys.all(id), 'sign'],  queryFn: () => empDetailApi.getSign(id),  staleTime: STALE, enabled: !!id, retry: false });
