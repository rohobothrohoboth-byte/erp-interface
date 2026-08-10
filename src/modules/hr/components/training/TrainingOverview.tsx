import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { BookOpen, Users, Calendar, BarChart2, FileText } from 'lucide-react';
import CourseOverview from '@/modules/hr/components/training/CourseOverview';
import EmployeeTrainingOverview from '@/modules/hr/components/training/EmployeeTrainingOverview';
import ProgramOverview from '@/modules/hr/components/training/ProgramOverview';
import EvaluationOverview from '@/modules/hr/components/training/EvaluationOverview';
import BudgetOverview from '@/modules/hr/components/training/BudgetOverview';

const TrainingOverview = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <span>Course Overview</span>
          </CardTitle>
          <CardDescription>
            View and manage all available training courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseOverview />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            <span>Employee Training</span>
          </CardTitle>
          <CardDescription>
            Track employee participation and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTrainingOverview />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <span>Program Overview</span>
          </CardTitle>
          <CardDescription>
            Current and upcoming training programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramOverview />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-emerald-500" />
            <span>Training Evaluation</span>
          </CardTitle>
          <CardDescription>
            Effectiveness metrics and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvaluationOverview />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            <span>Budget Overview</span>
          </CardTitle>
          <CardDescription>
            Training budget allocation and utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetOverview />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrainingOverview;