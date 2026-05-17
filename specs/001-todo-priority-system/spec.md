# Feature Specification: Todo Priority System

**Feature Branch**: `001-todo-priority-system`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: "Add a priority system (High/Medium/Low) to todos with visual indicators and sorting"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign Priority to Todos (Priority: P1)

A user creating a todo can optionally assign a priority level — High, Medium, or Low — to indicate its urgency. The priority is displayed as a colored badge on the todo item so users can instantly recognize what needs attention most.

**Why this priority**: Core data capture and display. Without this, the rest of the feature has nothing to work with. Delivers immediate visual value.

**Independent Test**: Can be fully tested by adding a todo with each priority level and verifying the colored badge appears, then adding one with no priority and confirming no badge appears.

**Acceptance Scenarios**:

1. **Given** the todo input form is visible, **When** a user selects "High" from the priority selector and adds a todo, **Then** the todo appears in the list with a red "High" badge.
2. **Given** a todo with "Medium" priority, **When** it is displayed, **Then** it shows an amber/yellow "Medium" badge.
3. **Given** a todo with "Low" priority, **When** it is displayed, **Then** it shows a green "Low" badge.
4. **Given** a user does not select a priority, **When** the todo is added, **Then** no priority badge is displayed.
5. **Given** todos with priorities exist in localStorage, **When** the page is reloaded, **Then** all priority badges are still displayed correctly.

---

### User Story 2 - Default Sort by Priority (Priority: P2)

Todos are ordered by priority by default — High priority items appear at the top, followed by Medium, then Low, then unprioritized items. The user can toggle this sort off or switch to another sort (due date, completion date), and the sort state persists during the session.

**Why this priority**: Ensures the highest-urgency work is always visible at a glance without any manual action required.

**Independent Test**: Can be fully tested by adding todos with mixed priorities and verifying the default list order is High → Medium → Low → none, then toggling priority sort off and verifying original insertion order is restored.

**Acceptance Scenarios**:

1. **Given** todos with High, Medium, Low, and no priority exist, **When** the list is displayed with default settings, **Then** High items appear first, then Medium, then Low, then unprioritized.
2. **Given** priority sort is active, **When** a user activates due date sort, **Then** priority sort deactivates and the list re-orders by due date.
3. **Given** priority sort is active (default), **When** a user clicks the priority sort button to toggle it off, **Then** todos return to insertion order.
4. **Given** multiple todos share the same priority level, **When** sorted by priority, **Then** their relative order within the same priority level is stable.

---

### Edge Cases

- What happens when an existing todo (created before this feature) has no priority field? It should appear at the bottom of the priority-sorted list, same as explicitly unprioritized todos.
- How does the system handle todos when both priority sort and another sort are requested? Sorts are mutually exclusive — activating one deactivates the others.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to assign a priority level (High, Medium, or Low) when creating a todo.
- **FR-002**: Priority assignment MUST be optional — users can create todos without a priority.
- **FR-003**: System MUST display a visually distinct badge on each todo that has a priority assigned.
- **FR-004**: Priority badges MUST use distinct colors: High = red, Medium = amber/yellow, Low = green.
- **FR-005**: System MUST sort todos by priority by default, with High at the top and unprioritized items at the bottom.
- **FR-006**: Users MUST be able to toggle priority sorting on and off.
- **FR-007**: Priority sort MUST be mutually exclusive with existing sorts (due date sort, completion date sort).
- **FR-008**: System MUST persist priority data alongside the existing todo data across page reloads.
- **FR-009**: Todos created before this feature was added (lacking a priority field) MUST be treated as unprioritized and appear at the bottom when sorted by priority.

### Key Entities

- **Todo**: Existing entity extended with optional `priority` field. Values: `'high'`, `'medium'`, `'low'`, or absent/null for no priority.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can assign a priority to a new todo in a single additional interaction step (one extra field selection).
- **SC-002**: Priority level of any todo item is identifiable within 1 second of viewing the list without reading the todo text.
- **SC-003**: The highest-priority todos are visible at the top of the list immediately on page load with no user action required.
- **SC-004**: Switching between sort modes (priority, due date, completion date) takes a single click and updates the list instantly.
- **SC-005**: 100% of todos with assigned priorities display their badges correctly after a page reload.

## Assumptions

- Priority is assigned at creation time only; editing priority after creation is out of scope for this version.
- The priority selector appears in the existing input form alongside the due date and category fields.
- No priority filter (filtering list to show only High priority items, for example) is required in this version — only sorting.
- Mobile responsiveness uses the existing app-wide approach (no special priority-specific mobile treatment needed).
- Existing todos in localStorage without a priority field are treated as having no priority (backward compatible).
