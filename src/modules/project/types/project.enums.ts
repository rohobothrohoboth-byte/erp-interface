// src/modules/project/types/project.enums.ts
// ============================================================
// PROJECT ENUMS - Using Union Types instead of Enums
// ============================================================

export const ProjectStatus = {
    Draft: 1,
    Planning: 2,
    InProgress: 3,
    OnHold: 4,
    Completed: 5,
    Cancelled: 6,
    Archived: 7,
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const ProjectType = {
    Internal: 1,
    External: 2,
    Research: 3,
    Development: 4,
    Maintenance: 5,
    Consulting: 6,
} as const;

export type ProjectType = typeof ProjectType[keyof typeof ProjectType];

export const TaskStatus = {
    NotStarted: 1,
    InProgress: 2,
    Blocked: 3,
    UnderReview: 4,
    Completed: 5,
    Cancelled: 6,
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
    Low: 1,
    Medium: 2,
    High: 3,
    Urgent: 4,
    Critical: 5,
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export const TimesheetStatus = {
    Draft: 1,
    Submitted: 2,
    UnderReview: 3,
    Approved: 4,
    Rejected: 5,
    Paid: 6,
} as const;

export type TimesheetStatus = typeof TimesheetStatus[keyof typeof TimesheetStatus];

export const ResourceType = {
    Human: 1,
    Equipment: 2,
    Material: 3,
    Software: 4,
    Facility: 5,
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export const ResourceAllocationStatus = {
    Planned: 1,
    Allocated: 2,
    InUse: 3,
    Released: 4,
    Completed: 5,
} as const;

export type ResourceAllocationStatus = typeof ResourceAllocationStatus[keyof typeof ResourceAllocationStatus];

export const PhaseStatus = {
    NotStarted: 1,
    InProgress: 2,
    Completed: 3,
    OnHold: 4,
    Cancelled: 5,
} as const;

export type PhaseStatus = typeof PhaseStatus[keyof typeof PhaseStatus];

export const BudgetCategory = {
    Labor: 1,
    Materials: 2,
    Equipment: 3,
    Software: 4,
    Travel: 5,
    Training: 6,
    Consulting: 7,
    Overhead: 8,
    Contingency: 9,
    Other: 10,
} as const;

export type BudgetCategory = typeof BudgetCategory[keyof typeof BudgetCategory];

export const RiskImpact = {
    VeryLow: 1,
    Low: 2,
    Medium: 3,
    High: 4,
    Critical: 5,
} as const;

export type RiskImpact = typeof RiskImpact[keyof typeof RiskImpact];

export const RiskProbability = {
    Rare: 1,
    Unlikely: 2,
    Possible: 3,
    Likely: 4,
    AlmostCertain: 5,
} as const;

export type RiskProbability = typeof RiskProbability[keyof typeof RiskProbability];

export const RiskSeverity = {
    VeryLow: 1,
    Low: 2,
    Medium: 3,
    High: 4,
    Critical: 5,
} as const;

export type RiskSeverity = typeof RiskSeverity[keyof typeof RiskSeverity];

export const RiskStatus = {
    Identified: 1,
    Analyzing: 2,
    Mitigating: 3,
    Monitored: 4,
    Resolved: 5,
    Accepted: 6,
    Closed: 7,
} as const;

export type RiskStatus = typeof RiskStatus[keyof typeof RiskStatus];

export const IssueType = {
    Technical: 1,
    Resource: 2,
    Schedule: 3,
    Budget: 4,
    Quality: 5,
    Scope: 6,
    Communication: 7,
    Stakeholder: 8,
    Vendor: 9,
    Other: 10,
} as const;

export type IssueType = typeof IssueType[keyof typeof IssueType];

export const IssuePriority = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
} as const;

export type IssuePriority = typeof IssuePriority[keyof typeof IssuePriority];

export const IssueStatus = {
    Open: 1,
    InProgress: 2,
    UnderReview: 3,
    Resolved: 4,
    Closed: 5,
    Rejected: 6,
} as const;

export type IssueStatus = typeof IssueStatus[keyof typeof IssueStatus];

export const ChangeType = {
    Scope: 1,
    Schedule: 2,
    Budget: 3,
    Resource: 4,
    Quality: 5,
    Risk: 6,
    Other: 7,
} as const;

export type ChangeType = typeof ChangeType[keyof typeof ChangeType];

export const ChangePriority = {
    Low: 1,
    Medium: 2,
    High: 3,
    Urgent: 4,
} as const;

export type ChangePriority = typeof ChangePriority[keyof typeof ChangePriority];

export const ChangeStatus = {
    Submitted: 1,
    UnderReview: 2,
    Approved: 3,
    Rejected: 4,
    Implemented: 5,
    Closed: 6,
} as const;

export type ChangeStatus = typeof ChangeStatus[keyof typeof ChangeStatus];

export const DocumentType = {
    Plan: 1,
    Specification: 2,
    Design: 3,
    Contract: 4,
    Report: 5,
    Meeting: 6,
    Presentation: 7,
    Spreadsheet: 8,
    Image: 9,
    Video: 10,
    Other: 11,
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export const NotificationType = {
    ProjectCreated: 1,
    ProjectUpdated: 2,
    ProjectStatusChanged: 3,
    TaskAssigned: 4,
    TaskCompleted: 5,
    TaskOverdue: 6,
    MilestoneDue: 7,
    MilestoneCompleted: 8,
    RiskIdentified: 9,
    RiskEscalated: 10,
    IssueReported: 11,
    IssueResolved: 12,
    ChangeRequested: 13,
    ChangeApproved: 14,
    BudgetAlert: 15,
    TimesheetSubmitted: 16,
    TimesheetApproved: 17,
    DocumentUploaded: 18,
    CommentAdded: 19,
    Mentioned: 20,
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationPriority = {
    Low: 1,
    Medium: 2,
    High: 3,
    Urgent: 4,
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

export const AuditAction = {
    Created: 1,
    Updated: 2,
    Deleted: 3,
    Restored: 4,
    StatusChanged: 5,
    Assigned: 6,
    Unassigned: 7,
    Approved: 8,
    Rejected: 9,
    Submitted: 10,
    Completed: 11,
    Commented: 12,
    DocumentAdded: 13,
    DocumentRemoved: 14,
    ResourceAllocated: 15,
    ResourceReleased: 16,
    BudgetAdjusted: 17,
    RiskUpdated: 18,
    IssueResolved: 19,
    ChangeImplemented: 20,
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];