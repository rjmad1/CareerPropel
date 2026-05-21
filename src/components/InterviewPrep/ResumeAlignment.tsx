import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  FileText,
  Copy,
  Download,
  Eye,
  Sliders,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { InterviewPrep } from '../../types/interview';

interface ResumeAlignmentProps {
  prep: InterviewPrep;
}

/**
 * ResumeAlignment Workspace
 * Represents a high-end, premium comparative document editor and ATS alignment workspace.
 * Features:
 * 1. 10-Dimension Strategic Match Scorecard Grid
 * 2. Active Tab Switcher (ATS Gap Analysis vs. Tailored Resume Workspace)
 * 3. Side-by-Side Original-vs-Tailored Interactive Editor
 * 4. Print-Ready HTML Live PDF Resume Preview
 * 5. Instant Copy & Dynamic PDF Export Actions via Print Stylesheets
 */
export const ResumeAlignment: React.FC<ResumeAlignmentProps> = ({ prep }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'workspace'>('analysis');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  
  // Track applied customizations to dynamically update the live PDF preview
  const [appliedCustomizations, setAppliedCustomizations] = useState({
    summary: true,
    skills: true,
    experience: true,
    certifications: true,
  });

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

  // Strategic Product Leadership: The 10-Dimension Career Alignment Scorecard
  const strategicScorecard = useMemo(() => {
    return [
      { dimension: 'Compensation Alignment', score: 8.5, status: 'exceptional', desc: 'Base range ($140k-$170k) fits candidate expectation with significant stock refreshers.' },
      { dimension: 'Technology Stack Fit', score: 9.0, status: 'exceptional', desc: 'Direct mapping of primary languages (React/TypeScript, Node.js) with 90% stack alignment.' },
      { dimension: 'Role Seniority Match', score: 7.5, status: 'good', desc: 'Aligned with mid-to-senior requirements; candidate leadership matches role expectations.' },
      { dimension: 'Remote Flexibility', score: 10.0, status: 'exceptional', desc: '100% remote flexibility with zero commute overhead.' },
      { dimension: 'Company Stability', score: 6.0, status: 'warning', desc: 'Startup/Scale-up size has moderate risk, balanced by strong Series B funding.' },
      { dimension: 'Culture & Growth', score: 8.0, status: 'good', desc: 'Values highly collaborative mentorship and continuous learning.' },
      { dimension: 'Domain Relevance', score: 7.0, status: 'good', desc: 'Candidate experience in SaaS aligns well; FinTech is a slight learn-on-job gap.' },
      { dimension: 'Team Structure Fit', score: 8.0, status: 'good', desc: 'Collaborative team structure (size 12) matches candidates preferences.' },
      { dimension: 'Work-Life Balance', score: 7.5, status: 'good', desc: 'General consensus indicates sustainable pacing and generous PTO.' },
      { dimension: 'Brand Equity', score: 8.2, status: 'good', desc: 'Prestige scale-up with high market valuation and excellent exit history.' },
    ];
  }, []);

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

  // Full interactive tailored sections showing original vs customized content
  const tailoredResumeData = useMemo(() => {
    return {
      fullName: 'Alexander Wright',
      headline: 'Senior Full-Stack Engineer',
      contact: 'alex.wright@devmail.com | +1 (555) 019-2834 | San Francisco, CA | github.com/alexwright',
      summary: {
        section: 'Professional Summary',
        original: 'Full-Stack Software Engineer with 6+ years of experience in JavaScript, React, and Node.js. Skilled in building highly responsive web applications, collaborating with product teams, and optimizing backend performance.',
        tailored: 'Senior Full-Stack Engineer with 6+ years of specialized experience designing high-scale cloud architectures. Expertise in React, TypeScript, and microservice orchestration using Node.js. Proven track record leading system migrations and dockerizing server infrastructures on AWS to achieve 60% latency reductions.',
        keywordsAdded: ['TypeScript', 'Cloud Architecture', 'AWS', 'Docker', 'System Migration'],
      },
      skills: {
        section: 'Core Competencies',
        original: 'React, Node.js, JavaScript, Express, HTML, CSS, SQL, Git, Jest, Agile',
        tailored: 'React, Node.js, TypeScript, AWS, Docker, Kubernetes, SQL (PostgreSQL), RESTful APIs, Git, Agile Methodology, Jest, CI/CD',
        keywordsAdded: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'CI/CD'],
      },
      experience: {
        section: 'Professional Experience',
        original: 'Developed web applications using React and Node.js. Collaborated with designers to implement pixel-perfect user interfaces. Maintained backend databases and optimized query execution.',
        tailored: 'Led core product development using React and TypeScript. Architected clean, microservice-based backend systems on Node.js and PostgreSQL. Designed and executed monolith-to-microservices docker migration on AWS, reducing deployment times by 60% and scaling server capacity to 500k+ users.',
        keywordsAdded: ['TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'Monolith-to-Microservices', 'Scale'],
      },
      certifications: {
        section: 'Certifications',
        original: 'Certified Web Developer, Agile Scrum Master',
        tailored: 'AWS Solutions Architect Professional, Kubernetes CKA (Certified Kubernetes Administrator), Certified Scrum Master (CSM)',
        keywordsAdded: ['AWS Professional', 'Kubernetes CKA'],
      }
    };
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadPdf = async () => {
    setIsCompiling(true);
    setCompileError(null);

    const compilePayload = {
      fullName: tailoredResumeData.fullName,
      headline: tailoredResumeData.headline,
      contact: tailoredResumeData.contact,
      summary: appliedCustomizations.summary ? tailoredResumeData.summary.tailored : tailoredResumeData.summary.original,
      skills: appliedCustomizations.skills ? tailoredResumeData.skills.tailored : tailoredResumeData.skills.original,
      experience: [
        {
          role: 'Senior Software Engineer',
          company: 'TechScale Corp',
          location: 'San Francisco, CA',
          duration: '2022 - Present',
          description: appliedCustomizations.experience ? tailoredResumeData.experience.tailored : tailoredResumeData.experience.original,
        },
        {
          role: 'Software Engineer',
          company: 'DevPropel LLC',
          location: 'San Jose, CA',
          duration: '2020 - 2022',
          description: 'Built and maintained responsive web applications using React and Node.js. Coordinated key features with product managers, and scaled relational database operations.',
        }
      ],
      certifications: appliedCustomizations.certifications ? tailoredResumeData.certifications.tailored : tailoredResumeData.certifications.original,
    };

    try {
      const response = await fetch('/api/documents/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compilePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error occurred during compilation');
      }

      // Read response as Blob
      const blob = await response.blob();
      
      // Create temporary download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const sanitizedHeadline = tailoredResumeData.headline.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      const filename = `Resume_${tailoredResumeData.fullName.replace(/\s+/g, '_')}_${sanitizedHeadline}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF Compilation failure:', err);
      setCompileError(err.message || 'Failed to compile resume via serverless engine.');
      setTimeout(() => {
        setCompileError(null);
      }, 6000);
    } finally {
      setIsCompiling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div data-cy="resume-alignment-tab" className="space-y-12 py-8 relative">
      {/* ─── PRINT-ONLY TAILORED RESUME CONTAINER ─── */}
      <div id="printable-resume-container" className="hidden-screen-only p-12 bg-white text-slate-900 font-serif leading-relaxed max-w-4xl mx-auto border border-slate-200 shadow-lg">
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 uppercase">{tailoredResumeData.fullName}</h1>
          <p className="text-sm font-semibold text-indigo-700 tracking-wider mt-1">{tailoredResumeData.headline}</p>
          <p className="text-xs text-slate-500 mt-2 font-mono">{tailoredResumeData.contact}</p>
        </div>

        <div className="space-y-6">
          {/* Summary Section */}
          <section>
            <h2 className="text-sm font-bold text-indigo-900 border-b tracking-wider uppercase mb-2">Professional Summary</h2>
            <p className="text-xs text-slate-700 text-justify">
              {appliedCustomizations.summary ? tailoredResumeData.summary.tailored : tailoredResumeData.summary.original}
            </p>
          </section>

          {/* Skills Section */}
          <section>
            <h2 className="text-sm font-bold text-indigo-900 border-b tracking-wider uppercase mb-2">Core Competencies</h2>
            <p className="text-xs text-slate-700 font-medium tracking-wide">
              {appliedCustomizations.skills ? tailoredResumeData.skills.tailored : tailoredResumeData.skills.original}
            </p>
          </section>

          {/* Experience Section */}
          <section>
            <h2 className="text-sm font-bold text-indigo-900 border-b tracking-wider uppercase mb-2">Professional Experience</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Senior Software Engineer — Cloud Services Group</span>
                <span>2022 - Present</span>
              </div>
              <p className="text-xs italic text-slate-500 mb-1">TechScale Corp, San Francisco, CA</p>
              <p className="text-xs text-slate-700 text-justify">
                {appliedCustomizations.experience ? tailoredResumeData.experience.tailored : tailoredResumeData.experience.original}
              </p>
            </div>
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Software Engineer — Product Systems</span>
                <span>2020 - 2022</span>
              </div>
              <p className="text-xs italic text-slate-500 mb-1">DevPropel LLC, San Jose, CA</p>
              <p className="text-xs text-slate-700 text-justify">
                Built and maintained responsive web applications using React and Node.js. Coordinated key features with product managers, and scaled relational database operations.
              </p>
            </div>
          </section>

          {/* Certifications Section */}
          <section>
            <h2 className="text-sm font-bold text-indigo-900 border-b tracking-wider uppercase mb-2">Certifications</h2>
            <p className="text-xs text-slate-700">
              {appliedCustomizations.certifications ? tailoredResumeData.certifications.tailored : tailoredResumeData.certifications.original}
            </p>
          </section>
        </div>
      </div>

      {/* ─── STYLED WEB WORKSPACE LAYOUT ─── */}
      {/* Header Match Score Overview */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-shrink-0">
            <div className="relative w-44 h-44 flex items-center justify-center bg-slate-950/60 rounded-full border border-indigo-500/20 backdrop-blur-sm p-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="6"
                  strokeDasharray={`${(matchScore / 100) * 452.4} 452.4`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">{matchScore}%</div>
                <div className="text-2xs font-semibold uppercase tracking-wider text-indigo-400 mt-1">ATS Match</div>
              </div>
            </div>
          </div>

          <div className="flex-grow text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">AI-Native ResumeTailor</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-4">Resume-to-Job Alignment Workspace</h3>
            <p className="text-sm text-slate-300 mb-6 max-w-xl leading-relaxed">
              Your resume exhibits strong core alignment but lacks key system scaling context. 
              Toggle to the **Tailored Resume Workspace** to live-preview, adjust, and immediately export your customized ATS resume.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300 font-medium">{matchedKeywords.length} Keywords Matched</span>
              </div>
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span className="text-slate-300 font-medium">{missingKeywords.length} Missing Keywords</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Tab Workspace Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-3 px-8 py-5 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeTab === 'analysis'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          ATS Gap Analysis
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-3 px-8 py-5 text-sm font-semibold tracking-wide border-b-2 transition-all relative ${
            activeTab === 'workspace'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5" />
          Tailored Resume Workspace
          <span className="absolute top-2 right-2 bg-indigo-500 text-white text-3xs font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
            Active
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'analysis' ? (
        <div className="space-y-12 animate-in fade-in duration-300">
          {/* Strategic 10-Dimension Scorecard Grid */}
          <section className="space-y-6">
            <div className="flex items-center gap-3.5">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">10-Dimension Strategic Career Scorecard</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              An expert product leader analysis mapping this specific job listing against your core parameters. 
              Evaluates beyond keywords to gauge true operational and cultural synergy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategicScorecard.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6 transition-all hover:shadow-md hover:border-slate-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800">{item.dimension}</span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      item.score >= 8.5
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.score >= 7.0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.score} / 10
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 8.5
                          ? 'bg-emerald-500'
                          : item.score >= 7.0
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.score * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Missing Keywords Box */}
          {missingKeywords.length > 0 && (
            <section className="bg-amber-50/60 border border-amber-200 rounded-xl p-8 space-y-6">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-amber-600" />
                Missing Core ATS Keywords ({missingKeywords.length})
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                The job description weights these keywords heavily. The Tailored Resume Workspace automatically 
                injects them into key experiences to maximize ATS scoring compatibility.
              </p>
              <div className="flex flex-wrap gap-3">
                {missingKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-amber-300 text-amber-900 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
                  >
                    + {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Skill Gaps Analysis */}
          <section className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-slate-700" />
              Technical & Domain Gap Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {skillGaps.map((gap, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{gap.category}</span>
                    <span className={`text-4xs font-extrabold uppercase px-2 py-0.5 rounded ${
                      gap.importance === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {gap.importance} Importance
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-3xs font-extrabold uppercase text-slate-400 block mb-1.5">Required</span>
                      <div className="flex flex-wrap gap-2">
                        {gap.required.map((req, rIdx) => (
                          <span key={rIdx} className="text-2xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">{req}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-3xs font-extrabold uppercase text-slate-400 block mb-1.5">You Have</span>
                      <div className="flex flex-wrap gap-2">
                        {gap.yourSkills.map((sk, sIdx) => (
                          <span key={sIdx} className="text-2xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1 rounded font-medium">✓ {sk}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-3xs font-extrabold uppercase text-slate-400 block mb-1.5">Identified Gap</span>
                      <div className="flex flex-wrap gap-2">
                        {gap.gap.map((g, gIdx) => (
                          <span key={gIdx} className="text-2xs bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded font-bold">✗ {g}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ATS Metrics */}
          <section className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
              ATS Optimization Scorecard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {atsOptimization.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-800">{item.metric}</span>
                    <span className={`text-xs font-extrabold ${
                      item.score >= 80 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>{item.score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <p className="text-3xs text-slate-500 leading-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Workspace Tab Content */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 py-4 animate-in fade-in duration-300">
          {/* Interactive comparative editor (left 7 cols) */}
          <div className="xl:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-6 h-6 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Tailoring Controls</h3>
              </div>
              <span className="text-3xs text-slate-500 font-medium">Toggle updates to live-preview on the right</span>
            </div>

            {/* Dynamic Customizer Cards */}
            <div className="space-y-6">
              {/* Summary customizer */}
              <div className="border border-slate-200 rounded-xl p-6 space-y-4 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="customize-summary"
                      checked={appliedCustomizations.summary}
                      onChange={(e) => setAppliedCustomizations({ ...appliedCustomizations, summary: e.target.checked })}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="customize-summary" className="text-xs font-bold text-slate-900 cursor-pointer">
                      Tailor Summary Section
                    </label>
                  </div>
                  <button
                    onClick={() => handleCopy(tailoredResumeData.summary.tailored, 'summary')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedSection === 'summary' ? 'Copied!' : 'Copy Summary'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-3xs font-extrabold uppercase text-slate-400">Original</span>
                    <p className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-600 italic leading-relaxed">
                      {tailoredResumeData.summary.original}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-3xs font-extrabold uppercase text-indigo-500">Tailored Draft</span>
                    <p className="p-3 bg-indigo-50/50 border border-indigo-100 rounded text-indigo-900 font-medium leading-relaxed">
                      {tailoredResumeData.summary.tailored}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase self-center mr-1">Added Keywords:</span>
                  {tailoredResumeData.summary.keywordsAdded.map((kw, i) => (
                    <span key={i} className="text-3xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-1 rounded">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills customizer */}
              <div className="border border-slate-200 rounded-xl p-6 space-y-4 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="customize-skills"
                      checked={appliedCustomizations.skills}
                      onChange={(e) => setAppliedCustomizations({ ...appliedCustomizations, skills: e.target.checked })}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="customize-skills" className="text-xs font-bold text-slate-900 cursor-pointer">
                      Tailor Skills Section
                    </label>
                  </div>
                  <button
                    onClick={() => handleCopy(tailoredResumeData.skills.tailored, 'skills')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedSection === 'skills' ? 'Copied!' : 'Copy Skills'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-3xs font-extrabold uppercase text-slate-400">Original</span>
                    <p className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-600 italic">
                      {tailoredResumeData.skills.original}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-3xs font-extrabold uppercase text-indigo-500">Tailored Draft</span>
                    <p className="p-3 bg-indigo-50/50 border border-indigo-100 rounded text-indigo-900 font-medium">
                      {tailoredResumeData.skills.tailored}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase self-center mr-1">Added:</span>
                  {tailoredResumeData.skills.keywordsAdded.map((kw, i) => (
                    <span key={i} className="text-3xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-1 rounded">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience customizer */}
              <div className="border border-slate-200 rounded-xl p-6 space-y-4 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="customize-experience"
                      checked={appliedCustomizations.experience}
                      onChange={(e) => setAppliedCustomizations({ ...appliedCustomizations, experience: e.target.checked })}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="customize-experience" className="text-xs font-bold text-slate-900 cursor-pointer">
                      Tailor Experience bullets
                    </label>
                  </div>
                  <button
                    onClick={() => handleCopy(tailoredResumeData.experience.tailored, 'experience')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedSection === 'experience' ? 'Copied!' : 'Copy Experience'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-3xs font-extrabold uppercase text-slate-400">Original</span>
                    <p className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-600 italic leading-relaxed">
                      {tailoredResumeData.experience.original}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-3xs font-extrabold uppercase text-indigo-500">Tailored Draft</span>
                    <p className="p-3 bg-indigo-50/50 border border-indigo-100 rounded text-indigo-900 font-medium leading-relaxed">
                      {tailoredResumeData.experience.tailored}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase self-center mr-1">Added Focus:</span>
                  {tailoredResumeData.experience.keywordsAdded.map((kw, i) => (
                    <span key={i} className="text-3xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-1 rounded">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Document PDF Preview Panel (right 5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye className="w-6 h-6 text-slate-800" />
                <h3 className="text-base font-bold text-slate-900">Live Document Preview</h3>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isCompiling}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  {isCompiling ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
                      <span>Compile PDF (AI)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save</span>
                </button>
              </div>
            </div>

            {compileError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2.5 animate-in fade-in duration-300">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{compileError}</span>
              </div>
            )}

            {/* Print Mock Page container */}
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-6 shadow-inner max-h-[800px] overflow-y-auto relative">
              {isCompiling && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center rounded-xl z-20 transition-all duration-300">
                  <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-6 max-w-xs flex flex-col items-center text-center shadow-2xl">
                    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-bold text-white mb-1">Compiling Resume PDF</p>
                    <p className="text-4xs text-slate-400">Headless chromium is rendering print stylesheets and assets...</p>
                  </div>
                </div>
              )}
              <div className="bg-white p-8 border border-slate-300 shadow-lg text-slate-800 font-serif leading-relaxed text-3xs mx-auto max-w-[500px]">
                <div className="text-center border-b pb-2 mb-4">
                  <h4 className="text-base font-bold text-slate-800 tracking-tight uppercase leading-none">{tailoredResumeData.fullName}</h4>
                  <p className="text-4xs font-bold text-indigo-700 tracking-wider mt-0.5 leading-none">{tailoredResumeData.headline}</p>
                  <p className="text-5xs text-slate-500 font-mono mt-1 leading-none">{tailoredResumeData.contact}</p>
                </div>

                <div className="space-y-4 scale-[0.98] origin-top">
                  {/* Summary Section */}
                  <section>
                    <h5 className="text-4xs font-bold text-indigo-900 border-b tracking-wider uppercase mb-1 leading-none">Professional Summary</h5>
                    <p className="text-4xs text-slate-600 text-justify leading-tight">
                      {appliedCustomizations.summary ? tailoredResumeData.summary.tailored : tailoredResumeData.summary.original}
                    </p>
                  </section>

                  {/* Skills Section */}
                  <section>
                    <h5 className="text-4xs font-bold text-indigo-900 border-b tracking-wider uppercase mb-1 leading-none">Core Competencies</h5>
                    <p className="text-4xs text-slate-600 leading-tight">
                      {appliedCustomizations.skills ? tailoredResumeData.skills.tailored : tailoredResumeData.skills.original}
                    </p>
                  </section>

                  {/* Experience Section */}
                  <section>
                    <h5 className="text-4xs font-bold text-indigo-900 border-b tracking-wider uppercase mb-1 leading-none">Professional Experience</h5>
                    <div className="mb-2">
                      <div className="flex justify-between items-center text-4xs font-bold text-slate-800 leading-none">
                        <span>Senior Software Engineer</span>
                        <span>2022 - Present</span>
                      </div>
                      <p className="text-5xs text-slate-400 leading-none mb-0.5">TechScale Corp, San Francisco, CA</p>
                      <p className="text-4xs text-slate-600 text-justify leading-tight">
                        {appliedCustomizations.experience ? tailoredResumeData.experience.tailored : tailoredResumeData.experience.original}
                      </p>
                    </div>
                  </section>

                  {/* Certifications Section */}
                  <section>
                    <h5 className="text-4xs font-bold text-indigo-900 border-b tracking-wider uppercase mb-1 leading-none">Certifications</h5>
                    <p className="text-4xs text-slate-600 leading-tight">
                      {appliedCustomizations.certifications ? tailoredResumeData.certifications.tailored : tailoredResumeData.certifications.original}
                    </p>
                  </section>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
              <span className="text-2xs font-extrabold uppercase text-slate-400 block">💡 Product Pro-Tip:</span>
              <p className="text-3xs text-slate-600 leading-normal">
                Clicking <strong className="font-bold text-slate-700">{"\"Export / Print PDF\""}</strong> triggers your browser&apos;s native Print engine. 
                Our stylesheet automatically formats the output into a pristine, beautifully aligned resume page, 
                hiding all website layout controls! Select <strong className="font-bold text-slate-700">{"\"Save as PDF\""}</strong> in your print destination.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAlignment;