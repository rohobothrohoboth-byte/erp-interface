import { motion } from 'framer-motion';
import { FileCheck } from 'lucide-react';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const InvoiceApprovalHeader: React.FC = () => {
  return (
    <motion.div
      variants={itemVariants}
      className="mb-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-lg">
          <FileCheck className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Invoice Approval
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve pending invoices
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceApprovalHeader;
