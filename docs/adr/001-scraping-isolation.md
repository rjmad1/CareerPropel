# ADR 001: Playwright Scraping Quarantine & Isolation

## Context and Problem Statement

The CareerPropel platform allows candidates to import profiles from LinkedIn and search jobs on Indeed. Historically, these features were implemented using browser automation (Playwright/Chromium) running synchronously within Next.js API routes (`POST /api/linkedin/import-profile` and `POST /api/jobs/search`).

This design introduced severe operational risks:
1. **Infrastructure Contamination**: The heavy Playwright and Chromium binaries were compiled into the standard Next.js build bundle, inflating deployment artifact sizes and risking deployment failures on Edge/Serverless platforms.
2. **Runtime Instability**: Running headful or headless Chromium processes inside high-concurrency API serverless containers caused massive memory spikes, process leaks, and container crashes.
3. **Synchronous Cascade Failures**: Slow proxy rotation, CAPTCHAs, or target DOM alterations blocked the HTTP request/response thread, leading to request timeouts and an unstable user experience.

## Proposed Decision

We isolate the Playwright browser runtime from the main Next.js application runtime using a provider-adapter abstraction and a Redis-backed background worker queue.

```
Application API Routes (Next.js)
  -> Enqueue Job Payload (correlationId)
  -> Redis Queue (decoupling boundary)
  -> Dedicated Scraping Background Worker (Node.js)
       -> Dynamically loads Playwright
       -> Executes scraping inside controlled task loop
       -> Persists results / updates DB
```

### Operational Safeguards
1. **Dynamic Import Quarantine**: The `playwright` packages are strictly declared as server components external packages and only loaded dynamically in the background worker thread.
2. **Execution Budgets & Timeouts**: A hard execution timeout limit of 45 seconds is enforced using `Promise.race` to prevent hanging orphan processes.
3. **Memory Leak Remediation**: The background worker process recycles its virtual Chromium browser pool every 10 task runs, releasing allocated heap memory.
4. **Rate-Limiting & Anti-Ban Throttling**: A random delay of 2-5 seconds is enforced between consecutive scraper tasks to prevent IP bans.
5. **Circuit Breaker Integration**: If a provider (LinkedIn or Indeed) fails 3 consecutive times, its circuit breaker trips for 10 minutes, automatically routing new requests to queues without invoking browsers.
6. **Feature Flags & Global Kill Switch**: Administrators can toggle `INDEED_SCRAPING_ENABLED` or `LINKEDIN_SCRAPING_ENABLED`, or activate `SCRAPING_GLOBAL_KILL_SWITCH` to immediately halt the entire subsystem safely.

## Consequences

* **Status**: Approved / Implemented
* **Decoupling**: Main application routes are 100% decoupled from the browser runtime, resulting in fast builds and lightweight Next.js runtime containers.
* **Resilience**: A crawler crash or ban no longer impacts standard user-facing API routes or causes app container instability.
* **Observability**: Request correlation IDs (`correlationId`) are successfully propagated into the enqueued payloads and automatically attached to worker pino logs.
