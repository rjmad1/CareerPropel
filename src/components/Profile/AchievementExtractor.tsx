'use client';

import React, { useState } from 'react';
import { Achievement } from '@/types/profile';

interface AchievementExtractorProps {
  achievements: Achievement[];
  onAddAchievement?: (achievement: Omit<Achievement, 'id'>) => void;
  onUpdateAchievement?: (id: string, achievement: Partial<Achievement>) => void;
  onDeleteAchievement?: (id: string) => void;
  onExtractFromResume?: () => Promise<Achievement[]>;
}

export const AchievementExtractor: React.FC<AchievementExtractorProps> = ({
  achievements,
  onAddAchievement,
  onDeleteAchievement,
  onExtractFromResume,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    context: '',
    impact: '',
    metrics: [] as Array<{ metric: string; value: string | number; unit: string }>,
  });

  const handleAddMetric = () => {
    setNewAchievement({
      ...newAchievement,
      metrics: [...newAchievement.metrics, { metric: '', value: '', unit: '' }],
    });
  };

  const handleRemoveMetric = (index: number) => {
    setNewAchievement({
      ...newAchievement,
      metrics: newAchievement.metrics.filter((_, i) => i !== index),
    });
  };

  const handleSaveAchievement = () => {
    if (!newAchievement.title || !newAchievement.description) {
      alert('Title and description are required');
      return;
    }

    if (onAddAchievement) {
      onAddAchievement({
        title: newAchievement.title,
        description: newAchievement.description,
        context: newAchievement.context,
        impact: newAchievement.impact,
        metrics: newAchievement.metrics,
        date: new Date(),
        relevantSkills: [],
      });
    }

    setNewAchievement({
      title: '',
      description: '',
      context: '',
      impact: '',
      metrics: [],
    });
    setShowAddForm(false);
  };

  const handleExtract = async () => {
    if (!onExtractFromResume) return;
    setIsExtracting(true);
    try {
      await onExtractFromResume();
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
        >
          + Add Achievement
        </button>
        {onExtractFromResume && (
          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-900 rounded text-sm font-medium transition-colors"
          >
            {isExtracting ? '🔄 Extracting...' : '🤖 Extract from Resume'}
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-8 border border-blue-300 bg-blue-50 rounded-lg space-y-6">
          <h3 className="font-semibold text-gray-900">New Achievement</h3>
          
          <input
            type="text"
            placeholder="Achievement title"
            value={newAchievement.title}
            onChange={(e) =>
              setNewAchievement({ ...newAchievement, title: e.target.value })
            }
            className="w-full px-6 py-4 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Description of the achievement"
            value={newAchievement.description}
            onChange={(e) =>
              setNewAchievement({ ...newAchievement, description: e.target.value })
            }
            rows={3}
            className="w-full px-6 py-4 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Context (company/project)"
            value={newAchievement.context}
            onChange={(e) =>
              setNewAchievement({ ...newAchievement, context: e.target.value })
            }
            className="w-full px-6 py-4 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Business impact"
            value={newAchievement.impact}
            onChange={(e) =>
              setNewAchievement({ ...newAchievement, impact: e.target.value })
            }
            className="w-full px-6 py-4 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Metrics */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Metrics</label>
            {newAchievement.metrics.map((metric, idx) => (
              <div key={idx} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Metric name"
                  value={metric.metric}
                  onChange={(e) => {
                    const updated = [...newAchievement.metrics];
                    updated[idx].metric = e.target.value;
                    setNewAchievement({ ...newAchievement, metrics: updated });
                  }}
                  className="flex-1 px-6 py-4 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={metric.value}
                  onChange={(e) => {
                    const updated = [...newAchievement.metrics];
                    updated[idx].value = e.target.value;
                    setNewAchievement({ ...newAchievement, metrics: updated });
                  }}
                  className="w-48 px-6 py-4 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={metric.unit}
                  onChange={(e) => {
                    const updated = [...newAchievement.metrics];
                    updated[idx].unit = e.target.value;
                    setNewAchievement({ ...newAchievement, metrics: updated });
                  }}
                  className="w-40 px-6 py-4 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => handleRemoveMetric(idx)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={handleAddMetric}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add metric
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-4 text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAchievement}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
            >
              Save Achievement
            </button>
          </div>
        </div>
      )}

      {/* Achievements List */}
      <div className="space-y-6">
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="p-8 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-700 mt-2">{achievement.description}</p>
                </div>
              </div>

              {/* Context and Impact */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {achievement.context && (
                  <div>
                    <span className="font-semibold text-gray-600">Context:</span>
                    <p className="text-gray-700">{achievement.context}</p>
                  </div>
                )}
                {achievement.impact && (
                  <div>
                    <span className="font-semibold text-gray-600">Impact:</span>
                    <p className="text-gray-700">{achievement.impact}</p>
                  </div>
                )}
              </div>

              {/* Metrics */}
              {achievement.metrics && achievement.metrics.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Metrics:</p>
                  <div className="flex flex-wrap gap-4">
                    {achievement.metrics.map((metric, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded text-xs font-medium"
                      >
                        {metric.metric}: {metric.value} {metric.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Skills */}
              {achievement.relevantSkills && achievement.relevantSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {achievement.relevantSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-4">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Edit
                </button>
                {onDeleteAchievement && (
                  <button
                    onClick={() => onDeleteAchievement(achievement.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No achievements yet. Add one or extract from your resume.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementExtractor;
