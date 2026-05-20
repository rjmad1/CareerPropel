import React from 'react'
import { cn } from '@/lib/utils'

export interface AppLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  sidePanel?: React.ReactNode
  header?: React.ReactNode
}

/**
 * AppLayout Component
 * Main application layout with sidebar, header, main content, and optional side panel.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children, sidebar, sidePanel, header }) => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      {sidebar && (
        <aside className="w-64 border-r border-gray-200 overflow-y-auto bg-white flex-shrink-0">{sidebar}</aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {header && (
          <header className="h-15 border-b border-gray-200 bg-white flex-shrink-0">{header}</header>
        )}

        {/* Content + Side Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>

          {/* Side Panel */}
          {sidePanel && (
            <aside className="w-96 border-l border-gray-200 overflow-y-auto bg-white flex-shrink-0">
              {sidePanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

AppLayout.displayName = 'AppLayout'

export interface SidebarProps {
  children: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => (
  <nav className="flex flex-col gap-2 p-8">{children}</nav>
)

Sidebar.displayName = 'Sidebar'

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label: string
  active?: boolean
  children?: React.ReactNode
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ icon, label, active = false, children, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'w-full flex items-center gap-6 px-8 py-4 text-sm rounded-lg transition-colors duration-200',
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100',
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1 text-left">{label}</span>
      {children}
    </button>
  )
)

SidebarItem.displayName = 'SidebarItem'

export interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => (
  <div className="px-12 py-8 flex items-center justify-between">
    <div>
      {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
      {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-8">{actions}</div>}
  </div>
)

Header.displayName = 'Header'

export interface SidePanelProps {
  children: React.ReactNode
  title?: string
  onClose?: () => void
}

export const SidePanel = React.forwardRef<HTMLDivElement, SidePanelProps>(
  ({ children, title, onClose }, ref) => (
    <div ref={ref} className="flex flex-col h-full">
      {title && (
        <div className="px-12 py-8 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-12 py-8">{children}</div>
    </div>
  )
)

SidePanel.displayName = 'SidePanel'
