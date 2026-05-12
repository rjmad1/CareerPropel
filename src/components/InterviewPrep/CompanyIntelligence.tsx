import React, { useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Code, 
  Newspaper, 
  AlertTriangle,
  Target,
  Globe,
  DollarSign,
  TrendingDown
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
  companyData,
}) => {
  const sections = useMemo(() => {
    return {
      overview: prep.companyResearch?.overview || '',
      industry: prep.companyResearch?.industry || '',
      culture: prep.companyResearch?.culture || [],
      techStack: prep.companyResearch?.techStack || [],
      recentNews: prep.companyResearch?.recentNews || [],
      hiringPatterns: prep.companyResearch?.hiringPatterns || {},
      competitors: prep.companyResearch?.competitors || [],
    };
  }, [prep]);

  const fundingStage = useMemo(() => {
    if (!companyData?.fundingHistory?.length) return null;
    return companyData.fundingHistory[companyData.fundingHistory.length - 1];
  }, [companyData]);

  const totalFunding = useMemo(() => {
    return (
      companyData?.fundingHistory?.reduce((sum, round) => sum + (round.amount || 0), 0) || 0
    );
  }, [companyData]);

  const recentLayoffs = useMemo(() => {
    return (
      companyData?.layoffHistory?.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )?.[0] || null
    );
  }, [companyData]);

  const interviewRounds = useMemo(() => {
    return companyData?.interviewProcess?.rounds || [];
  }, [companyData]);

  const avgTimeToHire = useMemo(() => {
    return companyData?.averageDaysToHire || null;
  }, [companyData]);

  return (
    <div data-cy="company-intelligence-tab" className="space-y-6 py-4">
      {/* Company Overview */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-5">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-slate-700 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {prep.jobData?.company || 'Company Overview'}
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-3">
              {sections.overview || 'Company research is being gathered...'}
            </p>
            {sections.industry && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded">
                  {sections.industry}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Funding & Financial Health */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Financial Health
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {fundingStage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-xs text-emerald-700 font-medium mb-1">Latest Funding</div>
              <div className="text-sm font-semibold text-emerald-900 mb-1">
                {fundingStage.stage}
              </div>
              <div className="text-xs text-emerald-600">
                ${(fundingStage.amount / 1000000).toFixed(1)}M
              </div>
              {fundingStage.date && (
                <div className="text-xs text-emerald-600 mt-1">
                  {new Date(fundingStage.date).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
          {totalFunding > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-xs text-blue-700 font-medium mb-1">Total Funding</div>
              <div className="text-sm font-semibold text-blue-900">
                ${(totalFunding / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-blue-600 mt-2">
                {companyData?.fundingHistory?.length || 0} rounds
              </div>
            </div>
          )}
          {companyData?.valuation && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-xs text-purple-700 font-medium mb-1">Valuation</div>
              <div className="text-sm font-semibold text-purple-900">
                ${(companyData.valuation / 1000000000).toFixed(1)}B
              </div>
              <div className="text-xs text-purple-600 mt-2">
                {companyData.status || 'Active'}
              </div>
            </div>
          )}
          {companyData?.headcount && (
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
              <div className="text-xs text-slate-700 font-medium mb-1">Headcount</div>
              <div className="text-sm font-semibold text-slate-900">
                {companyData.headcount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 mt-2">employees</div>
            </div>
          )}
        </div>
      </section>

      {/* Red Flags */}
      {(recentLayoffs || (sections.culture?.some(c => c.includes('concern')) ?? false)) && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <h3 className="text-base font-semibold text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Potential Considerations
          </h3>
          {recentLayoffs && (
            <div className="text-sm">
              <div className="font-medium text-amber-900 mb-1">Recent Layoff Activity</div>
              <div className="text-amber-800">
                {recentLayoffs.percentageAffected}% of workforce
                ({recentLayoffs.count} employees) · 
                {new Date(recentLayoffs.date).toLocaleDateString()}
              </div>
              {recentLayoffs.reason && (
                <div className="text-xs text-amber-700 mt-1 italic">{recentLayoffs.reason}</div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Technical Stack */}
      {sections.techStack.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            Tech Stack
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {sections.techStack.map((tech, idx) => (
              <div
                key={idx}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                data-cy={`tech-stack-item-${idx}`}
              >
                <div className="text-xs font-medium text-blue-700 mb-1">{tech.category}</div>
                <div className="text-sm font-semibold text-blue-900">{tech.name}</div>
                {tech.maturity && (
                  <div className="text-xs text-blue-600 mt-1">{tech.maturity} maturity</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 rounded p-2">
            💡 Familiarize yourself with these technologies before the interview. Be ready to discuss
            your experience or ability to learn them.
          </p>
        </section>
      )}

      {/* Hiring Patterns */}
      {Object.keys(sections.hiringPatterns).length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Hiring Patterns
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {sections.hiringPatterns.growthRate && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="text-xs text-emerald-700 font-medium mb-1">Growth Rate</div>
                <div className="text-sm font-semibold text-emerald-900">
                  {sections.hiringPatterns.growthRate}%
                </div>
                <div className="text-xs text-emerald-600 mt-1">YoY growth</div>
              </div>
            )}
            {avgTimeToHire && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-xs text-orange-700 font-medium mb-1">Time to Hire</div>
                <div className="text-sm font-semibold text-orange-900">{avgTimeToHire} days</div>
                <div className="text-xs text-orange-600 mt-1">average</div>
              </div>
            )}
            {sections.hiringPatterns.openRoles && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-blue-700 font-medium mb-1">Open Roles</div>
                <div className="text-sm font-semibold text-blue-900">
                  {sections.hiringPatterns.openRoles}
                </div>
                <div className="text-xs text-blue-600 mt-1">actively hiring</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Interview Process */}
      {interviewRounds.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Interview Process
          </h3>
          <div className="space-y-2">
            {interviewRounds.map((round, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                data-cy={`interview-round-${idx}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Round {idx + 1}</div>
                    <div className="text-xs text-slate-600">{round.type}</div>
                  </div>
                  <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {round.duration || 'TBD'} min
                  </div>
                </div>
                {round.description && (
                  <p className="text-xs text-slate-600">{round.description}</p>
                )}
                {round.focusAreas && round.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {round.focusAreas.map((area, aIdx) => (
                      <span
                        key={aIdx}
                        className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent News */}
      {sections.recentNews.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-slate-700" />
            Recent News & Updates
          </h3>
          <div className="space-y-2">
            {sections.recentNews.map((article, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                data-cy={`news-item-${idx}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 mb-1">
                      {article.headline}
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{article.summary}</p>
                    <div className="text-xs text-slate-500">
                      {new Date(article.date).toLocaleDateString()} · {article.source}
                    </div>
                  </div>
                  {article.sentiment && (
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                        article.sentiment === 'positive'
                          ? 'bg-emerald-100 text-emerald-800'
                          : article.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {article.sentiment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competitors */}
      {sections.competitors.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-700" />
            Competitive Landscape
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {sections.competitors.map((competitor, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                data-cy={`competitor-${idx}`}
              >
                <div className="text-sm font-semibold text-slate-900 mb-1">
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
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <h3 className="text-base font-semibold text-purple-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Company Culture
          </h3>
          <ul className="space-y-2">
            {sections.culture.map((cultureBit, idx) => (
              <li
                key={idx}
                className="text-sm text-purple-900 flex items-start gap-2"
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
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-blue-900 mb-2">📚 Preparation Tips</div>
        <ul className="space-y-1 text-xs text-blue-800">
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
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
          Last updated: {new Date(prep.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CompanyIntelligence;