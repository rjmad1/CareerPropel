'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Description,
  Download,
  ContentCopy,
  Check,
  Refresh,
  AutoAwesome,
} from '@mui/icons-material';

type DocType = 'resume' | 'cover_letter';
type Tone = 'professional' | 'enthusiastic' | 'concise';

interface Job {
  id: string;
  title: string;
  company: string;
}

interface GeneratedDoc {
  title: string;
  content: string;
  wordCount: number;
  generatedAt: string;
}

interface HistoryEntry {
  doc: GeneratedDoc;
  type: DocType;
  jobTitle?: string;
}

export default function DocumentsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedDoc | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const [docType, setDocType] = useState<DocType>('resume');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [focusAreas, setFocusAreas] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [activeHistory, setActiveHistory] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    fetch('/api/jobs?limit=50')
      .then((r) => r.json())
      .then((j) => setJobs(Array.isArray(j) ? j : j.data ?? []))
      .catch(() => {});
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError('');
    setResult(null);
    setActiveHistory(null);

    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: docType,
          jobId: selectedJobId || undefined,
          tone,
          focusAreas: focusAreas ? focusAreas.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          additionalContext: additionalContext || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Generation failed');
      }

      const json = await res.json();
      const doc: GeneratedDoc = json.data ?? json;
      setResult(doc);

      const job = jobs.find((j) => j.id === selectedJobId);
      setHistory((prev) => [{ doc, type: docType, jobTitle: job ? `${job.title} @ ${job.company}` : undefined }, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }, [docType, selectedJobId, tone, focusAreas, additionalContext, jobs]);

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload(doc: GeneratedDoc) {
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const displayedDoc = activeHistory?.doc ?? result;

  return (
    <NavLayout
      title="Document Generator"
      subtitle="AI-powered resume and cover letter tailored to each job"
    >
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        <Grid container spacing={3}>
          {/* Left: Controls */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="h6">Generate Document</Typography>

                  {/* Type Toggle */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Document Type</Typography>
                    <ToggleButtonGroup
                      value={docType}
                      exclusive
                      onChange={(_, v) => v && setDocType(v)}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value="resume">Resume</ToggleButton>
                      <ToggleButton value="cover_letter">Cover Letter</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Job selector */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Tailor for Job (optional)</InputLabel>
                    <Select
                      value={selectedJobId}
                      label="Tailor for Job (optional)"
                      onChange={(e) => setSelectedJobId(e.target.value)}
                    >
                      <MenuItem value="">General / No specific job</MenuItem>
                      {jobs.map((j) => (
                        <MenuItem key={j.id} value={j.id}>{j.title} — {j.company}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Tone (cover letter only) */}
                  {docType === 'cover_letter' && (
                    <FormControl>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>Tone</Typography>
                      <RadioGroup value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                        {([
                          ['professional', 'Professional', 'Confident and formal'],
                          ['enthusiastic', 'Enthusiastic', 'Warm and energetic'],
                          ['concise', 'Concise', 'Under 250 words, direct'],
                        ] as [Tone, string, string][]).map(([val, label, desc]) => (
                          <FormControlLabel
                            key={val}
                            value={val}
                            control={<Radio size="small" />}
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
                                <Typography variant="caption" color="text.secondary">{desc}</Typography>
                              </Box>
                            }
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  <TextField
                    label="Focus Areas (comma-separated)"
                    size="small"
                    fullWidth
                    placeholder="leadership, system design, ML"
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                  />

                  <TextField
                    label="Additional Context"
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Any specific points to highlight..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGenerate}
                    disabled={generating}
                    startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
                  >
                    {generating ? 'Generating…' : 'Generate with AI'}
                  </Button>

                  {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
                </CardContent>
              </Card>

              {/* History */}
              {history.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Session History</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {history.map((entry, i) => (
                        <Box
                          key={i}
                          onClick={() => setActiveHistory(entry)}
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: activeHistory === entry ? 'primary.light' : 'divider',
                            bgcolor: activeHistory === entry ? 'primary.50' : 'grey.50',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: activeHistory === entry ? 'primary.50' : 'grey.100' },
                          }}
                        >
                          <Typography variant="caption" noWrap sx={{ fontWeight: 500, display: 'block' }}>{entry.doc.title}</Typography>
                          {entry.jobTitle && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{entry.jobTitle}</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>

          {/* Right: Output */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {displayedDoc ? (
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Doc Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{displayedDoc.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {displayedDoc.wordCount} words · {new Date(displayedDoc.generatedAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      size="small"
                      startIcon={copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                      onClick={() => handleCopy(displayedDoc.content)}
                      color={copied ? 'success' : 'inherit'}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Download fontSize="small" />}
                      onClick={() => handleDownload(displayedDoc)}
                    >
                      .md
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Refresh fontSize="small" />}
                      onClick={handleGenerate}
                      disabled={generating}
                    >
                      Regenerate
                    </Button>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
                  <Box
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: '0.8125rem',
                      color: 'text.primary',
                      lineHeight: 1.7,
                      m: 0,
                    }}
                  >
                    {displayedDoc.content}
                  </Box>
                </Box>
              </Card>
            ) : (
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 380,
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  p: 4,
                }}
              >
                <Description sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No document generated yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                  Configure your options on the left and click <strong>Generate with AI</strong> to create a tailored document.
                </Typography>
                {jobs.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2, maxWidth: 340, textAlign: 'left' }}>
                    Add jobs to your pipeline for better tailoring — the AI will use the job description to optimise keywords.
                  </Alert>
                )}
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </NavLayout>
  );
}
