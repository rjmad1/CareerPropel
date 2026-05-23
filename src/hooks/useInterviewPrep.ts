'use client';

/**
 * useInterviewPrep Hook
 *
 * Manages fetching, caching, and regenerating interview preparation materials.
 * Handles loading states, errors, and manual content generation triggers.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { InterviewPrep } from '@/types/interview';
import { getNotificationManager } from '@/lib/notifications/manager';

interface UseInterviewPrepOptions {
  autoFetch?: boolean;
  cacheTime?: number; // milliseconds
}

interface UseInterviewPrepResult {
  prep: InterviewPrep | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  regenerate: (force?: boolean) => Promise<void>;
  updateContent: (section: keyof InterviewPrep, content: any) => Promise<void>;
  isStale: boolean;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Hook for managing interview preparation data
 */
export function useInterviewPrep(
  jobId: string,
  userId: string,
  options: UseInterviewPrepOptions = {}
): UseInterviewPrepResult {
  const { autoFetch = true, cacheTime = CACHE_TIME } = options;

  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Check if prep is stale
  const isStale = useCallback(() => {
    if (!prep) return true;
    if (Date.now() - lastFetchTime > cacheTime) return true;
    return prep.prepStatus === 'stale';
  }, [prep, lastFetchTime, cacheTime]);

  // Fetch interview prep from API
  const fetchPrep = useCallback(async () => {
    if (!jobId) {
      setError(new Error('Job ID is required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/interview-prep/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setPrep(null);
          return;
        }
        throw new Error(`Failed to fetch interview prep: ${response.statusText}`);
      }

      const data: InterviewPrep = await response.json();
      setPrep(data);
      setLastFetchTime(Date.now());
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setPrep(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Regenerate interview prep (force new generation)
  const regenerate = useCallback(
    async (force = false) => {
      if (!jobId || !userId) {
        setError(new Error('Job ID and User ID are required'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/interview-prep/${jobId}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force, userId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate interview prep: ${response.statusText}`);
        }

        const data: InterviewPrep = await response.json();
        setPrep(data);
        setLastFetchTime(Date.now());
        setError(null);
        getNotificationManager().success('Interview Prep Ready', 'Your prep kit has been generated');
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        getNotificationManager().error('Prep Generation Failed', error.message);
      } finally {
        setLoading(false);
      }
    },
    [jobId, userId]
  );

  // Update specific section of interview prep
  const updateContent = useCallback(
    async (section: keyof InterviewPrep, content: any) => {
      if (!jobId) {
        setError(new Error('Job ID is required'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/interview-prep/${jobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [section]: content }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update interview prep: ${response.statusText}`);
        }

        const data: InterviewPrep = await response.json();
        setPrep(data);
        setLastFetchTime(Date.now());
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [jobId]
  );

  // Refetch prep data
  const refetch = useCallback(async () => {
    await fetchPrep();
  }, [fetchPrep]);

  // Auto-fetch on mount or when jobId changes
  useEffect(() => {
    if (autoFetch && jobId) {
      fetchPrep();
    }
  }, [jobId, autoFetch, fetchPrep]);

  // Auto-regenerate if prep is stale and component is visible
  useEffect(() => {
    if (prep && isStale() && typeof window !== 'undefined') {
      // Only auto-regenerate if user has been idle for a while
      const timer = setTimeout(() => {
        regenerate(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [prep, isStale, regenerate]);

  return {
    prep,
    loading,
    error,
    refetch,
    regenerate,
    updateContent,
    isStale: isStale(),
  };
}

/**
 * Hook for tracking interview prep generation progress.
 * Polls the prep status endpoint while generation is in progress
 * and animates a progress bar to give feedback.
 */
export function useInterviewPrepProgress(jobId: string) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const progressRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTracking = useCallback(() => {
    progressRef.current = 5;
    setProgress(5);
    setStatus('generating');
    setMessage('Generating interview prep with AI…');
  }, []);

  useEffect(() => {
    if (status !== 'generating' || !jobId) return;

    // Animate progress bar toward 85% while waiting for completion
    const animTimer = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + 2, 85);
      setProgress(progressRef.current);
    }, 600);

    let es: EventSource | null = null;

    const finish = (prepStatus: string) => {
      clearInterval(animTimer);
      if (prepStatus === 'ready') {
        setProgress(100);
        setStatus('complete');
        setMessage('Interview prep ready!');
      } else {
        setStatus('error');
        setMessage('Generation failed. Please try again.');
      }
    };

    const startPolling = () => {
      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/interview-prep/${jobId}`);
          if (!res.ok) return;
          const json = await res.json();
          const prepStatus: string | undefined = json.data?.prepStatus;
          if (prepStatus === 'ready' || prepStatus === 'error') {
            clearInterval(pollTimerRef.current ?? undefined);
            pollTimerRef.current = null;
            finish(prepStatus);
          }
        } catch {
          // ignore transient errors
        }
      }, 2500);
    };

    // Try SSE first; fall back to polling if the endpoint is unavailable
    try {
      es = new EventSource(`/api/interview-prep/${jobId}/events`);
      let sseTerminalEventReceived = false;

      es.addEventListener('status', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (typeof data.progress === 'number') {
            progressRef.current = data.progress;
            setProgress(data.progress);
          }
          if (data.prepStatus === 'ready' || data.prepStatus === 'error') {
            sseTerminalEventReceived = true;
            es?.close();
            finish(data.prepStatus);
          }
        } catch { /* ignore parse errors */ }
      });

      es.onerror = () => {
        es?.close();
        es = null;
        if (!sseTerminalEventReceived) startPolling();
      };
    } catch {
      // EventSource not supported in this environment — fall back to polling
      startPolling();
    }

    return () => {
      clearInterval(animTimer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      es?.close();
    };
  }, [jobId, status]);

  return { progress, status, message, startTracking };
}

/**
 * Hook for managing mock interview simulation state
 */
export interface MockInterviewQuestion {
  id: string;
  text: string;
  expectedDuration: number; // seconds
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MockInterviewSession {
  id: string;
  startedAt: Date;
  currentQuestionIndex: number;
  questions: MockInterviewQuestion[];
  userResponses: Map<string, string>;
  timeRemaining: number;
  isComplete: boolean;
}

export function useMockInterview(prep: InterviewPrep | null) {
  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const startSession = useCallback(() => {
    if (!prep) return;

    const questions: MockInterviewQuestion[] = [
      {
        id: '1',
        text: 'Tell me about yourself',
        expectedDuration: 120,
        category: 'behavioral',
        difficulty: 'easy',
      },
      {
        id: '2',
        text: 'Why do you want to work here?',
        expectedDuration: 90,
        category: 'motivation',
        difficulty: 'easy',
      },
      {
        id: '3',
        text: 'Describe a technical challenge and how you solved it',
        expectedDuration: 180,
        category: 'technical',
        difficulty: 'medium',
      },
    ];

    const newSession: MockInterviewSession = {
      id: `session_${Date.now()}`,
      startedAt: new Date(),
      currentQuestionIndex: 0,
      questions,
      userResponses: new Map(),
      timeRemaining: questions.reduce((sum, q) => sum + q.expectedDuration, 0),
      isComplete: false,
    };

    setSession(newSession);
    setIsRecording(false);
    setFeedback(null);
  }, [prep]);

  const recordResponse = useCallback((response: string) => {
    setSession(prev => {
      if (!prev) return null;

      const newSession = { ...prev };
      newSession.userResponses.set(
        prev.questions[prev.currentQuestionIndex].id,
        response
      );

      return newSession;
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setSession(prev => {
      if (!prev) return null;

      const newIndex = prev.currentQuestionIndex + 1;
      if (newIndex >= prev.questions.length) {
        return { ...prev, currentQuestionIndex: newIndex, isComplete: true };
      }

      return { ...prev, currentQuestionIndex: newIndex };
    });

    setIsRecording(false);
    setFeedback(null);
  }, []);

  const previousQuestion = useCallback(() => {
    setSession(prev => {
      if (!prev || prev.currentQuestionIndex === 0) return prev;
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 };
    });

    setIsRecording(false);
    setFeedback(null);
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
    setIsRecording(false);
    setFeedback(null);
  }, []);

  const generateFeedback = useCallback(async () => {
    if (!session) return;

    try {
      // TODO: Call API to generate AI feedback on user responses
      const response = await fetch(`/api/interview-prep/mock/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          responses: Array.from(session.userResponses.entries()),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      }
    } catch (err) {
      setFeedback('Unable to generate feedback at this time');
    }
  }, [session]);

  return {
    session,
    isRecording,
    feedback,
    startSession,
    recordResponse,
    nextQuestion,
    previousQuestion,
    endSession,
    generateFeedback,
    toggleRecording: () => setIsRecording(prev => !prev),
  };
}
