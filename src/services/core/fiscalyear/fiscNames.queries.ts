import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fiscNamesApi } from './fiscNames.api';
import { fiscNamesKeys } from './fiscNames.keys';
import type { NameListItem } from '../../../types/NameList/nameList';

export const useActiveFiscalYearNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: fiscNamesKeys.active(),
    queryFn: fiscNamesApi.getActiveFiscalYear,
    ...options,
  });
