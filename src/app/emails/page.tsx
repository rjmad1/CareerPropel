'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  Email,
  ContentCopy,
  Check,
  AutoAwesome,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

type EmailType = 'thank_you' | 'follow_up' | 'counter_offer' | 'withdraw' | 'recruiter_reach_out';

interface EmailForm {
  type: EmailType;
  jobTitle: string;
  company: string;
  interviewerName: string;
  candidateName: string;
  daysSinceInterview: string;
  offerAmount: string;
  targetAmount: string;
  reason: string;
  context: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
}

const EMAIL_TYPES: { value: EmailType; label: string; description: string }[] = [
  { value: 'thank_you', label: 'Thank You', description: 'Post-interview thank you note' },
  { value: 'follow_up', label: 'Follow Up', description: 'Check-in after interview or application' },
  { value: 'counter_offer', label: 'Counter Offer', description: 'Negotiate salary or terms' },
  { value: 'withdraw', label: 'Withdraw', description: 'Politely decline or withdraw application' },
  { value: 'recruiter_reach_out', label: 'Recruiter Outreach', description: 'Connect with a recruiter' },
];

const FIELD_VISIBILITY: Record<EmailType, (keyof EmailForm)[]> = {
  thank_you: ['jobTitle', 'company', 'interviewerName', 'candidateName', 'context'],
  follow_up: ['jobTitle', 'company', 'interviewerName', 'candidateName', 'daysSinceInterview', 'context'],
  counter_offer: ['jobTitle', 'company', 'candidateName', 'offerAmount', 'targetAmount', 'reason', 'context'],
  withdraw: ['jobTitle', 'company', 'candidateName', 'reason', 'context'],
  recruiter_reach_out: ['jobTitle', 'company', 'interviewerName', 'candidateName', 'context'],
};

const FIELD_LABELS: Partial<Record<keyof EmailForm, string>> = {
  jobTitle: 'Job Title',
  company: 'Company',
  interviewerName: 'Interviewer / Recruiter Name',
  candidateName: 'Your Name',
  daysSinceInterview: 'Days Since Interview',
  offerAmount: 'Current Offer Amount ($)',
  targetAmount: 'Target Amount ($)',
  reason: 'Reason / Notes',
  context: 'Additional Context',
};

const DEFAULT_FORM: EmailForm = {
  type: 'thank_you',
  jobTitle: '',
  company: '',
  interviewerName: '',
  candidateName: '',
  daysSinceInterview: '',
  offerAmount: '',
  targetAmount: '',
  reason: '',
  context: '',
};

export default function EmailsPage() {
  const [form, setForm] = useState<EmailForm>(DEFAULT_FORM);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedEmail | null>(null);
  const [copied, setCopied] = useState<'subject' | 'body' | 'all' | null>(null);
  const [history, setHistory] = useState<{ email: GeneratedEmail; type: EmailType; label: string }[]>([]);
  const [activeHistory, setActiveHistory] = useState<GeneratedEmail | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const visibleFields = FIELD_VISIBILITY[form.type];

  function setField(key: keyof EmailForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError('');
    setResult(null);
    setActiveHistory(null);

    try {
      const payload: Record<string, unknown> = { type: form.type };
      if (form.jobTitle) payload.jobTitle = form.jobTitle;
      if (form.company) payload.company = form.company;
      if (form.interviewerName) payload.interviewerName = form.interviewerName;
      if (form.candidateName) payload.candidateName = form.candidateName;
      if (form.daysSinceInterview) payload.daysSinceInterview = parseInt(form.daysSinceInterview, 10);
      if (form.offerAmount) payload.offerAmount = parseFloat(form.offerAmount);
      if (form.targetAmount) payload.targetAmount = parseFloat(form.targetAmount);
      if (form.reason) payload.reason = form.reason;
      if (form.context) payload.context = form.context;

      const res = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Generation failed');
      }

      const json = await res.json();
      const email: GeneratedEmail = json.data ?? json;
      setResult(email);

      const typeInfo = EMAIL_TYPES.find((t) => t.value === form.type)!;
      const label = [form.jobTitle, form.company].filter(Boolean).join(' @ ') || typeInfo.label;
      setHistory((prev) => [{ email, type: form.type, label }, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }, [form]);

  async function handleCopy(text: string, key: 'subject' | 'body' | 'all') {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const displayed = activeHistory ?? result;

  return (
    <NavLayout
      title="Email Generator"
      subtitle="AI-drafted professional emails for every stage of your job search"
    >
      <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        <Grid container spacing={3}>
          {/* Left: Controls */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Email Type Selection */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Email Type</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {EMAIL_TYPES.map((t) => (
                      <Box
                        key={t.value}
                        onClick={() => setField('type', t.value)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: form.type === t.value ? 'primary.main' : 'divider',
                          bgcolor: form.type === t.value ? 'primary.50' : 'background.paper',
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'primary.light', bgcolor: form.type === t.value ? 'primary.50' : 'grey.50' },
                        }}
                      >
                        <Typography variant="body2" color={form.type === t.value ? 'primary.main' : 'text.primary'} sx={{ fontWeight: 600 }}>
                          {t.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Dynamic Fields */}
              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6">Details</Typography>

                  {visibleFields.map((key) => {
                    const label = FIELD_LABELS[key] ?? key;
                    const isTextarea = key === 'reason' || key === 'context';
                    const isNumber = key === 'daysSinceInterview' || key === 'offerAmount' || key === 'targetAmount';

                    return (
                      <TextField
                        key={key}
                        label={label}
                        size="small"
                        fullWidth
                        type={isNumber ? 'number' : 'text'}
                        multiline={isTextarea}
                        rows={isTextarea ? 2 : undefined}
                        value={(form as any)[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}…`}
                      />
                    );
                  })}

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGenerate}
                    disabled={generating}
                    startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
                  >
                    {generating ? 'Generating…' : 'Generate Email'}
                  </Button>

                  {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
                </CardContent>
              </Card>

              {/* History */}
              {history.length > 0 && (
                <Card>
                  <CardContent sx={{ pb: showHistory ? 2 : 1.5 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      onClick={() => setShowHistory((v) => !v)}
                    >
                      <Typography variant="subtitle2">Session History ({history.length})</Typography>
                      <IconButton size="small">{showHistory ? <ExpandLess /> : <ExpandMore />}</IconButton>
                    </Box>
                    <Collapse in={showHistory}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1.5 }}>
                        {history.map((entry, i) => {
                          const typeInfo = EMAIL_TYPES.find((t) => t.value === entry.type)!;
                          return (
                            <Box
                              key={i}
                              onClick={() => setActiveHistory(entry.email)}
                              sx={{
                                px: 1.5, py: 1, borderRadius: 1.5, border: '1px solid',
                                borderColor: activeHistory === entry.email ? 'primary.light' : 'divider',
                                bgcolor: activeHistory === entry.email ? 'primary.50' : 'grey.50',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'grey.100' },
                              }}
                            >
                              <Typography variant="caption" noWrap sx={{ fontWeight: 500, display: 'block' }}>
                                {typeInfo.label} — {entry.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {entry.email.subject}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>

          {/* Right: Output */}
          <Grid size={{ xs: 12, lg: 7 }}>
            {displayed ? (
              <Card>
                {/* Subject */}
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Subject</Typography>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{displayed.subject}</Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={copied === 'subject' ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    onClick={() => handleCopy(displayed.subject, 'subject')}
                    color={copied === 'subject' ? 'success' : 'inherit'}
                    sx={{ flexShrink: 0, ml: 1.5 }}
                  >
                    {copied === 'subject' ? 'Copied' : 'Copy'}
                  </Button>
                </Box>

                {/* Body */}
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Body</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        size="small"
                        startIcon={copied === 'body' ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                        onClick={() => handleCopy(displayed.body, 'body')}
                        color={copied === 'body' ? 'success' : 'inherit'}
                      >
                        {copied === 'body' ? 'Copied' : 'Copy body'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={copied === 'all' ? <Check fontSize="small" /> : <Email fontSize="small" />}
                        onClick={() => handleCopy(`Subject: ${displayed.subject}\n\n${displayed.body}`, 'all')}
                        color={copied === 'all' ? 'success' : 'primary'}
                      >
                        {copied === 'all' ? 'Copied!' : 'Copy all'}
                      </Button>
                    </Box>
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"Roboto", sans-serif',
                      fontSize: '0.875rem',
                      color: 'text.primary',
                      lineHeight: 1.7,
                      minHeight: 260,
                      maxHeight: '60vh',
                      overflowY: 'auto',
                      m: 0,
                    }}
                  >
                    {displayed.body}
                  </Box>
                </CardContent>

                {/* Regenerate */}
                <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Button
                    size="small"
                    startIcon={generating ? <CircularProgress size={14} /> : <AutoAwesome fontSize="small" />}
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? 'Regenerating…' : 'Regenerate'}
                  </Button>
                </Box>
              </Card>
            ) : (
              <Card
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: 380, border: '1.5px dashed', borderColor: 'divider', textAlign: 'center', p: 4,
                }}
              >
                <Email sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No email generated yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                  Choose an email type, fill in the details, and click <strong>Generate Email</strong> to get a tailored professional email.
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </NavLayout>
  );
}
