// profile.queries.ts - Fixed imports

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from '@/modules/profile/services/profile.api';
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
} from '@/modules/profile/types/profile.types';
// ✅ Fix: Use relative path with ./profile.keys
import { profileKeys } from '@/modules/profile/services/profile.keys';
import { empKeys } from "@/modules/hr/services/employee/emp.keys";
import { dashboardKeys } from "@/modules/hr/services/dashboard/dashboard.key";

const STALE = 5 * 60 * 1000; // 5 minutes

export const useInvalidateProfile = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: profileKeys.all });
    qc.invalidateQueries({ queryKey: empKeys.list() });
    qc.invalidateQueries({ queryKey: dashboardKeys.all });
  };
};

export const useProfilePhoto = () => useQuery<ProfilePhotoDto, Error>({
  queryKey: profileKeys.photo(),
  queryFn: profileApi.getPhoto,
  staleTime: STALE
});

export const useProfileInfo = () => useQuery<ProfileInfoDto, Error>({
  queryKey: profileKeys.info(),
  queryFn: profileApi.getInfo,
  staleTime: STALE
});

export const useProfileCard = () => useQuery<ProfileCardDto, Error>({
  queryKey: profileKeys.card(),
  queryFn: profileApi.getCard,
  staleTime: STALE,
  refetchOnWindowFocus: false
});

export const useProfileBasic = () => useQuery<ProfileBasicDto, Error>({
  queryKey: profileKeys.basic(),
  queryFn: profileApi.getBasic,
  staleTime: STALE
});

export const useProfileBio = () => useQuery<ProfileBioDto, Error>({
  queryKey: profileKeys.bio(),
  queryFn: profileApi.getBio,
  staleTime: STALE
});

export const useProfileEmContact = () => useQuery<ProfileEmContactDto, Error>({
  queryKey: profileKeys.emContact(),
  queryFn: profileApi.getEmContact,
  staleTime: STALE
});

export const useProfileFamily = () => useQuery<ProfileFamilyDto, Error>({
  queryKey: profileKeys.family(),
  queryFn: profileApi.getFamily,
  staleTime: STALE
});

export const useEmpGurantor = () => useQuery<EmpGuarantyaDto | null, Error>({
  queryKey: profileKeys.gurantor(),
  queryFn: profileApi.getGurantor,
  staleTime: STALE
});

export const useLeaveBalance = () => useQuery<EmpLeaveBalDto[], Error>({
  queryKey: profileKeys.leaveBalance(),
  queryFn: profileApi.getLeaveBalance,
  staleTime: STALE,
  enabled: true
});