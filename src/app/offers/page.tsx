'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { TrendingUp, Plus, Trash2, Calculator, RefreshCw, Loader2, Sparkles, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

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

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  negotiating: 'bg-purple-100 text-purple-800',
};

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

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Offers', value: stats.count, color: 'text-blue-600' },
            { label: 'Avg Base Salary', value: stats.avgBase ? `$${stats.avgBase.toLocaleString()}` : '—', color: 'text-green-600' },
            { label: 'Highest Base', value: stats.highestBase ? `$${stats.highestBase.toLocaleString()}` : '—', color: 'text-purple-600' },
            { label: 'Active Negotiations', value: stats.pending, color: 'text-orange-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* View Tabs + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['list', 'compare', 'calculator'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition capitalize ${
                  activeView === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'calculator' ? '🧮 Calculator' : v === 'compare' ? '⚖️ Compare' : '📋 List'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              Log Offer
            </button>
          </div>
        </div>

        {/* Add Offer Form */}
        {showAddForm && (
          <div className="bg-white border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Log New Offer</h3>
            <form onSubmit={handleAddOffer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Job</label>
                <select
                  required
                  value={form.jobId}
                  onChange={(e) => setForm({ ...form, jobId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a job...</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Base Salary ($)</label>
                <input
                  type="number"
                  required
                  placeholder="150000"
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bonus %</label>
                <input
                  type="number"
                  placeholder="15"
                  value={form.bonusPercent}
                  onChange={(e) => setForm({ ...form, bonusPercent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Equity</label>
                <input
                  type="text"
                  placeholder="0.1% RSUs / $200k over 4yr"
                  value={form.equity}
                  onChange={(e) => setForm({ ...form, equity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Negotiation notes, benefits, PTO..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? 'Saving...' : 'Log Offer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Views */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
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
      </div>
    </NavLayout>
  );
}

function OffersList({ offers, onDelete, onStatusChange, totalComp, onNegotiate }: {
  offers: Offer[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  totalComp: (o: Offer) => number;
  onNegotiate: (offer: Offer) => void;
}) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
        <div className="text-5xl mb-3">💰</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No offers yet</h3>
        <p className="text-sm text-gray-500">Log your first offer using the button above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <div key={offer.id} className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_STYLES[offer.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {offer.status}
                </span>
                {offer.job && (
                  <span className="text-sm font-medium text-gray-900">
                    {offer.job.title} @ {offer.job.company}
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <CompStat label="Base" value={`$${offer.baseSalary.toLocaleString()}`} />
                {offer.bonusPercent > 0 && (
                  <CompStat label="Bonus" value={`${offer.bonusPercent}% ($${Math.round((offer.baseSalary * offer.bonusPercent) / 100).toLocaleString()})`} />
                )}
                {offer.equity && <CompStat label="Equity" value={offer.equity} />}
                <CompStat label="Total Comp" value={`$${totalComp(offer).toLocaleString()}`} bold green />
              </div>
              {offer.startDate && (
                <p className="text-xs text-gray-500 mt-2">
                  Start: {new Date(offer.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {offer.notes && (
                <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">{offer.notes}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <select
                value={offer.status}
                onChange={(e) => onStatusChange(offer.id, e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="negotiating">Negotiating</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              {offer.status !== 'rejected' && (
                <button
                  onClick={() => onNegotiate(offer)}
                  className="px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 border border-purple-200 rounded-lg transition"
                >
                  Negotiate
                </button>
              )}
              <button
                onClick={() => onDelete(offer.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompStat({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm mt-0.5 ${bold ? 'font-bold' : 'font-medium'} ${green ? 'text-green-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
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
      <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
        <div className="text-4xl mb-3">⚖️</div>
        <p className="text-gray-500 text-sm">No active offers to compare.</p>
      </div>
    );
  }

  const fields = ['Base Salary', 'Bonus %', 'Bonus ($)', 'Equity', 'Total Comp', 'Start Date', 'Status'];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4 font-semibold text-gray-600 bg-gray-50 min-w-32">Metric</th>
            {activeOffers.map((o) => {
              const j = jobMap[o.jobId];
              return (
                <th key={o.id} className="text-left p-4 font-semibold text-gray-900 min-w-40">
                  {j ? `${j.title}` : 'Unknown Role'}
                  {j && <span className="block text-xs text-gray-500 font-normal">{j.company}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => (
            <tr key={field} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
              <td className="p-4 font-medium text-gray-600">{field}</td>
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
                  <td key={o.id} className={`p-4 ${isHighlight ? 'font-bold text-green-600' : 'text-gray-900'}`}>
                    {values[field]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Total Compensation Calculator</h3>
        </div>
        <Field label="Base Salary ($)" value={calcBase} onChange={setCalcBase} type="number" placeholder="150000" />
        <Field label="Target Bonus %" value={calcBonus} onChange={setCalcBonus} type="number" placeholder="15" />
        <Field label="Equity Total Value ($)" value={calcEquityValue} onChange={setCalcEquityValue} type="number" placeholder="200000" />
        <Field label="Vesting Period (years)" value={calcVestYears} onChange={setCalcVestYears} type="number" placeholder="4" />
      </div>

      {/* Results */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-2">Annual Breakdown</h3>
        <ResultRow label="Base Salary" value={fmt(parseFloat(calcBase || '0'))} />
        <ResultRow label={`Bonus (${calcBonus}%)`} value={fmt(calcAnnualBonus)} />
        <ResultRow label="Annual Equity" value={fmt(calcAnnualEquity)} muted />
        <div className="border-t border-gray-200 pt-4 mt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-lg">Total Annual Comp</span>
            <span className="font-bold text-2xl text-green-600 flex items-center gap-1">
              <TrendingUp size={18} />
              {fmt(calcTotal)}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          * Equity calculated as ({fmt(parseFloat(calcEquityValue || '0'))} ÷ {calcVestYears} years). Actual value depends on vesting schedule and company performance.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type ?? 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ResultRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-sm ${muted ? 'text-gray-500' : 'text-gray-700'}`}>{label}</span>
      <span className={`text-sm font-semibold ${muted ? 'text-gray-500' : 'text-gray-900'}`}>{value}</span>
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

function NegotiateModal({ offer, onClose, onStatusChange }: {
  offer: Offer;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [tab, setTab] = useState<'history' | 'action' | 'script'>('history');
  const [history, setHistory] = useState<NegotiationEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Action form
  const [action, setAction] = useState<NegotiationAction>('counter');
  const [counterAmount, setCounterAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Script form
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
      setTab('history');
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Salary Negotiation</h2>
            {offer.job && (
              <p className="text-xs text-gray-500 mt-0.5">
                {offer.job.title} @ {offer.job.company} · Current: ${offer.baseSalary.toLocaleString()}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-gray-100 flex-shrink-0">
          {([
            ['history', 'History'],
            ['action', 'Record Action'],
            ['script', 'AI Script'],
          ] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'history' && (
            <div>
              {loadingHistory ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-2">📝</p>
                  <p className="text-sm">No negotiation actions recorded yet.</p>
                  <button
                    onClick={() => setTab('action')}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    Record your first action →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{ACTION_LABELS[event.action]}</span>
                          {event.counterAmount && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              ${event.counterAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {event.previousStatus} → {event.newStatus} ·{' '}
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        {event.notes && (
                          <p className="text-xs text-gray-700 mt-1 bg-gray-50 rounded p-2">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'action' && (
            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(ACTION_LABELS) as [NegotiationAction, string][]).map(([val, label]) => (
                    <label
                      key={val}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        action === val
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="negotiationAction"
                        value={val}
                        checked={action === val}
                        onChange={() => setAction(val)}
                      />
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {action === 'counter' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Counter Amount ($)</label>
                  <input
                    type="number"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(e.target.value)}
                    placeholder="e.g. 165000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context about this negotiation step…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{actionError}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {submitting ? 'Recording…' : 'Record Action'}
              </button>
            </form>
          )}

          {tab === 'script' && (
            <div className="space-y-4">
              <form onSubmit={handleGenerateScript} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Target Salary ($) *</label>
                  <input
                    type="number"
                    required
                    value={targetSalary}
                    onChange={(e) => setTargetSalary(e.target.value)}
                    placeholder="e.g. 175000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Key Achievements (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={keyAchievements}
                    onChange={(e) => setKeyAchievements(e.target.value)}
                    placeholder="Led team of 8, shipped X feature, reduced latency by 40%"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Competing Offer ($)</label>
                  <input
                    type="number"
                    value={competingOffer}
                    onChange={(e) => setCompetingOffer(e.target.value)}
                    placeholder="Optional — strengthens leverage"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {scriptError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{scriptError}</div>
                )}

                <button
                  type="submit"
                  disabled={generatingScript || !targetSalary}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {generatingScript ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {generatingScript ? 'Generating Script…' : 'Generate AI Script'}
                </button>
              </form>

              {script && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  {/* Email Script */}
                  <div>
                    <button
                      onClick={() => setShowScript((v) => !v)}
                      className="flex items-center justify-between w-full text-sm font-semibold text-gray-800"
                    >
                      <span>Email Script</span>
                      {showScript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {showScript && (
                      <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                        {script.emailScript}
                      </pre>
                    )}
                  </div>

                  {/* Talking Points */}
                  {script.talkingPoints?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Talking Points</p>
                      <ul className="space-y-1.5">
                        {script.talkingPoints.map((pt, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-700">
                            <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red Lines */}
                  {script.redLines?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Walk-Away Lines</p>
                      <ul className="space-y-1.5">
                        {script.redLines.map((line, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-700">
                            <span className="text-red-500 font-bold flex-shrink-0">✕</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
