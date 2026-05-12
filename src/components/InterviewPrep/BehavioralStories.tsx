import React, { useMemo, useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { InterviewPrep, BehavioralStory } from '../../types/interview';

interface BehavioralStoriesProps {
  prep: InterviewPrep;
}

/**
 * BehavioralStories Tab
 * Displays STAR framework stories for behavioral interviews:
 * - Situation, Task, Action, Result breakdown
 * - Competency mapping (leadership, teamwork, problem-solving, etc.)
 * - Time recommendations (90-120 seconds per story)
 * - Confidence scoring based on clarity and impact
 * - Practice tips and refinement suggestions
 */
export const BehavioralStories: React.FC<BehavioralStoriesProps> = ({ prep }) => {
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set([0]));

  const stories = useMemo(() => {
    return prep.behavioralPrep?.stories || [];
  }, [prep]);

  const competencies = useMemo(() => {
    const competencyMap = new Map<string, number>();
    stories.forEach(story => {
      story.competencies?.forEach(comp => {
        competencyMap.set(comp, (competencyMap.get(comp) || 0) + 1);
      });
    });
    return Array.from(competencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [stories]);

  const toggleStory = (idx: number) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedStories(newExpanded);
  };

  const overallReadiness = useMemo(() => {
    if (stories.length === 0) return 0;
    const totalConfidence = stories.reduce((sum, story) => sum + (story.confidence || 0), 0);
    return Math.round(totalConfidence / stories.length);
  }, [stories]);

  const commonBehavioralTopics = useMemo(() => {
    return [
      {
        topic: 'Leadership & Initiative',
        examples: [
          'Led a team project to completion',
          'Took ownership of a failing project',
          'Mentored a junior team member',
          'Drove adoption of new technology',
        ],
        icon: '👑',
      },
      {
        topic: 'Problem-Solving',
        examples: [
          'Solved a complex technical problem',
          'Optimized a slow process',
          'Debugged a critical production issue',
          'Found creative solution to constraints',
        ],
        icon: '🧩',
      },
      {
        topic: 'Teamwork & Collaboration',
        examples: [
          'Worked cross-functionally with other teams',
          'Resolved conflict within team',
          'Helped colleague accomplish their goal',
          'Collaborated on difficult project',
        ],
        icon: '🤝',
      },
      {
        topic: 'Adaptability',
        examples: [
          'Learned new technology quickly',
          'Handled rapid requirements change',
          'Worked in ambiguous/uncertain situation',
          'Adapted approach based on feedback',
        ],
        icon: '🌊',
      },
      {
        topic: 'Impact & Results',
        examples: [
          'Delivered project on tight deadline',
          'Improved metric by significant percentage',
          'Increased efficiency/revenue/user satisfaction',
          'Fixed critical bug affecting customers',
        ],
        icon: '📈',
      },
      {
        topic: 'Communication',
        examples: [
          'Presented to executives/stakeholders',
          'Explained complex technical concept clearly',
          'Negotiated with external partners',
          'Documented knowledge for team',
        ],
        icon: '💬',
      },
    ];
  }, []);

  return (
    <div data-cy="behavioral-stories-tab" className="space-y-6 py-4">
      {/* Overview */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Behavioral Interview Stories</h3>
            <p className="text-sm text-blue-800 mb-3">
              Behavioral questions focus on past experiences. The STAR method (Situation, Task, Action,
              Result) is the most effective way to answer them.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-900">{stories.length}</div>
                <div className="text-xs text-blue-700">Stories Ready</div>
              </div>
              <div>
                <div className="font-semibold text-blue-900">{overallReadiness}%</div>
                <div className="text-xs text-blue-700">Overall Confidence</div>
              </div>
              <div className="text-xs text-blue-700 flex-1">
                ✓ Industry best practice: 5-8 well-prepared stories covers most behavioral patterns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Prepared Stories */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Your Prepared Stories ({stories.length})
        </h3>
        {stories.length === 0 ? (
          <div className="bg-slate-50 border border-slate-300 border-dashed rounded-lg p-6 text-center">
            <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No behavioral stories generated yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Stories are automatically generated based on your resume and work history.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden"
                data-cy={`behavioral-story-${idx}`}
              >
                <button
                  onClick={() => toggleStory(idx)}
                  className="w-full bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 p-4 flex items-start gap-3 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-slate-900">{story.title}</h4>
                      {expandedStories.has(idx) ? (
                        <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{story.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {story.competencies?.slice(0, 3).map((comp, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {comp}
                        </span>
                      ))}
                      {story.confidence && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                          {story.confidence}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedStories.has(idx) && (
                  <div className="border-t border-slate-200 p-4 space-y-4 bg-white">
                    {/* STAR Breakdown */}
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                        <div className="text-sm font-semibold text-orange-900 mb-1">
                          🎬 Situation
                        </div>
                        <p className="text-sm text-orange-800">{story.situation}</p>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <div className="text-sm font-semibold text-yellow-900 mb-1">
                          ✅ Task
                        </div>
                        <p className="text-sm text-yellow-800">{story.task}</p>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <div className="text-sm font-semibold text-blue-900 mb-1">
                          ⚙️ Action
                        </div>
                        <p className="text-sm text-blue-800">{story.action}</p>
                      </div>

                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded">
                        <div className="text-sm font-semibold text-emerald-900 mb-1">
                          🎯 Result
                        </div>
                        <p className="text-sm text-emerald-800">{story.result}</p>
                        {story.metrics && (
                          <div className="text-xs text-emerald-700 mt-2 font-medium">
                            📊 {story.metrics}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 rounded p-2">
                        <div className="font-semibold text-slate-700">Time to Tell</div>
                        <div className="text-slate-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          90-120 seconds
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded p-2">
                        <div className="font-semibold text-slate-700">Best For</div>
                        <div className="text-slate-600">{story.competencies?.[0] || 'Behavioral'}</div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm font-semibold text-blue-900 mb-2">💡 Delivery Tips</div>
                      <ul className="space-y-1 text-xs text-blue-800">
                        <li>• Start with context (Situation) to set the scene</li>
                        <li>• Focus on YOUR actions, not team's actions</li>
                        <li>• Quantify results when possible (%, time saved, impact)</li>
                        <li>• Practice telling this story in 2-3 minutes maximum</li>
                        <li>• Avoid negative stories; frame challenges positively</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Competency Coverage */}
      {competencies.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Your Competency Coverage
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {competencies.map(([competency, count], idx) => (
              <div
                key={idx}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                data-cy={`competency-${idx}`}
              >
                <div className="text-sm font-semibold text-amber-900 mb-1">{competency}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full"
                      style={{ width: `${(count / Math.max(...competencies.map(c => c[1]))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-amber-800">{count} stories</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gap Analysis */}
      <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
        <h3 className="text-base font-semibold text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Coverage Gaps
        </h3>
        <p className="text-sm text-amber-800">
          Consider preparing additional stories for these common behavioral competencies:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {commonBehavioralTopics.slice(0, 4).map((topic, idx) => (
            <div
              key={idx}
              className="bg-white border border-amber-300 rounded-lg p-3"
              data-cy={`gap-topic-${idx}`}
            >
              <div className="text-base mb-1">{topic.icon}</div>
              <div className="text-sm font-medium text-amber-900">{topic.topic}</div>
              <div className="text-xs text-amber-700 mt-2">
                {competencies.some(c => c[0].toLowerCase() === topic.topic.toLowerCase())
                  ? '✓ Covered'
                  : '○ Need story'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Behavioral Topics Reference */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Common Behavioral Topics</h3>
        <div className="grid grid-cols-1 gap-3">
          {commonBehavioralTopics.map((topic, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3"
              data-cy={`behavioral-topic-${idx}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{topic.icon}</span>
                <h4 className="font-semibold text-slate-900">{topic.topic}</h4>
              </div>
              <ul className="space-y-1 ml-6">
                {topic.examples.map((example, exIdx) => (
                  <li key={exIdx} className="text-xs text-slate-700">• {example}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* STAR Framework Guide */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <h3 className="text-base font-semibold text-blue-900 mb-3">📚 STAR Framework Deep Dive</h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold text-blue-900 mb-1">
              🎬 SITUATION (15-20 seconds)
            </div>
            <ul className="text-xs text-blue-800 space-y-1 ml-4">
              <li>• Set the context: company, team, role, timeframe</li>
              <li>• Make it relatable: what was the challenge/problem?</li>
              <li>• Don't over-explain: keep it concise</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue-900 mb-1">
              ✅ TASK (10-15 seconds)
            </div>
            <ul className="text-xs text-blue-800 space-y-1 ml-4">
              <li>• What was YOUR specific responsibility?</li>
              <li>• What was the goal or objective?</li>
              <li>• Why was it important?</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue-900 mb-1">
              ⚙️ ACTION (30-40 seconds)
            </div>
            <ul className="text-xs text-blue-800 space-y-1 ml-4">
              <li>• Use "I" not "we" - focus on YOUR contribution</li>
              <li>• Describe specific steps YOU took</li>
              <li>• Highlight relevant skills and decision-making</li>
              <li>• This is the longest part - show your thinking</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue-900 mb-1">
              🎯 RESULT (15-20 seconds)
            </div>
            <ul className="text-xs text-blue-800 space-y-1 ml-4">
              <li>• What was the outcome?</li>
              <li>• Quantify impact if possible (%, time, money, etc.)</li>
              <li>• What did YOU learn?</li>
              <li>• How does this relate to the role you're interviewing for?</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-blue-300 rounded-lg p-3 mt-3">
          <p className="text-xs text-blue-800">
            <strong>Pro tip:</strong> Total story time: 2-3 minutes. Practice with a timer or record
            yourself. Interviewers will likely ask follow-up questions, so be ready to go deeper.
          </p>
        </div>
      </section>

      {/* Practice Recommendations */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-emerald-900 mb-3">🎤 Practice Recommendations</div>
        <ol className="space-y-2 text-xs text-emerald-800">
          <li>
            <strong>1. Record yourself:</strong> Tell each story out loud and listen back. Are you
            rambling? Do you sound confident?
          </li>
          <li>
            <strong>2. Time yourself:</strong> Use a timer to stay within 2-3 minutes per story.
          </li>
          <li>
            <strong>3. Get feedback:</strong> Ask a friend or mentor to listen and provide feedback.
          </li>
          <li>
            <strong>4. Vary your stories:</strong> Use different stories for different questions.
          </li>
          <li>
            <strong>5. Prepare follow-ups:</strong> Know what questions might come next based on each
            story.
          </li>
        </ol>
      </section>

      {/* Last Updated */}
      {prep.lastUpdated && (
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
          Last updated: {new Date(prep.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default BehavioralStories;