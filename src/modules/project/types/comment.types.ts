// src/modules/project/types/comment.types.ts
export interface ProjectComment {
    id: string;
    content: string;
    projectId: string;
    projectName: string;
    taskId: string | null;
    taskName: string | null;
    milestoneId: string | null;
    milestoneName: string | null;
    issueId: string | null;
    issueName: string | null;
    parentCommentId: string | null;
    authorName: string;
    editedAt: string | null;
    editedByName: string;
    isPinned: boolean;
    isResolved: boolean;
    createdAt: string;
    createdBy: string;
    replies: ProjectComment[];
    replyCount: number;
}

export interface CommentCreateDto {
    content: string;
    projectId: string;
    taskId?: string | null;
    milestoneId?: string | null;
    issueId?: string | null;
    parentCommentId?: string | null;
    authorName?: string;
    createdBy?: string;
}

export interface CommentUpdateDto {
    content?: string;
    isPinned?: boolean;
    isResolved?: boolean;
    updatedBy?: string;
}