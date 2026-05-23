export { InterviewPrepWorkspace as InterviewPrep } from '@/components/InterviewPrep/InterviewPrepWorkspace';
export { MockInterview } from '@/components/InterviewPrep/MockInterview';
export { BehavioralStories } from '@/components/InterviewPrep/BehavioralStories';
export { CompanyIntelligence } from '@/components/InterviewPrep/CompanyIntelligence';
export { TechnicalPrep } from '@/components/InterviewPrep/TechnicalPrep';
export { SystemDesignTab } from '@/components/InterviewPrep/SystemDesignTab';
export { RoleBreakdown } from '@/components/InterviewPrep/RoleBreakdown';
export { ResumeAlignment } from '@/components/InterviewPrep/ResumeAlignment';

export {
  useInterviewPrep,
  useInterviewPrepProgress,
  useMockInterview,
} from '@/hooks/useInterviewPrep';
export type { MockInterviewQuestion, MockInterviewSession } from '@/hooks/useInterviewPrep';

export { useInterviews } from './hooks/useInterviews';
export type { Interview } from './hooks/useInterviews';
