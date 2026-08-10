import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UUID } from 'crypto';
import type { PwdChgDto } from '@/modules/hr/types/employee';
import { userService } from '@/modules/hr/services/employee/user/user.api';
import { userKeys } from '@/modules/hr/services/employee/user/user.key';

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