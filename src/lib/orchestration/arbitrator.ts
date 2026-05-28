import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';
import { IngestionResult } from './types';
import { getWorkflowQueue, WORKFLOW_JOB_DEFAULTS, WORKFLOW_SCHEMA_VERSION } from '@/lib/workflow/queue';

export class Arbitrator {
  /**
   * Translates the dynamic DAG ingestion result into a physical WorkflowDefinition and Execution.
   */
  static async initializeWorkflow(result: IngestionResult, candidateId: string, userId: string, jobId?: string): Promise<string> {
    log.info({ title: result.title, userId }, 'Orchestration Arbitrator: Translating DAG to Workflow Execution');

    // Create a dynamic Definition Name
    const templateName = `dynamic-dag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Map Dynamic DAG Nodes to WorkflowDefinition format
    const definitionSteps = result.dag.nodes.map((node) => ({
      key: node.key,
      name: node.name,
      type: node.type,
      agentType: node.agentType,
      dependencies: node.dependencies ?? [],
      approvalActionType: node.approvalActionType,
      approvalRationale: node.approvalRationale,
      conditionField: node.conditionField,
      trueBranch: node.trueBranch,
      falseBranch: node.falseBranch,
      notificationMessage: node.notificationMessage,
      delayMs: node.delayMs,
      optional: node.optional ?? false,
    }));

    // Create the definition record
    const definition = await prisma.workflowDefinition.create({
      data: {
        name: templateName,
        displayName: result.title,
        description: result.expandedContext,
        version: 1,
        isActive: true,
        steps: definitionSteps as unknown as import('@prisma/client').Prisma.InputJsonValue,
        metadata: {
          predictedComplexity: result.predictedComplexity,
          estimatedCostUsd: result.estimatedCostUsd,
          initialPriorityScore: result.initialPriorityScore,
          governanceScore: result.governanceScore,
          riskLevel: result.riskLevel,
        } as import('@prisma/client').Prisma.InputJsonValue,
      },
    });

    const initialContext = {
      userId,
      candidateId,
      jobId: jobId ?? null,
      expandedContext: result.expandedContext,
      domain: result.domain,
    };

    // Create the workflow execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        candidateId,
        jobId: jobId ?? null,
        definitionId: definition.id,
        status: 'queued',
        currentStepIndex: 0,
        context: initialContext as import('@prisma/client').Prisma.InputJsonValue,
        triggeredBy: 'autonomous-orchestrator',
      },
    });

    // Create step execution records
    await prisma.workflowStepExecution.createMany({
      data: definitionSteps.map((step, index) => ({
        workflowId: execution.id,
        stepKey: step.key,
        stepIndex: index,
        stepType: step.type,
        status: 'pending',
      })),
    });

    // Enqueue the first step using existing queue
    await getWorkflowQueue().add(
      'workflow-step',
      {
        workflowExecutionId: execution.id,
        stepIndex: 0,
        userId,
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
      },
      WORKFLOW_JOB_DEFAULTS,
    );

    log.info({ workflowId: execution.id, candidateId }, 'Orchestration Arbitrator: Dynamic DAG workflow instantiated and queued successfully');

    return execution.id;
  }
}
