import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter, ExternalLink } from 'lucide-react';
import { Input } from '../../../ui/input';
import type { UUID } from '../../../../types/finance/generalLedger';

interface AuditEntry {
  id: UUID;
  entityType: 'JournalEntry' | 'Account';
  entityId: UUID;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

const AuditTrailSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const loadAuditTrail = (): AuditEntry[] => {
    const stored = localStorage.getItem('auditTrail');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const sampleAudit: AuditEntry[] = [
      {
        id: '1' as UUID,
        entityType: 'JournalEntry',
        entityId: '1' as UUID,
        action: 'Create',
        userId: 'user1',
        userName: 'John Doe',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        notes: 'Created journal entry for office supplies',
      },
      {
        id: '2' as UUID,
        entityType: 'JournalEntry',
        entityId: '1' as UUID,
        action: 'Post',
        userId: 'user2',
        userName: 'Jane Smith',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        notes: 'Posted journal entry',
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
        notes: 'Deactivated account',
      },
    ];
    
    localStorage.setItem('auditTrail', JSON.stringify(sampleAudit));
    return sampleAudit;
  };

  const [auditTrail] = useState<AuditEntry[]>(loadAuditTrail());

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      Create: 'bg-green-100 text-green-800 border-green-200',
      Update: 'bg-blue-100 text-blue-800 border-blue-200',
      Delete: 'bg-red-100 text-red-800 border-red-200',
      Post: 'bg-purple-100 text-purple-800 border-purple-200',
      Approve: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Reject: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredAudit = auditTrail.filter(entry => {
    const matchesSearch =
      (entry.userName && entry.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.entityId && entry.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'All' || entry.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAudit.length / itemsPerPage);
  const paginatedAudit = filteredAudit.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueActions = Array.from(new Set(auditTrail.map(entry => entry.action)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user, entity, notes..."
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
          </div>
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
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No audit trail entries found</p>
          </div>
        ) : (
          paginatedAudit.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {entry.entityType === 'JournalEntry' ? 'Journal Entry' : 'Account'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {entry.entityId}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">{entry.userName}</span>
                    <span className="text-gray-500"> • {new Date(entry.timestamp).toLocaleString()}</span>
                  </div>

                  {entry.fieldName && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{entry.fieldName}:</span>
                      <span className="text-red-600"> {entry.oldValue}</span>
                      <span className="text-gray-500"> → </span>
                      <span className="text-green-600">{entry.newValue}</span>
                    </div>
                  )}

                  {entry.notes && (
                    <p className="text-sm text-gray-600 italic">"{entry.notes}"</p>
                  )}
                </div>
                
                <button className="text-indigo-600 hover:text-indigo-700 p-2">
                  <ExternalLink className="w-4 h-4" />
                </button>
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
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AuditTrailSection;
