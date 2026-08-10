// src/components/vacancy/VacancyDetailHeader.tsx

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Calendar, Clock, Monitor } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { Vacancy } from '@/modules/vacancy/types/vacancy';

interface VacancyDetailHeaderProps {
  vacancy: Vacancy;
}

const VacancyDetailHeader = ({ vacancy }: VacancyDetailHeaderProps) => {
  // ✅ Safe date formatting
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const daysRemaining = (() => {
    if (!vacancy.closingDate) return 0;
    try {
      const date = new Date(vacancy.closingDate);
      if (isNaN(date.getTime())) return 0;
      return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  })();

  const formattedPostedDate = formatDate(vacancy.postedDate);
  const formattedClosingDate = formatDate(vacancy.closingDate);
  const isExpired = daysRemaining <= 0;

  return (
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-6">
          <div>
            {vacancy.postNumber && (
                <span className="inline-block font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded mb-2">
              {vacancy.postNumber}
            </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{vacancy.title || 'N/A'}</h1>
            <p className="text-lg text-gray-600">{vacancy.department || 'N/A'}</p>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {vacancy.openings} {vacancy.openings === 1 ? 'Opening' : 'Openings'}
          </Badge>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-5 h-5 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium text-gray-900">{vacancy.location || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium text-gray-900">{vacancy.type || 'N/A'}</p>
            </div>
          </div>

          {vacancy.workArrangement && (
              <div className="flex items-center text-sm text-gray-600">
                <Monitor className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Work Arrangement</p>
                  <p className="font-medium text-gray-900">{vacancy.workArrangement}</p>
                </div>
              </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-5 h-5 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Posted</p>
              <p className="font-medium text-gray-900">{formattedPostedDate}</p>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Closing</p>
              <p className={`font-medium ${isExpired ? 'text-red-600' : daysRemaining <= 7 && daysRemaining > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                {formattedClosingDate}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
  );
};

export default VacancyDetailHeader;