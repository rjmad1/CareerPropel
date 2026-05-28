# Queue Job Execution Flow

This document details the lifecycle of a BullMQ job execution.

---

## Job State Transition Lifecycle

```mermaid
stateDiagram-m
    [*] --> Waiting : API triggers queue.add()
    Waiting --> Active : Worker picks up job
    
    state Active {
        [*] --> Executing : Start processor
        Executing --> CallLLM : Call provider
        CallLLM --> ValidateResponse : Run governance checks
        ValidateResponse --> [*]
    }
    
    Active --> Completed : Processor returns success
    Active --> Failed : Processor throws error
    
    Failed --> Delayed : Retry attempt < limit (exponential backoff)
    Delayed --> Waiting : Backoff delay expires
    
    Failed --> DLQ : Retry attempt >= limit
    DLQ --> [*]
    Completed --> [*]
```
