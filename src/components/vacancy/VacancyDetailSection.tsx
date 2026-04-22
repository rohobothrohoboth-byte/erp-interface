import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VacancyDetailHeader from './VacancyDetailHeader';
import VacancyDetailContent from './VacancyDetailContent';
import VacancyApplySection from './VacancyApplySection';
import { useVacancyDetail } from '../../services/hr/recruitment/vacancy/vacancy.queries';

const VacancyDetailSection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hasApplied, setHasApplied] = useState(() => {
    const applications = JSON.parse(localStorage.getItem('vacancyApplications') || '[]');
    return applications.some((app: any) => app.vacancyId === id);
  });

  const { data: detail, isLoading, error } = useVacancyDetail(id);

  const handleApply = () => {
    const applications = JSON.parse(localStorage.getItem('vacancyApplications') || '[]');
    applications.push({ vacancyId: id, appliedDate: new Date().toISOString() });
    localStorage.setItem('vacancyApplications', JSON.stringify(applications));
    setHasApplied(true);
  };

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

  if (error || !detail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vacancy not found</h2>
          <button onClick={() => navigate('/vacancies')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Back to Vacancies
          </button>
        </div>
      </div>
    );
  }

  // Map API detail → local Vacancy shape used by the detail components
  const vacancy = {
    id: detail.id,
    title: detail.position,
    department: detail.department,
    location: detail.location || 'N/A',
    type: detail.empNatureStr as any,
    status: 'open' as const,
    postedDate: detail.datePosted,
    closingDate: detail.deadline,
    description: detail.jobDesc,
    requirements: detail.reqQual,
    responsibilities: detail.keyRespo,
    salary: detail.salary,
    openings: detail.numOpen,
    applicants: 0,
    postNumber: detail.postNumber,
    jobGrade: detail.jobGrade,
    requiredGender: detail.preGenderStr,
    workArrangement: detail.workArrStr,
    keySkills: detail.keySkills,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <VacancyDetailHeader vacancy={vacancy} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VacancyDetailContent vacancy={vacancy} />
        </div>
        <div>
          <VacancyApplySection vacancy={vacancy} hasApplied={hasApplied} onApply={handleApply} />
        </div>
      </div>
    </motion.div>
  );
};

export default VacancyDetailSection;
