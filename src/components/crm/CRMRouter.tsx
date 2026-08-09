
import { Routes, Route } from 'react-router-dom';
import CRMDashboard from './CRMDashboard';
import ContactManagement from "../../pages/crm/contactManagement/ContactManagementPage";
import SalesManagement from "./salesManagement/SalesManagement";
import MarketingAutomation from "./marketingAutomation/MarketingAutomation";
import CustomerSupport from "./customerSupport/CustomerSupport";
import ActivityManagement from "./activityManagement/ActivityManagement";
import AnalyticsReporting from "./analytics/AnalyticsReporting";
import LeadRoutingPage from '../../pages/crm/leadManagement/LeadRoutingPage';
import PrintQuotePage from '../../pages/crm/salesManagement/PrintQuotePage';

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