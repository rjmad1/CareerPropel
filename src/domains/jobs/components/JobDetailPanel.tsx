import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useJob } from '../hooks/useJob';
import { STAGE_LABELS } from '@/types/job';
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
  const { data: job, isLoading, error, refetch } = useJob(jobId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (isLoading) {
    return (
      <>
        <div
          data-testid="panel-overlay"
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={onClose}
        />
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex items-center justify-center" data-testid="panel-skeleton">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <div
          data-testid="panel-overlay"
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={onClose}
        />
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col" data-testid="job-detail-panel">
          <div className="flex items-center justify-between p-6 border-b border-gray-200" data-testid="job-detail-panel-header">
            <h2 className="text-lg font-bold text-gray-900">Error</h2>
            <button
              onClick={onClose}
              aria-label="Close panel"
              data-testid="panel-close-btn"
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
            <p className="text-gray-600" data-testid="error-message">Failed to load job details</p>
            <button
              onClick={() => refetch()}
              data-testid="panel-retry-btn"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        data-testid="panel-overlay"
        className="fixed inset-0 bg-black bg-opacity-20 z-30"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col overflow-hidden" data-testid="job-detail-panel">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-50" data-testid="job-detail-panel-header">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900" data-testid="panel-job-title">{job.title}</h2>
              <p className="text-sm text-gray-600 mt-1" data-testid="panel-company-name">{job.company}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              data-testid="panel-close-btn"
              className="p-1 hover:bg-gray-100 rounded-lg transition ml-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-600">Match Score</p>
              <p
                data-testid="panel-match-score"
                className={`text-sm font-bold rounded px-2 py-1 inline-block ${getMatchScoreColor(job.matchScore / 100)}`}
              >
                {Math.round(job.matchScore)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-600">Stage</p>
              <p className="text-sm font-semibold text-gray-900" data-testid="panel-stage-badge">{STAGE_LABELS[job.stage] ?? job.stage}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-600">Salary</p>
              <p className="text-sm font-semibold text-gray-900" data-testid="panel-salary-range">
                {(job as any).salary
                  ? typeof (job as any).salary === 'object'
                    ? `$${((job as any).salary.min || 0).toLocaleString()}${(job as any).salary.max ? `–$${(job as any).salary.max.toLocaleString()}` : '+'}`
                    : `$${Number((job as any).salary).toLocaleString()}`
                  : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-600">Priority</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{(job as any).priority || '—'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200" role="tablist">
            {(['overview', 'timeline', 'interviews', 'prep', 'offers'] as TabType[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
                data-active={activeTab === tab}
                aria-selected={activeTab === tab}
                className={`px-3 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" data-testid={`tab-content-${activeTab}`}>
          {activeTab === 'overview' && <OverviewTab job={job} />}
          {activeTab === 'timeline' && <TimelineTab jobId={jobId} />}
          {activeTab === 'interviews' && <InterviewsTab jobId={jobId} />}
          {activeTab === 'prep' && <PrepTab jobId={jobId} />}
          {activeTab === 'offers' && <OffersTab jobId={jobId} />}
        </div>
      </div>
    </>
  );
}
