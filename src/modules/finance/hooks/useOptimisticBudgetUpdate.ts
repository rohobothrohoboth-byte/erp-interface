// hooks/finance/useOptimisticBudgetUpdate.ts

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateBudget } from '@/modules/finance/services/finance.api';
import { FINANCE_QUERY_KEYS } from '@/modules/finance/constants/queryKeys';
import { showToast } from '@/shared/layout/layout';

export const useOptimisticBudgetUpdate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            updateBudget(id, data),

        onMutate: async ({ id, data }) => {
            // ✅ Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: FINANCE_QUERY_KEYS.budgets(),
            });

            // ✅ Snapshot the previous value
            const previousBudgets = queryClient.getQueryData(
                FINANCE_QUERY_KEYS.budgets()
            );

            // ✅ Optimistically update the cache
            queryClient.setQueryData(
                FINANCE_QUERY_KEYS.budgets(),
                (old: any) => {
                    if (!old) return old;
                    const budgets = Array.isArray(old) ? old : [];
                    return budgets.map((budget: any) =>
                        budget.id === id ? { ...budget, ...data } : budget
                    );
                }
            );

            // ✅ Return context with the snapshotted value
            return { previousBudgets };
        },

        onError: (error, variables, context) => {
            // ✅ Rollback on error
            if (context?.previousBudgets) {
                queryClient.setQueryData(
                    FINANCE_QUERY_KEYS.budgets(),
                    context.previousBudgets
                );
            }
            showToast.error('Failed to update budget');
            console.error('Error updating budget:', error);
        },

        onSuccess: () => {
            showToast.success('Budget updated successfully');
        },

        onSettled: () => {
            // ✅ Refetch to ensure consistency
            queryClient.invalidateQueries({
                queryKey: FINANCE_QUERY_KEYS.budgets(),
            });
        },
    });

    return mutation;
};