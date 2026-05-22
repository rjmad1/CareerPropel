'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { getNotificationManager } from '@/lib/notifications/manager';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Input, Textarea, Card, CardBody } from '@/components/ui';
import {
  Mail,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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
      getNotificationManager().success('Email Ready', `${typeInfo.label} email drafted${label !== typeInfo.label ? ` for ${label}` : ''}`);
    } catch (err: any) {
      getNotificationManager().error('Generation Failed', err.message ?? 'Something went wrong');
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
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Email Type Selection */}
            <Card>
              <CardBody className="p-6 flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  Email Type
                </h2>
                <div className="flex flex-col gap-2">
                  {EMAIL_TYPES.map((t) => (
                    <div
                      key={t.value}
                      onClick={() => setField('type', t.value)}
                      className={`p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none ${
                        form.type === t.value
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'border-slate-100 hover:border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      <span className={`text-sm font-semibold block leading-tight ${
                        form.type === t.value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {t.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block leading-normal">
                        {t.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Dynamic Fields Form */}
            <Card>
              <CardBody className="p-6 flex flex-col gap-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Details</h2>

                <div className="flex flex-col gap-4">
                  {visibleFields.map((key) => {
                    const label = FIELD_LABELS[key] ?? key;
                    const isTextarea = key === 'reason' || key === 'context';
                    const isNumber = key === 'daysSinceInterview' || key === 'offerAmount' || key === 'targetAmount';

                    if (isTextarea) {
                      return (
                        <Textarea
                          key={key}
                          label={label}
                          value={(form as any)[key]}
                          onChange={(e) => setField(key, e.target.value)}
                          placeholder={`Enter ${label.toLowerCase()}…`}
                          rows={3}
                        />
                      );
                    }

                    return (
                      <Input
                        key={key}
                        label={label}
                        type={isNumber ? 'number' : 'text'}
                        value={(form as any)[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}…`}
                      />
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 mt-2"
                  onClick={handleGenerate}
                  loading={generating}
                >
                  {!generating && <Sparkles className="w-4 h-4" />}
                  {generating ? 'Generating…' : 'Generate Email'}
                </Button>

              </CardBody>
            </Card>

            {/* History Panel */}
            {history.length > 0 && (
              <Card>
                <CardBody className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Session History ({history.length})
                    </span>
                    <button className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {showHistory && (
                    <div className="flex flex-col gap-2 mt-4 max-h-60 overflow-y-auto pr-1">
                      {history.map((entry, i) => {
                        const typeInfo = EMAIL_TYPES.find((t) => t.value === entry.type)!;
                        const isSelected = activeHistory === entry.email;
                        return (
                          <div
                            key={i}
                            onClick={() => setActiveHistory(entry.email)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? 'border-blue-300 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10'
                                : 'border-slate-100 hover:bg-slate-50 bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                              {typeInfo.label} — {entry.label}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate block mt-1">
                              {entry.email.subject}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Side: Output */}
          <div className="lg:col-span-7">
            {displayed ? (
              <Card className="h-full flex flex-col">
                {/* Subject Block */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-t-lg">
                  <div className="min-w-0 flex-1">
                    <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                      Subject
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate block">
                      {displayed.subject}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`ml-4 shrink-0 transition-all ${
                      copied === 'subject' ? 'text-green-600 border-green-200 bg-green-50' : ''
                    }`}
                    onClick={() => handleCopy(displayed.subject, 'subject')}
                  >
                    {copied === 'subject' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Email Body Block */}
                <CardBody className="p-6 flex-1 flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">
                      Body
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={copied === 'body' ? 'text-green-600 border-green-200 bg-green-50' : ''}
                        onClick={() => handleCopy(displayed.body, 'body')}
                      >
                        {copied === 'body' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied body</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy body</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className={copied === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => handleCopy(`Subject: ${displayed.subject}\n\n${displayed.body}`, 'all')}
                      >
                        {copied === 'all' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied all</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            <span>Copy all</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/40 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed min-h-[300px] max-h-[50vh] overflow-y-auto">
                      {displayed.body}
                    </pre>
                  </div>
                </CardBody>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleGenerate}
                    loading={generating}
                  >
                    {!generating && <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                    {generating ? 'Regenerating…' : 'Regenerate'}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center bg-white dark:bg-slate-900 min-h-[480px]">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-800">
                  <Mail className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No email generated yet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
                  Choose an email type, fill in the details, and click <strong>Generate Email</strong> to get a tailored professional email instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
