// src/types/crm/crm.types.ts

// ============================================================
// ENUMS
// ============================================================

export enum LeadStatus {
    New = 'New',
    Contacted = 'Contacted',
    Qualified = 'Qualified',
    Proposal = 'Proposal',
    Negotiation = 'Negotiation',
    Converted = 'Converted',
    Lost = 'Lost',
    Archived = 'Archived'
}
export interface TaskStatsResponse {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
    onHold: number;
    byPriority: Record<string, number>;
}
export enum LeadSource {
    Website = 'Website',
    Referral = 'Referral',
    SocialMedia = 'SocialMedia',
    Email = 'Email',
    ColdCall = 'ColdCall',
    Event = 'Event',
    Partner = 'Partner',
    Advertisement = 'Advertisement',
    Other = 'Other'
}

export enum LeadPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent'
}

export enum Industry {
    RealEstate = 'RealEstate',
    Manufacturing = 'Manufacturing',
    Technology = 'Technology',
    Healthcare = 'Healthcare',
    Finance = 'Finance',
    Education = 'Education',
    Government = 'Government',
    Retail = 'Retail',
    Consulting = 'Consulting',
    Construction = 'Construction',
    Energy = 'Energy',
    Transportation = 'Transportation',
    Hospitality = 'Hospitality',
    Other = 'Other'
}

export enum CustomerStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Lead = 'Lead',
    Prospect = 'Prospect',
    VIP = 'VIP',
    Archived = 'Archived'
}

export enum CustomerType {
    Individual = 'Individual',
    Company = 'Company',
    Government = 'Government',
    NonProfit = 'NonProfit'
}

export enum OpportunityStage {
    Discovery = 'Discovery',
    Qualification = 'Qualification',
    Proposal = 'Proposal',
    Negotiation = 'Negotiation',
    ClosedWon = 'ClosedWon',
    ClosedLost = 'ClosedLost'
}

export enum WinProbability {
    VeryLow = 10,
    Low = 30,
    Medium = 50,
    High = 70,
    VeryHigh = 90
}

export enum ActivityType {
    Call = 'Call',
    Email = 'Email',
    Meeting = 'Meeting',
    Task = 'Task',
    Note = 'Note',
    FollowUp = 'FollowUp',
    Demo = 'Demo',
    Presentation = 'Presentation',
    Other = 'Other'
}

export enum ActivityStatus {
    Scheduled = 'Scheduled',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    Postponed = 'Postponed'
}

export enum TaskStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    Overdue = 'Overdue'
}

export enum TaskPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent'
}

// ============================================================
// CAMPAIGN ENUMS (Numeric values from backend)
// ============================================================

export enum CampaignStatus {
    Draft = 0,
    Active = 1,
    Paused = 2,
    Completed = 3,
    Cancelled = 4,
    Archived = 5,
    Scheduled = 6,
}

export enum CampaignType {
    Email = 0,
    SocialMedia = 1,
    Advertisement = 2,
    Event = 3,
    DirectMail = 4,
    Telemarketing = 5,
    ContentMarketing = 6,
    Other = 7,
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
    total?: number;
    page?: number;
    pageSize?: number;
}

// ============================================================
// EMPLOYEE TYPES
// ============================================================

export interface EmployeeDto {
    id: string;
    code?: string;
    firstName?: string;
    firstNameAm?: string;
    middleName?: string;
    middleNameAm?: string;
    lastName?: string;
    lastNameAm?: string;
    gender?: string;
    email?: string;
    phone?: string;
    appUserId?: string;
    departmentId?: string;
    positionId?: string;
    jobGradeId?: string;
    employmentType?: string;
    empState?: string;
    employmentDate?: string;
    dateAdd: string;
    dateMod?: string;
    isDeleted: boolean;
    syncedAt?: string;
    fullName?: string;
    fullNameAm?: string;
}

export interface EmployeeAssignmentDto {
    id: string;
    appUserId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    code?: string;
    displayName?: string;
}

// ============================================================
// LEAD TYPES
// ============================================================

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    status: LeadStatus;
    source: LeadSource;
    priority: LeadPriority;
    industry?: Industry;
    title?: string;
    description?: string;
    budget?: number;
    estimatedValue?: number;
    expectedCloseDate?: string;
    assignedToUserId?: string;
    assignedToGroupId?: string;
    isConverted: boolean;
    convertedDate?: string;
    convertedCustomerId?: string;
    score: number;
    engagementScore: number;
    tags?: string;
    customFieldsJson?: string;
    // Real Estate Specific
    propertyType?: string;
    propertyPrice?: number;
    propertyLocation?: string;
    propertySize?: number;
    // Manufacturing Specific
    productCategory?: string;
    orderQuantity?: number;
    requiredDeliveryDate?: string;
    // Government Specific
    tenderNumber?: string;
    tenderDeadline?: string;
    department?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    lastContactDate?: string;
    contactCount: number;
    activities?: Activity[];
    tasks?: Task[];
    notes?: Note[];
    opportunities?: Opportunity[];
}

export interface LeadDto {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    companyName?: string;
    email: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    status: string;
    source: string;
    priority: string;
    industry?: string;
    title?: string;
    description?: string;
    budget?: number;
    estimatedValue?: number;
    expectedCloseDate?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    score: number;
    engagementScore: number;
    tags?: string;
    isConverted: boolean;
    convertedDate?: string;
    createdAt: string;
    lastContactDate?: string;
    contactCount: number;
    // Industry specific
    propertyType?: string;
    propertyPrice?: number;
    productCategory?: string;
    orderQuantity?: number;
    tenderNumber?: string;
    tenderDeadline?: string;
}

export interface CreateLeadDto {
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    status?: string;
    source?: string;
    priority?: string;
    industry?: string;
    title?: string;
    description?: string;
    budget?: number;
    estimatedValue?: number;
    expectedCloseDate?: string;
    assignedToUserId?: string;
    tags?: string;
    // Industry specific
    propertyType?: string;
    propertyPrice?: number;
    productCategory?: string;
    orderQuantity?: number;
    tenderNumber?: string;
    tenderDeadline?: string;
    department?: string;
    requiredDeliveryDate?: string;
}

export interface UpdateLeadDto {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    status?: string;
    source?: string;
    priority?: string;
    industry?: string;
    title?: string;
    description?: string;
    budget?: number;
    estimatedValue?: number;
    expectedCloseDate?: string;
    assignedToUserId?: string;
    tags?: string;
    // Industry specific
    propertyType?: string;
    propertyPrice?: number;
    productCategory?: string;
    orderQuantity?: number;
    tenderNumber?: string;
    tenderDeadline?: string;
}

export interface LeadFilterDto {
    searchTerm?: string;
    status?: string;
    source?: string;
    priority?: string;
    industry?: string;
    assignedToUserId?: string;
    fromDate?: string;
    toDate?: string;
    minScore?: number;
    maxScore?: number;
    minBudget?: number;
    maxBudget?: number;
    isConverted?: boolean;
    tags?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface LeadStatsDto {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    lostLeads: number;
    conversionRate: number;
    averageLeadScore: number;
    leadsBySource: Record<string, number>;
    leadsByIndustry: Record<string, number>;
    leadsByPriority: Record<string, number>;
}

export interface LeadBulkActionDto {
    leadIds: string[];
    action: string;
    data?: any;
}

// ============================================================
// CUSTOMER TYPES
// ============================================================

export interface Customer {
    id: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    status: CustomerStatus;
    type: CustomerType;
    industry?: Industry;
    description?: string;
    annualRevenue?: number;
    employeeCount?: number;
    website?: string;
    taxId?: string;
    firstPurchaseDate?: string;
    lastPurchaseDate?: string;
    lifetimeValue?: number;
    tags?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    contacts?: Contact[];
    opportunities?: Opportunity[];
    activities?: Activity[];
    notes?: Note[];
}

export interface CustomerDto {
    id: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    status: string;
    type: string;
    industry?: string;
    description?: string;
    annualRevenue?: number;
    employeeCount: number;
    website?: string;
    tags?: string;
    isActive: boolean;
    lifetimeValue?: number;
    totalOrders: number;
    contactCount: number;
    opportunityCount: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCustomerDto {
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    type?: string;
    industry?: string;
    description?: string;
    annualRevenue?: number;
    employeeCount?: number;
    website?: string;
    tags?: string;
}

export interface UpdateCustomerDto {
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    status?: string;
    type?: string;
    industry?: string;
    description?: string;
    annualRevenue?: number;
    employeeCount?: number;
    website?: string;
    tags?: string;
    isActive?: boolean;
}

export interface CustomerFilterDto {
    search?: string;
    status?: string;
    type?: string;
    industry?: string;
    page?: number;
    pageSize?: number;
}

// ============================================================
// CONTACT TYPES
// ============================================================

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    mobile?: string;
    title?: string;
    department?: string;
    customerId?: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ContactDto {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
    mobile?: string;
    title?: string;
    department?: string;
    customerId?: string;
    customerName?: string;
    isPrimary: boolean;
    isDecisionMaker: boolean;
    isActive: boolean;
    notes?: string;
    acceptsEmail: boolean;
    acceptsSMS: boolean;
    acceptsCalls: boolean;
    acceptsMarketing: boolean;
    preferredContactMethod?: string;
    lastContactDate?: string;
    contactCount: number;
    linkedIn?: string;
    twitter?: string;
    facebook?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateContactDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    mobile?: string;
    title?: string;
    department?: string;
    customerId?: string;
    isPrimary?: boolean;
    isDecisionMaker?: boolean;
    notes?: string;
    acceptsEmail?: boolean;
    acceptsSMS?: boolean;
    acceptsCalls?: boolean;
    acceptsMarketing?: boolean;
    preferredContactMethod?: string;
    linkedIn?: string;
    twitter?: string;
    facebook?: string;
}

export interface UpdateContactDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    title?: string;
    department?: string;
    customerId?: string;
    isPrimary?: boolean;
    isDecisionMaker?: boolean;
    notes?: string;
    acceptsEmail?: boolean;
    acceptsSMS?: boolean;
    acceptsCalls?: boolean;
    acceptsMarketing?: boolean;
    preferredContactMethod?: string;
    linkedIn?: string;
    twitter?: string;
    facebook?: string;
    isActive?: boolean;
}

// ============================================================
// OPPORTUNITY TYPES
// ============================================================

export interface Opportunity {
    id: string;
    name: string;
    description?: string;
    customerId?: string;
    leadId?: string;
    amount: number;
    stage: OpportunityStage;
    winProbability: WinProbability;
    expectedCloseDate?: string;
    actualCloseDate?: string;
    assignedToUserId?: string;
    createdByUserId?: string;
    products?: string;
    competitors?: string;
    decisionMakers?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    customer?: Customer;
    lead?: Lead;
    activities?: Activity[];
    tasks?: Task[];
    notes?: Note[];
}

export interface OpportunityDto {
    id: string;
    name: string;
    description?: string;
    customerId?: string;
    customerName?: string;
    leadId?: string;
    leadName?: string;
    amount: number;
    stage: string;
    winProbability: number;
    expectedCloseDate?: string;
    actualCloseDate?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    createdAt: string;
}

export interface CreateOpportunityDto {
    name: string;
    description?: string;
    customerId?: string;
    leadId?: string;
    amount: number;
    stage?: string;
    winProbability?: number;
    expectedCloseDate?: string;
    assignedToUserId?: string;
    products?: string;
    competitors?: string;
    decisionMakers?: string;
}

export interface UpdateOpportunityDto {
    name?: string;
    description?: string;
    amount?: number;
    stage?: string;
    winProbability?: number;
    expectedCloseDate?: string;
    assignedToUserId?: string;
    products?: string;
    competitors?: string;
    decisionMakers?: string;
}

// ============================================================
// ACTIVITY TYPES
// ============================================================

export interface Activity {
    id: string;
    title: string;
    description?: string;
    type: ActivityType;
    status: ActivityStatus;
    startDateTime?: string;
    endDateTime?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    createdByUserId?: string;
    location?: string;
    isAllDay: boolean;
    reminderMinutes?: string;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    lead?: Lead;
    customer?: Customer;
    opportunity?: Opportunity;
}

export interface ActivityDto {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    startDateTime?: string;
    endDateTime?: string;
    leadId?: string;
    leadName?: string;
    customerId?: string;
    customerName?: string;
    opportunityId?: string;
    opportunityName?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    location?: string;
    isAllDay: boolean;
    createdAt: string;
}

export interface CreateActivityDto {
    title: string;
    description?: string;
    type: string;
    status?: string;
    startDateTime?: string;
    endDateTime?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    location?: string;
    isAllDay?: boolean;
    reminderMinutes?: string;
}

export interface UpdateActivityDto {
    title?: string;
    description?: string;
    type?: string;
    status?: string;
    startDateTime?: string;
    endDateTime?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    location?: string;
    isAllDay?: boolean;
    reminderMinutes?: string;
}

// ============================================================
// TASK TYPES
// ============================================================

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    completedDate?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    createdByUserId?: string;
    isRecurring: boolean;
    recurrenceRule?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface TaskDto {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    completedDate?: string;
    leadId?: string;
    leadName?: string;
    customerId?: string;
    customerName?: string;
    opportunityId?: string;
    opportunityName?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    createdAt: string;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
}

// ============================================================
// NOTE TYPES
// ============================================================

export interface Note {
    id: string;
    content: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    createdByUserId?: string;
    isPinned: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface NoteDto {
    id: string;
    content: string;
    leadId?: string;
    leadName?: string;
    customerId?: string;
    customerName?: string;
    opportunityId?: string;
    opportunityName?: string;
    createdByUserId?: string;
    createdByUserName?: string;
    isPinned: boolean;
    createdAt: string;
}

export interface CreateNoteDto {
    content: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    isPinned?: boolean;
}

export interface UpdateNoteDto {
    content?: string;
    isPinned?: boolean;
}

// ============================================================
// CAMPAIGN TYPES
// ============================================================

// src/types/crm/crm.types.ts

export interface Campaign {
    id: string;
    name: string;
    description?: string;
    type: number | string;
    status: number | string;
    channel?: string;
    objective?: string;
    targetCount?: number;
    leadCount?: number;
    conversionCount?: number;
    conversionRate?: number;
    budget?: number;
    spent?: number;
    roi?: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    tags?: string[];
    segments?: string[];
    settings?: Record<string, any>;
    isActive?: boolean;
    isDeleted?: boolean;
    // Additional metrics
    reachCount?: number;
    engagementCount?: number;
    engagementRate?: number;
    actualCost?: number;
    actualRevenue?: number;
    expectedRevenue?: number;
    targetAudience?: string;
    targetIndustry?: string;
    targetLocation?: string;
}

export interface CampaignDto {
    id: string;
    name: string;
    description?: string;
    type: string;
    status: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    actualCost?: number;
    expectedRevenue?: number;
    actualRevenue?: number;
    targetAudience?: string;
    targetIndustry?: string;
    targetLocation?: string;
    targetCount: number;
    reachCount: number;
    engagementCount: number;
    conversionCount: number;
    conversionRate?: number;
    engagementRate?: number;
    channel?: string;
    metricsJson?: string;
    contentJson?: string;
    isActive: boolean;
    leadCount: number;
    customerCount: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CampaignFilterDto {
    status?: number | string;
    type?: number | string;
    channel?: string;
    objective?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateCampaignDto {
    name: string;
    description?: string;
    type: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    expectedRevenue?: number;
    targetAudience?: string;
    targetIndustry?: string;
    targetLocation?: string;
    targetCount?: number;
    channel?: string;
    metricsJson?: string;
    contentJson?: string;
}

export interface UpdateCampaignDto {
    name?: string;
    description?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    actualCost?: number;
    expectedRevenue?: number;
    actualRevenue?: number;
    targetAudience?: string;
    targetIndustry?: string;
    targetLocation?: string;
    targetCount?: number;
    reachCount?: number;
    engagementCount?: number;
    conversionCount?: number;
    conversionRate?: number;
    engagementRate?: number;
    channel?: string;
    metricsJson?: string;
    contentJson?: string;
    isActive?: boolean;
}

export interface CampaignStatsDto {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    draftCampaigns: number;
    pausedCampaigns: number;
    scheduledCampaigns: number;
    archivedCampaigns: number;
    cancelledCampaigns: number;
    totalBudget: number;
    totalActualCost: number;
    totalRevenue: number;
    averageConversionRate: number;
    averageEngagementRate: number;
    campaignsByType: Record<string, number>;
    campaignsByStatus: Record<string, number>;
}

// ============================================================
// CUSTOM FIELD TYPES
// ============================================================

export interface CustomFieldDefinitionDto {
    id: string;
    name: string;
    label?: string;
    type: string;
    entityType: string;
    isRequired: boolean;
    isActive: boolean;
    defaultValue?: string;
    optionsJson?: string;
    validationRulesJson?: string;
    displayOrder: number;
    category?: string;
    helpText?: string;
    isSearchable: boolean;
    isFilterable: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCustomFieldDefinitionDto {
    name: string;
    label?: string;
    type: string;
    entityType: string;
    isRequired?: boolean;
    defaultValue?: string;
    optionsJson?: string;
    validationRulesJson?: string;
    displayOrder?: number;
    category?: string;
    helpText?: string;
    isSearchable?: boolean;
    isFilterable?: boolean;
}

export interface UpdateCustomFieldDefinitionDto {
    name?: string;
    label?: string;
    type?: string;
    entityType?: string;
    isRequired?: boolean;
    isActive?: boolean;
    defaultValue?: string;
    optionsJson?: string;
    validationRulesJson?: string;
    displayOrder?: number;
    category?: string;
    helpText?: string;
    isSearchable?: boolean;
    isFilterable?: boolean;
}

// ============================================================
// ROUTING TYPES
// ============================================================

export interface RoutingRuleDto {
    id: string;
    name: string;
    description?: string;
    type: string;
    conditions?: string;
    isActive: boolean;
    priority: number;
    assignedToUserId?: string;
    assignedToUserName?: string;
    assignedToTeamId?: string;
    assignedToTeamName?: string;
    fallbackRule?: string;
    maxLeadsPerDay?: number;
    matchesCount: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateRoutingRuleDto {
    name: string;
    description?: string;
    type: string;
    conditions?: string;
    isActive?: boolean;
    priority?: number;
    assignedToUserId?: string;
    assignedToTeamId?: string;
    fallbackRule?: string;
    maxLeadsPerDay?: number;
}

export interface UpdateRoutingRuleDto {
    name?: string;
    description?: string;
    type?: string;
    conditions?: string;
    isActive?: boolean;
    priority?: number;
    assignedToUserId?: string;
    assignedToTeamId?: string;
    fallbackRule?: string;
    maxLeadsPerDay?: number;
}

export interface RoutingStatsDto {
    totalRules: number;
    activeRules: number;
    totalRouted: number;
    pendingRouting: number;
    avgResponseTime: number;
    rulesByType: Record<string, number>;
    rulesByStatus: Record<string, number>;
}

// ============================================================
// SCORING TYPES
// ============================================================

export interface ScoreRuleDto {
    id: string;
    name: string;
    description?: string;
    type: string;
    field: string;
    operator: string;
    value: string;
    score: number;
    isActive: boolean;
    priority: number;
    category?: string;
    matchesCount?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateScoreRuleDto {
    name: string;
    description?: string;
    type: string;
    field: string;
    operator: string;
    value: string;
    score: number;
    isActive?: boolean;
    priority?: number;
    category?: string;
}

export interface UpdateScoreRuleDto {
    name?: string;
    description?: string;
    type?: string;
    field?: string;
    operator?: string;
    value?: string;
    score?: number;
    isActive?: boolean;
    priority?: number;
    category?: string;
}

export interface ScoreResultDto {
    leadId: string;
    totalScore: number;
    breakdown: ScoreBreakdownDto[];
}

export interface ScoreBreakdownDto {
    ruleName: string;
    category: string;
    score: number;
    matched: boolean;
    details?: string;
}

// ============================================================
// TICKET TYPES
// ============================================================

export interface TicketDto {
    id: string;
    title: string;
    description: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    status: string;
    priority: string;
    category: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    attachments?: string[];
}

export interface CreateTicketDto {
    title: string;
    description: string;
    customerId?: string;
    customerEmail: string;
    customerName: string;
    priority: string;
    category: string;
    assignedToUserId?: string;
}

export interface UpdateTicketDto {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedToUserId?: string;
    resolvedAt?: string;
}

export interface TicketStatsDto {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    avgResponseTime: string;
    satisfactionRate: number;
}

// ============================================================
// KNOWLEDGE BASE TYPES
// ============================================================

export interface ArticleDto {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    views: number;
    likes: number;
    status: 'Published' | 'Draft' | 'Archived';
    createdAt: string;
    updatedAt?: string;
    authorId?: string;
    authorName?: string;
}

export interface CreateArticleDto {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    status?: string;
}

export interface UpdateArticleDto {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    status?: string;
}

// ============================================================
// FEEDBACK TYPES
// ============================================================

export interface FeedbackDto {
    id: string;
    customerId?: string;
    customerName?: string;
    rating: number;
    comment: string;
    category: string;
    status: 'New' | 'Reviewed' | 'Resolved';
    createdAt: string;
    resolvedAt?: string;
}

export interface CreateFeedbackDto {
    customerId?: string;
    customerName: string;
    customerEmail: string;
    rating: number;
    comment: string;
    category: string;
}

// ============================================================
// INTERACTION TYPES
// ============================================================

export interface InteractionDto {
    id: string;
    type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task' | 'Chat';
    subject: string;
    description?: string;
    leadId?: string;
    leadName?: string;
    customerId?: string;
    customerName?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    createdAt: string;
    duration?: number;
    outcome?: string;
}

export interface CreateInteractionDto {
    type: string;
    subject: string;
    description?: string;
    leadId?: string;
    customerId?: string;
    assignedToUserId?: string;
    duration?: number;
    outcome?: string;
    status?: number;
    priority?: number;
    contactId?: string;
    opportunityId?: string;
    scheduledDate?: string;
    location?: string;
    isAllDay?: boolean;
}


// ============================================================
// COMPANY TYPES
// ============================================================

export interface CompanyDto {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    size?: string;
    status: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    createdAt: string;
    updatedAt?: string;
    contactCount: number;
    leadCount: number;
}

export interface CreateCompanyDto {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    size?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

export interface UpdateCompanyDto {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    size?: string;
    status?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}
// src/types/crm/crm.types.ts

// ============================================================
// INTERACTION TYPES
// ============================================================

export interface InteractionDto {
    id: string;
    type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task' | 'Chat';
    subject: string;
    description?: string;
    leadId?: string;
    leadName?: string;
    customerId?: string;
    customerName?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    createdAt: string;
    duration?: number;
    outcome?: string;
}




export interface InteractionFilterDto {
    type?: string;
    leadId?: string;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
    assignedToUserId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
}

// src/types/crm/crm.types.ts

export interface CreateInteractionDto {
    subject: string;
    description?: string;
    type: string;
    status?: string;  // Changed from number to string
    priority?: string;  // Changed from number to string
    leadId?: string;
    customerId?: string;
    contactId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    scheduledDate?: string;
    duration?: number;
    outcome?: string;
    location?: string;
    isAllDay?: boolean;
}

export interface UpdateInteractionDto extends Partial<CreateInteractionDto> {
    completedDate?: string;
}

export interface InteractionDto {
    id: string;
    subject: string;
    description?: string;
    type: string;
    status: string;  // Changed from number to string
    priority: string;  // Changed from number to string
    leadId?: string;
    leadName?: string;
    customerId?: string;
    customerName?: string;
    contactId?: string;
    contactName?: string;
    opportunityId?: string;
    opportunityName?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    scheduledDate?: string;
    completedDate?: string;
    duration?: number;
    outcome?: string;
    location?: string;
    isAllDay: boolean;
    createdAt?: string;
    updatedAt?: string;
}
// src/types/crm/crm.types.ts - Add these types

// ============================================================
// QUOTES
// ============================================================





export interface CreateQuoteDto {
    customerId?: string;
    leadId?: string;
    opportunityId?: string;
    validUntil?: string;
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    termsAndConditions?: string;
    notes?: string;
    quoteLines: CreateQuoteLineDto[];
}

export interface CreateQuoteLineDto {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    notes?: string;
}



// ============================================================
// ORDERS
// ============================================================

export interface OrderDto {
    id: string;
    orderNumber: string;
    customerId?: string;
    customerName?: string;
    orderDate: string;
    status: string; // Draft, Pending, Processing, Shipped, Delivered, Cancelled, Completed
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    shippingAddress?: string;
    billingAddress?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    orderLines: OrderLineDto[];
}

export interface OrderLineDto {
    id: string;
    orderId: string;
    productId?: string;
    productName?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    notes?: string;
}

export interface CreateOrderDto {
    CustomerId: string;
    OpportunityId?: string | null;
    QuoteId?: string | null;
    OrderDate: string;
    DueDate?: string | null;
    SubTotal: number;
    TaxAmount: number;
    DiscountAmount: number;
    ShippingCost: number;
    TotalAmount: number;
    ShippingAddress?: string;
    BillingAddress?: string;
    Terms?: string;
    Notes?: string;
    Currency?: string;
    OrderLines: CreateOrderLineDto[];
}

export interface CreateOrderLineDto {
    ProductId?: string | null;
    Description: string;
    Quantity: number;
    UnitPrice: number;
    Discount: number;
    TaxRate: number;
    TotalPrice: number;
    Notes?: string;
}



export interface UpdateOrderDto extends Partial<CreateOrderDto> {
    status?: string;
}

// ============================================================
// CONTRACTS
// ============================================================

export interface ForecastData {
    totalForecast: number;
    conversionRate: number;
    averageDealSize: number;
    pipelineVelocity: number;
    byStage: {
        stage: string;
        amount: number;
        count: number;
        probability: number;
    }[];
    monthlyTrend: {
        month: string;
        amount: number;
    }[];
    byRep: {
        repName: string;
        revenue: number;
        deals: number;
        target: number;
        achievement: number;
    }[];
}


export interface ForecastByStage {
    stage: string;
    amount: number;
    count: number;
    probability: number;
}

export interface MonthlyTrend {
    month: string;
    amount: number;
}

export interface RepPerformance {
    repName: string;
    revenue: number;
    deals: number;
    target: number;
    achievement: number;
}

export interface SalesForecastData {
    totalForecast: number;
    conversionRate: number;
    averageDealSize: number;
    pipelineVelocity: number;
    byStage: ForecastByStage[];
    monthlyTrend: MonthlyTrend[];
    byRep: RepPerformance[];
}


// ============================================================
// SALES FORECAST
// ============================================================

export interface SalesForecastDto {
    totalForecast: number;
    byStage: {
        stage: string;
        amount: number;
        count: number;
        probability: number;
    }[];
    monthlyTrend: {
        month: string;
        amount: number;
    }[];
    conversionRate: number;
    averageDealSize: number;
    pipelineVelocity: number;
}

export interface SalesPipelineDto {
    stages: {
        stage: string;
        count: number;
        value: number;
        probability: number;
    }[];
    totalValue: number;
    totalCount: number;
}

export interface SalesPerformanceDto {
    revenue: number;
    targets: number;
    achievement: number;
    dealsClosed: number;
    averageDealSize: number;
    winRate: number;
    salesByRep: {
        repName: string;
        revenue: number;
        deals: number;
        target: number;
        achievement: number;
    }[];
}

// src/types/crm/crm.types.ts

// ============================================================
// ORDER / SALES ORDER TYPES
// ============================================================

export interface OrderDto {
    id: string;
    orderNumber: string;
    customerId?: string;
    customerName?: string;
    leadId?: string;
    leadName?: string;
    opportunityId?: string;
    opportunityName?: string;
    orderDate: string;
    dueDate: string;
    status: 'Draft' | 'Sent' | 'Processing' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled' | 'Refunded';
    subTotal: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount: number;
    amountPaid?: number;
    balanceDue?: number;
    terms?: string;
    notes?: string;
    currency?: string;
    createdAt: string;
    updatedAt?: string;
    items: OrderItemDto[];
}

export interface OrderItemDto {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    totalPrice: number;
    productId?: string;
    productName?: string;
    notes?: string;
}



export interface CreateOrderItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    productId?: string;
    notes?: string;
}

export interface UpdateOrderDto {
    orderDate?: string;
    dueDate?: string;
    terms?: string;
    notes?: string;
    currency?: string;
    discountAmount?: number;
    items?: CreateOrderItemDto[];
}

export interface OrderStatsDto {
    total: number;
    pending: number;
    draft: number;
    processing: number;
    shipped: number;
    delivered: number;
    completed: number;
    cancelled: number;
    totalValue: number;
    averageOrderValue: number;
}


// src/types/crm/crm.types.ts


export interface QuoteItemDto {
    id?: string;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;

}

// For API requests, use the same types
export interface UpdateQuoteDto {
    quoteNumber?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    status?: number;
    notes?: string;
    validUntil?: string;
    discount?: number;
    items?: QuoteItemDto[];
}


// src/types/crm/crm.types.ts - Update QuoteDto

export interface QuoteDto {
    id: string;
    quoteNumber: string;
    leadId?: string | null;
    leadName?: string | null;
    customerId?: string | null;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    opportunityId?: string | null;
    opportunityName?: string | null;
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    shippingCost: number;
    validUntil?: string | null;
    status: number | string; // Can be number or string from API
    statusLabel?: string;
    termsAndConditions?: string | null;
    notes?: string | null;
    viewCount: number;
    sentDate?: string | null;
    acceptedDate?: string | null;
    createdAt: string;
    updatedAt?: string | null;

    // Alias for compatibility

    quoteLines: QuoteLineDto[];  // ✅ This should exist
    items?: QuoteLineDto[];      // ✅ For compatibility
    QuoteLines?: QuoteLineDto[]; // ✅ For PascalCase from backend
}

export interface QuoteLineDto {
    id: string;
    quoteId: string;
    productId?: string | null;
    productName?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
    sortOrder: number;
    notes?: string | null;
    // PascalCase variants for backend compatibility
    Description?: string;
    Quantity?: number;
    UnitPrice?: number;
    TotalPrice?: number;
    ProductName?: string;
}



// src/types/crm/crm.types.ts

// ============================================================
// CONTRACT TYPES
// ============================================================

export interface ContractLineDto {
    id: string;
    contractId: string;
    productId?: string | null;
    productName?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sortOrder: number;
    notes?: string | null;
}

export interface CreateContractLineDto {
    productId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    notes?: string | null;
}

export interface UpdateContractLineDto {
    id?: string | null;
    productId?: string | null;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    notes?: string | null;
}

export interface ContractDto {
    id: string;
    contractNumber: string;
    title: string;
    description?: string | null;
    customerId: string;
    customerName?: string | null;
    opportunityId?: string | null;
    opportunityName?: string | null;
    quoteId?: string | null;
    quoteNumber?: string | null;
    totalValue: number;
    status: string;
    startDate: string;
    endDate?: string | null;
    signedDate?: string | null;
    termsAndConditions?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    contractLines: ContractLineDto[];
}

export interface CreateContractDto {
    customerId: string;
    opportunityId?: string | null;
    quoteId?: string | null;
    title: string;
    description?: string | null;
    totalValue: number;
    status?: string;
    startDate: string;
    endDate?: string | null;
    termsAndConditions?: string | null;
    notes?: string | null;
    contractLines?: CreateContractLineDto[];
}

export interface UpdateContractDto {
    title?: string | null;
    description?: string | null;
    totalValue?: number;
    status?: string;
    startDate?: string;
    endDate?: string | null;
    signedDate?: string | null;
    termsAndConditions?: string | null;
    notes?: string | null;
    contractLines?: UpdateContractLineDto[];
}

export interface ContractFilterDto {
    customerId?: string | null;
    opportunityId?: string | null;
    quoteId?: string | null;
    status?: string;
    fromDate?: string;
    toDate?: string;
    minValue?: number;
    maxValue?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface ContractStatsDto {
    totalContracts: number;
    draft: number;
    pending: number;
    active: number;
    signed: number;
    expired: number;
    terminated: number;
    totalValue: number;
    averageContractValue: number;
}
export interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    content: string;
    status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Failed' | 'Paused';
    openCount?: number;
    clickCount?: number;
    bounceCount?: number;
    sentAt?: string;
    scheduledAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface SocialPost {
    id: string;
    content: string;
    platform: 'Facebook' | 'Twitter' | 'Instagram' | 'LinkedIn' | 'YouTube' | 'TikTok';
    status: 'Draft' | 'Scheduled' | 'Published' | 'Failed' | 'Pending';
    engagementCount?: number;
    reachCount?: number;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
    scheduledAt?: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Property {
    id: string;
    title: string;
    description?: string;
    type: string;
    address: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    bedrooms?: number;
    bathrooms?: number;
    halfBathrooms?: number;
    landSize?: number;
    buildingSize?: number;
    yearBuilt?: number;
    price: number;
    pricePerSquareFoot?: number;
    listedPrice?: number;
    soldPrice?: number;
    status: string;
    ownerId?: string;
    ownerName?: string;
    listingAgentId?: string;
    listingAgentName?: string;
    buyingAgentId?: string;
    buyingAgentName?: string;
    features?: string[];
    mainImageUrl?: string;
    images?: string[];
    virtualTourUrl?: string;
    videoUrl?: string;
    listingDate?: string;
    soldDate?: string;
    rentedDate?: string;
    offMarketDate?: string;
    isFeatured: boolean;
    isPublished: boolean;
    viewCount: number;
    inquiryCount: number;
    createdAt: string;
    updatedAt?: string;
    marketingDescription?: string;
}

export interface PropertyDto {
    id: string;
    title: string;
    description?: string;
    type: string;
    address: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    bedrooms?: number;
    bathrooms?: number;
    halfBathrooms?: number;
    landSize?: number;
    buildingSize?: number;
    yearBuilt?: number;
    price: number;
    pricePerSquareFoot?: number;
    listedPrice?: number;
    soldPrice?: number;
    status: string;
    ownerId?: string;
    ownerName?: string;
    listingAgentId?: string;
    listingAgentName?: string;
    buyingAgentId?: string;
    buyingAgentName?: string;
    features?: string[];
    featuresJson?: string;
    mainImageUrl?: string;
    images?: string[];
    imagesJson?: string;
    virtualTourUrl?: string;
    videoUrl?: string;
    listingDate?: string;
    soldDate?: string;
    rentedDate?: string;
    offMarketDate?: string;
    isFeatured: boolean;
    isPublished: boolean;
    viewCount: number;
    inquiryCount: number;
    createdAt: string;
    updatedAt?: string;
    marketingDescription?: string;
}

export interface CreatePropertyDto {
    title: string;
    description?: string;
    type: number;
    address: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    halfBathrooms?: number | null;
    landSize?: number | null;
    buildingSize?: number | null;
    yearBuilt?: number | null;
    price: number;
    status: number;
    ownerId?: string | null;
    listingAgentId?: string | null;
    features?: string[] | null;
    mainImageUrl?: string | null;
    images?: string[] | null;
    virtualTourUrl?: string | null;
    videoUrl?: string | null;
    listingDate?: string | null;
    isFeatured?: boolean;
    isPublished?: boolean;
    marketingDescription?: string | null;
}

export interface UpdatePropertyDto {
    title?: string;
    description?: string | null;
    type?: number;
    address?: string;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    halfBathrooms?: number | null;
    landSize?: number | null;
    buildingSize?: number | null;
    yearBuilt?: number | null;
    price?: number;
    status?: number;
    ownerId?: string | null;
    listingAgentId?: string | null;
    features?: string[] | null;
    mainImageUrl?: string | null;
    images?: string[] | null;
    virtualTourUrl?: string | null;
    videoUrl?: string | null;
    listingDate?: string | null;
    isFeatured?: boolean;
    isPublished?: boolean;
    marketingDescription?: string | null;
}

export interface PropertyFilterDto {
    search?: string;
    type?: number;
    status?: number;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minLandSize?: number;
    maxLandSize?: number;
    minBuildingSize?: number;
    maxBuildingSize?: number;
    city?: string;
    state?: string;
    listingAgentId?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    listedFrom?: string;
    listedTo?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface PropertyStatsDto {
    totalProperties: number;
    active: number;
    pending: number;
    sold: number;
    rented: number;
    offMarket: number;
    averagePrice: number;
    totalValue: number;
    maxPrice: number;
    minPrice: number;
}

// ============================================================
// TRANSACTION TYPES
// ============================================================

export interface RealEstateTransaction {
    id: string;
    transactionNumber: string;
    propertyId: string;
    propertyTitle?: string;
    propertyAddress?: string;
    buyerId: string;
    buyerName?: string;
    sellerId: string;
    sellerName?: string;
    buyerAgentId?: string;
    buyerAgentName?: string;
    sellerAgentId?: string;
    sellerAgentName?: string;
    salePrice: number;
    depositAmount?: number;
    commissionAmount?: number;
    buyerCommission?: number;
    sellerCommission?: number;
    offerDate?: string;
    acceptanceDate?: string;
    closingDate?: string;
    possessionDate?: string;
    status: string;
    notes?: string;
    quoteId?: string;
    quoteNumber?: string;
    orderId?: string;
    orderNumber?: string;
    contractId?: string;
    contractNumber?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface RealEstateTransactionDto {
    id: string;
    transactionNumber: string;
    propertyId: string;
    propertyTitle?: string;
    propertyAddress?: string;
    buyerId: string;
    buyerName?: string;
    sellerId: string;
    sellerName?: string;
    buyerAgentId?: string;
    buyerAgentName?: string;
    sellerAgentId?: string;
    sellerAgentName?: string;
    salePrice: number;
    depositAmount?: number;
    commissionAmount?: number;
    buyerCommission?: number;
    sellerCommission?: number;
    offerDate?: string;
    acceptanceDate?: string;
    closingDate?: string;
    possessionDate?: string;
    status: string;
    notes?: string;
    quoteId?: string;
    quoteNumber?: string;
    orderId?: string;
    orderNumber?: string;
    contractId?: string;
    contractNumber?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTransactionDto {
    propertyId: string;
    buyerId: string;
    sellerId: string;
    buyerAgentId?: string | null;
    sellerAgentId?: string | null;
    salePrice: number;
    depositAmount?: number | null;
    commissionAmount?: number | null;
    status?: number;
    offerDate?: string | null;
    acceptanceDate?: string | null;
    closingDate?: string | null;
    possessionDate?: string | null;
    notes?: string | null;
}

export interface UpdateTransactionDto {
    salePrice?: number;
    depositAmount?: number | null;
    commissionAmount?: number | null;
    status?: number;
    offerDate?: string | null;
    acceptanceDate?: string | null;
    closingDate?: string | null;
    possessionDate?: string | null;
    notes?: string | null;
}

export interface TransactionStatsDto {
    totalTransactions: number;
    negotiation: number;
    accepted: number;
    pendingInspection: number;
    pendingFinancing: number;
    pendingAppraisal: number;
    closing: number;
    completed: number;
    cancelled: number;
    totalSalesValue: number;
    averageSalePrice: number;
    totalCommission: number;
}

// ============================================================
// COMMISSION TYPES
// ============================================================

export interface Commission {
    id: string;
    transactionId: string;
    transactionNumber?: string;
    agentId: string;
    agentName?: string;
    amount: number;
    percentage: number;
    status: string;
    paymentDate?: string;
    notes?: string;
    isBuyerAgent: boolean;
    isSellerAgent: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CommissionDto {
    id: string;
    transactionId: string;
    transactionNumber?: string;
    agentId: string;
    agentName?: string;
    amount: number;
    percentage: number;
    status: string;
    paymentDate?: string;
    notes?: string;
    isBuyerAgent: boolean;
    isSellerAgent: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCommissionDto {
    transactionId: string;
    agentId: string;
    amount: number;
    percentage: number;
    status?: number;
    notes?: string | null;
    isBuyerAgent?: boolean;
    isSellerAgent?: boolean;
}

export interface UpdateCommissionDto {
    amount?: number;
    percentage?: number;
    notes?: string | null;
    isBuyerAgent?: boolean;
    isSellerAgent?: boolean;
}

// ============================================================
// COMMON TYPES
// ============================================================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[] | null;
    statusCode: number;
    traceId?: string | null;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface CreateEmailCampaignDto {
    name: string;
    subject: string;
    content: string;
    templateId?: string;
    recipientListId: string;
    scheduledDate?: string;
    status?: string;
}

export interface UpdateEmailCampaignDto {
    name?: string;
    subject?: string;
    content?: string;
    templateId?: string;
    recipientListId?: string;
    scheduledDate?: string;
    status?: string;
}
// src/types/crm/crm.types.ts

export interface CreateSocialPostDto {
    content: string;
    platform: 'Facebook' | 'Twitter' | 'Instagram' | 'LinkedIn' | 'YouTube';
    status?: 'Draft' | 'Scheduled' | 'Published' | 'Failed' | 'Pending';
    scheduledDate?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    location?: string;
    hashtags?: string; // Comma-separated string
    campaignId?: string;
}

export interface SocialMediaPostResponse {
    id: string;
    content: string;
    platform: string;
    imageUrl: string | null;
    videoUrl: string | null;
    linkUrl: string | null;
    location: string | null;
    hashtags: string | null;
    status: string;
    scheduledDate: string | null;
    publishedDate: string | null;
    engagementCount: number;
    reachCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    postId: string | null;
    campaignId: string | null;
    createdAt: string;
    updatedAt: string;
}


export enum SocialMediaPlatform {
    Facebook = 'Facebook',
    Twitter = 'Twitter',
    Instagram = 'Instagram',
    LinkedIn = 'LinkedIn',
    YouTube = 'YouTube',
    TikTok = 'TikTok',
}

export enum PostStatus {
    Draft = 'Draft',
    Scheduled = 'Scheduled',
    Published = 'Published',
    Failed = 'Failed',
    Pending = 'Pending',
    Cancelled = 'Cancelled',
}

// ============================================================
// VIEW MODEL
// ============================================================

export interface SocialMediaPostViewModel {
    id: string;
    content: string;
    platform: SocialMediaPlatform;
    platformDisplay: string;
    platformIcon: string;
    status: PostStatus;
    statusDisplay: string;
    statusColor: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
    statusBadge: string;
    imageUrl: string | null;
    videoUrl: string | null;
    linkUrl: string | null;
    location: string | null;
    hashtags: string[];
    hashtagsDisplay: string;
    scheduledDate: string | null;
    scheduledDateDisplay: string | null;
    publishedDate: string | null;
    publishedDateDisplay: string | null;
    createdAt: string;
    createdAtDisplay: string;
    updatedAt: string | null;
    updatedAtDisplay: string | null;
    engagementCount: number;
    engagementDisplay: string;
    reachCount: number;
    reachDisplay: string;
    likeCount: number;
    likeDisplay: string;
    shareCount: number;
    shareDisplay: string;
    commentCount: number;
    commentDisplay: string;
    campaignId: string | null;
    campaignName: string | null;
    postId: string | null;
    authorId: string | null;
    authorName: string | null;
    isEditable: boolean;
    isDeletable: boolean;
    canPublish: boolean;
    canCancel: boolean;
    canSchedule: boolean;
    characterCount: number;
    characterLimit: number;
    isOverLimit: boolean;
    timeAgo: string;
    relativeTime: string;
}

// ============================================================
// DTOs
// ============================================================

export interface CreateSocialMediaPostDto {
    content: string;
    platform: SocialMediaPlatform | string;
    status?: PostStatus | string;
    scheduledDate?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    location?: string;
    hashtags?: string;
    campaignId?: string;
    mentions?: string[];
}

export interface UpdateSocialPostDto {
    content?: string;
    platform?: SocialMediaPlatform | string;
    status?: PostStatus | string;
    scheduledDate?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    location?: string;
    hashtags?: string;
    campaignId?: string;
}

export interface SocialMediaPostResponseDto {
    id: string;
    content: string;
    platform: string;
    imageUrl: string | null;
    videoUrl: string | null;
    linkUrl: string | null;
    location: string | null;
    hashtags: string | null;
    status: string;
    scheduledDate: string | null;
    publishedDate: string | null;
    engagementCount: number;
    reachCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    postId: string | null;
    campaignId: string | null;
    createdAt: string;
    updatedAt: string | null;
}