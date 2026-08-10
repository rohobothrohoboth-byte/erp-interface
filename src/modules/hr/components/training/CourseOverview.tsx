import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { BookOpen, Users, ChevronRight } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

interface TrainingCourse {
  id: number;
  title: string;
  category: string;
  duration: string;
  format: 'Online' | 'Classroom' | 'Hybrid';
  status: 'Active' | 'Draft' | 'Archived';
  enrolled: number;
  completionRate: number;
}

const courseData: TrainingCourse[] = [
  { id: 1, title: 'Leadership Development', category: 'Management', duration: '8 weeks', format: 'Hybrid', status: 'Active', enrolled: 24, completionRate: 78 },
  { id: 2, title: 'Cybersecurity Awareness', category: 'IT', duration: '2 hours', format: 'Online', status: 'Active', enrolled: 156, completionRate: 92 },
  { id: 3, title: 'Diversity & Inclusion', category: 'HR', duration: '4 hours', format: 'Classroom', status: 'Active', enrolled: 89, completionRate: 65 },
  { id: 4, title: 'Advanced Excel', category: 'Finance', duration: '3 days', format: 'Online', status: 'Draft', enrolled: 0, completionRate: 0 },
];

const CourseOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {courseData.map(course => (
        <motion.div 
          key={course.id}
          whileHover={{ y: -5 }}
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                course.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 
                course.status === 'Draft' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <BookOpen className={`h-5 w-5 ${
                  course.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 
                  course.status === 'Draft' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.duration}
                  </Badge>
                  <Badge variant={course.format === 'Online' ? 'default' : 'secondary'} className="text-xs">
                    {course.format}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {course.enrolled} enrolled
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-800">
                  <div 
                    className="h-2 rounded-full bg-emerald-500" 
                    style={{ width: `${course.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {course.completionRate}%
                </span>
              </div>
            </div>
          </div>
          <div className="border-t px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: 2 days ago</span>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              Details <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CourseOverview;