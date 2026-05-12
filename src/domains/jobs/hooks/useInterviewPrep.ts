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

export function useInterviewPrep(jobId: string) {
  return useQuery<PrepData, Error>({
    queryKey: ['interview-prep', jobId],
    queryFn: async () => {
      // TODO: Implement API call in Phase 2
      // const response = await apiClient.get(`/api/interview-prep/${jobId}`);
      // return response as unknown as PrepData;
      return {
        starStories: [],
        technicalConcepts: [],
        companyIntelligence: {
          mission: '',
          recentNews: [],
          culture: '',
        },
        likelyQuestions: [],
      } as PrepData;
    },
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
