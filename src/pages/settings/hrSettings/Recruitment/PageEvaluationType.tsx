import { motion } from 'framer-motion';
import EvaluationTypeSection from '../../../../components/settings/hrSettings/Recruitment/evaluationType/EvaluationTypeSection';

const PageEvaluationType = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 min-h-screen"
    >
      <EvaluationTypeSection />
    </motion.div>
  );
};

export default PageEvaluationType;
