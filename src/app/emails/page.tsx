'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Mail, Copy, Check, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

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

const EMAIL_TYPES: { value: EmailType; label: string; description: string; icon: string }[] = [
  { value: 'thank_you', label: 'Thank You', description: 'Post-interview thank you note', icon: '🙏' },
  { value: 'follow_up', label: 'Follow Up', description: 'Check-in after interview or application', icon: '📬' },
  { value: 'counter_offer', label: 'Counter Offer', description: 'Negotiate salary or terms', icon: '💰' },
  { value: 'withdraw', label: 'Withdraw', description: 'Politely decline or withdraw application', icon: '🚪' },
  { value: 'recruiter_reach_out', label: 'Recruiter Outreach', description: 'Connect with a recruiter', icon: '🤝' },
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
      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-5">
            {/* Email type */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Email Type</h2>
              <div className="space-y-2">
                {EMAIL_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      form.type === t.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emailType"
                      value={t.value}
                      checked={form.type === t.value}
                      onChange={() => setField('type', t.value)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="text-sm font-medium text-gray-800">
                        {t.icon} {t.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">{t.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic fields */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Details</h2>

              {visibleFields.map((key) => {
                const label = FIELD_LABELS[key] ?? key;
                const isTextarea = key === 'reason' || key === 'context';
                const isNumber = key === 'daysSinceInterview' || key === 'offerAmount' || key === 'targetAmount';

                return (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    {isTextarea ? (
                      <textarea
                        rows={2}
                        value={(form as any)[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder={`Enter ${label.toLowerCase()}…`}
                      />
                    ) : (
                      <input
                        type={isNumber ? 'number' : 'text'}
                        value={(form as any)[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${label.toLowerCase()}…`}
                        min={isNumber ? 0 : undefined}
                      />
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Email
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
                >
                  <span>Session History ({history.length})</span>
                  {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showHistory && (
                  <div className="mt-3 space-y-2">
                    {history.map((entry, i) => {
                      const typeInfo = EMAIL_TYPES.find((t) => t.value === entry.type)!;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveHistory(entry.email)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                            activeHistory === entry.email
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          <p className="font-medium text-gray-800 truncate">
                            {typeInfo.icon} {entry.label}
                          </p>
                          <p className="text-gray-500 truncate">{entry.email.subject}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-3">
            {displayed ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Subject */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</span>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{displayed.subject}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(displayed.subject, 'subject')}
                    className="ml-3 flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition flex-shrink-0"
                  >
                    {copied === 'subject' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    {copied === 'subject' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Body */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(displayed.body, 'body')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                      >
                        {copied === 'body' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                        {copied === 'body' ? 'Copied' : 'Copy body'}
                      </button>
                      <button
                        onClick={() => handleCopy(`Subject: ${displayed.subject}\n\n${displayed.body}`, 'all')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                      >
                        {copied === 'all' ? <Check size={12} className="text-green-600" /> : <Mail size={12} />}
                        {copied === 'all' ? 'Copied!' : 'Copy all'}
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed min-h-64 max-h-[60vh] overflow-y-auto">
                    {displayed.body}
                  </pre>
                </div>

                {/* Regenerate */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition disabled:opacity-50"
                  >
                    <Loader2 size={12} className={generating ? 'animate-spin' : 'hidden'} />
                    <Sparkles size={12} className={generating ? 'hidden' : ''} />
                    {generating ? 'Regenerating…' : 'Regenerate'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-96 text-center p-8">
                <Mail size={48} className="text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">No email generated yet</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Choose an email type, fill in the details, and click{' '}
                  <strong>Generate Email</strong> to get a tailored professional email.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
