import { z } from 'zod';

export const resumeTailorSchema = z.object({
  summary: z.string().min(10).max(1000),
  skills: z.array(z.string().min(1)).min(1).max(60),
  tailoredBullets: z.array(z.object({
    role: z.string().min(1),
    bullets: z.array(z.string().min(10)).min(1).max(20),
  })).min(1),
  confidence: z.number().int().min(0).max(100),
  reasoning: z.string().min(10).max(2000),
});

export const jobMatchSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  scoreBreakdown: z.object({
    skillMatch: z.number().int().min(0).max(100),
    experienceLevel: z.number().int().min(0).max(100),
    compensationFit: z.number().int().min(0).max(100),
    cultureFit: z.number().int().min(0).max(100),
    growthOpportunity: z.number().int().min(0).max(100),
  }),
  strengths: z.array(z.string()).min(1).max(20),
  gaps: z.array(z.string()).max(20),
  redFlags: z.array(z.string()).max(10),
  recommendation: z.enum(['STRONG_MATCH', 'GOOD_MATCH', 'MODERATE_MATCH', 'POOR_MATCH']),
  reasoning: z.string().min(20).max(3000),
});

export const interviewPrepSchema = z.object({
  companyOverview: z.string().min(20).max(3000),
  roleBreakdown: z.object({
    keyResponsibilities: z.array(z.string()).min(1).max(20),
    successMetrics: z.array(z.string()).min(1).max(10),
    commonChallenges: z.array(z.string()).max(10),
  }),
  likelyQuestions: z.array(z.object({
    question: z.string().min(10),
    category: z.enum(['behavioral', 'technical', 'situational']),
    approach: z.string().min(10),
  })).min(3).max(30),
  starStories: z.array(z.object({
    situation: z.string().min(10),
    task: z.string().min(10),
    action: z.string().min(10),
    result: z.string().min(10),
  })).min(1).max(10),
  technicalTopics: z.array(z.object({
    topic: z.string().min(2),
    keyPoints: z.array(z.string()).min(1),
    recentTrends: z.array(z.string()),
  })).max(15),
  companySpecificTalkingPoints: z.array(z.string()).min(1).max(10),
  potentialWeaknesses: z.array(z.string()).max(10),
  negotiationTalkingPoints: z.object({
    salaryJustification: z.string().min(10),
    equityFramework: z.string().min(5),
    benefitsNegotiation: z.string().min(5),
  }),
});

export const researchSchema = z.object({
  companySnapshot: z.object({
    founded: z.string(),
    funding: z.string(),
    headcount: z.string(),
    recentNews: z.array(z.string()).max(10),
  }),
  leadership: z.array(z.object({
    name: z.string(),
    title: z.string(),
    background: z.string(),
  })).max(20),
  cultureSummary: z.string().min(20).max(2000),
  strengths: z.array(z.string()).min(1).max(15),
  challenges: z.array(z.string()).max(15),
  competitivePosition: z.string().min(10).max(2000),
  growthTrajectory: z.string().min(10).max(2000),
  redFlags: z.array(z.string()).max(10),
  informationGaps: z.array(z.string()).max(10),
});

export const followUpSchema = z.object({
  subject: z.string().min(5).max(200),
  body: z.string().min(50).max(5000),
  sendAfterDays: z.number().int().min(1).max(30),
  followUpSequence: z.array(z.object({
    sequenceNumber: z.number().int().min(1),
    title: z.string().min(3),
    days: z.number().int().min(1),
    template: z.string().min(20),
  })).max(5),
  personalizations: z.array(z.string()).max(10),
  cta: z.string().min(10).max(500),
});

export const networkingSchema = z.object({
  networkAnalysis: z.object({
    strongTies: z.array(z.string()).max(20),
    weakTies: z.array(z.string()).max(30),
    coldProspects: z.array(z.string()).max(20),
  }),
  outreachStrategy: z.object({
    warmIntroductions: z.array(z.string()).max(10),
    coldOutreach: z.string().min(10).max(2000),
    priority: z.string().min(10).max(1000),
  }),
  conversationStarters: z.array(z.object({
    person: z.string(),
    commonGround: z.string(),
    ask: z.string(),
    value: z.string(),
  })).max(20),
  followUpSequence: z.array(z.string()).max(10),
});

export const roleIntelligenceSchema = z.object({
  inferredRoleTitle: z.string().min(3).max(100),
  overallConfidence: z.number().min(0).max(100),
  archetypes: z.array(z.object({
    archetype: z.enum(['Builder', 'Operator', 'Strategist', 'Maintainer', 'Optimizer', 'Researcher', 'Executor', 'Process Scaler', 'Systems Integrator', 'Customer-Facing Translator', 'Technical Lead', 'Transformation Driver']),
    weight: z.number().min(0).max(1)
  })).min(1).max(12),
  requirements: z.array(z.object({
    type: z.enum(['hard', 'soft']),
    originalText: z.string().min(5),
    normalizedText: z.string().min(5),
    confidence: z.number().min(0).max(100),
    deconstruction: z.object({
      tools: z.array(z.string()),
      decisions: z.array(z.string()),
      outputs: z.array(z.string()),
      metrics: z.array(z.string()),
      ownership: z.string(),
      operationalComplexity: z.string(),
      collaborationSurfaceArea: z.string(),
      businessImpact: z.string(),
      executionCadence: z.string(),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    })
  })).min(1),
  businessProblems: z.array(z.object({
    problemArea: z.string().min(3),
    description: z.string().min(10),
    inferredFriction: z.string().min(5),
    urgencySignal: z.string().min(5)
  })).min(1),
  signals: z.array(z.object({
    type: z.enum(['decision_ownership', 'operational_scope', 'execution_complexity', 'systems_responsibility', 'reporting_structure', 'organizational_leverage']),
    description: z.string(),
    value: z.string()
  }))
});

export const fitAnalysisSchema = z.object({
  strengths: z.array(z.object({
    problemArea: z.string().min(3),
    capabilityName: z.string().min(2),
    candidateProof: z.string().min(10),
    employerInterpretation: z.string().min(5),
    measurableOutcome: z.string().min(3),
    businessImpact: z.string().min(5),
    scale: z.string().optional(),
    decisionOwnership: z.string().optional(),
    operationalComplexity: z.string().optional(),
    systemsInfluenced: z.string().optional(),
    stakeholderLevel: z.string().optional(),
    repeatability: z.string().optional(),
    priorityLevel: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })).min(1)
});

export const strengthMapperSchema = z.object({
  strengths: z.array(z.object({
    problemArea: z.string().min(3),
    capabilityName: z.string().min(2),
    candidateProof: z.string().min(10),
    employerInterpretation: z.string().min(5),
    measurableOutcome: z.string().min(3),
    businessImpact: z.string().min(5),
    scale: z.string().optional(),
    decisionOwnership: z.string().optional(),
    operationalComplexity: z.string().optional(),
    systemsInfluenced: z.string().optional(),
    stakeholderLevel: z.string().optional(),
    repeatability: z.string().optional(),
    priorityLevel: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })).min(1)
});

export const gapAnalyzerSchema = z.object({
  gaps: z.array(z.object({
    type: z.enum(['trainable', 'credibility-killing', 'domain-depth']),
    description: z.string().min(5),
    penaltyLevel: z.enum(['LOW', 'SEVERE', 'CRITICAL']),
    adaptationCost: z.number().min(0).max(100),
    mitigationStrategy: z.string().min(5)
  })),
  adaptationBurdenScore: z.number().min(0).max(100),
  learningCurveSummary: z.string().min(10)
});

export const conversionScorerSchema = z.object({
  dimensions: z.array(z.object({
    dimension: z.enum(['executionProof', 'businessProblemAlignment', 'responsibilityOverlap', 'immediateContribution', 'domainFamiliarity', 'archetypeAlignment', 'adjacentSkillTransfer', 'strategicImpact', 'toolOverlap', 'keywordOverlap']),
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    evidence: z.array(z.string()),
    reasoning: z.string().min(5)
  })).min(10).max(10),
  credibilityRiskLevel: z.enum(['NONE', 'LOW', 'MODERATE', 'HIGH', 'EXTREME', 'FRAUDULENT']),
  adaptationBurdenLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'EXTREME']),
  reasoning: z.string().min(10)
});

export const patternMinerSchema = z.object({
  entries: z.array(z.object({
    roleArchetype: z.string(),
    operationalKeywords: z.array(z.string()),
    businessProblems: z.array(z.string()),
    successMetrics: z.array(z.string()),
    languagePatterns: z.array(z.string()),
    achievementsMapped: z.array(z.string()),
    successScore: z.number().min(0).max(100)
  }))
});
