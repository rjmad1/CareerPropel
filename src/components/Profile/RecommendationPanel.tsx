'use client';

import React, { useState, useMemo } from 'react';
import { ProfileRecommendation } from '@/types/profile';
import { cn } from '@/lib/utils';

interface RecommendationPanelProps {
  recommendations: ProfileRecommendation[];
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
}

const categoryEmojis = {
  skills: '🛠️',
  experience: '💼',
  resume: '📄',
  portfolio: '🎨',
  goals: '🎯',
  education: '🎓',
};

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  onDismiss,
  onAction,
}) => {
  const [groupBy, setGroupBy] = useState<'priority' | 'category'>('priority');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleRecommendations = useMemo(() => {
    return recommendations.filter((rec) => !dismissedIds.has(rec.id));
  }, [recommendations, dismissedIds]);

  const grouped = useMemo(() => {
    const groups: Record<string, ProfileRecommendation[]> = {};

    visibleRecommendations.forEach((rec) => {
      const key = groupBy === 'priority' ? rec.priority : rec.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });

    return groups;
  }, [visibleRecommendations, groupBy]);

  const highPriorityCount = visibleRecommendations.filter(
    (r) => r.priority === 'high'
  ).length;

  const completedCount = dismissedIds.size;
  const progressPercent =
    recommendations.length > 0
      ? Math.round((completedCount / recommendations.length) * 100)
      : 0;

  const handleDismiss = (id: string) => {
    const updated = new Set(dismissedIds);
    updated.add(id);
    setDismissedIds(updated);
    if (onDismiss) onDismiss(id);
  };

  return (
    <div className="space-y-8">
      {/* Progress Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-900">Progress</span>
          <span className="text-sm font-bold text-gray-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-4">
          {completedCount} of {recommendations.length} recommendations addressed
        </p>
      </div>

      {/* Alert for High Priority */}
      {highPriorityCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <p className="font-semibold text-red-900 text-sm">
            🚨 {highPriorityCount} high-priority recommendations
          </p>
          <p className="text-xs text-red-800 mt-2">
            These items will significantly improve your profile
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setGroupBy('priority')}
          className={cn(
            'px-6 py-4 text-sm font-medium rounded transition-colors',
            groupBy === 'priority'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          By Priority
        </button>
        <button
          onClick={() => setGroupBy('category')}
          className={cn(
            'px-6 py-4 text-sm font-medium rounded transition-colors',
            groupBy === 'category'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          By Category
        </button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-8">
        {visibleRecommendations.length > 0 ? (
          Object.entries(grouped).map(([groupName, recs]) => (
            <div key={groupName}>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-4">
                {groupBy === 'priority' ? '📍' : '📂'} {groupName}
                <span className="text-sm text-gray-600 font-normal">({recs.length})</span>
              </h3>
              <div className="space-y-4">
                {recs.map((rec) => (
                  <div
                    key={rec.id}
                    className={cn(
                      'p-8 border rounded-lg transition-all hover:shadow-sm',
                      priorityColors[rec.priority]
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-sm">
                            {categoryEmojis[rec.category as keyof typeof categoryEmojis]} {rec.suggestion}
                          </span>
                        </div>
                        <p className="text-xs mt-2 opacity-90">{rec.impact}</p>
                      </div>
                      <span className="text-xs font-medium flex-shrink-0 ml-4 opacity-75">
                        {rec.estimatedTime}m
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      {rec.action && (
                        <button
                          onClick={() => onAction?.(rec.id)}
                          className="flex-1 text-xs px-6 py-3 bg-white hover:bg-opacity-90 rounded font-medium transition-colors"
                        >
                          {rec.action}
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(rec.id)}
                        className="text-xs px-6 py-3 bg-white hover:bg-opacity-90 rounded font-medium transition-colors"
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-gray-900">🎉 All set!</p>
            <p className="text-sm text-gray-600 mt-2">
              You&apos;ve addressed all recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationPanel;
