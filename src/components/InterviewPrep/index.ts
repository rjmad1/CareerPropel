/**
 * Interview Preparation Components
 *
 * This module exports all interview preparation UI components
 * for the Career Propel application.
 *
 * Components:
 * - InterviewPrepWorkspace: Main container with tabbed interface
 * - CompanyIntelligence: Company research and market analysis
 * - RoleBreakdown: Role requirements, responsibilities, and career path
 * - BehavioralStories: STAR framework stories with competency mapping
 * - TechnicalPrep: Algorithm, data structure, and technical problem practice
 * - SystemDesignTab: System design patterns, scaling, and architecture
 * - ResumeAlignment: Resume fit analysis and tailoring recommendations
 * - MockInterview: Interview simulation with feedback and scoring
 */

export { InterviewPrepWorkspace, default as InterviewPrepWorkspaceDefault } from './InterviewPrepWorkspace';
export { CompanyIntelligence, default as CompanyIntelligenceDefault } from './CompanyIntelligence';
export { RoleBreakdown, default as RoleBreakdownDefault } from './RoleBreakdown';
export { BehavioralStories, default as BehavioralStoriesDefault } from './BehavioralStories';
export { TechnicalPrep, default as TechnicalPrepDefault } from './TechnicalPrep';
export { SystemDesignTab, default as SystemDesignTabDefault } from './SystemDesignTab';
export { ResumeAlignment, default as ResumeAlignmentDefault } from './ResumeAlignment';
export { MockInterview, default as MockInterviewDefault } from './MockInterview';

// Default export for convenience
export { InterviewPrepWorkspace as default } from './InterviewPrepWorkspace';