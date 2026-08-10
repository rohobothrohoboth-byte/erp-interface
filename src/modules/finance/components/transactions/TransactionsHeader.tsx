import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

const TransactionsHeader = () => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
            <CreditCard className="text-indigo-600" size={28} />
          <h1 className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent text-3xl font-bold">
            Transactions <span className="text-gray-700">Management</span>
          </h1>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionsHeader;