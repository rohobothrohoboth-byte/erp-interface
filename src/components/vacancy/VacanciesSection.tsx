import { useState } from 'react';
import { motion } from 'framer-motion';
import VacanciesHeader from './VacanciesHeader';
import VacanciesFilters from './VacanciesFilters';
import VacancyCard from './VacancyCard';
import { useVacancies } from '../../services/hr/recruitment/vacancy/vacancy.queries';
import type { VacancyListItem } from '../../services/hr/recruitment/vacancy/vacancy.api';

const VacanciesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    type: '',
    status: 'open'
  });

  const { data: vacancies = [], isLoading } = useVacancies();

  const filteredVacancies = vacancies.filter((v) => {
    const matchesSearch =
      v.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.location && v.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = !filters.department || v.department === filters.department;
    const matchesLocation = !filters.location || v.location === filters.location;
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <VacanciesHeader
        totalVacancies={vacancies.length}
        openVacancies={vacancies.length}
      />

      <VacanciesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        vacancies={[]}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading vacancies...</p>
          </div>
        </div>
      ) : filteredVacancies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No vacancies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacancies.map((v) => (
            <VacancyCard key={v.id} vacancy={toVacancy(v)} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Map API VacancyListItem → local Vacancy shape used by VacancyCard
function toVacancy(v: VacancyListItem) {
  return {
    id: v.id,
    title: v.position,
    department: v.department,
    location: v.location || 'N/A',
    type: v.empNatureStr as any,
    status: 'open' as const,
    postedDate: v.datePosted,
    closingDate: v.deadline,
    description: '',
    requirements: [],
    responsibilities: [],
    openings: v.numOpen,
    applicants: 0,
    postNumber: v.postNumber,
    jobGrade: v.jobGrade,
    requiredGender: v.preGenderStr,
  };
}

export default VacanciesSection;
