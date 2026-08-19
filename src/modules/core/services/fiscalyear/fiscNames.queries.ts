import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fiscNamesApi } from '@/modules/core/services/fiscalyear/fiscNames.api';
import { fiscNamesKeys } from '@/modules/core/services/fiscalyear/fiscNames.keys';
import type { NameListItem } from '@/modules/list/types/NameList/nameList';

export const useActiveFiscalYearNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: fiscNamesKeys.active(),
    queryFn: fiscNamesApi.getActiveFiscalYear,
    ...options,
  });
