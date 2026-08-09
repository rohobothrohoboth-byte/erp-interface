// src/pages/finance/AuditTrailPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Search, RefreshCw, Filter, Calendar, AlertCircle } from 'lucide-react';
import { getAuditLogs } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  actionDate: string;
  createdAt?: string;
  status?: string;
  errorMessage?: string;
  metadata?: any;
  changes?: any;
}

const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('All');
  const [filterAction, setFilterAction] = useState('All');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  // AuditTrailPage.tsx - Updated fetchLogs

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAuditLogs({
        page: pagination.page,
        pageSize: pagination.pageSize
      });

      console.log('📊 Audit API Response:', response);

      // ✅ Extract data from the new response format
      let data: AuditLog[] = [];
      let totalCount = 0;

      // Case 1: response has items array (new format)
      if (response?.items && Array.isArray(response.items)) {
        data = response.items;
        totalCount = response.totalCount || data.length;
        console.log('✅ Found logs in response.items:', data.length);
      }
      // Case 2: response.data has items array
      else if (response?.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
        totalCount = response.data.totalCount || data.length;
        console.log('✅ Found logs in response.data.items:', data.length);
      }
      // Case 3: response is an array (old format)
      else if (Array.isArray(response)) {
        data = response;
        totalCount = response.length;
        console.log('✅ Response is direct array:', data.length);
      }

      console.log('📊 Final extracted data:', { dataLength: data.length, totalCount });

      setLogs(data);
      setPagination(prev => ({
        ...prev,
        total: totalCount || data.length,
        totalPages: Math.ceil((totalCount || data.length) / prev.pageSize)
      }));

    } catch (error: any) {
      console.error('❌ Error fetching audit logs:', error);
      setError(error.message || 'Failed to load audit logs');
      showToast.error('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getActionColor = (action: string) => {
    if (!action) return 'bg-gray-100 text-gray-700';

    const actionLower = action.toLowerCase();
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-700',
      'update': 'bg-blue-100 text-blue-700',
      'delete': 'bg-red-100 text-red-700',
      'statuschange': 'bg-yellow-100 text-yellow-700',
      'post': 'bg-purple-100 text-purple-700',
      'close': 'bg-red-100 text-red-700',
      'open': 'bg-green-100 text-green-700',
      'approve': 'bg-indigo-100 text-indigo-700',
      'reject': 'bg-red-100 text-red-700',
      'export': 'bg-cyan-100 text-cyan-700',
    };

    for (const [key, value] of Object.entries(colors)) {
      if (actionLower.includes(key)) {
        return value;
      }
    }
    return 'bg-gray-100 text-gray-700';
  };

  const getActionIcon = (action: string) => {
    if (!action) return '📝';
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return '➕';
    if (actionLower.includes('update')) return '✏️';
    if (actionLower.includes('delete')) return '🗑️';
    if (actionLower.includes('close')) return '🔒';
    if (actionLower.includes('open')) return '🔓';
    if (actionLower.includes('approve')) return '✅';
    if (actionLower.includes('reject')) return '❌';
    if (actionLower.includes('export')) return '📤';
    if (actionLower.includes('post')) return '📨';
    return '📝';
  };

  // ✅ Ensure logs is an array before filtering
  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    if (!log) return false;

    const matchesSearch =
        (log.entityType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entityId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEntity = filterEntity === 'All' || log.entityType === filterEntity;
    const matchesAction = filterAction === 'All' || log.action === filterAction;

    return matchesSearch && matchesEntity && matchesAction;
  }) : [];

  // Get unique entity types and actions for filters
  const entityTypes = ['All', ...new Set(Array.isArray(logs) ? logs.map(l => l?.entityType || '').filter(Boolean) : [])];
  const actions = ['All', ...new Set(Array.isArray(logs) ? logs.map(l => l?.action || '').filter(Boolean) : [])];

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <History className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 bg-clip-text text-transparent mr-2">
                Audit
              </span>
                Trail
              </h1>
              <p className="text-sm text-gray-500">Track all changes and activities across the system</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
                onClick={fetchLogs}
                variant="outline"
                className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Success</p>
            <p className="text-2xl font-bold text-green-600">
              {logs.filter(l => l.status === 'SUCCESS' || l.status === 'Success').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {logs.filter(l => l.status === 'FAILED' || l.status === 'Failed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {logs.filter(l => l.status === 'PENDING' || l.status === 'Pending').length}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
              <Button variant="outline" size="sm" onClick={fetchLogs}>
                Retry
              </Button>
            </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                  type="text"
                  placeholder="Search by entity, ID, action, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[150px]"
            >
              {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[150px]"
            >
              {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterEntity('All');
                  setFilterAction('All');
                }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No audit logs found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or refresh the page</p>
                    </td>
                  </tr>
              ) : (
                  filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(log.actionDate || log.createdAt || '')}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.entityType || 'Unknown'}</p>
                            <p className="text-xs text-gray-400 font-mono">
                              {log.entityId ? `${log.entityId.substring(0, 8)}...` : '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)} inline-flex items-center gap-1`}>
                        {getActionIcon(log.action)}
                        {log.action || 'Unknown'}
                      </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.userName || log.userId || 'System'}
                        </td>
                        <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === 'SUCCESS' || log.status === 'Success'
                              ? 'bg-green-100 text-green-700'
                              : log.status === 'FAILED' || log.status === 'Failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status || 'SUCCESS'}
                      </span>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex flex-wrap justify-between items-center gap-2">
          <span>
            Showing {filteredLogs.length} of {logs.length} logs
            {pagination.total > 0 && ` (Total: ${pagination.total})`}
          </span>
            {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
                  <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
            )}
          </div>
        </div>
      </motion.div>
  );
};

export default AuditTrailPage;