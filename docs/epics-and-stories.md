# Epics and User Stories – TODO App Upgrade

Source: Derived from `docs/prd-todo.md` (MVP and Post-MVP scope). Acceptance criteria added per story. (Based strictly on documented requirements; no new features introduced.)

## MVP

- Epic: Core Task Data Enhancements
  - Story: Add priority field to task model
    - Acceptance Criteria:
      - Task object includes `priority` property with value in {P1, P2, P3}.
      - Saving a task with a valid priority persists that value.
      - Invalid priority values are rejected or coerced to default (see default story).
  - Story: Default priority to P3 when omitted
    - Acceptance Criteria:
      - Creating a task without specifying priority sets `priority` to `P3`.
      - Existing tasks (from before upgrade) load with `priority` resolved to `P3`.
  - Story: Add optional due date field
    - Acceptance Criteria:
      - Task form accepts an ISO `YYYY-MM-DD` date.
      - Saved task stores `dueDate` only if valid format.
      - Tasks without due date display with no date placeholder (not an invalid value).
  - Story: Ignore invalid due date inputs
    - Acceptance Criteria:
      - Entering an invalid date results in task saved without `dueDate`.
      - Invalid date does not block task creation.
  - Story: Migrate existing tasks to include default priority
    - Acceptance Criteria:
      - On load, tasks missing `priority` field are treated as `P3`.
      - No data loss occurs for existing title/completed fields.

- Epic: Task Creation & Editing UI
  - Story: Add priority selector to task form
    - Acceptance Criteria:
      - Form displays control with options P1, P2, P3 (default pre-selected P3).
      - Changing selection updates pending task state before submit.
  - Story: Add due date input to task form
    - Acceptance Criteria:
      - Date input allows choosing a calendar date (native picker or text field).
      - Clearing the date results in no `dueDate` stored.
  - Story: Display priority in task list items
    - Acceptance Criteria:
      - Each task shows its priority value (text or badge) in the list.
      - Default P3 tasks are distinguishable (shows P3 label).
  - Story: Display due date in task list items
    - Acceptance Criteria:
      - Tasks with a due date show the date in `YYYY-MM-DD` format.
      - Tasks without due date omit date section (no placeholder label needed).

- Epic: Filtering & Views
  - Story: Implement All view showing all tasks
    - Acceptance Criteria:
      - Displays both completed and incomplete tasks.
      - Shows tasks regardless of date presence.
  - Story: Implement Today view for tasks due today
    - Acceptance Criteria:
      - Lists only incomplete tasks with `dueDate === today` (local date).
      - Tasks completed today are excluded.
  - Story: Implement Overdue view for past-due tasks
    - Acceptance Criteria:
      - Lists only incomplete tasks with `dueDate < today`.
      - No tasks without dueDate appear.
  - Story: Hide completed tasks from Today view
    - Acceptance Criteria:
      - Completing a task due today removes it from Today view immediately.
  - Story: Hide completed tasks from Overdue view
    - Acceptance Criteria:
      - Completing an overdue task removes it from Overdue view immediately.

- Epic: Basic Sorting
  - Story: Sort tasks by due date ascending
    - Acceptance Criteria:
      - In All view, tasks with due dates appear ordered soonest → latest.
  - Story: Place undated tasks after dated tasks
    - Acceptance Criteria:
      - Tasks lacking `dueDate` appear only after all tasks with valid due dates.
  - Story: Apply creation timestamp as secondary ordering
    - Acceptance Criteria:
      - Among tasks sharing identical due date (or among undated set), order preserves earlier `createdAt` first.

- Epic: Local Persistence
  - Story: Persist new task fields in local storage
    - Acceptance Criteria:
      - Saving a task writes `priority` and optional `dueDate` along with existing fields.
      - Refreshing browser retains new fields.
  - Story: Load tasks with backward-compatible defaults
    - Acceptance Criteria:
      - Legacy tasks without `priority` load as `P3` without errors.
      - No migration prompts required.
  - Story: Handle corrupted local storage gracefully
    - Acceptance Criteria:
      - If parsing stored tasks fails, app recovers with an empty task list and does not crash.
      - User can create new tasks after recovery.

## Post-MVP

- Epic: Visual Priority & Overdue Indicators
  - Story: Add color-coded priority badges
    - Acceptance Criteria:
      - P1 badge renders with red styling; P2 with orange; P3 with gray.
      - Badge colors consistent across list and detail (if detail view exists).
  - Story: Add visual highlighting for overdue tasks
    - Acceptance Criteria:
      - Incomplete overdue tasks display distinct red accent (background, border, or text color per design).
      - Completed overdue tasks (in All view) do NOT show highlight.

- Epic: Advanced Sorting Logic
  - Story: Order overdue tasks first
    - Acceptance Criteria:
      - All incomplete overdue tasks appear before any non-overdue tasks in All view.
  - Story: Apply priority ordering (P1 before P2 before P3)
    - Acceptance Criteria:
      - Within non-overdue tasks sharing same overdue status bucket, tasks order P1 → P2 → P3.
  - Story: Order remaining tasks by due date ascending
    - Acceptance Criteria:
      - After applying overdue + priority layers, tasks with due dates sorted earliest → latest.
  - Story: Place undated tasks after dated tasks
    - Acceptance Criteria:
      - Tasks without `dueDate` appear only after all tasks with due dates (within same priority bucket).
  - Story: Use creation timestamp as final tie-breaker
    - Acceptance Criteria:
      - When due date and priority are identical (or both absent), earlier `createdAt` appears first.

- Epic: UI Polish & UX Enhancements
  - Story: Add subtle transitions for task state changes
    - Acceptance Criteria:
      - Completing or adding a task triggers a <=300ms fade/slide transition.
      - Animations do not block interaction.
  - Story: Refine spacing for task list layout
    - Acceptance Criteria:
      - Consistent 8px grid spacing applied to list items (top/bottom padding consistent).
  - Story: Add icons or badges for priority display
    - Acceptance Criteria:
      - Priority is represented by an icon or badge consistent with color scheme.
      - Badge/Icon remains keyboard and screen-reader accessible (basic aria-label).

- Epic: Documentation Extensions
  - Story: Document advanced sorting rules
    - Acceptance Criteria:
      - Sorting section in PRD or dedicated doc includes full layered order and examples.
  - Story: Document visual indicators for overdue tasks
    - Acceptance Criteria:
      - Style guidelines updated to specify overdue highlight tokens (color, style).
  - Story: Expand user stories for Post-MVP features
    - Acceptance Criteria:
      - Additional user stories enumerated for polishing tasks (sorting, visuals) without changing MVP.

## Technical Requirements

Below technical requirements map each epic to concrete implementation changes based on current code (`packages/frontend` React components and `packages/backend` Express/SQLite API). They do not introduce new scope beyond acceptance criteria.

### Data Model Changes (Core Task Data Enhancements)
- Extend backend SQLite schema to include `priority TEXT DEFAULT 'P3'` (enum constraint enforced at application layer) and retain existing `due_date`.
- Update SELECT queries to return `priority` field; for rows lacking priority (post-schema migration), default to `P3` in response layer.
- Frontend task shape: `{ id, title, description, due_date, completed, priority, created_at }`.
- Validation function (frontend) to ensure `priority` in ['P1','P2','P3']; fallback to 'P3'.
- Due date validation: regex `^\d{4}-\d{2}-\d{2}$` and optional `new Date(year, month-1, day)` sanity check; invalid -> omit field.

### API Adjustments (Backend)
- POST /api/tasks: accept `priority`, `due_date`; if missing priority, set 'P3'; if invalid date, set NULL.
- PUT /api/tasks/:id: allow editing `priority`, `due_date`; enforce same validation rules.
- PATCH /api/tasks/:id: optionally support priority updates later (keep current focus on `completed`).
- GET /api/tasks: update ORDER BY for MVP: `ORDER BY due_date IS NULL, due_date ASC, created_at ASC`; Post-MVP layering handled client-side or via extended SQL (see advanced sorting specs).
- Future (Post-MVP) SQL or client sort layering: overdue first (due_date < today AND completed = 0), then priority, then due_date, then created_at. Proposed SQL pattern:
  ```sql
  ORDER BY 
    (completed = 0 AND due_date IS NOT NULL AND due_date < DATE('now')) DESC,
    CASE priority WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 WHEN 'P3' THEN 3 END ASC,
    due_date IS NULL,
    due_date ASC,
    created_at ASC
  ```
  (Can defer to frontend array sort for simplicity.)

### Frontend State & Components (Task Creation & Editing UI)
- `TaskForm.js` additions:
  - Add `priority` state with default 'P3'.
  - Add MUI `Select` or `ToggleButtonGroup` for priority selection (options P1/P2/P3).
  - Normalize due date to `YYYY-MM-DD` before submit (reuse existing `normalizeDateString` or refactor into util).
  - Submit payload becomes `{ title, description, due_date, priority }`.
- `TaskList.js` adjustments:
  - Display priority via MUI `Chip` (MVP text; Post-MVP colored badge).
  - Add client-side filtering tabs (All/Today/Overdue) introducing new component or local state controlling displayed subset.
  - Filtering logic utilities:
    ```js
    const isToday = (d) => /* compare to local today */;
    const isOverdue = (d) => /* d < today */;
    ```
  - Sorting: implement utility `sortTasksMvp(tasks)` and later `sortTasksAdvanced(tasks, today)`.

### Filtering & Views Implementation
- Introduce a `ViewTabs` component (MUI Tabs) controlling current view: 'all' | 'today' | 'overdue'.
- Fetch tasks once (avoid refetch on tab change) then derive filtered array.
- Today filter: incomplete tasks with due_date equal to local `YYYY-MM-DD`.
- Overdue filter: incomplete tasks with due_date < today (string compare safe if all ISO format).
- Completed exclusion: apply in derived filters, not mutation of original array.

### Sorting Utilities (Basic & Advanced)
- Basic (MVP):
  ```js
  function sortTasksMvp(a, b) {
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    return new Date(a.created_at) - new Date(b.created_at);
  }
  ```
- Advanced (Post-MVP): chain comparisons: overdue status, priority rank map `{P1:1,P2:2,P3:3}`, due_date, created_at.

### Persistence Layer (Local vs Backend)
- Current implementation uses backend API; PRD states local-only for MVP. Decide approach:
  - Option A (Adjust to PRD): Replace API calls with localStorage CRUD (`tasks` key). Provide migration script or toggle.
  - Option B (Document variance): Keep backend present but mirror localStorage caching for offline demo.
- If shifting to localStorage:
  - Implement `loadTasks()` reading JSON; handle parse errors with try/catch returning `[]`.
  - Implement `saveTasks(tasks)` writing JSON; ensure atomic writes (stringify once).
  - Remove fetch usage or gate with feature flag.

### Visual Indicators (Post-MVP)
- Priority badge colors: MUI `Chip` with `sx` using palette tokens: P1 `error.main`, P2 `warning.main`, P3 neutral gray.
- Overdue styling: conditional `sx` on list item (e.g., red left border: `borderLeft: '4px solid #f44336'`).
- Ensure completed overdue tasks do not apply overdue styling (check `!task.completed`).

### Transitions & UX (Post-MVP)
- Add CSS transition for list item mount/unmount using React `TransitionGroup` + `Collapse` or MUI `Grow` (<=300ms).
- Keep animation accessible: no motion triggers if user prefers reduced motion (respect `(prefers-reduced-motion)` media query).

### Documentation Extensions
- Update `docs/prd-todo.md` when advanced sort implemented.
- Add `docs/stories/sorting-rules-story.md` detailing examples (optional).

### Testing Requirements
- Unit tests (frontend):
  - Sorting utilities (MVP & advanced) edge cases: undated tasks, identical due dates, priority ordering.
  - Filtering functions for Today/Overdue with boundary dates (today, yesterday, tomorrow).
  - Priority default logic when creating tasks.
- Backend tests (if backend retained): validate POST rejects empty title, sets default priority, ignores invalid date.
- Snapshot / rendering test: TaskList renders badge & due date correctly.

### Migration / Compatibility
- For existing tasks without `priority`, treat missing as 'P3' (frontend mapping after fetch or during localStorage hydration).
- No destructive schema changes; add column with default if backend path chosen: `ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'P3'` (executed once; guard if exists).

### Edge Cases & Constraints
- Invalid date like `2025-13-40` excluded (do not store invalid string).
- Empty title blocked with inline error message (already implemented in `TaskForm`).
- Timezone consistency: use local browser date for Today/Overdue comparisons; document limitation.
- Performance: Avoid resort/filter recomputation on every render; memoize derived list by `[tasks, view]`.

### Accessibility (Deferred but Minimal)
- Provide `aria-label` for priority badges (`aria-label="Priority P1"`).
- Checkbox retains accessible label (already present).

