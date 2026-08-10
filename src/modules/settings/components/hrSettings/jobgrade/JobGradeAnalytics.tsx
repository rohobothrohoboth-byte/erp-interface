import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import type { JobGradeListDto } from '@/modules/hr/types/jobgrade';

interface JobGradeAnalyticsProps {
  jobGrades: JobGradeListDto[];
  filteredGrades: JobGradeListDto[];
}

// Define variants with proper TypeScript types
const itemVariants = {
  hidden: { 
    y: 20, 
    opacity: 0 
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: 'spring' as const, 
      stiffness: 100, 
      damping: 15 
    }
  }
};

const JobGradeAnalytics: React.FC<JobGradeAnalyticsProps> = ({ jobGrades, filteredGrades }) => {
  // Calculate statistics
  const totalGrades = jobGrades.length;
  const showingGrades = filteredGrades.length;
  
  const totalSalaryRange = jobGrades.reduce((acc, grade) => acc + (grade.maxSalary - grade.startSalary), 0);
  const avgSalaryRange = totalSalaryRange / totalGrades;
  
  const avgStartSalary = jobGrades.reduce((acc, grade) => acc + grade.startSalary, 0) / totalGrades;
  const avgMaxSalary = jobGrades.reduce((acc, grade) => acc + grade.maxSalary, 0) / totalGrades;

  // Extract categories from grade names
  const categories = [...new Set(jobGrades.map(grade => {
    const name = grade.name.toLowerCase();
    if (name.includes('entry')) return 'Entry Level';
    if (name.includes('junior')) return 'Junior';
    if (name.includes('mid')) return 'Mid Level';
    if (name.includes('senior')) return 'Senior';
    if (name.includes('lead')) return 'Lead';
    if (name.includes('principal')) return 'Principal';
    if (name.includes('director')) return 'Director';
    if (name.includes('executive')) return 'Executive';
    return 'Other';
  }))];

  return (
    <motion.div 
      variants={itemVariants} 
      className="mt-10 p-6 bg-white border border-green-100 rounded-xl shadow-sm"
    >
      <div className="flex items-center mb-4">
        <BarChart3 className="text-green-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-green-800">Grade Distribution Analytics</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-gray-600">Total Grades</p>
          <p className="text-xl font-semibold text-green-700">{totalGrades}</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-gray-600">Categories</p>
          <p className="text-xl font-semibold text-green-700">{categories.length}</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-gray-600">Avg Start Salary</p>
          <p className="text-xl font-semibold text-green-700">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(avgStartSalary)}
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-gray-600">Showing</p>
          <p className="text-xl font-semibold text-green-700">{showingGrades}</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-gray-600">Average Salary Range</p>
          <p className="text-lg font-semibold text-blue-700">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(avgSalaryRange)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-gray-600">Average Max Salary</p>
          <p className="text-lg font-semibold text-purple-700">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(avgMaxSalary)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default JobGradeAnalytics;