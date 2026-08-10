import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';

interface TrainingBudget {
  id: number;
  category: string;
  allocated: string;
  spent: string;
  remaining: string;
  utilization: number;
}

const budgetData: TrainingBudget[] = [
  { id: 1, category: 'Leadership Development', allocated: '$50,000', spent: '$42,300', remaining: '$7,700', utilization: 85 },
  { id: 2, category: 'Technical Skills', allocated: '$35,000', spent: '$28,150', remaining: '$6,850', utilization: 80 },
  { id: 3, category: 'Compliance Training', allocated: '$15,000', spent: '$16,200', remaining: '$-1,200', utilization: 108 },
  { id: 4, category: 'Soft Skills', allocated: '$20,000', spent: '$12,000', remaining: '$8,000', utilization: 60 },
];

const BudgetOverview = () => {
  return (
    <div className="space-y-4">
      {budgetData.map(budget => {
        const displayUtilization = Math.min(budget.utilization, 100);
        
        return (
          <motion.div 
            key={budget.id}
            whileHover={{ scale: 1.01 }}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{budget.category}</h3>
              <Badge 
                variant={
                  budget.utilization > 90 ? 'destructive' : 
                  budget.utilization > 70 ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {budget.utilization}% utilized
              </Badge>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Allocated</p>
                <p className="font-medium">{budget.allocated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                <p className="font-medium">{budget.spent}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                <p className="font-medium" style={{ 
                  color: parseFloat(budget.remaining.replace(/[^0-9.]/g, '')) < 0 ? '#ef4444' : 'inherit'
                }}>
                  {budget.remaining}
                </p>
              </div>
            </div>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${
                  budget.utilization > 90 ? 'bg-red-500' : 
                  budget.utilization > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                }`} 
                style={{ width: `${displayUtilization}%` }}
              ></div>
            </div>
            
            {budget.utilization > 100 && (
              <p className="mt-2 text-xs text-red-500">
                Warning: Budget exceeded by {budget.utilization - 100}%
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default BudgetOverview;