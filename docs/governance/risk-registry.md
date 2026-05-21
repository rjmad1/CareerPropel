# Deferred-Risk & Architectural Debt Registry

This registry tracks temporary architectural exceptions and deferred technical risks across the CareerPropel platform. Every exception recorded here is subject to strict containment controls, operational safeguards, clear ownership, and a target migration exit path.

---

## Registry Entries

### 1. Temporary Headless Scraping via Playwright

* **ID**: DEBT-001
* **Risk Classification**: Infrastructure Contamination & Worker Stability Risk
* **Owner**: Lead DevOps & Platform Engineer
* **Current Status**: **Remediated & Contained** (Moved to isolated background worker queue)
* **Expiration Date**: 2026-12-31 (Pending official OAuth partnership agreement)
* **Review Cadence**: Bi-monthly engineering architecture review

#### Risk Summary
LinkedIn and Indeed scraping relies on headless browser parsing using CSS selector selectors. This is highly fragile, susceptible to sudden UI design updates, IP rate blocks, and CAPTCHAs.

#### Containment Controls & Operational Safeguards
1. **Isolated Worker Boundary**: Playwright and Chromium execute exclusively inside a dedicated background Node worker process (`src/lib/scraping/worker.ts`). They are prohibited from loading in standard serverless API request containers.
2. **Circuit Breaker**: Trips for 10 minutes if 3 consecutive failures occur, preventing browser spin-up resource loops.
3. **Recycling Quota**: Virtual browser recycled every 10 task runs to prevent memory degradation and leaks.
4. **Rate Limits & Jitter Delay**: Enforces a 2-5 seconds random delay between crawls to prevent anti-scraping IP bans.
5. **Dynamic Kill Switch**: The environment variable `SCRAPING_GLOBAL_KILL_SWITCH` immediately shuts down all crawler spin-ups globally.

#### Exit & Migration Strategy
We are currently in negotiation for the official **LinkedIn Partner API** and standard job search APIs. Once API key tokens are granted:
1. Implement official REST client adapters satisfying `ScrapingProvider` capabilities.
2. Deprecate Playwright and Chromium dependencies entirely.
3. Decommission Redis scraping worker containers.

---

### 2. Rate-Limiting Fail-Open Policy

* **ID**: DEBT-002
* **Risk Classification**: Operational Continuity vs Denial of Service (DoS) vulnerability
* **Owner**: Infrastructure Security Architect
* **Current Status**: **Active (Governed Debt)**
* **Expiration Date**: 2026-08-31
* **Review Cadence**: Monthly Security review

#### Risk Summary
If Redis is completely unreachable or crashes, the rate-limiting middleware fails-open (allows requests through) rather than crashing the user experience (failing-closed). This maintains high availability but makes the platform vulnerable to brute-force or denial of service attacks during cache failures.

#### Containment Controls & Operational Safeguards
1. **Pino Alarm Triggers**: If Redis connection fails, the logger emits a structured `log.warn('Rate limiter Redis unavailable — failing open')` at a priority level that triggers PagerDuty alerts.
2. **Downstream Gateway Safeguards**: Cloudflare/NGINX ingress rules apply secondary coarse-grained rate limits (e.g., 500 req/10s per IP) to prevent complete platform exhaustion.

#### Exit & Migration Strategy
Implement local in-memory fallback token buckets (e.g., via `lru-cache`) inside the application route threads when Redis disconnects.

---

### 3. Asymmetric Cryptography for Master secrets

* **ID**: DEBT-003
* **Risk Classification**: Secret Management Couplings
* **Owner**: Lead Security Architect
* **Current Status**: **Active (Governed Debt)**
* **Expiration Date**: 2026-09-30
* **Review Cadence**: Quarterly security audits

#### Risk Summary
Platform secrets and user API keys are encrypted via symmetric AES-256-CBC using a master secret key stored in environment variables (`AI_MASTER_SECRET`). If the env var is leaked, all keys are vulnerable to decryption.

#### Containment Controls & Operational Safeguards
1. **Hash Partitioning**: User key hashes are kept completely separate from masked preview keys.
2. **IAM Controls**: Access to the production environment variables is heavily restricted via IAM policies.

#### Exit & Migration Strategy
Migrate key storage and encryption to an HSM (Hardware Security Module) / KMS (Key Management Service) such as AWS KMS or HashiCorp Vault.
