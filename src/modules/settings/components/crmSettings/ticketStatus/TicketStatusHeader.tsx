import React from "react";
import { motion } from "framer-motion";
import { Ticket, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

const TicketStatusHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate('/settings/crm');

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
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

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <Ticket className="w-6 h-6 text-orange-600" />
        <h1 className="text-2xl font-bold text-black">
          <span className="bg-gradient-to-r from-orange-600 to-orange-600 bg-clip-text text-transparent">
            Ticket Status
          </span>
        </h1>
      </motion.div>
    </motion.div>
  );
};

export default TicketStatusHeader;
