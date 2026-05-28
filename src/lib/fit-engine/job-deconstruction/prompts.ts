/**
 * Prompts for the Job Deconstruction LLM agent.
 * Structured to produce clean JSON output for the parser.
 */

import { ROLE_ARCHETYPES } from './archetypes';

export interface DeconstructionPromptInput {
  jobTitle: string;
  company: string;
  rawJdText: string;
}

export function buildDeconstructionPrompt(input: DeconstructionPromptInput): string {
  const { jobTitle, company, rawJdText } = input;

  return `Analyze this job description and extract the operational reality. Ignore inflated titles — focus on what the person in this role would actually DO.

Job Title: ${jobTitle}
Company: ${company}

Job Description:
${rawJdText}

${ROLE_ARCHETYPES}

Please provide a JSON analysis with the following structure:

{
  "inferredRole": {
    "title": "The REAL role title (e.g. 'roadmap operator', 'delivery manager') — strip recruiter fluff",
    "archetype": "One of: BUILDER, OPERATOR, STRATEGIST, MAINTAINER, OPTIMIZER, RESEARCHER, EXECUTOR, PROCESS_SCALER, SYSTEMS_INTEGRATOR, CUSTOMER_FACING_TRANSLATOR, TECHNICAL_LEAD, TRANSFORMATION_DRIVER",
    "archetypeWeights": { "BUILDER": 0.3, "OPERATOR": 0.6, ... },
    "clarityScore": 0.85,
    "reasoning": "Brief justification for inferred role"
  },
  "hardRequirements": [
    {
      "requirement": "5+ years experience with distributed systems",
      "classification": "hard",
      "confidenceScore": 0.9,
      "tools": ["Kubernetes", "Docker", "AWS"],
      "decisions": ["architecture decisions", "technology selection"],
      "outputs": ["system design documents", "infrastructure as code"],
      "metrics": ["99.9% uptime", "p99 latency"],
      "ownership": "own the infrastructure platform",
      "operationalComplexity": 7,
      "collaborationSurface": ["engineering teams", "SRE", "product"],
      "businessImpact": "platform reliability directly impacts customer experience",
      "executionCadence": "weekly sprints, quarterly planning",
      "riskLevel": 8
    }
  ],
  "softRequirements": [
    {
      "requirement": "Strong communication skills",
      "classification": "soft",
      "confidenceScore": 0.7,
      "tools": [],
      "decisions": [],
      "outputs": [],
      "metrics": [],
      "ownership": "",
      "operationalComplexity": 2,
      "collaborationSurface": [],
      "businessImpact": null,
      "executionCadence": null,
      "riskLevel": 2
    }
  ],
  "businessProblems": [
    {
      "problem": "Company is scaling from 100 to 500 engineers and needs platform stability",
      "category": "scaling",
      "severity": 8,
      "urgencySignal": "Mention of 'scaling challenges' and 'immediate need'",
      "operationalFriction": "Deployments take 3+ days",
      "scalingChallenge": "Team size doubling annually",
      "executionBottleneck": "Manual infrastructure provisioning",
      "evidence": "Direct quote from JD about scaling"
    }
  ],
  "operationalSignals": [
    {
      "signal": "Owns infrastructure reliability end-to-end",
      "signalType": "recurring_responsibility",
      "frequency": 0.85,
      "weight": 0.9,
      "sourceCompanies": ["Uber", "Stripe", "Airbnb"]
    }
  ],
  "operationalDomain": "infrastructure / platform engineering",
  "recurringResponsibilities": [
    { "responsibility": "Design and maintain CI/CD pipelines", "frequency": 0.9, "weight": 0.8 }
  ],
  "decisionOwnership": ["architecture decisions", "tech stack choices", "incident response protocols"],
  "operationalScope": "Platform serving 50+ product engineering teams",
  "executionComplexity": 7,
  "systemsResponsibility": "Kubernetes clusters, CI/CD pipelines, monitoring stack",
  "crossFunctionalCoordination": "Coordinates with 5+ product teams for platform needs",
  "reportingStructure": {
    "reportsTo": "Director of Infrastructure",
    "manages": ["2 SREs", "1 platform engineer"]
  },
  "organizationalLeverage": 7
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanatory text.`;
}
