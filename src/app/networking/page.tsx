'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getNotificationManager } from '@/lib/notifications/manager';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Input, Textarea, Card, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Select } from '@/components/ui';
import {
  Plus,
  Users,
  Mail,
  Phone,
  Link2,
  Building2,
  Briefcase,
  MessageSquare,
  Edit3,
  Trash2,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Filter,
} from 'lucide-react';

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
  createdAt: string;
  updatedAt: string;
}

const TYPE_LABELS: Record<ContactType, string> = {
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  referral: 'Referral',
  peer: 'Peer',
  other: 'Other',
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  to_contact: 'To Contact',
  reached_out: 'Reached Out',
  responded: 'Responded',
  met: 'Met',
  introduced: 'Introduced',
  closed: 'Closed',
};

const STATUS_STYLES: Record<ContactStatus, string> = {
  to_contact: 'bg-slate-100 text-slate-600 border-slate-200',
  reached_out: 'bg-blue-50 text-blue-700 border-blue-200',
  responded: 'bg-amber-50 text-amber-700 border-amber-200',
  met: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  introduced: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-rose-50 text-rose-600 border-rose-200',
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

const EMPTY_FORM = {
  name: '',
  company: '',
  role: '',
  email: '',
  phone: '',
  linkedInUrl: '',
  type: 'recruiter' as ContactType,
  status: 'to_contact' as ContactStatus,
  notes: '',
  followUpAt: '',
};

interface ContactFormProps {
  initial?: Partial<typeof EMPTY_FORM>;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
  onClose: () => void;
  saving: boolean;
  error: string;
}

function ContactForm({ initial, onSave, onClose, saving, error }: ContactFormProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });

  function set(key: keyof typeof EMPTY_FORM, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <>
      <ModalBody className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Smith" />
          <Input label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Role / Title" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Engineering Manager" />
          <Select
            label="Type"
            value={form.type}
            options={TYPE_OPTIONS}
            onChange={(e) => set('type', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@acme.com" />
          <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
        </div>
        <Input label="LinkedIn URL" value={form.linkedInUrl} onChange={(e) => set('linkedInUrl', e.target.value)} placeholder="https://linkedin.com/in/jane" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            value={form.status}
            options={STATUS_OPTIONS}
            onChange={(e) => set('status', e.target.value)}
          />
          <Input
            label="Follow-up Date"
            type="date"
            value={form.followUpAt}
            onChange={(e) => set('followUpAt', e.target.value)}
          />
        </div>
        <Textarea
          label="Notes"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Context, how you met, what to discuss…"
          rows={3}
        />
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
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

function ContactCard({
  contact,
  onEdit,
  onDelete,
  onMarkContacted,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onMarkContacted: () => void;
}) {
  const isDueFollowUp = contact.followUpAt && new Date(contact.followUpAt) <= new Date();

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {contact.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[contact.status]}`}>
              {STATUS_LABELS[contact.status]}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {TYPE_LABELS[contact.type]}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium mb-2">
            {contact.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {contact.company}
              </span>
            )}
            {contact.role && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {contact.role}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-3">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                {contact.phone}
              </a>
            )}
            {contact.linkedInUrl && (
              <a
                href={contact.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {contact.notes && (
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 dark:bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800 mb-3 line-clamp-2">
              {contact.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            {contact.followUpAt && (
              <span className={`flex items-center gap-1 font-semibold ${isDueFollowUp ? 'text-amber-600' : ''}`}>
                <Clock className="w-3.5 h-3.5" />
                Follow-up {new Date(contact.followUpAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {isDueFollowUp && ' (due)'}
              </span>
            )}
            {contact.lastContactedAt && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Last contact {new Date(contact.lastContactedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            title="Mark contacted today"
            className="p-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            onClick={onMarkContacted}
          >
            <CheckCircle2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="p-2" onClick={onEdit} title="Edit">
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 text-rose-500 border-rose-200 hover:bg-rose-50"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function NetworkingPage() {
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
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contacts?limit=200');
      const json = await res.json();
      setContacts(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setError('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
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

  const stats = useMemo(() => ({
    total: contacts.length,
    dueFollowUp: contacts.filter((c) => c.followUpAt && new Date(c.followUpAt) <= new Date() && c.status !== 'closed').length,
    responded: contacts.filter((c) => c.status === 'responded' || c.status === 'met').length,
  }), [contacts]);

  async function handleSave(form: typeof EMPTY_FORM) {
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const body = {
        ...form,
        followUpAt: form.followUpAt || undefined,
      };
      const url = editTarget ? `/api/contacts/${editTarget.id}` : '/api/contacts';
      const method = editTarget ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Save failed');
      }
      getNotificationManager().success(editTarget ? 'Contact Updated' : 'Contact Added', form.name);
      setShowAdd(false);
      setEditTarget(null);
      load();
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(contact: Contact) {
    if (!confirm(`Delete ${contact.name}?`)) return;
    try {
      await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' });
      getNotificationManager().success('Deleted', contact.name);
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    } catch {
      getNotificationManager().error('Error', 'Failed to delete contact');
    }
  }

  async function handleMarkContacted(contact: Contact) {
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastContactedAt: new Date().toISOString(),
          status: contact.status === 'to_contact' ? 'reached_out' : contact.status,
        }),
      });
      if (!res.ok) throw new Error();
      getNotificationManager().success('Marked Contacted', contact.name);
      load();
    } catch {
      getNotificationManager().error('Error', 'Failed to update contact');
    }
  }

  const statusFilterOptions = [
    { value: '', label: 'All Statuses' },
    ...STATUS_OPTIONS,
  ];
  const typeFilterOptions = [
    { value: '', label: 'All Types' },
    ...TYPE_OPTIONS,
  ];

  return (
    <NavLayout title="Networking" subtitle="Track recruiters, hiring managers, and key contacts">
      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAdd || !!editTarget}
        onClose={() => { setShowAdd(false); setEditTarget(null); setFormError(''); }}
        className="max-w-lg"
      >
        <ModalHeader onClose={() => { setShowAdd(false); setEditTarget(null); setFormError(''); }}>
          <ModalTitle>{editTarget ? 'Edit Contact' : 'Add Contact'}</ModalTitle>
        </ModalHeader>
        <ContactForm
          initial={editTarget ? {
            name: editTarget.name,
            company: editTarget.company ?? '',
            role: editTarget.role ?? '',
            email: editTarget.email ?? '',
            phone: editTarget.phone ?? '',
            linkedInUrl: editTarget.linkedInUrl ?? '',
            type: editTarget.type,
            status: editTarget.status,
            notes: editTarget.notes ?? '',
            followUpAt: editTarget.followUpAt ? editTarget.followUpAt.slice(0, 10) : '',
          } : undefined}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditTarget(null); setFormError(''); }}
          saving={saving}
          error={formError}
        />
      </Modal>

      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
        {/* Stats row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-6">
            {[
              { label: 'Total', value: stats.total },
              { label: 'Responded / Met', value: stats.responded },
              { label: 'Follow-ups Due', value: stats.dueFollowUp },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-2xl font-bold leading-none ${s.label === 'Follow-ups Due' && s.value > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {s.value}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
          <Button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, company, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <Select
                value={filterStatus}
                options={statusFilterOptions}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs"
              />
            </div>
            <Select
              value={filterType}
              options={typeFilterOptions}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12 p-8 border-2 border-dashed border-slate-200 bg-transparent shadow-none">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              {contacts.length === 0 ? 'No contacts yet' : 'No contacts match your filters'}
            </h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {contacts.length === 0
                ? 'Add recruiters, hiring managers, and professional connections to track your outreach.'
                : 'Try adjusting your search or filters.'}
            </p>
            {contacts.length === 0 && (
              <Button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 mx-auto">
                <Plus className="w-4 h-4" />
                Add First Contact
              </Button>
            )}
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => { setEditTarget(contact); setFormError(''); }}
                onDelete={() => handleDelete(contact)}
                onMarkContacted={() => handleMarkContacted(contact)}
              />
            ))}
            {filtered.length < contacts.length && (
              <p className="text-center text-xs text-slate-400 pt-2">
                Showing {filtered.length} of {contacts.length} contacts
              </p>
            )}
          </div>
        )}
      </div>
    </NavLayout>
  );
}
