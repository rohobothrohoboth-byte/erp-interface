import { useQuery } from '@tanstack/react-query';
import { vacancyApi, type VacancyListItem, type VacancyDetail } from './vacancy.api';

const vacancyKeys = {
  all: ['vacancies'] as const,
  lists: () => [...vacancyKeys.all, 'list'] as const,
  detail: (id: string) => [...vacancyKeys.all, 'detail', id] as const,
};

export const useVacancies = () => {
  return useQuery<VacancyListItem[], Error>({
    queryKey: vacancyKeys.lists(),
    queryFn: () => vacancyApi.getAll(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useVacancyDetail = (id: string | undefined) => {
  return useQuery<VacancyDetail, Error>({
    queryKey: vacancyKeys.detail(id!),
    queryFn: () => vacancyApi.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};
