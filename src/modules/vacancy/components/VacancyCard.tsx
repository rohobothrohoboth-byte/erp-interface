// src/components/vacancy/VacancyCard.tsx

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Users, Building2, BarChart2, Globe, Building } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { Vacancy } from '@/modules/vacancy/types/vacancy';

interface VacancyCardProps {
  vacancy: Vacancy;
}

const VacancyCard = ({ vacancy }: VacancyCardProps) => {
  const navigate = useNavigate();

  // ✅ Safe date formatting
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // ✅ Safe days remaining calculation
  const getDaysRemaining = (dateString: string) => {
    if (!dateString) return 0;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 0;
      return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const daysRemaining = getDaysRemaining(vacancy.closingDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  // ✅ Use formatted date strings
  const formattedPostedDate = formatDate(vacancy.postedDate);
  const formattedClosingDate = formatDate(vacancy.closingDate);

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="group bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-2xl hover:border-green-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
          onClick={() => navigate(`/vacancies/${vacancy.id}`)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/0 group-hover:from-green-50/50 group-hover:to-blue-50/30 transition-all duration-300" />

        <div className="relative z-10">
          {/* Internal/External Badge */}
          <div className="absolute top-4 right-4">
            {vacancy.isInternal ? (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Internal
                </Badge>
            ) : (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  External
                </Badge>
            )}
          </div>

          {/* Title + openings */}
          <div className="flex items-start justify-between mb-4 pr-24">
            <div className="flex-1">
              {vacancy.postNumber && (
                  <span className="inline-block font-mono text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
                {vacancy.postNumber}
              </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                {vacancy.title}
              </h3>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-600" />
                {vacancy.department}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-semibold px-3 py-1 flex-shrink-0">
              {vacancy.openings} {vacancy.openings === 1 ? 'Opening' : 'Openings'}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">{vacancy.location || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">{vacancy.type || 'N/A'}</span>
            </div>
            {vacancy.requiredGender && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-green-600" />
                  <span className="font-medium">Gender: {vacancy.requiredGender}</span>
                </div>
            )}
            {vacancy.jobGrade && (
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart2 className="w-4 h-4 mr-2 text-green-600" />
                  <span className="font-medium">{vacancy.jobGrade}</span>
                </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Posted {formattedPostedDate}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className={`text-sm font-medium ${
              isExpired ? 'text-red-600' :
                  isExpiringSoon ? 'text-orange-600' :
                      'text-gray-600'
          }`}>
            {isExpired ? 'Expired' : `Deadline: ${formattedClosingDate}`}
          </span>
            {!isExpired && daysRemaining > 0 && (
                <Badge variant={isExpiringSoon ? 'destructive' : 'outline'} className="text-xs">
                  {daysRemaining} days left
                </Badge>
            )}
          </div>
        </div>
      </motion.div>
  );
};

export default VacancyCard;