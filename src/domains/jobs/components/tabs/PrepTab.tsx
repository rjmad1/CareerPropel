import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useInterviewPrep } from '../../hooks/useInterviewPrep';

interface PrepTabProps {
  jobId: string;
}

interface PrepData {
  starStories: Array<{
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }>;
  technicalConcepts: Array<{
    topic: string;
    keyPoints: string[];
  }>;
  companyIntelligence: {
    mission: string;
    recentNews: string[];
    culture: string;
  };
  likelyQuestions: string[];
}

export default function PrepTab({ jobId }: PrepTabProps) {
  const { data: prep, isLoading, error } = useInterviewPrep(jobId);
  const [expandedSections, setExpandedSections] = useState<string[]>(['star-stories']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !prep) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-gray-600">No prep content available yet</p>
      </div>
    );
  }

  const typedPrep = prep as PrepData;

  return (
    <div className="p-12 space-y-6">
      {/* STAR Stories */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('star-stories')}
          className="w-full flex items-center justify-between p-8 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-4">
            <Zap size={16} className="text-orange-600" />
            <h3 className="font-semibold text-gray-900">STAR Stories</h3>
          </div>
          {expandedSections.includes('star-stories') ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {expandedSections.includes('star-stories') && (
          <div className="p-8 space-y-8 bg-white border-t border-gray-200">
            {typedPrep.starStories?.map((story, idx) => (
              <div key={idx} className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <p className="text-sm font-semibold text-gray-900 mb-4">{story.title}</p>
                <div className="space-y-2 text-xs text-gray-700">
                  <div>
                    <span className="font-medium">Situation:</span> {story.situation}
                  </div>
                  <div>
                    <span className="font-medium">Task:</span> {story.task}
                  </div>
                  <div>
                    <span className="font-medium">Action:</span> {story.action}
                  </div>
                  <div>
                    <span className="font-medium">Result:</span> {story.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical Concepts */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('technical')}
          className="w-full flex items-center justify-between p-8 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-4">
            <Zap size={16} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Technical Concepts</h3>
          </div>
          {expandedSections.includes('technical') ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {expandedSections.includes('technical') && (
          <div className="p-8 space-y-6 bg-white border-t border-gray-200">
            {typedPrep.technicalConcepts?.map((concept, idx) => (
              <div key={idx} className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <p className="text-sm font-semibold text-gray-900 mb-4">{concept.topic}</p>
                <ul className="space-y-2">
                  {concept.keyPoints?.map((point, pointIdx) => (
                    <li key={pointIdx} className="text-xs text-gray-700 flex gap-4">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Intelligence */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('company')}
          className="w-full flex items-center justify-between p-8 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-4">
            <Zap size={16} className="text-green-600" />
            <h3 className="font-semibold text-gray-900">Company Intelligence</h3>
          </div>
          {expandedSections.includes('company') ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {expandedSections.includes('company') && (
          <div className="p-8 space-y-6 bg-white border-t border-gray-200">
            {typedPrep.companyIntelligence && (
              <>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <p className="text-xs font-semibold text-gray-900 mb-2">Mission</p>
                  <p className="text-xs text-gray-700">
                    {typedPrep.companyIntelligence.mission}
                  </p>
                </div>

                {typedPrep.companyIntelligence.recentNews?.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <p className="text-xs font-semibold text-gray-900 mb-4">Recent News</p>
                    <ul className="space-y-2">
                      {typedPrep.companyIntelligence.recentNews.map((news, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex gap-4">
                          <span className="text-green-600 font-bold">•</span>
                          <span>{news}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <p className="text-xs font-semibold text-gray-900 mb-2">Culture</p>
                  <p className="text-xs text-gray-700">
                    {typedPrep.companyIntelligence.culture}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Likely Questions */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('questions')}
          className="w-full flex items-center justify-between p-8 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-4">
            <Zap size={16} className="text-purple-600" />
            <h3 className="font-semibold text-gray-900">Likely Questions</h3>
          </div>
          {expandedSections.includes('questions') ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {expandedSections.includes('questions') && (
          <div className="p-8 space-y-4 bg-white border-t border-gray-200">
            {typedPrep.likelyQuestions?.map((question, idx) => (
              <div key={idx} className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <p className="text-sm text-gray-900">{question}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
