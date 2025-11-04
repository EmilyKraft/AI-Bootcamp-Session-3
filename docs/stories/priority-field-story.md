# Story: Add priority field with default P3

## Updated Acceptance Criteria (Implemented)

1. New tasks created without an explicit priority are stored with priority value `P3` (default).
2. Priority field only allows values `P1`, `P2`, `P3`; invalid input falls back to `P3` on the backend.
3. User can choose priority when creating a task via a 3-option priority selector styled per the UI sketch colors.
4. User can edit an existing task and change its priority (PUT `/api/tasks/:id`).
5. Priority value is displayed in the task list next to each task.
6. Color code requirements from the sketch are applied:
	 - Selected state color: `#07F2E6`.
	 - Unselected state color: `#7A7A7A`.
7. Priority selector is keyboard accessible (buttons are focusable and act like a radio group).
8. Backend validation ensures missing/invalid priority values return a task with `priority: 'P3'`.

## Technical Implementation Summary

- Backend (`/api/tasks` table) extended with `priority TEXT DEFAULT 'P3'`.
- Endpoints supporting priority: `POST /api/tasks`, `PUT /api/tasks/:id`, `GET /api/tasks`, `PATCH /api/tasks/:id` (returns normalized priority), `DELETE /api/tasks/:id`.
- Frontend components updated:
	- `TaskForm`: uses a custom button group (`.priority-toggle-group`) with buttons (`.priority-toggle`) applying selected/unselected colors.
	- `TaskList`: renders badges (`.priority-badge`) showing each task's priority.
	- `App.js`: declares `PRIORITY_LEVELS = ['P1','P2','P3']` and passes them to `TaskForm` (future dynamic use).
- Styles (`App.css`): defines `.priority-toggle` (unselected) and `.priority-toggle.selected` plus `.priority-badge` classes.
- Tests updated in `App.test.js` to reflect new CSS-based priority buttons and default selected `P3` state.

## Accessibility Notes

- Priority selector uses standard `<button>` elements (focusable by default).
- Each button includes `aria-pressed` to indicate selection; planned enhancement: add `role="radiogroup"` + `role="radio"` for stronger semantics.
- Visual focus states provided via CSS outline (`:focus-visible`).

## Future Enhancements (Optional / Backlog)

- Distinct color variants for `P2` and `P3` if differentiation becomes necessary (currently both unselected gray in list view).
- Persist priority to local storage if offline/local-only mode is reintroduced per earlier PRD assumptions.
- Add filtering by priority.
- Centralize priority color tokens in CSS custom properties (`:root { --priority-selected: ... }`).
- Replace custom buttons with MUI `ToggleButtonGroup` for consistency while retaining color scheme.

## Validation & Tests

- Backend tests (`tasks.test.js`) include: creation default, explicit priority set, invalid fallback, update via PUT, completion via PATCH.
- Frontend tests (`App.test.js`) include: rendering, adding a task with selected priority, default `P3` selector presence.

## Status

Implemented in current feature branch (`feature/requirements-and-documentation`).

