// src/components/finance/generalledger/auditTrail/AuditTrailSection.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter, ExternalLink, RefreshCw } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { getAuditLogs } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import type { UUID } from '@/modules/finance/types/generalLedger';

interface AuditEntry {
  id: UUID;
  entityType: 'JournalEntry' | 'Account' | 'Invoice' | 'Payment' | 'Expense' | 'Budget';
  entityId: UUID;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
  ipAddress?: string;
}

const AuditTrailSection: React.FC = () => {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API
      const res = await getAuditLogs({ limit: 100 });
      const data = res.data.data || res.data || [];

      // Map API data to AuditEntry format
      const mappedAudit: AuditEntry[] = data.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        entityType: item.entityType || 'JournalEntry',
        entityId: item.entityId || item.id,
        action: item.action || 'Update',
        fieldName: item.fieldName,
        oldValue: item.oldValue,
        newValue: item.newValue,
        userId: item.userId || 'system',
        userName: item.userName || 'System',
        timestamp: item.actionDate || item.timestamp || new Date().toISOString(),
        notes: item.notes || item.description,
        ipAddress: item.ipAddress,
      }));

      setAuditTrail(mappedAudit.length > 0 ? mappedAudit : getSampleAuditData());
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      // Fallback to sample data
      setAuditTrail(getSampleAuditData());
      setError('Using sample data - API not available');
    } finally {
      setLoading(false);
    }
  };

  const getSampleAuditData = (): AuditEntry[] => {
    return [
      {
        id: '1' as UUID,
        entityType: 'JournalEntry',
        entityId: '1' as UUID,
        action: 'Create',
        userId: 'user1',
        userName: 'John Doe',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        notes: 'Created journal entry for office supplies',
        ipAddress: '192.168.1.1',
      },
      {
        id: '2' as UUID,
        entityType: 'JournalEntry',
        entityId: '1' as UUID,
        action: 'Post',
        userId: 'user2',
        userName: 'Jane Smith',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        notes: 'Posted journal entry to general ledger',
        ipAddress: '192.168.1.2',
      },
      {
        id: '3' as UUID,
        entityType: 'Account',
        entityId: '3' as UUID,
        action: 'Update',
        fieldName: 'status',
        oldValue: 'Active',
        newValue: 'Inactive',
        userId: 'user1',
        userName: 'John Doe',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        notes: 'Deactivated account due to inactivity',
        ipAddress: '192.168.1.1',
      },
      {
        id: '4' as UUID,
        entityType: 'Invoice',
        entityId: '4' as UUID,
        action: 'Approve',
        userId: 'user3',
        userName: 'Mike Johnson',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        notes: 'Approved invoice INV-2024-001',
        ipAddress: '192.168.1.3',
      },
      {
        id: '5' as UUID,
        entityType: 'Payment',
        entityId: '5' as UUID,
        action: 'Process',
        userId: 'user2',
        userName: 'Jane Smith',
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        notes: 'Processed payment for vendor ABC Ltd',
        ipAddress: '192.168.1.2',
      },
    ];
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      Create: 'bg-green-100 text-green-800 border-green-200',
      Update: 'bg-blue-100 text-blue-800 border-blue-200',
      Delete: 'bg-red-100 text-red-800 border-red-200',
      Post: 'bg-purple-100 text-purple-800 border-purple-200',
      Approve: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Reject: 'bg-orange-100 text-orange-800 border-orange-200',
      Process: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cancel: 'bg-rose-100 text-rose-800 border-rose-200',
      Toggle: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEntityTypeColor = (entityType: string) => {
    const colors: Record<string, string> = {
      JournalEntry: 'bg-indigo-100 text-indigo-700',
      Account: 'bg-blue-100 text-blue-700',
      Invoice: 'bg-green-100 text-green-700',
      Payment: 'bg-purple-100 text-purple-700',
      Expense: 'bg-orange-100 text-orange-700',
      Budget: 'bg-amber-100 text-amber-700',
    };
    return colors[entityType] || 'bg-gray-100 text-gray-700';
  };

  const filteredAudit = auditTrail.filter(entry => {
    const matchesSearch =
        (entry.userName && entry.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.entityId && entry.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.action && entry.action.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'All' || entry.action === actionFilter;
    const matchesEntity = entityFilter === 'All' || entry.entityType === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAudit.length / itemsPerPage);
  const paginatedAudit = filteredAudit.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const uniqueActions = ['All', ...Array.from(new Set(auditTrail.map(entry => entry.action)))];
  const uniqueEntityTypes = ['All', ...Array.from(new Set(auditTrail.map(entry => entry.entityType)))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
      >
        {/* Error Banner */}
        {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              {error}
              <button
                  onClick={fetchAuditTrail}
                  className="ml-3 text-yellow-600 hover:text-yellow-800 underline"
              >
                Retry
              </button>
            </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-1 gap-4 w-full flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search by user, entity, action..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                )}
              </div>

              <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                ))}
              </select>

              <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {uniqueEntityTypes.map(entity => (
                    <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <Button
                onClick={fetchAuditTrail}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Audit Trail Timeline */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
        >
          {paginatedAudit.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-indigo-200 text-center">
                <p className="text-gray-500">No audit trail entries found</p>
              </div>
          ) : (
              paginatedAudit.map((entry, index) => (
                  <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEntityTypeColor(entry.entityType)}`}>
                      {entry.entityType}
                    </span>
                          <span className="text-xs text-gray-500 font-mono">
                      ID: {entry.entityId.substring(0, 8)}...
                    </span>
                          {entry.ipAddress && (
                              <span className="text-xs text-gray-400 font-mono">
                        IP: {entry.ipAddress}
                      </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">{entry.userName}</span>
                          <span className="text-gray-500"> • {formatDate(entry.timestamp)}</span>
                        </div>

                        {entry.fieldName && (
                            <div className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                              <span className="font-medium">{entry.fieldName}:</span>
                              <span className="text-red-600 ml-2"> {entry.oldValue}</span>
                              <span className="text-gray-500 mx-2"> → </span>
                              <span className="text-green-600">{entry.newValue}</span>
                            </div>
                        )}

                        {entry.notes && (
                            <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                              "{entry.notes}"
                            </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
              ))
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAudit.length)}</span> of{' '}
                  <span className="font-medium">{filteredAudit.length}</span> entries
                </p>
              </div>
              <div className="flex gap-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
        )}

        {/* Stats */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{auditTrail.length}</p>
              <p className="text-xs text-gray-500">Total Entries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {auditTrail.filter(e => e.action === 'Create' || e.action === 'Post').length}
              </p>
              <p className="text-xs text-gray-500">Additions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {auditTrail.filter(e => e.action === 'Update' || e.action === 'Approve').length}
              </p>
              <p className="text-xs text-gray-500">Modifications</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {auditTrail.filter(e => e.action === 'Delete' || e.action === 'Cancel').length}
              </p>
              <p className="text-xs text-gray-500">Removals</p>
            </div>
          </div>
        </div>
      </motion.div>
  );
};

export default AuditTrailSection;