import { motion } from 'framer-motion';
import { Briefcase, Sparkles } from 'lucide-react';

interface VacanciesHeaderProps {
  totalVacancies: number;
  openVacancies: number;
}

const VacanciesHeader = ({ openVacancies }: VacanciesHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 rounded-3xl shadow-2xl p-10 text-white overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-yellow-300" />
              <h1 className="text-4xl font-bold">Grow Your Career</h1>
            </div>
            <p className="text-green-100 text-lg max-w-2xl">
              Discover exciting internal opportunities and take the next step in your professional journey with us
            </p>
          </div>

          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[160px]">
            <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3 mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <p className="text-4xl font-bold mb-1">{openVacancies}</p>
            <p className="text-sm text-green-100">Total Vacancies</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VacanciesHeader;
