# Feature Specification: Todo Favorite Star Toggle

**Feature Branch**: `002-todo-favorite-star`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: "Add a 'favorite' star toggle to each todo. When clicked, toggle a star icon and save to localStorage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Favorite on a Todo (Priority: P1)

A user can click a star icon on any todo item to mark it as a favorite. Clicking again removes the favorite status. The star icon reflects the current state visually — filled/highlighted when favorited, outline/dim when not.

**Why this priority**: Core interaction and state persistence. Delivers the complete feature value on its own.

**Independent Test**: Can be fully tested by clicking the star on a todo, verifying the icon changes to filled, reloading the page, and confirming the favorite state is still shown.

**Acceptance Scenarios**:

1. **Given** a todo is not favorited, **When** a user clicks its star icon, **Then** the icon changes to a filled/highlighted star indicating it is now favorited.
2. **Given** a todo is favorited, **When** a user clicks its star icon again, **Then** the icon changes back to an outline/dim star indicating it is no longer favorited.
3. **Given** a todo has been favorited, **When** the page is reloaded, **Then** the star icon still shows as filled/highlighted.
4. **Given** a todo has been un-favorited, **When** the page is reloaded, **Then** the star icon shows as outline/dim.
5. **Given** multiple todos exist, **When** a user favorites one, **Then** only that todo's star changes — all others remain unchanged.

---

### User Story 2 - Filter Todos by Favorites (Priority: P2)

A user can activate a "Favorites" filter to show only favorited todos. When the filter is active, non-favorited todos are hidden. Deactivating the filter restores the full list. The filter state does not persist across page reloads.

**Why this priority**: Delivers browsing utility on top of the core toggle. Requires the toggle (P1) to exist first.

**Independent Test**: Can be fully tested by favoriting 2 of 5 todos, activating the filter, verifying only those 2 appear, then deactivating the filter and verifying all 5 reappear.

**Acceptance Scenarios**:

1. **Given** some todos are favorited and some are not, **When** a user activates the Favorites filter, **Then** only favorited todos are visible in the list.
2. **Given** the Favorites filter is active, **When** a user deactivates it, **Then** all todos are visible again.
3. **Given** the Favorites filter is active and no todos are favorited, **When** the list renders, **Then** an empty state message is shown (e.g., "No favorites yet").
4. **Given** the Favorites filter is active, **When** a user un-favorites the last visible todo, **Then** the list shows the empty state message.
5. **Given** the Favorites filter is active, **When** the page is reloaded, **Then** the filter is inactive and the full list is shown.

---

### User Story 3 - Favorite State Persists Across Sessions (Priority: P3)

Favorite status for all todos is preserved between browser sessions. A user who marks a todo as a favorite on one visit sees it still marked on their next visit without any additional action.

**Why this priority**: Persistence is the key differentiator from an in-memory toggle. Without it, the feature has no lasting value.

**Independent Test**: Can be fully tested by favoriting a todo, closing and reopening the browser, and confirming the star icon is still filled.

**Acceptance Scenarios**:

1. **Given** several todos are favorited and the browser is closed, **When** the browser is reopened and the page loaded, **Then** all previously favorited todos display filled stars.
2. **Given** a todo was favorited then un-favorited before closing the browser, **When** the page is reloaded, **Then** that todo shows an outline star (not favorited).

---

### Edge Cases

- What happens when a todo is deleted while favorited? The favorite entry is removed along with the todo — no orphaned data remains.
- What happens when todos exist in storage from before this feature was added (no favorite field)? They are treated as not favorited (backward compatible default).
- What happens if the user clicks the star rapidly multiple times? Each click toggles state; final state after the last click is persisted.
- What happens when the Favorites filter is active and the user adds a new (non-favorited) todo? The new todo is hidden until the filter is deactivated.
- What happens when the Favorites filter is active and the user favorites a previously hidden todo? Not possible — hidden todos are not interactable while filtered out.

## Clarifications

### Session 2026-05-17

- Q: Should the star icon be always visible (outline when not favorited) or only appear on hover? → A: Always visible — outline star shown on every todo at all times.
- Q: Where does the star icon appear within each todo row? → A: Far right end of the todo row.
- Q: Should the star toggle be keyboard-accessible and have a screen-reader label? → A: Fully accessible — keyboard focusable, activatable via Enter/Space, ARIA label reflects current state ("Mark as favorite" / "Remove from favorites").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each todo item MUST display a star icon at all times — an outline star when not favorited, a filled/highlighted star when favorited.
- **FR-002**: Clicking the star on an un-favorited todo MUST mark it as favorited and update the icon to a filled/highlighted state.
- **FR-003**: Clicking the star on a favorited todo MUST remove the favorite status and update the icon to an outline star.
- **FR-004**: Favorite status MUST be persisted so it survives page reloads and browser restarts.
- **FR-005**: Todos created before this feature (lacking a favorite field) MUST default to not favorited.
- **FR-006**: Deleting a todo MUST also remove its favorite state from persistent storage.
- **FR-007**: Favoriting or un-favoriting a todo MUST NOT affect the favorite state of any other todo.
- **FR-008**: The star toggle MUST be keyboard-focusable and activatable via Enter or Space key.
- **FR-009**: The star toggle MUST have an accessible label that reflects current state — "Mark as favorite" when not favorited, "Remove from favorites" when favorited.
- **FR-010**: Users MUST be able to activate a Favorites filter that hides all non-favorited todos.
- **FR-011**: Users MUST be able to deactivate the Favorites filter to restore the full todo list.
- **FR-012**: When the Favorites filter is active and no todos are favorited, the list MUST display an empty state message.
- **FR-013**: The Favorites filter state MUST NOT persist across page reloads — it resets to inactive on reload.

### Key Entities

- **Todo**: Existing entity extended with optional boolean `favorite` field. Absent or `false` = not favorited; `true` = favorited.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can favorite or un-favorite a todo in a single click with no additional confirmation required.
- **SC-002**: The favorite state of any todo is visually identifiable within 1 second of viewing the list without reading todo text.
- **SC-003**: 100% of favorited todos retain their state after a page reload.
- **SC-004**: Toggling a favorite updates the visual indicator immediately with no perceptible delay.
- **SC-005**: Users can activate the Favorites filter in a single interaction and see results instantly.
- **SC-006**: When the Favorites filter is active with no favorited todos, an empty state message is visible without any additional user action.

## Assumptions

- Favoriting does not change the order or position of todos in the list — sorting by favorites is out of scope for this version.
- The Favorites filter is a toggle control in the existing filter/sort area — not a separate page or view.
- The star icon is placed at the far right end of each todo row, without requiring any new form input at creation time.
- All users share the same device/browser storage — no cross-device sync is in scope.
- Existing todos in storage without a favorite field are treated as not favorited (backward compatible).
