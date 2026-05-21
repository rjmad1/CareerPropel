'use client';

import React, { useState } from 'react';
import { ProfileScore, ProfileRecommendation } from '@/types/profile';
import { cn } from '@/lib/utils';

interface ProfileCompletenessProps {
  score: ProfileScore;
  recommendations?: ProfileRecommendation[];
  loading?: boolean;
  onRefresh?: () => Promise<void>;
}

const scoreCategories = [
  { label: 'Personal Info', key: 'personalInfoScore', emoji: '👤' },
  { label: 'Resume', key: 'resumeScore', emoji: '📄' },
  { label: 'Skills', key: 'skillsScore', emoji: '🛠️' },
  { label: 'Experience', key: 'experienceScore', emoji: '💼' },
  { label: 'Education', key: 'educationScore', emoji: '🎓' },
  { label: 'Goals', key: 'goalsScore', emoji: '🎯' },
  { label: 'Portfolio', key: 'portfolioScore', emoji: '🎨' },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
};

const getRadialColor = (completeness: number) => {
  if (completeness >= 80) return '#10b981'; // green
  if (completeness >= 50) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({
  score,
  recommendations = [],
  loading = false,
  onRefresh,
}) => {
  const [expandedDetails, setExpandedDetails] = useState(false);
  const completenessPercent = Math.round((score.completeness || 0) * 100);

  return (
    <div className="space-y-12">
      {/* Overall Score Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-lg font-semibold text-gray-900">Profile Completeness</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-sm px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-16">
          {/* Radial Progress */}
          <div className="flex-shrink-0">
            <svg width="140" height="140" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r="65"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="70"
                cy="70"
                r="65"
                fill="none"
                stroke={getRadialColor(completenessPercent)}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 65}`}
                strokeDashoffset={`${2 * Math.PI * 65 * (1 - completenessPercent / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center mt-4">
              <div className="text-center">
                <p className={cn('text-3xl font-bold', getScoreColor(completenessPercent))}>
                  {completenessPercent}%
                </p>
                <p className="text-sm text-gray-600 mt-2">Complete</p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="flex-1">
            <div className="mb-12">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">Overall Score</span>
                <span className={cn('text-2xl font-bold', getScoreColor(score.totalScore))}>
                  {score.totalScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className={cn('h-6 rounded-full transition-all', getScoreBgColor(score.totalScore))}
                  style={{
                    width: `${Math.min(score.totalScore, 100)}%`,
                    backgroundColor: getRadialColor(score.totalScore),
                  }}
                />
              </div>
            </div>

            {/* Next Steps */}
            {recommendations.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-sm font-semibold text-amber-900 mb-4">
                  💡 Quick Win
                </p>
                <p className="text-sm text-amber-800">
                  {recommendations[0].suggestion}
                </p>
                <p className="text-xs text-amber-700 mt-4">
                  ⏱️ ~{recommendations[0].estimatedTime} min to complete
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lifelong Career operations Staging */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 transition duration-300">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Continuous Tracking</span>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              📝 Accomplishment Journal
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log daily code contributions, milestones, and system optimizations. Refine vague drafts instantly with the AI STAR metric quantifier.
            </p>
          </div>
          <a
            href="/profile/accomplishments"
            className="mt-6 inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
          >
            Launch Journal Feed →
          </a>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition duration-300">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Review staging</span>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              📊 Performance Appraisals
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stage accomplishments, map them to company core competencies, and compile annual reviews or promotion cases using the AI narrative generator.
            </p>
          </div>
          <a
            href="/profile/appraisals"
            className="mt-6 inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
          >
            Open Workspace →
          </a>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-12">
        <button
          onClick={() => setExpandedDetails(!expandedDetails)}
          className="w-full flex items-center justify-between p-0 hover:text-blue-600"
        >
          <h3 className="font-semibold text-gray-900">Score Breakdown</h3>
          <span className="text-lg">{expandedDetails ? '▼' : '▶'}</span>
        </button>

        {expandedDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {scoreCategories.map((category) => {
              const categoryScore = (score[category.key as keyof ProfileScore] as number) || 0;
              return (
                <div key={category.key} className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {category.emoji} {category.label}
                    </span>
                    <span className={cn('text-sm font-bold', getScoreColor(categoryScore))}>
                      {categoryScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(categoryScore, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12">
          <h3 className="font-semibold text-gray-900 mb-8">
            Recommendations ({recommendations.length})
          </h3>
          <div className="space-y-6">
            {recommendations.slice(0, 5).map((rec) => (
              <div key={rec.id} className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className={cn(
                        'text-xs font-semibold px-4 py-0.5 rounded-full',
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                      )}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600">{rec.category}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{rec.suggestion}</p>
                    <p className="text-xs text-gray-600 mt-2">{rec.impact}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                    {rec.estimatedTime}m
                  </span>
                </div>
                {rec.action && (
                  <button className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    {rec.action} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCompleteness;
