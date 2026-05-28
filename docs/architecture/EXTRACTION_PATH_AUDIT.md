# Extraction Path Audit (EXTRACTION_PATH_AUDIT.md)

This audit establishes a clear technical blueprint for refactoring the CareerPropel document parsing and extraction pipeline, moving it from mock/simulated behaviors to a resilient, production-grade **hybrid deterministic + AI enrichment architecture**.

---

## 1. Inventory of Existing Extraction Pathways

An audit of the active codebase reveals the following existing services, helpers, and routes handling profile extraction and parsing:

| File / Component | Category | Current Implementation Details | Gaps Identified |
| :--- | :--- | :--- | :--- |
| `src/lib/profile/parser.ts` | **Parsing** | Simulates document text parsing delays and returns hardcoded experience strings based on extension type. | **Critical Block**: Pure simulation. Does not parse real PDF or DOCX file bytes. |
| `src/lib/profile/extractor.ts` | **Extraction** | Runs static regex matching against hardcoded patterns (e.g. `Next.js`, `reduced latency`, `Bachelor of Science`) and injects fallbacks if empty. | **Critical Block**: Simplistic regex matches; misses complex phrases, structured data, and non-matched keywords. |
| `src/lib/profile/skill-extractor.ts` | **Extraction** | Deterministic token-matching against a static catalog dictionary of 12 skills (e.g. `react`, `typescript`, `agile`). | **Limited Scope**: Incapable of parsing skills outside the static enums. |
| `src/lib/profile/normalizer.ts` | **Normalization** | Simple word formatting helpers for skills. | Lacks semantic synonyms or alias grouping. |
| `src/app/api/profile/entities/route.ts` | **API Route** | Saves or fetches `ProfileData` entries in PostgreSQL. | Primarily used as an upsert/store, not for runtime extraction. |
| `src/app/api/profile/ats-check/route.ts` | **API Route** | Analyzes resume text for ATS optimization. Falls back to a regex-based heuristic score upon LLM failure. | **Heuristic Fallback**: Catch-block uses fake score calculation. |

---

## 2. Refactoring Blueprint: Layered Hybrid Parsing Chain

We reject the "pure LLM" approach where raw binary uploads are sent to the AI directly. Instead, we implement a resilient, two-tiered processing pipeline that guarantees document parsing works even when external AI providers are offline.

```
[Uploaded Document File]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ LAYER 1: Production-Grade Deterministic Parsing       │
│ - pdf-parse: extracts plain text from binary PDF bytes │
│ - mammoth: extracts text from DOCX documents           │
│ - JSON: parses structured LinkedIn JSON exports        │
└────────────────────────────────────────────────────────┘
       │
       ▼ (Resilient Plain Text Output)
┌────────────────────────────────────────────────────────┐
│ LAYER 2: Deterministic Extraction & Dictionary Match    │
│ - Extracts skills via advanced regex/keyword catalog   │
│ - Flags contact info, structures experience sections   │
└────────────────────────────────────────────────────────┘
       │
       ├──────────────────────────────────────────┐
       ▼ (Optional AI Enrichment Success)         ▼ (LLM Outage/Degraded Mode)
┌────────────────────────────────────────┐  ┌────────────────────────────────────┐
│ LAYER 3: AI-Powered Enrichment         │  │ LAYER 3: Degraded Mode Fallback   │
│ - Refines accomplishments to STAR      │  │ - Preserves Layer 1 & 2 extractions│
│ - Computes multi-dimensional ATS score │  │ - Clearly flags: "source: fallback"│
│ - Infers complex role mappings via AI  │  │ - Confidence: "low" (estimated)    │
└────────────────────────────────────────┘  └────────────────────────────────────┘
```

### Layer 1: Production-Grade Deterministic Document Parsing
We are replacing the simulated file reader in `src/lib/profile/parser.ts` with real, production-grade binary extractors:
- **`pdf-parse`**: To read binary buffer streams from PDF uploads and extract structural plain text.
- **`mammoth`**: To convert office DOCX files into clean plain text.
- **`JSON.parse`**: Handles direct parsing of LinkedIn export payloads.

### Layer 2: Deterministic Extraction (Always Available)
- Run localized regular expressions and robust token parsing from `src/lib/profile/skill-extractor.ts` and `src/lib/profile/extractor.ts` to identify candidates' names, contact info, standard skills, and years of experience.
- This creates the baseline profile structure. **This path is entirely local and 100% reliable.**

### Layer 3: AI Enrichment (Best-Effort & High-Quality)
- When the LLM provider is online, it takes the deterministic plain text from Layer 1 and performs **semantic enrichment**:
  - Automatically refines raw bullet points into highly compelling STAR accomplishments.
  - Identifies implicit capabilities, gaps, and recommendations.
  - Normalizes skills and aligns keywords to job descriptions.
- **Degraded Mode Protection**: If the LLM provider times out, throws an error, or the rate limit is hit, the pipeline **fails-open gracefully**. It saves the deterministic profile baseline from Layer 2, marked with:
  ```json
  {
    "source": "fallback",
    "confidence": "low",
    "score": 60,
    "reason": "AI enrichment temporarily offline — displaying deterministic local extraction."
  }
  ```
  This guarantees that the user's resume upload **never breaks** and onboarding is never blocked.
