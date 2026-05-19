'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard,
  ViewKanban,
  RecordVoiceOver,
  EventNote,
  MonetizationOn,
  Description,
  Email,
  Person,
  CalendarMonth,
  BarChart,
  Security,
  VpnKey,
  Settings,
  Logout,
  Assignment,
} from '@mui/icons-material';

const DRAWER_WIDTH = 220;

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Dashboard },
  { href: '/jobs', label: 'Pipeline', icon: ViewKanban },
  { href: '/interview-prep', label: 'Interview Prep', icon: RecordVoiceOver },
  { href: '/interviews', label: 'Interviews', icon: EventNote },
  { href: '/offers', label: 'Offers', icon: MonetizationOn },
  { href: '/documents', label: 'Documents', icon: Description },
  { href: '/emails', label: 'Emails', icon: Email },
  { href: '/profile', label: 'Profile', icon: Person },
  { href: '/calendar', label: 'Calendar', icon: CalendarMonth },
  { href: '/analytics', label: 'Analytics', icon: BarChart },
  { href: '/audit-logs', label: 'Audit Logs', icon: Assignment },
  { href: '/api-keys', label: 'API Keys', icon: VpnKey },
  { href: '/settings/security', label: 'Security', icon: Security },
  { href: '/settings/account', label: 'Account', icon: Settings },
];

interface NavLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function NavLayout({ children, title, subtitle }: NavLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) return null;

  const initials = session.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session.user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#0F172A',
            color: 'white',
            border: 'none',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2, fontSize: '1rem' }}>
              CareerPropel
            </Typography>
            <Typography variant="caption" sx={{ color: '#60A5FA', display: 'block', mt: 0.25 }}>
              AI Career Platform
            </Typography>
          </Link>
        </Box>

        {/* Nav Items */}
        <List sx={{ flex: 1, py: 1.5, overflowY: 'auto', overflowX: 'hidden' }} disablePadding>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/');
            const IconComponent = item.icon;
            return (
              <ListItem key={item.href} disablePadding sx={{ px: 1, mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.875,
                    px: 1.5,
                    minHeight: 40,
                    color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                    bgcolor: isActive ? 'rgba(37,99,235,0.85)' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(37,99,235,0.9)' : 'rgba(255,255,255,0.07)',
                      color: 'white',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(37,99,235,0.85)',
                      '&:hover': { bgcolor: 'rgba(37,99,235,0.95)' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                    <IconComponent sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: isActive ? 600 : 400 }, noWrap: true } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* User Footer */}
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              src={(session.user as { avatarUrl?: string })?.avatarUrl}
              sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: 'primary.main' }}
            >
              {initials}
            </Avatar>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {session.user?.name || session.user?.email}
            </Typography>
          </Box>
          <Button
            fullWidth
            size="small"
            startIcon={<Logout sx={{ fontSize: '14px !important' }} />}
            onClick={() => signOut({ callbackUrl: '/login' })}
            sx={{
              color: 'rgba(255,255,255,0.45)',
              justifyContent: 'flex-start',
              px: 0.5,
              fontSize: '0.75rem',
              '&:hover': { color: 'rgba(255,255,255,0.8)', bgcolor: 'transparent' },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Page Header */}
        {(title || subtitle) && (
          <Box
            component="header"
            sx={{
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              px: 3,
              py: 2,
              flexShrink: 0,
            }}
          >
            {title && (
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Scrollable Page Content */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
