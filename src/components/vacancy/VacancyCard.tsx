import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Vacancy } from '../../types/vacancy';

interface VacancyCardProps {
  vacancy: Vacancy;
}

const VacancyCard = ({ vacancy }: VacancyCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const daysRemaining = Math.ceil(
    (new Date(vacancy.closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-4 hover:shadow-2xl hover:border-green-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={() => navigate(`/vacancies/${vacancy.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/0 group-hover:from-green-50/50 group-hover:to-blue-50/30 transition-all duration-300" />

      <div className="relative z-10">
        {/* Post number — top left with background */}
        {vacancy.postNumber && (
          <div className="mb-1">
            <span className="inline-block font-mono text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
              {vacancy.postNumber}
            </span>
          </div>
        )}

        {/* Title row — title left, openings badge right, aligned */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 flex-1">
            {vacancy.title}
          </h3>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-semibold px-3 py-1 shrink-0 mt-0.5">
            {vacancy.openings} {vacancy.openings === 1 ? 'Opening' : 'Openings'}
          </Badge>
        </div>

        {/* Department */}
        <p className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          {vacancy.department}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium">{vacancy.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium">{vacancy.type}</span>
          </div>
          {vacancy.requiredGender && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">Gender: {vacancy.requiredGender}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Posted {formatDate(vacancy.postedDate)}</span>
          </div>
        </div>

        {/* Description preview */}
        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
          {vacancy.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <span className={`text-sm font-medium ${daysRemaining <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
            Deadline: {vacancy.closingDate}
          </span>
          {vacancy.jobGrade && (
            <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
              {vacancy.jobGrade}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VacancyCard;
