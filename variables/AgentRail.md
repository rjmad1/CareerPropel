[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentRail

# Variable: AgentRail

> `const` **AgentRail**: `React.FC`

Defined in: [src/components/Agent/AgentRail.tsx:32](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/components/Agent/AgentRail.tsx#L32)

AgentRail - Real-time sidebar showing all agents and their status

Layout: 2-column (w-64 list + flex-1 details)

Features:
- Real-time agent status updates via WebSocket
- Agent selection and detail expansion
- Progress bar for running agents
- Expandable logs for each agent
- Connection status indicator
- Metrics display (queue depth, confidence, tokens, last activity)

WebSocket subscriptions:
- 'agent:status' - Updates agent state
- 'agent:log' - Appends logs (keeps last 100)

Data attributes for E2E testing:
- data-cy="agent-rail"
- data-cy="agent-rail-item-{id}"
- data-cy="agent-progress-bar"
