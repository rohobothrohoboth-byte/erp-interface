// src/components/finance/budget/BudgetList.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import {
  getBudgets, toggleBudgetStatus, deleteBudget

} from '@/modules/finance/services/finance.api';

interface Budget {
  id: string;
  name: string;
  period: string;
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Locked" | "Active" | "Inactive";
  lastUpdated: string;
  createdBy: string;
  department: string;
  departmentHead: string;
  amount: number;
  usedAmount: number;
  version: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  branchId?: string;
  departmentId?: string;
}

export default function BudgetList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBudgets();
      const data = res.data.data || res.data || [];

      // Map API data to Budget interface
      const mappedBudgets: Budget[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        period: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
        status: mapStatus(item.status),
        lastUpdated: item.dateMod ? formatDate(item.dateMod) : formatDate(item.dateAdd),
        createdBy: 'System', // Will be populated from user data
        department: item.departmentName || 'N/A',
        departmentHead: 'N/A', // Will be populated from department head
        amount: item.totalAmount || 0,
        usedAmount: 0, // Will be calculated from actuals
        version: 'V1',
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
        branchId: item.branchId,
        departmentId: item.departmentId,
      }));

      setBudgets(mappedBudgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const mapStatus = (apiStatus: string): Budget['status'] => {
    const statusMap: Record<string, Budget['status']> = {
      'Active': 'Approved',
      'Draft': 'Draft',
      'Inactive': 'Locked',
      'Pending': 'Pending Approval',
    };
    return statusMap[apiStatus] || 'Draft';
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'Approved' || newStatus === 'Locked') {
        await toggleBudgetStatus(id);
        await fetchBudgets();
      }
    } catch (error) {
      console.error('Error updating budget status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        await fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleViewVsActual = async (id: string) => {
    navigate(`/finance/budget-vs-actual?budgetId=${id}`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/finance/budget/${id}`);
  };

  const handleCreateRevision = (id: string) => {
    navigate(`/finance/budget-plan?revisionOf=${id}`);
  };

  const toggleFullHistory = () => {
    setShowFullHistory(!showFullHistory);
  };

  // Calculate financial metrics
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalUsed = budgets.reduce((sum, budget) => sum + budget.usedAmount, 0);
  const totalRemaining = totalBudgeted - totalUsed;
  const utilizationPercentage = totalBudgeted > 0 ? (totalUsed / totalBudgeted) * 100 : 0;

  const getBadgeVariant = (status: Budget["status"]) => {
    switch(status) {
      case "Approved": return "default";
      case "Rejected": return "destructive";
      case "Locked": return "secondary";
      case "Pending Approval": return "default";
      default: return "outline";
    }
  };

  const getBadgeColorClass = (status: Budget["status"]) => {
    switch(status) {
      case "Approved": return "bg-green-500 hover:bg-green-600 text-white";
      case "Pending Approval": return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "Rejected": return "bg-red-500 hover:bg-red-600 text-white";
      case "Locked": return "bg-gray-500 hover:bg-gray-600 text-white";
      default: return "";
    }
  };

  const displayedBudgets = showFullHistory ? budgets : budgets.slice(0, 3);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
              onClick={fetchBudgets}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
    );
  }

  return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Budget Management</h1>
            <p className="text-sm text-gray-500">
              Manage budgets, forecasts, and approval workflows
            </p>
          </div>
          <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={fetchBudgets}
                className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
                onClick={() => navigate('/finance/budget-plan')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              Create Budget
            </Button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-blue-700">BUDGETED AMOUNT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalBudgeted / 1000000).toFixed(2)}M</div>
              <p className="text-xs text-blue-600 mt-1">Total allocated funds</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-purple-700">USED AMOUNT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalUsed / 1000000).toFixed(2)}M</div>
              <p className="text-xs text-purple-600 mt-1">Actual spend from GL/AP</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-700">REMAINING BALANCE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalRemaining / 1000000).toFixed(2)}M</div>
              <p className="text-xs text-green-600 mt-1">Available for allocation</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-amber-700">UTILIZATION</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{utilizationPercentage.toFixed(1)}%</div>
              <Progress value={utilizationPercentage} className="mt-2 h-2" />
              <p className="text-xs text-amber-600 mt-1">Budgeted vs Actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget List Table */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Budget List</h2>
            <span className="text-sm text-gray-500">{budgets.length} budgets</span>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Budget Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Budgeted</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedBudgets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        No budgets found. Create your first budget!
                      </TableCell>
                    </TableRow>
                ) : (
                    displayedBudgets.map((budget) => {
                      const remaining = budget.amount - budget.usedAmount;
                      const utilization = budget.amount > 0 ? (budget.usedAmount / budget.amount) * 100 : 0;

                      return (
                          <TableRow key={budget.id}>
                            <TableCell>
                              <div className="font-medium">{budget.name}</div>
                              <div className="text-sm text-gray-500">{budget.period}</div>
                            </TableCell>
                            <TableCell>{budget.department}</TableCell>
                            <TableCell>{budget.createdBy}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{budget.version}</Badge>
                            </TableCell>
                            <TableCell>{budget.lastUpdated}</TableCell>
                            <TableCell className="font-medium">${(budget.amount / 1000).toFixed(1)}K</TableCell>
                            <TableCell>
                              <div>${(budget.usedAmount / 1000).toFixed(1)}K</div>
                              <div className="text-xs text-gray-500">{utilization.toFixed(1)}%</div>
                            </TableCell>
                            <TableCell className={remaining < 0 ? "text-red-500 font-medium" : "font-medium"}>
                              ${(remaining / 1000).toFixed(1)}K
                            </TableCell>
                            <TableCell>
                              <Badge
                                  variant={getBadgeVariant(budget.status)}
                                  className={`${getBadgeColorClass(budget.status)}`}
                              >
                                {budget.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(budget.id)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewVsActual(budget.id)}>
                                    View vs Actual
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCreateRevision(budget.id)}>
                                    Create Revision
                                  </DropdownMenuItem>
                                  {budget.status === "Pending Approval" && (
                                      <>
                                        <DropdownMenuItem
                                            onClick={() => handleStatusChange(budget.id, "Approved")}
                                            className="text-green-600"
                                        >
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleStatusChange(budget.id, "Rejected")}
                                            className="text-red-600"
                                        >
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                  )}
                                  {budget.status === "Draft" && (
                                      <DropdownMenuItem
                                          onClick={() => handleStatusChange(budget.id, "Pending Approval")}
                                      >
                                        Submit for Approval
                                      </DropdownMenuItem>
                                  )}
                                  {(budget.status === "Approved" || budget.status === "Rejected") && (
                                      <DropdownMenuItem
                                          onClick={() => handleStatusChange(budget.id, "Draft")}
                                      >
                                        Reopen
                                      </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                      onClick={() => handleDelete(budget.id)}
                                      className="text-red-600"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      )
                    })
                )}
              </TableBody>
            </Table>
          </div>

          {/* View Full History Button */}
          {budgets.length > 3 && (
              <div className="mt-4 flex justify-center">
                <Button
                    variant="outline"
                    onClick={toggleFullHistory}
                >
                  {showFullHistory ? "Show Less" : `View Full History (${budgets.length} budgets)`}
                </Button>
              </div>
          )}
        </div>
      </div>
  );
}