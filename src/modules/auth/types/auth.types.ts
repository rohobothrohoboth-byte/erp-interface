export type UUID = string;
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    statusCode: number;
    traceId: string | null;
    timestamp: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    userId: string;
    employeeId?: string;
    userName: string;
    email?: string;
    token: string;
    branchId?: string;
    branchName?: string;
    branchCode?: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    positionName?: string;
    jobGradeId?: string;
    jobGradeName?: string;
    role?: string;
}
export interface AuthTokens {
    accessToken: string;
    expiresDate: string;


    data?: LoginResponse;
    userId?: string;
    employeeId?: string;
    userName?: string;
    email?: string;
    branchId?: string;
    branchName?: string;
    branchCode?: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    positionName?: string;
    jobGradeId?: string;
    jobGradeName?: string;
}

// src/types/auth/auth.types.ts

export interface JwtPayload {
    userId: string;
    userName: string;
    employeeId?: string;
    role?: string;
    ph?: string;  // 👈 Permission hash
    // ❌ Remove: permissions
    // ❌ Remove: permissionKeys
    exp: number;
    iss: string;
    aud: string;

    branchId?: string;
    branchName?: string;
    branchCode?: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    positionName?: string;
    jobGradeId?: string;
    jobGradeName?: string;
}
