// CRM Types and Interfaces

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: "Website" | "Email" | "Phone" | "Social Media" | "Referral" | "Event";
  status:
    | "New"
    | "Contacted"
    | "Qualified"
    | "Proposal Sent"
    | "Converted"
    | "Closed Lost";
  score: number;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  budget: number;
  timeline: string;
  industry: string;
  // Conversion tracking
  isConverted: boolean;
  convertedAt?: string;
  convertedToContactId?: string;
  convertedToAccountId?: string;
  convertedToOpportunityId?: string;
  conversionType?:
    | "Contact"
    | "Contact+Account"
    | "Contact+Account+Opportunity";
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  tags: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastContactDate: string;
  notes: string;
  isActive: boolean;
  stage: "Lead" | "Prospect" | "Customer" | "Partner";
  owner: string;
  teamVisibility: "private" | "team" | "public";
  consentStatus: "pending" | "granted" | "denied";
  customFields: Record<string, any>;
  relationshipScore: number;
  lastInteractionType: string;
  segmentIds: string[];
  // Conversion tracking
  convertedFromLeadId?: string;
  accountId?: string; // Link to account when created
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  tags: string[];
  owner: string;
  parentAccountId?: string;
  accountType: "Prospect" | "Customer" | "Partner" | "Vendor";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  notes: string;
  customFields: Record<string, any>;
  // Relationships
  primaryContactId?: string;
  contactIds: string[];
  opportunityIds: string[];
}

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  contactId: string;
  stage:
    | "Qualification"
    | "Needs Analysis"
    | "Proposal"
    | "Negotiation"
    | "Closed Won"
    | "Closed Lost";
  amount: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  source: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  products: string[];
  competitors: string[];
  nextStep: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: "Email" | "SMS" | "Social Media" | "Webinar" | "Event";
  status: "Draft" | "Active" | "Paused" | "Completed";
  startDate: string;
  endDate: string;
  budget: number;
  targetAudience: string;
  description: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  category: "Technical" | "Billing" | "General" | "Feature Request";
  customerId: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDeadline: string;
  tags: string[];
  attachments: string[];
  customerSatisfaction?: number;
  escalationLevel: number;
  responseTime?: number;
  resolutionTime?: number;
  channel: "email" | "chat" | "phone" | "web" | "social";
  internalNotes: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
    isInternal: boolean;
  }>;
  publicReplies: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
    isFromCustomer: boolean;
    attachments: string[];
  }>;
  relatedTickets: string[];
  knowledgeBaseArticles: string[];
  slaPolicy: {
    id: string;
    name: string;
    responseTime: number;
    resolutionTime: number;
    priority: "Low" | "Medium" | "High" | "Critical";
    businessHoursOnly: boolean;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
    tier: "Enterprise" | "Premium" | "Standard";
  };
}

// Activity interface - explicitly exported
export interface Activity {
  id: string;
  type: "Call" | "Email" | "Meeting" | "Task" | "Note";
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
  relatedTo: {
    type: "Lead" | "Contact" | "Opportunity" | "Account";
    id: string;
    name: string;
  };
  scheduledDate: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  reminder: boolean;
  reminderTime?: string;
}

export interface CRMAnalytics {
  leadConversionRate: number;
  averageDealSize: number;
  salesCycleLength: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  pipelineValue: number;
  winRate: number;
  activityMetrics: {
    callsMade: number;
    emailsSent: number;
    meetingsHeld: number;
    tasksCompleted: number;
  };
}

// Re-export all types for better module resolution
// export type {
//   Lead as CRMLead,
//   Contact as CRMContact,
//   Opportunity as CRMOpportunity,
//   Campaign as CRMCampaign,
//   SupportTicket as CRMSupportTicket,
//   Activity as CRMActivity,
//   CRMAnalytics as CRMAnalyticsType
// };

// Supporting interfaces for enhanced Lead management
export interface LeadOwnerHistory {
  id: string;
  previousOwner: string;
  newOwner: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface ContentEngagement {
  id: string;
  contentType:
    | "Blog"
    | "Whitepaper"
    | "Ebook"
    | "Video"
    | "Webinar"
    | "Case Study"
    | "Demo";
  contentTitle: string;
  contentUrl: string;
  engagementType: "View" | "Download" | "Share" | "Comment" | "Like";
  engagementDate: string;
  duration?: number; // in minutes
  completionPercentage?: number;
}

export interface EmailHistory {
  id: string;
  subject: string;
  body: string;
  sentBy: string;
  sentAt: string;
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  replied: boolean;
  repliedAt?: string;
  bounced: boolean;
  templateId?: string;
  campaignId?: string;
  attachments: string[];
}

export interface CallHistory {
  id: string;
  type: "Inbound" | "Outbound";
  duration: number; // in minutes
  outcome: "Connected" | "Voicemail" | "No Answer" | "Busy" | "Failed";
  notes: string;
  recordingUrl?: string;
  calledBy: string;
  calledAt: string;
  followUpRequired: boolean;
  followUpDate?: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  nextSteps: string[];
}

export interface MeetingHistory {
  id: string;
  title: string;
  type: "Demo" | "Discovery" | "Proposal" | "Follow-up" | "Closing" | "Other";
  scheduledAt: string;
  duration: number; // in minutes
  attendees: string[];
  location?: string;
  meetingUrl?: string;
  agenda: string;
  notes: string;
  outcome: "Completed" | "Cancelled" | "No Show" | "Rescheduled";
  recordingUrl?: string;
  presentationUrl?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  nextSteps: string[];
  actionItems: ActionItem[];
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High";
}

export interface TaskHistory {
  id: string;
  title: string;
  description: string;
  type: "Call" | "Email" | "Meeting" | "Follow-up" | "Research" | "Other";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  notes: string;
  relatedTo?: string;
}

export interface NoteHistory {
  id: string;
  content: string;
  type: "General" | "Call" | "Meeting" | "Email" | "Research" | "Internal";
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isPrivate: boolean;
  tags: string[];
  attachments: string[];
}

export interface StatusHistory {
  id: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
  notes?: string;
  automatedChange: boolean;
  triggerEvent?: string;
}

export interface ScoreHistory {
  id: string;
  previousScore: number;
  newScore: number;
  changedAt: string;
  reason: string;
  scoringRule?: string;
  automatedChange: boolean;
  factors: ScoringFactor[];
}

export interface ScoringFactor {
  factor: string;
  points: number;
  description: string;
}

export interface TouchpointHistory {
  id: string;
  type:
    | "Email"
    | "Call"
    | "Meeting"
    | "Website Visit"
    | "Social Media"
    | "Event"
    | "Content Download"
    | "Demo"
    | "Trial"
    | "Support";
  channel: string;
  description: string;
  timestamp: string;
  duration?: number;
  outcome?: string;
  sentiment?: "Positive" | "Neutral" | "Negative";
  engagementLevel: "High" | "Medium" | "Low";
  notes?: string;
  automatedCapture: boolean;
}

export interface CampaignHistory {
  id: string;
  campaignId: string;
  campaignName: string;
  campaignType: string;
  joinedAt: string;
  leftAt?: string;
  status: "Active" | "Completed" | "Paused" | "Stopped";
  interactions: number;
  conversions: number;
  revenue?: number;
}

export interface WebActivity {
  id: string;
  sessionId: string;
  pageUrl: string;
  pageTitle: string;
  visitedAt: string;
  timeOnPage: number; // in seconds
  referrer?: string;
  userAgent: string;
  ipAddress: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  actions: WebAction[];
}

export interface WebAction {
  id: string;
  type:
    | "Click"
    | "Form Submit"
    | "Download"
    | "Video Play"
    | "Scroll"
    | "Search";
  element: string;
  value?: string;
  timestamp: string;
}

export interface EmailActivity {
  id: string;
  emailId: string;
  type:
    | "Sent"
    | "Delivered"
    | "Opened"
    | "Clicked"
    | "Replied"
    | "Forwarded"
    | "Bounced"
    | "Unsubscribed"
    | "Spam";
  timestamp: string;
  details?: Record<string, any>;
}

export interface SocialActivity {
  id: string;
  platform: "LinkedIn" | "Twitter" | "Facebook" | "Instagram" | "YouTube";
  type:
    | "Follow"
    | "Like"
    | "Share"
    | "Comment"
    | "Message"
    | "Connection Request"
    | "Profile View";
  content?: string;
  url?: string;
  timestamp: string;
  engagement: number;
}

export interface AuditTrail {
  id: string;
  action:
    | "Created"
    | "Updated"
    | "Deleted"
    | "Restored"
    | "Merged"
    | "Split"
    | "Assigned"
    | "Status Changed"
    | "Score Changed";
  field?: string;
  oldValue?: any;
  newValue?: any;
  changedBy: string;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  automatedChange: boolean;
}

export interface LeadPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canAssign: string[];
  canExport: string[];
  canMerge: string[];
  restrictedFields: string[];
}

export interface LeadSharing {
  isPublic: boolean;
  sharedWith: string[];
  shareLevel: "View" | "Edit" | "Full";
  teamVisibility: "Private" | "Team" | "Department" | "Company";
  externalSharing: boolean;
}

export interface LeadNotifications {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifyOnStatusChange: boolean;
  notifyOnScoreChange: boolean;
  notifyOnAssignment: boolean;
  notifyOnActivity: boolean;
  notificationFrequency: "Immediate" | "Hourly" | "Daily" | "Weekly";
  customNotifications: CustomNotification[];
}

export interface CustomNotification {
  id: string;
  name: string;
  trigger: string;
  conditions: NotificationCondition[];
  recipients: string[];
  template: string;
  isActive: boolean;
}

export interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface LeadAutomation {
  autoAssignment: boolean;
  autoScoring: boolean;
  autoNurturing: boolean;
  autoFollowUp: boolean;
  autoQualification: boolean;
  workflowRules: WorkflowRule[];
  triggers: AutomationTrigger[];
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  priority: number;
  executionCount: number;
  lastExecuted?: string;
}

export interface AutomationTrigger {
  id: string;
  name: string;
  event: string;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  isActive: boolean;
  delay?: number; // in minutes
}

export interface TriggerAction {
  type: string;
  parameters: Record<string, any>;
  order: number;
}

export interface LeadScoring {
  totalScore: number;
  demographicScore: number;
  behaviorScore: number;
  engagementScore: number;
  fitScore: number;
  intentScore: number;
  scoringModel: string;
  lastScored: string;
  scoringRules: ScoringRule[];
  scoreBreakdown: ScoreBreakdown[];
}

export interface ScoringRule {
  id: string;
  name: string;
  category: "Demographic" | "Behavior" | "Engagement" | "Fit" | "Intent";
  criteria: ScoringCriteria[];
  points: number;
  isActive: boolean;
  weight: number;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  factors: string[];
}

export interface LeadRouting {
  routingRules: RoutingRule[];
  assignmentMethod:
    | "Round Robin"
    | "Load Balancing"
    | "Territory"
    | "Skill Based"
    | "Manual";
  autoAssignment: boolean;
  reassignmentRules: ReassignmentRule[];
  escalationRules: EscalationRule[];
}

export interface RoutingRule {
  id: string;
  name: string;
  conditions: RoutingCondition[];
  assignTo: string | string[];
  priority: number;
  isActive: boolean;
  matchCount: number;
}

export interface RoutingCondition {
  field: string;
  operator: string;
  value: any;
  weight?: number;
}

export interface ReassignmentRule {
  id: string;
  name: string;
  trigger: string;
  conditions: RoutingCondition[];
  newAssignee: string;
  isActive: boolean;
}

export interface EscalationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: RoutingCondition[];
  escalateTo: string;
  delay: number; // in hours
  isActive: boolean;
}

export interface LeadEnrichment {
  autoEnrichment: boolean;
  enrichmentSources: string[];
  lastEnriched?: string;
  enrichmentStatus: "Pending" | "Completed" | "Failed" | "Partial";
  enrichedFields: string[];
  enrichmentScore: number;
  dataProviders: DataProvider[];
}

export interface DataProvider {
  name: string;
  status: "Active" | "Inactive" | "Error";
  lastSync?: string;
  fieldsProvided: string[];
  confidence: number;
}

export interface LeadValidation {
  emailValidation: ValidationResult;
  phoneValidation: ValidationResult;
  addressValidation: ValidationResult;
  companyValidation: ValidationResult;
  overallValidation: ValidationResult;
  lastValidated?: string;
  validationRules: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  status: "Valid" | "Invalid" | "Risky" | "Unknown";
  details?: string;
  validatedAt?: string;
}

export interface ValidationRule {
  id: string;
  field: string;
  rule: string;
  isActive: boolean;
  errorMessage: string;
}

export interface LeadCompliance {
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  canSpamCompliant: boolean;
  consentStatus: "Granted" | "Denied" | "Pending" | "Withdrawn";
  consentDate?: string;
  consentSource?: string;
  optInStatus: "Single" | "Double" | "None";
  unsubscribeDate?: string;
  unsubscribeReason?: string;
  dataRetentionDate?: string;
  rightToBeForgettenRequested: boolean;
  dataProcessingPurpose: string[];
  legalBasis: string;
  complianceNotes: string[];
}

export interface LeadAnalytics {
  conversionProbability: number;
  timeToConversion?: number; // in days
  valueScore: number;
  engagementTrend: "Increasing" | "Stable" | "Decreasing";
  responseRate: number;
  averageResponseTime: number; // in hours
  touchpointsToConversion?: number;
  channelEffectiveness: ChannelEffectiveness[];
  predictedValue: number;
  churnRisk: number;
  nextBestAction: string[];
  similarLeads: string[];
  benchmarkComparison: BenchmarkComparison;
}

export interface ChannelEffectiveness {
  channel: string;
  interactions: number;
  conversions: number;
  conversionRate: number;
  averageResponseTime: number;
  effectiveness: "High" | "Medium" | "Low";
}

export interface BenchmarkComparison {
  industryAverage: number;
  companyAverage: number;
  teamAverage: number;
  performanceRating: "Above Average" | "Average" | "Below Average";
}

// Lead Import/Export interfaces
export interface LeadImportMapping {
  csvField: string;
  crmField: string;
  required: boolean;
  dataType: "string" | "number" | "date" | "boolean" | "email" | "phone";
  validation?: string;
  defaultValue?: any;
  transformation?: string;
}

export interface LeadImportResult {
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  duplicatesFound: number;
  duplicatesSkipped: number;
  duplicatesMerged: number;
  validationErrors: ImportError[];
  importedLeadIds: string[];
  skippedRecords: SkippedRecord[];
  importSummary: ImportSummary;
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: "Error" | "Warning";
}

export interface SkippedRecord {
  row: number;
  data: Record<string, any>;
  reason: string;
  duplicateOf?: string;
}

export interface ImportSummary {
  importId: string;
  fileName: string;
  importedBy: string;
  importedAt: string;
  source: "CSV" | "Excel" | "API" | "Manual";
  mappingUsed: LeadImportMapping[];
  settings: ImportSettings;
}

export interface ImportSettings {
  skipDuplicates: boolean;
  mergeDuplicates: boolean;
  updateExisting: boolean;
  validateEmails: boolean;
  validatePhones: boolean;
  autoAssign: boolean;
  defaultOwner?: string;
  defaultSource?: string;
  defaultStatus?: string;
  customFieldMappings: Record<string, any>;
}

// Lead Export interfaces
export interface LeadExportSettings {
  format: "CSV" | "Excel" | "PDF" | "JSON";
  fields: string[];
  filters: ExportFilter[];
  includeActivities: boolean;
  includeNotes: boolean;
  includeHistory: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  customFields: boolean;
  fileName?: string;
}

export interface ExportFilter {
  field: string;
  operator: string;
  value: any;
}

// CRM Settings interfaces for dropdown options
// Simplified CRM Item interface
export interface SimpleCRMItem {
  id: string;
  name: string;
  is_active: boolean;
  priority?: number; // Only for Lead Statuses
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Simplified CRM Settings interface
export interface CRMSettings {
  leadSources: SimpleCRMItem[];
  leadStatuses: SimpleCRMItem[];
  leadQualificationStatuses: SimpleCRMItem[];
  leadCategories: SimpleCRMItem[];
  industries: SimpleCRMItem[];
  contactMethods: SimpleCRMItem[];
  activityTypes: SimpleCRMItem[];
  assignmentModes: SimpleCRMItem[];
  conversionTargets: SimpleCRMItem[];
}

export interface DropdownOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  isDefault: boolean;
  parentId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "datetime"
    | "boolean"
    | "select"
    | "multiselect"
    | "textarea"
    | "url"
    | "email"
    | "phone";
  required: boolean;
  defaultValue?: any;
  options?: DropdownOption[];
  validation?: string;
  helpText?: string;
  placeholder?: string;
  isActive: boolean;
  sortOrder: number;
  section: string;
  permissions: FieldPermissions;
  auditTrail: boolean;
  searchable: boolean;
  reportable: boolean;
  apiName: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FieldPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  restrictedRoles: string[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: "Email" | "SMS" | "Push" | "In-App";
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IntegrationSetting {
  id: string;
  name: string;
  type: string;
  status: "Active" | "Inactive" | "Error";
  configuration: Record<string, any>;
  lastSync?: string;
  syncFrequency: string;
  fieldsMapping: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DataRetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriod: number; // in days
  action: "Delete" | "Archive" | "Anonymize";
  conditions: RetentionCondition[];
  isActive: boolean;
  lastExecuted?: string;
  recordsAffected: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RetentionCondition {
  field: string;
  operator: string;
  value: any;
}

export interface ComplianceSettings {
  gdprEnabled: boolean;
  ccpaEnabled: boolean;
  canSpamEnabled: boolean;
  dataRetentionEnabled: boolean;
  consentRequired: boolean;
  doubleOptIn: boolean;
  unsubscribeLink: boolean;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  cookiePolicyUrl?: string;
  dataProcessingAgreementUrl?: string;
  complianceOfficer: string;
  auditFrequency: "Monthly" | "Quarterly" | "Annually";
  lastAudit?: string;
  nextAudit?: string;
  complianceScore: number;
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  id: string;
  type: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  detectedAt: string;
  resolvedAt?: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedTo: string;
  actions: string[];
}

export interface EnrichmentSettings {
  autoEnrichment: boolean;
  enrichmentProviders: string[];
  enrichmentFields: string[];
  enrichmentFrequency: "Real-time" | "Hourly" | "Daily" | "Weekly";
  costLimit: number;
  qualityThreshold: number;
  fallbackProviders: string[];
  enrichmentRules: EnrichmentRule[];
}

export interface EnrichmentRule {
  id: string;
  name: string;
  conditions: EnrichmentCondition[];
  provider: string;
  fields: string[];
  priority: number;
  isActive: boolean;
}

export interface EnrichmentCondition {
  field: string;
  operator: string;
  value: any;
}

export interface ReportingSettings {
  defaultReports: string[];
  customReports: CustomReport[];
  dashboards: Dashboard[];
  scheduledReports: ScheduledReport[];
  reportingFrequency: "Real-time" | "Hourly" | "Daily" | "Weekly" | "Monthly";
  dataRetention: number; // in days
  exportFormats: string[];
  sharingPermissions: ReportSharingPermissions;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: "Table" | "Chart" | "Dashboard";
  fields: string[];
  filters: ReportFilter[];
  groupBy: string[];
  sortBy: string[];
  chartType?: string;
  isPublic: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isPublic: boolean;
  refreshInterval: number; // in minutes
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DashboardWidget {
  id: string;
  type: "Chart" | "Table" | "Metric" | "List";
  title: string;
  reportId: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
}

export interface ScheduledReport {
  id: string;
  reportId: string;
  name: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  recipients: string[];
  format: "PDF" | "Excel" | "CSV";
  isActive: boolean;
  lastSent?: string;
  nextSend: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ReportSharingPermissions {
  canView: string[];
  canEdit: string[];
  canShare: string[];
  canExport: string[];
  publicAccess: boolean;
  externalSharing: boolean;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: "Website" | "Email" | "Phone" | "Social Media" | "Referral" | "Event";
  status:
    | "New"
    | "Contacted"
    | "Qualified"
    | "Proposal Sent"
    | "Closed Won"
    | "Closed Lost";
  score: number;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  budget: number;
  timeline: string;
  industry: string;
  // Enhanced fields for comprehensive lead management
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  companySize?: string;
  annualRevenue?: number;
  leadQuality: "Hot" | "Warm" | "Cold";
  authority: "Decision Maker" | "Influencer" | "User" | "Unknown";
  need: "High" | "Medium" | "Low" | "Unknown";
  urgency:
    | "Immediate"
    | "This Quarter"
    | "Next Quarter"
    | "This Year"
    | "Unknown";
  tags: string[];
  customFields: Record<string, any>;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  lastContactDate?: string;
  nextFollowUpDate?: string;
  leadOwnerHistory: LeadOwnerHistory[];
  conversionDate?: string;
  convertedToContactId?: string;
  convertedToOpportunityId?: string;
  duplicateOf?: string;
  campaignId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  ipAddress?: string;
  referralSource?: string;
  leadMagnet?: string;
  unsubscribed: boolean;
  doNotCall: boolean;
  doNotEmail: boolean;
  gdprConsent: boolean;
  lastActivityDate?: string;
  totalActivities: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  callsAttempted: number;
  callsConnected: number;
  meetingsScheduled: number;
  meetingsAttended: number;
  proposalsSent: number;
  quotesRequested: number;
  demoRequested: boolean;
  trialRequested: boolean;
  pricingRequested: boolean;
  competitorMentioned?: string[];
  painPoints: string[];
  interests: string[];
  productInterest: string[];
  marketingQualified: boolean;
  salesQualified: boolean;
  qualificationDate?: string;
  disqualificationReason?: string;
  leadTemperature: number; // 0-100 scale
  engagementScore: number; // 0-100 scale
  responseTime?: number; // in hours
  averageEmailResponseTime?: number; // in hours
  preferredContactMethod: "Email" | "Phone" | "Text" | "LinkedIn" | "Any";
  timezone?: string;
  bestTimeToContact?: string;
  language?: string;
  currency?: string;
  leadValue?: number; // predicted value
  probabilityToClose?: number; // 0-100
  expectedCloseDate?: string;
  salesCycleStage: number; // 1-10 scale
  touchpointsCount: number;
  lastTouchpointType?: string;
  lastTouchpointDate?: string;
  nurturingCampaignId?: string;
  leadMagnetDownloads: string[];
  webinarAttendance: string[];
  eventAttendance: string[];
  contentEngagement: ContentEngagement[];
  behaviorScore: number;
  demographicScore: number;
  firmographicScore: number;
  intentScore: number;
  fitScore: number;
  leadGrade: "A" | "B" | "C" | "D" | "F";
  lifecycleStage:
    | "Subscriber"
    | "Lead"
    | "Marketing Qualified Lead"
    | "Sales Qualified Lead"
    | "Opportunity"
    | "Customer"
    | "Evangelist"
    | "Other";
  buyingRole:
    | "Decision Maker"
    | "Influencer"
    | "Champion"
    | "Gatekeeper"
    | "User"
    | "Blocker"
    | "Unknown";
  buyingStage:
    | "Problem Aware"
    | "Solution Aware"
    | "Product Aware"
    | "Most Aware"
    | "Unaware";
  leadMagnetType?: string;
  originalReferrer?: string;
  landingPage?: string;
  firstPageVisited?: string;
  pagesVisited: number;
  timeOnSite?: number; // in minutes
  sessionCount: number;
  deviceType?: "Desktop" | "Mobile" | "Tablet";
  browser?: string;
  operatingSystem?: string;
  mobileNumber?: string;
  workPhone?: string;
  homePhone?: string;
  faxNumber?: string;
  assistantName?: string;
  assistantPhone?: string;
  department?: string;
  division?: string;
  reportingManager?: string;
  decisionMakingProcess?: string;
  budget_authority: boolean;
  budget_timeline?: string;
  currentSolution?: string;
  currentVendor?: string;
  contractEndDate?: string;
  evaluationCriteria: string[];
  decisionTimeframe?: string;
  stakeholders: string[];
  championIdentified: boolean;
  championName?: string;
  championContact?: string;
  competitiveThreats: string[];
  riskFactors: string[];
  opportunitySize?: number;
  dealProbability?: number;
  nextSteps: string[];
  internalNotes: string[];
  publicNotes: string[];
  attachments: string[];
  documents: string[];
  recordings: string[];
  emailHistory: EmailHistory[];
  callHistory: CallHistory[];
  meetingHistory: MeetingHistory[];
  taskHistory: TaskHistory[];
  noteHistory: NoteHistory[];
  statusHistory: StatusHistory[];
  scoreHistory: ScoreHistory[];
  touchpointHistory: TouchpointHistory[];
  campaignHistory: CampaignHistory[];
  webActivity: WebActivity[];
  emailActivity: EmailActivity[];
  socialActivity: SocialActivity[];
  integrationData: Record<string, any>;
  externalIds: Record<string, string>;
  syncStatus: "Synced" | "Pending" | "Failed" | "Not Synced";
  lastSyncDate?: string;
  dataSource: string;
  dataQuality: "High" | "Medium" | "Low";
  duplicateScore?: number;
  mergedFrom?: string[];
  splitFrom?: string;
  archived: boolean;
  archivedDate?: string;
  archivedReason?: string;
  deletedDate?: string;
  deletedBy?: string;
  deletedReason?: string;
  restoredDate?: string;
  restoredBy?: string;
  auditTrail: AuditTrail[];
  permissions: LeadPermissions;
  sharing: LeadSharing;
  notifications: LeadNotifications;
  automation: LeadAutomation;
  scoring: LeadScoring;
  routing: LeadRouting;
  enrichment: LeadEnrichment;
  validation: LeadValidation;
  compliance: LeadCompliance;
  analytics: LeadAnalytics;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  tags: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastContactDate: string;
  notes: string;
  isActive: boolean;
  // Enhanced fields for relationship intelligence
  stage: "Lead" | "Prospect" | "Customer" | "Partner";
  owner: string;
  teamVisibility: "private" | "team" | "public";
  consentStatus: "granted" | "denied" | "pending";
  customFields: Record<string, any>;
  duplicateOf?: string;
  relationshipScore: number;
  lastInteractionType?: "email" | "call" | "meeting" | "other";
  segmentIds: string[];
}

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  contactId: string;
  stage:
    | "Qualification"
    | "Needs Analysis"
    | "Proposal"
    | "Negotiation"
    | "Closed Won"
    | "Closed Lost";
  amount: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  source: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  products: string[];
  competitors: string[];
  nextStep: string;
  // Enhanced fields for revenue forecasting
  weightedAmount: number;
  salesVelocity: number;
  daysInStage: number;
  lastActivityDate: string;
  winProbabilityAI: number;
  lostReason?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  discountApproved: boolean;
  commissionRate: number;
  forecastCategory: "commit" | "best-case" | "pipeline";
  crossSellOpportunities: string[];
  upsellPotential: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: "Email" | "SMS" | "Social Media" | "Webinar" | "Event";
  status: "Draft" | "Active" | "Paused" | "Completed";
  startDate: string;
  endDate: string;
  budget: number;
  targetAudience: string;
  description: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  createdBy: string;
  // Enhanced fields for automation
  automationRules: AutomationRule[];
  emailTemplate?: EmailTemplate;
  leadScoringRules: LeadScoringRule[];
  abTestVariants: ABTestVariant[];
  landingPageUrl?: string;
  conversionGoals: ConversionGoal[];
  segmentIds: string[];
  triggerConditions: TriggerCondition[];
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger:
    | "email_opened"
    | "link_clicked"
    | "form_submitted"
    | "page_visited"
    | "time_delay";
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
}

export interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than";
  value: string;
}

export interface RuleAction {
  type: "send_email" | "add_tag" | "change_stage" | "assign_to" | "create_task";
  parameters: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface LeadScoringRule {
  id: string;
  name: string;
  criteria: ScoringCriteria[];
  points: number;
  isActive: boolean;
}

export interface ScoringCriteria {
  field: string;
  operator: string;
  value: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  percentage: number;
  template: EmailTemplate;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

export interface ConversionGoal {
  id: string;
  name: string;
  type: "page_visit" | "form_submit" | "purchase" | "download";
  value: number;
  url?: string;
}

export interface TriggerCondition {
  id: string;
  type: "contact_created" | "email_opened" | "form_submitted" | "tag_added";
  parameters: Record<string, any>;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  category: "Technical" | "Billing" | "General" | "Feature Request";
  customerId: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDeadline: string;
  tags: string[];
  attachments: string[];
  // Enhanced fields for customer experience
  customerSatisfaction?: number;
  escalationLevel: number;
  responseTime?: number;
  resolutionTime?: number;
  channel: "email" | "chat" | "phone" | "web" | "social";
  internalNotes: TicketNote[];
  publicReplies: TicketReply[];
  relatedTickets: string[];
  knowledgeBaseArticles: string[];
  slaPolicy: SLAPolicy;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    tier: "Basic" | "Premium" | "Enterprise";
  };
}

export interface TicketNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  isInternal: boolean;
}

export interface TicketReply {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  isFromCustomer: boolean;
  attachments: string[];
}

export interface SLAPolicy {
  id: string;
  name: string;
  responseTime: number; // in minutes
  resolutionTime: number; // in minutes
  priority: "Low" | "Medium" | "High" | "Critical";
  businessHoursOnly: boolean;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublished: boolean;
}

// Activity interface - explicitly exported
export interface Activity {
  id: string;
  type: "Call" | "Email" | "Meeting" | "Task" | "Note";
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
  relatedTo: {
    type: "Lead" | "Contact" | "Opportunity" | "Account";
    id: string;
    name: string;
  };
  scheduledDate: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  reminder: boolean;
  reminderTime?: string;
}

export interface CRMAnalytics {
  leadConversionRate: number;
  averageDealSize: number;
  salesCycleLength: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  pipelineValue: number;
  winRate: number;
  activityMetrics: {
    callsMade: number;
    emailsSent: number;
    meetingsHeld: number;
    tasksCompleted: number;
  };
}

// Re-export all types for better module resolution
export type {
  Lead as CRMLead,
  Contact as CRMContact,
  Opportunity as CRMOpportunity,
  Campaign as CRMCampaign,
  SupportTicket as CRMSupportTicket,
  Activity as CRMActivity,
  CRMAnalytics as CRMAnalyticsType,
};
