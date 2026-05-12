/**
 * Agent Configuration Presets
 *
 * Predefined configurations for all agent types in the system.
 * Used by AgentRail and agent orchestration.
 */

import { AgentConfig, AgentType } from './agent';

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  'resume-tailor': {
    type: 'resume-tailor',
    name: 'Resume Tailor',
    description: 'Customizes your resume for specific job applications',
    icon: '📄',
    color: '#3B82F6', // blue
    timeout: 60000,
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
    queueDepth: 10,
  },
  'job-match': {
    type: 'job-match',
    name: 'Job Matcher',
    description: 'Analyzes and scores job opportunities for fit',
    icon: '🎯',
    color: '#10B981', // emerald
    timeout: 45000,
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
    queueDepth: 20,
  },
  'application': {
    type: 'application',
    name: 'Application Agent',
    description: 'Handles automated job application submissions',
    icon: '✉️',
    color: '#F59E0B', // amber
    timeout: 30000,
    retryPolicy: {
      maxAttempts: 5,
      backoffMultiplier: 1.5,
      initialDelay: 500,
    },
    queueDepth: 15,
  },
  'research': {
    type: 'research',
    name: 'Research Agent',
    description: 'Gathers company intelligence and market insights',
    icon: '🔍',
    color: '#8B5CF6', // violet
    timeout: 120000,
    retryPolicy: {
      maxAttempts: 2,
      backoffMultiplier: 2,
      initialDelay: 2000,
    },
    queueDepth: 5,
  },
  'interview-prep': {
    type: 'interview-prep',
    name: 'Interview Prep',
    description: 'Generates interview preparation materials',
    icon: '🎤',
    color: '#EC4899', // pink
    timeout: 90000,
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
    queueDepth: 8,
  },
  'networking': {
    type: 'networking',
    name: 'Networking Agent',
    description: 'Manages recruiter relationships and network insights',
    icon: '🤝',
    color: '#14B8A6', // teal
    timeout: 45000,
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
    queueDepth: 12,
  },
  'follow-up': {
    type: 'follow-up',
    name: 'Follow-up Agent',
    description: 'Automates strategic follow-up communications',
    icon: '📬',
    color: '#06B6D4', // cyan
    timeout: 15000,
    retryPolicy: {
      maxAttempts: 2,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
    queueDepth: 25,
  },
  'analytics': {
    type: 'analytics',
    name: 'Analytics Agent',
    description: 'Computes career metrics and pipeline analytics',
    icon: '📊',
    color: '#6366F1', // indigo
    timeout: 120000,
    retryPolicy: {
      maxAttempts: 2,
      backoffMultiplier: 2,
      initialDelay: 2000,
    },
    queueDepth: 3,
  },
};

/**
 * Get agent configuration by type
 */
export function getAgentConfig(type: AgentType): AgentConfig {
  return AGENT_CONFIGS[type];
}

/**
 * Get all agent configurations
 */
export function getAllAgentConfigs(): AgentConfig[] {
  return Object.values(AGENT_CONFIGS);
}

/**
 * Get agents by category (for grouping in UI)
 */
export function getAgentsByCategory(category: 'automation' | 'analysis' | 'communication'): AgentConfig[] {
  const categories: Record<string, AgentType[]> = {
    automation: ['resume-tailor', 'job-match', 'application'],
    analysis: ['research', 'analytics'],
    communication: ['interview-prep', 'networking', 'follow-up'],
  };

  return categories[category]?.map(type => AGENT_CONFIGS[type]) || [];
}
