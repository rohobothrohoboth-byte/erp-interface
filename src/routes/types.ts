import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

export type AppRoute = {
    path: string;
    href: string;
    title: string;
    icon: LucideIcon;
    element: ReactNode;
    nav: boolean;
    index?: boolean;
    permission?: string;
};

export type SidebarNavItem = {
    title: string;
    href: string;
    icon?: never;
    activeMatch?: 'exact' | 'prefix';
};

export type SidebarNavSection = {
    id?: string;
    title: string;
    icon: LucideIcon;
    items: SidebarNavItem[];
};