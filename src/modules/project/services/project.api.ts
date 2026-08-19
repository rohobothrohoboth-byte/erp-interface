// src/modules/project/services/project.api.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const PROJECT_PATH = '/pm/v1';

export const projectApi = axios.create({
  baseURL: `${API_BASE}${PROJECT_PATH}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
projectApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// PROJECT ENDPOINTS
// ============================================================

export const getProjects = (params?: ProjectFilterDto) => {
  return projectApi.get('/Project', { params });
};

export const getProjectById = (id: string) => {
  return projectApi.get(`/Project/${id}`);
};

export const createProject = (data: ProjectCreateDto) => {
  return projectApi.post('/Project', data);
};

export const updateProject = (data: ProjectUpdateDto & { id: string }) => {
  return projectApi.put(`/Project/${data.id}`, data);
};

export const deleteProject = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Project/${id}`, { params: { deletedBy } });
};

export const changeProjectStatus = (id: string, data: { status: ProjectStatus; notes?: string; updatedBy?: string }) => {
  return projectApi.patch(`/Project/${id}/status`, data);
};

export const getProjectDashboard = () => {
  return projectApi.get('/Project/dashboard');
};

export const getProjectStatistics = (id: string) => {
  return projectApi.get(`/Project/${id}/statistics`);
};

// ============================================================
// TASK ENDPOINTS
// ============================================================

export const getTasks = (params?: TaskFilterDto) => {
  return projectApi.get('/Task', { params });
};

export const getTaskById = (id: string) => {
  return projectApi.get(`/Task/${id}`);
};

export const getTasksByProject = (projectId: string, params?: Partial<TaskFilterDto>) => {
  return projectApi.get(`/Task/project/${projectId}`, { params });
};

export const getTasksByAssignee = (assigneeId: string, params?: Partial<TaskFilterDto>) => {
  return projectApi.get(`/Task/assignee/${assigneeId}`, { params });
};

export const getTaskTree = (projectId: string) => {
  return projectApi.get(`/Task/project/${projectId}/tree`);
};

export const createTask = (data: TaskCreateDto) => {
  return projectApi.post('/Task', data);
};

export const updateTask = (data: TaskUpdateDto & { id: string }) => {
  return projectApi.put(`/Task/${data.id}`, data);
};

export const deleteTask = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Task/${id}`, { params: { deletedBy } });
};

export const assignTask = (data: TaskAssignmentDto) => {
  return projectApi.patch(`/Task/${data.taskId}/assign`, data);
};

export const updateTaskStatus = (taskId: string, data: TaskStatusUpdateDto) => {
  return projectApi.patch(`/Task/${taskId}/status`, data);
};

// ============================================================
// TIMESHEET ENDPOINTS
// ============================================================

export const getTimesheets = (params?: TimesheetFilterDto) => {
  return projectApi.get('/Timesheet', { params });
};

export const getTimesheetById = (id: string) => {
  return projectApi.get(`/Timesheet/${id}`);
};

export const getTimesheetsByUser = (userId: string, params?: Partial<TimesheetFilterDto>) => {
  return projectApi.get(`/Timesheet/user/${userId}`, { params });
};

export const getTimesheetsByProject = (projectId: string, params?: Partial<TimesheetFilterDto>) => {
  return projectApi.get(`/Timesheet/project/${projectId}`, { params });
};

export const getTimesheetSummary = (userId: string, fromDate: string, toDate: string) => {
  return projectApi.get(`/Timesheet/summary/${userId}`, { params: { fromDate, toDate } });
};

export const createTimesheet = (data: TimesheetCreateDto) => {
  return projectApi.post('/Timesheet', data);
};

export const updateTimesheet = (data: TimesheetUpdateDto & { id: string }) => {
  return projectApi.put(`/Timesheet/${data.id}`, data);
};

export const deleteTimesheet = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Timesheet/${id}`, { params: { deletedBy } });
};

export const submitTimesheets = (data: SubmitTimesheetDto) => {
  return projectApi.post('/Timesheet/submit', data);
};

export const approveTimesheets = (data: ApproveTimesheetDto) => {
  return projectApi.post('/Timesheet/approve', data);
};

export const rejectTimesheets = (data: RejectTimesheetDto) => {
  return projectApi.post('/Timesheet/reject', data);
};

// ============================================================
// RESOURCE ENDPOINTS
// ============================================================

export const getResourceAllocations = (params?: ResourceFilterDto) => {
  return projectApi.get('/Resource', { params });
};

export const getResourcesByProject = (projectId: string, status?: ResourceAllocationStatus) => {
  return projectApi.get(`/Resource/project/${projectId}`, { params: { status } });
};

export const getAvailableResources = (params: { startDate: string; endDate: string; type?: ResourceType; skills?: string }) => {
  return projectApi.get('/Resource/available', { params });
};

export const allocateResource = (data: AllocateResourceDto) => {
  return projectApi.post('/Resource/allocate', data);
};

export const updateResourceAllocation = (data: UpdateResourceAllocationDto & { id: string }) => {
  return projectApi.put(`/Resource/${data.id}`, data);
};

export const releaseResource = (id: string, data: ReleaseResourceDto) => {
  return projectApi.post(`/Resource/${id}/release`, data);
};

// ============================================================
// MILESTONE ENDPOINTS
// ============================================================

export const getMilestones = (params?: { projectId?: string; isCompleted?: boolean; dueDateFrom?: string; dueDateTo?: string; page?: number; pageSize?: number }) => {
  return projectApi.get('/Milestone', { params });
};

export const getMilestoneById = (id: string) => {
  return projectApi.get(`/Milestone/${id}`);
};

export const getMilestonesByProject = (projectId: string, params?: { isCompleted?: boolean; dueDateFrom?: string; dueDateTo?: string; phaseId?: string }) => {
  return projectApi.get(`/Milestone/project/${projectId}`, { params });
};

export const getUpcomingMilestones = (projectId: string, daysThreshold?: number) => {
  return projectApi.get(`/Milestone/project/${projectId}/upcoming`, { params: { daysThreshold } });
};

export const createMilestone = (data: MilestoneCreateDto) => {
  return projectApi.post('/Milestone', data);
};

export const updateMilestone = (data: MilestoneUpdateDto & { id: string }) => {
  return projectApi.put(`/Milestone/${data.id}`, data);
};

export const deleteMilestone = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Milestone/${id}`, { params: { deletedBy } });
};

export const completeMilestone = (id: string, data: { completedBy?: string; notes?: string }) => {
  return projectApi.post(`/Milestone/${id}/complete`, data);
};

// ============================================================
// BUDGET ENDPOINTS
// ============================================================

export const getBudgets = (params?: { projectId?: string; category?: BudgetCategory; isApproved?: boolean }) => {
  return projectApi.get('/Budget', { params });
};

export const getBudgetById = (id: string) => {
  return projectApi.get(`/Budget/${id}`);
};

export const getBudgetsByProject = (projectId: string, params?: { category?: BudgetCategory; isApproved?: boolean }) => {
  return projectApi.get(`/Budget/project/${projectId}`, { params });
};

export const getBudgetSummary = (projectId: string) => {
  return projectApi.get(`/Budget/project/${projectId}/summary`);
};

export const getBudgetUtilization = (projectId: string, fromDate: string, toDate: string) => {
  return projectApi.get(`/Budget/project/${projectId}/utilization`, { params: { fromDate, toDate } });
};

export const createBudget = (data: BudgetCreateDto) => {
  return projectApi.post('/Budget', data);
};

export const updateBudget = (data: BudgetUpdateDto & { id: string }) => {
  return projectApi.put(`/Budget/${data.id}`, data);
};

export const deleteBudget = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Budget/${id}`, { params: { deletedBy } });
};

export const approveBudget = (id: string, data: { approvedBy?: string; notes?: string }) => {
  return projectApi.post(`/Budget/${id}/approve`, data);
};

// ============================================================
// RISK ENDPOINTS
// ============================================================

export const getRisks = (params?: { projectId?: string; status?: RiskStatus; severity?: RiskSeverity; assignedToId?: string }) => {
  return projectApi.get('/Risk', { params });
};

export const getRiskById = (id: string) => {
  return projectApi.get(`/Risk/${id}`);
};

export const getRisksByProject = (projectId: string, params?: { status?: RiskStatus; severity?: RiskSeverity; assignedToId?: string }) => {
  return projectApi.get(`/Risk/project/${projectId}`, { params });
};

export const getRiskHeatmap = (projectId: string) => {
  return projectApi.get(`/Risk/project/${projectId}/heatmap`);
};

export const getRiskSummary = (projectId: string) => {
  return projectApi.get(`/Risk/project/${projectId}/summary`);
};

export const createRisk = (data: RiskCreateDto) => {
  return projectApi.post('/Risk', data);
};

export const updateRisk = (data: RiskUpdateDto & { id: string }) => {
  return projectApi.put(`/Risk/${data.id}`, data);
};

export const deleteRisk = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Risk/${id}`, { params: { deletedBy } });
};

export const resolveRisk = (id: string, data: { resolutionNotes: string; resolvedBy?: string }) => {
  return projectApi.post(`/Risk/${id}/resolve`, data);
};

export const updateRiskStatus = (id: string, data: { status: RiskStatus; notes?: string; updatedBy?: string }) => {
  return projectApi.patch(`/Risk/${id}/status`, data);
};

// ============================================================
// ISSUE ENDPOINTS
// ============================================================

export const getIssues = (params?: { projectId?: string; type?: IssueType; priority?: IssuePriority; status?: IssueStatus; assignedToId?: string }) => {
  return projectApi.get('/Issue', { params });
};

export const getIssueById = (id: string) => {
  return projectApi.get(`/Issue/${id}`);
};

export const getIssuesByProject = (projectId: string, params?: { type?: IssueType; priority?: IssuePriority; status?: IssueStatus; assignedToId?: string }) => {
  return projectApi.get(`/Issue/project/${projectId}`, { params });
};

export const getIssueSummary = (projectId: string) => {
  return projectApi.get(`/Issue/project/${projectId}/summary`);
};

export const createIssue = (data: IssueCreateDto) => {
  return projectApi.post('/Issue', data);
};

export const updateIssue = (data: IssueUpdateDto & { id: string }) => {
  return projectApi.put(`/Issue/${data.id}`, data);
};

export const deleteIssue = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Issue/${id}`, { params: { deletedBy } });
};

export const resolveIssue = (id: string, data: { resolution: string; rootCause?: string; resolvedBy?: string }) => {
  return projectApi.post(`/Issue/${id}/resolve`, data);
};

export const updateIssueStatus = (id: string, data: { status: IssueStatus; notes?: string; updatedBy?: string }) => {
  return projectApi.patch(`/Issue/${id}/status`, data);
};

// ============================================================
// CHANGE ENDPOINTS
// ============================================================

export const getChanges = (params?: { projectId?: string; type?: ChangeType; priority?: ChangePriority; status?: ChangeStatus }) => {
  return projectApi.get('/Change', { params });
};

export const getChangeById = (id: string) => {
  return projectApi.get(`/Change/${id}`);
};

export const getChangesByProject = (projectId: string, params?: { type?: ChangeType; priority?: ChangePriority; status?: ChangeStatus }) => {
  return projectApi.get(`/Change/project/${projectId}`, { params });
};

export const getChangeSummary = (projectId: string) => {
  return projectApi.get(`/Change/project/${projectId}/summary`);
};

export const createChange = (data: ChangeCreateDto) => {
  return projectApi.post('/Change', data);
};

export const updateChange = (data: ChangeUpdateDto & { id: string }) => {
  return projectApi.put(`/Change/${data.id}`, data);
};

export const deleteChange = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Change/${id}`, { params: { deletedBy } });
};

export const approveChange = (id: string, data: { approvedBy?: string; notes?: string }) => {
  return projectApi.post(`/Change/${id}/approve`, data);
};

export const rejectChange = (id: string, data: { rejectedBy?: string; reason: string }) => {
  return projectApi.post(`/Change/${id}/reject`, data);
};

export const implementChange = (id: string, data: { implementedBy?: string; notes?: string }) => {
  return projectApi.post(`/Change/${id}/implement`, data);
};

// ============================================================
// DOCUMENT ENDPOINTS
// ============================================================

export const getDocuments = (params?: { projectId?: string; type?: DocumentType; isApproved?: boolean; isArchived?: boolean; phaseId?: string; taskId?: string }) => {
  return projectApi.get('/Document', { params });
};

export const getDocumentById = (id: string) => {
  return projectApi.get(`/Document/${id}`);
};

export const getDocumentsByProject = (projectId: string, params?: { type?: DocumentType; isApproved?: boolean; isArchived?: boolean }) => {
  return projectApi.get(`/Document/project/${projectId}`, { params });
};

export const getDocumentVersions = (documentId: string) => {
  return projectApi.get(`/Document/${documentId}/versions`);
};

export const uploadDocument = (data: DocumentCreateDto) => {
  return projectApi.post('/Document/upload', data);
};

export const updateDocument = (data: DocumentUpdateDto & { id: string }) => {
  return projectApi.put(`/Document/${data.id}`, data);
};

export const deleteDocument = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Document/${id}`, { params: { deletedBy } });
};

export const approveDocument = (id: string, data: { approvedBy?: string; notes?: string }) => {
  return projectApi.post(`/Document/${id}/approve`, data);
};

export const archiveDocument = (id: string, data: { archivedBy?: string }) => {
  return projectApi.post(`/Document/${id}/archive`, data);
};

// ============================================================
// COMMENT ENDPOINTS
// ============================================================

export const getComments = (params?: { projectId?: string; taskId?: string; milestoneId?: string; issueId?: string; isPinned?: boolean; isResolved?: boolean }) => {
  return projectApi.get('/Comment', { params });
};

export const getCommentById = (id: string) => {
  return projectApi.get(`/Comment/${id}`);
};

export const getCommentsByProject = (projectId: string, params?: { taskId?: string; milestoneId?: string; issueId?: string; isPinned?: boolean; isResolved?: boolean }) => {
  return projectApi.get(`/Comment/project/${projectId}`, { params });
};

export const getCommentThread = (commentId: string) => {
  return projectApi.get(`/Comment/thread/${commentId}`);
};

export const createComment = (data: CommentCreateDto) => {
  return projectApi.post('/Comment', data);
};

export const updateComment = (data: CommentUpdateDto & { id: string }) => {
  return projectApi.put(`/Comment/${data.id}`, data);
};

export const deleteComment = (id: string, deletedBy?: string) => {
  return projectApi.delete(`/Comment/${id}`, { params: { deletedBy } });
};

export const pinComment = (id: string, data: { isPinned: boolean; updatedBy?: string }) => {
  return projectApi.patch(`/Comment/${id}/pin`, data);
};

export const resolveComment = (id: string, data: { isResolved: boolean; updatedBy?: string }) => {
  return projectApi.patch(`/Comment/${id}/resolve`, data);
};

// ============================================================
// NOTIFICATION ENDPOINTS
// ============================================================

export const getNotifications = (userId: string, params?: NotificationFilterDto) => {
  return projectApi.get(`/Notification/user/${userId}`, { params });
};

export const getNotificationById = (id: string, userId: string) => {
  return projectApi.get(`/Notification/${id}`, { params: { userId } });
};

export const getUnreadCount = (userId: string) => {
  return projectApi.get(`/Notification/user/${userId}/unread-count`);
};

export const createNotification = (data: CreateNotificationDto) => {
  return projectApi.post('/Notification', data);
};

export const markNotificationsRead = (data: { notificationIds: string[]; markAllAsRead: boolean; userId: string }) => {
  return projectApi.post('/Notification/mark-read', data);
};

export const deleteNotification = (id: string, userId: string) => {
  return projectApi.delete(`/Notification/${id}`, { params: { userId } });
};

export const deleteAllNotifications = (userId: string) => {
  return projectApi.delete(`/Notification/user/${userId}/all`);
};

// ============================================================
// AUDIT LOG ENDPOINTS
// ============================================================

export const getAuditLogs = (params?: AuditLogFilterDto) => {
  return projectApi.get('/AuditLog', { params });
};

export const getAuditLogById = (id: string) => {
  return projectApi.get(`/AuditLog/${id}`);
};

export const getAuditLogSummary = (projectId: string, fromDate?: string, toDate?: string) => {
  return projectApi.get(`/AuditLog/project/${projectId}/summary`, { params: { fromDate, toDate } });
};

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default projectApi;