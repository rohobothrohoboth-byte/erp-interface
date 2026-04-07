import { motion } from 'framer-motion';
import { FileText, CheckCircle, Briefcase, DollarSign, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Vacancy } from '../../types/vacancy';

interface VacancyDetailContentProps {
  vacancy: Vacancy;
}

const VacancyDetailContent = ({ vacancy }: VacancyDetailContentProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-line">{vacancy.description}</p>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Key Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {vacancy.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Requirements & Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {vacancy.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-2" />
                <span className="text-gray-700">{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Required Skills (was Benefits) */}
      {vacancy.keySkills && vacancy.keySkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vacancy.keySkills.map((skill, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{skill}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Job Grade (was Compensation) */}
      {vacancy.salary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Job Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {vacancy.salary.min.toLocaleString()} – {vacancy.salary.max.toLocaleString()}
              </span>
              <span className="text-gray-600">{vacancy.salary.currency} per month</span>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default VacancyDetailContent;
