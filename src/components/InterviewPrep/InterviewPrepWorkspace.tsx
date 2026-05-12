'use client';

import React, { useState } from 'react';
import { X, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useJob, useInterviewPrep } from '@/domains/jobs/hooks';

interface InterviewPrepWorkspaceProps {
  jobId: string;
  onClose: () => void;
}

type TabType = 'company' | 'role' | 'behavioral' | 'technical' | 'resume' | 'mock';

export const InterviewPrepWorkspace: React.FC<InterviewPrepWorkspaceProps> = ({
  jobId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('company');

  // Fetch job details
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(jobId);

  // Fetch interview prep (triggers agent execution)
  const { data: prep, isLoading: prepLoading, error: prepError, refetch } = useInterviewPrep(jobId, job);

  const isLoading = jobLoading || prepLoading;
  const error = jobError || prepError;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'company', label: '🏢 Company Intelligence' },
    { id: 'role', label: '💼 Role Breakdown' },
    { id: 'behavioral', label: '💬 STAR Stories' },
    { id: 'technical', label: '🔧 Technical Prep' },
    { id: 'resume', label: '📄 Resume Alignment' },
    { id: 'mock', label: '🎤 Mock Interview' },
  ];

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Interview Prep</h2>
            {job && <p className="text-sm text-gray-600 mt-1">{job.role} at {job.company}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-gray-600">Generating interview preparation...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment as we use AI to generate personalized content.</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="text-red-600 mb-4" size={32} />
            <p className="text-red-600 font-medium">Error generating prep</p>
            <p className="text-sm text-gray-600 mt-2">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {prep && (
          <div className="space-y-6">
            {activeTab === 'company' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Intelligence</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mission</h4>
                    <p className="text-gray-600">{prep.companyIntelligence?.mission || 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recent News</h4>
                    <ul className="space-y-2">
                      {(prep.companyIntelligence?.recentNews || []).map((news, i) => (
                        <li key={i} className="text-gray-600">• {news}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Culture</h4>
                    <p className="text-gray-600">{prep.companyIntelligence?.culture || 'Not available'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'behavioral' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">STAR Stories</h3>
                <div className="space-y-4">
                  {(prep.starStories || []).map((story, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">{story.title}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Situation:</span> {story.situation}</p>
                        <p><span className="font-medium">Task:</span> {story.task}</p>
                        <p><span className="font-medium">Action:</span> {story.action}</p>
                        <p><span className="font-medium">Result:</span> {story.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Concepts</h3>
                <div className="space-y-4">
                  {(prep.technicalConcepts || []).map((concept, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">{concept.topic}</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {(concept.keyPoints || []).map((point, j) => (
                          <li key={j}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resume Alignment</h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">Resume alignment data will be generated based on job requirements and your experience.</p>
                </div>
              </div>
            )}

            {activeTab === 'mock' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mock Interview</h3>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="text-sm text-purple-900">Interactive mock interview practice coming soon.</p>
                </div>
              </div>
            )}

            {(activeTab === 'role' || activeTab === 'mock') && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">This section is being populated with AI-generated content.</p>
              </div>
            )}

            {prep.confidence && (
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                  <span className="text-lg font-bold text-blue-600">{Math.round(prep.confidence)}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
