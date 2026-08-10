// LeaveAppChainHeader.tsx (Fixed component name)
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

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

interface LeaveAppChainHeaderProps {
    leavePolicyName: string;
}

const LeaveAppChainHeader: React.FC<LeaveAppChainHeaderProps> = ({ leavePolicyName }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4"
        >
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Back</span>
                </Button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {leavePolicyName}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage approval workflow for this leave policy
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default LeaveAppChainHeader;