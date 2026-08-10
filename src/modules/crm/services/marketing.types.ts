// src/types/crm/marketing.types.ts

export interface CampaignStats {
    total: number;
    active: number;
    completed: number;
    draft: number;
    paused: number;
    cancelled: number;
    archived: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    totalLeads: number;
    totalRevenue: number;
    totalCost: number;
    roi: number;
}

export interface Campaign {
    id: string;
    name: string;
    description?: string;
    type: CampaignType;
    status: CampaignStatus;
    channel: string;
    targetAudience?: string;
    targetIndustry?: string;
    targetLocation?: string;
    budget?: number;
    actualCost?: number;
    expectedRevenue?: number;
    actualRevenue?: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt?: string;
    createdByUserId?: string;
    createdByUserName?: string;
    updatedByUserId?: string;
    updatedByUserName?: string;
    isDeleted: boolean;
    isActive: boolean;

    // Metrics
    targetCount: number;
    leadCount: number;
    reachCount: number;
    engagementCount: number;
    conversionCount: number;
    conversionRate?: number;
    engagementRate?: number;
    openRate?: number;
    clickRate?: number;

    // Content
    contentJson?: any;
    metricsJson?: any;
}

export enum CampaignType {
    Email = 'Email',
    SMS = 'SMS',
    SocialMedia = 'SocialMedia',
    Event = 'Event',
    Advertisement = 'Advertisement',
    Newsletter = 'Newsletter',
    Webinar = 'Webinar',
    DirectMail = 'DirectMail',
    PushNotification = 'PushNotification'
}

export enum CampaignStatus {
    Draft = 'Draft',
    Active = 'Active',
    Paused = 'Paused',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    Archived = 'Archived',
    Scheduled = 'Scheduled',
    Failed = 'Failed'
}

export interface CreateCampaignDto {
    name: string;
    description?: string;
    type: CampaignType;
    status: CampaignStatus;
    channel?: string;
    targetAudience?: string;
    targetIndustry?: string;
    targetLocation?: string;
    budget?: number;
    expectedRevenue?: number;
    startDate?: string;
    endDate?: string;
    targetCount?: number;
    contentJson?: any;
}

export interface UpdateCampaignDto {
    name?: string;
    description?: string;
    type?: CampaignType;
    status?: CampaignStatus;
    channel?: string;
    targetAudience?: string;
    targetIndustry?: string;
    targetLocation?: string;
    budget?: number;
    expectedRevenue?: number;
    startDate?: string;
    endDate?: string;
    targetCount?: number;
    contentJson?: any;
}

export interface CampaignAnalytics {
    id: string;
    name: string;
    totalReach: number;
    totalEngagement: number;
    totalConversions: number;
    conversionRate: number;
    engagementRate: number;
    roi: number;
    costPerLead: number;
    costPerConversion: number;
    dailyStats: DailyStat[];
    channelStats: ChannelStat[];
    timeline: TimelineEvent[];
}

export interface DailyStat {
    date: string;
    reach: number;
    engagement: number;
    conversions: number;
}

export interface ChannelStat {
    channel: string;
    reach: number;
    engagement: number;
    conversions: number;
}

export interface TimelineEvent {
    date: string;
    type: 'created' | 'started' | 'paused' | 'resumed' | 'completed' | 'cancelled' | 'milestone';
    description: string;
    metadata?: any;
}

// Email Campaign Specific
export interface EmailCampaign extends Campaign {
    subject: string;
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    templateId?: string;
    content: string;
    htmlContent?: string;
    plainTextContent?: string;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    opens: number;
    clicks: number;
    bounces: number;
    unsubscribes: number;
    opensByDevice: DeviceStats;
    clicksByDevice: DeviceStats;
    opensByLocation: LocationStats[];
}

export interface DeviceStats {
    desktop: number;
    mobile: number;
    tablet: number;
}

export interface LocationStats {
    country: string;
    city: string;
    count: number;
}

export interface CreateEmailCampaignDto extends CreateCampaignDto {
    subject: string;
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    templateId?: string;
    content: string;
    htmlContent?: string;
    plainTextContent?: string;
}

// SMS Campaign Specific
export interface SMSCampaign extends Campaign {
    message: string;
    senderId: string;
    deliveryRate: number;
    delivered: number;
    failed: number;
    conversionRate: number;
    sent: number;
}

export interface CreateSMSCampaignDto extends CreateCampaignDto {
    message: string;
    senderId: string;
}

// Campaign Template
export interface CampaignTemplate {
    id: string;
    name: string;
    description?: string;
    type: CampaignType;
    category?: string;
    content: string;
    htmlContent?: string;
    subject?: string;
    previewText?: string;
    createdAt: string;
    updatedAt?: string;
    createdByUserId?: string;
    createdByUserName?: string;
    isDefault: boolean;
    tags: string[];
    thumbnail?: string;
}

export interface CreateCampaignTemplateDto {
    name: string;
    description?: string;
    type: CampaignType;
    category?: string;
    content: string;
    htmlContent?: string;
    subject?: string;
    previewText?: string;
    tags?: string[];
    isDefault?: boolean;
}

// Campaign List
export interface CampaignListResponse {
    items: Campaign[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CampaignFilterDto {
    status?: CampaignStatus | string;
    type?: CampaignType | string;
    channel?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    assignedToUserId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Campaign Automation
export interface CampaignAutomation {
    id: string;
    name: string;
    description?: string;
    campaignId: string;
    triggerType: AutomationTriggerType;
    triggerConfig: any;
    actions: AutomationAction[];
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export enum AutomationTriggerType {
    LeadCreated = 'LeadCreated',
    LeadStatusChanged = 'LeadStatusChanged',
    LeadScoreChanged = 'LeadScoreChanged',
    CampaignStarted = 'CampaignStarted',
    CampaignCompleted = 'CampaignCompleted',
    EmailOpened = 'EmailOpened',
    EmailClicked = 'EmailClicked',
    SMSDelivered = 'SMSDelivered',
    SMSClicked = 'SMSClicked',
    CustomerCreated = 'CustomerCreated',
    CustomerUpdated = 'CustomerUpdated',
    DateBased = 'DateBased'
}

export interface AutomationAction {
    id: string;
    type: AutomationActionType;
    config: any;
    order: number;
}

export enum AutomationActionType {
    SendEmail = 'SendEmail',
    SendSMS = 'SendSMS',
    UpdateLead = 'UpdateLead',
    AssignLead = 'AssignLead',
    AddTag = 'AddTag',
    RemoveTag = 'RemoveTag',
    CreateTask = 'CreateTask',
    UpdateScore = 'UpdateScore',
    CreateNote = 'CreateNote',
    Wait = 'Wait',
    Condition = 'Condition'
}

// Campaign Insights
export interface CampaignInsights {
    topPerformingCampaigns: Campaign[];
    worstPerformingCampaigns: Campaign[];
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
    averageROI: number;
    trends: InsightTrend[];
    recommendations: string[];
}

export interface InsightTrend {
    period: string;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
}

// Campaign Segment
export interface CampaignSegment {
    id: string;
    name: string;
    description?: string;
    criteria: SegmentCriteria[];
    totalLeads: number;
    createdAt: string;
    updatedAt?: string;
}

export interface SegmentCriteria {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn';
    value: any;
    logic?: 'and' | 'or';
}