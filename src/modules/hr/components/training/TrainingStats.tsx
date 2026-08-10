import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { BookOpen, Clock, Users, CheckCircle, FileText } from 'lucide-react';

const statConfig = {
  totalCourses: {
    icon: <BookOpen className="h-4 w-4 text-emerald-600" />,
    title: 'Total Courses',
    description: 'Available training programs'
  },
  activeTrainings: {
    icon: <Clock className="h-4 w-4 text-emerald-500" />,
    title: 'Active Trainings',
    description: 'Ongoing programs'
  },
  employeesTraining: {
    icon: <Users className="h-4 w-4 text-emerald-500" />,
    title: 'Employees Training',
    description: 'Currently in training'
  },
  completionRate: {
    icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    title: 'Completion Rate',
    description: 'Overall training completion'
  },
  trainingBudget: {
    icon: <FileText className="h-4 w-4 text-emerald-600" />,
    title: 'Training Budget',
    description: 'Annual training allocation'
  }
};

const stats = {
  totalCourses: 4,
  activeTrainings: 2,
  employeesTraining: 1,
  completionRate: 75,
  trainingBudget: '$120,000'
};

const TrainingStats = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {Object.entries(statConfig).map(([key, config]) => (
        <Card key={key} className="hover:shadow-lg hover:ring-1 hover:ring-emerald-400 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {config.title}
            </CardTitle>
            {config.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {key === 'completionRate' 
                ? `${stats[key]}%`
                : key === 'trainingBudget'
                ? stats[key]
                : stats[key as keyof typeof stats]}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {config.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
};

export default TrainingStats;