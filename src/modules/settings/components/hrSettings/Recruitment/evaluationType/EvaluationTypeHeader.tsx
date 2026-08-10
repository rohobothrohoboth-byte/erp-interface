import { motion } from 'framer-motion';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

const EvaluationTypeHeader = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Evaluation Types
            </span>
          </h1>
        </div>
      </div>
    </motion.div>
  );
};

export default EvaluationTypeHeader;
