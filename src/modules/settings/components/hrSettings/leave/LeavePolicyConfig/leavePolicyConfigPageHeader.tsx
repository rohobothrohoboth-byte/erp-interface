import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const LeavePolicyConfigPageHeader = () => {
   const navigate = useNavigate();

   const handleBack = () => {
     navigate(-1);
   };
  return (
    <motion.div
      variants={itemVariants}
      className="mb-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <FileText className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-black">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block"
            >
              <span className="bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                Leave 
              </span>{" "}Policy Configuraion
             
            </motion.span>
          </h1>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeavePolicyConfigPageHeader;