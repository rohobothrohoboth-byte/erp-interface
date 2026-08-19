import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { hrListApi } from '@/modules/hr/services/list/hrList.api';
import { hrListKeys } from '@/modules/hr/services/list/hrList.keys';
import type { ListItem } from '@/modules/list/types/list';

export const useQuarters = (
  options?: Omit<UseQueryOptions<ListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ListItem[], Error>({
    queryKey: hrListKeys.quarters(),
    queryFn: hrListApi.getAllQuarters,
    ...options,
  });

export const useEducationLevels = (
  options?: Omit<UseQueryOptions<ListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ListItem[], Error>({
    queryKey: hrListKeys.educationLevels(),
    queryFn: hrListApi.getAllEducationLevels,
    ...options,
  });

export const useRelations = (
  options?: Omit<UseQueryOptions<ListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ListItem[], Error>({
    queryKey: hrListKeys.relations(),
    queryFn: hrListApi.getAllRelations,
    ...options,
  });
