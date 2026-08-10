import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
  className?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  className = '',
  onClick,
}) => {
  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-success-500' : 'text-error-500';
  };

  const getChangeIcon = () => {
    if (!change) return null;
    return change > 0 ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className={`h-full ${className}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
            
            {change !== undefined && (
              <div className={`mt-1 flex items-center ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="text-sm ml-1">
                  {Math.abs(change)}% {change > 0 ? 'increase' : 'decrease'}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-gray-100 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default MetricCard;