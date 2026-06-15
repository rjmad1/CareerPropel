'use client';

import { useState, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Workspace } from '@/components/RoleIntelligence/Workspace';
import { Spinner, Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

function RoleIntelligenceContent() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  const jobId = typeof params?.jobId === 'string' ? params.jobId : '';
  const [isTriggering, setIsTriggering] = useState<Record<string, boolean>>({});

  // Fetch job & intelligence details
  const { data = null, error, refetch } = useQuery({
    queryKey: ['role-intelligence', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}/role-intelligence`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load role intelligence workspace');
      }
      return res.json();
    },
    enabled: !!jobId && status === 'authenticated',
    // Polling is dynamic: every 3s if any agent is running, otherwise manually refreshed or every 30s
    refetchInterval: (query) => {
      const state = query.state.data as any;
      const anyRunning = state?.executions?.some(
        (e: any) => e.status === 'running' || e.status === 'queued'
      );
      return anyRunning ? 3000 : 30000;
    }
  });

  // Mutation to trigger an agent
  const triggerMutation = useMutation({
    mutationFn: async (agentType: string) => {
      setIsTriggering(prev => ({ ...prev, [agentType]: true }));
      const res = await fetch(`/api/jobs/${jobId}/role-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to trigger ${agentType} agent`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-intelligence', jobId] });
    },
    onSettled: (_data, _error, variables) => {
      setIsTriggering(prev => ({ ...prev, [variables]: false }));
    }
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleTriggerAgent = async (agentType: string) => {
    try {
      await triggerMutation.mutateAsync(agentType);
    } catch (err: any) {
      console.error('Trigger agent failed:', err);
    }
  };

  return (
    <NavLayout
      title="Role Intelligence Workspace"
      subtitle="Operational deconstruction and evidence-based fit evaluation dashboard"
    >
      <div className="h-full flex flex-col bg-slate-50 min-h-screen pb-12">
        {/* Toolbar Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
            type="button"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Pipeline</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace Active</span>
          </div>
        </div>

        {/* Workspace body */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 min-h-0">
          {error ? (
            <Card className="border-rose-100 bg-rose-50/50">
              <CardBody className="p-8 text-center space-y-4">
                <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
                <h3 className="text-sm font-bold text-rose-800">Workspace Loading Failed</h3>
                <p className="text-xs text-rose-600 font-medium max-w-md mx-auto">
                  {error instanceof Error ? error.message : 'An unexpected error occurred while compiling your dashboard.'}
                </p>
                <Button size="sm" onClick={() => refetch()} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                  Retry Loading
                </Button>
              </CardBody>
            </Card>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <Spinner size="md" className="text-blue-600" />
              <p className="text-xs font-bold text-slate-500 animate-pulse">Initializing Decision Engine Workspace...</p>
            </div>
          ) : (
            <Workspace
              jobId={jobId}
              data={data}
              onTriggerAgent={handleTriggerAgent}
              isTriggering={isTriggering}
            />
          )}
        </div>
      </div>
    </NavLayout>
  );
}

export default function RoleIntelligencePage() {
  return (
    <Suspense
      fallback={
        <NavLayout title="Role Intelligence Workspace" subtitle="Loading Workspace...">
          <div className="flex justify-center items-center h-96">
            <Spinner size="md" className="text-blue-600" />
          </div>
        </NavLayout>
      }
    >
      <RoleIntelligenceContent />
    </Suspense>
  );
}
