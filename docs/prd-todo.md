# Product Requirements Document (PRD) - TODO App Upgrade (Due Dates, Priority, Filters)

## 1. Overview
We are enhancing the existing minimal TODO application (currently title + completed state) to introduce lightweight task management capabilities that improve clarity and urgency handling without adding backend complexity. The upgrade will add optional due dates, a simple three-level priority system, and focused filter views (All, Today, Overdue) while keeping storage local. This supports a teachable MVP for internal bootcamp training, with clear separation between immediate needs and future enhancements.

Key goals:
- Help users quickly identify urgent and time-sensitive tasks.
- Provide minimal structure (priority + date) without overwhelming UI complexity.
- Maintain zero-dependency persistence (local storage only) for simplicity.
- Establish a foundation for later visual and behavioral enhancements (sorting, highlighting).

---

## 2. MVP Scope
The following items are included in the initial release (MVP):
- Data Model Additions:
  - `priority`: enum `P1 | P2 | P3` (default `P3` if unspecified).
  - `dueDate`: optional ISO `YYYY-MM-DD` string; invalid formats ignored (treated as absent).
- Validation Rules:
  - `title` is required; empty titles blocked.
  - `dueDate` must match ISO date pattern; malformed values are discarded silently.
  - Missing `priority` defaults to `P3`.
- Filter / View Tabs:
  - All: shows all tasks (completed + incomplete).
  - Today: shows incomplete tasks with `dueDate === today`.
  - Overdue: shows incomplete tasks with `dueDate < today`.
- Persistence:
  - Local-only (browser localStorage). No backend or external APIs.
  - Backward compatibility: existing tasks without `priority` assume `P3`.
- Basic UI Elements:
  - Form updates to set optional due date and select priority.
  - Priority selector (dropdown or segmented control).
  - Date input using native browser date picker if available.
- Basic Sorting (MVP simplification):
  - Tasks sorted by due date ascending (soonest first), then undated tasks by creation timestamp.
- Completed Task Behavior:
  - Completed tasks appear only in All view.
  - They are excluded from Today and Overdue views.
- Non-functional Constraints:
  - Keep UI simple (no advanced animations, minimal styling beyond existing base).
  - Accessibility beyond basic semantics is deferred (out of scope for MVP).

---

## 3. Post-MVP Scope
Enhancements to be added after the MVP to improve clarity and user experience:
- Visual Overdue Highlighting:
  - Overdue incomplete tasks styled distinctly (e.g., red border or background).
- Color-Coded Priority Badges:
  - P1: red, P2: orange, P3: gray (subtle badge style).
- Advanced Sorting Logic:
  - Order: overdue incomplete first → priority (P1 → P2 → P3) → due date ascending → undated last.
  - Stable tie-breaker: creation timestamp.
- Additional UI Polish:
  - Refined spacing and iconography for priority.
  - Transition animations for task state changes.
- Documentation Extensions:
  - Expanded user stories and acceptance criteria for sorting and visual treatments.

---

## 4. Out of Scope
The following items are explicitly excluded from both MVP and Post-MVP phases (unless re-scoped later):
- Notifications / reminders.
- Recurring tasks.
- Multi-user / authentication.
- External or cloud storage (database, API layer).
- Keyboard shortcut navigation / advanced accessibility tooling.
- Real-time collaboration.
- Push sync across devices.
- Tagging / categorization beyond priority.

---

## 5. User Stories (MVP)
1. As a user, I can assign a priority to a task so I can mark importance (defaulting to P3 if I don’t choose one).
2. As a user, I can optionally set a due date so I know when a task should be completed.
3. As a user, I can view tasks due today in a dedicated Today tab to focus on immediate work.
4. As a user, I can view overdue tasks in a dedicated Overdue tab to recover missed commitments.
5. As a user, I can view all tasks (completed + incomplete) to retain historical context.
6. As a user, I don’t see completed tasks in Today or Overdue so those views stay actionable.

## 6. User Stories (Post-MVP)
1. As a user, I see overdue tasks visually highlighted so I can quickly spot urgent items.
2. As a user, I see priority levels with colored badges for faster scanning.
3. As a user, I experience improved sorting so the most critical or time-sensitive tasks appear first.

---

## 6. Acceptance Criteria (Selected MVP)
- Creating Task (Title Only): Given I enter a non-empty title and submit, the task appears in All with priority P3 and no due date.
- Priority Default: Given I create a task without selecting a priority, it’s stored/displayed as P3.
- Due Date Validation: Given I enter an invalid date string, the task saves without a due date.
- Today View: Given tasks with various due dates, when I open Today, only incomplete tasks due today are listed.
- Overdue View: Given tasks with past and future due dates, when I open Overdue, only incomplete tasks with past dueDate appear.
- Completion Filtering: Given I mark an overdue task complete, it disappears from Overdue but remains visible in All.

(Post-MVP examples)
- Overdue Highlight: Given an incomplete overdue task, it renders with distinct visual styling (per design spec).
- Advanced Sorting: Given mixed tasks, order matches: overdue → priority → due date asc → undated.

---

## 7. Data Model
```
Task {
  id: string;            // unique identifier
  title: string;         // required
  description?: string;  // optional (existing support)
  completed: boolean;    // default false
  dueDate?: string;      // ISO YYYY-MM-DD, optional
  priority: 'P1' | 'P2' | 'P3'; // default 'P3'
  createdAt: string;     // ISO timestamp for sorting fallback
}
```
Notes:
- Migration: existing tasks without `priority` are treated as `P3` on read.
- Invalid dueDate values ignored (do not block creation).

---

## 8. Sorting Details
MVP: due date asc → undated (creation time tie-breaker).
Post-MVP: overdue incomplete first → priority (P1→P3) → due date asc → undated → creation time.

Overdue Definition: `dueDate < today` and `completed === false`.
Today Definition: `dueDate === today` and `completed === false`.

---

## 9. Non-Functional Requirements
- Performance: Rendering < 200ms for task lists under 200 items (informal goal).
- Reliability: Local storage operations must not throw; fallback to empty array if corrupted.
- Accessibility (deferred): Basic semantic HTML but no specialized keyboard flows in MVP.
- Browser Support: Latest Chrome/Edge/Firefox (mobile and desktop). Safari acceptable best-effort.

---

## 10. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Date parsing inconsistencies | Incorrect filtering | Use strict YYYY-MM-DD regex and `new Date()` sanity check |
| Local storage corruption | App fails to load tasks | Wrap parse in try/catch; default to empty list |
| Scope creep (styling, animations) | Delays MVP delivery | Enforce MVP/Post-MVP boundary documented here |
| Timezone differences | Users see inaccurate overdue status | Assume local browser date; document limitation |

---

## 11. Success Metrics
MVP qualitative success (bootcamp context):
- All user stories demonstrable during workshop.
- < 5 min developer onboarding to feature code changes.
- Clear separation between MVP/Post-MVP in repo docs.
Post-MVP success:
- Users visually distinguish overdue tasks in < 1 second scan.
- Sorting accepted by stakeholders with no requested change.

---

## 12. Dependencies
- Existing React frontend structure (`packages/frontend`).
- Local storage API availability.
- No backend schema changes required.

---

## 13. Open Questions
- Should Today include tasks created today without due dates? (Currently NO.)
- Any desire for a “This Week” view later? (Potential future enhancement.)
- Priority badge styling timeline (MVP or Post-MVP if time shrinks?).

---

## 14. Change Log
- v1.0 (2025-11-04): Initial PRD created from Sept 16 meeting transcript and Sept 17 Slack clarifications.

---

## 15. Approval
Stakeholders (Client 1, Client 2) verbally confirmed MVP and Post-MVP scope via Slack on Sept 17. This document formalizes that agreement.

