# Dependency Graph

This document represents the dependency hierarchy and service relationships within CareerPropel.

---

## 1. Architectural Layers & Relationships

```mermaid
flowchart TD
    subgraph Clients["Presentation Layer (Client)"]
        UI["React UI Components (src/components/)"]
        Hooks["React Hooks (src/hooks/)"]
    end

    subgraph API["App Router API Layer (src/app/api/)"]
        Routes["API Route Handlers"]
    end

    subgraph Core["Core Business Logic (src/lib/)"]
        AgentOrch["Agent Orchestration (lib/agents/)"]
        Gov["Governance Layer (lib/governance/)"]
        DBRep["Database Repositories (lib/db/)"]
        Realtime["Realtime SSE (lib/realtime/)"]
        Queue["BullMQ Infrastructure (lib/queue/)"]
        LLM["LLM Client Wrappers (lib/llm/)"]
    end

    subgraph DB["Persistence & Caching"]
        Postgres[("PostgreSQL (Prisma)")]
        Redis[("Redis (BullMQ & Pub/Sub)")]
    end

    %% Presentation Dependencies
    UI --> Hooks
    Hooks -->|HTTP Requests| Routes

    %% API Dependencies
    Routes --> DBRep
    Routes --> AgentOrch
    Routes --> Realtime
    Routes --> Queue

    %% Core Services Dependencies
    Queue -->|Dequeues jobs| AgentOrch
    AgentOrch --> Gov
    Gov --> LLM
    Gov --> DBRep
    Realtime --> Redis
    Queue --> Redis
    DBRep --> Postgres
```

---

## 2. Protected Hotspots & Boundaries

To prevent circular dependency hazards and architectural drift, the following import rules are enforced:

- **Database Client (`src/lib/db.ts`)**: Direct database access inside frontend components or hooks is prohibited. Only `src/lib/db/` repositories and background workers may import this client.
- **LLM Provider Client (`src/lib/llm/provider.ts`)**: Provider models must adhere to the `LLMProviderClient` interface (`src/lib/llm/types.ts`) to avoid circular imports.
- **SSE Manager (`src/lib/realtime/sse-manager.ts`)**: Exposes connection instrumentation solely to cypress/playwright tests. Gated tightly behind `process.env.NODE_ENV === 'test'`.
- **Redis Client (`src/lib/redis/index.ts`)**: Shared connection factory. API handlers must not instantiate custom client pools, avoiding port/connection exhaustion.
