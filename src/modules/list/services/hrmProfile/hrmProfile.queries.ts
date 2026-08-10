import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { hrmProfileApi } from '@/modules/list/services/hrmProfile/hrmProfile.api';
import { hrmProfileKeys } from '@/modules/list/services/hrmProfile/hrmProfile.keys';
import type { NameListItem } from '@/modules/list/types/NameList/nameList';

export const useProfileAddressNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmProfileKeys.addressNames(),
    queryFn: hrmProfileApi.getAllAddressNames,
    ...options,
  });
