'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Chip, Divider,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import FlagIcon from '@mui/icons-material/Flag'
import HistoryIcon from '@mui/icons-material/History'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShieldIcon from '@mui/icons-material/Shield'

const DRAWER_WIDTH = 220

const NAV = [
  { label: 'Overview',      href: '/admin',              icon: <DashboardIcon fontSize="small" /> },
  { label: 'Users',         href: '/admin/users',        icon: <PeopleIcon fontSize="small" /> },
  { label: 'Permissions',   href: '/admin/permissions',  icon: <SecurityIcon fontSize="small" /> },
  { label: 'Runtime',       href: '/admin/runtime',      icon: <SpeedIcon fontSize="small" /> },
  { label: 'Feature Flags', href: '/admin/feature-flags', icon: <FlagIcon fontSize="small" /> },
  { label: 'Audit',         href: '/admin/audit',        icon: <HistoryIcon fontSize="small" /> },
]

export default function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname()
  // open state reserved for future mobile drawer toggle
  const [_open] = useState(true)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f1117' }}>
      <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: '#161b22', borderBottom: '1px solid #30363d' }} elevation={0}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <ShieldIcon sx={{ color: '#58a6ff', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e6edf3', letterSpacing: 0.5 }}>
            Admin Console
          </Typography>
          <Chip label="GOVERNANCE" size="small" sx={{ ml: 1, bgcolor: '#1f2d3d', color: '#58a6ff', fontWeight: 600, fontSize: 10 }} />
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: '#8b949e' }}>{email}</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#161b22',
            borderRight: '1px solid #30363d',
            mt: '48px',
          },
        }}
      >
        <List dense sx={{ pt: 1 }}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={active}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': { bgcolor: '#1f2d3d', color: '#58a6ff' },
                    '&.Mui-selected .MuiListItemIcon-root': { color: '#58a6ff' },
                    color: '#8b949e',
                    '& .MuiListItemIcon-root': { color: '#8b949e', minWidth: 32 },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} slotProps={{ primary: { style: { fontSize: 13, fontWeight: active ? 600 : 400 } } }} />
                </ListItemButton>
              </ListItem>
            )
          })}
          <Divider sx={{ my: 1, borderColor: '#30363d' }} />
        </List>
      </Drawer>

      <Box component="main" sx={{ flex: 1, pt: '48px', pl: `${DRAWER_WIDTH}px`, bgcolor: '#0f1117', minHeight: '100vh' }}>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  )
}
