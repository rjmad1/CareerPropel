# CareerPropel — Navigation Architecture

> **Version:** 1.0  
> **Status:** Production  
> **Last Updated:** 2026-05-26

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Directory Structure](#directory-structure)
3. [Route Registry](#route-registry)
4. [URL State Standards](#url-state-standards)
5. [Restoration Patterns](#restoration-patterns)
6. [Breadcrumb System](#breadcrumb-system)
7. [Navigation Analytics](#navigation-analytics)
8. [SSE Lifecycle](#sse-lifecycle)
9. [Unsaved Changes Protection](#unsaved-changes-protection)
10. [Deep-Link Reconstruction](#deep-link-reconstruction)
11. [Mobile Behavior](#mobile-behavior)
12. [Accessibility Rules](#accessibility-rules)
13. [Anti-Patterns](#anti-patterns)
14. [Testing Strategy](#testing-strategy)

---

## Philosophy

CareerPropel navigation must feel **linear, predictable, recoverable, and workflow-centric**.

The guiding principles:

| Principle | Meaning |
|-----------|---------|
| **URL is canonical** | Critical workflow state lives in the URL, not memory. |
| **Back never lies** | Browser back button always restores exact prior state. |
| **Refresh is safe** | Every meaningful screen is reconstructable from URL alone. |
| **Context survives** | Lists restore scroll, filters, and selection on return. |
| **SSE continuity** | Realtime subscriptions survive route transitions. |
| **Dirty state is protected** | Unsaved work warns before allowing navigation away. |
| **No dead ends** | Every screen has a clear forward and backward path. |

---

## Directory Structure

All navigation logic lives in one canonical location:

```
src/lib/navigation/
  routes.ts         — Route constants + typed builders + route metadata
  navigation.ts     — Centralized navigate() / navigateReplace() / prefetch()
  state.ts          — URL state parsers + buildUrl() helper
  breadcrumbs.ts    — Breadcrumb generation from route metadata
  restoration.ts    — Scroll + filter persistence (sessionStorage)
  analytics.ts      — Navigation event emission + oscillation detection
  guards.ts         — Unsaved-changes guard registry + beforeunload
  deep-link.ts      — Deep-link parsing + validation + shareable URL builder
  history.ts        — In-process history stack (annotates browser history)
  transitions.ts    — Transition state pub/sub
  index.ts          — Barrel export

src/hooks/
  useNavigation.ts          — Hook wrapping navigation module, registers router
  useRouteState.ts          — Typed URL state read/write via router.replace()
  useRestorableScroll.ts    — Scroll save/restore on list pages
  useNavigationAnalytics.ts — Subscribe to navigation events in components
  useUnsavedChangesGuard.ts — Dirty-state protection + in-app confirmation

src/lib/realtime/
  sse-manager.ts    — Client-side SSE singleton (one EventSource per endpoint)

src/components/Navigation/
  UnsavedChangesModal.tsx   — Standard confirmation dialog for unsaved work
```

---

## Route Registry

All routes are defined in `src/lib/navigation/routes.ts`.

**NEVER** construct route strings inline in components:

```typescript
// ❌ Anti-pattern
router.push('/interview-prep/' + jobId + '?tab=behavioral');

// ✅ Correct
import { ROUTES, buildUrl } from '@/lib/navigation';
navigate(ROUTES.INTERVIEW_PREP_JOB(jobId), { params: { tab: 'behavioral' } });
```

Each route has associated metadata (label, parent, requiresAuth, inSidebar) used for breadcrumb generation and access control.

---

## URL State Standards

### The Rule

> **URL state is canonical.** Zustand may shadow it for render performance, but on mount the URL wins.

### When to use URL state

Use URL params for any state that users would reasonably expect to survive:
- Browser refresh
- Sharing a link
- Reopening a closed tab
- Browser back/forward

### Per-route URL state schemas

#### `/jobs`

| Param | Type | Description |
|-------|------|-------------|
| `stage` | string | Active stage filter |
| `sort` | string | `date` \| `matchScore` \| `company` |
| `tab` | string | `overview` \| `timeline` \| `interviews` \| `prep` \| `offers` |
| `job` | string | Selected job ID |
| `page` | number | Pagination (0-indexed) |
| `q` | string | Search query |
| `view` | string | `kanban` \| `list` |

Example: `/jobs?stage=interview&sort=matchScore&job=abc123`

#### `/interview-prep`

| Param | Type | Description |
|-------|------|-------------|
| `job` | string | Selected job ID (workspace open) |
| `tab` | string | Active prep tab |
| `story` | string | Active STAR story ID |
| `session` | string | Active mock session ID |

Example: `/interview-prep?job=abc123&tab=behavioral`

#### `/analytics`

| Param | Type | Description |
|-------|------|-------------|
| `tab` | string | `pipeline` \| `roi` \| `trajectory` \| `market` |
| `timeframe` | string | `7d` \| `30d` \| `90d` \| `all` |

Example: `/analytics?tab=roi&timeframe=30d`

#### `/resume-lab`

| Param | Type | Description |
|-------|------|-------------|
| `variant` | string | Active variant ID |
| `doc` | string | Active document ID |
| `compare` | boolean | Compare mode |

### Usage pattern

```typescript
'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { parseAnalyticsState, buildUrl } from '@/lib/navigation/state';

// MUST be inside a Suspense boundary when using useSearchParams
function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { tab } = parseAnalyticsState(searchParams);

  function setTab(t: string) {
    router.replace(buildUrl(pathname, { tab: t }, searchParams), { scroll: false });
  }
  // ...
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AnalyticsContent />
    </Suspense>
  );
}
```

---

## Restoration Patterns

### Scroll Restoration

List pages automatically save and restore scroll position:

```typescript
import { useRestorableScroll } from '@/hooks/useRestorableScroll';

function JobsList() {
  useRestorableScroll({ key: '/jobs' });
  // ...
}
```

The hook:
1. On mount: restores scroll from sessionStorage
2. On scroll: debounces save (200ms) to sessionStorage
3. On explicit save: `saveScroll()` immediately persists current position

### Filter Restoration

Filters are persisted via URL (canonical). No additional restoration needed for deep-linkable state.

For ephemeral UX state (e.g. expanded/collapsed sections), use `useRestorableScroll` with a `payload`:

```typescript
const { saveScroll } = useRestorableScroll({
  key: '/jobs',
  payload: { expandedStages: ['applied', 'interview'] }
});
```

---

## Breadcrumb System

Breadcrumbs are generated from centralized route metadata and always reflect the user's mental model — not the internal file structure.

### Examples

```
// ✅ Correct — workflow-centric
Pipeline > Google SWE Role > Interview Prep > Behavioral Stories

// ❌ Wrong — file-structure-centric
Dashboard > CareerOS > Agent > Execution
```

### Usage

Auto-generated breadcrumbs in NavLayout:

```tsx
<NavLayout title="Interview Prep" entityLabel="Google SWE Role">
  ...
</NavLayout>
```

Custom breadcrumbs for complex flows:

```tsx
import { interviewPrepBreadcrumbs } from '@/lib/navigation/breadcrumbs';

const crumbs = interviewPrepBreadcrumbs('Google SWE Role', 'behavioral');
<NavLayout breadcrumbs={crumbs}>...</NavLayout>
```

---

## Navigation Analytics

All navigation events are emitted to `src/lib/navigation/analytics.ts`.

### Event types

| Event | When emitted |
|-------|-------------|
| `route_enter` | User arrives at a route |
| `route_exit` | User leaves a route |
| `back_navigate` | Browser/app back triggered |
| `deep_link_restore` | Deep link hydrated state |
| `restoration_success` | Scroll/filter restored |
| `restoration_failed` | Restoration data missing/stale |
| `sse_subscription_preserved` | SSE survived route change |
| `sse_subscription_lost` | SSE dropped (all subscribers gone) |
| `unsaved_changes_warned` | Guard blocked navigation |
| `unsaved_changes_discarded` | User confirmed discard |
| `navigation_latency` | Route transition completed |
| `oscillation_detected` | User visiting same route >3× / 60s |
| `dead_end_exit` | Explicit dead-end detection |

### Subscribing to events

```typescript
import { useNavigationAnalytics } from '@/hooks/useNavigationAnalytics';

useNavigationAnalytics((event) => {
  if (event.type === 'oscillation_detected') {
    // Show contextual help tip
  }
});
```

---

## SSE Lifecycle

CareerPropel uses Server-Sent Events for realtime agent execution updates.

### Problem solved

Previous architecture: one `EventSource` per component instance.  
Result: route transitions closed subscriptions, losing execution visibility.

### Current architecture

A **module-level singleton** (`src/lib/realtime/sse-manager.ts`) maintains ONE `EventSource` per endpoint. Components acquire a subscription handle and release it on unmount. The connection stays alive as long as at least one subscriber holds a handle (ref-counted).

```
Component A mounts → acquireSseSubscription('/api/agents/events')
Component B mounts → same connection returned (refCount: 2)
Component A unmounts → refCount: 1, connection STAYS ALIVE
Component B unmounts → refCount: 0, EventSource.close() called
```

This ensures:
- Agent execution panels survive sidebar route changes
- No duplicate connections during split-panel layouts
- Clean teardown only when genuinely no longer needed

### Usage

`useRealTime` handles this automatically — no code changes needed in components.

---

## Unsaved Changes Protection

### Protected flows

- Resume editing (ResumeLab)
- STAR story editing (BehavioralStories)
- Profile editing (ProfileEditor)
- Offer negotiation drafts
- Mock interview sessions

### Implementation

```typescript
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { UnsavedChangesModal } from '@/components/Navigation/UnsavedChangesModal';

function ResumeEditor() {
  const {
    isDirty, setDirty,
    confirmAndNavigate,
    showConfirm, onConfirmDiscard, onCancelDiscard,
  } = useUnsavedChangesGuard({
    message: 'Discard resume changes?',
  });

  return (
    <>
      <UnsavedChangesModal
        open={showConfirm}
        onConfirm={onConfirmDiscard}
        onCancel={onCancelDiscard}
      />
      <textarea onChange={() => setDirty(true)} />
      <button onClick={() => confirmAndNavigate('/resume-lab')}>Cancel</button>
    </>
  );
}
```

### How it works

1. `registerGuard(isDirty)` — registers a guard in the module-level registry
2. On `navigate()` call — `checkGuards()` fires; if any guard is dirty, navigation is blocked
3. `beforeunload` handler — fires for browser-level close/refresh (shows browser dialog)
4. In-app modal — `UnsavedChangesModal` gives users a styled, accessible confirmation

---

## Deep-Link Reconstruction

Every important screen must be independently reconstructable from its URL.

### Validation

```typescript
import { validateDeepLink } from '@/lib/navigation/deep-link';

const missing = validateDeepLink(window.location.href);
if (missing.length > 0) {
  // Redirect to a safe fallback
}
```

### Shareable URLs

Transient params (`session`, `_rsc`, `_next`) are stripped when building shareable links:

```typescript
import { buildShareableUrl } from '@/lib/navigation/deep-link';

const shareUrl = buildShareableUrl(
  'https://career-propel.vercel.app',
  pathname,
  searchParams,
);
```

---

## Mobile Behavior

Mobile navigation has a different **presentation** but identical **capability**.

### Allowed differences

- Sidebar becomes a sliding drawer instead of fixed left panel
- Detail views take full screen instead of split pane
- Scroll containers adapt to viewport

### Not allowed

- Missing flows (all actions accessible on mobile)
- Missing state persistence (URL state works identically)
- Inconsistent restoration (sessionStorage works on mobile)
- Hidden actions behind desktop-only controls

### Pattern

Use `lg:` breakpoints to switch between layouts, never to conditionally render functionality:

```tsx
// ✅ Correct — layout difference only
<aside className="hidden lg:flex">...</aside>  {/* Desktop: fixed sidebar */}
<MobileDrawer>...</MobileDrawer>              {/* Mobile: sliding drawer */}

// ❌ Wrong — hides functionality
{isDesktop && <ActionButton />}
```

---

## Accessibility Rules

### Route announcements (WCAG 4.1.3)

NavLayout includes a `<RouteAnnouncer>` component that emits route change announcements via `aria-live="polite"` region for screen readers.

### `aria-current`

All active nav links use `aria-current="page"`.

### Focus management

After route transitions, focus is managed by Next.js App Router natively. For modal-driven navigation (workspace panels), ensure focus is:
1. Moved to the panel container on open (`autoFocus`)
2. Trapped within the modal while open
3. Returned to the trigger element on close

### Keyboard navigation

- All interactive elements reachable via Tab
- All actions operable via Enter/Space
- Modal dismissal via Escape
- Split-pane focus: Tab moves between list and detail panes

### Skip link

The root layout includes `<a href="#main-content">Skip to main content</a>` for keyboard users (WCAG 2.4.1).

---

## Anti-Patterns

These patterns are **forbidden** in CareerPropel:

### 1. Inline route strings

```typescript
// ❌
router.push('/jobs?stage=' + stage);
// ✅
navigate(ROUTES.JOBS, { params: { stage } });
```

### 2. Navigation inside presentational components

```typescript
// ❌ Component decides routing logic
function JobCard({ job }) {
  const router = useRouter();
  return <button onClick={() => router.push(`/jobs/${job.id}`)}>...</button>;
}
// ✅ Navigation as a callback prop
function JobCard({ job, onClick }) {
  return <button onClick={() => onClick(job)}>...</button>;
}
```

### 3. Critical state in Zustand-only (no URL)

```typescript
// ❌ Tab selection lost on refresh
const [activeTab, setActiveTab] = useState('pipeline');
// ✅
const { tab } = parseAnalyticsState(searchParams);
```

### 4. Fake history stacks / forced redirects

```typescript
// ❌ Breaks browser back button
router.push('/login');
router.push('/login'); // double push to prevent back
// ✅
navigate(ROUTES.LOGIN, { replace: true });
```

### 5. Silent SSE subscription drops

```typescript
// ❌ Creates new EventSource on every render, drops on unmount
useEffect(() => {
  const es = new EventSource('/api/events');
  return () => es.close(); // closes during route change!
}, []);
// ✅ Use useRealTime() which uses the singleton manager
const { subscribe } = useRealTime();
```

### 6. Navigation before dirty-state check

```typescript
// ❌ Can lose user work
router.push('/dashboard');
// ✅
confirmAndNavigate('/dashboard'); // guard-aware
```

### 7. Dead-end screens (no back path)

Every screen must have:
- A clear "back" affordance OR breadcrumb trail
- Never a state where the user cannot exit without the browser back button

---

## Testing Strategy

### Unit tests (`src/lib/navigation/__tests__/`)

| Module | Tests |
|--------|-------|
| `routes.ts` | `resolveRouteKey`, `routeRequiresAuth`, `ROUTES.*` constants |
| `state.ts` | `parseJobsState`, `parseAnalyticsState`, `buildUrl` |
| `breadcrumbs.ts` | `buildBreadcrumbs`, `jobDetailBreadcrumbs`, `interviewPrepBreadcrumbs` |
| `restoration.ts` | `saveRestoration`, `loadRestoration`, `restoreScroll` (jsdom) |
| `deep-link.ts` | `parseDeepLink`, `validateDeepLink`, `buildShareableUrl` |
| `analytics.ts` | `trackRouteEnter`, oscillation detection |
| `guards.ts` | `registerGuard`, `checkGuards`, `confirmNavigation` |

### Integration tests

| Scenario | Coverage |
|----------|---------|
| Browser back behavior | `/jobs` → `/jobs/abc` → back → same scroll + filters |
| Deep-link restoration | Direct `/analytics?tab=roi` → correct tab active |
| Filter persistence | Set filters → refresh → filters restored |
| SSE continuity | Navigate away from agent panel → back → subscription still active |

### E2E tests (Cypress/Playwright)

Priority order:

1. **Job board → detail → back restoration** (most critical user flow)
2. **Interview prep generation continuity** (SSE during navigation)
3. **Resume editing unsaved warning** (beforeunload + in-app guard)
4. **Analytics filter persistence** (tab survives refresh)
5. **Mobile route restoration** (scroll + filter on mobile viewport)
6. **Deep-link recovery** (`/interview-prep?job=abc123&tab=behavioral` cold load)
7. **Browser refresh recovery** (URL state survives F5)
8. **Multi-tab behavior** (same URL open in two tabs)

### Running tests

```bash
# Unit tests
pnpm test src/lib/navigation/

# E2E tests
pnpm cypress run --spec "cypress/e2e/navigation/**"
```

---

## Governance

1. All route changes go through `ROUTES` constants in `routes.ts`
2. All programmatic navigation goes through `navigate()` / `navigateReplace()` from `navigation.ts`
3. All URL state goes through `parseXxxState()` + `buildUrl()` from `state.ts`
4. New protected flows MUST register an `UnsavedChangesGuard`
5. New list pages MUST use `useRestorableScroll()`
6. SSE subscriptions MUST use `useRealTime()` (singleton manager)
7. Breadcrumbs MUST use `buildBreadcrumbs()` or NavLayout's `entityLabel` prop — never hardcoded strings

---

*This document is the source of truth for navigation behavior in CareerPropel.*  
*Update it whenever architectural navigation patterns change.*
