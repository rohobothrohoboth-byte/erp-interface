import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { registerFetcher } from './register.api';
import type { RegStep1, RegStep2, RegStep3, RegRes } from '../../../types/auth/registration';

export const useRegisterStep1 = (
  options?: Omit<UseMutationOptions<RegRes, Error, RegStep1>, 'mutationFn'>
) =>
  useMutation<RegRes, Error, RegStep1>({
    mutationFn: registerFetcher.step1,
    ...options,
  });

export const useRegisterStep2 = (
  options?: Omit<UseMutationOptions<RegRes, Error, RegStep2>, 'mutationFn'>
) =>
  useMutation<RegRes, Error, RegStep2>({
    mutationFn: registerFetcher.step2,
    ...options,
  });

export const useRegisterStep3 = (
  options?: Omit<UseMutationOptions<RegRes, Error, RegStep3>, 'mutationFn'>
) =>
  useMutation<RegRes, Error, RegStep3>({
    mutationFn: registerFetcher.step3,
    ...options,
  });

export const useCompleteRegistration = (
  options?: Omit<
    UseMutationOptions<
      RegRes,
      Error,
      { step1: RegStep1; step2: Omit<RegStep2, 'userId'>; step3: Omit<RegStep3, 'userId'> }
    >,
    'mutationFn'
  >
) =>
  useMutation<
    RegRes,
    Error,
    { step1: RegStep1; step2: Omit<RegStep2, 'userId'>; step3: Omit<RegStep3, 'userId'> }
  >({
    mutationFn: ({ step1, step2, step3 }) => registerFetcher.completeRegistration(step1, step2, step3),
    ...options,
  });
