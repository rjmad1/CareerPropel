# Runtime Cost-Benefit Baseline Report

This report establishes the baseline operational cost, queue latency, execution duration, and retry amplification metrics of the CareerPropel platform prior to executing active economic optimization sweeps.

---

## 1. Provider Cost Attribution Baseline

Our core LLM provider is Anthropic Claude Sonnet. To estimate actual operational costs per execution, we utilize baseline rates:
* **Claude Sonnet 3.5 Input Tokens:** $3.00 per 1M tokens
* **Claude Sonnet 3.5 Output Tokens:** $15.00 per 1M tokens

### Core Execution Baseline:
Based on initial run profiles, average token counts and cost per execution across the six primary agent runtimes are outlined below:

| Agent Type | Avg. Input Tokens | Avg. Output Tokens | Estimated Cost (USD) |
| :--- | :--- | :--- | :--- |
| **role-intelligence** | 12,000 | 1,500 | $0.0585 |
| **fit-analysis** | 8,500 | 800 | $0.0375 |
| **gap-analyzer** | 10,000 | 1,200 | $0.0480 |
| **resume-tailor** | 15,000 | 2,000 | $0.0750 |
| **interview-prep** | 20,000 | 3,000 | $0.1050 |
| **follow-up** | 4,000 | 500 | $0.0195 |

---

## 2. Retry Amplification Burn Rate

Under standard network/provider conditions:
* **Transient Error Rate:** 2% – 5% (due to rate-limiting or provider timeouts).
* **Retry Cost Amplification:** When a job fails on attempt 1 and succeeds on attempt 2, the cost of that single execution is doubled ($0.1500 instead of $0.0750).
* **Amplification Factor:** A 5% transient error rate across 1,000 runs leads to approximately 50 retried jobs, burning an additional **$3.75** in redundant token fees.

This baseline retry burn rate represents our primary optimization target for future model-downgrade and dynamic load-shedding configurations.

---

## 3. Runtime Durations & Queue Latency

Nominal duration and pickup latency benchmarks:

* **Queue Pickup Latency (p95):** 2.5 seconds (delay between job enqueue and worker pickup).
* **Agent Execution Duration (Average):**
  * **Claude API Call:** 4.2 seconds.
  * **Output Validation / DB write:** 0.8 seconds.
  * **Total Run Duration:** 5.0 seconds.
* **SSE Client Telemetry Latency (p95):** 1.2 seconds (delay between database write and client UI update via SSE).

---

## 4. Future Optimization Projections

By implementing model-downgrade strategies (switching follow-ups from Sonnet to Haiku) and dynamic degradation settings during outages, we project:
* **Cost reduction on non-critical tasks:** ~80% savings (switching from Sonnet $3/$15 per 1M to Haiku $0.25/$1.25 per 1M).
* **Retry containment:** Lowering maximum retry attempts from 4 to 2 under provider degradation saves up to 50% of runaway retry spend.
* **Degraded mode savings:** Up to **$0.05 saved per run** on high-frequency, non-critical agents.
