'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getNotificationManager } from '@/lib/notifications/manager';
import { NavLayout } from '@/components/Layout/NavLayout';
import { sanitizeUrl, sanitizeText } from '@/lib/security/sanitizeContent';
import { Button, Input, Textarea, Card, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Select } from '@/components/ui';
import {
  Plus, Users, Mail, Link2, Building2, Briefcase, MessageSquare, Edit3, Trash2,
  Search, ExternalLink, Clock, CheckCircle2, Loader2, AlertTriangle, Filter,
  Zap, BarChart2, Target, Network, Send, FileText, TrendingUp, ShieldCheck,
  ChevronRight, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContactType = 'recruiter' | 'hiring_manager' | 'referral' | 'peer' | 'other';
type ContactStatus = 'to_contact' | 'reached_out' | 'responded' | 'met' | 'introduced' | 'closed';

interface Contact {
  id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  type: ContactType;
  status: ContactStatus;
  jobId?: string;
  notes?: string;
  followUpAt?: string;
  lastContactedAt?: string;
  influenceScore: number;
  hiringAuthorityScore: number;
  outreachPriority: number;
  responseProbability: number;
  contactType?: string;
  recruiterType?: string;
  mutualConnections: number;
  createdAt: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  company: string;
  objective: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  _count?: { outreaches: number };
  createdAt: string;
}

interface Outreach {
  id: string;
  campaignId: string;
  contactId: string;
  channel: string;
  message: string;
  personalizedMessage?: string;
  status: string;
  sequenceStep: number;
  sentAt?: string;
  repliedAt?: string;
  responseSentiment?: string;
  approvedAt?: string;
  contact?: { id: string; name: string; company?: string; role?: string };
  campaign?: { id: string; company: string; objective: string };
  createdAt: string;
}

interface WarmPath {
  type: string;
  description: string;
  confidence: number;
  verified: boolean;
}

interface AnalyticsData {
  stats: {
    totalContacts: number;
    activeOutreaches: number;
    replyRate: number;
    warmPaths: number;
    campaignsActive: number;
    avgResponseTime: number;
  };
  replyRates: { '7d': number; '30d': number; '90d': number };
  conversionRate: number;
  templatePerformance: Array<{ template: string; sent: number; replied: number; replyRate: number }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'discover', label: 'Discover', icon: Search },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'warmpaths', label: 'Warm Paths', icon: Network },
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
] as const;

type TabId = typeof TABS[number]['id'];

const TYPE_LABELS: Record<ContactType, string> = {
  recruiter: 'Recruiter', hiring_manager: 'Hiring Manager',
  referral: 'Referral', peer: 'Peer', other: 'Other',
};
const STATUS_LABELS: Record<ContactStatus, string> = {
  to_contact: 'To Contact', reached_out: 'Reached Out', responded: 'Responded',
  met: 'Met', introduced: 'Introduced', closed: 'Closed',
};
const STATUS_STYLES: Record<ContactStatus, string> = {
  to_contact: 'bg-slate-100 text-slate-600 border-slate-200',
  reached_out: 'bg-blue-50 text-blue-700 border-blue-200',
  responded: 'bg-amber-50 text-amber-700 border-amber-200',
  met: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  introduced: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-rose-50 text-rose-600 border-rose-200',
};
const OUTREACH_STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  QUEUED: 'bg-blue-50 text-blue-700',
  SENT: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-teal-50 text-teal-700',
  REPLIED: 'bg-emerald-50 text-emerald-700',
  FAILED: 'bg-rose-50 text-rose-600',
};

const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  PLANNING: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  ARCHIVED: 'bg-slate-100 text-slate-400',
};

const EMPTY_CONTACT_FORM = {
  name: '', company: '', role: '', email: '', phone: '',
  linkedInUrl: '', type: 'recruiter' as ContactType,
  status: 'to_contact' as ContactStatus, notes: '', followUpAt: '',
};

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ value, label, color = 'blue' }: { value: number; label: string; color?: string }) {
  const pct = Math.round(value * 100);
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-emerald-500', amber: 'bg-amber-500', purple: 'bg-purple-500',
  };
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-slate-500 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color] ?? colorMap.blue} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-semibold text-slate-700">{pct}%</span>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm({
  initial, onSave, onClose, saving, error,
}: {
  initial?: Partial<typeof EMPTY_CONTACT_FORM>;
  onSave: (data: typeof EMPTY_CONTACT_FORM) => Promise<void>;
  onClose: () => void;
  saving: boolean;
  error: string;
}) {
  const [form, setForm] = useState({ ...EMPTY_CONTACT_FORM, ...initial });
  const set = (k: keyof typeof EMPTY_CONTACT_FORM, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <>
      <ModalBody className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Smith" />
          <Input label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Role / Title" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Engineering Manager" />
          <Select label="Type" value={form.type}
            options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            onChange={(e) => set('type', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@acme.com" />
          <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
        </div>
        <Input label="LinkedIn URL" value={form.linkedInUrl} onChange={(e) => set('linkedInUrl', e.target.value)} placeholder="https://linkedin.com/in/jane" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Status" value={form.status}
            options={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            onChange={(e) => set('status', e.target.value)} />
          <Input label="Follow-up Date" type="date" value={form.followUpAt} onChange={(e) => set('followUpAt', e.target.value)} />
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Context, how you met…" rows={3} />
        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={saving} loading={saving}>Save</Button>
      </ModalFooter>
    </>
  );
}

// ─── Discover Tab ─────────────────────────────────────────────────────────────

function DiscoverTab() {
  const [form, setForm] = useState({ company: '', jobTitle: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ queueJobId: string; company: string; jobTitle: string } | null>(null);
  const [orchestrating, setOrchestrating] = useState(false);
  const [orchResult, setOrchResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function handleDiscover() {
    if (!form.company.trim() || !form.jobTitle.trim()) { setError('Company and job title are required'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/networking/discover', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Discovery failed');
      setResult(json.data);
      getNotificationManager().success('Discovery Queued', `Finding recruiters at ${form.company}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleOrchestrate() {
    if (!form.company.trim() || !form.jobTitle.trim()) { setError('Company and job title are required'); return; }
    setOrchestrating(true); setError(''); setOrchResult(null);
    try {
      const res = await fetch('/api/networking/orchestrate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Orchestration failed');
      setOrchResult(json.data);
      getNotificationManager().success('Orchestration Complete', `${json.data.discovered} contacts found`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Orchestration failed');
    } finally {
      setOrchestrating(false);
    }
  }

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          Discover Recruiters for a Role
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company *" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Stripe" />
            <Input label="Job Title *" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <Input label="Location (optional)" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="San Francisco, CA" />
          <Textarea label="Job Description (optional)" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Paste the job description to improve discovery accuracy…" rows={4} />

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDiscover} disabled={loading || orchestrating} loading={loading}
              className="flex items-center gap-1.5">
              <Search className="w-4 h-4" />Queue Discovery
            </Button>
            <Button onClick={handleOrchestrate} disabled={loading || orchestrating} loading={orchestrating}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700">
              <Zap className="w-4 h-4" />Full Orchestration
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-5 border-blue-100 bg-blue-50/40">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Discovery Queued</p>
              <p className="text-xs text-blue-600 mt-0.5">Searching for recruiters at <strong>{result.company}</strong> for <strong>{result.jobTitle}</strong>. Check the Contacts tab in a moment.</p>
              <p className="text-xs text-blue-400 mt-1">Queue job: {result.queueJobId}</p>
            </div>
          </div>
        </Card>
      )}

      {orchResult && (
        <Card className="p-5 border-purple-100 bg-purple-50/40">
          <p className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />Orchestration Complete
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Discovered', value: (orchResult as Record<string, number>).discovered },
              { label: 'Enriched', value: (orchResult as Record<string, number>).enriched },
              { label: 'Warm Paths', value: (orchResult as Record<string, number>).warmPathsFound },
              { label: 'Drafts Created', value: (orchResult as Record<string, number>).outreachDraftsCreated },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-purple-700">{s.value}</div>
                <div className="text-xs text-purple-500 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
          {Array.isArray((orchResult as Record<string, unknown>).nextSteps) && (
            <div>
              <p className="text-xs font-semibold text-purple-700 mb-2">Next Steps:</p>
              <ul className="space-y-1">
                {((orchResult as Record<string, unknown>).nextSteps as string[]).map((step, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-purple-600">
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />{step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Contacts Tab ─────────────────────────────────────────────────────────────

function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/contacts?limit=200');
      const json = await res.json();
      setContacts(Array.isArray(json?.data) ? json.data : []);
    } catch { setError('Failed to load contacts.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.company?.toLowerCase().includes(q) && !c.role?.toLowerCase().includes(q)) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterType && c.type !== filterType) return false;
      return true;
    });
  }, [contacts, search, filterStatus, filterType]);

  async function handleSave(form: typeof EMPTY_CONTACT_FORM) {
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    setSaving(true); setFormError('');
    try {
      const url = editTarget ? `/api/contacts/${editTarget.id}` : '/api/contacts';
      const method = editTarget ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, followUpAt: form.followUpAt || undefined }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message ?? 'Save failed'); }
      getNotificationManager().success(editTarget ? 'Contact Updated' : 'Contact Added', form.name);
      setShowAdd(false); setEditTarget(null); load();
    } catch (err: unknown) { setFormError(err instanceof Error ? err.message : 'Something went wrong'); }
    finally { setSaving(false); }
  }

  async function handleDelete(contact: Contact) {
    if (!confirm(`Delete ${contact.name}?`)) return;
    await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' });
    getNotificationManager().success('Deleted', contact.name);
    setContacts((p) => p.filter((c) => c.id !== contact.id));
  }

  async function handleMarkContacted(contact: Contact) {
    const res = await fetch(`/api/contacts/${contact.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastContactedAt: new Date().toISOString(), status: contact.status === 'to_contact' ? 'reached_out' : contact.status }),
    });
    if (res.ok) { getNotificationManager().success('Marked Contacted', contact.name); load(); }
  }

  return (
    <div className="flex flex-col gap-5">
      <Modal isOpen={showAdd || !!editTarget} onClose={() => { setShowAdd(false); setEditTarget(null); setFormError(''); }} className="max-w-lg">
        <ModalHeader onClose={() => { setShowAdd(false); setEditTarget(null); }}><ModalTitle>{editTarget ? 'Edit Contact' : 'Add Contact'}</ModalTitle></ModalHeader>
        <ContactForm
          initial={editTarget ? { name: editTarget.name, company: editTarget.company ?? '', role: editTarget.role ?? '', email: editTarget.email ?? '', phone: editTarget.phone ?? '', linkedInUrl: editTarget.linkedInUrl ?? '', type: editTarget.type, status: editTarget.status, notes: editTarget.notes ?? '', followUpAt: editTarget.followUpAt?.slice(0, 10) ?? '' } : undefined}
          onSave={handleSave} onClose={() => { setShowAdd(false); setEditTarget(null); }}
          saving={saving} error={formError} />
      </Modal>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Search contacts…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div className="flex gap-2">
            <Filter className="w-4 h-4 text-slate-400 self-center" />
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-xs"
              options={[{ value: '', label: 'All Statuses' }, ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))]} />
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-xs"
              options={[{ value: '', label: 'All Types' }, ...Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))]} />
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 self-start sm:self-auto"><Plus className="w-4 h-4" />Add Contact</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : error ? (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-slate-200 bg-transparent shadow-none">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">{contacts.length === 0 ? 'No contacts yet' : 'No contacts match filters'}</p>
          {contacts.length === 0 && <Button onClick={() => setShowAdd(true)} className="mt-4 mx-auto flex items-center gap-1.5"><Plus className="w-4 h-4" />Add First Contact</Button>}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((contact) => (
            <Card key={contact.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {contact.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[contact.status]}`}>{STATUS_LABELS[contact.status]}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{TYPE_LABELS[contact.type]}</span>
                  </div>
                  {(() => {
                    const mailtoUrl = contact.email ? sanitizeUrl(`mailto:${contact.email}`) : null;
                    const safeMailto = mailtoUrl && mailtoUrl.startsWith('mailto:') ? mailtoUrl : undefined;
                    const linkedInUrl = contact.linkedInUrl ? sanitizeUrl(contact.linkedInUrl) : null;
                    const safeLinkedIn = linkedInUrl && (linkedInUrl.startsWith('http://') || linkedInUrl.startsWith('https://')) ? linkedInUrl : undefined;
                    return (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                        {contact.company && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{contact.company}</span>}
                        {contact.role && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{contact.role}</span>}
                        {contact.email && safeMailto && <a href={safeMailto} className="flex items-center gap-1 hover:text-blue-600"><Mail className="w-3.5 h-3.5" />{sanitizeText(contact.email)}</a>}
                        {contact.linkedInUrl && safeLinkedIn && <a href={safeLinkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600"><Link2 className="w-3.5 h-3.5" />LinkedIn<ExternalLink className="w-3 h-3" /></a>}
                      </div>
                    );
                  })()}
                  {/* Intelligence scores */}
                  {contact.influenceScore > 0 && (
                    <div className="mt-2 space-y-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <ScoreBar value={contact.influenceScore} label="Influence" color="blue" />
                      <ScoreBar value={contact.hiringAuthorityScore} label="Hiring Authority" color="purple" />
                      <ScoreBar value={contact.responseProbability} label="Response Prob." color="green" />
                    </div>
                  )}
                  {contact.notes && <p className="text-xs text-slate-500 mt-2 line-clamp-1">{contact.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" className="p-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Mark contacted" onClick={() => handleMarkContacted(contact)}><CheckCircle2 className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" className="p-2" onClick={() => { setEditTarget(contact); setFormError(''); }} title="Edit"><Edit3 className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" className="p-2 text-rose-500 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(contact)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Warm Paths Tab ───────────────────────────────────────────────────────────

function WarmPathsTab() {
  const [contacts, setContacts] = useState<Array<Contact & { warmPaths?: WarmPath[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ warmPaths: WarmPath[] } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetch('/api/contacts?limit=50')
      .then((r) => r.json())
      .then((j) => setContacts(Array.isArray(j?.data) ? j.data : []))
      .finally(() => setLoading(false));
  }, []);

  async function loadInsights(contactId: string) {
    setSelected(contactId); setLoadingInsights(true); setInsights(null);
    try {
      const res = await fetch(`/api/networking/contacts/${contactId}/insights`);
      const json = await res.json();
      setInsights(json?.data ?? null);
    } catch { setInsights(null); }
    finally { setLoadingInsights(false); }
  }

  const WARM_PATH_ICONS: Record<string, string> = {
    MUTUAL_CONNECTION: '🤝', ALUMNI: '🎓', SHARED_COMPANY: '🏢', TECH_OVERLAP: '⚡', COMMUNITY: '🌐',
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500">Select a contact to detect warm paths — shared background, alumni connections, tech overlap.</p>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : contacts.length === 0 ? (
        <Card className="text-center py-10 border-2 border-dashed border-slate-200 bg-transparent shadow-none">
          <Network className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No contacts yet. Add contacts or run Discovery first.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            {contacts.map((c) => (
              <button key={c.id} onClick={() => loadInsights(c.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${selected === c.id ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.company}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div>
            {loadingInsights && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>}
            {insights && !loadingInsights && (
              <Card className="p-5">
                <p className="text-sm font-bold text-slate-800 mb-3">Warm Paths Detected</p>
                {insights.warmPaths.length === 0 ? (
                  <p className="text-sm text-slate-400">No warm paths found. Try enriching the contact's profile.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {insights.warmPaths.map((wp, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-base">{WARM_PATH_ICONS[wp.type] ?? '🔗'}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-700">{wp.type.replace('_', ' ')}</span>
                              {wp.verified && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">Verified</span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{wp.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Confidence</span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round(wp.confidence * 100)}%` }} />
                          </div>
                          <span className="font-semibold text-slate-600">{Math.round(wp.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
            {!loadingInsights && !insights && selected && (
              <Card className="p-5 text-center text-sm text-slate-400">Click a contact to load insights</Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Campaigns Tab ────────────────────────────────────────────────────────────

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ company: '', objective: '', jobId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/networking/campaigns'); const j = await r.json(); setCampaigns(Array.isArray(j?.data) ? j.data : []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.company.trim() || !form.objective.trim()) { setError('Company and objective required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/networking/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message ?? 'Failed'); }
      getNotificationManager().success('Campaign Created', form.company);
      setShowCreate(false); setForm({ company: '', objective: '', jobId: '' }); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Manage multi-contact outreach campaigns.</p>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5"><Plus className="w-4 h-4" />New Campaign</Button>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} className="max-w-md">
        <ModalHeader onClose={() => setShowCreate(false)}><ModalTitle>New Campaign</ModalTitle></ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <Input label="Company *" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Stripe" />
          <Input label="Job ID (optional)" value={form.jobId} onChange={(e) => setForm((p) => ({ ...p, jobId: e.target.value }))} placeholder="cld_..." />
          <Textarea label="Objective *" value={form.objective} onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))} placeholder="Land Senior Engineer role, product team" rows={3} />
          {error && <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving} disabled={saving}>Create</Button>
        </ModalFooter>
      </Modal>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        : campaigns.length === 0 ? (
          <Card className="text-center py-10 border-2 border-dashed border-slate-200 bg-transparent shadow-none">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No campaigns yet</p>
            <Button onClick={() => setShowCreate(true)} className="mt-4 mx-auto flex items-center gap-1.5"><Plus className="w-4 h-4" />Create First Campaign</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{c.company}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{c.objective}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${CAMPAIGN_STATUS_STYLES[c.status] ?? 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{c._count?.outreaches ?? 0} outreaches</span>
                  {c.startedAt && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Started {new Date(c.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Outreach Tab ─────────────────────────────────────────────────────────────

function OutreachTab() {
  const [pending, setPending] = useState<Outreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/networking/outreach/pending'); const j = await r.json(); setPending(Array.isArray(j?.data) ? j.data : []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadPending(); }, [loadPending]);

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`/api/networking/outreach/${id}/approve`, { method: 'POST' });
      if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message ?? 'Approval failed'); }
      getNotificationManager().success('Outreach Approved', 'Moved to send queue');
      setPending((p) => p.filter((o) => o.id !== id));
    } catch (err: unknown) {
      getNotificationManager().error('Approval Failed', err instanceof Error ? err.message : 'Error');
    } finally { setApproving(null); }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Pending Approval</h3>
          <p className="text-xs text-slate-400 mt-0.5">All outreaches require your approval before sending.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPending} className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />Refresh
        </Button>
      </div>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        : pending.length === 0 ? (
          <Card className="text-center py-10 border-2 border-dashed border-slate-200 bg-transparent shadow-none">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No outreaches awaiting approval</p>
            <p className="text-xs text-slate-400 mt-1">Run discovery + orchestration to generate drafts</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((o) => (
              <Card key={o.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${OUTREACH_STATUS_STYLES[o.status] ?? 'bg-slate-100 text-slate-600'}`}>{o.status}</span>
                      <span className="text-xs text-slate-400">{o.channel} · Step {o.sequenceStep + 1}</span>
                      {o.contact && <span className="text-xs font-semibold text-slate-600">→ {o.contact.name}</span>}
                      {o.contact?.company && <span className="text-xs text-slate-400">@ {o.contact.company}</span>}
                    </div>
                    <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 mb-3">
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {o.personalizedMessage || o.message}
                      </p>
                    </div>
                    {o.campaign && <p className="text-xs text-slate-400">Campaign: {o.campaign.company} — {o.campaign.objective}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleApprove(o.id)} loading={approving === o.id} disabled={!!approving}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />Approve
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/networking/analytics?window=${window}`)
      .then((r) => r.json())
      .then((j) => setData(j?.data ?? null))
      .finally(() => setLoading(false));
  }, [window]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!data) return <div className="text-center text-sm text-slate-400 py-10">No analytics data yet</div>;

  const { stats, replyRates, conversionRate, templatePerformance } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Window selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((w) => (
          <button key={w} onClick={() => setWindow(w)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${window === w ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>{w}</button>
        ))}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Contacts', value: stats.totalContacts, icon: Users, color: 'blue' },
          { label: 'Active Outreaches', value: stats.activeOutreaches, icon: Send, color: 'indigo' },
          { label: 'Reply Rate (30d)', value: `${Math.round(stats.replyRate * 100)}%`, icon: MessageSquare, color: 'emerald' },
          { label: 'Warm Paths', value: stats.warmPaths, icon: Network, color: 'purple' },
          { label: 'Active Campaigns', value: stats.campaignsActive, icon: Target, color: 'amber' },
          { label: 'Avg Response', value: `${stats.avgResponseTime}h`, icon: Clock, color: 'slate' },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{kpi.value}</div>
          </Card>
        ))}
      </div>

      {/* Reply rates */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" />Reply Rates</h3>
        <div className="flex gap-8">
          {Object.entries(replyRates).map(([w, rate]) => (
            <div key={w} className="text-center">
              <div className="text-2xl font-bold text-slate-800">{Math.round(rate * 100)}%</div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">{w}</div>
            </div>
          ))}
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{Math.round(conversionRate * 100)}%</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Conversion</div>
          </div>
        </div>
      </Card>

      {/* Template performance */}
      {templatePerformance.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-600" />Template Performance</h3>
          <div className="flex flex-col gap-2">
            {templatePerformance.map((t) => (
              <div key={t.template} className="flex items-center gap-3 text-xs">
                <span className="w-32 font-semibold text-slate-700 truncate">{t.template}</span>
                <span className="text-slate-400">{t.sent} sent</span>
                <span className="text-slate-400">{t.replied} replied</span>
                <div className="flex-1">
                  <ScoreBar value={t.replyRate} label="" color="green" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NetworkingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('discover');

  return (
    <NavLayout title="Networking" subtitle="AI-powered recruiter discovery and outreach orchestration">
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 border-b border-slate-200 pb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'contacts' && <ContactsTab />}
        {activeTab === 'warmpaths' && <WarmPathsTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'outreach' && <OutreachTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </NavLayout>
  );
}
