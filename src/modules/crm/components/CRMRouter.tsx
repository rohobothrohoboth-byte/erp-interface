
import { Routes, Route } from 'react-router-dom';
import CRMDashboard from '@/modules/crm/components/CRMDashboard';
import ContactManagement from "@/modules/crm/pages/contactManagement/ContactManagementPage";
import SalesManagement from "@/modules/crm/components/salesManagement/SalesManagement";
import MarketingAutomation from "@/modules/crm/components/marketingAutomation/MarketingAutomation";
import CustomerSupport from "@/modules/crm/components/customerSupport/CustomerSupport";
import ActivityManagement from "@/modules/crm/components/activityManagement/ActivityManagement";
import AnalyticsReporting from "@/modules/crm/components/analytics/AnalyticsReporting";
import LeadRoutingPage from '@/modules/crm/pages/leadManagement/LeadRoutingPage';
import PrintQuotePage from '@/modules/crm/pages/salesManagement/PrintQuotePage';

export default function CRMRouter() {
  return (
    <Routes>
      <Route path="/" element={<CRMDashboard />} />
      <Route path="/dashboard" element={<CRMDashboard />} />
      <Route path="/leads/routing" element={<LeadRoutingPage />} />
      <Route path="/contacts" element={<ContactManagement />} />
      <Route path="/sales" element={<SalesManagement />} />
      <Route path="/marketing" element={<MarketingAutomation />} />
      <Route path="/support" element={<CustomerSupport />} />
      <Route path="/activities" element={<ActivityManagement />} />
      <Route path="/analytics" element={<AnalyticsReporting />} />
      <Route path="/crm/sales/quotes/:id/print" element={<PrintQuotePage />} />
    </Routes>
  );
}