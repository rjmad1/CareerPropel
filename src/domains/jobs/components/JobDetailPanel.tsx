import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useJob } from '../hooks/useJob';
import { STAGE_LABELS } from '@/types/job';
import OverviewTab from './tabs/OverviewTab';
import TimelineTab from './tabs/TimelineTab';
import InterviewsTab from './tabs/InterviewsTab';
import PrepTab from './tabs/PrepTab';
import OffersTab from './tabs/OffersTab';
import { MatchAnalysis } from '@/components/Jobs/MatchAnalysis';

interface JobDetailPanelProps {
  jobId: string;
  onClose: () => void;
}

type TabType = 'overview' | 'timeline' | 'interviews' | 'prep' | 'offers' | 'match';

const TAB_LABELS: Record<TabType, string> = {
  overview: 'Overview',
  timeline: 'Timeline',
  interviews: 'Interviews',
  prep: 'Prep',
  offers: 'Offers',
  match: 'AI Match',
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
        <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex items-center justify-center" data-testid="panel-skeleton">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
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
        <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col" data-testid="job-detail-panel">
          <div className="flex items-center justify-between p-5 border-b border-gray-200" data-testid="job-detail-panel-header">
            <h2 className="text-lg font-bold text-gray-900">Error</h2>
            <button
              onClick={onClose}
              aria-label="Close panel"
              data-testid="panel-close-btn"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
            <p className="text-gray-600" data-testid="error-message">Failed to load job details</p>
            <button
              onClick={() => refetch()}
              data-testid="panel-retry-btn"
              className="px-8 py-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
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
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col overflow-hidden" data-testid="job-detail-panel">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-50" data-testid="job-detail-panel-header">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900" data-testid="panel-job-title">{job.title}</h2>
              <p className="text-sm text-gray-600 mt-2" data-testid="panel-company-name">{job.company}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              data-testid="panel-close-btn"
              className="p-2 hover:bg-gray-100 rounded-lg transition ml-4"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Match Score</p>
              <p
                data-testid="panel-match-score"
                className={`text-sm font-bold rounded px-2 py-1 inline-block mt-1 ${getMatchScoreColor(job.matchScore / 100)}`}
              >
                {Math.round(job.matchScore)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Stage</p>
              <p className="text-sm font-semibold text-gray-900 mt-1" data-testid="panel-stage-badge">{STAGE_LABELS[job.stage] ?? job.stage}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Salary</p>
              <p className="text-sm font-semibold text-gray-900 mt-1" data-testid="panel-salary-range">
                {(job as any).salary
                  ? typeof (job as any).salary === 'object'
                    ? `$${((job as any).salary.min || 0).toLocaleString()}${(job as any).salary.max ? `–$${(job as any).salary.max.toLocaleString()}` : '+'}`
                    : `$${Number((job as any).salary).toLocaleString()}`
                  : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Priority</p>
              <p className="text-sm font-semibold text-gray-900 capitalize mt-1">{(job as any).priority || '—'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto scrollbar-none" role="tablist">
            {(['overview', 'timeline', 'interviews', 'prep', 'offers', 'match'] as TabType[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
                data-active={activeTab === tab}
                aria-selected={activeTab === tab}
                className={`px-3 py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
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
          {activeTab === 'match' && (
            <div className="p-4">
              <MatchAnalysis jobId={jobId} initialScore={job.matchScore ?? 0} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
