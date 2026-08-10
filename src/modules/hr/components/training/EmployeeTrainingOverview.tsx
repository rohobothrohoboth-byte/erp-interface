import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

interface EmployeeTraining {
  id: number;
  employee: string;
  position: string;
  department: string;
  course: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  completionDate: string;
  score?: number;
  certification: boolean;
}

const employeeTrainingData: EmployeeTraining[] = [
  { id: 1, employee: 'John Smith', position: 'Manager', department: 'Finance', course: 'Leadership Development', status: 'Completed', completionDate: 'May 15, 2024', score: 88, certification: true },
  { id: 2, employee: 'Jane Doe', position: 'HR Specialist', department: 'HR', course: 'Diversity & Inclusion', status: 'In Progress', completionDate: '', certification: false },
  { id: 3, employee: 'Robert Johnson', position: 'IT Support', department: 'IT', course: 'Cybersecurity Awareness', status: 'Completed', completionDate: 'Apr 28, 2024', score: 95, certification: true },
  { id: 4, employee: 'Emily Davis', position: 'Accountant', department: 'Finance', course: 'Advanced Excel', status: 'Not Started', completionDate: '', certification: false },
];

const EmployeeTrainingOverview = () => {
  return (
    <div className="space-y-4">
      {employeeTrainingData.map(record => (
        <motion.div 
          key={record.id}
          whileHover={{ x: 5 }}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{record.employee}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {record.position} • {record.department}
              </p>
              <p className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">
                {record.course}
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant={
                  record.status === 'Completed' ? 'default' : 
                  record.status === 'In Progress' ? 'secondary' : 'outline'
                }
                className="capitalize"
              >
                {record.status}
              </Badge>
              {record.completionDate && (
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  {record.completionDate}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {record.certification && (
                <Badge variant="default" className="px-2 py-0.5 text-xs flex items-center gap-1">
                  <Award className="h-3 w-3" /> Certified
                </Badge>
              )}
              {record.score && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  Score: {record.score}/100
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              View Record <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EmployeeTrainingOverview;