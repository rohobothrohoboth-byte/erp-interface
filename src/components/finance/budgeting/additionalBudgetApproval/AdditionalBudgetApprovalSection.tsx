import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../layout/layout';
import AdditionalBudgetApprovalHeader from './AdditionalBudgetApprovalHeader';
import AdditionalBudgetApprovalSearchFilter from './AdditionalBudgetApprovalSearchFilter';
import AdditionalBudgetApprovalTable from './AdditionalBudgetApprovalTable';
import ApproveModal from './ApproveModal';
import RejectModal from './RejectModal';
import ReturnModal from './ReturnModal';

interface AdditionalBudgetRequest {
  id: string;
  budgetPlanId: string;
  budgetPlanName: string;
  expenseId: string;
  expenseName: string;
  budgetCode: string;
  budgetCategory: string;
  account: string;
  amount: number;
  justification: string;
  status: 'Pending Review' | 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export default function AdditionalBudgetApprovalSection() {
  const [requests, setRequests] = useState<AdditionalBudgetRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingRequest, setApprovingRequest] = useState<AdditionalBudgetRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<AdditionalBudgetRequest | null>(null);
  const [returningRequest, setReturningRequest] = useState<AdditionalBudgetRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const stored = localStorage.getItem('additionalBudgetRequests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only show requests with "Pending" status (accepted from review)
        const pendingRequests = parsed.filter((r: AdditionalBudgetRequest) => r.status === 'Pending');
        setRequests(pendingRequests);
      } catch (e) {
        console.error('Error parsing additional budget requests:', e);
      }
    }
  };

  const saveRequests = (updatedRequests: AdditionalBudgetRequest[]) => {
    localStorage.setItem('additionalBudgetRequests', JSON.stringify(updatedRequests));
    loadRequests(); // Reload to filter only "Pending"
  };

  const handleApprove = () => {
    if (approvingRequest) {
      const stored = localStorage.getItem('additionalBudgetRequests');
      if (stored) {
        const allRequests = JSON.parse(stored);
        const updatedRequests = allRequests.map((r: AdditionalBudgetRequest) =>
          r.id === approvingRequest.id
            ? {
                ...r,
                status: 'Approved' as const,
                approvedBy: 'Current User',
                approvedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                updatedBy: 'Current User'
              }
            : r
        );
        saveRequests(updatedRequests);
        
        // Create new budget version for approved additional budget
        createAdditionalBudgetVersion(approvingRequest);
        
        showToast.success('Additional budget request approved and new version created');
        setApprovingRequest(null);
      }
    }
  };

  const createAdditionalBudgetVersion = (request: AdditionalBudgetRequest & { budgetId?: string; budgetName?: string }) => {
    let budgetId = request.budgetId;
    
    // If budgetId is missing, try to find it based on fiscal year
    if (!budgetId) {
      const budgetPlansStored = localStorage.getItem('budgetPlans');
      if (budgetPlansStored) {
        const budgetPlans = JSON.parse(budgetPlansStored);
        const budgetPlan = budgetPlans.find((p: any) => p.id === request.budgetPlanId);
        
        if (budgetPlan) {
          const budgetsStored = localStorage.getItem('budgets');
          if (budgetsStored) {
            const budgets = JSON.parse(budgetsStored);
            console.log('=== FISCAL YEAR MATCHING DEBUG ===');
            console.log('Budget Plan ID:', request.budgetPlanId);
            console.log('Budget Plan Fiscal Year:', budgetPlan.fiscalYear);
            console.log('Budget Plan Fiscal Year Type:', typeof budgetPlan.fiscalYear);
            console.log('Budget Plan Full Object:', budgetPlan);
            console.log('Available Budgets:', budgets.map((b: any) => ({ 
              id: b.id,
              name: b.name, 
              fiscalYear: b.fiscalYear, 
              fiscalYearType: typeof b.fiscalYear,
              status: b.status 
            })));
            console.log('All Budgets Full Objects:', budgets);
            
            // Helper function to normalize fiscal year strings for comparison
            const normalizeFiscalYear = (fy: string) => {
              if (!fy) return '';
              // Remove spaces, convert to lowercase, extract year if present
              const normalized = fy.toLowerCase().replace(/\s+/g, '');
              return normalized;
            };
            
            // Helper function to extract year number
            const extractYear = (fy: string) => {
              if (!fy) return null;
              const match = fy.match(/\d{4}/);
              return match ? match[0] : null;
            };
            
            const planFYNormalized = normalizeFiscalYear(budgetPlan.fiscalYear);
            const planYear = extractYear(budgetPlan.fiscalYear);
            
            console.log('Normalized Plan FY:', planFYNormalized);
            console.log('Extracted Plan Year:', planYear);
            
            // Try multiple matching strategies
            let matchingBudget = budgets.find((b: any) => {
              if (b.status !== 'Active') return false;
              
              const budgetFYNormalized = normalizeFiscalYear(b.fiscalYear);
              const budgetYear = extractYear(b.fiscalYear);
              
              console.log(`Comparing with budget "${b.name}":`, {
                budgetFYNormalized,
                budgetYear,
                exactMatch: b.fiscalYear === budgetPlan.fiscalYear,
                normalizedMatch: budgetFYNormalized === planFYNormalized,
                yearMatch: budgetYear && planYear && budgetYear === planYear
              });
              
              // Try exact match
              if (b.fiscalYear === budgetPlan.fiscalYear) return true;
              
              // Try normalized match
              if (budgetFYNormalized === planFYNormalized) return true;
              
              // Try year match
              if (budgetYear && planYear && budgetYear === planYear) return true;
              
              return false;
            });
            
            if (matchingBudget) {
              budgetId = matchingBudget.id;
              console.log('✓ Found matching budget:', matchingBudget.name, 'ID:', matchingBudget.id);
            } else {
              console.log('✗ No matching budget found');
            }
            console.log('=== END DEBUG ===');
          }
        }
      }
    }
    
    if (!budgetId) {
      console.error('Budget ID is required to create version');
      showToast.error('Cannot create version: No active budget found for this fiscal year');
      return;
    }

    const versionsStored = localStorage.getItem('budgetVersions');
    const existingVersions = versionsStored ? JSON.parse(versionsStored) : [];
    
    // Find the master version for this budget
    const masterVersion = existingVersions.find(
      (v: any) => v.budgetId === budgetId && v.versionType === 'Master'
    );
    
    if (!masterVersion) {
      console.error('Master version not found for budget');
      showToast.error('Cannot create version: Master budget version not found. Please approve budget plan expenses first.');
      return;
    }
    
    // Count existing additional versions for this budget
    const additionalVersions = existingVersions.filter(
      (v: any) => v.budgetId === budgetId && v.versionType === 'Additional'
    );
    
    const nextVersionNumber = additionalVersions.length + 2; // +2 because V1 is master
    
    const newVersion = {
      id: `version-${Date.now()}`,
      budgetId: budgetId,
      budgetPlanId: request.budgetPlanId,
      budgetPlanName: request.budgetPlanName,
      version: `V${nextVersionNumber}`,
      versionType: 'Additional',
      fiscalYear: masterVersion.fiscalYear,
      costCenter: masterVersion.costCenter,
      totalAmount: request.amount,
      approvedAmount: request.amount,
      expenses: [{
        id: `vexp-${request.id}`,
        expenseId: request.expenseId,
        budgetCode: request.budgetCode,
        account: request.account,
        budgetCategory: request.budgetCategory,
        amount: request.amount,
        justification: request.justification,
        source: 'AdditionalBudget',
        sourceId: request.id
      }],
      parentVersionId: masterVersion.id,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Current User',
      status: 'Active'
    };
    
    existingVersions.push(newVersion);
    localStorage.setItem('budgetVersions', JSON.stringify(existingVersions));
  };

  const handleReject = (reason: string) => {
    if (rejectingRequest) {
      const stored = localStorage.getItem('additionalBudgetRequests');
      if (stored) {
        const allRequests = JSON.parse(stored);
        const updatedRequests = allRequests.map((r: AdditionalBudgetRequest) =>
          r.id === rejectingRequest.id
            ? {
                ...r,
                status: 'Rejected' as const,
                rejectionReason: reason,
                updatedAt: new Date().toISOString(),
                updatedBy: 'Current User'
              }
            : r
        );
        saveRequests(updatedRequests);
        showToast.success('Additional budget request rejected');
        setRejectingRequest(null);
      }
    }
  };

  const handleReturn = (reason: string) => {
    if (returningRequest) {
      const stored = localStorage.getItem('additionalBudgetRequests');
      if (stored) {
        const allRequests = JSON.parse(stored);
        const updatedRequests = allRequests.map((r: AdditionalBudgetRequest) =>
          r.id === returningRequest.id
            ? {
                ...r,
                status: 'Returned' as const,
                rejectionReason: reason,
                updatedAt: new Date().toISOString(),
                updatedBy: 'Current User'
              }
            : r
        );
        saveRequests(updatedRequests);
        showToast.success('Additional budget request returned for revision');
        setReturningRequest(null);
      }
    }
  };

  const filteredRequests = requests.filter(r =>
    (r.budgetPlanName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.expenseName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.budgetCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    r.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AdditionalBudgetApprovalHeader />

      <AdditionalBudgetApprovalSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <AdditionalBudgetApprovalTable
        requests={filteredRequests}
        onApprove={setApprovingRequest}
        onReject={setRejectingRequest}
        onReturn={setReturningRequest}
      />

      <ApproveModal
        isOpen={!!approvingRequest}
        onClose={() => setApprovingRequest(null)}
        onConfirm={handleApprove}
        requestName={approvingRequest?.budgetPlanName || ''}
        amount={approvingRequest?.amount || 0}
      />

      <RejectModal
        isOpen={!!rejectingRequest}
        onClose={() => setRejectingRequest(null)}
        onConfirm={handleReject}
        requestName={rejectingRequest?.budgetPlanName || ''}
      />

      <ReturnModal
        isOpen={!!returningRequest}
        onClose={() => setReturningRequest(null)}
        onConfirm={handleReturn}
        requestName={returningRequest?.budgetPlanName || ''}
      />
    </motion.div>
  );
}
