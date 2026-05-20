import { useState, useEffect, useCallback, useRef } from 'react';
import { ProfileScore, ProfileEntity, ProfileRecommendation, ProfileSummary } from '@/types/profile';
import {
  getProfileSummary,
  getProfileScore,
  updateProfile,
  getProfileEntities,
  generateProfileRecommendations,
} from '@/lib/profile/profileService';

export interface UseProfileResult {
  profile: ProfileSummary | null;
  score: ProfileScore | null;
  entities: ProfileEntity[];
  recommendations: ProfileRecommendation[];
  loading: boolean;
  error: Error | null;
  unsavedChanges: boolean;

  // Actions
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  addEntity: (entity: ProfileEntity) => void;
  removeEntity: (id: string) => void;
  refresh: () => Promise<void>;
  discardChanges: () => void;

  // Lifecycle
  isStale: boolean;
  lastFetch: Date | null;
}

/**
 * Hook for managing user profile state
 * 
 * Features:
 * - Profile data fetching and caching
 * - Automatic staleness detection
 * - Change tracking
 * - Entity management
 * - Recommendation fetching
 */
export function useProfile(
  candidateId: string,
  options?: {
    cacheTTL?: number; // in milliseconds, default 15min
    autoRefresh?: boolean;
    onStaleDetected?: () => void;
  }
): UseProfileResult {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [score, setScore] = useState<ProfileScore | null>(null);
  const [entities, setEntities] = useState<ProfileEntity[]>([]);
  const [recommendations, setRecommendations] = useState<ProfileRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const cacheTTL = options?.cacheTTL || 15 * 60 * 1000; // 15 minutes
  const lastFetchRef = useRef<Date | null>(null);
  const pendingChangesRef = useRef<Record<string, unknown>>({});

  const isStale = useCallback(() => {
    if (!lastFetchRef.current) return true;
    return Date.now() - lastFetchRef.current.getTime() > cacheTTL;
  }, [cacheTTL]);

  /**
   * Fetch all profile data
   */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summary, scoreData, entitiesData, recsData] = await Promise.all([
        getProfileSummary(candidateId),
        getProfileScore(candidateId),
        getProfileEntities(candidateId),
        generateProfileRecommendations(candidateId),
      ]);

      setProfile(summary);
      setScore(scoreData);
      setEntities(entitiesData);
      setRecommendations(recsData);
      lastFetchRef.current = new Date();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  /**
   * Update profile with debouncing
   */
  const updateProfileData = useCallback(async (data: Record<string, unknown>) => {
    try {
      // Merge with pending changes
      pendingChangesRef.current = { ...pendingChangesRef.current, ...data };
      setUnsavedChanges(true);

      // Auto-save after 2 seconds of inactivity
      setTimeout(async () => {
        try {
          await updateProfile(candidateId, pendingChangesRef.current);
          pendingChangesRef.current = {};
          setUnsavedChanges(false);
          lastFetchRef.current = new Date();
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Save failed'));
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update failed'));
    }
  }, [candidateId]);

  /**
   * Add entity to profile
   */
  const addEntity = useCallback((entity: ProfileEntity) => {
    setEntities((prev) => [entity, ...prev]);
    setUnsavedChanges(true);
  }, []);

  /**
   * Remove entity from profile
   */
  const removeEntity = useCallback((id: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setUnsavedChanges(true);
  }, []);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  /**
   * Discard unsaved changes
   */
  const discardChanges = useCallback(() => {
    pendingChangesRef.current = {};
    setUnsavedChanges(false);
  }, []);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (candidateId) {
      fetchProfile();
    }
  }, [candidateId, fetchProfile]);

  /**
   * Auto-refresh on stale detection
   */
  useEffect(() => {
    if (!options?.autoRefresh || !lastFetchRef.current) return;

    const interval = setInterval(() => {
      if (isStale()) {
        if (options?.onStaleDetected) options.onStaleDetected();
        fetchProfile();
      }
    }, cacheTTL / 2);

    return () => clearInterval(interval);
  }, [cacheTTL, isStale, fetchProfile, options]);

  return {
    profile,
    score,
    entities,
    recommendations,
    loading,
    error,
    unsavedChanges,

    updateProfile: updateProfileData,
    addEntity,
    removeEntity,
    refresh,
    discardChanges,

    isStale: isStale(),
    lastFetch: lastFetchRef.current,
  };
}

export default useProfile;
