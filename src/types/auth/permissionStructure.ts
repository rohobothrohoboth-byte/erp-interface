// types/auth/permissionStructure.ts

export interface ModuleStructure {
    id: string;           // Guid
    key: string;
    name: string;
    icon?: string | null;
    order: number;
    menus: MenuStructure[];
}

export interface MenuStructure {
    id: string;           // Guid
    key: string;
    label: string;        // Note: backend uses "label" not "name"
    path?: string | null;
    icon?: string | null;
    isChild: boolean;
    order: number;
    parentId?: string | null;  // Guid?
    children: MenuStructure[];
    actions: ApiAction[];
}

export interface ApiAction {
    id: string;           // Guid
    key: string;
    name: string;
    description?: string | null;
    order: number;
}

export interface UserPermissions {
    userId: string;
    modules: string[];
    menus: string[];
    apiActions: string[];
}