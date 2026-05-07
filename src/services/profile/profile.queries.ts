import { useQuery } from '@tanstack/react-query';
import { profileApi } from './profile.api';
import type {
  ProfileInfoDto,
  ProfileCardDto,
  ProfileBasicDto,
  ProfileSalaryDto,
  ProfileAddressDto,
  ProfileBioDto,
  ProfilePhotoDto,
  EmpLeaveBalDto,
} from '../../types/profile/profile.types';

// ── Query key factory ──────────────────────────────────────────────────────
export const profileKeys = {
  all:          ['profile'] as const,
  photo:        () => [...profileKeys.all, 'photo']        as const,
  info:         () => [...profileKeys.all, 'info']         as const,
  card:         () => [...profileKeys.all, 'card']         as const,
  basic:        () => [...profileKeys.all, 'basic']        as const,
  salary:       () => [...profileKeys.all, 'salary']       as const,
  address:      () => [...profileKeys.all, 'address']      as const,
  bio:          () => [...profileKeys.all, 'bio']          as const,
  leaveBalance: () => [...profileKeys.all, 'leaveBalance'] as const,
} as const;

const STALE = 5 * 60 * 1000; // 5 minutes

export const useProfilePhoto      = () => useQuery<ProfilePhotoDto,     Error>({ queryKey: profileKeys.photo(),        queryFn: profileApi.getPhoto,        staleTime: STALE });
export const useProfileInfo       = () => useQuery<ProfileInfoDto,      Error>({ queryKey: profileKeys.info(),         queryFn: profileApi.getInfo,         staleTime: STALE });
export const useProfileCard       = () => useQuery<ProfileCardDto,      Error>({ queryKey: profileKeys.card(),         queryFn: profileApi.getCard,         staleTime: STALE });
export const useProfileBasic      = () => useQuery<ProfileBasicDto,     Error>({ queryKey: profileKeys.basic(),        queryFn: profileApi.getBasic,        staleTime: STALE });
export const useProfileSalary     = () => useQuery<ProfileSalaryDto,    Error>({ queryKey: profileKeys.salary(),       queryFn: profileApi.getSalary,       staleTime: STALE });
export const useProfileAddress    = () => useQuery<ProfileAddressDto,   Error>({ queryKey: profileKeys.address(),      queryFn: profileApi.getAddress,      staleTime: STALE });
export const useProfileBio        = () => useQuery<ProfileBioDto,       Error>({ queryKey: profileKeys.bio(),          queryFn: profileApi.getBio,          staleTime: STALE });
export const useLeaveBalance      = () => useQuery<EmpLeaveBalDto[],    Error>({ queryKey: profileKeys.leaveBalance(), queryFn: profileApi.getLeaveBalance, staleTime: STALE });
