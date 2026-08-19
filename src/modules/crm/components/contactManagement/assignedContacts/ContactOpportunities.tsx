import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Progress } from '@/shared/components/ui/progress';
import OpportunityForm from '@/modules/crm/components/contactManagement/assignedContacts/OpportunityForm';

interface Opportunity {
  id: string;
  name: string;
  stage: 'Qualification' | 'Needs Analysis' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  amount: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  source: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactOpportunitiesProps {
  contactId: string;
  hasAccount?: boolean;
}

export default function ContactOpportunities({ contactId, hasAccount = false }: ContactOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: '1',
      name: 'Enterprise Software License',
      stage: 'Proposal',
      amount: 125000,
      probability: 75,
      expectedCloseDate: '2024-02-15',
      assignedTo: 'Sarah Johnson',
      source: 'Website',
      description: 'Large enterprise software licensing deal for 500+ users',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-18T12:00:00Z'
    },
    {
      id: '2',
      name: 'Professional Services Package',
      stage: 'Negotiation',
      amount: 45000,
      probability: 85,
      expectedCloseDate: '2024-01-30',
      assignedTo: 'Sarah Johnson',
      source: 'Referral',
      description: 'Implementation and training services for new software deployment',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-19T14:20:00Z'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Qualification': return 'bg-orange-100 text-orange-800';
      case 'Needs Analysis': return 'bg-yellow-100 text-yellow-800';
      case 'Proposal': return 'bg-orange-100 text-orange-800';
      case 'Negotiation': return 'bg-purple-100 text-purple-800';
      case 'Closed Won': return 'bg-orange-100 text-orange-800';
      case 'Closed Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const handleAddOpportunity = (opportunityData: Partial<Opportunity>) => {
    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: 'Current User'
    } as Opportunity;
    
    setOpportunities([...opportunities, newOpportunity]);
  };

  const handleEditOpportunity = (opportunityData: Partial<Opportunity>) => {
    if (selectedOpportunity) {
      const updatedOpportunities = opportunities.map(opp => 
        opp.id === selectedOpportunity.id 
          ? { ...opp, ...opportunityData, updatedAt: new Date().toISOString() }
          : opp
      );
      setOpportunities(updatedOpportunities);
      setSelectedOpportunity(null);
    }
  };

  return (
    <div className="space-y-4">

     
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Opportunities</h3>
          <p className="text-sm text-gray-600">Track sales opportunities and deals</p>
        </div>
        {hasAccount ? (
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Opportunity
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Account required to create opportunities</p>
            <Button 
              disabled
              variant="outline"
              className="opacity-50 cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Opportunity
            </Button>
          </div>
        )}
      </div>

      {/* Opportunities Table */}
      {opportunities.length === 0 ? (
        <Card className="border-orange-200">
          <CardContent>
            <div className="text-center py-6">
              <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">No opportunities yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                {hasAccount 
                  ? "Start tracking sales opportunities for this contact."
                  : "Create an account for this contact first to track opportunities."
                }
              </p>
              {hasAccount ? (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Opportunity
                </Button>
              ) : (
                <Button 
                  disabled
                  variant="outline"
                  className="opacity-50 cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Opportunity
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-orange-200">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="py-2">Opportunity</TableHead>
                  <TableHead className="py-2">Stage</TableHead>
                  <TableHead className="py-2">Amount</TableHead>
                  <TableHead className="py-2">Probability</TableHead>
                  <TableHead className="py-2">Expected Close</TableHead>
                  <TableHead className="py-2">Owner</TableHead>
                  <TableHead className="py-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opportunity, index) => (
                  <motion.tr
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{opportunity.name}</div>
                        <div className="text-xs text-gray-500">{opportunity.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={`text-xs ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm font-medium">{formatCurrency(opportunity.amount)}</div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center space-x-2">
                        <Progress value={opportunity.probability} className="w-12 h-1" />
                        <span className="text-xs font-medium">{opportunity.probability}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-xs">
                        {formatDate(opportunity.expectedCloseDate)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-xs text-gray-600">{opportunity.assignedTo}</div>
                    </TableCell>
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedOpportunity(opportunity);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Opportunity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Opportunity Form */}
      <OpportunityForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddOpportunity}
        contactId={contactId}
        mode="add"
      />

      {/* Edit Opportunity Form */}
      <OpportunityForm
        opportunity={selectedOpportunity}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedOpportunity(null);
        }}
        onSubmit={handleEditOpportunity}
        contactId={contactId}
        mode="edit"
      />
    </div>
  );
}