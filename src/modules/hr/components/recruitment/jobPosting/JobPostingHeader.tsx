// src/components/hr/recruitment/jobPosting/JobPostingHeader.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Briefcase, Users, Calendar } from 'lucide-react';

interface JobPostingHeaderProps {
  title?: string;
  subtitle?: string;
  stats?: {
    total?: number;
    published?: number;
    draft?: number;
    closed?: number;
  };
}

const JobPostingHeader: React.FC<JobPostingHeaderProps> = ({
                                                             title = 'Job Postings',
                                                             subtitle = 'Manage all job postings and applications',
                                                             stats
                                                           }) => {
  return (
      <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Megaphone className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {title}
              </span>
              </h1>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>

          {stats && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{stats.total || 0}</span>
                  <span className="text-gray-400">Total</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-600">{stats.published || 0}</span>
                  <span className="text-green-500">Published</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{stats.draft || 0}</span>
                  <span className="text-gray-400">Draft</span>
                </div>
              </div>
          )}
        </div>
      </motion.div>
  );
};

export default JobPostingHeader;