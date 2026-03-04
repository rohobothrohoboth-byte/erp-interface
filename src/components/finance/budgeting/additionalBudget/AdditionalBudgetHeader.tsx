import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

export default function AdditionalBudgetHeader() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="mb-4 flex items-center gap-3"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <h1 className="text-2xl font-bold text-black">
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-600 bg-clip-text text-transparent">
            Additional Budget
          </span>
        </h1>
      </motion.div>
    </motion.div>
  );
}
