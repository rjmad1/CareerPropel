'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  Loader2,
  Mic,
  RefreshCw,
  SkipForward,
} from 'lucide-react';
import { getNotificationManager } from '@/lib/notifications/manager';
import { InterviewPrep } from '../../types/interview';

interface MockInterviewProps {
  prep: InterviewPrep;
}

interface Question {
  id: string;
  type: 'behavioral' | 'technical';
  question: string;
  category: string;
  timeLimit: number;
  hint: string;
}

interface AiFeedback {
  sessionId: string;
  feedback: string;
  scores: { clarity: number; relevance: number; completeness: number; overall: number };
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
}

type InterviewState = 'setup' | 'answering' | 'submitting' | 'results';

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 'beh-1',
    type: 'behavioral',
    question: 'Tell me about a time you had to work with a difficult teammate. How did you handle it?',
    category: 'Teamwork',
    timeLimit: 120,
    hint: 'Use the STAR framework: describe the Situation, your Task, the Action you took, and the Result.',
  },
  {
    id: 'tech-1',
    type: 'technical',
    question: 'Describe a challenging technical problem you solved. Walk me through your approach.',
    category: 'Problem Solving',
    timeLimit: 180,
    hint: 'Start with context, explain the constraints, then walk through your reasoning step by step.',
  },
  {
    id: 'beh-2',
    type: 'behavioral',
    question: 'Tell me about a time you received critical feedback. How did you respond?',
    category: 'Growth Mindset',
    timeLimit: 120,
    hint: 'Show self-awareness and growth: acknowledge the feedback, explain how you acted on it.',
  },
  {
    id: 'tech-2',
    type: 'technical',
    question: 'Design a system for handling high-volume user notifications. Consider scalability and latency.',
    category: 'System Design',
    timeLimit: 300,
    hint: 'Cover: message broker, fan-out strategy, delivery guarantees, and failure handling.',
  },
  {
    id: 'beh-3',
    type: 'behavioral',
    question: 'Describe a project where you led a team to success. What was your specific role?',
    category: 'Leadership',
    timeLimit: 180,
    hint: 'Emphasise YOUR contributions and decisions, not just the team\'s outcome.',
  },
];

function buildQuestions(prep: InterviewPrep): Question[] {
  const derived: Question[] = [];

  // Use likelyQuestions from prep if available
  const likely: string[] = prep.likelyQuestions ?? [];
  likely.slice(0, 3).forEach((q, i) => {
    derived.push({
      id: `prep-${i}`,
      type: i % 2 === 0 ? 'behavioral' : 'technical',
      question: q,
      category: i % 2 === 0 ? 'Behavioral' : 'Technical',
      timeLimit: 150,
      hint: 'Structure your answer with a clear beginning, middle, and end. Use specific examples.',
    });
  });

  // Fill remaining slots from fallback
  for (const fb of FALLBACK_QUESTIONS) {
    if (derived.length >= 5) break;
    derived.push(fb);
  }

  return derived.slice(0, 5);
}

function fmtTime(secs: number): string {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 10);
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 55 ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = pct >= 75 ? 'text-emerald-700' : pct >= 55 ? 'text-yellow-700' : 'text-red-700';
  const bgColor = pct >= 75 ? 'bg-emerald-50' : pct >= 55 ? 'bg-yellow-50' : 'bg-red-50';
  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{pct}/100</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export const MockInterview: React.FC<MockInterviewProps> = ({ prep }) => {
  const [state, setState] = useState<InterviewState>('setup');
  const [questions] = useState<Question[]>(() => buildQuestions(prep));
  const [qIndex, setQIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const sessionId = useRef('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => { feedbackAbortRef.current?.abort(); };
  }, []);

  const currentQ = questions[qIndex];
  const isOverTime = elapsed > currentQ?.timeLimit;

  // Per-question timer — setElapsed(0) is called at transition sites to avoid extra render
  useEffect(() => {
    if (state !== 'answering') return;
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, qIndex]);

  const handleStart = () => {
    setState('answering');
    setElapsed(0);
    setQIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setFeedback(null);
    setError('');
    setTotalTime(0);
    setShowHint(false);
    sessionId.current = `session-${Date.now()}`;
  };

  const saveAndAdvance = useCallback(
    (skip = false) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const saved = skip ? '[Skipped]' : currentAnswer.trim() || '[No answer provided]';
      const newAnswers = [...answers, saved];
      setAnswers(newAnswers);
      setTotalTime((t) => t + elapsed);
      setCurrentAnswer('');
      setShowHint(false);

      if (qIndex < questions.length - 1) {
        setElapsed(0);
        setQIndex((i) => i + 1);
      } else {
        // All questions answered — submit for AI feedback
        setState('submitting');
        const responses: Array<[string, string]> = questions.map((q, i) => [q.id, newAnswers[i] ?? '[No answer]']);
        const qMeta = questions.map((q) => ({ id: q.id, text: q.question, category: q.category }));

        feedbackAbortRef.current?.abort();
        const controller = new AbortController();
        feedbackAbortRef.current = controller;

        fetch('/api/interview-prep/mock/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId.current, responses, questions: qMeta }),
          signal: controller.signal,
        })
          .then((r) => {
            if (!r.ok) throw new Error(`Request failed: ${r.status}`);
            return r.json();
          })
          .then((data: AiFeedback) => {
            if (controller.signal.aborted) return;
            setFeedback(data);
            setState('results');
            getNotificationManager().success('Feedback Ready', `Overall score: ${Math.round(data.scores.overall * 10)}/100`);
          })
          .catch((err) => {
            if (err.name === 'AbortError') return;
            setError(err.message ?? 'Failed to get feedback');
            setState('results');
            getNotificationManager().error('Feedback Error', 'Could not generate AI feedback. Showing fallback.');
          });
      }
    },
    [answers, currentAnswer, elapsed, qIndex, questions]
  );

  const handleRetake = () => {
    setState('setup');
    setFeedback(null);
    setError('');
  };

  const overallPct = feedback ? Math.round(feedback.scores.overall * 10) : 0;
  const scoreColor =
    overallPct >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : overallPct >= 55 ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div data-cy="mock-interview-tab" className="space-y-8 py-6">

      {/* ── SETUP ── */}
      {state === 'setup' && (
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <Mic className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-semibold text-blue-900 mb-2">Mock Interview Simulation</h3>
                <p className="text-sm text-blue-800">
                  Practice {questions.length} questions drawn from your prep kit. Type your answers,
                  then get AI coaching feedback on clarity, relevance, and completeness.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-slate-900">{questions.length}</div>
              <div className="text-xs text-slate-600 mt-1">Questions</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-slate-900">~15 min</div>
              <div className="text-xs text-slate-600 mt-1">Estimated time</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-slate-900">AI</div>
              <div className="text-xs text-slate-600 mt-1">Feedback</div>
            </div>
          </div>

          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">Tips for best results</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-800">
              <li>• Use the STAR framework for behavioral questions</li>
              <li>• Include specific numbers and outcomes</li>
              <li>• Write at least 3–4 sentences per answer</li>
              <li>• Toggle the hint if you need a nudge</li>
            </ul>
          </section>

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
            data-cy="start-interview-button"
          >
            <Mic className="w-5 h-5" />
            Start Mock Interview
          </button>

          {prep.lastUpdated && isMounted && (
            <div className="text-xs text-slate-400 text-center">
              Prep last updated: {new Date(prep.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* ── ANSWERING ── */}
      {state === 'answering' && currentQ && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(qIndex / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 shrink-0">
              {qIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Question meta */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              currentQ.type === 'behavioral'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {currentQ.type === 'behavioral' ? '💬 Behavioral' : '🔧 Technical'} · {currentQ.category}
            </span>
            <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold ${isOverTime ? 'text-red-600' : 'text-slate-600'}`}>
              <Clock className="w-4 h-4" />
              {fmtTime(elapsed)}
              <span className="text-xs font-normal text-slate-400">/ {fmtTime(currentQ.timeLimit)}</span>
            </div>
          </div>

          {/* Question card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Hint toggle */}
          <button
            onClick={() => setShowHint((h) => !h)}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
          {showHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
              {currentQ.hint}
            </div>
          )}

          {/* Answer textarea */}
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here…"
            rows={7}
            aria-label="Your answer"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            data-cy="answer-textarea"
          />

          {isOverTime && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Over time limit — real interviews prefer concise answers. Consider wrapping up.
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => saveAndAdvance(true)}
              className="flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              data-cy="skip-question-button"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
            <button
              onClick={() => saveAndAdvance(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
              data-cy="next-question-button"
            >
              {qIndex < questions.length - 1 ? (
                <>Next question <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Submit for feedback <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMITTING ── */}
      {state === 'submitting' && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <div className="text-base font-semibold text-slate-800">Analysing your responses…</div>
          <p className="text-sm text-slate-500 max-w-sm">
            Our AI coach is reviewing your answers. This takes about 10–15 seconds.
          </p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {state === 'results' && (
        <div className="space-y-8">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {feedback && (
            <>
              {/* Overall score */}
              <section className={`rounded-xl border p-6 ${scoreColor}`}>
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.15" />
                      <circle
                        cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4"
                        strokeDasharray={`${(overallPct / 100) * 213.6} 213.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold leading-none">{overallPct}</span>
                      <span className="text-xs opacity-70">/100</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1">Overall Score</h3>
                    <p className="text-sm opacity-90">{feedback.feedback}</p>
                    <div className="mt-2 text-xs opacity-70">
                      {answers.filter((a) => a !== '[Skipped]').length}/{questions.length} questions answered ·{' '}
                      {fmtTime(totalTime)} total
                    </div>
                  </div>
                </div>
              </section>

              {/* Score breakdown */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Score Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ScoreBar label="Clarity" value={feedback.scores.clarity} />
                  <ScoreBar label="Relevance" value={feedback.scores.relevance} />
                  <ScoreBar label="Completeness" value={feedback.scores.completeness} />
                  <ScoreBar label="Overall" value={feedback.scores.overall} />
                </div>
              </section>

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                        <span className="mt-0.5">✓</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Areas for improvement */}
              {feedback.areasForImprovement.length > 0 && (
                <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {feedback.areasForImprovement.map((a, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="mt-0.5">•</span><span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Actionable suggestions */}
              {feedback.suggestions.length > 0 && (
                <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Coaching Tips
                  </h3>
                  <ol className="space-y-2">
                    {feedback.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="mt-0.5 font-semibold shrink-0">{i + 1}.</span><span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}

          {/* Next steps */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="text-sm font-semibold text-slate-900 mb-3">🎯 Next Steps</div>
            <ol className="space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
              <li>Review the coaching tips above and note your weakest area</li>
              <li>Check the Behavioral Stories tab for stronger STAR frameworks</li>
              <li>Practice the same questions with different examples</li>
              <li>Retake this session aiming for 80+ overall score</li>
            </ol>
          </section>

          <button
            onClick={handleRetake}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            data-cy="retake-interview-button"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Interview
          </button>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
