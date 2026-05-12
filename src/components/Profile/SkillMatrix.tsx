'use client';

import React, { useState, useMemo } from 'react';
import { SemanticSkill } from '@/types/profile';
import { cn } from '@/lib/utils';

interface SkillMatrixProps {
  skills: SemanticSkill[];
  onSkillUpdate?: (skill: SemanticSkill) => void;
  onSkillDelete?: (skillName: string) => void;
}

const categoryEmojis = {
  technical: '⚙️',
  soft: '🤝',
  domain: '📊',
  language: '🗣️',
};

const demandColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-green-100 text-green-700',
};

const proficiencyStars = {
  beginner: 1,
  intermediate: 2,
  proficient: 3,
  expert: 4,
};

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  skills,
  onSkillDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'demand' | 'endorsements' | 'experience'>('name');

  const filteredAndSorted = useMemo(() => {
    let filtered = skills.filter((skill) => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || skill.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'demand':
          const demandOrder = { high: 3, medium: 2, low: 1 };
          return (demandOrder[b.marketDemand || 'low'] || 0) -
            (demandOrder[a.marketDemand || 'low'] || 0);
        case 'endorsements':
          return (b.endorsements || 0) - (a.endorsements || 0);
        case 'experience':
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [skills, searchTerm, categoryFilter, sortBy]);

  const categories = useMemo(
    () => Array.from(new Set(skills.map((s) => s.category))),
    [skills]
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={categoryFilter || ''}
          onChange={(e) => setCategoryFilter(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryEmojis[cat as keyof typeof categoryEmojis]} {cat}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort: Name</option>
          <option value="demand">Sort: Market Demand</option>
          <option value="endorsements">Sort: Endorsements</option>
          <option value="experience">Sort: Experience</option>
        </select>
      </div>

      {/* Skill Grid */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAndSorted.map((skill) => (
            <div key={skill.name} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                  <p className="text-xs text-gray-500">
                    {categoryEmojis[skill.category as keyof typeof categoryEmojis]} {skill.category}
                  </p>
                </div>
                {skill.marketDemand && (
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    demandColors[skill.marketDemand]
                  )}>
                    {skill.marketDemand}
                  </span>
                )}
              </div>

              {/* Proficiency Stars */}
              <div className="mb-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((star) => (
                    <span
                      key={star}
                      className={star <= (proficiencyStars[skill.proficiency] || 2) ? '⭐' : '☆'}
                    >
                    </span>
                  ))}
                  <span className="text-xs text-gray-600 ml-2 capitalize">
                    {skill.proficiency}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                {skill.yearsOfExperience !== undefined && (
                  <div className="text-gray-600">
                    {skill.yearsOfExperience}y experience
                  </div>
                )}
                {skill.endorsements !== undefined && (
                  <div className="text-gray-600">
                    {skill.endorsements} endorsements
                  </div>
                )}
              </div>

              {/* Projects */}
              {skill.projects && skill.projects.length > 0 && (
                <div className="mb-3 text-xs">
                  <p className="text-gray-600 font-medium mb-1">Projects:</p>
                  <div className="flex flex-wrap gap-1">
                    {skill.projects.slice(0, 2).map((proj) => (
                      <span key={proj} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {proj}
                      </span>
                    ))}
                    {skill.projects.length > 2 && (
                      <span className="text-gray-500">+{skill.projects.length - 2}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded py-1.5 font-medium transition-colors">
                  Edit
                </button>
                {onSkillDelete && (
                  <button
                    onClick={() => onSkillDelete(skill.name)}
                    className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded py-1.5 font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-sm">No skills found</p>
        </div>
      )}
    </div>
  );
};

export default SkillMatrix;
