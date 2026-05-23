import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgentType } from '@/types/agent';
import axios from 'axios';

export interface AgentExecutionSummary {
  id: string;
  agentType: AgentType;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  output?: Record<string, any>;
  errorMessage?: string;
  tokenCount?: number;
  durationMs?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentExecutionsPage {
  executions: AgentExecutionSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExecuteAgentInput {
  agentType: AgentType;
  context?: Record<string, string | undefined>;
}

export interface ExecuteAgentResult {
  executionId: string;
  status: 'queued';
  message: string;
}

export const agentsQueryKeys = {
  all: ['agents'] as const,
  executions: () => [...agentsQueryKeys.all, 'executions'] as const,
  executionList: (params?: { status?: string; page?: number; pageSize?: number }) =>
    [...agentsQueryKeys.executions(), params] as const,
  execution: (id: string) => [...agentsQueryKeys.all, 'execution', id] as const,
};

async function fetchExecutions(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<AgentExecutionsPage> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  query.append('page', String(params?.page ?? 0));
  query.append('pageSize', String(params?.pageSize ?? 20));

  const { data } = await axios.get<AgentExecutionsPage>(
    `/api/agents/executions?${query.toString()}`
  );
  return data;
}

async function fetchExecution(id: string): Promise<AgentExecutionSummary> {
  const { data } = await axios.get<AgentExecutionSummary>(
    `/api/agents/execute?executionId=${encodeURIComponent(id)}`
  );
  return data;
}

async function executeAgent(input: ExecuteAgentInput): Promise<ExecuteAgentResult> {
  const { data } = await axios.post<ExecuteAgentResult>('/api/agents/execute', input);
  return data;
}

export function useAgentExecutions(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: agentsQueryKeys.executionList(params),
    queryFn: () => fetchExecutions(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 10 * 1000,
  });
}

export function useAgentExecution(id: string) {
  return useQuery({
    queryKey: agentsQueryKeys.execution(id),
    queryFn: () => fetchExecution(id),
    enabled: !!id,
    staleTime: 5 * 1000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'queued' || status === 'running' ? 3000 : false;
    },
  });
}

export function useExecuteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExecuteAgentInput) => executeAgent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.executions() });
    },
  });
}

export function useAgentQueue() {
  const execute = useExecuteAgent();
  const queryClient = useQueryClient();

  const enqueue = async (agentType: AgentType, context?: Record<string, string | undefined>) => {
    const result = await execute.mutateAsync({ agentType, context });
    return result;
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: agentsQueryKeys.executions() });
  };

  return {
    enqueue,
    invalidate,
    isPending: execute.isPending,
    isSuccess: execute.isSuccess,
    isError: execute.isError,
    error: execute.error,
    lastResult: execute.data,
    reset: execute.reset,
  };
}
