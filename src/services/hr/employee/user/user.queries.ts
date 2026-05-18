import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UUID } from 'crypto';
import type { PwdChgDto } from '../../../../types/hr/employee';
import { userService } from './user.api';
import { userKeys } from './user.key';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: PwdChgDto) =>
      userService.changePassword(data),
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UUID) =>
      userService.deleteAccount(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: userKeys.detail(id),
      });
    },
  });
};