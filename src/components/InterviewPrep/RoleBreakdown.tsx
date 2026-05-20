import React, { useMemo } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Users, 
  Target,
  AlertCircle,
  Zap
} from 'lucide-react';
import { InterviewPrep } from '../../types/interview';

interface RoleBreakdownProps {
  prep: InterviewPrep;
}

/**
 * RoleBreakdown Tab
 * Displays comprehensive role analysis including:
 * - Role title, seniority, reporting structure
 * - Key responsibilities and success criteria
 * - Required, preferred, and nice-to-have skills
 * - Career growth trajectory
 * - Team composition
 * - Common interview topics for this role
 */
export const RoleBreakdown: React.FC<RoleBreakdownProps> = ({ prep }) => {
  const roleData = useMemo(() => {
    return {
      title: prep.role || 'Role Title',
      seniority: prep.roleBreakdown?.seniority || 'Unknown',
      reportingLine: prep.roleBreakdown?.reportingLine || '',
      responsibilities: prep.roleBreakdown?.responsibilities || [],
      requiredSkills: prep.roleBreakdown?.requiredSkills || [],
      preferredSkills: prep.roleBreakdown?.preferredSkills || [],
    };
  }, [prep]);

  const responsibilities = useMemo(() => {
    return roleData.responsibilities.slice(0, 8);
  }, [roleData.responsibilities]);

  const requiredSkills = useMemo(() => {
    return roleData.requiredSkills.slice(0, 8);
  }, [roleData.requiredSkills]);

  const niceToHaveSkills = useMemo(() => {
    return roleData.preferredSkills.slice(0, 6);
  }, [roleData.preferredSkills]);

  const seniorityMetadata = useMemo(() => {
    const metadata: Record<string, { yearsMin: number; yearsMax: number; level: string }> = {
      'junior': { yearsMin: 0, yearsMax: 3, level: 'Entry-level to mid-level' },
      'mid': { yearsMin: 3, yearsMax: 7, level: 'Mid-level Professional' },
      'senior': { yearsMin: 7, yearsMax: 12, level: 'Senior Professional' },
      'staff': { yearsMin: 10, yearsMax: 20, level: 'Staff/Principal' },
      'lead': { yearsMin: 5, yearsMax: 15, level: 'Team Lead' },
      'principal': { yearsMin: 15, yearsMax: 30, level: 'Principal/Architect' },
    };
    const key = roleData.seniority.toLowerCase();
    return metadata[key] || { yearsMin: 3, yearsMax: 7, level: 'Mid-level Professional' };
  }, [roleData.seniority]);

  const interviewFocusAreas = useMemo(() => {
    const areas = [
      {
        area: 'Relevant Experience',
        topics: [
          `${roleData.seniority} level projects and responsibilities`,
          'Specific technologies and frameworks',
          'Industry-specific knowledge',
        ],
        emphasis: 'High',
      },
      {
        area: 'Technical Skills',
        topics: requiredSkills.slice(0, 4).map((s) => s.name),
        emphasis: 'High',
      },
      {
        area: 'Problem Solving',
        topics: [
          'Analytical approach to complex problems',
          'Debugging and troubleshooting methodology',
          'Trade-off decision making',
        ],
        emphasis: 'High',
      },
      {
        area: 'Collaboration & Communication',
        topics: [
          'Working with cross-functional teams',
          'Communicating technical concepts clearly',
          'Code review and feedback culture',
        ],
        emphasis: 'Medium',
      },
      {
        area: 'Growth & Learning',
        topics: [
          'How you stay current with technology',
          'Previous learning experiences',
          'Career goals alignment',
        ],
        emphasis: 'Medium',
      },
    ];
    return areas;
  }, [roleData, requiredSkills]);

  const commonQuestions = useMemo(() => {
    return [
      'Why are you interested in this role?',
      `What experience do you have with ${requiredSkills[0] || 'our tech stack'}?`,
      'Tell me about a project where you [key responsibility]',
      'How do you approach [common challenge in role]?',
      'Where do you see your career in 5 years?',
      'What attracted you to our company specifically?',
      'Describe your experience with [nice-to-have skill]',
      'How do you prioritize when working on multiple projects?',
    ];
  }, [requiredSkills]);

  return (
    <div data-cy="role-breakdown-tab" className="space-y-12 py-8">
      {/* Role Header */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-10">
        <div className="flex items-start gap-6">
          <Briefcase className="w-12 h-12 text-indigo-600 flex-shrink-0 mt-2" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">{roleData.title}</h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-indigo-100 text-indigo-800 text-sm font-medium px-6 py-2 rounded-full">
                {roleData.seniority}
              </div>
              <div className="bg-blue-100 text-blue-800 text-sm font-medium px-6 py-2 rounded-full">
                {seniorityMetadata.yearsMin}-{seniorityMetadata.yearsMax} years experience
              </div>
            </div>
            <p className="text-indigo-800 text-sm">
              {seniorityMetadata.level}
            </p>
          </div>
        </div>
      </section>

      {/* Key Responsibilities */}
      {responsibilities.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
            <Target className="w-10 h-10 text-orange-600" />
            Key Responsibilities
          </h3>
          <ul className="space-y-4">
            {responsibilities.map((resp, idx) => (
              <li
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex items-start gap-6"
                data-cy={`responsibility-${idx}`}
              >
                <span className="text-orange-600 flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{resp.title}</p>
                  <p className="text-xs text-slate-600 mt-2">{resp.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Required Skills */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          Required Skills
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {requiredSkills.map((skill, idx) => (
            <div
              key={idx}
              className="bg-emerald-50 border border-emerald-200 rounded-lg p-6"
              data-cy={`required-skill-${idx}`}
            >
              <div className="text-sm font-medium text-emerald-900">{skill.name}</div>
              <div className="text-xs text-emerald-700 mt-2">{skill.proficiency}</div>
            </div>
          ))}
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-6">
          <p className="text-xs text-emerald-800">
            <strong>Preparation tip:</strong> Be prepared to discuss your hands-on experience with each required skill.
            Have specific examples of projects or problems you've solved.
          </p>
        </div>
      </section>

      {/* Nice-to-Have Skills */}
      {niceToHaveSkills.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
            <Circle className="w-10 h-10 text-blue-600" />
            Nice-to-Have Skills
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {niceToHaveSkills.map((skill, idx) => (
              <div
                key={idx}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                data-cy={`nice-to-have-skill-${idx}`}
              >
                <div className="text-sm font-medium text-blue-900">{skill.name}</div>
                <div className="text-xs text-blue-700 mt-2">{skill.proficiency}</div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <p className="text-xs text-blue-800">
              <strong>Interview insight:</strong> If you have experience with these, mention it naturally
              when relevant. They differentiate you from other candidates.
            </p>
          </div>
        </section>
      )}

      {/* Growth Trajectory */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-semibold text-purple-900 flex items-center gap-4">
          <TrendingUp className="w-10 h-10" />
          Career Growth Path
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
            <span className="text-purple-900"><strong>0-2 years:</strong> Build foundational expertise</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
            <span className="text-purple-900"><strong>2-4 years:</strong> Lead initiatives and mentor juniors</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
            <span className="text-purple-900"><strong>4+ years:</strong> Strategic leadership and architecture</span>
          </div>
        </div>
        <p className="text-xs text-purple-800 pt-4 border-t border-purple-200 mt-6">
          💡 During the interview, discuss your growth goals. Hiring managers want to see ambition and commitment.
        </p>
      </section>

      {/* Interview Focus Areas */}
      <section className="space-y-8">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <Zap className="w-10 h-10 text-amber-600" />
          Interview Focus Areas
        </h3>
        {interviewFocusAreas.map((focusArea, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-8" data-cy={`focus-area-${idx}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm font-semibold text-slate-900">{focusArea.area}</div>
              <span
                className={`text-xs font-medium px-4 py-2 rounded ${
                  focusArea.emphasis === 'High'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {focusArea.emphasis} Emphasis
              </span>
            </div>
            <ul className="space-y-2">
              {focusArea.topics.map((topic, topicIdx) => (
                <li key={topicIdx} className="text-sm text-slate-700 flex items-start gap-4">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Common Interview Questions */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <AlertCircle className="w-10 h-10 text-slate-700" />
          Common Interview Questions
        </h3>
        <div className="space-y-4">
          {commonQuestions.map((question, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-6"
              data-cy={`common-question-${idx}`}
            >
              <p className="text-sm text-slate-900">{question}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-6">
          💡 For each question above, prepare a 2-3 minute response using the STAR framework
          (Situation, Task, Action, Result). Have 3-5 relevant stories ready.
        </p>
      </section>

      {/* Team Context */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <Users className="w-10 h-10 text-slate-700" />
          Team & Reporting Structure
        </h3>
        <div className="space-y-4 text-sm">
          <p className="text-slate-700">
            Understanding the team structure and reporting relationships helps you ask smart questions
            and assess cultural fit during the interview.
          </p>
          <ul className="space-y-2 text-slate-600 ml-8">
            <li>• How many people are on the team?</li>
            <li>• Who is the direct manager?</li>
            <li>• What other functions does this role interact with?</li>
            <li>• Is there room for growth and advancement?</li>
          </ul>
        </div>
      </section>

      {/* Preparation Strategy */}
      <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-8">
        <div className="text-sm font-semibold text-indigo-900 mb-6">📋 Role Preparation Strategy</div>
        <ol className="space-y-4 text-xs text-indigo-800">
          <li>
            <strong>1. Map Your Experience:</strong> For each required skill, identify 2-3 concrete examples
            from your background.
          </li>
          <li>
            <strong>2. Study Gaps:</strong> If you're missing a required skill, be honest about it but show
            eagerness to learn.
          </li>
          <li>
            <strong>3. Research Comparable Roles:</strong> Understanding similar positions helps you frame
            your experience effectively.
          </li>
          <li>
            <strong>4. Prepare Questions:</strong> Ask about team dynamics, technical challenges, and growth
            opportunities.
          </li>
          <li>
            <strong>5. Practice Delivery:</strong> Record yourself answering these common questions and
            refine your responses.
          </li>
        </ol>
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

export default RoleBreakdown;