import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { hrmmNamesApi } from './hrmmNames.api';
import { hrmmNamesKeys } from './hrmmNames.keys';
import type { NameListItem } from '../../../types/NameList/nameList';
import type { UUID } from '../../../types/List/list';
import type { NameListDto } from '../../../types/hr/NameListDto';

export const useAddressNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmmNamesKeys.addressNames(),
    queryFn: hrmmNamesApi.getAllAddressNames,
    ...options,
  });

export const useBenefitSetNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmmNamesKeys.benefitSetNames(),
    queryFn: hrmmNamesApi.getAllBenefitSetNames,
    ...options,
  });

export const useEducationQualNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmmNamesKeys.educationQualNames(),
    queryFn: hrmmNamesApi.getAllEducationQualNames,
    ...options,
  });

export const useJobGradeNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmmNamesKeys.jobGradeNames(),
    queryFn: hrmmNamesApi.getAllJobGradeNames,
    ...options,
  });

export const usePositionNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmmNamesKeys.positionNames(),
    queryFn: hrmmNamesApi.getAllPositionNames,
    ...options,
  });

export const useDepartmentPositions = (
  departmentId: UUID | undefined,
  options?: Omit<UseQueryOptions<NameListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListDto[], Error>({
    queryKey: hrmmNamesKeys.departmentPositions(departmentId!),
    queryFn: () => hrmmNamesApi.getDepartmentPositions(departmentId!),
    enabled: !!departmentId,
    ...options,
  });

export const useBranchComp = (
  options?: Omit<UseQueryOptions<NameListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListDto[], Error>({
    queryKey: hrmmNamesKeys.branchComp(),
    queryFn: hrmmNamesApi.getBranchComp,
    ...options,
  });

export const useDepartmentNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmmNamesKeys.departmentNames(),
    queryFn: hrmmNamesApi.getAllDepartmentNames,
    ...options,
  });
