# Intelligent Degradation & Load Shedding Manual

This manual details how the CareerPropel platform degrades features gracefully and handles user experience visibility during upstream provider outages or system congestion.

---

## 1. Degradation State Definitions

The platform operates in three distinct health states, adapting functionality symmetrically:

### A. Nominal State (Healthy)
* All core and non-critical agent execution queues function normally.
* Main LLM models (e.g. Claude Sonnet) are used for all tasks.
* Full real-time event publishing and replay logs are active.

### B. Degraded State (Warning)
* **Provider Degradation:** Triggered when the LLM provider experiences elevated failure rates. Symmetrical load shedding suspends non-essential agents (e.g., `follow-up`, `networking`, `gap-analyzer`) while preserving critical ones.
* **UX Transparency:** Clients are notified via SSE of active provider delays.

### C. Critical State (Outage)
* **Outage Response:** Complete suspension of all execution admissions to protect candidate token budgets and prevent queue starvation.
* **Offline Mode:** Replay and queue enqueues are paused. Clients receive clear downtime notifications in the admin console.

---

## 2. User Experience Visibility & Transparency

We guarantee absolute transparency during degraded operations. When a resource is compromised:

* **Real-time Delay Flags:** If the queue depth exceeds backlog thresholds, the web UI emits a **"System Experiencing High Volume — Processing Delayed"** message.
* **Provider Outage Banners:** If the LLM provider is degraded, the client console receives an SSE event with state `degraded`, triggering a **"Upstream LLM Provider experiencing slow response times — Retries active"** banner.
* **Replay Progress Banners:** During active administrative replays, the candidate sees **"Recovery Replay in Progress — Restoring active status"** to avoid user confusion.
