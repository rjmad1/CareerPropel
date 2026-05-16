'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  py: 8,
  mb: 6,
  borderRadius: theme.spacing(2),
  textAlign: 'center',
}))

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}))

const StatusCard = styled(Paper)(({ theme }) => ({
  p: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}))

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const features = [
    {
      title: 'Intelligent Automation',
      description: 'Automate your job search and application process with AI-powered insights',
      icon: AutoFixHighIcon,
    },
    {
      title: 'Track Applications',
      description: 'Keep track of all your job applications in one centralized dashboard',
      icon: AnalyticsIcon,
    },
    {
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and encryption',
      icon: SecurityIcon,
    },
    {
      title: 'Lightning Fast',
      description: 'Optimized performance for seamless user experience',
      icon: SpeedIcon,
    },
  ]

  const statusItems = [
    { label: 'Configuration', status: '✓ Complete', color: 'success' },
    { label: 'Database Setup', status: '✓ Complete', color: 'success' },
    { label: 'Authentication', status: '✓ Complete', color: 'success' },
    { label: 'Security Framework', status: '✓ Complete', color: 'success' },
    { label: 'Frontend UI', status: '✓ Production Ready', color: 'success' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <RocketLaunchIcon sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            CareerPropel
          </Typography>
          {status === 'authenticated' ? (
            <Button
              color="inherit"
              onClick={() => router.push('/dashboard')}
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            >
              Dashboard
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={() => router.push('/login')}
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <RocketLaunchIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            CareerPropel
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 300, mb: 3, opacity: 0.95 }}>
            AI-Native Career Management Platform
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', opacity: 0.9 }}>
            Your intelligent job application automation and career orchestration system
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {status === 'authenticated' ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/dashboard')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </>
            )}
          </Box>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, pb: 6 }}>
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Powerful Features
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard>
                    <CardContent sx={{ textAlign: 'center', flex: 1 }}>
                      <IconComponent
                        sx={{
                          fontSize: 48,
                          color: 'primary.main',
                          mb: 2,
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Grid>
              )
            })}
          </Grid>
        </Box>

        {/* Project Status Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Project Status
          </Typography>
          <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
            {statusItems.map((item, index) => (
              <Grid item xs={12} key={index}>
                <StatusCard>
                  <CheckCircleIcon color="success" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.label}
                    </Typography>
                  </Box>
                  <Chip label={item.status} color={item.color} variant="outlined" size="small" />
                </StatusCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action Section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Ready to Transform Your Career?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start using CareerPropel today and take control of your career journey
          </Typography>
          {status === 'authenticated' ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
            >
              Sign In Now
            </Button>
          )}
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            © 2026 CareerPropel. All rights reserved. | AI-Native Career Management Platform
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
