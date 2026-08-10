import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function PendingEduExpHeader() {
  return (
    <motion.div 
      variants={itemVariants}
      animate="active"
      className="flex gap-2 items-center mb-4"
    >
      <BookOpen className="w-6 h-6 text-emerald-600" />
      <motion.h1 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-900"
      >
         <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Pending</span> Education & Experience
      </motion.h1>
    </motion.div>
  );
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring" as const, 
      stiffness: 100, 
      damping: 15,
      duration: 0.5
    }
  }
};
