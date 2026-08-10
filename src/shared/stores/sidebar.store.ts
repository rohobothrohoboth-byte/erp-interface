import { create } from "zustand";

type SidebarState = {
  collapsed: boolean;

  // module -> open group name
  openGroups: Record<string, string | null>;

  toggleCollapsed: () => void;

  toggleGroup: (module: string, group: string) => void;

  setGroup: (module: string, group: string | null) => void;
};

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: false,

  openGroups: {},

  toggleCollapsed: () =>
    set((state) => ({ collapsed: !state.collapsed })),

  toggleGroup: (module, group) => {
    const current = get().openGroups[module];

    set({
      openGroups: {
        ...get().openGroups,
        [module]: current === group ? null : group,
      },
    });
  },

  setGroup: (module, group) =>
    set({
      openGroups: {
        ...get().openGroups,
        [module]: group,
      },
    }),
}));