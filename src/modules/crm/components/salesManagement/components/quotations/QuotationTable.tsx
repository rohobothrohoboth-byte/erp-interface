import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, User, Building, Eye, Edit, Download, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Pagination } from '@/shared/components/ui/pagination';
import DeleteQuotationModal from '@/modules/crm/components/salesManagement/DeleteQuotationModal';

interface Quotation {
  id: string;
  quotationNumber: string;
  opportunityId: string;
  opportunityName: string;
  accountName: string;
  contactName: string;
  amount: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  validUntil: string;
  createdBy: string;
  createdAt: string;
  version: number;
}

interface QuotationTableProps {
  quotations: Quotation[];
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onSend: (quotation: Quotation) => void;
  onDownload: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
}

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-800',
  'Pending Approval': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Sent': 'bg-blue-100 text-blue-800',
  'Accepted': 'bg-emerald-100 text-emerald-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Expired': 'bg-orange-100 text-orange-800'
};

export default function QuotationTable({
  quotations,
  onView,
  onEdit,
  onSend,
  onDownload,
  onDelete
}: QuotationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingQuotation, setDeletingQuotation] = useState<Quotation | null>(null);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleDeleteClick = (quotation: Quotation) => {
    setDeletingQuotation(quotation);
  };

  const handleConfirmDelete = () => {
    if (deletingQuotation) {
      onDelete(deletingQuotation);
      setDeletingQuotation(null);
    }
  };

  // Pagination calculations
  const totalItems = quotations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return quotations.slice(startIndex, endIndex);
  }, [quotations, currentPage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quotations ({quotations.length})</span>
          <div className="text-sm text-gray-500">
            Total Value: {formatCurrency(quotations.reduce((sum, q) => sum + q.amount, 0))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation #</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuotations.map((quotation, index) => (
                <motion.tr
                  key={quotation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-blue-600">{quotation.quotationNumber}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(quotation.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{quotation.opportunityName}</div>
                      <div className="text-sm text-gray-500">{quotation.contactName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{quotation.accountName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatCurrency(quotation.amount)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[quotation.status]}>
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center space-x-1 ${
                      isExpired(quotation.validUntil) && quotation.status !== 'Accepted' ? 'text-red-600' : ''
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(quotation.validUntil)}
                      </span>
                      {isExpired(quotation.validUntil) && quotation.status !== 'Accepted' && (
                        <Badge variant="destructive" className="text-xs ml-1">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{quotation.createdBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      v{quotation.version}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(quotation)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(quotation)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Quotation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload(quotation)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {quotation.status === 'Approved' && (
                          <DropdownMenuItem onClick={() => onSend(quotation)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send to Customer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(quotation)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {quotations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="quotations"
          />
        )}
        
        {quotations.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <DollarSign className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-500">Create your first quotation to get started.</p>
          </div>
        )}
      </CardContent>

      {/* Delete Modal */}
      <DeleteQuotationModal
        quotationName={deletingQuotation?.quotationNumber || null}
        isOpen={!!deletingQuotation}
        onClose={() => setDeletingQuotation(null)}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}