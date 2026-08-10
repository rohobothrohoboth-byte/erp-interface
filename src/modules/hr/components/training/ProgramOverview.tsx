import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';

interface TrainingProgram {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  budget: string;
  status: 'Planning' | 'Ongoing' | 'Completed' | 'Cancelled';
}

const programData: TrainingProgram[] = [
  { id: 1, name: 'Annual Leadership Program', description: 'Year-long leadership development for managers', startDate: 'Jan 1, 2024', endDate: 'Dec 31, 2024', participants: 24, budget: '$45,000', status: 'Ongoing' },
  { id: 2, name: 'Q3 Technical Training', description: 'Technical skills upgrade for IT department', startDate: 'Jul 15, 2024', endDate: 'Sep 30, 2024', participants: 18, budget: '$22,500', status: 'Planning' },
  { id: 3, name: 'New Hire Orientation', description: 'Monthly onboarding for new employees', startDate: 'Jun 1, 2024', endDate: 'Jun 30, 2024', participants: 12, budget: '$8,000', status: 'Completed' },
];

const ProgramOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {programData.map(program => (
        <motion.div 
          key={program.id}
          whileHover={{ scale: 1.02 }}
          className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900 ${
            program.status === 'Ongoing' 
              ? 'ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/20' 
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{program.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {program.startDate} - {program.endDate}
              </p>
            </div>
            <Badge 
              variant={
                program.status === 'Ongoing' ? 'default' : 
                program.status === 'Planning' ? 'secondary' : 
                program.status === 'Completed' ? 'outline' : 'destructive'
              }
              className="capitalize"
            >
              {program.status}
            </Badge>
          </div>
          
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
            {program.description}
          </p>
          
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Participants</p>
              <p className="font-medium">{program.participants}</p>
            </div>
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
              <p className="font-medium">{program.budget}</p>
            </div>
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Days Left</p>
              <p className="font-medium">
                {program.status === 'Completed' ? 'Finished' : 
                 program.status === 'Planning' ? '--' : '14'}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProgramOverview;