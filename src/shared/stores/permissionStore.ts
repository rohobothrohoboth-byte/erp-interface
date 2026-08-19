import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { permissionStructureApi } from '@/modules/auth/services/permission/permissionStructure.api';
import type { ModuleStructure, MenuStructure, ApiAction } from '@/modules/auth/types/permissionStructure';

interface PermissionStore {
    modules: ModuleStructure[];
    menuTree: MenuStructure[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    fetchPermissionStructure: () => Promise<void>;
    getModuleById: (id: string) => ModuleStructure | undefined;
    getMenuById: (id: string) => MenuStructure | undefined;
    getMenuActions: (menuId: string) => ApiAction[];
    clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000;

export const usePermissionStore = create<PermissionStore>()(
    persist(
        (set, get) => ({
            modules: [],
            menuTree: [],
            isLoading: false,
            error: null,
            lastFetched: null,

            fetchPermissionStructure: async () => {
                const { lastFetched, modules } = get();
                if (modules.length > 0 && lastFetched && Date.now() - lastFetched < CACHE_DURATION) return;

                set({ isLoading: true, error: null });
                try {
                    const [mods, tree] = await Promise.all([
                        permissionStructureApi.getPermissionStructure(),
                        permissionStructureApi.getMenuTree()
                    ]);
                    set({ modules: mods, menuTree: tree, isLoading: false, lastFetched: Date.now() });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            getModuleById: (id: string) => get().modules.find(m => m.id === id),

            getMenuById: (id: string) => {
                const find = (menus: MenuStructure[]): MenuStructure | undefined => {
                    for (const m of menus) {
                        if (m.id === id) return m;
                        if (m.children.length) {
                            const f = find(m.children);
                            if (f) return f;
                        }
                    }
                    return undefined;
                };
                return find(get().menuTree);
            },

            getMenuActions: (menuId: string) => {
                const menu = get().getMenuById(menuId);
                return menu?.actions || [];
            },

            clearCache: () => set({ modules: [], menuTree: [], lastFetched: null }),
        }),
        {
            name: 'permission-structure',
            partialize: (state) => ({ modules: state.modules, menuTree: state.menuTree, lastFetched: state.lastFetched }),
        }
    )
);