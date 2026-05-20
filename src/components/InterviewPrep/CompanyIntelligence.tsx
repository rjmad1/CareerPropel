import React, { useMemo } from 'react';
import {
  Building2,
  Users,
  Code,
  Globe,
} from 'lucide-react';
import { InterviewPrep } from '../../types/interview';
import { CompanyProfile } from '../../types/company';

interface CompanyIntelligenceProps {
  prep: InterviewPrep;
  companyData?: CompanyProfile;
}

/**
 * CompanyIntelligence Tab
 * Displays comprehensive company research including:
 * - Company overview and industry context
 * - Funding and financial health
 * - Technical stack and engineering culture
 * - Recent news and market position
 * - Hiring patterns and growth signals
 * - Potential red flags (layoffs, turnover)
 * - Competitor comparison
 */
export const CompanyIntelligence: React.FC<CompanyIntelligenceProps> = ({
  prep,
  companyData, // Reserved for Phase 3 schema expansion
}) => {
  // Suppress unused variable warning - reserved for future use
  void companyData;
  const sections = useMemo(() => {
    return {
      overview: prep.companyResearch?.competitorsAndContext || '',
      industry: prep.companyResearch?.industry || '',
      culture: (prep.companyResearch?.culture || '').split('\n').filter(Boolean),
      techStack: prep.companyResearch?.technicalStack || [],
      recentNews: prep.companyResearch?.recentNews || [],
      hiringPatterns: {},
      competitors: prep.companyResearch?.competitorsAndContext?.split(',').map(c => ({ name: c.trim(), context: '' })) || [],
    };
  }, [prep]);

  // Note: fundingHistory, layoffHistory, interviewProcess data not available
  // in current CompanyProfile type - consider Phase 3 schema expansion

  return (
    <div data-cy="company-intelligence-tab" className="space-y-12 py-8">
      {/* Company Overview */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-10">
        <div className="flex items-start gap-6">
          <Building2 className="w-10 h-10 text-slate-700 flex-shrink-0 mt-2" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Company Overview
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-6">
              {sections.overview || 'Company research is being gathered...'}
            </p>
            {sections.industry && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-600 bg-white px-4 py-2 rounded">
                  {sections.industry}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Financial data not yet available in schema - Phase 2 enhancement */}

      {/* Technical Stack */}
      {sections.techStack.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
            <Code className="w-10 h-10 text-blue-600" />
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-4">
            {sections.techStack.map((tech: string, idx: number) => (
              <span
                key={idx}
                className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 text-sm font-medium text-blue-900"
                data-cy={`tech-stack-item-${idx}`}
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 rounded p-4">
            💡 Familiarize yourself with these technologies before the interview. Be ready to discuss
            your experience or ability to learn them.
          </p>
        </section>
      )}



      {/* Recent News - Schema fields TBD in Phase 3 */}

      {/* Competitors */}
      {sections.competitors.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
            <Globe className="w-10 h-10 text-slate-700" />
            Competitive Landscape
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {sections.competitors.map((competitor, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-6"
                data-cy={`competitor-${idx}`}
              >
                <div className="text-sm font-semibold text-slate-900 mb-2">
                  {competitor.name}
                </div>
                {competitor.context && (
                  <p className="text-xs text-slate-600">{competitor.context}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Culture Highlights */}
      {sections.culture.length > 0 && (
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8 space-y-6">
          <h3 className="text-base font-semibold text-purple-900 flex items-center gap-4">
            <Users className="w-10 h-10" />
            Company Culture
          </h3>
          <ul className="space-y-4">
            {sections.culture.map((cultureBit, idx) => (
              <li
                key={idx}
                className="text-sm text-purple-900 flex items-start gap-4"
                data-cy={`culture-item-${idx}`}
              >
                <span className="text-purple-600 mt-0.5">•</span>
                <span>{cultureBit}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Study Tips */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
        <div className="text-sm font-semibold text-blue-900 mb-4">📚 Preparation Tips</div>
        <ul className="space-y-2 text-xs text-blue-800">
          <li>• Research the company's recent product launches and announcements</li>
          <li>• Understand their competitive positioning in the market</li>
          <li>• Familiarize yourself with their tech stack and engineering culture</li>
          <li>• Review glassdoor reviews and employee feedback (balanced perspective)</li>
          <li>• Follow their leadership team on LinkedIn for insights</li>
          <li>• Prepare questions about growth strategy and technical direction</li>
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

export default CompanyIntelligence;