/**
 * UI State Store
 * Zustand store for managing UI state (panels, modals, selections)
 */

import { create } from 'zustand';

interface UIStoreState {
  // Panel states
  showDetailPanel: boolean;
  showFilterPanel: boolean;
  showAgentRail: boolean;

  // Selected items
  selectedJobId: string | null;
  selectedTab: 'overview' | 'timeline' | 'interviews' | 'prep' | 'offers';

  // Modal states
  showCreateJobModal: boolean;
  showConfirmDeleteModal: boolean;
  deleteTargetJobId: string | null;

  // UI preferences
  nightBeforeMode: boolean;
  compactView: boolean;
  sidebarCollapsed: boolean;

  // Actions
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
  // Initial state
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

  // Panel actions
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

  // Selection actions
  setSelectedJob: (jobId) =>
    set({ selectedJobId: jobId, showDetailPanel: jobId !== null }),

  setSelectedTab: (tab) =>
    set({ selectedTab: tab }),

  // Modal actions
  openCreateJobModal: () =>
    set({ showCreateJobModal: true }),

  closeCreateJobModal: () =>
    set({ showCreateJobModal: false }),

  openDeleteConfirm: (jobId) =>
    set({ showConfirmDeleteModal: true, deleteTargetJobId: jobId }),

  closeDeleteConfirm: () =>
    set({ showConfirmDeleteModal: false, deleteTargetJobId: null }),

  // Preference actions
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

  // Reset
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
