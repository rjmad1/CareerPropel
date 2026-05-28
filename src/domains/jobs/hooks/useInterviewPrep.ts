import { useQuery } from '@tanstack/react-query';

export interface PrepData {
  starStories: Array<{
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }>;
  technicalConcepts: Array<{
    topic: string;
    keyPoints: string[];
  }>;
  companyIntelligence: {
    mission: string;
    recentNews: string[];
    culture: string;
  };
  likelyQuestions: string[];
}

type RawPrep = Record<string, unknown>;
type RawStory = { title?: string; competency?: string; situation?: string; task?: string; action?: string; result?: string; interviewQuestions?: string[] };
type RawLang = { language?: string; name?: string; keyFeatures?: string[]; commonPatterns?: string[] };
type RawNews = string | { title?: string };

function transformToPrepData(prep: RawPrep): PrepData {
  const starStories = ((prep.starStories ?? []) as RawStory[]).map((s) => ({
    title: s.title ?? s.competency ?? '',
    situation: s.situation ?? '',
    task: s.task ?? '',
    action: s.action ?? '',
    result: s.result ?? '',
  }));

  const technicalPrep = prep.technicalPrep ?? {};
  const languages: RawLang[] = (technicalPrep as Record<string, unknown>).programmingLanguages as RawLang[] ?? [];
  const technicalConcepts = languages.map((l) => ({
    topic: l.language ?? l.name ?? '',
    keyPoints: l.keyFeatures ?? l.commonPatterns ?? [],
  }));

  const companyResearch = prep.companyResearch as Record<string, unknown> | null ?? {};
  const recentNews: string[] = (companyResearch.recentNews as RawNews[] ?? []).map(
    (n) => (typeof n === 'string' ? n : n.title ?? '')
  );

  return {
    starStories,
    technicalConcepts,
    companyIntelligence: {
      mission: (companyResearch.culture as string | undefined) ?? (companyResearch.fundingStatus as string | undefined) ?? '',
      recentNews,
      culture: (companyResearch.culture as string | undefined) ?? '',
    },
    likelyQuestions: starStories.flatMap((_, i: number) => {
      const story = (prep.starStories as RawStory[] | undefined)?.[i];
      return story?.interviewQuestions ?? [];
    }),
  };
}

export function useInterviewPrep(jobId: string) {
  return useQuery<PrepData, Error>({
    queryKey: ['interview-prep', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/interview-prep/${jobId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 404) {
        return {
          starStories: [],
          technicalConcepts: [],
          companyIntelligence: { mission: '', recentNews: [], culture: '' },
          likelyQuestions: [],
        };
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch interview prep: ${response.statusText}`);
      }

      const json = await response.json();
      // API returns { data: InterviewPrep, success: true }
      const prep = json.data ?? json;
      return transformToPrepData(prep);
    },
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
