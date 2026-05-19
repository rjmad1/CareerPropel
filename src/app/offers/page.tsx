'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  Delete,
  Refresh,
  Calculate,
  AutoAwesome,
  Check as CheckIcon,
  Close,
  ExpandMore,
  ExpandLess,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface Offer {
  id: string;
  jobId: string;
  baseSalary: number;
  bonusPercent: number;
  equity: string;
  startDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  notes?: string;
  job?: { title: string; company: string };
}

interface NewOfferForm {
  jobId: string;
  baseSalary: string;
  bonusPercent: string;
  equity: string;
  startDate: string;
  notes: string;
}


export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string; company: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'compare' | 'calculator'>('list');
  const [submitting, setSubmitting] = useState(false);
  const [negotiateTarget, setNegotiateTarget] = useState<Offer | null>(null);

  const [form, setForm] = useState<NewOfferForm>({
    jobId: '',
    baseSalary: '',
    bonusPercent: '',
    equity: '',
    startDate: '',
    notes: '',
  });

  // Salary calculator state
  const [calcBase, setCalcBase] = useState('150000');
  const [calcBonus, setCalcBonus] = useState('15');
  const [calcEquityValue, setCalcEquityValue] = useState('50000');
  const [calcVestYears, setCalcVestYears] = useState('4');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [offersRes, jobsRes] = await Promise.all([
        fetch('/api/offers?limit=100'),
        fetch('/api/jobs?limit=100'),
      ]);
      const offersJson = await offersRes.json();
      const jobsJson = await jobsRes.json();

      const rawOffers: Offer[] = Array.isArray(offersJson) ? offersJson : offersJson.data ?? [];
      const rawJobs = Array.isArray(jobsJson) ? jobsJson : jobsJson.data ?? [];

      setOffers(rawOffers);
      setJobs(rawJobs);
    } catch {
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jobId || !form.baseSalary || !form.startDate) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: form.jobId,
          baseSalary: parseFloat(form.baseSalary),
          bonusPercent: parseFloat(form.bonusPercent || '0'),
          equity: form.equity,
          startDate: form.startDate,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create offer');
      setShowAddForm(false);
      setForm({ jobId: '', baseSalary: '', bonusPercent: '', equity: '', startDate: '', notes: '' });
      await fetchData();
    } catch {
      setError('Failed to log offer');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(offerId: string) {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await fetch(`/api/offers/${offerId}`, { method: 'DELETE' });
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch {
      setError('Failed to delete offer');
    }
  }

  async function handleStatusChange(offerId: string, status: string) {
    try {
      await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: status as Offer['status'] } : o))
      );
    } catch {
      setError('Failed to update status');
    }
  }

  const totalComp = (o: Offer) => o.baseSalary + (o.baseSalary * (o.bonusPercent ?? 0)) / 100;

  const stats = useMemo(() => {
    if (offers.length === 0)
      return { count: 0, avgBase: 0, highestBase: 0, pending: 0 };
    const bases = offers.map((o) => o.baseSalary).filter(Boolean);
    return {
      count: offers.length,
      avgBase: bases.length ? Math.round(bases.reduce((a, b) => a + b, 0) / bases.length) : 0,
      highestBase: bases.length ? Math.max(...bases) : 0,
      pending: offers.filter((o) => o.status === 'pending' || o.status === 'negotiating').length,
    };
  }, [offers]);

  const calcAnnualBonus = (parseFloat(calcBase) * parseFloat(calcBonus || '0')) / 100;
  const calcAnnualEquity = parseFloat(calcEquityValue || '0') / parseFloat(calcVestYears || '4');
  const calcTotal = parseFloat(calcBase || '0') + calcAnnualBonus + calcAnnualEquity;

  const KPI_COLORS: Record<number, string> = { 0: '#2563EB', 1: '#10B981', 2: '#7C3AED', 3: '#F97316' };
  const kpiItems = [
    { label: 'Total Offers', value: stats.count },
    { label: 'Avg Base Salary', value: stats.avgBase ? `$${stats.avgBase.toLocaleString()}` : '—' },
    { label: 'Highest Base', value: stats.highestBase ? `$${stats.highestBase.toLocaleString()}` : '—' },
    { label: 'Active Negotiations', value: stats.pending },
  ];

  return (
    <NavLayout
      title="Offers"
      subtitle="Track, compare, and evaluate compensation packages"
    >
      {negotiateTarget && (
        <NegotiateModal
          offer={negotiateTarget}
          onClose={() => setNegotiateTarget(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>{error}</Alert>}

        {/* KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {kpiItems.map((kpi, idx) => (
            <Grid size={{ xs: 6, sm: 3 }} key={kpi.label}>
              <Card>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>{kpi.label}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: KPI_COLORS[idx] }}>{kpi.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs + Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Tabs
            value={activeView}
            onChange={(_, v) => setActiveView(v)}
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
          >
            <Tab label="List" value="list" />
            <Tab label="Compare" value="compare" />
            <Tab label="Calculator" value="calculator" />
          </Tabs>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={fetchData} title="Refresh">
              <Refresh fontSize="small" />
            </IconButton>
            <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowAddForm(true)}>
              Log Offer
            </Button>
          </Box>
        </Box>

        {/* Add Offer Dialog */}
        <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Log New Offer</DialogTitle>
          <form onSubmit={handleAddOffer}>
            <DialogContent sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Job</InputLabel>
                    <Select
                      value={form.jobId}
                      label="Job"
                      onChange={(e) => setForm({ ...form, jobId: e.target.value })}
                    >
                      <MenuItem value="" disabled>Select a job...</MenuItem>
                      {jobs.map((j) => (
                        <MenuItem key={j.id} value={j.id}>{j.title} — {j.company}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <TextField label="Base Salary ($)" type="number" required fullWidth placeholder="150000"
                    value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} />
                </Grid>
                <Grid size={6}>
                  <TextField label="Bonus %" type="number" fullWidth placeholder="15"
                    value={form.bonusPercent} onChange={(e) => setForm({ ...form, bonusPercent: e.target.value })} />
                </Grid>
                <Grid size={6}>
                  <TextField label="Equity" fullWidth placeholder="0.1% RSUs / $200k over 4yr"
                    value={form.equity} onChange={(e) => setForm({ ...form, equity: e.target.value })} />
                </Grid>
                <Grid size={6}>
                  <TextField label="Start Date" type="date" required fullWidth slotProps={{ inputLabel: { shrink: true } }}
                    value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </Grid>
                <Grid size={12}>
                  <TextField label="Notes" fullWidth multiline rows={2} placeholder="Negotiation notes, benefits, PTO..."
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setShowAddForm(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Saving...' : 'Log Offer'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Views */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : activeView === 'list' ? (
          <OffersList offers={offers} onDelete={handleDelete} onStatusChange={handleStatusChange} totalComp={totalComp} onNegotiate={setNegotiateTarget} />
        ) : activeView === 'compare' ? (
          <ComparisonMatrix offers={offers} jobs={jobs} totalComp={totalComp} />
        ) : (
          <SalaryCalculator
            calcBase={calcBase} setCalcBase={setCalcBase}
            calcBonus={calcBonus} setCalcBonus={setCalcBonus}
            calcEquityValue={calcEquityValue} setCalcEquityValue={setCalcEquityValue}
            calcVestYears={calcVestYears} setCalcVestYears={setCalcVestYears}
            calcAnnualBonus={calcAnnualBonus}
            calcAnnualEquity={calcAnnualEquity}
            calcTotal={calcTotal}
          />
        )}
      </Box>
    </NavLayout>
  );
}

const STATUS_CHIP_COLOR: Record<string, 'default' | 'warning' | 'success' | 'error' | 'secondary'> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
  negotiating: 'secondary',
};

function OffersList({ offers, onDelete, onStatusChange, totalComp, onNegotiate }: {
  offers: Offer[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  totalComp: (o: Offer) => number;
  onNegotiate: (offer: Offer) => void;
}) {
  if (offers.length === 0) {
    return (
      <Card sx={{ textAlign: 'center', py: 10 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>No offers yet</Typography>
          <Typography variant="body2" color="text.secondary">Log your first offer using the button above.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {offers.map((offer) => (
        <Card key={offer.id}>
          <CardContent sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                <Chip
                  label={offer.status}
                  size="small"
                  color={STATUS_CHIP_COLOR[offer.status] ?? 'default'}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                {offer.job && (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {offer.job.title} @ {offer.job.company}
                  </Typography>
                )}
              </Box>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                {[
                  { label: 'Base', value: `$${offer.baseSalary.toLocaleString()}` },
                  ...(offer.bonusPercent > 0 ? [{ label: 'Bonus', value: `${offer.bonusPercent}% ($${Math.round((offer.baseSalary * offer.bonusPercent) / 100).toLocaleString()})` }] : []),
                  ...(offer.equity ? [{ label: 'Equity', value: offer.equity }] : []),
                  { label: 'Total Comp', value: `$${totalComp(offer).toLocaleString()}`, green: true },
                ].map((stat) => (
                  <Grid key={stat.label}>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="body2" color={stat.green ? 'success.main' : 'text.primary'} sx={{ fontWeight: stat.green ? 700 : 500 }}>
                      {stat.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              {offer.startDate && (
                <Typography variant="caption" color="text.secondary">
                  Start: {new Date(offer.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
              )}
              {offer.notes && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">{offer.notes}</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', flexShrink: 0 }}>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={offer.status}
                  onChange={(e) => onStatusChange(offer.id, e.target.value)}
                  sx={{ fontSize: '0.8125rem' }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="negotiating">Negotiating</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              {offer.status !== 'rejected' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => onNegotiate(offer)}
                >
                  Negotiate
                </Button>
              )}
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(offer.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

function ComparisonMatrix({ offers, jobs, totalComp }: {
  offers: Offer[];
  jobs: { id: string; title: string; company: string }[];
  totalComp: (o: Offer) => number;
}) {
  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j]));
  const activeOffers = offers.filter((o) => o.status !== 'rejected');

  if (activeOffers.length === 0) {
    return (
      <Card sx={{ textAlign: 'center', py: 8 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">No active offers to compare.</Typography>
        </CardContent>
      </Card>
    );
  }

  const fields = ['Base Salary', 'Bonus %', 'Bonus ($)', 'Equity', 'Total Comp', 'Start Date', 'Status'];

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120 }}>Metric</TableCell>
              {activeOffers.map((o) => {
                const j = jobMap[o.jobId];
                return (
                  <TableCell key={o.id} sx={{ minWidth: 150 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{j ? j.title : 'Unknown Role'}</Typography>
                    {j && <Typography variant="caption" color="text.secondary">{j.company}</Typography>}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field} hover>
                <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{field}</TableCell>
                {activeOffers.map((o) => {
                  const bonus = Math.round((o.baseSalary * (o.bonusPercent ?? 0)) / 100);
                  const tc = totalComp(o);
                  const values: Record<string, string> = {
                    'Base Salary': `$${o.baseSalary.toLocaleString()}`,
                    'Bonus %': `${o.bonusPercent ?? 0}%`,
                    'Bonus ($)': bonus > 0 ? `$${bonus.toLocaleString()}` : '—',
                    'Equity': o.equity || '—',
                    'Total Comp': `$${tc.toLocaleString()}`,
                    'Start Date': o.startDate ? new Date(o.startDate).toLocaleDateString() : '—',
                    'Status': o.status,
                  };
                  const isHighlight = field === 'Total Comp';
                  return (
                    <TableCell key={o.id} sx={{ fontWeight: isHighlight ? 700 : 400, color: isHighlight ? 'success.main' : 'text.primary' }}>
                      {values[field]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function SalaryCalculator(props: {
  calcBase: string; setCalcBase: (v: string) => void;
  calcBonus: string; setCalcBonus: (v: string) => void;
  calcEquityValue: string; setCalcEquityValue: (v: string) => void;
  calcVestYears: string; setCalcVestYears: (v: string) => void;
  calcAnnualBonus: number;
  calcAnnualEquity: number;
  calcTotal: number;
}) {
  const { calcBase, setCalcBase, calcBonus, setCalcBonus, calcEquityValue, setCalcEquityValue,
    calcVestYears, setCalcVestYears, calcAnnualBonus, calcAnnualEquity, calcTotal } = props;

  const fmt = (n: number) => isNaN(n) ? '—' : `$${Math.round(n).toLocaleString()}`;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calculate sx={{ color: 'primary.main' }} />
              <Typography variant="h6">Total Compensation Calculator</Typography>
            </Box>
            {[
              { label: 'Base Salary ($)', value: calcBase, set: setCalcBase, placeholder: '150000' },
              { label: 'Target Bonus %', value: calcBonus, set: setCalcBonus, placeholder: '15' },
              { label: 'Equity Total Value ($)', value: calcEquityValue, set: setCalcEquityValue, placeholder: '200000' },
              { label: 'Vesting Period (years)', value: calcVestYears, set: setCalcVestYears, placeholder: '4' },
            ].map((f) => (
              <TextField
                key={f.label}
                label={f.label}
                type="number"
                size="small"
                fullWidth
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
              />
            ))}
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Annual Breakdown</Typography>
            {[
              { label: 'Base Salary', value: fmt(parseFloat(calcBase || '0')) },
              { label: `Bonus (${calcBonus}%)`, value: fmt(calcAnnualBonus) },
              { label: 'Annual Equity', value: fmt(calcAnnualEquity), muted: true },
            ].map((row) => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="body2" color={row.muted ? 'text.disabled' : 'text.secondary'}>{row.label}</Typography>
                <Typography variant="body2" color={row.muted ? 'text.disabled' : 'text.primary'} sx={{ fontWeight: 500 }}>{row.value}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>Total Annual Comp</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{fmt(calcTotal)}</Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5 }}>
              * Equity calculated as ({fmt(parseFloat(calcEquityValue || '0'))} ÷ {calcVestYears} years). Actual value depends on vesting schedule and company performance.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

type NegotiationAction = 'counter' | 'accept' | 'reject' | 'info_request';

interface NegotiationEvent {
  action: NegotiationAction;
  counterAmount: number | null;
  notes: string | null;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
}

interface NegotiationScript {
  emailScript: string;
  talkingPoints: string[];
  redLines: string[];
}

function NegotiateModal({ offer, onClose, onStatusChange }: {
  offer: Offer;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState<NegotiationEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [action, setAction] = useState<NegotiationAction>('counter');
  const [counterAmount, setCounterAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const [targetSalary, setTargetSalary] = useState('');
  const [keyAchievements, setKeyAchievements] = useState('');
  const [competingOffer, setCompetingOffer] = useState('');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [script, setScript] = useState<NegotiationScript | null>(null);
  const [scriptError, setScriptError] = useState('');
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    fetch(`/api/offers/${offer.id}/negotiate`)
      .then((r) => r.json())
      .then((j) => setHistory(Array.isArray(j?.data?.history) ? j.data.history : []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [offer.id]);

  async function handleAction(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      const payload: Record<string, unknown> = { action };
      if (counterAmount) payload.counterAmount = parseFloat(counterAmount);
      if (notes) payload.notes = notes;

      const res = await fetch(`/api/offers/${offer.id}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Failed to record action');
      }
      const json = await res.json();
      const event: NegotiationEvent = json.data?.event;
      if (event) setHistory((prev) => [...prev, event]);
      onStatusChange(offer.id, json.data?.offer?.status ?? offer.status);
      setTab(0);
      setCounterAmount('');
      setNotes('');
    } catch (err: any) {
      setActionError(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateScript(e: React.FormEvent) {
    e.preventDefault();
    if (!targetSalary) return;
    setGeneratingScript(true);
    setScriptError('');
    setScript(null);
    try {
      const payload: Record<string, unknown> = { targetSalary: parseFloat(targetSalary) };
      if (keyAchievements) {
        payload.keyAchievements = keyAchievements.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (competingOffer) payload.competingOffer = parseFloat(competingOffer);

      const res = await fetch(`/api/offers/${offer.id}/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Script generation failed');
      }
      const json = await res.json();
      setScript(json.data ?? json);
      setShowScript(true);
    } catch (err: any) {
      setScriptError(err.message ?? 'Something went wrong');
    } finally {
      setGeneratingScript(false);
    }
  }

  const ACTION_LABELS: Record<NegotiationAction, string> = {
    counter: 'Counter Offer',
    accept: 'Accept Offer',
    reject: 'Reject Offer',
    info_request: 'Request Information',
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6">Salary Negotiation</Typography>
          {offer.job && (
            <Typography variant="caption" color="text.secondary">
              {offer.job.title} @ {offer.job.company} · Current: ${offer.baseSalary.toLocaleString()}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ ml: 1, mt: -0.5 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="History" />
          <Tab label="Record Action" />
          <Tab label="AI Script" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 300 }}>
        {/* History Tab */}
        {tab === 0 && (
          <Box>
            {loadingHistory ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : history.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No negotiation actions recorded yet.
                </Typography>
                <Button size="small" onClick={() => setTab(1)}>Record your first action →</Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {history.map((event, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 28, height: 28, borderRadius: '50%', bgcolor: 'grey.100',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, color: 'secondary.main', fontWeight: 700, fontSize: '0.7rem',
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{ACTION_LABELS[event.action]}</Typography>
                        {event.counterAmount && (
                          <Chip label={`$${event.counterAmount.toLocaleString()}`} size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {event.previousStatus} → {event.newStatus} · {new Date(event.timestamp).toLocaleString()}
                      </Typography>
                      {event.notes && (
                        <Box sx={{ mt: 0.5, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption">{event.notes}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Action Tab */}
        {tab === 1 && (
          <Box component="form" onSubmit={handleAction} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Action</Typography>
              <Grid container spacing={1}>
                {(Object.entries(ACTION_LABELS) as [NegotiationAction, string][]).map(([val, label]) => (
                  <Grid size={6} key={val}>
                    <Box
                      onClick={() => setAction(val)}
                      sx={{
                        p: 1.5, borderRadius: 2, border: '1px solid',
                        borderColor: action === val ? 'primary.main' : 'divider',
                        bgcolor: action === val ? 'primary.50' : 'background.paper',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.light' },
                      }}
                    >
                      <Typography variant="body2" color={action === val ? 'primary.main' : 'text.primary'} sx={{ fontWeight: 500 }}>
                        {label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {action === 'counter' && (
              <TextField
                label="Counter Amount ($)"
                type="number"
                size="small"
                fullWidth
                placeholder="e.g. 165000"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
              />
            )}

            <TextField
              label="Notes (optional)"
              multiline
              rows={3}
              size="small"
              fullWidth
              placeholder="Additional context about this negotiation step…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {actionError && <Alert severity="error">{actionError}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
            >
              {submitting ? 'Recording…' : 'Record Action'}
            </Button>
          </Box>
        )}

        {/* Script Tab */}
        {tab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box component="form" onSubmit={handleGenerateScript} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Target Salary ($)"
                type="number"
                size="small"
                fullWidth
                required
                placeholder="e.g. 175000"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
              />
              <TextField
                label="Key Achievements (comma-separated)"
                size="small"
                fullWidth
                placeholder="Led team of 8, shipped X feature, reduced latency by 40%"
                value={keyAchievements}
                onChange={(e) => setKeyAchievements(e.target.value)}
              />
              <TextField
                label="Competing Offer ($)"
                type="number"
                size="small"
                fullWidth
                placeholder="Optional — strengthens leverage"
                value={competingOffer}
                onChange={(e) => setCompetingOffer(e.target.value)}
              />

              {scriptError && <Alert severity="error">{scriptError}</Alert>}

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={generatingScript || !targetSalary}
                startIcon={generatingScript ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
              >
                {generatingScript ? 'Generating Script…' : 'Generate AI Script'}
              </Button>
            </Box>

            {script && (
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Button
                    size="small"
                    onClick={() => setShowScript((v) => !v)}
                    endIcon={showScript ? <ExpandLess /> : <ExpandMore />}
                    sx={{ mb: 0.5 }}
                  >
                    Email Script
                  </Button>
                  {showScript && (
                    <Box
                      component="pre"
                      sx={{
                        p: 1.5, bgcolor: 'grey.50', borderRadius: 1,
                        fontSize: '0.75rem', whiteSpace: 'pre-wrap',
                        lineHeight: 1.6, maxHeight: 200, overflowY: 'auto', m: 0,
                      }}
                    >
                      {script.emailScript}
                    </Box>
                  )}
                </Box>

                {script.talkingPoints?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Talking Points</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {script.talkingPoints.map((pt, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, flexShrink: 0 }}>→</Typography>
                          <Typography variant="caption">{pt}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {script.redLines?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Walk-Away Lines</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {script.redLines.map((line, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, flexShrink: 0 }}>✕</Typography>
                          <Typography variant="caption">{line}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
