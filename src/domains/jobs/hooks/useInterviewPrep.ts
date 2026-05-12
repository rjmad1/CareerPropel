import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/lib/api/axiosClient';

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
      const { data } = await axiosClient.get(`/api/interview-prep/${jobId}`);
      return data;
    },
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
