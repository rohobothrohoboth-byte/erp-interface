// src/components/crm/leadManagement/leadGrouping/LeadGroupingSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LeadDto } from '@/modules/crm/types/crm.types';

interface GroupedLeads {
  key: string;
  count: number;
  leads: LeadDto[];
}

interface LeadGroupingSectionProps {
  groupedLeads: GroupedLeads[];
  expandedGroups: Set<string>;
  onToggleGroup: (key: string) => void;
  onLeadClick: (id: string) => void;
  groupBy: string;
  getGroupColor: (key: string) => string;
}

const LeadGroupingSection: React.FC<LeadGroupingSectionProps> = ({
                                                                   groupedLeads,
                                                                   expandedGroups,
                                                                   onToggleGroup,
                                                                   onLeadClick,
                                                                   groupBy,
                                                                   getGroupColor,
                                                                 }) => {
  const totalLeads = groupedLeads.reduce((sum, g) => sum + g.count, 0);

  return (
      <div className="space-y-4">
        {groupedLeads.map((group) => {
          const isExpanded = expandedGroups.has(group.key);

          return (
              <Card key={group.key} className="border-gray-200 overflow-hidden">
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onToggleGroup(group.key)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <Badge className={getGroupColor(group.key)}>
                      {group.key}
                    </Badge>
                    <span className="text-sm text-gray-500">
                  {group.count} lead{group.count !== 1 ? 's' : ''}
                </span>
                  </div>
                  <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {Math.round((group.count / totalLeads) * 100)}%
                </span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(group.count / totalLeads) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100 divide-y divide-gray-100"
                    >
                      {group.leads.map((lead) => (
                          <div
                              key={lead.id}
                              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => onLeadClick(lead.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                                {lead.firstName?.[0]}{lead.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {lead.fullName || `${lead.firstName} ${lead.lastName}`}
                                </p>
                                <p className="text-xs text-gray-500">{lead.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {lead.companyName && (
                                  <span className="text-sm text-gray-500">{lead.companyName}</span>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                Score: {lead.score || 0}
                              </Badge>
                            </div>
                          </div>
                      ))}
                    </motion.div>
                )}
              </Card>
          );
        })}

        {groupedLeads.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No leads found</h3>
              <p className="text-gray-400">Try adjusting your grouping or refresh the data</p>
            </div>
        )}
      </div>
  );
};

export default LeadGroupingSection;