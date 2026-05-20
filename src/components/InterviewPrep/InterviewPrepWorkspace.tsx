import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Moon,
  BarChart3,
  Loader2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRealTime } from '../../hooks/useRealTime';
import { useInterviewPrep } from '../../hooks/useInterviewPrep';
import CompanyIntelligence from './CompanyIntelligence';
import RoleBreakdown from './RoleBreakdown';
import BehavioralStories from './BehavioralStories';
import TechnicalPrep from './TechnicalPrep';
import SystemDesignTab from './SystemDesignTab';
import ResumeAlignment from './ResumeAlignment';
import MockInterview from './MockInterview';

interface InterviewPrepWorkspaceProps {
  jobId: string;
  onClose: () => void;
}

type TabType = 'company' | 'role' | 'behavioral' | 'technical' | 'system-design' | 'resume' | 'mock';

/**
 * InterviewPrepWorkspace
 * Main container for the interview preparation experience.
 *
 * Features:
 * - 7 tabbed interface for different prep aspects
 * - Real-time WebSocket sync for preparation progress
 * - Night-Before Mode for quick revision
 * - Quick Revision Cards for key talking points
 * - Preparation status tracking with readiness percentage
 * - Error handling with retry capability
 */
export const InterviewPrepWorkspace: React.FC<InterviewPrepWorkspaceProps> = ({
  jobId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [nightBeforeMode, setNightBeforeMode] = useState(false);
  const [showQuickRevision, setShowQuickRevision] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user?.email ?? '';

  // Real-time WebSocket connection
  const { connected: wsConnected } = useRealTime({
    autoConnect: true,
    channels: ['interview-prep'],
  });

  // Interview prep hook for data management
  const { prep, loading, error, regenerate, refetch } = useInterviewPrep(jobId, userId);

  // Initialize prep generation on mount
  useEffect(() => {
    if (!prep && !loading) {
      regenerate();
    }
  }, [jobId, prep, loading, regenerate]);

  const tabs = useMemo(
    () => [
      { id: 'company', label: '🏢 Company', icon: 'Building' },
      { id: 'role', label: '💼 Role', icon: 'Briefcase' },
      { id: 'behavioral', label: '💬 Behavioral', icon: 'Users' },
      { id: 'technical', label: '🔧 Technical', icon: 'Code' },
      { id: 'system-design', label: '📐 System Design', icon: 'Boxes' },
      { id: 'resume', label: '📄 Resume', icon: 'FileText' },
      { id: 'mock', label: '🎤 Mock Interview', icon: 'Mic' },
    ] as const,
    []
  );

  const readinessScore = useMemo(() => {
    if (!prep) return 0;
    const components = [
      prep.companyResearch ? 20 : 0,
      prep.roleBreakdown ? 20 : 0,
      prep.behavioralStories?.length ? Math.min(15, (prep.behavioralStories.length / 5) * 15) : 0,
      prep.technicalPrep?.practiceProblems?.length ? 20 : 0,
      prep.systemDesignPrep ? 15 : 0,
      prep.resumeAlignment?.overallMatch ? (prep.resumeAlignment.overallMatch / 100) * 10 : 0,
    ];
    return Math.round(components.reduce((a, b) => a + b, 0));
  }, [prep]);

  const quickRevisionCards = useMemo(() => {
    if (!prep) return [];
    return [
      {
        title: 'Key Story',
        content: prep.behavioralStories?.[0]?.title || 'No story prepared yet',
        time: '2 min',
      },
      {
        title: 'Company Focus',
        content: prep.companyResearch?.industry || 'Research company',
        time: '3 min',
      },
      {
        title: 'Technical Topic',
        content: prep.technicalPrep?.programmingLanguages?.[0]?.language || 'Review algorithms',
        time: '5 min',
      },
    ];
  }, [prep]);

  if (loading && !prep) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        data-cy="interview-prep-loading"
      >
        <div className="bg-white rounded-lg p-16 space-y-8">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <div className="text-center">
            <div className="font-semibold text-slate-900">Generating Interview Prep</div>
            <p className="text-sm text-slate-600 mt-2">
              Analyzing role, company, and your background...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        data-cy="interview-prep-error"
      >
        <div className="bg-white rounded-lg p-16 space-y-8 max-w-md">
          <div className="flex items-start gap-6">
            <AlertCircle className="w-12 h-12 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900">Error Loading Prep</div>
              <p className="text-sm text-slate-600 mt-2">{error.message}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <button
              onClick={refetch}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-4 px-8 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8"
      data-cy="interview-prep-workspace"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 px-12 py-8 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Interview Preparation</h2>
            <p className="text-sm text-slate-600 mt-2">
              {prep?.role} at {prep?.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            data-cy="close-interview-prep"
          >
            <X className="w-12 h-12" />
          </button>
        </div>

        {/* Readiness Bar */}
        <div className="border-b border-slate-200 px-12 py-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-600 mb-2">Overall Readiness</div>
              <div className="w-full h-4 bg-slate-300 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    readinessScore >= 80
                      ? 'bg-emerald-500'
                      : readinessScore >= 60
                      ? 'bg-yellow-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${readinessScore}%` }}
                ></div>
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900">{readinessScore}%</div>
          </div>
          <div className="text-xs text-slate-600 ml-8">
            Last updated: {prep?.lastUpdated ? new Date(prep.lastUpdated).toLocaleTimeString() : 'Now'}
          </div>
        </div>

        {/* Controls */}
        <div className="border-b border-slate-200 px-12 py-6 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setNightBeforeMode(!nightBeforeMode)}
              className={`flex items-center gap-4 px-6 py-3 rounded text-sm font-medium transition-colors ${
                nightBeforeMode
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              data-cy="night-before-mode-toggle"
            >
              <Moon className="w-8 h-8" />
              Night Before
            </button>
            <button
              onClick={() => setShowQuickRevision(!showQuickRevision)}
              className={`flex items-center gap-4 px-6 py-3 rounded text-sm font-medium transition-colors ${
                showQuickRevision
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              data-cy="quick-revision-toggle"
            >
              <BarChart3 className="w-8 h-8" />
              Quick Cards
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refetch}
              className="p-3 hover:bg-slate-300 rounded transition-colors text-slate-600"
              data-cy="refresh-prep-button"
              disabled={loading}
            >
              <RefreshCw className={`w-8 h-8 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {wsConnected && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-emerald-700">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-12 flex gap-2 overflow-x-auto flex-shrink-0 bg-slate-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-6 px-8 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
              data-cy={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-12">
          {prep && (
            <>
              {activeTab === 'company' && <CompanyIntelligence prep={prep} />}
              {activeTab === 'role' && <RoleBreakdown prep={prep} />}
              {activeTab === 'behavioral' && <BehavioralStories prep={prep} />}
              {activeTab === 'technical' && <TechnicalPrep prep={prep} />}
              {activeTab === 'system-design' && <SystemDesignTab prep={prep} />}
              {activeTab === 'resume' && <ResumeAlignment prep={prep} />}
              {activeTab === 'mock' && <MockInterview prep={prep} />}
            </>
          )}
        </div>

        {/* Quick Revision Cards (Sidebar) */}
        {showQuickRevision && (
          <div className="fixed right-0 top-0 bottom-0 w-64 bg-white border-l border-slate-200 shadow-lg z-40 overflow-y-auto">
            <div className="p-8 space-y-6">
              <button
                onClick={() => setShowQuickRevision(false)}
                className="w-full text-right text-slate-400 hover:text-slate-600"
              >
                <X className="w-10 h-10 ml-auto" />
              </button>
              <h3 className="font-semibold text-slate-900">Quick Revision</h3>
              {quickRevisionCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6"
                  data-cy={`quick-revision-card-${idx}`}
                >
                  <div className="text-xs font-semibold text-blue-700 mb-2">{card.title}</div>
                  <p className="text-sm text-blue-900 mb-4">{card.content}</p>
                  <div className="text-xs text-blue-600 flex items-center gap-2">
                    <span>⏱️ {card.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 px-12 py-8 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-600">
            {nightBeforeMode && '🌙 Night Before Mode: Quick, focused content only'}
          </p>
          <button
            onClick={() => setActiveTab('mock')}
            className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
            data-cy="start-mock-interview"
          >
            <Play className="w-8 h-8" />
            Start Mock Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepWorkspace;