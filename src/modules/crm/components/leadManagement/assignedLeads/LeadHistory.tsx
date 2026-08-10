// src/components/crm/leadManagement/assignedLeads/LeadHistory.tsx
import React, { useState, useEffect } from 'react';
import { Clock, User, Edit, Phone, Mail, Target, CheckSquare,
  Loader2, Filter, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';
import { getActivityLogByEntity } from '@/modules/crm/services/crm.api';

interface HistoryEntry {
  id: string;
  type: 'status_change' | 'assignment' | 'score_update' | 'field_update' | 'communication' | 'note_added';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  oldValue?: string;
  newValue?: string;
  entityType?: string;
  entityId?: string;
}

interface LeadHistoryProps {
  leadId: string;
}

const HISTORY_ICONS: Record<string, any> = {
  status_change: CheckSquare,
  assignment: User,
  score_update: Target,
  field_update: Edit,
  communication: Mail,
  note_added: MessageSquare,
};

const HISTORY_COLORS: Record<string, string> = {
  status_change: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  assignment: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  score_update: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  field_update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  communication: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  note_added: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
};

const HISTORY_LABELS: Record<string, string> = {
  status_change: 'Status Change',
  assignment: 'Assignment',
  score_update: 'Score Update',
  field_update: 'Field Update',
  communication: 'Communication',
  note_added: 'Note Added',
};

export default function LeadHistory({ leadId }: LeadHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [leadId, filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Using activity log API to get history
      const response = await getActivityLogByEntity('Lead', leadId);
      if (response.data.success) {
        const formattedHistory: HistoryEntry[] = (response.data.data || []).map((item: any) => ({
          id: item.id,
          type: item.actionType || 'field_update',
          title: HISTORY_LABELS[item.actionType] || 'Update',
          description: item.description || item.message || 'No description',
          timestamp: item.createdAt || new Date().toISOString(),
          user: item.userName || item.createdByUserName || 'System',
          oldValue: item.oldValue,
          newValue: item.newValue,
          entityType: 'Lead',
          entityId: leadId
        }));
        setHistory(formattedHistory);
      } else {
        // Fallback to empty history
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      showToast.warning('Unable to load full history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getHistoryIcon = (type: string) => {
    const Icon = HISTORY_ICONS[type] || Edit;
    return Icon;
  };

  const getHistoryColor = (type: string) => {
    return HISTORY_COLORS[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredHistory = filter === 'all'
      ? history
      : history.filter(entry => entry.type === filter);

  const totalPages = Math.ceil(filteredHistory.length / 10);
  const paginatedHistory = filteredHistory.slice((page - 1) * 10, page * 10);

  if (loading) {
    return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead History</h3>
            <Badge variant="outline" className="text-sm">
              {history.length} entries
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="status_change">Status Changes</SelectItem>
                <SelectItem value="communication">Communications</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="score_update">Score Updates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedHistory.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No history yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Lead history will appear here as actions are taken.</p>
                </CardContent>
              </Card>
          ) : (
              paginatedHistory.map((entry, index) => {
                const Icon = getHistoryIcon(entry.type);
                return (
                    <Card key={entry.id || index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${getHistoryColor(entry.type)} flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">{entry.title}</h4>
                                <Badge className={getHistoryColor(entry.type)}>
                                  {entry.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(entry.timestamp)}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{entry.description}</p>

                            {((entry.oldValue || entry.newValue) && entry.type === 'field_update') && (
                                <div className="flex items-center gap-2 text-sm">
                                  {entry.oldValue && (
                                      <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs">
                              From: {entry.oldValue}
                            </span>
                                  )}
                                  {entry.newValue && (
                                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs">
                              To: {entry.newValue}
                            </span>
                                  )}
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>by {entry.user}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                );
              })
          )}
        </div>

        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
        )}
      </div>
  );
}