import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { hrListApi } from './hrList.api';
import { hrListKeys } from './hrList.keys';
import type { ListItem } from '../../../types/List/list';

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
