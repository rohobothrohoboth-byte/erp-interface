import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import type { JobGradeListDto } from '@/modules/hr/types/jobgrade';

interface JobGradeSubgradesHeaderProps {
  jobGrade: JobGradeListDto | null;
}

// Define variants with proper TypeScript types
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
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
// const JobGradeSubgradesHeader: React.FC<JobGradeSubgradesHeaderProps> = ({ 
//   jobGrade
// })
const JobGradeSubgradesHeader: React.FC<JobGradeSubgradesHeaderProps> = () => {
  return (
    <motion.div variants={itemVariants}>
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-black">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block"
            >
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {/* {jobGrade?.name || 'Job Grade'} */}
                Job
              </span> Steps
            </motion.span>
          </h1>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JobGradeSubgradesHeader;