import { create } from 'zustand';

interface UIStoreState {
  showDetailPanel: boolean;
  showFilterPanel: boolean;
  showAgentRail: boolean;
  selectedJobId: string | null;
  selectedTab: 'overview' | 'timeline' | 'interviews' | 'prep' | 'offers';
  showCreateJobModal: boolean;
  showConfirmDeleteModal: boolean;
  deleteTargetJobId: string | null;
  nightBeforeMode: boolean;
  compactView: boolean;
  sidebarCollapsed: boolean;
  toggleDetailPanel: () => void;
  setDetailPanel: (show: boolean) => void;
  toggleFilterPanel: () => void;
  setFilterPanel: (show: boolean) => void;
  toggleAgentRail: () => void;
  setAgentRail: (show: boolean) => void;
  setSelectedJob: (jobId: string | null) => void;
  setSelectedTab: (tab: UIStoreState['selectedTab']) => void;
  openCreateJobModal: () => void;
  closeCreateJobModal: () => void;
  openDeleteConfirm: (jobId: string) => void;
  closeDeleteConfirm: () => void;
  toggleNightBeforeMode: () => void;
  setNightBeforeMode: (enabled: boolean) => void;
  toggleCompactView: () => void;
  setCompactView: (compact: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resetUIState: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  showDetailPanel: false,
  showFilterPanel: false,
  showAgentRail: true,
  selectedJobId: null,
  selectedTab: 'overview',
  showCreateJobModal: false,
  showConfirmDeleteModal: false,
  deleteTargetJobId: null,
  nightBeforeMode: false,
  compactView: false,
  sidebarCollapsed: false,

  toggleDetailPanel: () =>
    set((state) => ({ showDetailPanel: !state.showDetailPanel })),

  setDetailPanel: (show) =>
    set({ showDetailPanel: show }),

  toggleFilterPanel: () =>
    set((state) => ({ showFilterPanel: !state.showFilterPanel })),

  setFilterPanel: (show) =>
    set({ showFilterPanel: show }),

  toggleAgentRail: () =>
    set((state) => ({ showAgentRail: !state.showAgentRail })),

  setAgentRail: (show) =>
    set({ showAgentRail: show }),

  setSelectedJob: (jobId) =>
    set({ selectedJobId: jobId, showDetailPanel: jobId !== null }),

  setSelectedTab: (tab) =>
    set({ selectedTab: tab }),

  openCreateJobModal: () =>
    set({ showCreateJobModal: true }),

  closeCreateJobModal: () =>
    set({ showCreateJobModal: false }),

  openDeleteConfirm: (jobId) =>
    set({ showConfirmDeleteModal: true, deleteTargetJobId: jobId }),

  closeDeleteConfirm: () =>
    set({ showConfirmDeleteModal: false, deleteTargetJobId: null }),

  toggleNightBeforeMode: () =>
    set((state) => ({ nightBeforeMode: !state.nightBeforeMode })),

  setNightBeforeMode: (enabled) =>
    set({ nightBeforeMode: enabled }),

  toggleCompactView: () =>
    set((state) => ({ compactView: !state.compactView })),

  setCompactView: (compact) =>
    set({ compactView: compact }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  resetUIState: () =>
    set({
      showDetailPanel: false,
      showFilterPanel: false,
      showAgentRail: true,
      selectedJobId: null,
      selectedTab: 'overview',
      showCreateJobModal: false,
      showConfirmDeleteModal: false,
      deleteTargetJobId: null,
      nightBeforeMode: false,
      compactView: false,
      sidebarCollapsed: false,
    }),
}));
