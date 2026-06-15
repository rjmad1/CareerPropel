# Career Propel - Architecture Handbook

This document serves as the high-fidelity Architecture Handbook for **Career Propel**, mapping out the system topology, execution flows, real-time communications, and security scaffolding.

---

## 1. High-Level System Topology

Career Propel is a monolithic Next.js App Router application backed by a custom Node.js sidecar server (`server.js`) for persistent WebSocket (Socket.io) connections, utilizing Redis as an intermediary pub/sub bridge and PostgreSQL via Prisma ORM for data storage.

```mermaid
graph TB
    subgraph Client ["Client Layer (Browser)"]
        React["Next.js React Frontend"]
        Zustand["Zustand Client State"]
        ReactQuery["TanStack Query"]
        WSClient["Socket.io Client"]
        SSEClient["SSE EventSource"]
    end

    subgraph AppServer ["Application Server (Next.js Node.js Runtime)"]
        APIGateway["API Routing Gateway"]
        AuthMiddleware["NextAuth & RBAC Middleware"]
        RateLimiter["Redis Lua Rate Limiter"]
        
        subgraph Domains ["Core Domains"]
            JobsDomain["Jobs & Match Engine"]
            InterviewPrepDomain["Interview Prep Engine"]
            ResumeLabDomain["Resume Editor Engine"]
            ScrapingDomain["Playwright Scraping Engine"]
        end

        WSServer["Socket.io WebSocket Server (server.js)"]
        BullMQWorker["BullMQ Execution Worker"]
    end

    subgraph CacheStore ["Cache & Pub/Sub Store"]
        RedisStore[("ioredis Store")]
        RedisPubSub["Redis Pub/Sub Channel"]
    end

    subgraph DataStore ["Persistence Store"]
        Postgres[("PostgreSQL Database")]
        PrismaORM["Prisma Client Client"]
    end

    subgraph ExternalServices ["External APIs & LLM Providers"]
        AnthropicAPI["Anthropic Claude API"]
        NvidiaNIM["Nvidia NIM Engine"]
        ResendAPI["Resend Email API"]
        OAuthProviders["Google & Microsoft OAuth"]
    end

    %% Routing
    React --> APIGateway
    APIGateway --> AuthMiddleware --> RateLimiter
    RateLimiter --> Domains
    
    %% Realtime Transport
    WSClient <-->|WebSocket| WSServer
    SSEClient <-->|SSE Stream| APIGateway
    
    %% Redis Bridging
    APIGateway <--> RedisStore
    WSServer <--> RedisPubSub
    BullMQWorker <--> RedisPubSub
    
    %% DB Access
    Domains --> PrismaORM
    BullMQWorker --> PrismaORM
    PrismaORM <--> Postgres
    
    %% Worker & AI Execution
    BullMQWorker --> AnthropicAPI
    BullMQWorker --> NvidiaNIM
    Domains --> ResendAPI
    Domains --> OAuthProviders
```

---

## 2. Agent Execution Flow (BullMQ Architecture)

The system leverages BullMQ on Redis for asynchronous, robust, and stateful agent execution with automatic concurrency gates, retry policies, and dead-letter queue (DLQ) support.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate Browser
    participant API as execute/route.ts
    participant DB as Prisma (PostgreSQL)
    participant Redis as Redis Queue
    participant Worker as Concurrency & Worker.ts
    participant LLM as Anthropic Claude API
    participant PubSub as Redis Pub/Sub Bridge
    participant ClientRealtime as real-time hook / Socket.io

    Candidate->>API: POST /api/agents/execute { agentType, context, jobId }
    activate API
    API->>API: getAuthContext() & rateLimiter()
    API->>DB: create AgentExecution (status: queued)
    API->>DB: create EventLog (queued action)
    API->>Redis: enqueueExecution() (BullMQ)
    API-->>Candidate: JSON { executionId, status: "queued" }
    deactivate API

    Note over Redis, Worker: Worker picks up task from queue
    activate Worker
    Worker->>Worker: acquireExecutionSlots() (Max 5 concurrent/user)
    Worker->>DB: update AgentExecution (status: running)
    Worker->>PubSub: publishRealtimeEvent("execution:started")
    PubSub-->>ClientRealtime: EventSource / socket.io broadcast
    ClientRealtime-->>Candidate: UI transition to "running" state
    
    Worker->>LLM: streamLLM() with 55s AbortSignal timeout
    activate LLM
    LLM-->>Worker: stream chunk payload
    Worker->>PubSub: publishRealtimeEvent("execution:status" with progress)
    PubSub-->>ClientRealtime: real-time progress update
    ClientRealtime-->>Candidate: Real-time editor/timeline progress update
    LLM-->>Worker: final complete payload
    deactivate LLM
    
    Worker->>Worker: releaseExecutionSlots()
    Worker->>DB: update AgentExecution (status: completed, output)
    Worker->>PubSub: publishRealtimeEvent("execution:completed")
    PubSub-->>ClientRealtime: final results payload
    ClientRealtime-->>Candidate: UI rendering of optimized result
    deactivate Worker
```

---

## 3. Dual-Transport Real-Time System

Career Propel provides robust real-time synchronization through a redundant dual-transport layer:
1. **WebSockets (Socket.io)**: Pinned to `server.js` for persistent TCP rooms, status pushes, and active typing feedback.
2. **Server-Sent Events (SSE)**: Built-in route `/api/agents/events` as a fallback transport running over stateless HTTP/2.

```mermaid
graph LR
    subgraph Client ["Client Interface"]
        CWS["Socket.io Client"]
        CSSE["EventSource (SSE)"]
    end

    subgraph Transport ["Transport Gateway"]
        Sidecar["Sidecar custom Server (server.js)"]
        NextRoute["Next.js Route /api/agents/events"]
    end

    subgraph RedisBroker ["Redis Bridging Layer"]
        PubSubChannel["Redis pub/sub bridge"]
        SharedSubscriber["Shared ioredis Subscriber"]
    end

    CWS <-->|WebSocket Connection| Sidecar
    CSSE -->|stateless GET| NextRoute

    Sidecar <-->|psubscribe 'agent:*'| PubSubChannel
    NextRoute <-->|read event snapshot| SharedSubscriber
    SharedSubscriber <--> PubSubChannel
```

---

## 4. Encryption & Security Standards

To meet enterprise compliance guidelines, all candidate credentials and authentication integrations are hardened:
- **TOTP secrets**: AES-GCM encrypted in database.
- **Internal API Keys**: bcrypt-hashed with unique prefix indexing.
- **Google / Outlook OAuth Tokens**: AES-256-GCM encrypted at rest using the derived `CALENDAR_ENCRYPTION_KEY`.
