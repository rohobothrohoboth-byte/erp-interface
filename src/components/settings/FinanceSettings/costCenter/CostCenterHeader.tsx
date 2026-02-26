import { motion } from 'framer-motion';
import { ArrowLeft, Network } from 'lucide-react';
import { Button } from '../../../ui/button';
import { useNavigate } from 'react-router-dom';

const CostCenterHeader: React.FC = () => {
   const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="mb-4 flex items-center gap-3"
    >
       <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Button>
      
        <Network className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-black">
          <span className="bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent">
            Cost Center
          </span>
        </h1>
    </motion.div>
  );
};

export default CostCenterHeader;
