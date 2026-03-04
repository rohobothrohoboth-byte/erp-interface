import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Calendar, FileText } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { BudgetVersion } from '../budget/types';

export default function BudgetVersionsSection() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<BudgetVersion[]>([]);
  const [masterVersion, setMasterVersion] = useState<BudgetVersion | null>(null);
  const [budget, setBudget] = useState<any>(null);

  useEffect(() => {
    loadBudget();
    loadVersions();
  }, [budgetId]);

  const loadBudget = () => {
    const budgetsStored = localStorage.getItem('budgets');
    if (budgetsStored) {
      try {
        const budgets = JSON.parse(budgetsStored);
        const found = budgets.find((b: any) => b.id === budgetId);
        setBudget(found);
      } catch (e) {
        console.error('Error loading budget:', e);
      }
    }
  };

  const loadVersions = () => {
    const versionsStored = localStorage.getItem('budgetVersions');
    if (versionsStored) {
      try {
        const allVersions = JSON.parse(versionsStored);
        const budgetVersions = allVersions.filter(
          (v: BudgetVersion) => v.budgetId === budgetId
        );
        
        const master = budgetVersions.find((v: BudgetVersion) => v.versionType === 'Master');
        const additional = budgetVersions.filter((v: BudgetVersion) => v.versionType === 'Additional');
        
        setMasterVersion(master || null);
        setVersions(additional);
      } catch (e) {
        console.error('Error loading budget versions:', e);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalBudget = () => {
    const masterTotal = masterVersion ? masterVersion.totalAmount : 0;
    const additionalTotal = versions.reduce((sum, v) => sum + v.totalAmount, 0);
    return masterTotal + additionalTotal;
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen space-y-3"
    >
      {/* Header */}
        <Button
            onClick={() => navigate('/finance/budget')}
            variant="outline"
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Budget Versions</h1>
              <p className="text-sm text-gray-500">View all versions of this budget</p>
            </div>
          </div>
        
        </div>

        {budget && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Budget Name</div>
                <div className="font-semibold text-gray-900">{budget.name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Fiscal Year</div>
                <div className="font-semibold text-gray-900">{budget.fiscalYear}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Cost Center</div>
                <div className="font-semibold text-gray-900">{budget.costCenter}</div>
              </div>
            </div>
            <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Budget Amount</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalBudget())}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Master Version (V1) */}
      {masterVersion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border-2 border-indigo-300 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <GitBranch className="text-indigo-600 h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {masterVersion.version} - Master Budget
                </h2>
                <p className="text-sm text-gray-500">
                  Created {formatDate(masterVersion.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(masterVersion.totalAmount)}
              </div>
              <div className="text-sm text-gray-500">
                {masterVersion.expenses.length} expense{masterVersion.expenses.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Expenses</h3>
            <div className="space-y-2">
              {masterVersion.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{expense.budgetCategory}</div>
                    <div className="text-sm text-gray-600">
                      {expense.budgetCode} • {expense.account}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{expense.justification}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Versions */}
      {versions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Additional Budget Versions</h2>
          {versions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {version.version} - Additional Budget
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(version.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      +{formatCurrency(version.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {version.expenses.length} expense{version.expenses.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    {version.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{expense.budgetCategory}</div>
                          <div className="text-sm text-gray-600">
                            {expense.budgetCode} • {expense.account}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{expense.justification}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            +{formatCurrency(expense.amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* No Additional Versions */}
      {versions.length === 0 && masterVersion && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            No additional budget versions yet. Additional versions will be created when additional budget requests are approved.
          </p>
        </div>
      )}

      {/* No Master Version */}
      {!masterVersion && !budget && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            Budget not found.
          </p>
        </div>
      )}

      {!masterVersion && budget && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            No versions yet. Versions will be created automatically when budget plan expenses and additional budget requests are approved.
          </p>
        </div>
      )}
    </motion.section>
  );
}
