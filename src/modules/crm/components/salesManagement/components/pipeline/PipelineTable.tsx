import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, User, Building, Eye, Edit, Trash2, MoreHorizontal, FileText, ShoppingCart, MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { Opportunity } from '@/modules/crm/types/crm';

interface PipelineTableProps {
  opportunities: Opportunity[];
  onStageChange: (oppId: string, newStage: Opportunity['stage']) => void;
  onEdit: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
  onDelete: (opportunityId: string) => void;
  onCreateQuotation?: (opportunity: Opportunity) => void;
  onCreateOrder?: (opportunity: Opportunity) => void;
  onNavigateToDetail?: (opportunityId: string) => void;
}

const stageColors = {
  'Qualification': 'bg-blue-100 text-blue-800',
  'Needs Analysis': 'bg-yellow-100 text-yellow-800',
  'Proposal': 'bg-orange-100 text-orange-800',
  'Negotiation': 'bg-purple-100 text-purple-800',
  'Closed Won': 'bg-green-100 text-green-800',
  'Closed Lost': 'bg-red-100 text-red-800'
};

const stageOrder = ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function PipelineTable({ 
  opportunities, 
  onStageChange, 
  onEdit, 
  onView, 
  onDelete,
  onCreateQuotation,
  onCreateOrder,
  onNavigateToDetail
}: PipelineTableProps) {
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

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date() && !['Closed Won', 'Closed Lost'].includes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sales Pipeline ({opportunities.length} opportunities)</span>
          <div className="text-sm text-gray-500">
            Total Value: {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.amount, 0))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Opportunity</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity, index) => (
                <motion.tr
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{opportunity.name}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <span className="mr-2">Source: {opportunity.source}</span>
                        {opportunity.products && opportunity.products.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {opportunity.products.length} products
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{opportunity.accountId || 'No Account'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatCurrency(opportunity.amount)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={opportunity.stage}
                      onValueChange={(value) => onStageChange(opportunity.id, value as Opportunity['stage'])}
                    >
                      <SelectTrigger className="w-36 h-8">
                        <Badge className={`${stageColors[opportunity.stage]} text-xs`}>
                          {opportunity.stage}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {stageOrder.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={opportunity.probability} className="w-16 h-2" />
                      <span className="text-sm font-medium w-10">{opportunity.probability}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center space-x-1 ${
                      isOverdue(opportunity.expectedCloseDate) ? 'text-red-600' : ''
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(opportunity.expectedCloseDate)}
                      </span>
                      {isOverdue(opportunity.expectedCloseDate) && (
                        <Badge variant="destructive" className="text-xs ml-1">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{opportunity.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => onNavigateToDetail ? onNavigateToDetail(opportunity.id) : onView(opportunity)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Go to Quotation
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Opportunity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigateToDetail ? onNavigateToDetail(opportunity.id) : onView(opportunity)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Add Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigateToDetail ? onNavigateToDetail(opportunity.id) : onView(opportunity)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Add Document
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(opportunity.id)}
                          className="text-red-600"
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
        
        {opportunities.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <DollarSign className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new opportunity.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}