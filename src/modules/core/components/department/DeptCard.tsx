import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { motion } from 'framer-motion';
import { Activity, CreditCard, Users, Database, Box, Layers } from 'lucide-react';
import type { Department } from '@/modules/core/data/company';

interface DepartmentCardProps {
  department: Department;
}

const DepartmentCard = ({ department }: DepartmentCardProps) => {
  const typeConfig = {
    operations: {
      icon: <Activity className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
      gradient: 'from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900'
    },
    finance: {
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
      gradient: 'from-green-50 to-white dark:from-green-900/20 dark:to-gray-900'
    },
    hr: {
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
      gradient: 'from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900'
    },
    it: {
      icon: <Database className="h-5 w-5" />,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
      gradient: 'from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900'
    },
    sales: {
      icon: <Box className="h-5 w-5" />,
      color: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
      gradient: 'from-red-50 to-white dark:from-red-900/20 dark:to-gray-900'
    },
    marketing: {
      icon: <Layers className="h-5 w-5" />,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
      gradient: 'from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900'
    }
  };

  const config = typeConfig[department.type] || typeConfig.operations;

  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${config.color}`}>
                {config.icon}
              </div>
              <div>
                <h4 className="font-medium">{department.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{department.type} department</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {department.budget} budget
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`border rounded-lg p-4 bg-gradient-to-br ${config.gradient}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manager</p>
                <p className="text-sm font-medium">{department.manager}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
                <p className="text-sm font-medium">{department.employees}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-gray-500 dark:text-gray-400">
          Last activity: {department.lastActivity}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 20 
    }
  }
};

export default DepartmentCard;