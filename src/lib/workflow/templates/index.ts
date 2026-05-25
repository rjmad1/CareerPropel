import type { WorkflowTemplate } from '../types';

const NEW_OPPORTUNITY_INTAKE: WorkflowTemplate = {
  id: 'new-opportunity-intake',
  displayName: 'New Opportunity Intake',
  description: 'Score, research, and assess a new job opportunity end-to-end',
  version: 1,
  steps: [
    {
      key: 'score_match',
      name: 'Score Job Match',
      type: 'agent_call',
      agentType: 'job-match',
      description: 'Evaluate alignment between candidate profile and job requirements',
    },
    {
      key: 'research_company',
      name: 'Research Company',
      type: 'agent_call',
      agentType: 'research',
      description: 'Gather company intelligence and culture signals',
    },
    {
      key: 'tailor_resume',
      name: 'Tailor Resume',
      type: 'agent_call',
      agentType: 'resume-tailor',
      contextFromSteps: { companyInfo: 'research_company.cultureSummary' },
      description: 'Optimize resume for this specific opportunity',
    },
  ],
  metadata: { category: 'discovery', estimatedMinutes: 5, tags: ['intake', 'scoring', 'research'] },
};

const TARGETED_APPLICATION_PREP: WorkflowTemplate = {
  id: 'targeted-application-prep',
  displayName: 'Targeted Application Prep',
  description: 'Research, tailor resume, and prepare for submission with approval gate',
  version: 1,
  steps: [
    {
      key: 'research_company',
      name: 'Research Company',
      type: 'agent_call',
      agentType: 'research',
      description: 'Deep-dive company intelligence before applying',
    },
    {
      key: 'tailor_resume',
      name: 'Tailor Resume',
      type: 'agent_call',
      agentType: 'resume-tailor',
      contextFromSteps: { companyInfo: 'research_company.cultureSummary' },
      description: 'Generate targeted resume variant',
    },
    {
      key: 'approve_submission',
      name: 'Review & Approve Submission',
      type: 'approval',
      approvalActionType: 'submit_document',
      approvalPayloadSource: 'tailor_resume',
      approvalRationale: 'Review tailored resume before submitting your application',
      description: 'Human review before document submission',
    },
  ],
  metadata: { category: 'application', estimatedMinutes: 10, tags: ['application', 'resume', 'approval'] },
};

const RECRUITER_FOLLOWUP: WorkflowTemplate = {
  id: 'recruiter-followup',
  displayName: 'Recruiter Follow-Up',
  description: 'Draft and send a follow-up message to the recruiter',
  version: 1,
  steps: [
    {
      key: 'draft_followup',
      name: 'Draft Follow-Up',
      type: 'agent_call',
      agentType: 'follow-up',
      description: 'Generate personalized follow-up communication',
    },
    {
      key: 'approve_followup',
      name: 'Review & Send Follow-Up',
      type: 'approval',
      approvalActionType: 'send_followup',
      approvalPayloadSource: 'draft_followup',
      approvalRationale: 'Review the drafted follow-up before it is sent to the recruiter',
      description: 'Human approval required before sending',
    },
  ],
  metadata: { category: 'communication', estimatedMinutes: 3, tags: ['followup', 'recruiter', 'communication'] },
};

const INTERVIEW_PREPARATION: WorkflowTemplate = {
  id: 'interview-preparation',
  displayName: 'Interview Preparation',
  description: 'Research company and generate comprehensive interview prep materials',
  version: 1,
  steps: [
    {
      key: 'research_company',
      name: 'Research Company',
      type: 'agent_call',
      agentType: 'research',
      description: 'Gather intelligence before interview',
    },
    {
      key: 'generate_prep',
      name: 'Generate Interview Prep',
      type: 'agent_call',
      agentType: 'interview-prep',
      contextFromSteps: { companyInfo: 'research_company.cultureSummary' },
      description: 'Create STAR stories, likely questions, and technical prep materials',
    },
  ],
  metadata: { category: 'preparation', estimatedMinutes: 8, tags: ['interview', 'preparation', 'research'] },
};

const POST_INTERVIEW_FOLLOWUP: WorkflowTemplate = {
  id: 'post-interview-followup',
  displayName: 'Post-Interview Follow-Up',
  description: 'Send a thank-you note and schedule a follow-up if no response',
  version: 1,
  steps: [
    {
      key: 'draft_thank_you',
      name: 'Draft Thank-You Note',
      type: 'agent_call',
      agentType: 'follow-up',
      description: 'Generate personalized post-interview thank-you',
    },
    {
      key: 'approve_thank_you',
      name: 'Review & Send Thank-You',
      type: 'approval',
      approvalActionType: 'send_followup',
      approvalPayloadSource: 'draft_thank_you',
      approvalRationale: 'Review thank-you note before sending to interviewer',
      description: 'Human approval before sending thank-you',
    },
    {
      key: 'wait_for_response',
      name: 'Wait for Response',
      type: 'delay',
      delayMs: 5 * 24 * 60 * 60 * 1000, // 5 business days
      description: 'Wait 5 days before second follow-up',
    },
    {
      key: 'draft_second_followup',
      name: 'Draft Second Follow-Up',
      type: 'agent_call',
      agentType: 'follow-up',
      optional: true,
      description: 'Generate secondary follow-up if no response',
    },
    {
      key: 'approve_second_followup',
      name: 'Review & Send Second Follow-Up',
      type: 'approval',
      approvalActionType: 'send_followup',
      approvalPayloadSource: 'draft_second_followup',
      approvalRationale: 'Review second follow-up before sending',
      optional: true,
      description: 'Human approval for second follow-up',
    },
  ],
  metadata: { category: 'communication', estimatedMinutes: 5, tags: ['post-interview', 'followup', 'thank-you'] },
};

const OFFER_EVALUATION: WorkflowTemplate = {
  id: 'offer-evaluation',
  displayName: 'Offer Evaluation',
  description: 'Research compensation benchmarks and generate negotiation strategy',
  version: 1,
  steps: [
    {
      key: 'research_compensation',
      name: 'Research Compensation',
      type: 'agent_call',
      agentType: 'research',
      description: 'Gather market compensation data and company context',
    },
    {
      key: 'generate_negotiation',
      name: 'Generate Negotiation Strategy',
      type: 'agent_call',
      agentType: 'interview-prep',
      contextFromSteps: { companyInfo: 'research_compensation.cultureSummary' },
      contextOverrides: { prepFocus: 'negotiation' },
      description: 'Create compensation negotiation talking points',
    },
    {
      key: 'notify_ready',
      name: 'Notify: Negotiation Package Ready',
      type: 'notification',
      notificationMessage: 'Your compensation negotiation package is ready for review',
      description: 'Alert user to review negotiation materials',
    },
  ],
  metadata: { category: 'offer', estimatedMinutes: 8, tags: ['offer', 'negotiation', 'compensation'] },
};

const NETWORKING_OUTREACH: WorkflowTemplate = {
  id: 'networking-outreach',
  displayName: 'Networking Outreach',
  description: 'Develop a networking strategy and draft outreach message',
  version: 1,
  steps: [
    {
      key: 'develop_strategy',
      name: 'Develop Networking Strategy',
      type: 'agent_call',
      agentType: 'networking',
      description: 'Identify key contacts and craft outreach approach',
    },
    {
      key: 'approve_outreach',
      name: 'Review & Send Outreach',
      type: 'approval',
      approvalActionType: 'send_outreach',
      approvalPayloadSource: 'develop_strategy',
      approvalRationale: 'Review networking outreach before sending to contacts',
      description: 'Human approval before any outreach is sent',
    },
  ],
  metadata: { category: 'networking', estimatedMinutes: 5, tags: ['networking', 'outreach', 'contacts'] },
};

const TEMPLATES: WorkflowTemplate[] = [
  NEW_OPPORTUNITY_INTAKE,
  TARGETED_APPLICATION_PREP,
  RECRUITER_FOLLOWUP,
  INTERVIEW_PREPARATION,
  POST_INTERVIEW_FOLLOWUP,
  OFFER_EVALUATION,
  NETWORKING_OUTREACH,
];

export function getTemplate(id: string): WorkflowTemplate | null {
  return TEMPLATES.find(t => t.id === id) ?? null;
}

export function listTemplates(): WorkflowTemplate[] {
  return TEMPLATES;
}
