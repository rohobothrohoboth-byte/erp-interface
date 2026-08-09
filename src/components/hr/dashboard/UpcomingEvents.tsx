// components/hr/dashboard/UpcomingEvents.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { CalendarDays, ChevronRight, Clock, Gift, Briefcase } from 'lucide-react';
import type { EventItem } from '../../../types/hr/dashboard.types';

interface UpcomingEventsProps {
  events: EventItem[];
  onViewAll?: () => void;
  loading?: boolean;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'Birthday':
      return Gift;
    case 'Anniversary':
      return Briefcase;
    default:
      return CalendarDays;
  }
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'Birthday':
      return 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800';
    case 'Anniversary':
      return 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    default:
      return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
};

const formatEventDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, onViewAll, loading = false }) => {
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      window.location.href = '/hr/events';
    }
  };

  if (loading) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upcoming Events</h2>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                </div>
            ))}
          </div>
        </Card>
    );
  }

  return (
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Upcoming Events
              </h2>
              {events.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {events.length}
                  </Badge>
              )}
            </div>
            <button
                onClick={handleViewAll}
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming events</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Birthdays & anniversaries will appear here</p>
              </div>
          ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {events.map((event, index) => {
                  const Icon = getEventIcon(event.eventType);
                  const badgeColor = getBadgeColor(event.eventType);
                  const eventDate = formatEventDate(event.eventDate);

                  // ✅ Create unique key to avoid duplicate key warnings
                  const uniqueKey = `${event.eventId}-${event.eventType}-${index}`;

                  return (
                      <motion.div
                          key={uniqueKey}  // ✅ Unique composite key
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-opacity-80 transition-colors">
                          <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                              {event.eventTitle}
                            </h3>
                            <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${badgeColor}`}>
                              {event.eventType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <CalendarDays className="w-3 h-3" />
                            <span>{eventDate}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="truncate">{event.description}</span>
                          </div>
                        </div>
                      </motion.div>
                  );
                })}
              </div>
          )}
        </div>

        {events.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                {events.length} upcoming event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
        )}
      </Card>
  );
};

export default UpcomingEvents;