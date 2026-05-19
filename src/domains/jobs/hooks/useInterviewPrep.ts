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

function transformToPrepData(prep: any): PrepData {
  const starStories = (prep.starStories ?? []).map((s: any) => ({
    title: s.title ?? s.competency ?? '',
    situation: s.situation ?? '',
    task: s.task ?? '',
    action: s.action ?? '',
    result: s.result ?? '',
  }));

  const technicalPrep = prep.technicalPrep ?? {};
  const languages: Array<{ language: string; keyFeatures: string[] }> =
    technicalPrep.programmingLanguages ?? [];
  const technicalConcepts = languages.map((l: any) => ({
    topic: l.language ?? l.name ?? '',
    keyPoints: l.keyFeatures ?? l.commonPatterns ?? [],
  }));

  const companyResearch = prep.companyResearch ?? {};
  const recentNews: string[] = (companyResearch.recentNews ?? []).map(
    (n: any) => (typeof n === 'string' ? n : n.title ?? '')
  );

  return {
    starStories,
    technicalConcepts,
    companyIntelligence: {
      mission: companyResearch.culture ?? companyResearch.fundingStatus ?? '',
      recentNews,
      culture: companyResearch.culture ?? '',
    },
    likelyQuestions: starStories.flatMap((_: any, i: number) => {
      const story = prep.starStories?.[i];
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
