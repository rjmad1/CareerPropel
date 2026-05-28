'use client';

import React, { useState, useCallback } from 'react';
import { Button, Input, Card, Badge, Checkbox, Select } from '@/components/ui';

interface FilterState {
  textSearch: string;
  matchScoreMin: number;
  matchScoreMax: number;
  salaryMin: number;
  salaryMax: number;
  dateFrom: string;
  dateTo: string;
  stages: string[];
  priority: string[];
  status: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: number;
}

interface AdvancedJobFilterFormProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const PIPELINE_STAGES = [
  'SOURCED',
  'INTERESTED',
  'RESUME_TAILORING',
  'APPLIED',
  'RECRUITER_SCREEN',
  'HIRING_MANAGER',
  'TECHNICAL_INTERVIEW',
  'SYSTEM_DESIGN',
  'BEHAVIORAL',
  'FINAL_ROUND',
  'OFFER',
  'NEGOTIATION',
  'REJECTED',
  'ARCHIVED',
];

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUS_OPTIONS = ['ACTIVE', 'PAUSED', 'ARCHIVED'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'matchScore', label: 'Match Score' },
  { value: 'maxSalary', label: 'Salary' },
  { value: 'company', label: 'Company' },
  { value: 'title', label: 'Job Title' },
];

const DEFAULT_FILTERS: FilterState = {
  textSearch: '',
  matchScoreMin: 0,
  matchScoreMax: 100,
  salaryMin: 0,
  salaryMax: 500000,
  dateFrom: '',
  dateTo: '',
  stages: [],
  priority: [],
  status: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const STORAGE_KEY = 'career-propel-filters';
const PRESETS_KEY = 'career-propel-filter-presets';

export const AdvancedJobFilterForm: React.FC<
  AdvancedJobFilterFormProps
> = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    textSearch: true,
    matchScore: true,
    salary: true,
    dateRange: false,
    stages: false,
    priority: false,
    status: false,
    sorting: false,
  });

  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PRESETS_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Persist filters to localStorage
  const persistFilters = useCallback((newFilters: FilterState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFilters));
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
      const newFilters = { ...filters, [key]: value };
      persistFilters(newFilters);
    },
    [filters, persistFilters]
  );

  const handleStageToggle = useCallback(
    (stage: string) => {
      const newStages = filters.stages.includes(stage)
        ? filters.stages.filter((s) => s !== stage)
        : [...filters.stages, stage];
      handleFilterChange('stages', newStages);
    },
    [filters.stages, handleFilterChange]
  );

  const handlePriorityToggle = useCallback(
    (priority: string) => {
      const newPriority = filters.priority.includes(priority)
        ? filters.priority.filter((p) => p !== priority)
        : [...filters.priority, priority];
      handleFilterChange('priority', newPriority);
    },
    [filters.priority, handleFilterChange]
  );

  const handleStatusToggle = useCallback(
    (status: string) => {
      const newStatus = filters.status.includes(status)
        ? filters.status.filter((s) => s !== status)
        : [...filters.status, status];
      handleFilterChange('status', newStatus);
    },
    [filters.status, handleFilterChange]
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const savePreset = useCallback(() => {
    if (presetName.trim()) {
      const newPreset: FilterPreset = {
        id: Date.now().toString(),
        name: presetName,
        filters,
        createdAt: Date.now(),
      };
      const newPresets = [...presets, newPreset];
      setPresets(newPresets);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(newPresets));
      }
      setPresetName('');
      setShowPresetModal(false);
    }
  }, [presetName, filters, presets]);

  const loadPreset = useCallback(
    (preset: FilterPreset) => {
      persistFilters(preset.filters);
    },
    [persistFilters]
  );

  const deletePreset = useCallback(
    (presetId: string) => {
      const newPresets = presets.filter((p) => p.id !== presetId);
      setPresets(newPresets);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(newPresets));
      }
    },
    [presets]
  );

  const exportFilters = useCallback(() => {
    const dataStr = JSON.stringify(filters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `filters-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filters]);

  const importFilters = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          persistFilters(imported);
        } catch (err) {
          console.error('Failed to import filters', err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [persistFilters]);

  const clearFilters = useCallback(() => {
    persistFilters(DEFAULT_FILTERS);
  }, [persistFilters]);

  return (
    <div className="w-full space-y-8">
      {/* Filter Presets */}
      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Saved Presets</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowPresetModal(true)}
            >
              Save Current
            </Button>
          </div>

          {presets.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-4 bg-gray-100 rounded-full px-6 py-2"
                >
                  <button
                    onClick={() => loadPreset(preset)}
                    className="text-sm font-medium hover:underline"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No saved presets</p>
          )}

          {showPresetModal && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6 flex gap-4">
              <Input
                placeholder="Preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="text-sm"
              />
              <Button size="sm" onClick={savePreset}>
                Save
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowPresetModal(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Text Search */}
      <ExpandableSection
        title="Text Search"
        isExpanded={expandedSections.textSearch}
        onToggle={() => toggleSection('textSearch')}
      >
        <Input
          placeholder="Search by job title, company, location..."
          value={filters.textSearch}
          onChange={(e) =>
            handleFilterChange('textSearch', e.target.value)
          }
          className="w-full"
        />
      </ExpandableSection>

      {/* Match Score */}
      <ExpandableSection
        title="Match Score"
        isExpanded={expandedSections.matchScore}
        onToggle={() => toggleSection('matchScore')}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Min</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.matchScoreMin}
                onChange={(e) =>
                  handleFilterChange('matchScoreMin', Number(e.target.value))
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">Max</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.matchScoreMax}
                onChange={(e) =>
                  handleFilterChange('matchScoreMax', Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Range: {filters.matchScoreMin} - {filters.matchScoreMax}
          </div>
        </div>
      </ExpandableSection>

      {/* Salary Range */}
      <ExpandableSection
        title="Salary Range"
        isExpanded={expandedSections.salary}
        onToggle={() => toggleSection('salary')}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Min ($)</label>
              <Input
                type="number"
                value={filters.salaryMin}
                onChange={(e) =>
                  handleFilterChange('salaryMin', Number(e.target.value))
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">Max ($)</label>
              <Input
                type="number"
                value={filters.salaryMax}
                onChange={(e) =>
                  handleFilterChange('salaryMax', Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            ${filters.salaryMin.toLocaleString()} -
            ${filters.salaryMax.toLocaleString()}
          </div>
        </div>
      </ExpandableSection>

      {/* Date Range */}
      <ExpandableSection
        title="Date Range"
        isExpanded={expandedSections.dateRange}
        onToggle={() => toggleSection('dateRange')}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <label className="text-sm text-gray-600">From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  handleFilterChange('dateFrom', e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  handleFilterChange('dateTo', e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Pipeline Stages */}
      <ExpandableSection
        title="Pipeline Stages"
        isExpanded={expandedSections.stages}
        onToggle={() => toggleSection('stages')}
      >
        <div className="grid grid-cols-2 gap-4">
          {PIPELINE_STAGES.map((stage) => (
            <Checkbox
              key={stage}
              label={stage.replace(/_/g, ' ')}
              checked={filters.stages.includes(stage)}
              onChange={() => handleStageToggle(stage)}
            />
          ))}
        </div>
      </ExpandableSection>

      {/* Priority */}
      <ExpandableSection
        title="Priority"
        isExpanded={expandedSections.priority}
        onToggle={() => toggleSection('priority')}
      >
        <div className="flex flex-wrap gap-4">
          {PRIORITY_OPTIONS.map((priority) => (
            <Badge
              key={priority}
              variant={
                filters.priority.includes(priority) ? 'primary' : 'gray'
              }
              className="cursor-pointer"
              onClick={() => handlePriorityToggle(priority)}
            >
              {priority}
            </Badge>
          ))}
        </div>
      </ExpandableSection>

      {/* Status */}
      <ExpandableSection
        title="Status"
        isExpanded={expandedSections.status}
        onToggle={() => toggleSection('status')}
      >
        <div className="flex flex-wrap gap-4">
          {STATUS_OPTIONS.map((status) => (
            <Badge
              key={status}
              variant={
                filters.status.includes(status) ? 'primary' : 'gray'
              }
              className="cursor-pointer"
              onClick={() => handleStatusToggle(status)}
            >
              {status}
            </Badge>
          ))}
        </div>
      </ExpandableSection>

      {/* Sorting */}
      <ExpandableSection
        title="Sorting"
        isExpanded={expandedSections.sorting}
        onToggle={() => toggleSection('sorting')}
      >
        <div className="space-y-6">
          <div className="w-full">
            <Select
              label="Sort By"
              value={filters.sortBy}
              options={SORT_OPTIONS}
              onChange={(e) =>
                handleFilterChange('sortBy', e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Order</label>
            <div className="flex gap-4 mt-2">
              {(['asc', 'desc'] as const).map((order) => (
                <Button
                  key={order}
                  size="sm"
                  variant={
                    filters.sortOrder === order ? 'primary' : 'ghost'
                  }
                  onClick={() =>
                    handleFilterChange('sortOrder', order)
                  }
                >
                  {order === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={exportFilters}
        >
          Export Filters
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={importFilters}
        >
          Import Filters
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={clearFilters}
          className="text-red-600 hover:text-red-700"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

interface ExpandableSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => (
  <Card className="p-0 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <h3 className="font-semibold text-sm">{title}</h3>
      <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
    {isExpanded && <div className="px-8 py-6 border-t bg-gray-50">{children}</div>}
  </Card>
);

export default AdvancedJobFilterForm;
