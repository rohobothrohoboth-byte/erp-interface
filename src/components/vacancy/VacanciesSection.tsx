import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VacanciesHeader from './VacanciesHeader';
import VacanciesFilters from './VacanciesFilters';
import VacancyCard from './VacancyCard';
import type { Vacancy } from '../../types/vacancy';

const VacanciesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    type: '',
    status: 'open'
  });
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(false);

  // Load vacancies (mock data for now)
  useEffect(() => {
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockVacancies: Vacancy[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          location: 'Addis Ababa',
          type: 'Full-time',
          status: 'open',
          postedDate: '2026-02-01',
          closingDate: '2026-03-01',
          description: 'We are looking for an experienced software engineer...',
          requirements: ['5+ years experience', 'React expertise', 'Team leadership'],
          responsibilities: ['Lead development team', 'Code review', 'Architecture design'],
          salary: {
            min: 80000,
            max: 120000,
            currency: 'ETB'
          },
          openings: 2,
          applicants: 15,
          postNumber: 'POST-2024-001',
          jobGrade: 'Level II — Senior',
          requiredGender: 'Male/Female',
          workArrangement: 'Hybrid',
          keySkills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Team Leadership']
        },
        {
          id: '2',
          title: 'HR Manager',
          department: 'Human Resources',
          location: 'Addis Ababa',
          type: 'Full-time',
          status: 'open',
          postedDate: '2026-02-05',
          closingDate: '2026-03-05',
          description: 'Seeking an experienced HR Manager...',
          requirements: ['7+ years HR experience', 'SHRM certification', 'Leadership skills'],
          responsibilities: ['Manage HR team', 'Policy development', 'Employee relations'],
          salary: { min: 70000, max: 100000, currency: 'ETB' },
          openings: 1,
          applicants: 8,
          postNumber: 'POST-2024-002',
          jobGrade: 'Level II — Manager',
          requiredGender: 'Male/Female',
          workArrangement: 'On-site',
          keySkills: ['HR Strategy', 'Talent Acquisition', 'Labor Law', 'HRIS']
        }
      ];
      
      setVacancies(mockVacancies);
    } catch (error) {
      console.error('Error loading vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter vacancies
  const filteredVacancies = vacancies.filter(vacancy => {
    const matchesSearch = 
      vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !filters.department || vacancy.department === filters.department;
    const matchesLocation = !filters.location || vacancy.location === filters.location;
    const matchesType = !filters.type || vacancy.type === filters.type;
    const matchesStatus = !filters.status || vacancy.status === filters.status;

    return matchesSearch && matchesDepartment && matchesLocation && matchesType && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <VacanciesHeader totalVacancies={vacancies.length} openVacancies={vacancies.filter(v => v.status === 'open').length} />
      
      <VacanciesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        vacancies={vacancies}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vacancies...</p>
          </div>
        </div>
      ) : filteredVacancies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No vacancies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default VacanciesSection;
