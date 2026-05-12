'use client';

import { useState, useCallback, useEffect } from 'react';
import { InterviewPrep, PrepGenerationRequest, PrepGenerationResponse } from '@/types/interview';
import { useRealTime } from './useRealTime';

interface UseInterviewPrepOptions {
  autoGenerate?: boolean;
  jobId?: string;
}

/**
 * useInterviewPrep - Hook for managing interview preparation
 * 
 * Features:
 * - Auto-generate interview prep from job description + resume
 * - Real-time updates to prep content
 * - Progress tracking
 * - Caching
 * 
 * Usage:
 * ```
 * const { prep, isGenerating, error, generatePrep } = useInterviewPrep({
 *   jobId: 'job-123',
 *   autoGenerate: true,
 * });
 * ```
 */
export const useInterviewPrep = (options: UseInterviewPrepOptions = {}) => {
  const { autoGenerate = false, jobId } = options;

  // State
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Real-time connection
  const { subscribe, send } = useRealTime({
    autoConnect: true,
    channels: ['interview_prep:generate', 'interview_prep:update'],
  });

  /**
   * Generate interview prep from job description and resume
   */
  const generatePrep = useCallback(
    async (request: PrepGenerationRequest): Promise<InterviewPrep | null> => {
      try {
        setIsGenerating(true);
        setError(null);
        setGenerationProgress(0);

        // Subscribe to generation progress
        const unsubscribeProgress = subscribe('interview_prep:generate', (message: any) => {
          if (message.type === 'interview_prep:generate' && message.data.jobId === request.jobId) {
            setGenerationProgress(message.data.progress || 0);
          }
        });

        // Send generation request to backend
        send({
          type: 'interview_prep:generate_request',
          data: request,
        });

        // Wait for generation to complete (via WebSocket)
        // In a real implementation, would wait for 'interview_prep:generate_complete' message
        const prepResult = await waitForPrepGeneration(request.jobId);

        if (prepResult) {
          setPrep(prepResult);
          setGenerationProgress(100);
        }

        unsubscribeProgress();
        return prepResult;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate prep';
        setError(errorMsg);
        console.error('Interview prep generation error:', err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [subscribe, send]
  );

  /**
   * Update existing prep content
   */
  const updatePrep = useCallback(
    async (updates: Partial<InterviewPrep>): Promise<boolean> => {
      try {
        setError(null);

        if (!prep) {
          setError('No prep loaded');
          return false;
        }

        // Send update request
        send({
          type: 'interview_prep:update_request',
          data: {
            prepId: prep.id,
            updates,
          },
        });

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update prep';
        setError(errorMsg);
        console.error('Interview prep update error:', err);
        return false;
      }
    },
    [prep, send]
  );

  /**
   * Refresh prep from server (refetch latest)
   */
  const refreshPrep = useCallback(async (): Promise<boolean> => {
    if (!jobId) {
      setError('No job ID provided');
      return false;
    }

    try {
      setError(null);

      send({
        type: 'interview_prep:fetch_request',
        data: { jobId },
      });

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh prep';
      setError(errorMsg);
      return false;
    }
  }, [jobId, send]);

  /**
   * Mark a study session as complete
   */
  const markStudyComplete = useCallback(
    async (studyType: string): Promise<boolean> => {
      if (!prep) {
        setError('No prep loaded');
        return false;
      }

      try {
        send({
          type: 'interview_prep:mark_complete',
          data: {
            prepId: prep.id,
            studyType,
            completedAt: new Date(),
          },
        });

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to mark complete';
        setError(errorMsg);
        return false;
      }
    },
    [prep, send]
  );

  /**
   * Add custom study note to prep
   */
  const addStudyNote = useCallback(
    async (note: string, category: string): Promise<boolean> => {
      if (!prep) {
        setError('No prep loaded');
        return false;
      }

      try {
        send({
          type: 'interview_prep:add_note',
          data: {
            prepId: prep.id,
            note,
            category,
            timestamp: new Date(),
          },
        });

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add note';
        setError(errorMsg);
        return false;
      }
    },
    [prep, send]
  );

  // Subscribe to real-time prep updates
  useEffect(() => {
    const unsubscribe = subscribe('interview_prep:update', (message: any) => {
      if (message.type === 'interview_prep:update' && prep && message.data.prepId === prep.id) {
        setPrep((prev) =>
          prev
            ? {
                ...prev,
                ...message.data.updates,
                lastUpdated: new Date(),
              }
            : null
        );
      }
    });

    return unsubscribe;
  }, [subscribe, prep?.id]);

  // Auto-generate on mount if jobId provided
  useEffect(() => {
    if (autoGenerate && jobId && !prep && !isGenerating) {
      // In real implementation, would fetch job data and user resume first
      // For now, just trigger a fetch
      refreshPrep();
    }
  }, [autoGenerate, jobId, prep, isGenerating, refreshPrep]);

  return {
    prep,
    isGenerating,
    error,
    generationProgress,
    generatePrep,
    updatePrep,
    refreshPrep,
    markStudyComplete,
    addStudyNote,
  };
};

/**
 * Hook for interview prep with company research integration
 */
export const useInterviewPrepWithResearch = (jobId?: string) => {
  const interviewPrep = useInterviewPrep({ jobId, autoGenerate: false });
  const [companyData, setCompanyData] = useState<any>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);

  /**
   * Fetch company research
   */
  const fetchCompanyResearch = useCallback(async (companyName: string) => {
    try {
      setIsLoadingCompany(true);
      // In real implementation, would fetch from API or WebSocket
      // For now, placeholder
      console.log('Fetching company research for:', companyName);
    } catch (err) {
      console.error('Failed to fetch company research:', err);
    } finally {
      setIsLoadingCompany(false);
    }
  }, []);

  return {
    ...interviewPrep,
    companyData,
    isLoadingCompany,
    fetchCompanyResearch,
  };
};

/**
 * Hook for tracking interview prep readiness
 */
export const useInterviewReadiness = (jobId?: string) => {
  const [readiness, setReadiness] = useState({
    behavioral: 0,
    technical: 0,
    systemDesign: 0,
    companyResearch: 0,
    overall: 0,
  });

  const { subscribe } = useRealTime();

  // Subscribe to readiness updates
  useEffect(() => {
    const unsubscribe = subscribe('interview_readiness:update', (message: any) => {
      if (message.type === 'interview_readiness:update' && message.data.jobId === jobId) {
        setReadiness(message.data.readiness);
      }
    });

    return unsubscribe;
  }, [jobId, subscribe]);

  const isReadyForInterview = readiness.overall >= 80;

  return {
    readiness,
    isReadyForInterview,
    weakAreas: Object.entries(readiness)
      .filter(([, score]) => score < 70)
      .map(([area]) => area),
  };
};

/**
 * Helper to wait for prep generation to complete
 * In a real implementation, would use a Promise that resolves when
 * the 'interview_prep:generate_complete' message arrives
 */
async function waitForPrepGeneration(jobId: string): Promise<InterviewPrep | null> {
  // Placeholder - would be implemented with proper messaging
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null);
    }, 30000); // 30 second timeout

    // In real implementation, would listen for completion message
    // and resolve with actual prep data

    return () => clearTimeout(timeout);
  });
}

export default useInterviewPrep;
