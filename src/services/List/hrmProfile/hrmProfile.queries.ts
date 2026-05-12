import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { hrmProfileApi } from './hrmProfile.api';
import { hrmProfileKeys } from './hrmProfile.keys';
import type { NameListItem } from '../../../types/NameList/nameList';

export const useProfileAddressNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: hrmProfileKeys.addressNames(),
    queryFn: hrmProfileApi.getAllAddressNames,
    ...options,
  });
