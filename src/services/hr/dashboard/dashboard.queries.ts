
import { useQuery } from '@tanstack/react-query';
import { empListRepoKeys } from './dashboard.key';
import { getEmpDbRepo, getPendEmpList } from './dashboard.api';

export const useEmpDbRepo = () => {
  return useQuery({
    queryKey: empListRepoKeys.empDbRepo(),
    queryFn: getEmpDbRepo,
  });
};

export const usePendEmpList = () => {
  return useQuery({
    queryKey: empListRepoKeys.pendEmpList(),
    queryFn: getPendEmpList,
  });
};
