'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  Divider,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import LogoutIcon from '@mui/icons-material/Logout'
import WorkIcon from '@mui/icons-material/Work'
import BusinessIcon from '@mui/icons-material/Business'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'

interface Job {
  id: string
  title: string
  company: string
  stage: string
  url?: string
  createdAt: string
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}))

const JobListItem = styled(ListItem)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
}))

const StageChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(1),
}))

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [url, setUrl] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchJobs()
    }
  }, [status])

  async function fetchJobs() {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      const data = await response.json()

      if (data.data) {
        setJobs(data.data)
      }
      setError('')
    } catch (err) {
      setError('Failed to fetch jobs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSubmitLoading(true)
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, url, stage: 'interested' }),
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      setTitle('')
      setCompany('')
      setUrl('')
      await fetchJobs()
    } catch (err) {
      setError('Failed to add job')
      console.error(err)
    } finally {
      setSubmitLoading(false)
    }
  }

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: any } = {
      interested: 'info',
      applied: 'primary',
      interview: 'warning',
      offer: 'success',
      rejected: 'error',
    }
    return colors[stage] || 'default'
  }

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            CareerPropel Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 3, opacity: 0.9 }}>
            {session.user?.email}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => signOut()}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Add New Job Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <StyledCard>
              <CardHeader
                title="Add New Job"
                avatar={<AddIcon sx={{ color: 'primary.main' }} />}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box component="form" onSubmit={handleAddJob} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Job Title"
                    placeholder="e.g., Senior Software Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    disabled={submitLoading}
                  />
                  <TextField
                    label="Company"
                    placeholder="e.g., Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    disabled={submitLoading}
                  />
                  <TextField
                    label="Job URL"
                    placeholder="https://example.com/jobs/123 (optional)"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={submitLoading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={submitLoading}
                    startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    sx={{ mt: 1 }}
                  >
                    {submitLoading ? 'Adding Job...' : 'Add Job'}
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Jobs List */}
          <Grid size={{ xs: 12, md: 6 }}>
            <StyledCard>
              <CardHeader
                title="Your Jobs"
                action={
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={fetchJobs}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                }
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : jobs.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No jobs yet. Add one to get started!
                  </Typography>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {jobs.map((job) => (
                      <JobListItem key={job.id} disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <WorkIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {job.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {job.company}
                                </Typography>
                              </Box>
                              <StageChip
                                label={job.stage}
                                size="small"
                                color={getStageColor(job.stage)}
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </JobListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Authentication Status */}
          <Grid size={{ xs: 12 }}>
            <StyledCard>
              <CardHeader
                title="Authentication Status"
                avatar={<CheckCircleIcon sx={{ color: 'success.main' }} />}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {session.user?.email}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                          Authenticated
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                  ✓ Your authentication is working! All API endpoints are protected and will only return your data.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
