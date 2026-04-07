import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VacancyDetailHeader from './VacancyDetailHeader';
import VacancyDetailContent from './VacancyDetailContent';
import VacancyApplySection from './VacancyApplySection';
import type { Vacancy } from '../../types/vacancy';
import type { JobAppIntAddDto } from '../../types/hr/recruit/jopApp';

const VacancyDetailSection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadVacancy();
    checkApplicationStatus();
  }, [id]);

  const loadVacancy = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockVacancy: Vacancy = {
        id: id || '1',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Addis Ababa',
        type: 'Full-time',
        status: 'open',
        postedDate: '2024-02-01',
        closingDate: '2024-03-01',
        description: `We are seeking a talented and experienced Senior Software Engineer to join our growing engineering team. 
        
In this role, you will be responsible for designing, developing, and maintaining high-quality software solutions that meet our business needs. You will work closely with cross-functional teams to deliver innovative products and features.

This is an excellent opportunity for career growth within our organization, offering competitive compensation and comprehensive benefits.`,
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years of professional software development experience',
          'Strong proficiency in React, TypeScript, and Node.js',
          'Experience with modern web development practices and tools',
          'Excellent problem-solving and analytical skills',
          'Strong communication and teamwork abilities',
          'Experience with Agile/Scrum methodologies'
        ],
        responsibilities: [
          'Design and develop scalable, high-performance web applications',
          'Lead technical discussions and provide mentorship to junior developers',
          'Collaborate with product managers and designers to define requirements',
          'Conduct code reviews and ensure code quality standards',
          'Participate in architectural decisions and technical planning',
          'Troubleshoot and resolve complex technical issues',
          'Stay updated with emerging technologies and industry trends'
        ],
        salary: {
          min: 80000,
          max: 120000,
          currency: 'ETB'
        },
        openings: 2,
        applicants: 15,
        postNumber: 'POST-2024-001',
        jobGrade: 'Grade 8 — Senior',
        requiredGender: 'Male/Female',
        workArrangement: 'Hybrid',
        keySkills: [
          'React & TypeScript',
          'Node.js / REST APIs',
          'System Design & Architecture',
          'Team Leadership & Mentoring',
          'Agile / Scrum',
          'CI/CD & DevOps basics'
        ]
      };

      setVacancy(mockVacancy);
    } catch (error) {
      console.error('Error loading vacancy:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = () => {
    // TODO: Check if current employee has already applied
    const applications = JSON.parse(localStorage.getItem('vacancyApplications') || '[]');
    const applied = applications.some((app: any) => app.vacancyId === id);
    setHasApplied(applied);
  };

  const handleApply = (applicationData: JobAppIntAddDto) => {
    // TODO: Replace with actual API call using applicationData
    const applications = JSON.parse(localStorage.getItem('vacancyApplications') || '[]');
    applications.push({ vacancyId: id, appliedDate: new Date().toISOString(), ...applicationData });
    localStorage.setItem('vacancyApplications', JSON.stringify(applications));
    setHasApplied(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vacancy details...</p>
        </div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vacancy not found</h2>
          <p className="text-gray-600 mb-4">The vacancy you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/hr/vacancies')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Vacancies
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <VacancyDetailHeader vacancy={vacancy} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VacancyDetailContent vacancy={vacancy} />
        </div>
        <div>
          <VacancyApplySection 
            vacancy={vacancy} 
            hasApplied={hasApplied}
            onApply={handleApply}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default VacancyDetailSection;
