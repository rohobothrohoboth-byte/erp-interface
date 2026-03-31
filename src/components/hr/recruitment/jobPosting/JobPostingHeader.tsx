import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

const JobPostingHeader: React.FC = () => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-2">
    <div className="flex items-center gap-2">
      <Megaphone className="w-6 h-6 text-green-600" />
      <div>
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Job Postings
          </span>
        </h1>
      </div>
    </div>
  </motion.div>
);

export default JobPostingHeader;
