import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Job } from '../types';
import { useJob } from '../hooks/useJob';
import OverviewTab from './tabs/OverviewTab';
import TimelineTab from './tabs/TimelineTab';
import InterviewsTab from './tabs/InterviewsTab';
import PrepTab from './tabs/PrepTab';
import OffersTab from './tabs/OffersTab';

interface JobDetailPanelProps {
  jobId: string;
  onClose: () => void;
}

type TabType = 'overview' | 'timeline' | 'interviews' | 'prep' | 'offers';

const TAB_LABELS: Record<TabType, string> = {
  overview: 'Overview',
  timeline: 'Timeline',
  interviews: 'Interviews',
  prep: 'Prep',
  offers: 'Offers',
};

const getMatchScoreColor = (score: number): string => {
  if (score >= 0.8) return 'bg-green-100 text-green-800';
  if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
  if (score >= 0.4) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export default function JobDetailPanel({ jobId, onClose }: JobDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { data: job, isLoading, error } = useJob(jobId);

  if (isLoading) {
    return (
      <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Error</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-600">Failed to load job details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col overflow-hidden" data-testid="detail-panel">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-50" data-testid="detail-panel-header">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Match Score</p>
            <p className={`text-sm font-bold rounded px-2 py-1 inline-block ${getMatchScoreColor(job.matchScore)}`}>
              {Math.round(job.matchScore * 100)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Stage</p>
            <p className="text-sm font-semibold text-gray-900">{job.stage}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Salary</p>
            <p className="text-sm font-semibold text-gray-900">${job.salaryMin}-${job.salaryMax}k</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-${tab}`}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && <div data-testid="overview-content"><OverviewTab job={job} /></div>}
        {activeTab === 'timeline' && <div data-testid="timeline-content"><TimelineTab jobId={jobId} /></div>}
        {activeTab === 'interviews' && <div data-testid="interviews-content"><InterviewsTab jobId={jobId} /></div>}
        {activeTab === 'prep' && <div data-testid="prep-content"><PrepTab jobId={jobId} /></div>}
        {activeTab === 'offers' && <div data-testid="offers-content"><OffersTab jobId={jobId} /></div>}
      </div>
    </div>
  );
}
