import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ProfileScore, ProfileRecommendation } from '@/types/profile';
import { getProfileScore, generateProfileRecommendations } from '@/lib/profile/profileService';

export interface UseProfileCompletionResult {
  completeness: number;
  breakdown: Record<string, number>;
  recommendations: ProfileRecommendation[];
  milestones: { reached: number[]; next: number };
  skillGaps: {
    missingSkills: string[];
    gapLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  skillGapsError: Error | null;
  loading: boolean;
  error: Error | null;
  trackProgress: (category: string, improvement: number) => void;
}

export function useProfileCompletion(
  candidateId: string,
  targetJobDescriptions?: string[]
): UseProfileCompletionResult {
  const [score, setScore] = useState<ProfileScore | null>(null);
  const [recommendations, setRecommendations] = useState<ProfileRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [skillGaps, setSkillGaps] = useState<{
    missingSkills: string[];
    gapLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }>({ missingSkills: [], gapLevel: 'low', recommendations: [] });
  const [skillGapsError, setSkillGapsError] = useState<Error | null>(null);
  // useRef avoids triggering re-renders on every trackProgress call
  const progressTracker = useRef<Record<string, number>>({});
  const completionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCompletion = useCallback(async () => {
    try {
      setLoading(true);
      const [scoreData, recsData] = await Promise.all([
        getProfileScore(candidateId),
        generateProfileRecommendations(candidateId),
      ]);
      setScore(scoreData);
      setRecommendations(recsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch completion data'));
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  // Async skill-gap detection via Claude endpoint
  const fetchSkillGaps = useCallback(async (jobDescriptions: string[]) => {
    try {
      setSkillGapsError(null);
      const res = await fetch('/api/profile/skill-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescriptions }),
      });
      if (!res.ok) {
        const err = new Error(`skill-gaps fetch failed: ${res.status} ${res.statusText}`);
        setSkillGapsError(err);
        console.error('[useProfileCompletion] skill-gaps error:', err.message);
        return;
      }
      const data = await res.json();
      setSkillGaps({
        missingSkills: data.missingSkills ?? [],
        gapLevel: data.gapLevel ?? 'low',
        recommendations: data.recommendations ?? [],
      });
    } catch (err) {
      const e = err instanceof Error ? err : new Error('skill-gaps fetch failed');
      setSkillGapsError(e);
      console.error('[useProfileCompletion] skill-gaps error:', e.message);
    }
  }, []);

  const milestones = useMemo(() => {
    const completeness = score?.completeness || 0;
    const completenessPercent = Math.round(completeness * 100);
    const reached = [0, 25, 50, 75].filter((m) => completenessPercent >= m);
    const next =
      reached.includes(100) ? 100 : [25, 50, 75, 100].find((m) => m > completenessPercent) || 100;
    return { reached, next };
  }, [score?.completeness]);

  const trackProgress = useCallback(
    (category: string, improvement: number) => {
      progressTracker.current[category] = (progressTracker.current[category] || 0) + improvement;
      if (completionDebounceRef.current) clearTimeout(completionDebounceRef.current);
      completionDebounceRef.current = setTimeout(fetchCompletion, 500);
    },
    [fetchCompletion]
  );

  const breakdown = useMemo(
    () => ({
      personalInfo: score?.personalInfoScore || 0,
      resume: score?.resumeScore || 0,
      skills: score?.skillsScore || 0,
      experience: score?.experienceScore || 0,
      education: score?.educationScore || 0,
      goals: score?.goalsScore || 0,
      portfolio: score?.portfolioScore || 0,
    }),
    [score]
  );

  useEffect(() => {
    if (candidateId) fetchCompletion();
  }, [candidateId, fetchCompletion]);

  // Serialize targetJobDescriptions to avoid re-running when the array is recreated
  const jobDescKey = JSON.stringify(targetJobDescriptions ?? []);
  useEffect(() => {
    if (candidateId) fetchSkillGaps(JSON.parse(jobDescKey) as string[]);
  }, [candidateId, jobDescKey, fetchSkillGaps]);

  return {
    completeness: score?.completeness ? Math.round(score.completeness * 100) : 0,
    breakdown,
    recommendations,
    milestones,
    skillGaps,
    skillGapsError,
    loading,
    error,
    trackProgress,
  };
}

export default useProfileCompletion;
