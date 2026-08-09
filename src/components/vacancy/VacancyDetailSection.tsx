// src/components/vacancy/VacancyDetailSection.tsx

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Globe } from 'lucide-react';
import { Badge } from '../ui/badge';
import VacancyDetailHeader from './VacancyDetailHeader';
import VacancyDetailContent from './VacancyDetailContent';
import VacancyApplySection from './VacancyApplySection';
import { useVacancyDetail, useHasApplied } from '../../services/hr/recruitment/vacancy/vacancy.queries';
import type { Vacancy } from '../../types/vacancy';

// ✅ Helper function to map employment nature to Vacancy type
const mapEmploymentType = (empNatureStr: string): 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' => {
  const lower = empNatureStr?.toLowerCase() || '';

  if (lower.includes('full') || lower.includes('permanent') || lower === 'permanent / full-time') {
    return 'Full-time';
  }
  if (lower.includes('part') || lower.includes('part time')) {
    return 'Part-time';
  }
  if (lower.includes('contract') || lower.includes('fixed-term')) {
    return 'Contract';
  }
  if (lower.includes('temporary') || lower.includes('temp')) {
    return 'Temporary';
  }
  if (lower.includes('intern') || lower.includes('trainee')) {
    return 'Internship';
  }
  return 'Full-time'; // Default fallback
};

const VacancyDetailSection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applySuccess, setApplySuccess] = useState(false);

  console.log('VacancyDetailSection - ID:', id);

  const { data: detail, isLoading, error, isError } = useVacancyDetail(id);
  const { data: hasApplied = false, refetch: refetchApplied } = useHasApplied(id!);

  console.log('VacancyDetailSection - detail:', detail);
  console.log('VacancyDetailSection - error:', error);
  console.log('VacancyDetailSection - isLoading:', isLoading);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading vacancy details...</p>
          </div>
        </div>
    );
  }

  if (isError || !detail) {
    console.error('Error loading vacancy:', error);
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Vacancy not found</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'The vacancy you are looking for does not exist or has been removed.'}
            </p>
            <button
                onClick={() => navigate('/vacancies')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
            >
              Back to Vacancies
            </button>
          </div>
        </div>
    );
  }

  // ✅ Map the data correctly with proper type casting
  const vacancy: Vacancy = {
    id: detail.id,
    title: detail.position || 'N/A',
    department: detail.department || 'N/A',
    departmentId: detail.departmentId || '',
    location: detail.location || 'N/A',
    type: mapEmploymentType(detail.empNatureStr),  // ✅ Use the mapping function
    status: 'open',
    postedDate: detail.datePosted || new Date().toISOString(),
    closingDate: detail.deadline || new Date().toISOString(),
    description: detail.jobDesc || '',
    requirements: detail.reqQualList || [],
    responsibilities: detail.keyRespoList || [],
    keySkills: detail.keySkillsList || [],
    salary: detail.salary || 'N/A',
    openings: detail.numOpen || 0,
    applicants: 0,
    postNumber: detail.postNumber || '',
    jobGrade: detail.jobGrade || 'N/A',
    requiredGender: detail.preGenderStr || 'N/A',
    workArrangement: detail.workArrStr || 'N/A',
    isInternal: detail.isInternal || false,
    postTypeStr: detail.postTypeStr || 'N/A',
  };

  console.log('Mapped vacancy:', vacancy);

  const handleApplySuccess = () => {
    setApplySuccess(true);
    refetchApplied();
  };

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Internal/External Badge */}
        <div className="flex items-center gap-2 mb-4">
          {vacancy.isInternal ? (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1 text-sm px-3 py-1">
                <Building className="w-4 h-4" />
                Internal Position
              </Badge>
          ) : (
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 flex items-center gap-1 text-sm px-3 py-1">
                <Globe className="w-4 h-4" />
                External Position
              </Badge>
          )}
          <Badge variant="outline" className="text-sm px-3 py-1">
            {vacancy.status === 'open' ? 'Open' : 'Closed'}
          </Badge>
        </div>

        <VacancyDetailHeader vacancy={vacancy} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VacancyDetailContent vacancy={vacancy} />
          </div>
          <div>
            <VacancyApplySection
                vacancy={vacancy}
                hasApplied={hasApplied || applySuccess}
                onApply={handleApplySuccess}
            />
          </div>
        </div>
      </motion.div>
  );
};

export default VacancyDetailSection;