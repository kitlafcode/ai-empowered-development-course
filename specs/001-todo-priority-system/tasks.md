# Tasks: Todo Priority System

**Input**: Design documents from `specs/001-todo-priority-system/`

**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm integration points in the existing codebase — no new project structure needed.

- [ ] T001 Review `addTodo()` (main.js:102–131), `renderTodos()` (main.js:175–216), and `getFilteredTodos()` (main.js:219–254) to confirm insertion points before making changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the todo data model with `priority` field. Both user stories depend on this.

**⚠️ CRITICAL**: Must complete before any user story work begins.

- [ ] T002 In `addTodo()` in `main.js`, add `priority: priorityInput.value || null` to the `todos.push({...})` call and add `priorityInput.value = '';` to the clear block — establishes data model for all downstream tasks

**Checkpoint**: Todo objects now carry optional `priority` field; localStorage serialization automatic.

---

## Phase 3: User Story 1 - Assign Priority to Todos (Priority: P1) 🎯 MVP

**Goal**: Users can select a priority when creating a todo and see a colored badge on each prioritized item.

**Independent Test**: Add todos with High, Medium, Low, and no priority. Verify correct colored badges appear. Reload page and verify badges persist.

### Implementation for User Story 1

- [ ] T003 [US1] Add priority `<select id="priorityInput">` with options (No priority / High / Medium / Low) inside `.input-fields` div after `#categoryInput` in `index.html`
- [ ] T004 [P] [US1] Read `document.getElementById('priorityInput')` at the top of `addTodo()` in `main.js` (alongside existing input reads at line 103–106)
- [ ] T005 [US1] Add `priorityHtml` badge to `renderTodos()` in `main.js`: build `<span class="priority-badge priority-${todo.priority}">...</span>` when `todo.priority` is truthy; insert into `li.innerHTML` alongside `categoryHtml`
- [ ] T006 [P] [US1] Add priority badge CSS to `styles.css`: `.priority-badge` base styles (pill shape matching `.category-badge`), `.priority-badge.priority-high` (red: `#fee2e2` / `#dc2626`), `.priority-badge.priority-medium` (amber: `#fef3c7` / `#d97706`), `.priority-badge.priority-low` (green: `#dcfce7` / `#16a34a`)

**Checkpoint**: User Story 1 fully functional — priority selection, badge display, and persistence all work independently.

---

## Phase 4: User Story 2 - Default Sort by Priority (Priority: P2)

**Goal**: Todos are ordered High → Medium → Low → none by default. User can toggle sort off or switch to another sort.

**Independent Test**: Add todos with mixed priorities in any insertion order. Verify default list shows High items first. Toggle priority sort off — verify insertion order is restored. Activate due date sort — verify priority sort button deactivates.

### Implementation for User Story 2

- [ ] T007 [US2] Add `let sortByPriority = true;` state variable in `main.js` after the `sortByCompletedAt` declaration (line 62)
- [ ] T008 [US2] Add priority sort block in `getFilteredTodos()` in `main.js` after the `sortByCompletedAt` block: define `PRIORITY_ORDER = { high: 1, medium: 2, low: 3 }`, sort using `?? 4` for null/undefined priority
- [ ] T009 [US2] Add `toggleSortByPriority()` function in `main.js` following the same mutual-exclusion pattern as `toggleSortByDueDate()`: deactivate both other sorts and their buttons when priority sort activates
- [ ] T010 [US2] Update `toggleSortByDueDate()` and `toggleSortByCompletedAt()` in `main.js` to also clear `sortByPriority = false` and remove `active` from `#sortPriorityBtn` when they activate
- [ ] T011 [US2] Add `<button class="filter-btn sort-btn active" id="sortPriorityBtn">Sort by priority</button>` to the `.filters` div in `index.html` after `#sortCompletedBtn` — starts with `active` class since sort is default-on
- [ ] T012 [US2] Wire `document.getElementById('sortPriorityBtn').addEventListener('click', toggleSortByPriority)` in `init()` in `main.js`

**Checkpoint**: User Story 2 fully functional — default priority order, toggle behavior, and mutual exclusion with other sorts all work.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Code quality and backward compatibility verification.

- [ ] T013 [P] Run `npm run lint` and fix any ESLint or stylelint errors across `main.js`, `index.html`, and `styles.css`
- [ ] T014 Clear localStorage in browser dev tools, reload, confirm app works with no stored todos. Then add mixed-priority todos, reload, confirm priorities persist correctly.
- [ ] T015 [P] Manually verify backward compatibility: open browser console, run `localStorage.setItem('todos', JSON.stringify([{id:1,text:"old todo",completed:false}]))` then reload — confirm old todo appears at bottom of priority-sorted list with no badge and no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 review — blocks Phase 3 and Phase 4
- **User Story 1 (Phase 3)**: Depends on Foundational (T002)
- **User Story 2 (Phase 4)**: Depends on Foundational (T002); T007–T012 can begin after T002
- **Polish (Phase 5)**: Depends on Phase 3 + Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after T002. T003, T004, T006 are parallelizable (different files).
- **User Story 2 (P2)**: Can start after T002. T007–T012 are mostly sequential within `main.js`.

### Within Each User Story

- Core data (T002) before all story work
- HTML input (T003) before JS read (T004)
- JS render (T005) before visual verification
- CSS badges (T006) parallelizable with JS changes (different file)
- Sort state (T007) before sort logic (T008) before sort function (T009) before event wire-up (T012)

---

## Parallel Example: User Story 1

```bash
# After T002 completes, launch in parallel:
Task T003: "Add priority <select> to index.html"
Task T006: "Add priority badge CSS to styles.css"

# Then after T003:
Task T004: "Read priorityInput in addTodo() in main.js"

# Then after T004 + T006:
Task T005: "Add priorityHtml badge to renderTodos() in main.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 — Phase 3 only)

1. Complete Phase 1: Setup review (T001)
2. Complete Phase 2: Add priority field to data model (T002)
3. Complete Phase 3: Priority input + badge display (T003–T006)
4. **STOP and VALIDATE**: Test priority input and badges independently
5. Users can now assign and see priorities even without default sorting

### Full Feature (Add Phase 4)

1. MVP complete ✅
2. Complete Phase 4: Default priority sort (T007–T012)
3. Complete Phase 5: Polish + lint + backward compat (T013–T015)

---

## Notes

- [P] tasks touch different files — safe to parallelize
- All badge colors chosen to match existing `todo-due-date` color palette (red = `#ef4444`/`#dc2626`, amber = `#d97706`)
- `PRIORITY_ORDER[x] ?? 4` handles both `null` and `undefined` — covers existing todos and new todos with no priority selected
- ESLint config requires semicolons, single quotes, 4-space indent — match existing code style
- No new files needed — all changes in `main.js`, `index.html`, `styles.css`
