import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Users, BarChart2, Download } from 'lucide-react';

interface TrainingEvaluation {
  id: number;
  course: string;
  participants: number;
  averageScore: number;
  effectiveness: number;
  feedback: string;
}

const evaluationData: TrainingEvaluation[] = [
  { id: 1, course: 'Leadership Development', participants: 24, averageScore: 82, effectiveness: 85, feedback: 'Excellent content and delivery. Some participants requested more case studies.' },
  { id: 2, course: 'Cybersecurity Awareness', participants: 156, averageScore: 91, effectiveness: 92, feedback: 'Highly effective training. Employees reported increased awareness.' },
  { id: 3, course: 'Diversity & Inclusion', participants: 89, averageScore: 76, effectiveness: 68, feedback: 'Good foundation but needs more interactive elements.' },
];

const EvaluationOverview = () => {
  return (
    <div className="space-y-4">
      {evaluationData.map(evalItem => (
        <motion.div 
          key={evalItem.id}
          whileHover={{ scale: 1.01 }}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{evalItem.course}</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{evalItem.participants} participants</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <BarChart2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>Avg. score: {evalItem.averageScore}/100</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={evalItem.effectiveness > 70 ? "#10b981" : evalItem.effectiveness > 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${evalItem.effectiveness}, 100`}
                  />
                  <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill={evalItem.effectiveness > 70 ? "#10b981" : evalItem.effectiveness > 40 ? "#f59e0b" : "#ef4444"} fontWeight="bold">
                    {evalItem.effectiveness}%
                  </text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Feedback:</span> {evalItem.feedback}
            </p>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              Detailed Report <Download className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EvaluationOverview;