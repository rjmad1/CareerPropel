'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Button,
  Input,
  Textarea,
  Card,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Select,
} from '@/components/ui';
import {
  Plus,
  Trash2,
  RefreshCw,
  Calculator as CalcIcon,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Loader2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

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

  const kpiItems = [
    { label: 'Total Offers', value: stats.count, textColor: 'text-blue-600', bgColor: 'bg-blue-50/50' },
    { label: 'Avg Base Salary', value: stats.avgBase ? `$${stats.avgBase.toLocaleString()}` : '—', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50/50' },
    { label: 'Highest Base', value: stats.highestBase ? `$${stats.highestBase.toLocaleString()}` : '—', textColor: 'text-purple-600', bgColor: 'bg-purple-50/50' },
    { label: 'Active Negotiations', value: stats.pending, textColor: 'text-orange-600', bgColor: 'bg-orange-50/50' },
  ];

  const jobOptions = useMemo(() => {
    return [
      { value: '', label: 'Select a job...', disabled: true },
      ...jobs.map((j) => ({
        value: j.id,
        label: `${j.title} — ${j.company}`,
      })),
    ];
  }, [jobs]);

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

      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiItems.map((kpi) => (
            <Card key={kpi.label} className="p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
              <span className={`text-2xl font-bold tracking-tight mt-2 ${kpi.textColor}`}>
                {kpi.value}
              </span>
            </Card>
          ))}
        </div>

        {/* Tabs + Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-1">
          <div className="flex gap-2">
            {(['list', 'compare', 'calculator'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all -mb-[5px] ${
                  activeView === view
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              title="Refresh"
              className="p-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Log Offer
            </Button>
          </div>
        </div>

        {/* Add Offer Dialog */}
        <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} className="max-w-lg">
          <ModalHeader onClose={() => setShowAddForm(false)}>
            <ModalTitle>Log New Offer</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleAddOffer}>
            <ModalBody className="flex flex-col gap-4">
              <Select
                label="Job"
                required
                options={jobOptions}
                value={form.jobId}
                onChange={(e) => setForm({ ...form, jobId: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Base Salary ($)"
                  type="number"
                  required
                  placeholder="150000"
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                />
                <Input
                  label="Bonus %"
                  type="number"
                  placeholder="15"
                  value={form.bonusPercent}
                  onChange={(e) => setForm({ ...form, bonusPercent: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Equity"
                  placeholder="0.1% RSUs / $200k over 4yr"
                  value={form.equity}
                  onChange={(e) => setForm({ ...form, equity: e.target.value })}
                />
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <Textarea
                label="Notes"
                placeholder="Negotiation notes, benefits, PTO..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddForm(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} loading={submitting}>
                Log Offer
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Views */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : activeView === 'list' ? (
          <OffersList
            offers={offers}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            totalComp={totalComp}
            onNegotiate={setNegotiateTarget}
          />
        ) : activeView === 'compare' ? (
          <ComparisonMatrix offers={offers} jobs={jobs} totalComp={totalComp} />
        ) : (
          <SalaryCalculator
            calcBase={calcBase}
            setCalcBase={setCalcBase}
            calcBonus={calcBonus}
            setCalcBonus={setCalcBonus}
            calcEquityValue={calcEquityValue}
            setCalcEquityValue={setCalcEquityValue}
            calcVestYears={calcVestYears}
            setCalcVestYears={setCalcVestYears}
            calcAnnualBonus={calcAnnualBonus}
            calcAnnualEquity={calcAnnualEquity}
            calcTotal={calcTotal}
          />
        )}
      </div>
    </NavLayout>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  negotiating: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const statusDropdownOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

function OffersList({
  offers,
  onDelete,
  onStatusChange,
  totalComp,
  onNegotiate,
}: {
  offers: Offer[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  totalComp: (o: Offer) => number;
  onNegotiate: (offer: Offer) => void;
}) {
  if (offers.length === 0) {
    return (
      <Card className="text-center py-12 p-6">
        <h4 className="text-base font-semibold text-slate-800 mb-1">No offers yet</h4>
        <p className="text-sm text-slate-500">Log your first offer using the button above.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="p-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${
                    STATUS_CLASSES[offer.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {offer.status}
                </span>
                {offer.job && (
                  <h4 className="text-sm font-bold text-slate-900">
                    {offer.job.title} <span className="font-normal text-slate-400">@</span> {offer.job.company}
                  </h4>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Base</span>
                  <span className="text-sm font-semibold text-slate-800">${offer.baseSalary.toLocaleString()}</span>
                </div>
                {offer.bonusPercent > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Bonus</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {offer.bonusPercent}% (${Math.round((offer.baseSalary * offer.bonusPercent) / 100).toLocaleString()})
                    </span>
                  </div>
                )}
                {offer.equity && (
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Equity</span>
                    <span className="text-sm font-semibold text-slate-800">{offer.equity}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">Total Comp</span>
                  <span className="text-sm font-bold text-emerald-600">${totalComp(offer).toLocaleString()}</span>
                </div>
              </div>

              {offer.startDate && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Start Date: {new Date(offer.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {offer.notes && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{offer.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center md:items-end md:flex-col gap-2.5 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
              <div className="w-[140px]">
                <Select
                  options={statusDropdownOptions}
                  value={offer.status}
                  onChange={(e) => onStatusChange(offer.id, e.target.value)}
                  className="h-8 py-0"
                />
              </div>
              {offer.status !== 'rejected' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNegotiate(offer)}
                  className="flex-1 md:flex-none"
                >
                  Negotiate
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(offer.id)}
                className="p-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ComparisonMatrix({
  offers,
  jobs,
  totalComp,
}: {
  offers: Offer[];
  jobs: { id: string; title: string; company: string }[];
  totalComp: (o: Offer) => number;
}) {
  const jobMap = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);
  const activeOffers = useMemo(() => offers.filter((o) => o.status !== 'rejected'), [offers]);

  if (activeOffers.length === 0) {
    return (
      <Card className="text-center py-12 p-6">
        <p className="text-sm text-slate-500">No active offers to compare.</p>
      </Card>
    );
  }

  const fields = ['Base Salary', 'Bonus %', 'Bonus ($)', 'Equity', 'Total Comp', 'Start Date', 'Status'];

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="p-4 font-semibold text-slate-600 min-w-[120px]">Metric</th>
              {activeOffers.map((o) => {
                const j = jobMap[o.jobId];
                return (
                  <th key={o.id} className="p-4 min-w-[160px]">
                    <div className="font-bold text-slate-950">{j ? j.title : 'Unknown Role'}</div>
                    {j && <div className="text-[11px] font-medium text-slate-400 mt-0.5">{j.company}</div>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.map((field) => (
              <tr key={field} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-4 font-semibold text-slate-500">{field}</td>
                {activeOffers.map((o) => {
                  const bonus = Math.round((o.baseSalary * (o.bonusPercent ?? 0)) / 100);
                  const tc = totalComp(o);
                  const values: Record<string, string> = {
                    'Base Salary': `$${o.baseSalary.toLocaleString()}`,
                    'Bonus %': `${o.bonusPercent ?? 0}%`,
                    'Bonus ($)': bonus > 0 ? `$${bonus.toLocaleString()}` : '—',
                    Equity: o.equity || '—',
                    'Total Comp': `$${tc.toLocaleString()}`,
                    'Start Date': o.startDate ? new Date(o.startDate).toLocaleDateString() : '—',
                    Status: o.status,
                  };
                  const isTC = field === 'Total Comp';
                  return (
                    <td
                      key={o.id}
                      className={`p-4 ${isTC ? 'font-bold text-emerald-600' : 'text-slate-800'}`}
                    >
                      {values[field]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SalaryCalculator(props: {
  calcBase: string;
  setCalcBase: (v: string) => void;
  calcBonus: string;
  setCalcBonus: (v: string) => void;
  calcEquityValue: string;
  setCalcEquityValue: (v: string) => void;
  calcVestYears: string;
  setCalcVestYears: (v: string) => void;
  calcAnnualBonus: number;
  calcAnnualEquity: number;
  calcTotal: number;
}) {
  const {
    calcBase,
    setCalcBase,
    calcBonus,
    setCalcBonus,
    calcEquityValue,
    setCalcEquityValue,
    calcVestYears,
    setCalcVestYears,
    calcAnnualBonus,
    calcAnnualEquity,
    calcTotal,
  } = props;

  const fmt = (n: number) => (isNaN(n) ? '—' : `$${Math.round(n).toLocaleString()}`);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-3">
          <CalcIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Total Compensation Calculator</h3>
        </div>
        <Input
          label="Base Salary ($)"
          type="number"
          placeholder="150000"
          value={calcBase}
          onChange={(e) => setCalcBase(e.target.value)}
        />
        <Input
          label="Target Bonus %"
          type="number"
          placeholder="15"
          value={calcBonus}
          onChange={(e) => setCalcBonus(e.target.value)}
        />
        <Input
          label="Equity Total Value ($)"
          type="number"
          placeholder="200000"
          value={calcEquityValue}
          onChange={(e) => setCalcEquityValue(e.target.value)}
        />
        <Input
          label="Vesting Period (years)"
          type="number"
          placeholder="4"
          value={calcVestYears}
          onChange={(e) => setCalcVestYears(e.target.value)}
        />
      </Card>

      <Card className="p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
            Annual Breakdown
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Base Salary', value: fmt(parseFloat(calcBase || '0')) },
              { label: `Bonus (${calcBonus}%)`, value: fmt(calcAnnualBonus) },
              { label: 'Annual Equity', value: fmt(calcAnnualEquity), muted: true },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center text-sm">
                <span className={row.muted ? 'text-slate-400' : 'text-slate-500 font-semibold'}>{row.label}</span>
                <span className={`font-semibold ${row.muted ? 'text-slate-400' : 'text-slate-800'}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">Total Annual Comp</span>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold tracking-tight">{fmt(calcTotal)}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-3 block leading-relaxed">
            * Equity calculated as ({fmt(parseFloat(calcEquityValue || '0'))} ÷ {calcVestYears} years). Actual value
            depends on vesting schedule and company performance.
          </span>
        </div>
      </Card>
    </div>
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

interface DecisionWeights {
  compensation: number;
  growth: number;
  culture: number;
  wlb: number;
  security: number;
  location: number;
}

interface DecisionResult {
  overallScore: number;
  dimensionScores: DecisionWeights;
  recommendation: string;
  pros: string[];
  cons: string[];
  summary: string;
}

const DECISION_DIMENSIONS: { key: keyof DecisionWeights; label: string; description: string }[] = [
  { key: 'compensation', label: 'Compensation', description: 'Base, bonus & equity' },
  { key: 'growth', label: 'Career Growth', description: 'Advancement & learning' },
  { key: 'culture', label: 'Culture & Team', description: 'Fit and environment' },
  { key: 'wlb', label: 'Work-Life Balance', description: 'Hours, flexibility & remote' },
  { key: 'security', label: 'Job Security', description: 'Company stability & stage' },
  { key: 'location', label: 'Location', description: 'Commute, city & remote policy' },
];

function NegotiateModal({
  offer,
  onClose,
  onStatusChange,
}: {
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

  // Decision scoring state
  const [weights, setWeights] = useState<DecisionWeights>({
    compensation: 7, growth: 7, culture: 5, wlb: 5, security: 5, location: 3,
  });
  const [userContext, setUserContext] = useState('');
  const [scoringDecision, setScoringDecision] = useState(false);
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [decisionError, setDecisionError] = useState('');

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
        payload.keyAchievements = keyAchievements
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
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

  async function handleScore(e: React.FormEvent) {
    e.preventDefault();
    setScoringDecision(true);
    setDecisionError('');
    setDecisionResult(null);
    try {
      const res = await fetch(`/api/offers/${offer.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights, context: userContext || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Scoring failed');
      }
      const json = await res.json();
      setDecisionResult(json.data ?? json);
    } catch (err: any) {
      setDecisionError(err.message ?? 'Something went wrong');
    } finally {
      setScoringDecision(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} className="max-w-xl">
      <ModalHeader onClose={onClose}>
        <div>
          <ModalTitle>Salary Negotiation</ModalTitle>
          {offer.job && (
            <p className="text-xs text-slate-400 font-medium mt-1">
              {offer.job.title} <span className="text-slate-300">@</span> {offer.job.company} · Current:{' '}
              <span className="font-bold text-slate-500">${offer.baseSalary.toLocaleString()}</span>
            </p>
          )}
        </div>
      </ModalHeader>

      <div className="flex border-b border-slate-100 px-6 overflow-x-auto">
        {['History', 'Record Action', 'AI Script', 'Decision Score'].map((label, idx) => (
          <button
            key={label}
            onClick={() => setTab(idx)}
            className={`px-3 py-3 text-sm font-semibold border-b-2 transition-all -mb-[1px] whitespace-nowrap ${
              tab === idx
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ModalBody className="min-h-[300px] max-h-[450px] overflow-y-auto p-6">
        {/* History Tab */}
        {tab === 0 && (
          <div>
            {loadingHistory ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 font-medium mb-3">No negotiation actions recorded yet.</p>
                <Button size="sm" onClick={() => setTab(1)}>
                  Record your first action →
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {history.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {ACTION_LABELS[event.action]}
                        </span>
                        {event.counterAmount && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                            ${event.counterAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {event.previousStatus} → {event.newStatus} ·{' '}
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.notes && (
                        <div className="mt-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed font-medium">
                          {event.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Tab */}
        {tab === 1 && (
          <form onSubmit={handleAction} className="flex flex-col gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Action
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(ACTION_LABELS) as [NegotiationAction, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAction(val)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      action === val
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium'
                    }`}
                  >
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {action === 'counter' && (
              <Input
                label="Counter Amount ($)"
                type="number"
                placeholder="e.g. 165000"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
              />
            )}

            <Textarea
              label="Notes (optional)"
              placeholder="Additional context about this negotiation step…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            {actionError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              loading={submitting}
              className="w-full flex items-center justify-center gap-1.5 mt-2"
            >
              {!submitting && <Check className="w-4 h-4" />}
              Record Action
            </Button>
          </form>
        )}

        {/* Script Tab */}
        {tab === 2 && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleGenerateScript} className="flex flex-col gap-4">
              <Input
                label="Target Salary ($)"
                type="number"
                required
                placeholder="e.g. 175000"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
              />
              <Input
                label="Key Achievements (comma-separated)"
                placeholder="Led team of 8, shipped X feature, reduced latency by 40%"
                value={keyAchievements}
                onChange={(e) => setKeyAchievements(e.target.value)}
              />
              <Input
                label="Competing Offer ($)"
                type="number"
                placeholder="Optional — strengthens leverage"
                value={competingOffer}
                onChange={(e) => setCompetingOffer(e.target.value)}
              />

              {scriptError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{scriptError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={generatingScript || !targetSalary}
                loading={generatingScript}
                className="w-full flex items-center justify-center gap-1.5"
              >
                {!generatingScript && <Sparkles className="w-4 h-4" />}
                Generate AI Script
              </Button>
            </form>

            {script && (
              <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => setShowScript((v) => !v)}
                    className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-2"
                  >
                    <span>Email Script</span>
                    {showScript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showScript && (
                    <pre className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto font-mono">
                      {script.emailScript}
                    </pre>
                  )}
                </div>

                {script.talkingPoints?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                      Talking Points
                    </h4>
                    <div className="flex flex-col gap-2">
                      {script.talkingPoints.map((pt, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-slate-600">
                          <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                          <span className="font-medium leading-relaxed">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {script.redLines?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                      Walk-Away Lines
                    </h4>
                    <div className="flex flex-col gap-2">
                      {script.redLines.map((line, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-slate-600">
                          <span className="text-rose-500 font-bold flex-shrink-0">✕</span>
                          <span className="font-medium leading-relaxed">{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Decision Score Tab */}
        {tab === 3 && (
          <div className="flex flex-col gap-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              Set how much each factor matters to you (0 = not at all, 10 = critical), then let AI score this offer.
            </p>

            <form onSubmit={handleScore} className="flex flex-col gap-4">
              {/* Weight sliders */}
              <div className="flex flex-col gap-3">
                {DECISION_DIMENSIONS.map(({ key, label, description }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
                        <span className="text-[10px] text-slate-400 ml-2">{description}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-5 text-right">{weights[key]}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={weights[key]}
                      onChange={(e) =>
                        setWeights((w) => ({ ...w, [key]: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-blue-600 h-1.5 rounded-full cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Additional context <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  placeholder="e.g. I prefer remote-first companies, relocating is a deal-breaker..."
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              {decisionError && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{decisionError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={scoringDecision}
                loading={scoringDecision}
                className="w-full flex items-center justify-center gap-1.5"
              >
                {!scoringDecision && <Sparkles className="w-4 h-4" />}
                Score This Offer
              </Button>
            </form>

            {/* Results */}
            {decisionResult && (
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                {/* Overall score ring */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9155" fill="none"
                        stroke={decisionResult.overallScore >= 70 ? '#16a34a' : decisionResult.overallScore >= 50 ? '#d97706' : '#dc2626'}
                        strokeWidth="3"
                        strokeDasharray={`${decisionResult.overallScore} ${100 - decisionResult.overallScore}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-slate-800">
                      {decisionResult.overallScore}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-snug mb-1">
                      {decisionResult.recommendation}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">{decisionResult.summary}</p>
                  </div>
                </div>

                {/* Dimension scores */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dimension Scores</h4>
                  {DECISION_DIMENSIONS.map(({ key, label }) => {
                    const score = decisionResult.dimensionScores[key];
                    return (
                      <div key={key} className="flex items-center gap-3 text-xs">
                        <span className="w-28 text-slate-600 font-medium shrink-0">{label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="w-7 text-right font-bold text-slate-700 shrink-0">{score}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-2 gap-3">
                  {decisionResult.pros.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Pros</h4>
                      <div className="flex flex-col gap-1.5">
                        {decisionResult.pros.map((p, i) => (
                          <div key={i} className="flex gap-1.5 items-start text-xs text-slate-600">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {decisionResult.cons.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Cons</h4>
                      <div className="flex flex-col gap-1.5">
                        {decisionResult.cons.map((c, i) => (
                          <div key={i} className="flex gap-1.5 items-start text-xs text-slate-600">
                            <X className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
