/**
 * Design System Tokens
 * Central source of truth for colors, spacing, typography, and other design values
 */

export const COLORS = {
  // Semantic Colors
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  primaryDark: '#1E40AF',
  
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  
  warning: '#F97316',
  warningLight: '#FED7AA',
  warningDark: '#EA580C',
  
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',
  
  info: '#06B6D4',
  infoLight: '#CFFAFE',
  infoDark: '#0891B2',

  // Neutral Grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Pipeline Stage Colors (14 stages)
  stageSourced: '#9CA3AF',
  stageInterested: '#3B82F6',
  stageResumeTailoring: '#A78BFA',
  stageApplied: '#6366F1',
  stageRecruiterScreen: '#06B6D4',
  stageHiringManager: '#14B8A6',
  stageTechnicalInterview: '#10B981',
  stageSystemDesign: '#059669',
  stageBehavioral: '#84CC16',
  stageFinalRound: '#EAB308',
  stageOffer: '#F97316',
  stageNegotiation: '#EF4444',
  stageRejected: '#64748B',
  stageArchived: '#A1A1A1',

  // Backgrounds & Surfaces
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
}

export const SPACING = {
  0: '0',
  1: '0.5rem',
  2: '1rem',
  3: '1.5rem',
  4: '2rem',
  5: '2.5rem',
  6: '3rem',
  8: '4rem',
  10: '5rem',
  12: '6rem',
  16: '8rem',
  20: '10rem',
  24: '12rem',
  32: '16rem',
}

export const TYPOGRAPHY = {
  // Headings
  h1: { fontSize: '32px', fontWeight: 700, lineHeight: '1.25' },
  h2: { fontSize: '24px', fontWeight: 600, lineHeight: '1.33' },
  h3: { fontSize: '20px', fontWeight: 600, lineHeight: '1.4' },
  h4: { fontSize: '16px', fontWeight: 600, lineHeight: '1.5' },
  h5: { fontSize: '14px', fontWeight: 600, lineHeight: '1.57' },
  
  // Body
  body: { fontSize: '14px', fontWeight: 400, lineHeight: '1.57' },
  bodySmall: { fontSize: '12px', fontWeight: 400, lineHeight: '1.67' },
  bodyCode: { fontSize: '13px', fontWeight: 500, lineHeight: '1.5' },
}

export const SHADOWS = {
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0px 20px 25px -5px rgba(0, 0, 0, 0.1)',
}

export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
}

export const BREAKPOINTS = {
  mobile: '375px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1440px',
}

export const KANBAN_STAGES = [
  { id: 'sourced', label: 'Sourced', color: COLORS.stageSourced, order: 1 },
  { id: 'interested', label: 'Interested', color: COLORS.stageInterested, order: 2 },
  { id: 'resume-tailoring', label: 'Resume Tailoring', color: COLORS.stageResumeTailoring, order: 3 },
  { id: 'applied', label: 'Applied', color: COLORS.stageApplied, order: 4 },
  { id: 'recruiter-screen', label: 'Recruiter Screen', color: COLORS.stageRecruiterScreen, order: 5 },
  { id: 'hiring-manager', label: 'Hiring Manager', color: COLORS.stageHiringManager, order: 6 },
  { id: 'technical-interview', label: 'Technical Interview', color: COLORS.stageTechnicalInterview, order: 7 },
  { id: 'system-design', label: 'System Design', color: COLORS.stageSystemDesign, order: 8 },
  { id: 'behavioral', label: 'Behavioral', color: COLORS.stageBehavioral, order: 9 },
  { id: 'final-round', label: 'Final Round', color: COLORS.stageFinalRound, order: 10 },
  { id: 'offer', label: 'Offer', color: COLORS.stageOffer, order: 11 },
  { id: 'negotiation', label: 'Negotiation', color: COLORS.stageNegotiation, order: 12 },
  { id: 'rejected', label: 'Rejected', color: COLORS.stageRejected, order: 13 },
  { id: 'archived', label: 'Archived', color: COLORS.stageArchived, order: 14 },
] as const

export type StageId = typeof KANBAN_STAGES[number]['id']
