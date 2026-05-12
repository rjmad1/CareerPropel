import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProfileScore, ProfileRecommendation } from '@/types/profile';
import { getProfileScore, generateProfileRecommendations, detectSkillGaps } from '@/lib/profile/profileService';

export interface UseProfileCompletionResult {
  completeness: number;
  breakdown: Record<string, number>;
  recommendations: ProfileRecommendation[];
  milestones: { reached: number[]; next: number };
  skillGaps: {
    missingSkills: string[];
    gapLevel: 'low' | 'medium' | 'high';
  };
  loading: boolean;
  error: Error | null;

  trackProgress: (category: string, improvement: number) => void;
}

/**
 * Hook for tracking profile completeness and improvements
 * 
 * Features:
 * - Real-time completeness tracking
 * - Milestone celebrations
 * - Skill gap detection
 * - Progress visualization
 */
export function useProfileCompletion(
  candidateId: string,
  profile?: any,
  targetJobDescriptions?: string[]
): UseProfileCompletionResult {
  const [score, setScore] = useState<ProfileScore | null>(null);
  const [recommendations, setRecommendations] = useState<ProfileRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progressTracker, setProgressTracker] = useState<Record<string, number>>({});

  /**
   * Fetch completeness data
   */
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

  /**
   * Detect skill gaps
   */
  const skillGaps = useMemo(() => {
    if (!profile || !targetJobDescriptions || targetJobDescriptions.length === 0) {
      return { missingSkills: [], gapLevel: 'low' as const };
    }

    const gaps = detectSkillGaps(profile, targetJobDescriptions);
    return {
      missingSkills: gaps.missingSkills,
      gapLevel: gaps.gapLevel,
    };
  }, [profile, targetJobDescriptions]);

  /**
   * Calculate milestones
   */
  const milestones = useMemo(() => {
    const completeness = score?.completeness || 0;
    const completenessPercent = Math.round(completeness * 100);
    const reached = [0, 25, 50, 75].filter((m) => completenessPercent >= m);
    const next =
      reached.includes(100) ? 100 : [25, 50, 75, 100].find((m) => m > completenessPercent) || 100;

    return { reached, next };
  }, [score?.completeness]);

  /**
   * Track progress update
   */
  const trackProgress = useCallback((category: string, improvement: number) => {
    setProgressTracker((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + improvement,
    }));

    // Refetch completeness after tracking progress
    setTimeout(fetchCompletion, 500);
  }, [fetchCompletion]);

  /**
   * Calculate breakdown
   */
  const breakdown = useMemo(() => ({
    personalInfo: score?.personalInfoScore || 0,
    resume: score?.resumeScore || 0,
    skills: score?.skillsScore || 0,
    experience: score?.experienceScore || 0,
    education: score?.educationScore || 0,
    goals: score?.goalsScore || 0,
    portfolio: score?.portfolioScore || 0,
  }), [score]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (candidateId) {
      fetchCompletion();
    }
  }, [candidateId, fetchCompletion]);

  return {
    completeness: score?.completeness ? Math.round(score.completeness * 100) : 0,
    breakdown,
    recommendations,
    milestones,
    skillGaps,
    loading,
    error,

    trackProgress,
  };
}

export default useProfileCompletion;
