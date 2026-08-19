import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingCardProps {
  id: number;
  title: string;
  // description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
  iconColor: string;
  index: number;
}

const SettingCard: React.FC<SettingCardProps> = ({
  title,
  // description,
  icon: Icon,
  href,
  color,
  bgColor,
  iconColor,
  index
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(href);
  };

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 
                hover:shadow-md transition-all duration-200 
                cursor-pointer group overflow-hidden relative"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
          {title}
        </h3>

        {/* <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {description}
        </p> */}

        <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${color} 
                      group-hover:w-16 transition-all duration-300`} />
      </div>

      {/* Hover effect overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} 
                    opacity-0 group-hover:opacity-5 transition-opacity duration-200 
                    pointer-events-none rounded-2xl`} />
    </motion.div>
  );
};

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default SettingCard;