// src/pages/crm/customerService/CustomerService.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Users,
  Ticket,
  Clock,
  CheckCircle,
  TrendingUp,
  Loader2,
  Mail,
  Phone,
  MessageSquare,
  Star,
  Book,
} from 'lucide-react';
import { getTicketStats, getTickets } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { TicketDto, TicketStatsDto } from '@/modules/crm/types/crm.types';

const CustomerService: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TicketStatsDto | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes] = await Promise.all([
        getTicketStats(),
        getTickets({ page: 1, pageSize: 5 })
      ]);

      setStats(statsRes.data?.data || statsRes.data || null);
      const tickets = ticketsRes.data?.data || ticketsRes.data || [];
      setRecentTickets(Array.isArray(tickets) ? tickets : []);
    } catch (error) {
      console.error('Error fetching support data:', error);
      showToast.error('Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Open': 'bg-blue-100 text-blue-700 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Resolved': 'bg-green-100 text-green-700 border-green-200',
      'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      'Low': 'bg-gray-100 text-gray-700 border-gray-200',
      'Medium': 'bg-blue-100 text-blue-700 border-blue-200',
      'High': 'bg-orange-100 text-orange-700 border-orange-200',
      'Urgent': 'bg-red-100 text-red-700 border-red-200',
    };
    return variants[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16 mt-2" />
                  </CardContent>
                </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div>
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24 mt-1" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
                onClick={() => navigate('/crm')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
              <p className="text-sm text-gray-500">
                Manage support tickets and customer inquiries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={fetchData}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                onClick={() => navigate('/crm/support/tickets/add')}
            >
              <Plus size={16} />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Tickets</p>
                  <p className="text-2xl font-bold text-blue-900">{stats?.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Ticket className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Open</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats?.open || 0}</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-green-900">{stats?.resolved || 0}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-900">{stats?.satisfactionRate || 0}%</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <Star className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/crm/support/tickets')}
              >
                View All
              </Button>
            </div>

            <div className="divide-y divide-gray-200">
              {recentTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tickets found
                  </div>
              ) : (
                  recentTickets.map((ticket) => (
                      <div
                          key={ticket.id}
                          className="py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/crm/support/tickets/${ticket.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{ticket.title}</p>
                              <Badge className={getPriorityBadge(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{ticket.customerName || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(ticket.createdAt)}</span>
                              <span>•</span>
                              <span>Assigned to: {ticket.assignedToUserName || 'Unassigned'}</span>
                            </div>
                          </div>
                          <Badge className={getStatusBadge(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
  );
};

export default CustomerService;