'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { ProfileEditor } from '@/components/Profile/ProfileEditor';
import { ProfileCompleteness } from '@/components/Profile/ProfileCompleteness';
import { RecommendationPanel } from '@/components/Profile/RecommendationPanel';
import { SkillMatrix } from '@/components/Profile/SkillMatrix';
import { AchievementExtractor } from '@/components/Profile/AchievementExtractor';
import { useProfile } from '@/hooks/useProfile';

type TabId = 'overview' | 'editor' | 'skills' | 'achievements' | 'recommendations' | 'import';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'editor', label: 'Edit Profile', icon: '✏️' },
  { id: 'skills', label: 'Skills', icon: '🛠️' },
  { id: 'achievements', label: 'Achievements', icon: '⭐' },
  { id: 'recommendations', label: 'Recommendations', icon: '💡' },
  { id: 'import', label: 'Import', icon: '🔗' },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const candidateId = (session?.user as any)?.id ?? session?.user?.email ?? '';

  const {
    profile,
    score,
    recommendations,
    loading,
    error,
    unsavedChanges,
    updateProfile,
    refresh,
  } = useProfile(candidateId);

  async function handleSave(data: Record<string, unknown>) {
    await updateProfile(data);
  }

  return (
    <NavLayout
      title="Profile"
      subtitle="Manage your professional profile, skills, and ATS optimization"
    >
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error.message}
          </div>
        )}

        {/* Unsaved changes banner */}
        {unsavedChanges && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center justify-between">
            <span>You have unsaved changes — auto-saving in 2 seconds...</span>
            <button
              onClick={refresh}
              className="text-yellow-600 hover:text-yellow-800 font-medium underline text-xs"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
              ) : score ? (
                <ProfileCompleteness
                  score={score}
                  recommendations={recommendations}
                  loading={loading}
                  onRefresh={refresh}
                />
              ) : (
                <EmptyProfileState onRefresh={refresh} />
              )}
            </div>
          )}

          {activeTab === 'editor' && (
            <ProfileEditor
              candidateId={candidateId}
              onSave={handleSave}
              loading={loading}
            />
          )}

          {activeTab === 'skills' && (
            loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              </div>
            ) : (
              <SkillMatrix
                skills={(profile as any)?.topSkills ?? []}
                onSkillUpdate={(skill) => updateProfile({ skills: [skill] })}
                onSkillDelete={(name) => console.log('delete skill', name)}
              />
            )
          )}

          {activeTab === 'achievements' && (
            loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              </div>
            ) : (
              <AchievementExtractor
                achievements={(profile as any)?.recentAchievements ?? []}
                onAddAchievement={(a) => updateProfile({ achievements: [a] })}
                onDeleteAchievement={(id) => console.log('delete achievement', id)}
              />
            )
          )}

          {activeTab === 'import' && (
            <LinkedInImportPanel onImported={refresh} />
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
              ) : recommendations.length > 0 ? (
                <RecommendationPanel
                  recommendations={recommendations}
                  onDismiss={(id) => console.log('dismiss', id)}
                  onAction={(id) => console.log('action', id)}
                />
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
                  <div className="text-4xl mb-3">💡</div>
                  <h3 className="font-semibold text-gray-900 mb-1">No recommendations yet</h3>
                  <p className="text-sm text-gray-500">
                    Complete your profile to receive personalized recommendations.
                  </p>
                  <button
                    onClick={refresh}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </NavLayout>
  );
}

// ─── LinkedIn Import Panel ────────────────────────────────────────────────────

function LinkedInImportPanel({ onImported }: { onImported: () => void }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; experience: number; skills: number } | null>(null);
  const [error, setError] = useState('');

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/linkedin/import-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl: url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? json.error?.message ?? 'Import failed');
      setResult(json.data ?? json);
      onImported();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Import from LinkedIn</h3>
        <p className="text-sm text-gray-500 mb-4">
          Paste your public LinkedIn profile URL to import experience, education, and skills. The profile must be publicly visible.
        </p>

        <form onSubmit={handleImport} className="flex gap-2">
          <input
            type="url"
            required
            placeholder="https://www.linkedin.com/in/your-profile"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Importing…' : 'Import'}
          </button>
        </form>

        {loading && (
          <p className="text-xs text-gray-400 mt-2">
            Opening browser to read your profile — this takes 15–30 seconds.
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 space-y-1">
            <p className="font-medium">Import complete for {result.name}</p>
            <p>{result.experience} experience entries · {result.skills} skills added to your profile</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Public profile required</p>
        <p>Set your LinkedIn profile visibility to "Public" in LinkedIn Settings → Visibility → Edit your public profile.</p>
      </div>
    </div>
  );
}

function EmptyProfileState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
      <div className="text-5xl mb-4">👤</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not set up yet</h3>
      <p className="text-gray-500 text-sm mb-4">
        Upload your resume or fill in your profile to get started.
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
