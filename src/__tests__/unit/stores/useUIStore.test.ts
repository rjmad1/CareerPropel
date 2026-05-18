import { act } from '@testing-library/react'
import { useUIStore } from '@/hooks/useUIStore'

// Reset store before each test
beforeEach(() => {
  act(() => useUIStore.getState().resetUIState())
})

describe('useUIStore - initial state', () => {
  it('has showDetailPanel = false', () => {
    expect(useUIStore.getState().showDetailPanel).toBe(false)
  })

  it('has showFilterPanel = false', () => {
    expect(useUIStore.getState().showFilterPanel).toBe(false)
  })

  it('has showAgentRail = true', () => {
    expect(useUIStore.getState().showAgentRail).toBe(true)
  })

  it('has selectedJobId = null', () => {
    expect(useUIStore.getState().selectedJobId).toBeNull()
  })

  it('has selectedTab = "overview"', () => {
    expect(useUIStore.getState().selectedTab).toBe('overview')
  })

  it('has showCreateJobModal = false', () => {
    expect(useUIStore.getState().showCreateJobModal).toBe(false)
  })

  it('has showConfirmDeleteModal = false', () => {
    expect(useUIStore.getState().showConfirmDeleteModal).toBe(false)
  })

  it('has nightBeforeMode = false', () => {
    expect(useUIStore.getState().nightBeforeMode).toBe(false)
  })

  it('has compactView = false', () => {
    expect(useUIStore.getState().compactView).toBe(false)
  })

  it('has sidebarCollapsed = false', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })
})

describe('toggleDetailPanel / setDetailPanel', () => {
  it('toggles from false to true', () => {
    act(() => useUIStore.getState().toggleDetailPanel())
    expect(useUIStore.getState().showDetailPanel).toBe(true)
  })

  it('toggles back from true to false', () => {
    act(() => useUIStore.getState().toggleDetailPanel())
    act(() => useUIStore.getState().toggleDetailPanel())
    expect(useUIStore.getState().showDetailPanel).toBe(false)
  })

  it('setDetailPanel sets to explicit value', () => {
    act(() => useUIStore.getState().setDetailPanel(true))
    expect(useUIStore.getState().showDetailPanel).toBe(true)
    act(() => useUIStore.getState().setDetailPanel(false))
    expect(useUIStore.getState().showDetailPanel).toBe(false)
  })
})

describe('toggleFilterPanel / setFilterPanel', () => {
  it('toggles the filter panel', () => {
    act(() => useUIStore.getState().toggleFilterPanel())
    expect(useUIStore.getState().showFilterPanel).toBe(true)
    act(() => useUIStore.getState().toggleFilterPanel())
    expect(useUIStore.getState().showFilterPanel).toBe(false)
  })

  it('setFilterPanel sets to explicit value', () => {
    act(() => useUIStore.getState().setFilterPanel(true))
    expect(useUIStore.getState().showFilterPanel).toBe(true)
  })
})

describe('toggleAgentRail / setAgentRail', () => {
  it('toggles agent rail (starts true)', () => {
    act(() => useUIStore.getState().toggleAgentRail())
    expect(useUIStore.getState().showAgentRail).toBe(false)
    act(() => useUIStore.getState().toggleAgentRail())
    expect(useUIStore.getState().showAgentRail).toBe(true)
  })

  it('setAgentRail sets to explicit value', () => {
    act(() => useUIStore.getState().setAgentRail(false))
    expect(useUIStore.getState().showAgentRail).toBe(false)
  })
})

describe('setSelectedJob', () => {
  it('sets selectedJobId and opens detail panel', () => {
    act(() => useUIStore.getState().setSelectedJob('job-42'))
    expect(useUIStore.getState().selectedJobId).toBe('job-42')
    expect(useUIStore.getState().showDetailPanel).toBe(true)
  })

  it('clears selectedJobId and closes detail panel when null', () => {
    act(() => useUIStore.getState().setSelectedJob('job-42'))
    act(() => useUIStore.getState().setSelectedJob(null))
    expect(useUIStore.getState().selectedJobId).toBeNull()
    expect(useUIStore.getState().showDetailPanel).toBe(false)
  })
})

describe('setSelectedTab', () => {
  it('sets the selected tab', () => {
    act(() => useUIStore.getState().setSelectedTab('interviews'))
    expect(useUIStore.getState().selectedTab).toBe('interviews')
  })

  it('accepts all valid tab values', () => {
    const tabs = ['overview', 'timeline', 'interviews', 'prep', 'offers'] as const
    for (const tab of tabs) {
      act(() => useUIStore.getState().setSelectedTab(tab))
      expect(useUIStore.getState().selectedTab).toBe(tab)
    }
  })
})

describe('create/close job modal', () => {
  it('openCreateJobModal sets showCreateJobModal to true', () => {
    act(() => useUIStore.getState().openCreateJobModal())
    expect(useUIStore.getState().showCreateJobModal).toBe(true)
  })

  it('closeCreateJobModal sets showCreateJobModal to false', () => {
    act(() => useUIStore.getState().openCreateJobModal())
    act(() => useUIStore.getState().closeCreateJobModal())
    expect(useUIStore.getState().showCreateJobModal).toBe(false)
  })
})

describe('openDeleteConfirm / closeDeleteConfirm', () => {
  it('opens delete confirm with target job id', () => {
    act(() => useUIStore.getState().openDeleteConfirm('job-del'))
    expect(useUIStore.getState().showConfirmDeleteModal).toBe(true)
    expect(useUIStore.getState().deleteTargetJobId).toBe('job-del')
  })

  it('closeDeleteConfirm clears state', () => {
    act(() => useUIStore.getState().openDeleteConfirm('job-del'))
    act(() => useUIStore.getState().closeDeleteConfirm())
    expect(useUIStore.getState().showConfirmDeleteModal).toBe(false)
    expect(useUIStore.getState().deleteTargetJobId).toBeNull()
  })
})

describe('nightBeforeMode', () => {
  it('toggleNightBeforeMode flips the value', () => {
    act(() => useUIStore.getState().toggleNightBeforeMode())
    expect(useUIStore.getState().nightBeforeMode).toBe(true)
    act(() => useUIStore.getState().toggleNightBeforeMode())
    expect(useUIStore.getState().nightBeforeMode).toBe(false)
  })

  it('setNightBeforeMode sets to explicit value', () => {
    act(() => useUIStore.getState().setNightBeforeMode(true))
    expect(useUIStore.getState().nightBeforeMode).toBe(true)
  })
})

describe('compactView', () => {
  it('toggleCompactView flips the value', () => {
    act(() => useUIStore.getState().toggleCompactView())
    expect(useUIStore.getState().compactView).toBe(true)
  })

  it('setCompactView sets to explicit value', () => {
    act(() => useUIStore.getState().setCompactView(true))
    expect(useUIStore.getState().compactView).toBe(true)
    act(() => useUIStore.getState().setCompactView(false))
    expect(useUIStore.getState().compactView).toBe(false)
  })
})

describe('sidebar', () => {
  it('toggleSidebar flips sidebarCollapsed', () => {
    act(() => useUIStore.getState().toggleSidebar())
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
    act(() => useUIStore.getState().toggleSidebar())
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })

  it('setSidebarCollapsed sets to explicit value', () => {
    act(() => useUIStore.getState().setSidebarCollapsed(true))
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })
})

describe('resetUIState', () => {
  it('resets all state to initial values', () => {
    act(() => {
      useUIStore.getState().setDetailPanel(true)
      useUIStore.getState().setFilterPanel(true)
      useUIStore.getState().setAgentRail(false)
      useUIStore.getState().setSelectedJob('job-123')
      useUIStore.getState().setSelectedTab('interviews')
      useUIStore.getState().openCreateJobModal()
      useUIStore.getState().openDeleteConfirm('job-del')
      useUIStore.getState().setNightBeforeMode(true)
      useUIStore.getState().setCompactView(true)
      useUIStore.getState().setSidebarCollapsed(true)
    })

    act(() => useUIStore.getState().resetUIState())

    const state = useUIStore.getState()
    expect(state.showDetailPanel).toBe(false)
    expect(state.showFilterPanel).toBe(false)
    expect(state.showAgentRail).toBe(true)
    expect(state.selectedJobId).toBeNull()
    expect(state.selectedTab).toBe('overview')
    expect(state.showCreateJobModal).toBe(false)
    expect(state.showConfirmDeleteModal).toBe(false)
    expect(state.deleteTargetJobId).toBeNull()
    expect(state.nightBeforeMode).toBe(false)
    expect(state.compactView).toBe(false)
    expect(state.sidebarCollapsed).toBe(false)
  })
})
