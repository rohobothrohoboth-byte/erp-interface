import { motion } from 'framer-motion';
import EvaluationFlowSection from '../../../../components/settings/hrSettings/Recruitment/evaluationFlow/EvaluationFlowSection';

const PageEvaluationFlow = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 min-h-screen"
    >
      <EvaluationFlowSection />
    </motion.div>
  );
};

export default PageEvaluationFlow;
