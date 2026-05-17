# Tasks: Todo Favorite Star Toggle

**Input**: Design documents from `specs/002-todo-favorite-star/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: No test runner installed — test tasks omitted per constitution (tests optional).

**Organization**: Tasks grouped by user story. US1 and US2 can run sequentially; US3 is implementation-complete within US1 (persistence is automatic via existing `saveTodos()`/`loadTodos()`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Add the in-memory filter state variable that US2 depends on. Must exist before US2 work begins.

**⚠️ CRITICAL**: US2 work (Phase 3) cannot begin until T001 is complete.

- [x] T001 Add `let filterFavorites = false;` state variable alongside existing sort booleans (`sortByDueDate`, `sortByPriority`, etc.) in main.js

**Checkpoint**: Foundation ready — US1 and US2 can now proceed (US1 has no dependency on T001).

---

## Phase 2: User Story 1 — Toggle Favorite on a Todo (Priority: P1) 🎯 MVP

**Goal**: Each todo shows an always-visible star (☆ outline / ★ filled). Clicking toggles favorite state and persists it to localStorage. Star is keyboard/ARIA accessible.

**Independent Test**: Add 3 todos. Click star on todo #2 → icon becomes ★. Reload page → todo #2 still shows ★. Click star again → reverts to ☆.

### Implementation for User Story 1

- [x] T002 [P] [US1] Add `.star-btn`, `.star-btn.favorited`, `.star-btn:hover`, `.star-btn:focus-visible` CSS rules in styles.css
- [x] T003 [P] [US1] Implement `toggleFavorite(id)` function in main.js — find todo by id, toggle `todo.favorite` using `!(todo.favorite ?? false)`, call `saveTodos()` then `renderTodos()`
- [x] T004 [US1] Add star button HTML to `li.innerHTML` in `renderTodos()` in main.js — compute `isFavorited = todo.favorite ?? false`, render `<button class="star-btn[favorited]" aria-label="..." aria-pressed="...">★/☆</button>` after the delete button (depends on T002, T003)
- [x] T005 [US1] Wire star button click event listener in `renderTodos()` in main.js — `li.querySelector('.star-btn').addEventListener('click', () => toggleFavorite(todo.id))` (depends on T004)

**Checkpoint**: US1 fully functional. Star toggle works, persists on reload, is keyboard-accessible. MVP complete.

---

## Phase 3: User Story 2 — Filter Todos by Favorites (Priority: P2)

**Goal**: "Favorites" filter button in the existing filter bar. When active, shows only favorited todos. Deactivating restores full list. Shows empty state when no favorites exist. Filter resets on reload.

**Independent Test**: Favorite 2 of 5 todos. Click Favorites → only those 2 visible. Un-favorite one → 1 visible. Un-favorite last → "No favorites yet." message. Reload → all 5 visible again (filter reset).

### Implementation for User Story 2

- [x] T006 [P] [US2] Add `<button class="filter-btn" id="filterFavoritesBtn">Favorites</button>` to the `.filters` div in index.html (depends on T001)
- [x] T007 [P] [US2] Implement `toggleFilterFavorites()` in main.js — toggle `filterFavorites`, call `document.getElementById('filterFavoritesBtn').classList.toggle('active', filterFavorites)`, call `renderTodos()` (depends on T001)
- [x] T008 [US2] Wire `filterFavoritesBtn` click listener in `init()` in main.js — `document.getElementById('filterFavoritesBtn').addEventListener('click', toggleFilterFavorites)` (depends on T006, T007)
- [x] T009 [US2] Add favorites filter branch to `getFilteredTodos()` in main.js — after category filter block: `if (filterFavorites) { result = result.filter(t => t.favorite ?? false); }` (depends on T001, T007)
- [x] T010 [US2] Add empty-state guard to `renderTodos()` in main.js — before the `forEach` loop: if `filteredTodos.length === 0 && filterFavorites`, set `todoList.innerHTML = '<li class="empty-state">No favorites yet.</li>'` and return early; add `.empty-state` CSS rule in styles.css (depends on T009)

**Checkpoint**: US1 + US2 both functional. Filter shows/hides correctly, empty state appears, filter resets on reload.

---

## Phase 4: User Story 3 — Persistence Across Sessions (Priority: P3)

**Goal**: Verify favorite state survives page reload and browser restart. No new implementation needed — US1 already calls `saveTodos()` in `toggleFavorite()` and `loadTodos()` in `init()`.

**Independent Test**: Favorite a todo, close the browser tab entirely, reopen the app → favorite star is still filled.

### Implementation for User Story 3

- [x] T011 [US3] Verify backward compatibility in main.js — confirm `toggleFavorite()` uses `!(todo.favorite ?? false)` and star render in `renderTodos()` uses `todo.favorite ?? false`; confirm `loadTodos()` reads the `favorite` field without migration writes; no code changes expected if T003/T004 implemented correctly

**Checkpoint**: All 3 user stories complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all acceptance scenarios.

- [x] T012 [P] Manual smoke test in browser against all spec acceptance scenarios: (1) toggle on/off, (2) star always visible, (3) reload persistence, (4) ARIA label switches on toggle, (5) keyboard activation (Tab to star, Enter/Space to toggle), (6) favorites filter on/off, (7) empty state message, (8) filter resets on reload, (9) rapid click stability
- [x] T013 [P] Verify `main.js` has no `console.log` statements and all new identifiers convey intent without comments (constitution Principle I)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately
- **Phase 2 (US1)**: No dependency on Phase 1 (T002–T005 are independent of `filterFavorites`)
- **Phase 3 (US2)**: Depends on Phase 1 (T001) + Phase 2 (US1 star logic must exist for filter to show results)
- **Phase 4 (US3)**: Depends on Phase 2 completion (T003/T004 must exist)
- **Phase 5 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: No blockers — start immediately after Phase 1
- **US2 (P2)**: Requires T001 (filterFavorites var) + US1 complete (star toggle must work to have favorites to filter)
- **US3 (P3)**: Covered by US1 — T011 is a verification task only

### Within Each Phase

- T002 and T003 within US1 are fully parallel (different files/functions)
- T004 depends on T002 (CSS class must exist) and T003 (function must exist)
- T005 depends on T004 (button must be rendered)
- T006 and T007 within US2 are fully parallel
- T008 depends on T006 + T007
- T009 depends on T001 + T007
- T010 depends on T009

---

## Parallel Example: User Story 1

```
Parallel (different files):
  T002 — styles.css: .star-btn CSS
  T003 — main.js: toggleFavorite() function

Then sequential:
  T004 — main.js: star HTML in renderTodos() (needs T002 class + T003 fn)
  T005 — main.js: event listener (needs T004)
```

## Parallel Example: User Story 2

```
Parallel (different files):
  T006 — index.html: Favorites button
  T007 — main.js: toggleFilterFavorites() function

Then sequential:
  T008 — main.js: wire listener in init() (needs T006 + T007)
  T009 — main.js: getFilteredTodos() filter branch (needs T001 + T007)
  T010 — main.js + styles.css: empty state (needs T009)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001
2. Complete Phase 2: T002 → T003 (parallel) → T004 → T005
3. **STOP and VALIDATE**: Star toggle works, persists, is accessible
4. Ship MVP

### Incremental Delivery

1. Phase 1 + Phase 2 → MVP: working star toggle with persistence ✓
2. Add Phase 3 → favorites filter with empty state ✓
3. Add Phase 4 → persistence verification ✓
4. Phase 5 → polish and smoke test ✓

---

## Notes

- No new files created — all changes to existing `index.html`, `main.js`, `styles.css`
- `main.js` will be ~378 lines after this feature (constitution violation documented in plan.md)
- `[P]` tasks = different files or independent functions, safe to implement in parallel
- Backward compat handled at read time only: `todo.favorite ?? false` — never write a default
- Filter state (`filterFavorites`) is in-memory only — intentionally not in localStorage
