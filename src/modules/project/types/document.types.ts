// src/modules/project/types/document.types.ts
import { DocumentType } from './project.enums';

export interface ProjectDocument {
    id: string;
    name: string;
    description: string;
    projectId: string;
    projectName: string;
    phaseId: string | null;
    phaseName: string | null;
    taskId: string | null;
    taskName: string | null;
    type: DocumentType;
    fileName: string;
    filePath: string;
    fileSize: string;
    fileType: string;
    fileHash: string;
    version: string;
    revisionNumber: number;
    uploadedByName: string;
    uploadedAt: string;
    lastModifiedByName: string;
    lastModifiedAt: string | null;
    isApproved: boolean;
    approvedAt: string | null;
    approvedByName: string;
    isConfidential: boolean;
    isArchived: boolean;
    tags: string;
    createdAt: string;
    createdBy: string;
    downloadUrl: string;
}

export interface DocumentCreateDto {
    name: string;
    description?: string;
    projectId: string;
    phaseId?: string | null;
    taskId?: string | null;
    type: DocumentType;
    fileName: string;
    filePath?: string;
    fileSize?: string;
    fileType?: string;
    isConfidential?: boolean;
    tags?: string;
    createdBy?: string;
}

export interface DocumentUpdateDto {
    name?: string;
    description?: string;
    version?: string;
    isApproved?: boolean;
    isArchived?: boolean;
    tags?: string;
    updatedBy?: string;
}