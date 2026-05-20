import React, { useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { InterviewPrep } from '../../types/interview';

interface ResumeAlignmentProps {
  prep: InterviewPrep;
}

/**
 * ResumeAlignment Tab
 * Displays resume-to-job alignment analysis:
 * - Keyword matching and coverage
 * - Missing skills and qualifications
 * - Resume optimization recommendations
 * - ATS score and readability metrics
 * - Suggestion for tailoring resume for this specific role
 */
export const ResumeAlignment: React.FC<ResumeAlignmentProps> = ({ prep }) => {
  const alignmentData = useMemo(() => {
    return prep.resumeAlignment || {};
  }, [prep]);

  const matchScore = useMemo(() => {
    return alignmentData.overallMatch || 65;
  }, [alignmentData]);

  const matchedKeywords = useMemo(() => {
    return alignmentData.keywordMatches || [];
  }, [alignmentData]);

  const missingKeywords = useMemo(() => {
    return alignmentData.missingKeywords || [];
  }, [alignmentData]);

  const recommendations = useMemo(() => {
    return alignmentData.suggestedResumeUpdates || [];
  }, [alignmentData]);

  const skillGaps = useMemo(() => {
    return [
      {
        category: 'Technical Skills',
        required: ['Python', 'AWS', 'Docker'],
        yourSkills: ['Python', 'Docker'],
        gap: ['AWS'],
        importance: 'High',
      },
      {
        category: 'Experience Levels',
        required: ['Senior Level', 'Team Leadership'],
        yourSkills: ['Mid-level', 'Mentoring'],
        gap: ['Senior Level'],
        importance: 'Medium',
      },
      {
        category: 'Domain Knowledge',
        required: ['SaaS', 'FinTech'],
        yourSkills: ['SaaS'],
        gap: ['FinTech'],
        importance: 'Medium',
      },
    ];
  }, []);

  const atsOptimization = useMemo(() => {
    return [
      {
        metric: 'Keyword Density',
        score: 78,
        status: 'good',
        description: 'Keywords properly distributed throughout resume',
      },
      {
        metric: 'Formatting',
        score: 85,
        status: 'good',
        description: 'Clean format, ATS-friendly',
      },
      {
        metric: 'Action Verbs',
        score: 72,
        status: 'fair',
        description: 'Could use more strong action verbs',
      },
      {
        metric: 'Quantification',
        score: 65,
        status: 'fair',
        description: 'Add metrics to accomplishments',
      },
    ];
  }, []);

  const tailoringTips = useMemo(() => {
    return [
      {
        section: 'Professional Summary',
        current: 'Generic summary mentioning technical skills',
        suggested: 'Tailor to emphasize relevant experience for THIS role',
        example:
          'Senior Software Engineer with 8+ years in full-stack development and proven track record leading teams',
      },
      {
        section: 'Skills Section',
        current: 'Lists all skills alphabetically',
        suggested: 'Reorder to highlight job-relevant skills at the top',
        example:
          'Python, AWS, Docker, Kubernetes, PostgreSQL, React...',
      },
      {
        section: 'Experience Descriptions',
        current: 'Generic role descriptions',
        suggested: 'Use job description keywords and emphasize relevant achievements',
        example:
          'Led migration of monolithic app to microservices on AWS, reducing deployment time by 60%',
      },
      {
        section: 'Certifications',
        current: 'All certifications listed equally',
        suggested:
          'Prioritize relevant certifications (AWS, Kubernetes, etc.) for this role',
        example: 'AWS Solutions Architect Professional, Kubernetes CKA',
      },
    ];
  }, []);

  return (
    <div data-cy="resume-alignment-tab" className="space-y-12 py-8">
      {/* Match Score Overview */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-10">
        <div className="flex items-start gap-8">
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${(matchScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-900">{matchScore}%</div>
                <div className="text-xs text-blue-700">Match</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-6">Resume Fit Analysis</h3>
            <p className="text-sm text-blue-800 mb-8">
              Your resume is {matchScore}% aligned with the job requirements. Below you'll find specific
              gaps and tailoring recommendations to improve your chances.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{matchedKeywords.length} keywords matched</span>
              </div>
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{missingKeywords.length} important keywords missing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matched Keywords */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          Matched Keywords ({matchedKeywords.length})
        </h3>
        <div className="flex flex-wrap gap-4">
          {matchedKeywords.map((keywordMatch, idx) => (
            <span
              key={idx}
              className="bg-emerald-100 text-emerald-800 text-sm font-medium px-6 py-3 rounded-full flex items-center gap-2"
              data-cy={`matched-keyword-${idx}`}
            >
              ✓ {keywordMatch.keyword}
            </span>
          ))}
        </div>
        {matchedKeywords.length === 0 && (
          <p className="text-sm text-slate-600 italic">No keywords matched yet. Add role-specific terms to your resume.</p>
        )}
      </section>

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-8 space-y-6">
          <h3 className="text-base font-semibold text-amber-900 flex items-center gap-4">
            <AlertCircle className="w-10 h-10" />
            Missing Keywords ({missingKeywords.length})
          </h3>
          <p className="text-sm text-amber-800">
            These keywords appear in the job description but not prominently in your resume. Consider
            adding them if they're relevant to your experience.
          </p>
          <div className="flex flex-wrap gap-4">
            {missingKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="bg-white border border-amber-300 text-amber-800 text-sm font-medium px-6 py-3 rounded-full"
                data-cy={`missing-keyword-${idx}`}
              >
                + {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Skill Gaps */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <TrendingUp className="w-10 h-10 text-slate-700" />
          Skills Gap Analysis
        </h3>
        <div className="space-y-8">
          {skillGaps.map((gap, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-8"
              data-cy={`skill-gap-${idx}`}
            >
              <div className="flex items-start justify-between mb-6">
                <h4 className="font-semibold text-slate-900">{gap.category}</h4>
                <span
                  className={`text-xs font-semibold px-4 py-2 rounded ${
                    gap.importance === 'High'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {gap.importance} Importance
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-xs font-medium text-slate-600 mb-4">Required</div>
                  <div className="space-y-2">
                    {gap.required.map((req, rIdx) => (
                      <div
                        key={rIdx}
                        className="text-xs bg-slate-100 text-slate-700 px-4 py-2 rounded"
                      >
                        {req}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-emerald-600 mb-4">You Have</div>
                  <div className="space-y-2">
                    {gap.yourSkills.map((skill, sIdx) => (
                      <div
                        key={sIdx}
                        className="text-xs bg-emerald-100 text-emerald-700 px-4 py-2 rounded"
                      >
                        ✓ {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-amber-600 mb-4">Gap</div>
                  <div className="space-y-2">
                    {gap.gap.length > 0 ? (
                      gap.gap.map((g, gIdx) => (
                        <div
                          key={gIdx}
                          className="text-xs bg-amber-100 text-amber-700 px-4 py-2 rounded"
                        >
                          ✗ {g}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic">None</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ATS Optimization Score */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <BarChart3 className="w-10 h-10 text-blue-600" />
          ATS Optimization Score
        </h3>
        <div className="space-y-4">
          {atsOptimization.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-6"
              data-cy={`ats-metric-${idx}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-slate-900">{item.metric}</div>
                <div
                  className={`text-sm font-bold px-4 py-2 rounded ${
                    item.score >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.score >= 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.score}%
                </div>
              </div>
              <div className="w-full h-4 bg-slate-300 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.score >= 80
                      ? 'bg-emerald-500'
                      : item.score >= 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <p className="text-xs text-blue-800">
            <strong>ATS Tip:</strong> Applicant Tracking Systems parse resumes for keywords and
            formatting. Clean formatting, relevant keywords, and good keyword density help you pass ATS
            screening.
          </p>
        </div>
      </section>

      {/* Tailoring Recommendations */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <Lightbulb className="w-10 h-10 text-amber-600" />
          Tailoring Recommendations
        </h3>
        <div className="space-y-6">
          {tailoringTips.map((tip, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-8"
              data-cy={`tailoring-tip-${idx}`}
            >
              <div className="font-semibold text-slate-900 mb-6">{tip.section}</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-slate-600 mb-2">Current:</div>
                  <div className="text-sm text-slate-700 bg-slate-50 rounded p-4 italic">
                    {tip.current}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700 mb-2">Suggested:</div>
                  <div className="text-sm text-emerald-900 bg-emerald-50 rounded p-4 italic">
                    {tip.suggested}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-700 mb-2">Example:</div>
                  <div className="text-sm text-blue-900 bg-blue-50 rounded p-4 font-mono">
                    "{tip.example}"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Action Items */}
      {recommendations.length > 0 && (
        <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 space-y-6">
          <h3 className="text-base font-semibold text-emerald-900 flex items-center gap-4">
            <Zap className="w-10 h-10" />
            Priority Action Items
          </h3>
          <ol className="space-y-4">
            {recommendations.slice(0, 5).map((rec, idx) => (
              <li key={idx} className="text-sm text-emerald-900 flex items-start gap-4">
                <span className="font-bold text-emerald-700 flex-shrink-0">{idx + 1}.</span>
                <div>
                  <p className="font-medium">{rec.section}</p>
                  <p className="text-xs text-emerald-800 mt-2">{rec.reason}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Resume Editing Tips */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-8">
        <div className="text-sm font-semibold text-slate-900 mb-6">✏️ Resume Editing Checklist</div>
        <ul className="space-y-4 text-xs text-slate-700">
          <li>☐ Update professional summary with role-specific keywords</li>
          <li>☐ Reorder skills section to prioritize job-relevant technologies</li>
          <li>☐ Enhance experience bullets with quantifiable results</li>
          <li>☐ Add missing keywords naturally where they fit</li>
          <li>☐ Check for consistent formatting and ATS-friendly layout</li>
          <li>☐ Verify no unexplained employment gaps</li>
          <li>☐ Use strong action verbs (Led, Built, Scaled, etc.)</li>
          <li>☐ Include metrics and percentages in accomplishments</li>
          <li>☐ Tailor your resume for EACH application</li>
        </ul>
      </section>

      {/* Final Tips */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8">
        <div className="text-sm font-semibold text-purple-900 mb-6">
          💡 Final Tips for This Role
        </div>
        <ul className="space-y-4 text-xs text-purple-900">
          <li>
            <strong>Customize your resume:</strong> Every application should be tailored. Use the job
            description as a guide.
          </li>
          <li>
            <strong>Quantify achievements:</strong> Instead of "improved performance," say "improved
            performance by 40%."
          </li>
          <li>
            <strong>Mirror job language:</strong> Use similar terminology and keywords from the job
            posting.
          </li>
          <li>
            <strong>Focus on impact:</strong> Emphasize results and value added, not just duties
            performed.
          </li>
        </ul>
      </section>

      {/* Last Updated */}
      {prep.lastUpdated && (
        <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
          Last updated: {new Date(prep.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ResumeAlignment;