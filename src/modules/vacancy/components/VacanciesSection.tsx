// src/components/vacancy/VacanciesSection.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import VacanciesHeader from '@/modules/vacancy/components/VacanciesHeader';
import VacanciesFilters from '@/modules/vacancy/components/VacanciesFilters';
import VacancyCard from '@/modules/vacancy/components/VacancyCard';
import { useVacancies, useInternalVacancies, useExternalVacancies } from '@/modules/hr/services/recruitment/vacancy/vacancy.queries';
import type { VacancyListItem } from '@/modules/hr/services/recruitment/vacancy/vacancy.api';
import type { Vacancy } from '@/modules/vacancy/types/vacancy';

// Helper function to map API data to Vacancy type
const mapToVacancy = (v: VacancyListItem): Vacancy => {
  const lower = v.empNatureStr?.toLowerCase() || '';
  let type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' = 'Full-time';

  if (lower.includes('full') || lower.includes('permanent')) type = 'Full-time';
  else if (lower.includes('part')) type = 'Part-time';
  else if (lower.includes('contract')) type = 'Contract';
  else if (lower.includes('temporary')) type = 'Temporary';
  else if (lower.includes('intern')) type = 'Internship';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString();
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return new Date().toISOString();
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  return {
    id: v.id,
    title: v.position,
    department: v.department,
    location: v.location || 'N/A',
    type,
    status: 'open',
    postedDate: formatDate(v.datePosted),
    closingDate: formatDate(v.deadline),
    description: '',
    requirements: [],
    responsibilities: [],
    openings: v.numOpen,
    applicants: 0,
    postNumber: v.postNumber,
    jobGrade: v.jobGrade,
    requiredGender: v.preGenderStr,
    isInternal: v.isInternal || false,
    postTypeStr: v.postTypeStr || '',
  };
};

const VacanciesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    department: 'all',
    location: 'all',
    type: 'all',
    status: 'open'
  });

  const { data: allVacancies = [], isLoading: allLoading } = useVacancies();
  const { data: internalVacancies = [], isLoading: internalLoading } = useInternalVacancies();
  const { data: externalVacancies = [], isLoading: externalLoading } = useExternalVacancies();

  const isLoading = allLoading || internalLoading || externalLoading;

  const getCurrentList = (): VacancyListItem[] => {
    switch (activeTab) {
      case 'internal':
        return internalVacancies;
      case 'external':
        return externalVacancies;
      default:
        return allVacancies;
    }
  };

  const currentList = getCurrentList();

  // ✅ Fixed filter logic - use 'all' checks
  const filteredVacancies = currentList.filter((v) => {
    const matchesSearch =
        v.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.location && v.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment = filters.department === 'all' || v.department === filters.department;
    const matchesLocation = filters.location === 'all' || v.location === filters.location;
    const matchesType = filters.type === 'all' || v.type === filters.type;

    return matchesSearch && matchesDepartment && matchesLocation && matchesType;
  });

  const departments = Array.from(new Set(currentList.map(v => v.department)));
  const locations = Array.from(new Set(currentList.map(v => v.location)));

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <VacanciesHeader
            totalVacancies={currentList.length}
            openVacancies={currentList.filter(v => v.status === 'Published').length}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">All Vacancies</TabsTrigger>
              <TabsTrigger value="internal">Internal</TabsTrigger>
              <TabsTrigger value="external">External</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <VacanciesFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filters={filters}
                  setFilters={setFilters}
                  departments={departments}
                  locations={locations}
              />
            </div>

            <TabsContent value="all" className="mt-6">
              {renderVacancyList(filteredVacancies, isLoading)}
            </TabsContent>
            <TabsContent value="internal" className="mt-6">
              {renderVacancyList(filteredVacancies, isLoading)}
            </TabsContent>
            <TabsContent value="external" className="mt-6">
              {renderVacancyList(filteredVacancies, isLoading)}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
  );
};

// Helper function to render vacancy list
function renderVacancyList(vacancies: VacancyListItem[], isLoading: boolean) {
  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading vacancies...</p>
          </div>
        </div>
    );
  }

  if (vacancies.length === 0) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-600">No vacancies found</p>
        </div>
    );
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vacancies.map((v) => (
            <VacancyCard key={v.id} vacancy={mapToVacancy(v)} />
        ))}
      </div>
  );
}

export default VacanciesSection;