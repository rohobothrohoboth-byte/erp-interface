// src/services/crm/crm.api.ts

import axios from 'axios';
import { getAllAppUsers } from '../auth/account/account.api';
import type {
    // Leads
    LeadDto,
    CreateLeadDto,
    UpdateLeadDto,
    LeadFilterDto,
    LeadStatsDto,
    LeadBulkActionDto,
    // Customers
    CustomerDto,
    CreateCustomerDto,
    UpdateCustomerDto,
    CustomerFilterDto,
    // Contacts
    ContactDto,
    CreateContactDto,
    UpdateContactDto,
    // Opportunities
    OpportunityDto,
    CreateOpportunityDto,
    UpdateOpportunityDto,
    // Activities
    ActivityDto,
    CreateActivityDto,
    UpdateActivityDto,
    // Tasks
    TaskDto,
    CreateTaskDto,
    UpdateTaskDto,
    // Notes
    NoteDto,
    CreateNoteDto,
    UpdateNoteDto,
    // Campaigns
    CampaignDto,
    CreateCampaignDto,
    UpdateCampaignDto,
    CampaignStatsDto,
    // Custom Fields
    CustomFieldDefinitionDto,
    CreateCustomFieldDefinitionDto,
    UpdateCustomFieldDefinitionDto,
    // Routing
    RoutingRuleDto,
    CreateRoutingRuleDto,
    UpdateRoutingRuleDto,
    RoutingStatsDto,
    // Scoring
    ScoreRuleDto,
    CreateScoreRuleDto,
    UpdateScoreRuleDto,
    ScoreResultDto,
    // Employees
    EmployeeDto,
    EmployeeAssignmentDto,
    // API Response
    ApiResponse,
    CompanyDto,
    UpdateCompanyDto,
    InteractionDto,
    CreateInteractionDto,
    FeedbackDto,
    CreateFeedbackDto,
    ArticleDto,
    UpdateArticleDto,
    TicketStatsDto,
    UpdateTicketDto,
    CreateCompanyDto,
    CreateArticleDto,
    CreateTicketDto,
    TicketDto,
    UpdateInteractionDto,
    InteractionFilterDto,
    QuoteDto,
    CreateQuoteDto,
    UpdateQuoteDto,
    QuoteLineDto,
    // Orders
    OrderDto,
    CreateOrderDto,
    UpdateOrderDto,
    OrderLineDto,
    // Contracts
    ContractDto,
    CreateContractDto,
    UpdateContractDto,
    // Sales Forecast
    SalesForecastDto,
    SalesPipelineDto,
    SalesPerformanceDto,
    OrderDto,OrderStatsDto,
    ContractStatsDto,ForecastData,SalesForecastData,
    Property,
    PropertyDto,
    CreatePropertyDto,
    UpdatePropertyDto,
    PropertyFilterDto,
    PropertyStatsDto,
    // Transaction Types
    RealEstateTransaction,
    RealEstateTransactionDto,
    CreateTransactionDto,
    UpdateTransactionDto,
    TransactionStatsDto,
    // Commission Types
    Commission,
    CommissionDto,
    CreateCommissionDto,
    UpdateCommissionDto,CreateEmailCampaignDto,UpdateEmailCampaignDto,TaskStatsResponse,
} from '../../types/crm/crm.types';

const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:1212';
const CRM_PATH = '/crm/v1.0';

export const crmApi = axios.create({
    baseURL: `${API_BASE}${CRM_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
crmApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for error handling
crmApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================================
// LEADS
// ============================================================

/**
 * Get all leads with optional filters
 */
export const getLeads = (params?: LeadFilterDto) => {
    return crmApi.get<ApiResponse<LeadDto[]>>('/Lead/AllLeads', { params });
};

/**
 * Get a single lead by ID
 */
export const getLeadById = (id: string) => {
    return crmApi.get<ApiResponse<LeadDto>>(`/Lead/GetLead/${id}`);
};

/**
 * Create a new lead
 */
export const createLead = (data: CreateLeadDto) => {
    return crmApi.post<ApiResponse<LeadDto>>('/Lead/AddLead', data);
};

/**
 * Update an existing lead
 */
export const updateLead = (id: string, data: UpdateLeadDto) => {
    const payload = {
        ...data,
        id: id,
    };
    return crmApi.put<ApiResponse<LeadDto>>(`/Lead/ModLead/${id}`, payload);
};

/**
 * Delete a lead (soft delete)
 */
export const deleteLead = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Lead/DelLead/${id}`);
};

/**
 * Convert a lead to customer
 */
export const convertLeadToCustomer = (id: string, data?: any) => {
    return crmApi.post<ApiResponse<CustomerDto>>(`/Lead/ConvertLead/${id}`, data || {});
};

/**
 * Assign a lead to a user
 */
export const assignLead = (id: string, userId: string) => {
    return crmApi.post<ApiResponse<LeadDto>>(`/Lead/AssignLead/${id}`, userId, {
        headers: { 'Content-Type': 'application/json' },
    });
};

/**
 * Bulk action on leads
 */
export const bulkLeadAction = (data: LeadBulkActionDto) => {
    return crmApi.post<ApiResponse<boolean>>('/Lead/BulkAction', data);
};

/**
 * Bulk assign leads to a user
 */
export const bulkAssignLeads = (leadIds: string[], userId: string) => {
    return crmApi.post<ApiResponse<boolean>>('/Lead/BulkAssign', { leadIds, userId });
};

/**
 * Get lead statistics
 */
export const getLeadStats = () => {
    return crmApi.get<ApiResponse<LeadStatsDto>>('/Lead/Stats');
};

/**
 * Get leads by status
 */
export const getLeadsByStatus = (status: string) => {
    return crmApi.get<ApiResponse<LeadDto[]>>(`/Lead/ByStatus/${status}`);
};

/**
 * Get leads assigned to a specific user
 */
export const getLeadsByAssignedUser = (userId: string) => {
    return crmApi.get<ApiResponse<LeadDto[]>>(`/Lead/ByAssignedUser/${userId}`);
};

/**
 * Get leads for routing (unassigned high priority leads)
 */
export const getLeadsForRouting = () => {
    return crmApi.get<ApiResponse<LeadDto[]>>('/Lead/ForRouting');
};

/**
 * Get total lead count
 */
export const getLeadCount = (status?: string) => {
    return crmApi.get<ApiResponse<number>>('/Lead/Count', {
        params: status ? { status } : undefined,
    });
};

/**
 * Export leads
 */
export const exportLeads = (params?: LeadFilterDto) => {
    return crmApi.get('/Lead/Export', {
        params,
        responseType: 'blob' as const,
    });
};

/**
 * Import leads
 */
export const importLeads = (data: FormData) => {
    return crmApi.post<ApiResponse<LeadDto[]>>('/Lead/Import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ============================================================
// EMPLOYEES
// ============================================================



// ============================================================
// CUSTOMERS
// ============================================================

/**
 * Get all customers with optional filters
 */
export const getCustomers = (params?: CustomerFilterDto) => {
    return crmApi.get<ApiResponse<CustomerDto[]>>('/Customer/AllCustomers', { params });
};

/**
 * Get a single customer by ID
 */
export const getCustomerById = (id: string) => {
    return crmApi.get<ApiResponse<CustomerDto>>(`/Customer/GetCustomer/${id}`);
};

/**
 * Create a new customer
 */
export const createCustomer = (data: CreateCustomerDto) => {
    return crmApi.post<ApiResponse<CustomerDto>>('/Customer/AddCustomer', data);
};

/**
 * Update an existing customer
 */
export const updateCustomer = (id: string, data: UpdateCustomerDto) => {
    return crmApi.put<ApiResponse<CustomerDto>>(`/Customer/ModCustomer/${id}`, data);
};

/**
 * Delete a customer
 */
export const deleteCustomer = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Customer/DelCustomer/${id}`);
};

// ============================================================
// CONTACTS
// ============================================================

/**
 * Get all contacts with optional filters
 */
export const getContacts = (params?: { customerId?: string; search?: string }) => {
    return crmApi.get<ApiResponse<ContactDto[]>>('/Contact/AllContacts', { params });
};

/**
 * Get a single contact by ID
 */
export const getContactById = (id: string) => {
    return crmApi.get<ApiResponse<ContactDto>>(`/Contact/GetContact/${id}`);
};

/**
 * Create a new contact
 */
export const createContact = (data: CreateContactDto) => {
    return crmApi.post<ApiResponse<ContactDto>>('/Contact/AddContact', data);
};

/**
 * Update an existing contact
 */
export const updateContact = (id: string, data: UpdateContactDto) => {
    return crmApi.put<ApiResponse<ContactDto>>(`/Contact/ModContact/${id}`, data);
};

/**
 * Delete a contact
 */
export const deleteContact = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Contact/DelContact/${id}`);
};

// ============================================================
// OPPORTUNITIES
// ============================================================

export const getOpportunities = (params?: {
    stage?: string;
    customerId?: string;
    leadId?: string;
    assignedToUserId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}) => {
    return crmApi.get<ApiResponse<OpportunityDto[]>>('/Opportunity', { params });
};

export const getOpportunityById = (id: string) => {
    return crmApi.get<ApiResponse<OpportunityDto>>(`/Opportunity/${id}`);
};

export const createOpportunity = (data: CreateOpportunityDto) => {
    return crmApi.post<ApiResponse<OpportunityDto>>('/Opportunity', data);
};

export const updateOpportunity = (id: string, data: UpdateOpportunityDto) => {
    return crmApi.put<ApiResponse<OpportunityDto>>(`/Opportunity/${id}`, data);
};

export const deleteOpportunity = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Opportunity/${id}`);
};

// ============================================================
// ACTIVITIES
// ============================================================

// ============================================================
// ACTIVITIES
// ============================================================

export const getActivities = (params?: {
    type?: string;
    status?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}) => {
    // ✅ Use the correct route - GET /Activity (not /Activity/AllActivities)
    return crmApi.get<ApiResponse<ActivityDto[]>>('/Activity', { params });
};

export const getActivityById = (id: string) => {
    // ✅ Use the correct route - GET /Activity/{id} (not /Activity/GetActivity/{id})
    return crmApi.get<ApiResponse<ActivityDto>>(`/Activity/${id}`);
};

export const createActivity = (data: CreateActivityDto) => {
    // ✅ Use the correct route - POST /Activity (not /Activity/AddActivity)
    return crmApi.post<ApiResponse<ActivityDto>>('/Activity', data);
};

export const updateActivity = (id: string, data: UpdateActivityDto) => {
    // ✅ Use the correct route - PUT /Activity/{id} (not /Activity/ModActivity/{id})
    return crmApi.put<ApiResponse<ActivityDto>>(`/Activity/${id}`, data);
};

export const deleteActivity = (id: string) => {
    // ✅ Use the correct route - DELETE /Activity/{id} (not /Activity/DelActivity/{id})
    return crmApi.delete<ApiResponse<void>>(`/Activity/${id}`);
};

export const completeActivity = (id: string) => {
    // ✅ Use the correct route - POST /Activity/{id}/complete
    return crmApi.post<ApiResponse<ActivityDto>>(`/Activity/${id}/complete`);
};

export const updateActivityStatus = (id: string, status: string) => {
    // ✅ Use the correct route - PATCH /Activity/{id}/status
    return crmApi.patch<ApiResponse<ActivityDto>>(`/Activity/${id}/status`, { status });
};

export const getActivityStats = () => {
    // ✅ Use the correct route - GET /Activity/stats
    return crmApi.get<ApiResponse<ActivityStatsResponse>>('/Activity/stats');
};

// ============================================================
// TASKS
// ============================================================

export const getTasks = (params?: {
    status?: string;
    priority?: string;
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    assignedToUserId?: string;
    dueDate?: string;
    page?: number;
    pageSize?: number;
}) => {
    // ✅ Use the correct route - GET /Task (not /Task/AllTasks)
    return crmApi.get<ApiResponse<TaskDto[]>>('/Task', { params });
};

export const getTaskById = (id: string) => {
    // ✅ Use the correct route - GET /Task/{id} (not /Task/GetTask/{id})
    return crmApi.get<ApiResponse<TaskDto>>(`/Task/${id}`);
};

export const createTask = (data: CreateTaskDto) => {
    // ✅ Use the correct route - POST /Task (not /Task/AddTask)
    return crmApi.post<ApiResponse<TaskDto>>('/Task', data);
};

export const updateTask = (id: string, data: UpdateTaskDto) => {
    // ✅ Use the correct route - PUT /Task/{id} (not /Task/ModTask/{id})
    return crmApi.put<ApiResponse<TaskDto>>(`/Task/${id}`, data);
};

export const deleteTask = (id: string) => {
    // ✅ Use the correct route - DELETE /Task/{id} (not /Task/DelTask/{id})
    return crmApi.delete<ApiResponse<void>>(`/Task/${id}`);
};

export const completeTask = (id: string) => {
    // ✅ Use the correct route - POST /Task/{id}/complete
    return crmApi.post<ApiResponse<TaskDto>>(`/Task/${id}/complete`);
};

export const updateTaskStatus = (id: string, status: string) => {
    // ✅ Use the correct route - PATCH /Task/{id}/status
    return crmApi.patch<ApiResponse<TaskDto>>(`/Task/${id}/status`, { status });
};

export const getTaskStats = () => {
    // ✅ Use the correct route - GET /Task/stats
    return crmApi.get<ApiResponse<TaskStatsResponse>>('/Task/stats');
};

// ============================================================
// NOTES
// ============================================================

export const getNotes = (params?: {
    leadId?: string;
    customerId?: string;
    opportunityId?: string;
    createdByUserId?: string;
    page?: number;
    pageSize?: number;
}) => {
    return crmApi.get<ApiResponse<NoteDto[]>>('/Note/AllNotes', { params });
};

export const getNoteById = (id: string) => {
    return crmApi.get<ApiResponse<NoteDto>>(`/Note/GetNote/${id}`);
};

export const createNote = (data: CreateNoteDto) => {
    return crmApi.post<ApiResponse<NoteDto>>('/Note/AddNote', data);
};

export const updateNote = (id: string, data: UpdateNoteDto) => {
    return crmApi.put<ApiResponse<NoteDto>>(`/Note/ModNote/${id}`, data);
};

export const deleteNote = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Note/DelNote/${id}`);
};

// ============================================================
// CAMPAIGNS
// ============================================================

/**
 * Get all campaigns with optional filters
 */
export const getCampaigns = (params?: { status?: string; type?: string; search?: string }) => {
    return crmApi.get<ApiResponse<CampaignDto[]>>('/Campaign/AllCampaigns', { params });
};

/**
 * Get a single campaign by ID
 */
export const getCampaignById = (id: string) => {
    return crmApi.get<ApiResponse<CampaignDto>>(`/Campaign/GetCampaign/${id}`);
};

/**
 * Create a new campaign
 */
export const createCampaign = (data: CreateCampaignDto) => {
    return crmApi.post<ApiResponse<CampaignDto>>('/Campaign/AddCampaign', data);
};

/**
 * Update an existing campaign
 */
export const updateCampaign = (id: string, data: UpdateCampaignDto) => {
    return crmApi.put<ApiResponse<CampaignDto>>(`/Campaign/ModCampaign/${id}`, data);
};

/**
 * Delete a campaign
 */
export const deleteCampaign = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Campaign/DelCampaign/${id}`);
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = () => {
    return crmApi.get<ApiResponse<CampaignStatsDto>>('/Campaign/Stats');
};

/**
 * Add leads to a campaign
 */
export const addLeadsToCampaign = (campaignId: string, leadIds: string[]) => {
    return crmApi.post<ApiResponse<void>>(`/Campaign/${campaignId}/AddLeads`, leadIds);
};

/**
 * Get leads in a campaign
 */
export const getCampaignLeads = (campaignId: string) => {
    return crmApi.get<ApiResponse<LeadDto[]>>(`/Campaign/${campaignId}/Leads`);
};

// ============================================================
// CAMPAIGN ACTIONS
// ============================================================

/**
 * Duplicate a campaign
 */
export const duplicateCampaign = (id: string) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/${id}/Duplicate`);
};

/**
 * Pause a campaign
 */
export const pauseCampaign = (id: string) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/${id}/Pause`);
};

/**
 * Resume a campaign
 */
export const resumeCampaign = (id: string) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/${id}/Resume`);
};

/**
 * Archive a campaign
 */
export const archiveCampaign = (id: string) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/${id}/Archive`);
};

/**
 * Cancel a campaign
 */
export const cancelCampaign = (id: string) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/${id}/Cancel`);
};

/**
 * Start a campaign
 */
export const startCampaign = (id: string) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/${id}/Start`);
};

/**
 * Get campaign analytics
 */
export const getCampaignAnalytics = (id: string, params?: { fromDate?: string; toDate?: string }) => {
    return crmApi.get<ApiResponse<any>>(`/Campaign/${id}/Analytics`, { params });
};

/**
 * Get campaign performance
 */
export const getCampaignPerformance = (id: string) => {
    return crmApi.get<ApiResponse<any>>(`/Campaign/${id}/Performance`);
};

/**
 * Get campaign ROI
 */
export const getCampaignROI = (id: string) => {
    return crmApi.get<ApiResponse<{ roi: number; invested: number; revenue: number }>>(`/Campaign/${id}/ROI`);
};

/**
 * Export campaign data
 */
export const exportCampaignData = (id: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    return crmApi.get(`/Campaign/${id}/Export`, {
        params: { format },
        responseType: 'blob' as const,
    });
};

/**
 * Get campaign templates
 */
export const getCampaignTemplates = (params?: { type?: string }) => {
    return crmApi.get<ApiResponse<any[]>>('/Campaign/Templates', { params });
};

/**
 * Create campaign from template
 */
export const createCampaignFromTemplate = (templateId: string, data: Partial<CreateCampaignDto>) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/Template/${templateId}`, data);
};

/**
 * Send test campaign
 */
export const sendTestCampaign = (id: string, emails: string[]) => {
    return crmApi.post<ApiResponse<boolean>>(`/Campaign/${id}/Test`, { emails });
};

/**
 * Schedule campaign
 */
export const scheduleCampaign = (id: string, scheduleDate: string) => {
    return crmApi.post<ApiResponse<CampaignDto>>(`/Campaign/${id}/Schedule`, { scheduleDate });
};

// ============================================================
// LEAD ROUTING
// ============================================================

/**
 * Get all routing rules
 */
export const getRoutingRules = async (): Promise<RoutingRuleDto[]> => {
    try {
        const response = await crmApi.get<ApiResponse<RoutingRuleDto[]>>('/Routing/Rules');
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching routing rules:', error);
        return [];
    }
};

/**
 * Get routing rule by ID
 */
export const getRoutingRuleById = async (id: string): Promise<RoutingRuleDto | null> => {
    try {
        const response = await crmApi.get<ApiResponse<RoutingRuleDto>>(`/Routing/Rule/${id}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('Error fetching routing rule:', error);
        return null;
    }
};

/**
 * Create a routing rule
 */
export const createRoutingRule = async (data: CreateRoutingRuleDto): Promise<RoutingRuleDto> => {
    const response = await crmApi.post<ApiResponse<RoutingRuleDto>>('/Routing/Rule', data);
    return response.data?.data;
};

/**
 * Update a routing rule
 */
export const updateRoutingRule = async (id: string, data: UpdateRoutingRuleDto): Promise<RoutingRuleDto> => {
    const response = await crmApi.put<ApiResponse<RoutingRuleDto>>(`/Routing/Rule/${id}`, data);
    return response.data?.data;
};

/**
 * Delete a routing rule
 */
export const deleteRoutingRule = async (id: string): Promise<void> => {
    await crmApi.delete(`/Routing/Rule/${id}`);
};

/**
 * Get routing statistics
 */
export const getRoutingStats = async (): Promise<RoutingStatsDto> => {
    try {
        const response = await crmApi.get<ApiResponse<RoutingStatsDto>>('/Routing/Stats');
        return response.data?.data || {
            totalRules: 0,
            activeRules: 0,
            totalRouted: 0,
            pendingRouting: 0,
            avgResponseTime: 0,
            rulesByType: {},
            rulesByStatus: {}
        };
    } catch (error) {
        console.error('Error fetching routing stats:', error);
        return {
            totalRules: 0,
            activeRules: 0,
            totalRouted: 0,
            pendingRouting: 0,
            avgResponseTime: 0,
            rulesByType: {},
            rulesByStatus: {}
        };
    }
};

// ============================================================
// LEAD SCORING
// ============================================================

/**
 * Get all score rules
 */
export const getScoreRules = async (): Promise<ScoreRuleDto[]> => {
    try {
        const response = await crmApi.get<ApiResponse<ScoreRuleDto[]>>('/Scoring/Rules');
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching score rules:', error);
        return [];
    }
};

/**
 * Get score rule by ID
 */
export const getScoreRuleById = async (id: string): Promise<ScoreRuleDto | null> => {
    try {
        const response = await crmApi.get<ApiResponse<ScoreRuleDto>>(`/Scoring/Rule/${id}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('Error fetching score rule:', error);
        return null;
    }
};

/**
 * Create a score rule
 */
export const createScoreRule = async (data: CreateScoreRuleDto): Promise<ScoreRuleDto> => {
    const response = await crmApi.post<ApiResponse<ScoreRuleDto>>('/Scoring/Rule', data);
    return response.data?.data;
};

/**
 * Update a score rule
 */
export const updateScoreRule = async (id: string, data: UpdateScoreRuleDto): Promise<ScoreRuleDto> => {
    const response = await crmApi.put<ApiResponse<ScoreRuleDto>>(`/Scoring/Rule/${id}`, data);
    return response.data?.data;
};

/**
 * Delete a score rule
 */
export const deleteScoreRule = async (id: string): Promise<void> => {
    await crmApi.delete(`/Scoring/Rule/${id}`);
};

/**
 * Calculate score for a lead
 */
export const calculateLeadScore = async (leadId: string): Promise<ScoreResultDto> => {
    try {
        const response = await crmApi.post<ApiResponse<ScoreResultDto>>(`/Scoring/Calculate/${leadId}`);
        return response.data?.data || {
            leadId: leadId,
            totalScore: 0,
            breakdown: []
        };
    } catch (error) {
        console.error('Error calculating lead score:', error);
        throw error;
    }
};

// ============================================================
// CUSTOM FIELDS
// ============================================================

/**
 * Get all custom field definitions
 */
export const getCustomFieldDefinitions = (params?: { entityType?: string }) => {
    return crmApi.get<ApiResponse<CustomFieldDefinitionDto[]>>('/CustomField/Definitions', { params });
};

/**
 * Get a single custom field definition by ID
 */
export const getCustomFieldDefinitionById = (id: string) => {
    return crmApi.get<ApiResponse<CustomFieldDefinitionDto>>(`/CustomField/Definition/${id}`);
};

/**
 * Create a new custom field definition
 */
export const createCustomFieldDefinition = (data: CreateCustomFieldDefinitionDto) => {
    return crmApi.post<ApiResponse<CustomFieldDefinitionDto>>('/CustomField/Definition', data);
};

/**
 * Update an existing custom field definition
 */
export const updateCustomFieldDefinition = (id: string, data: UpdateCustomFieldDefinitionDto) => {
    return crmApi.put<ApiResponse<CustomFieldDefinitionDto>>(`/CustomField/Definition/${id}`, data);
};

/**
 * Delete a custom field definition
 */
export const deleteCustomFieldDefinition = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/CustomField/Definition/${id}`);
};

// ============================================================
// DASHBOARD
// ============================================================

export const getDashboard = (params?: {
    period?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return crmApi.get<ApiResponse<any>>('/Dashboard/GetDashboard', { params });
};



// ============================================================
// CUSTOMER SUPPORT / TICKETS
// ============================================================

/**
 * Get all tickets with optional filters
 */
export const getTickets = (params?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    customerId?: string;
    page?: number;
    pageSize?: number;
}) => {
    return crmApi.get<ApiResponse<TicketDto[]>>('/Support/Tickets', { params });
};

/**
 * Get a single ticket by ID
 */
export const getTicketById = (id: string) => {
    return crmApi.get<ApiResponse<TicketDto>>(`/Support/Ticket/${id}`);
};

/**
 * Create a new ticket
 */
export const createTicket = (data: CreateTicketDto) => {
    return crmApi.post<ApiResponse<TicketDto>>('/Support/Ticket', data);
};

/**
 * Update an existing ticket
 */
export const updateTicket = (id: string, data: UpdateTicketDto) => {
    return crmApi.put<ApiResponse<TicketDto>>(`/Support/Ticket/${id}`, data);
};

/**
 * Delete a ticket
 */
export const deleteTicket = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Support/Ticket/${id}`);
};

/**
 * Get ticket statistics
 */
export const getTicketStats = () => {
    return crmApi.get<ApiResponse<TicketStatsDto>>('/Support/Stats');
};

// ============================================================
// KNOWLEDGE BASE
// ============================================================

/**
 * Get all knowledge base articles
 */
export const getArticles = (params?: {
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}) => {
    return crmApi.get<ApiResponse<ArticleDto[]>>('/KnowledgeBase/Articles', { params });
};

/**
 * Get a single article by ID
 */
export const getArticleById = (id: string) => {
    return crmApi.get<ApiResponse<ArticleDto>>(`/KnowledgeBase/Article/${id}`);
};

/**
 * Create a new article
 */
export const createArticle = (data: CreateArticleDto) => {
    return crmApi.post<ApiResponse<ArticleDto>>('/KnowledgeBase/Article', data);
};

/**
 * Update an existing article
 */
export const updateArticle = (id: string, data: UpdateArticleDto) => {
    return crmApi.put<ApiResponse<ArticleDto>>(`/KnowledgeBase/Article/${id}`, data);
};

/**
 * Delete an article
 */
export const deleteArticle = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/KnowledgeBase/Article/${id}`);
};

// ============================================================
// CUSTOMER FEEDBACK
// ============================================================

/**
 * Get all feedback
 */
export const getFeedback = (params?: {
    rating?: string;
    status?: string;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}) => {
    return crmApi.get<ApiResponse<FeedbackDto[]>>('/Feedback', { params });
};

/**
 * Create feedback
 */
export const createFeedback = (data: CreateFeedbackDto) => {
    return crmApi.post<ApiResponse<FeedbackDto>>('/Feedback', data);
};

// ============================================================
// COMPANIES
// ============================================================

/**
 * Get all companies with optional filters
 * Matches CompanyController.GetAll route: /Company
 */
export const getCompanies = (params?: {
    search?: string;
    industry?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
}) => {
    return crmApi.get<ApiResponse<CompanyDto[]>>('/Company', { params });
};

/**
 * Get a single company by ID
 * Matches CompanyController.GetById route: /Company/{id}
 */
export const getCompanyById = (id: string) => {
    return crmApi.get<ApiResponse<CompanyDto>>(`/Company/${id}`);
};

/**
 * Create a new company
 * Matches CompanyController.Create route: /Company
 */
export const createCompany = (data: CreateCompanyDto) => {
    return crmApi.post<ApiResponse<CompanyDto>>('/Company', data);
};

/**
 * Update an existing company
 * Matches CompanyController.Update route: /Company/{id}
 */
export const updateCompany = (id: string, data: UpdateCompanyDto) => {
    return crmApi.put<ApiResponse<CompanyDto>>(`/Company/${id}`, data);
};

/**
 * Delete a company
 * Matches CompanyController.Delete route: /Company/{id}
 */
export const deleteCompany = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Company/${id}`);
};

/**
 * Get company statistics
 * Matches CompanyController.GetStats route: /Company/stats
 */
export const getCompanyStats = () => {
    return crmApi.get<ApiResponse<{
        total: number;
        byIndustry: Record<string, number>;
        byStatus: Record<string, number>;
        recent: CompanyDto[];
    }>>('/Company/stats');
};

// ============================================================
// INTERACTIONS
// ============================================================

/**
 * Get all interactions with optional filters
 * Matches InteractionController.GetAll route: /Interaction
 */
export const getInteractions = (params?: InteractionFilterDto) => {
    return crmApi.get<ApiResponse<InteractionDto[]>>('/Interaction', { params });
};

/**
 * Get a single interaction by ID
 * Matches InteractionController.GetById route: /Interaction/{id}
 */
export const getInteractionById = (id: string) => {
    return crmApi.get<ApiResponse<InteractionDto>>(`/Interaction/${id}`);
};

/**
 * Create a new interaction
 * Matches InteractionController.Create route: /Interaction
 */
export const createInteraction = (data: CreateInteractionDto) => {
    return crmApi.post<ApiResponse<InteractionDto>>('/Interaction', data);
};

/**
 * Update an existing interaction
 * Matches InteractionController.Update route: /Interaction/{id}
 */
export const updateInteraction = (id: string, data: UpdateInteractionDto) => {
    return crmApi.put<ApiResponse<InteractionDto>>(`/Interaction/${id}`, data);
};

/**
 * Delete an interaction
 * Matches InteractionController.Delete route: /Interaction/{id}
 */
export const deleteInteraction = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Interaction/${id}`);
};

/**
 * Get interactions by lead ID
 */
export const getInteractionsByLead = (leadId: string) => {
    return crmApi.get<ApiResponse<InteractionDto[]>>(`/Interaction/Lead/${leadId}`);
};

/**
 * Get interactions by customer ID
 */
export const getInteractionsByCustomer = (customerId: string) => {
    return crmApi.get<ApiResponse<InteractionDto[]>>(`/Interaction/Customer/${customerId}`);
};

/**
 * Get interactions by contact ID
 */
export const getInteractionsByContact = (contactId: string) => {
    return crmApi.get<ApiResponse<InteractionDto[]>>(`/Interaction/Contact/${contactId}`);
};

/**
 * Get interactions by opportunity ID
 */
export const getInteractionsByOpportunity = (opportunityId: string) => {
    return crmApi.get<ApiResponse<InteractionDto[]>>(`/Interaction/Opportunity/${opportunityId}`);
};

/**
 * Get interaction statistics
 * Matches InteractionController.GetStats route: /Interaction/stats
 */
export const getInteractionStats = () => {
    return crmApi.get<ApiResponse<{
        total: number;
        completed: number;
        pending: number;
        cancelled: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
    }>>('/Interaction/stats');
};
// src/services/crm/crm.api.ts - Replace the EMPLOYEES section

// ============================================================
// EMPLOYEES
// ============================================================

/**
 * Get employees available for assignment
 * Uses the AllEmployees endpoint which should work
 */
export const getEmployeesForAssignment = async (): Promise<EmployeeAssignmentDto[]> => {
    try {
        // Use AllEmployees endpoint instead of ForAssignment
        const response = await crmApi.get<ApiResponse<any[]>>('/Employee/AllEmployees');
        const employees = response.data?.data || [];

        // Transform to EmployeeAssignmentDto format
        return employees.map(emp => ({
            appUserId: emp.appUserId || emp.id,
            fullName: `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim() || emp.code || 'Unknown',
            code: emp.code || '',
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
        }));
    } catch (error) {
        console.error('Error fetching employees for assignment:', error);
        return [];
    }
};

/**
 * Get all employees
 */
export const getAllEmployees = async (): Promise<EmployeeDto[]> => {
    try {
        const response = await crmApi.get<ApiResponse<EmployeeDto[]>>('/Employee/AllEmployees');
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching all employees:', error);
        return [];
    }
};

/**
 * Get employee by AppUser ID
 */
export const getEmployeeByAppUser = async (appUserId: string): Promise<EmployeeDto | null> => {
    try {
        const response = await crmApi.get<ApiResponse<EmployeeDto>>(`/Employee/ByAppUser/${appUserId}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('Error fetching employee by AppUser:', error);
        return null;
    }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id: string): Promise<EmployeeDto | null> => {
    try {
        const response = await crmApi.get<ApiResponse<EmployeeDto>>(`/Employee/GetEmployee/${id}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        return null;
    }
};

/**
 * Get employee with full name
 */
export const getEmployeeWithName = async (appUserId: string) => {
    try {
        const response = await crmApi.get<ApiResponse<EmployeeDto>>(`/Employee/ByAppUser/${appUserId}`);
        const data = response.data?.data || response.data;
        if (data) {
            const fullName = `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim();
            return {
                ...data,
                fullName: fullName || data.code || 'User'
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching employee with name:', error);
        return null;
    }
};

// src/services/crm/crm.api.ts - Add these sections after the INTERACTIONS section

// ============================================================
// QUOTES
// ============================================================

/**
 * Get all quotes with optional filters
 */
export const getQuotes = (params?: {
    status?: string;
    customerId?: string;
    leadId?: string;
    opportunityId?: string;
    fromDate?: string;
    toDate?: string;
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}) => {
    return crmApi.get<ApiResponse<QuoteDto[]>>('/Quote', { params });
};

/**
 * Get a single quote by ID
 */
export const getQuoteById = async (id: string): Promise<QuoteDto> => {
    try {
        const response = await crmApi.get<ApiResponse<QuoteDto>>(`/Quote/${id}`);
        console.log('Quote by ID response:', response);

        // Return the data from the response
        if (response.data?.data) {
            return response.data.data;
        }

        // Fallback: if the response is the data directly
        return response.data as unknown as QuoteDto;
    } catch (error) {
        console.error('Error fetching quote by ID:', error);
        throw error;
    }
};

/**
 * Create a new quote
 */
// src/services/crm/crm.api.ts

/**
 * Create a new quote
 */
export const createQuote = (data: any) => {
    // ✅ Ensure the payload matches what the backend expects
    const payload = {
        customerId: data.customerId,
        leadId: data.leadId || null,
        opportunityId: data.opportunityId || null,
        validUntil: data.validUntil || null,
        termsAndConditions: data.termsAndConditions || '',
        notes: data.notes || '',
        shippingCost: data.shippingCost || 0,
        discountAmount: data.discountAmount || 0,
        quoteLines: data.quoteLines?.map((line: any) => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount || 0,
            taxRate: line.taxRate || 10,
            productId: line.productId || null,
            notes: line.notes || ''
        })) || []
    };

    console.log('Creating quote with payload:', payload);
    return crmApi.post<ApiResponse<QuoteDto>>('/Quote', payload);
};

/**
 * Update an existing quote
 */
export const updateQuote = (id: string, data: UpdateQuoteDto) => {
    return crmApi.put<ApiResponse<QuoteDto>>(`/Quote/${id}`, data);
};

/**
 * Delete a quote
 */
export const deleteQuote = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Quote/${id}`);
};

/**
 * Send a quote to customer
 */
export const sendQuote = (id: string, data?: { email?: string; message?: string }) => {
    return crmApi.post<ApiResponse<QuoteDto>>(`/Quote/${id}/Send`, data || {});
};

/**
 * Accept a quote
 */
export const acceptQuote = (id: string) => {
    return crmApi.post<ApiResponse<QuoteDto>>(`/Quote/${id}/Accept`);
};

/**
 * Reject a quote
 */
export const rejectQuote = (id: string, data?: { reason?: string }) => {
    return crmApi.post<ApiResponse<QuoteDto>>(`/Quote/${id}/Reject`, data || {});
};

/**
 * Download quote as PDF
 */
export const downloadQuotePDF = (id: string) => {
    return crmApi.get(`/Quote/${id}/Download`, {
        responseType: 'blob' as const,
    });
};

/**
 * Get quote statistics
 */
export const getQuoteStats = () => {
    return crmApi.get<ApiResponse<{
        total: number;
        draft: number;
        sent: number;
        accepted: number;
        rejected: number;
        expired: number;
        totalValue: number;
        acceptedValue: number;
        conversionRate: number;
    }>>('/Quote/stats');
};

// ============================================================
// ORDERS / SALES ORDERS
// ============================================================

/**
 * Get all orders with optional filters
 */


/**
 * Get a single order by ID
 */








// src/services/crm/crm.api.ts

// ============================================================
// ORDERS / SALES ORDERS - COMPLETE
// ============================================================

/**
 * Get all orders with optional filters
 */
export const getOrders = (params?: {
    status?: string;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}) => {
    return crmApi.get<ApiResponse<OrderDto[]>>('/SalesOrder', { params });
};

/**
 * Get a single order by ID
 */
export const getOrderById = (id: string) => {
    return crmApi.get<ApiResponse<OrderDto>>(`/SalesOrder/${id}`);
};

/**
 * Create a new order
 */
// src/services/crm/crm.api.ts

export const createOrder = async (data: any) => {
    try {
        console.log('API - Creating order with data:', JSON.stringify(data, null, 2));
        const response = await crmApi.post('/SalesOrder', data);
        console.log('API - Order created:', response.data);
        return response.data;
    } catch (error) {
        console.error('API - Error creating order:', error);
        throw error;
    }
};

/**
 * Update an existing order
 */
export const updateOrder = (id: string, data: UpdateOrderDto) => {
    const payload = {
        invoiceDate: data.orderDate,
        dueDate: data.dueDate,
        terms: data.terms,
        notes: data.notes,
        currency: data.currency,
        discountAmount: data.discountAmount,
        invoiceLines: data.items?.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            productId: item.productId,
            notes: item.notes
        })) || []
    };
    return crmApi.put<ApiResponse<OrderDto>>(`/SalesOrder/${id}`, payload);
};

/**
 * Delete an order
 */
export const deleteOrder = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/SalesOrder/${id}`);
};

/**
 * Update order status
 */
export const updateOrderStatus = (id: string, status: string) => {
    return crmApi.patch<ApiResponse<OrderDto>>(`/SalesOrder/${id}/status`, { status });
};

/**
 * Cancel an order
 */
export const cancelOrder = (id: string, data?: { reason?: string }) => {
    return crmApi.post<ApiResponse<OrderDto>>(`/SalesOrder/${id}/cancel`, data || {});
};

/**
 * Approve an order
 */
export const approveOrder = (id: string) => {
    return crmApi.post<ApiResponse<OrderDto>>(`/SalesOrder/${id}/approve`);
};

/**
 * Fulfill an order
 */
export const fulfillOrder = (id: string) => {
    return crmApi.post<ApiResponse<OrderDto>>(`/SalesOrder/${id}/fulfill`);
};

/**
 * Ship an order
 */
export const shipOrder = (id: string) => {
    return crmApi.post<ApiResponse<OrderDto>>(`/SalesOrder/${id}/ship`);
};

/**
 * Get order statistics
 */
export const getOrderStats = () => {
    return crmApi.get<ApiResponse<OrderStatsDto>>('/SalesOrder/stats');
};
// ============================================================
// CONTRACTS
// ============================================================
export const getContracts = (params?: any) => {
    return crmApi.get<ApiResponse<ContractDto[]>>('/Contract', { params });
};

export const getContractById = (id: string) => {
    return crmApi.get<ApiResponse<ContractDto>>(`/Contract/${id}`);
};

export const createContract = (data: CreateContractDto) => {
    return crmApi.post<ApiResponse<ContractDto>>('/Contract', data);
};

export const updateContract = (id: string, data: UpdateContractDto) => {
    return crmApi.put<ApiResponse<ContractDto>>(`/Contract/${id}`, data);
};

export const deleteContract = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Contract/${id}`);
};

export const signContract = (id: string) => {
    return crmApi.post<ApiResponse<ContractDto>>(`/Contract/${id}/sign`);
};

export const activateContract = (id: string) => {
    return crmApi.post<ApiResponse<ContractDto>>(`/Contract/${id}/activate`);
};

export const terminateContract = (id: string) => {
    return crmApi.post<ApiResponse<ContractDto>>(`/Contract/${id}/terminate`);
};

export const getContractStats = () => {
    return crmApi.get<ApiResponse<ContractStatsDto>>('/Contract/stats');
};

// ============================================================
// SALES FORECAST
// ============================================================

/**
 * Get sales forecast data
 */


/**
 * Get sales pipeline data
 */
export const getSalesPipeline = (params?: {
    period?: 'month' | 'quarter' | 'year';
}) => {
    return crmApi.get<ApiResponse<{
        stages: {
            stage: string;
            count: number;
            value: number;
            probability: number;
        }[];
        totalValue: number;
        totalCount: number;
    }>>('/SalesOrder/Pipeline', { params });
};

/**
 * Get sales performance metrics
 */
export const getSalesPerformance = (params?: {
    period?: 'month' | 'quarter' | 'year';
    fromDate?: string;
    toDate?: string;
}) => {
    return crmApi.get<ApiResponse<{
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
    }>>('/SalesOrder/Performance', { params });
};

export const getSalesForecast = async (params?: { period?: string }): Promise<ApiResponse<SalesForecastData>> => {
    try {
        const response = await crmApi.get<ApiResponse<SalesForecastData>>('/SalesForecast', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching sales forecast:', error);
        throw error;
    }
};

/**
 * Get all properties with filters
 */
export const getProperties = (params?: PropertyFilterDto): Promise<ApiResponse<PropertyDto[]>> => {
    return crmApi.get('/Property', { params });
};

/**
 * Get property by ID
 */
export const getPropertyById = (id: string): Promise<ApiResponse<PropertyDto>> => {
    return crmApi.get(`/Property/${id}`);
};

/**
 * Create a new property
 */
export const createProperty = (data: CreatePropertyDto): Promise<ApiResponse<PropertyDto>> => {
    return crmApi.post('/Property', data);
};
// src/services/crm/crm.api.ts - Add these functions after the Email Campaigns section

// ============================================================
// EMAIL CAMPAIGNS - COMPLETE
// ============================================================

/**
 * Get all email campaigns with optional filters
 */
export const getEmailCampaigns = (params?: {
    status?: string;
    campaignId?: string;
    templateId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}) => {
    return crmApi.get<ApiResponse<any>>('/EmailCampaign', { params });
};

/**
 * Get a single email campaign by ID
 */
export const getEmailCampaignById = (id: string) => {
    return crmApi.get<ApiResponse<any>>(`/EmailCampaign/${id}`);
};

/**
 * Create a new email campaign
 */
export const createEmailCampaign = (data: CreateEmailCampaignDto) => {
    return crmApi.post<ApiResponse<any>>('/EmailCampaign', data);
};

/**
 * Update an existing email campaign
 */
export const updateEmailCampaign = (id: string, data: UpdateEmailCampaignDto) => {
    return crmApi.put<ApiResponse<any>>(`/EmailCampaign/${id}`, data);
};

/**
 * Delete an email campaign
 */
export const deleteEmailCampaign = (id: string) => {
    return crmApi.delete<ApiResponse<string>>(`/EmailCampaign/${id}`);
};

/**
 * Send an email campaign
 */
export const sendEmailCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/EmailCampaign/${id}/send`);
};

/**
 * Duplicate an email campaign
 */
export const duplicateEmailCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/EmailCampaign/${id}/duplicate`);
};

/**
 * Pause an email campaign
 */
export const pauseEmailCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/EmailCampaign/${id}/pause`);
};

/**
 * Resume an email campaign
 */
export const resumeEmailCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/EmailCampaign/${id}/resume`);
};

/**
 * Cancel an email campaign
 */
export const cancelEmailCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/EmailCampaign/${id}/cancel`);
};

/**
 * Get email campaign stats
 */
export const getEmailCampaignStats = (params?: {
    campaignId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return crmApi.get<ApiResponse<any>>('/EmailCampaign/stats', { params });
};


// ============================================================
// SMS CAMPAIGNS - COMPLETE
// ============================================================

/**
 * Get all SMS campaigns with optional filters
 */
export const getSmsCampaigns = (params?: {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}) => {
    return crmApi.get<ApiResponse<any[]>>('/Campaign/Sms', { params });
};

/**
 * Get a single SMS campaign by ID
 */
export const getSmsCampaignById = (id: string) => {
    return crmApi.get<ApiResponse<any>>(`/Campaign/Sms/${id}`);
};

/**
 * Create a new SMS campaign
 */
export const createSmsCampaign = (data: any) => {
    return crmApi.post<ApiResponse<any>>('/Campaign/Sms', data);
};

/**
 * Update an existing SMS campaign
 */
export const updateSmsCampaign = (id: string, data: any) => {
    return crmApi.put<ApiResponse<any>>(`/Campaign/Sms/${id}`, data);
};

/**
 * Delete an SMS campaign
 */
export const deleteSmsCampaign = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Campaign/Sms/${id}`);
};

/**
 * Duplicate an SMS campaign
 */
export const duplicateSmsCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/Campaign/Sms/${id}/Duplicate`);
};

/**
 * Pause an SMS campaign
 */
export const pauseSmsCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/Campaign/Sms/${id}/Pause`);
};

/**
 * Resume an SMS campaign
 */
export const resumeSmsCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/Campaign/Sms/${id}/Resume`);
};

/**
 * Cancel an SMS campaign
 */
export const cancelSmsCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/Campaign/Sms/${id}/Cancel`);
};

/**
 * Send an SMS campaign
 */
export const sendSmsCampaign = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/Campaign/Sms/${id}/Send`);
};

/**
 * Schedule an SMS campaign
 */
export const scheduleSmsCampaign = (id: string, scheduleDate: string) => {
    return crmApi.post<ApiResponse<any>>(`/Campaign/Sms/${id}/Schedule`, { scheduleDate });
};

/**
 * Get SMS campaign stats
 */
export const getSmsCampaignStats = (id: string) => {
    return crmApi.get<ApiResponse<any>>(`/Campaign/Sms/${id}/Stats`);
};

/**
 * Get SMS campaign analytics
 */
export const getSmsCampaignAnalytics = (id: string, params?: {
    fromDate?: string;
    toDate?: string;
}) => {
    return crmApi.get<ApiResponse<any>>(`/Campaign/Sms/${id}/Analytics`, { params });
};

// src/services/crm/crm.api.ts - Add these functions after the SMS Campaigns section

// ============================================================
// SOCIAL MEDIA CAMPAIGNS
// ============================================================

/**
 * Get all social media posts/campaigns with optional filters
 */
export const getSocialPosts = (params?: {
    status?: string;
    platform?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}) => {
    return crmApi.get<ApiResponse<any[]>>('/SocialMedia', { params });
};

/**
 * Get a single social media post by ID
 */
export const getSocialPostById = (id: string) => {
    return crmApi.get<ApiResponse<any>>(`/SocialMedia/${id}`);
};

/**
 * Create a new social media post
 */
export const createSocialPost = (data: any) => {
    return crmApi.post<ApiResponse<any>>('/SocialMedia', data);
};

/**
 * Update an existing social media post
 */
export const updateSocialPost = (id: string, data: any) => {
    return crmApi.put<ApiResponse<any>>(`/SocialMedia/${id}`, data);
};

/**
 * Delete a social media post
 */
export const deleteSocialPost = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/SocialMedia/${id}`);
};

/**
 * Duplicate a social media post
 */
export const duplicateSocialPost = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/SocialMedia/${id}/Duplicate`);
};

/**
 * Publish a social media post
 */
export const publishSocialPost = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/SocialMedia/${id}/Publish`);
};

/**
 * Unpublish a social media post
 */
export const unpublishSocialPost = (id: string) => {
    return crmApi.post<ApiResponse<any>>(`/SocialMedia/${id}/Unpublish`);
};

/**
 * Schedule a social media post
 */
export const scheduleSocialPost = (id: string, scheduleDate: string) => {
    return crmApi.post<ApiResponse<any>>(`/SocialMedia/${id}/Schedule`, { scheduleDate });
};

/**
 * Get social media post analytics
 */
export const getSocialPostAnalytics = (id: string, params?: {
    fromDate?: string;
    toDate?: string;
}) => {
    return crmApi.get<ApiResponse<any>>(`/SocialMedia/${id}/Analytics`, { params });
};

/**
 * Get social media post engagement stats
 */
export const getSocialPostEngagement = (id: string) => {
    return crmApi.get<ApiResponse<{
        likes: number;
        shares: number;
        comments: number;
        impressions: number;
        reach: number;
    }>>(`/SocialMedia/${id}/Engagement`);
};

/**
 * Export social media post data
 */
export const exportSocialPostData = (id: string, format: 'csv' | 'excel' = 'csv') => {
    return crmApi.get(`/SocialMedia/${id}/Export`, {
        params: { format },
        responseType: 'blob' as const,
    });
};

// ============================================================
// SOCIAL MEDIA PLATFORMS
// ============================================================

/**
 * Get all available social media platforms
 */
export const getSocialPlatforms = () => {
    return crmApi.get<ApiResponse<Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
        isActive: boolean;
    }>>>('/Campaign/Social/Platforms');
};

/**
 * Connect a social media account
 */
export const connectSocialAccount = (data: {
    platform: string;
    accessToken: string;
    pageId?: string;
    accountId?: string;
}) => {
    return crmApi.post<ApiResponse<any>>('/Campaign/Social/Connect', data);
};

/**
 * Disconnect a social media account
 */
export const disconnectSocialAccount = (id: string) => {
    return crmApi.delete<ApiResponse<void>>(`/Campaign/Social/Disconnect/${id}`);
};

/**
 * Get connected social media accounts
 */
export const getConnectedSocialAccounts = () => {
    return crmApi.get<ApiResponse<Array<{
        id: string;
        platform: string;
        accountName: string;
        isConnected: boolean;
        connectedAt: string;
    }>>>('/Campaign/Social/Accounts');
};
/**
 * Update an existing property
 */
export const updateProperty = (id: string, data: UpdatePropertyDto): Promise<ApiResponse<PropertyDto>> => {
    return crmApi.put(`/Property/${id}`, data);
};

/**
 * Delete a property
 */
export const deleteProperty = (id: string): Promise<ApiResponse<void>> => {
    return crmApi.delete(`/Property/${id}`);
};

/**
 * Publish a property
 */
export const publishProperty = (id: string): Promise<ApiResponse<PropertyDto>> => {
    return crmApi.post(`/Property/${id}/publish`);
};

/**
 * Get property statistics
 */
export const getPropertyStats = (): Promise<ApiResponse<PropertyStatsDto>> => {
    return crmApi.get('/Property/stats');
};

// ============================================================
// TRANSACTION API
// ============================================================

/**
 * Get all transactions with filters
 */
export const getTransactions = (params?: {
    propertyId?: string;
    buyerId?: string;
    sellerId?: string;
    status?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}): Promise<ApiResponse<RealEstateTransactionDto[]>> => {
    return crmApi.get('/Transaction', { params });
};

/**
 * Get transaction by ID
 */
export const getTransactionById = (id: string): Promise<ApiResponse<RealEstateTransactionDto>> => {
    return crmApi.get(`/Transaction/${id}`);
};

/**
 * Create a new transaction
 */
export const createTransaction = (data: CreateTransactionDto): Promise<ApiResponse<RealEstateTransactionDto>> => {
    return crmApi.post('/Transaction', data);
};

/**
 * Update an existing transaction
 */
export const updateTransaction = (id: string, data: UpdateTransactionDto): Promise<ApiResponse<RealEstateTransactionDto>> => {
    return crmApi.put(`/Transaction/${id}`, data);
};

/**
 * Delete a transaction
 */
export const deleteTransaction = (id: string): Promise<ApiResponse<void>> => {
    return crmApi.delete(`/Transaction/${id}`);
};

/**
 * Accept a transaction
 */
export const acceptTransaction = (id: string): Promise<ApiResponse<RealEstateTransactionDto>> => {
    return crmApi.post(`/Transaction/${id}/accept`);
};

/**
 * Close a transaction
 */
export const closeTransaction = (id: string): Promise<ApiResponse<RealEstateTransactionDto>> => {
    return crmApi.post(`/Transaction/${id}/close`);
};

/**
 * Get transaction statistics
 */
export const getTransactionStats = (): Promise<ApiResponse<TransactionStatsDto>> => {
    return crmApi.get('/Transaction/stats');
};

// ============================================================
// COMMISSION API
// ============================================================

/**
 * Get all commissions with filters
 */
export const getCommissions = (params?: {
    agentId?: string;
    transactionId?: string;
    status?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}): Promise<ApiResponse<CommissionDto[]>> => {
    return crmApi.get('/Commission', { params });
};

/**
 * Get commission by ID
 */
export const getCommissionById = (id: string): Promise<ApiResponse<CommissionDto>> => {
    return crmApi.get(`/Commission/${id}`);
};

/**
 * Get commissions by agent
 */
export const getCommissionsByAgent = (
    agentId: string,
    params?: { fromDate?: string; toDate?: string }
): Promise<ApiResponse<CommissionDto[]>> => {
    return crmApi.get(`/Commission/agent/${agentId}`, { params });
};

/**
 * Create a new commission
 */
export const createCommission = (data: CreateCommissionDto): Promise<ApiResponse<CommissionDto>> => {
    return crmApi.post('/Commission', data);
};

/**
 * Update an existing commission
 */
export const updateCommission = (id: string, data: UpdateCommissionDto): Promise<ApiResponse<CommissionDto>> => {
    return crmApi.put(`/Commission/${id}`, data);
};

/**
 * Delete a commission
 */
export const deleteCommission = (id: string): Promise<ApiResponse<void>> => {
    return crmApi.delete(`/Commission/${id}`);
};

/**
 * Approve a commission
 */
export const approveCommission = (id: string): Promise<ApiResponse<CommissionDto>> => {
    return crmApi.post(`/Commission/${id}/approve`);
};

/**
 * Pay a commission
 */
export const payCommission = (id: string): Promise<ApiResponse<CommissionDto>> => {
    return crmApi.post(`/Commission/${id}/pay`);
};

export default crmApi;