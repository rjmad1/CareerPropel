/**
 * Prompt Compression Utility
 * Strips filler words and normalizes whitespace in prompts to reduce token counts.
 */

const REPLACEMENTS: [RegExp, string][] = [
  // Generic AI and coaching filler
  [/\byou are a helpful ai assistant\. respond concisely and accurately\./gi, ''],
  [/\byou are an expert /gi, 'you are '],
  [/\byour approach:/gi, 'approach:'],
  [/\boutput format:/gi, 'output:'],
  [/\bprovide a json object with this structure:/gi, 'output json:'],
  [/\bplease note that\b/gi, ''],
  [/\bit is important to note\b/gi, ''],
  [/\bin order to\b/gi, 'to'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bat this point in time\b/gi, 'now'],
  [/\bfor the purpose of\b/gi, 'to'],
  [/\bas well as\b/gi, 'and'],
  [/\bdetailed explanation\b/gi, 'explanation'],
  [/\binformation about\b/gi, 'about'],
  [/\bfully understand\b/gi, 'understand'],
  [/\bprioritize\b/gi, 'focus on'],
  [/\bmaintaining authenticity\b/gi, 'be authentic'],
  [/\breiterate\b/gi, 'repeat'],
  [/\bconversational filler\b/gi, 'filler'],
  [/\bignoring\b/gi, 'ignore'],
  
  // Standalone filler words with word boundaries
  [/\bcompletely\b/gi, ''],
  [/\bessentially\b/gi, ''],
  [/\bbasically\b/gi, ''],
  [/\bactually\b/gi, ''],
  [/\bsimply\b/gi, ''],
  [/\bjust\b/gi, ''],
  [/\bvery\b/gi, ''],
  [/\bextremely\b/gi, ''],
  [/\breally\b/gi, ''],
  
  // Specific agent prompt boilerplate optimizations
  [/\bYour role is to tailor resumes for specific job opportunities/gi, 'Tailor resumes for jobs'],
  [/\bAnalyze the target job description deeply—identify key skills, responsibilities, and culture signals/gi, 'Analyze job for skills, responsibilities, culture'],
  [/\bExtract matching accomplishments from the provided resume/gi, 'Extract achievements from resume'],
  [/\bRewrite bullet points using job-specific language and metrics/gi, 'Rewrite bullets with job language and metrics'],
  [/\bMaintain authenticity while maximizing relevance/gi, 'Be authentic and maximize relevance'],
  [/\bPrioritize impact \(quantified results\) over duties/gi, 'Focus on quantified results over duties'],
  [/\bBe specific, quantify where possible, and match the job's tone \(e.g., startup vs. enterprise\)/gi, 'Be specific, quantify, match job tone'],
  
  // Job match specific optimizations
  [/\bevaluates alignment between candidate profiles and job opportunities/gi, 'evaluates candidate job alignment'],
  [/\bParse the candidate's skills, experience, and preferences/gi, 'Parse candidate skills, experience'],
  [/\bAnalyze the job requirements, culture, and compensation/gi, 'Analyze requirements, culture, compensation'],
  [/\bScore alignment across multiple dimensions/gi, 'Score alignment'],
  [/\bIdentify skill gaps and growth opportunities/gi, 'Identify gaps'],
  [/\bFlag potential deal-breakers or red flags/gi, 'Flag red flags'],
  [/\bBe honest about mismatches\. A 70 is better than an inflated 90 if gaps exist\./gi, 'Be honest about mismatches.'],
  
  // Interview prep specific optimizations
  [/\bexpert interview preparation coach/gi, 'interview coach'],
  [/\bExtract likely question topics from job description and company culture/gi, 'Extract questions from job and culture'],
  [/\bGenerate STAR-structured stories from candidate's background/gi, 'Generate STAR stories from candidate background'],
  [/\bCreate technical deep-dives relevant to role/gi, 'Create technical deep-dives'],
  [/\bDevelop company-specific talking points/gi, 'Develop company talking points'],
  [/\bIdentify potential weaknesses to address/gi, 'Identify weaknesses'],
  [/\bBe practical and actionable\. Interviewees need confidence-building substance, not platitudes\./gi, 'Be practical. Provide substance, not platitudes.'],
  
  // Research specific optimizations
  [/\bresearch AI that gathers and synthesizes company and industry intelligence/gi, 'research AI for company/industry intelligence'],
  [/\bOrganize available company information/gi, 'Organize company info'],
  [/\bIdentify information gaps and knowledge areas/gi, 'Identify info gaps'],
  [/\bSynthesize insights about company culture, strategy, and trajectory/gi, 'Synthesize culture, strategy, trajectory'],
  [/\bFlag concerning signals \(layoffs, executive turnover, etc\.\)/gi, 'Flag layoffs/turnover'],
  [/\bHighlight competitive advantages and market position/gi, 'Highlight advantages, market position'],
  [/\bSynthesize available information\. Flag when data is incomplete or outdated\./gi, 'Synthesize info. Flag incomplete/outdated data.'],
  
  // Follow up specific optimizations
  [/\bexpert at crafting personalized, authentic follow-up communications/gi, 'expert at follow-ups'],
  [/\bReference specific conversation points/gi, 'Reference conversation points'],
  [/\bReiterate genuine interest with specificity/gi, 'Repeat interest with specificity'],
  [/\bProvide value-add information when appropriate/gi, 'Provide value-add info'],
  [/\bKeep tone professional but warm/gi, 'Keep professional, warm tone'],
  [/\bInclude clear next steps/gi, 'Include next steps'],
  [/\bBe authentic and specific, not generic\. Reference actual conversation details\./gi, 'Be authentic and specific. Reference conversation.'],
  
  // Networking specific optimizations
  [/\bnetworking strategist who identifies and prioritizes outreach opportunities/gi, 'networking strategist for outreach'],
  [/\bAnalyze candidate's network and experience/gi, 'Analyze candidate network, experience'],
  [/\bIdentify high-value connection opportunities/gi, 'Identify connection opportunities'],
  [/\bCreate outreach strategies for each segment/gi, 'Create outreach strategies'],
  [/\bProvide conversation starters and value propositions/gi, 'Provide starters, value props'],
  [/\bTrack warm vs\. cold opportunities/gi, 'Track opportunities'],
  [/\bFocus on authentic, mutually beneficial connections, not spray-and-pray outreach\./gi, 'Focus on authentic connections.'],
  
  // Role intelligence specific optimizations
  [/\boperational role analysis and job description deconstruction AI\. Your goal is to systematically strip away recruiter inflation and identify the real business requirements/gi, 'role analysis AI. Deconstruct job descriptions and identify real requirements'],
  [/\bIgnore Title Bias completely\. Focus instead on decision ownership, scope, systems responsibility, leverage, complexity, and reporting relationships\./gi, 'Ignore title bias. Focus on decision ownership, scope, systems, leverage, complexity.'],
  [/\bClassify the role into weighted archetypes: Builder, Operator, Strategist, Maintainer, Optimizer, Researcher, Executor, Process Scaler, Systems Integrator, Customer-Facing Translator, Technical Lead, Transformation Driver \(weights must sum to exactly 1\.0\)\./gi, 'Classify role into weighted archetypes (sum to 1.0).'],
  
  // Fit analysis specific optimizations
  [/\boperational fit analyzer that translates candidate history into employer language and normalizes career proof/gi, 'fit analyzer. Translate candidate history to employer language'],
  [/\bTranslate candidate phrased accomplishments \(e.g\. "Managed dashboards"\) into economic\/operational employer interpretations \(e.g\. "Operational analytics ownership, KPI instrumentation, and executive reporting"\)\./gi, 'Translate achievements to employer interpretations.'],
  [/\bMatch candidate proof against deconstructed job requirements\./gi, 'Match proof to job requirements.'],
  [/\bPrioritize strengths that solve employer business bottlenecks or represent rare, expensive-to-replace operational leverage\. Ignore commodity execution or generic tools\./gi, 'Prioritize strengths solving bottlenecks. Ignore generic tools.'],
  [/\bAnalyze how user's past context \(scale, decisions, complexity\) aligns with the job's context\./gi, 'Analyze past context alignment.'],

  // Strength mapper specific optimizations
  [/\bcapability evidence mapper. Your job is to match the candidate's achievements and STAR stories directly to the deconstructed business problems/gi, 'capability mapper. Match candidate achievements and STAR stories to business problems'],
  [/\bPair candidate's validated achievements with the inferred business bottlenecks of the employer/gi, 'Pair achievements with business bottlenecks'],
  [/\bTranslate all candidate capabilities into outcome-oriented phrasing/gi, 'Translate capabilities to outcome-oriented phrasing'],
  [/\bRank capabilities by strategic leverage, business bottleneck resolution, and replacement cost/gi, 'Rank capabilities by leverage, bottleneck resolution, cost'],

  // Conversion scorer specific optimizations
  [/\bdeterministic conversion probability and fit scoring AI\. You evaluate candidate suitability across the 10 canonical dimensions and classify trust gates and transition barriers/gi, 'conversion scorer and fit scoring AI. Evaluate candidate suitability across 10 dimensions and classify trust gates and transition barriers'],
  [/\bGrade the 10 dimensions independently on a 0-100 scale:/gi, 'Grade 10 dimensions on 0-100 scale:'],
  [/\bAssess the Candidate Credibility Risk Level:/gi, 'Assess Credibility Risk Level:'],
  [/\bAssess the Candidate Adaptation Burden Level:/gi, 'Assess Adaptation Burden Level:'],
  [/\bDemonstrated execution proof\b/gi, 'Execution proof'],
  [/\bBusiness problem alignment\b/gi, 'Problem alignment'],
  [/\bResponsibility overlap\b/gi, 'Resp overlap'],
  [/\bImmediate contribution capability\b/gi, 'Immediate contribution'],
  [/\bAdjacent skill transfer\b/gi, 'Adjacent skill transfer'],
  [/\bStrategic impact alignment\b/gi, 'Strategic impact'],
  [/\bslight transition risk, e\.g\. minor framework differences/gi, 'slight transition risk'],
  [/\bexpected shift, no major red flags/gi, 'expected shift'],
  [/\bunsupported expertise claims, seniority mismatch, e\.g\., claims executive leadership without organization ownership/gi, 'seniority/expertise mismatch'],
  [/\bdeep mismatch of context\/seniority/gi, 'mismatch context'],
  [/\bfabricated certificates, contradictory timelines, impossible tenure overlap/gi, 'fabricated timeline/info'],
  [/\bRetail operations -> retail platform operations/gi, 'Retail -> retail platform'],
  [/\bERP modernization -> SaaS operations/gi, 'ERP -> SaaS'],
  [/\bBackend engineer -> ML infrastructure lead/gi, 'Backend -> ML infra'],
  [/\bIC contributor -> enterprise CIO/gi, 'IC -> CIO'],

  // Gap analyzer specific optimizations
  [/\bgap analysis and adaptation-risk AI\. You identify friction, learning curves, and structural blockages between a candidate's profile and job requirements/gi, 'gap analysis AI. Identify friction, learning curves, and structural blockages between candidate profile and job requirements'],
  [/\bIdentify all gaps and classify them deterministically:/gi, 'Classify gaps deterministically:'],
  [/\bTrainable Gaps: lightweight tools, adjacent platforms, or workflow systems\. Penalty: LOW\./gi, 'Trainable: tools, platforms, workflows. Penalty: LOW.'],
  [/\bCredibility-Killing Gaps: lack of scale, missing security\/regulations, absence of distributed systems\. Penalty: SEVERE\./gi, 'Credibility-Killing: lack of scale, security, distributed systems. Penalty: SEVERE.'],
  [/\bDomain Depth Gaps: quantitative trading, biotech systems, deep hardware design where years of specialized depth are mandatory\. Penalty: CRITICAL\./gi, 'Domain Depth: quant, biotech, deep hardware. Penalty: CRITICAL.'],
  [/\bEstimate adaptation burden: learning curves, operational ramp time, and boarding cost\./gi, 'Estimate adaptation burden: learning curves, ramp time, cost.'],
  [/\bSuggest clear, concrete mitigation strategies for each gap\./gi, 'Suggest mitigation strategies for each gap.'],

  // Pattern miner specific optimizations
  [/\bsuccess-correlation pattern miner\. You extract recurring keywords, metrics, and narratives from candidate's successful matches and offer progressions/gi, 'success pattern miner. Extract keywords, metrics, narratives from successful matches'],
  [/\bCorrelate candidate achievements that led to interviews or progressions with role archetypes\./gi, 'Correlate achievements with archetypes.'],
  [/\bMine recurring operational responsibilities and high-fit terminology to update future weights\./gi, 'Mine operational responsibilities to update weights.'],
];

/**
 * Compresses a prompt by replacing verbose filler phrases and cleaning up whitespace/newlines.
 */
export function compressPrompt(text: string): string {
  if (!text) return text;
  
  let compressed = text;

  // Apply regex replacements for boilerplate & filler words
  for (const [pattern, replacement] of REPLACEMENTS) {
    compressed = compressed.replace(pattern, replacement);
  }

  // Compress whitespace:
  // 1. Split into lines
  // 2. Trim whitespace on each line
  // 3. Keep empty lines only if the previous line wasn't empty (collapse multiple newlines)
  // 4. In each line, replace consecutive spaces/tabs with a single space
  // 5. Join back with newlines
  const lines = compressed.split(/\r?\n/);
  const cleanedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().replace(/[ \t]+/g, ' ');
    if (line === '') {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== '') {
        cleanedLines.push('');
      }
    } else {
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join('\n').trim();
}
