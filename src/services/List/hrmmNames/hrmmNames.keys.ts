import type { UUID } from '../../../types/List/list';

export const hrmmNamesKeys = {
  all: ['hrmmNames'] as const,
  addressNames: () => [...hrmmNamesKeys.all, 'addressNames'] as const,
  addressName: (id: UUID) => [...hrmmNamesKeys.all, 'addressName', id] as const,
  benefitSetNames: () => [...hrmmNamesKeys.all, 'benefitSetNames'] as const,
  benefitSetName: (id: UUID) => [...hrmmNamesKeys.all, 'benefitSetName', id] as const,
  educationQualNames: () => [...hrmmNamesKeys.all, 'educationQualNames'] as const,
  educationQualName: (id: UUID) => [...hrmmNamesKeys.all, 'educationQualName', id] as const,
  jobGradeNames: () => [...hrmmNamesKeys.all, 'jobGradeNames'] as const,
  jobGradeName: (id: UUID) => [...hrmmNamesKeys.all, 'jobGradeName', id] as const,
  positionNames: () => [...hrmmNamesKeys.all, 'positionNames'] as const,
  departmentPositions: (deptId: UUID) => [...hrmmNamesKeys.all, 'deptPositions', deptId] as const,
  branchComp: () => [...hrmmNamesKeys.all, 'branchComp'] as const,
  departmentNames: () => [...hrmmNamesKeys.all, 'departmentNames'] as const,
  departmentName: (id: UUID) => [...hrmmNamesKeys.all, 'departmentName', id] as const,
} as const;
