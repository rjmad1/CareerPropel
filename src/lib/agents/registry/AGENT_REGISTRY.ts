import { AgentType } from '../prompts/prompts';

export type LifecycleState = 'REGISTERED' | 'QUEUED' | 'CLAIMED' | 'RUNNING' | 'RETRYING' | 'DEGRADED' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTERED' | 'ARCHIVED';

export interface AgentDeclaration {
  agentId: AgentType;
  purpose: string;
  ownerRuntime: 'web' | 'worker';
  requiredCapabilities: string[];
  queueBehavior: {
    queueName: string;
    priority: number; // Higher is more urgent
  };
  concurrencyPolicy: {
    maxConcurrentExecutions: number;
    throttlingEnabled: boolean;
  };
  retryPolicy: {
    maxAttempts: number;
    backoffType: 'exponential' | 'fixed';
    delayMs: number;
  };
  fallbackPolicy: {
    providerFallbackChain: string[];
    degradedBehaviorAllowed: boolean;
  };
  observabilityPolicy: {
    logLevel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    emitMetrics: boolean;
    tokenTrackingEnabled: boolean;
  };
  promptSource: string; // e.g., 'src/lib/agents/prompts/prompts.ts'
  executionTimeout: number; // ms
  featureFlags: string[];
  lifecycleState: LifecycleState;
  supportedPersonas: ('candidate' | 'recruiter' | 'hiring_manager' | 'coach')[];
  securityClassification: 'public' | 'internal' | 'restricted' | 'confidential';
  dataSensitivityLevel: 'low' | 'medium' | 'high';
}

export const AGENT_REGISTRY: Record<AgentType, AgentDeclaration> = {
  'resume-tailor': {
    agentId: 'resume-tailor',
    purpose: 'Tailor accomplishments and professional summary to fit job descriptions.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation', 'pdf:parsing'],
    queueBehavior: { queueName: 'executionQueue', priority: 3 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 5000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: false },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 60000,
    featureFlags: ['enable-resume-tailor'],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'high',
  },
  'job-match': {
    agentId: 'job-match',
    purpose: 'Evaluate fit between candidate profile and job description.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 2 },
    concurrencyPolicy: { maxConcurrentExecutions: 10, throttlingEnabled: false },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 3000 },
    fallbackPolicy: { providerFallbackChain: ['nvidia-nim', 'anthropic'], degradedBehaviorAllowed: true },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 30000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'medium',
  },
  'interview-prep': {
    agentId: 'interview-prep',
    purpose: 'Generate interview preparation plans, questions, and STAR stories.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 3 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 5000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: false },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 90000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'medium',
  },
  'research': {
    agentId: 'research',
    purpose: 'Perform company profile and market research.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation', 'search:web'],
    queueBehavior: { queueName: 'executionQueue', priority: 2 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 4, backoffType: 'exponential', delayMs: 5000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: true },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 120000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'low',
  },
  'follow-up': {
    agentId: 'follow-up',
    purpose: 'Generate personalized follow-up correspondence templates.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 1 },
    concurrencyPolicy: { maxConcurrentExecutions: 10, throttlingEnabled: false },
    retryPolicy: { maxAttempts: 2, backoffType: 'fixed', delayMs: 2000 },
    fallbackPolicy: { providerFallbackChain: ['nvidia-nim', 'anthropic'], degradedBehaviorAllowed: true },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 30000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'medium',
  },
  'networking': {
    agentId: 'networking',
    purpose: 'Generate networking strategies and prioritized outreach prospects.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 1 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: false },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 4000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: true },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 45000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'medium',
  },
  'role-intelligence': {
    agentId: 'role-intelligence',
    purpose: 'Analyze target job requirements and categorize roles into archetypes.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 2 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 4000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: false },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 60000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'medium',
  },
  'fit-analysis': {
    agentId: 'fit-analysis',
    purpose: 'Translate candidate achievements into target employer language.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 2 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 5000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: false },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 60000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'high',
  },
  'strength-mapper': {
    agentId: 'strength-mapper',
    purpose: 'Correlate candidate capabilities with employer business bottlenecks.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 2 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 4000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: false },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 60000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'high',
  },
  'conversion-scorer': {
    agentId: 'conversion-scorer',
    purpose: 'Score candidate across 10 dimensions to yield a conversion probability score.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 3 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 5000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: false },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 60000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'high',
  },
  'gap-analyzer': {
    agentId: 'gap-analyzer',
    purpose: 'Identify trainable and credibility-killing gaps in candidate background.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 2 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: true },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 4000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: false },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 60000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'high',
  },
  'pattern-miner': {
    agentId: 'pattern-miner',
    purpose: 'Mine success patterns from matching accomplishments.',
    ownerRuntime: 'worker',
    requiredCapabilities: ['llm:generation'],
    queueBehavior: { queueName: 'executionQueue', priority: 1 },
    concurrencyPolicy: { maxConcurrentExecutions: 5, throttlingEnabled: false },
    retryPolicy: { maxAttempts: 3, backoffType: 'exponential', delayMs: 5000 },
    fallbackPolicy: { providerFallbackChain: ['anthropic', 'nvidia-nim'], degradedBehaviorAllowed: true },
    observabilityPolicy: { logLevel: 'INFO', emitMetrics: true, tokenTrackingEnabled: true },
    promptSource: 'src/lib/agents/prompts/prompts.ts',
    executionTimeout: 60000,
    featureFlags: [],
    lifecycleState: 'REGISTERED',
    supportedPersonas: ['candidate', 'coach'],
    securityClassification: 'internal',
    dataSensitivityLevel: 'high',
  },
};
