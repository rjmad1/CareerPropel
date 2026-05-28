# Product Convergence Matrix (PRODUCT_CONVERGENCE_MATRIX.md)

This matrix tracks the functional capabilities of CareerPropel as they transition from prototype/degraded modes to production GA readiness in Phase 5. It ensures that no module remains incomplete or unvalidated.

---

## 1. Core Capability Matrix

| Capability Area | Current Status | Phase 5 GA Target | Verification Status |
| :--- | :--- | :--- | :--- |
| **ATS Optimization** | **Partial**<br>- LLM prompt analyzes resumes.<br>- Catch block uses static regex heuristics to hide errors. | **Production-Ready**<br>- Low-temperature (0.1) precise scoring.<br>- Confidence-scored degraded mode when LLM is down (returns transparent `low-confidence` fallback analysis instead of static mock). | `[ ]` Pending implementation & Jest verification |
| **Profile Intelligence** | **Partial**<br>- Client-side mock entity extraction.<br>- Client-side mock skill-gap calculation. | **Production-Ready**<br>- Asynchronous backend LLM extraction (/api/profile/extract).<br>- Production-grade PDF & DOCX binary parsing (`pdf-parse`, `mammoth`).<br>- Hybrid skill-gap detection (deterministic inventory + LLM gap recommendations). | `[ ]` Pending integration & file upload test |
| **Networking Domain** | **Partial**<br>- Workers process queue tasks.<br>- Basic event ledger logging. | **Production-Ready**<br>- Verified SSE subscription deduplication in telemetry.<br>- Failure-path tests verifying worker deadlocks and automatic connection recovery. | `[ ]` Verified by SSE test suites |
| **Continuous Appraisal** | **Partial**<br>- CRUD routes log accomplishments.<br>- AI compiles STAR review sessions. | **Production-Ready**<br>- Integrated promotion business case generation.<br>- Preserves and boldfaces every quantifiable metric.<br>- Fails-open gracefully on LLM timeouts with localized draft. | `[ ]` Staged for full integration tests |
| **Resume Lab** | **Partial**<br>- Client simulates tailor progress.<br>- AI refines experiences. | **Production-Ready**<br>- Comprehensive version-tracking of tailored CVs.<br>- Deterministic base file retrieval + AI-tailoring enrichment pipelines. | `[ ]` Validated by E2E journey tests |

---

## 2. Product Quality & User Acceptance Targets

We establish strict quality baselines for our core services to prevent regression and ensure maximum AI output accuracy:

* **Resume Processing Success**: **> 98%** of uploaded files (.pdf, .docx, .json) must be parsed successfully without causing OOMs or thread blockages.
* **Skill Extraction Precision**: **> 90%** of extracted technical and domain skills must match the raw text content without hallucinations.
* **Achievement Extraction Recall**: **> 85%** of quantifiable STAR achievements found in the document must be extracted with correct metrics and contexts.
* **Degraded Mode Accuracy**: Fallback matching scores under outage conditions must match candidate completeness within **±5%** of actual baseline scores, clearly labeled with `"source": "fallback"`.
