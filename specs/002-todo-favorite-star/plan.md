# Implementation Plan: Todo Favorite Star Toggle

**Branch**: `002-todo-favorite-star` | **Date**: 2026-05-17 | **Spec**: specs/002-todo-favorite-star/spec.md

**Input**: Feature specification from `specs/002-todo-favorite-star/spec.md`

## Summary

Add a star toggle button to each todo item (far right, after Delete) to mark it as a favorite. Favorites are stored as a `favorite` boolean on each todo object in localStorage. A "Favorites" filter button in the existing filter bar shows only favorited todos. Filter state is in-memory only (does not persist). Star is always visible (outline when not favorited, filled when favorited) and fully keyboard/ARIA accessible.

## Technical Context

**Language/Version**: JavaScript ES modules (ES2021)

**Primary Dependencies**: Vite 7.3.1 (bundler), date-fns 4.1.0 (existing, no new deps needed)

**Storage**: localStorage — `todos` key, JSON array. `favorite` boolean field added to each todo object.

**Testing**: None installed (no test runner)

**Target Platform**: Browser (single-page app, Vite dev server)

**Project Type**: Single-page web app

**Performance Goals**: Toggle is O(1), favorites filter is O(n) for n ≤ 100 items — within the 100ms budget.

**Constraints**: Backward compatible — existing todos lacking `favorite` field default to `false` at read time (no migration writes).

**Scale/Scope**: Single user, client-side only

## Constitution Check

| Principle                  | Status                | Notes                                                                                   |
|----------------------------|-----------------------|-----------------------------------------------------------------------------------------|
| I. Code Quality            | VIOLATION (justified) | `main.js` is 338 lines; adds ~40 lines → ~378 lines. See Complexity Tracking.          |
| II. Testing Standards      | N/A                   | No test runner installed; tests optional per constitution.                              |
| III. UX Consistency        | PASS                  | Star button follows existing todo button pattern; filter button reuses `.filter-btn`.   |
| IV. Performance            | PASS                  | Toggle O(1), filter O(n ≤ 100), localStorage write batched via existing `saveTodos()`. |
| V. Backward Compatibility  | PASS                  | Missing `favorite` field defaults to `false` at read time, never at write time.        |

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-favorite-star/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── spec.md              # Feature specification
└── tasks.md             # Phase 2 output (/speckit-tasks — not created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html               # Add "Favorites" filter button to .filters div
main.js                  # Add filterFavorites state, toggleFavorite(), toggleFilterFavorites(),
                         # update getFilteredTodos(), update renderTodos() star HTML + listeners
styles.css               # Add .star-btn and .star-btn.favorited styles, .empty-state
```

**Structure Decision**: Single-project (all code at repo root). No new files. Follows the same structure as all prior features.

## Implementation Approach

### index.html changes

Add one button to the `.filters` div:

```html
<button class="filter-btn" id="filterFavoritesBtn">Favorites</button>
```

### main.js changes

1. New state variable (alongside existing sort/filter booleans):
   ```js
   let filterFavorites = false;
   ```

2. Wire up button in `init()`:
   ```js
   document.getElementById('filterFavoritesBtn').addEventListener('click', toggleFilterFavorites);
   ```

3. `toggleFavorite(id)` — toggle `favorite` on the matching todo and save:
   ```js
   function toggleFavorite(id) {
       const todo = todos.find(t => t.id === id);
       if (todo) {
           todo.favorite = !(todo.favorite ?? false);
           saveTodos();
           renderTodos();
       }
   }
   ```

4. `toggleFilterFavorites()` — toggle filter state and update button active class:
   ```js
   function toggleFilterFavorites() {
       filterFavorites = !filterFavorites;
       document.getElementById('filterFavoritesBtn').classList.toggle('active', filterFavorites);
       renderTodos();
   }
   ```

5. `getFilteredTodos()` — add favorites filter after the category filter block:
   ```js
   if (filterFavorites) {
       result = result.filter(t => t.favorite ?? false);
   }
   ```

6. `renderTodos()` changes:
   - Empty state when `filterFavorites` is active and result is empty:
     ```js
     if (filteredTodos.length === 0 && filterFavorites) {
         todoList.innerHTML = '<li class="empty-state">No favorites yet.</li>';
         return;
     }
     ```
   - Star button HTML per todo (inserted after delete button in `li.innerHTML`):
     ```js
     const isFavorited = todo.favorite ?? false;
     const starLabel = isFavorited ? 'Remove from favorites' : 'Mark as favorite';
     const starHtml = `<button class="star-btn${isFavorited ? ' favorited' : ''}"
         aria-label="${starLabel}"
         aria-pressed="${isFavorited}">${isFavorited ? '★' : '☆'}</button>`;
     ```
   - Add event listener after rendering:
     ```js
     li.querySelector('.star-btn').addEventListener('click', () => toggleFavorite(todo.id));
     ```

### styles.css changes

```css
.star-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    color: #d1d5db;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: color 0.2s;
    line-height: 1;
}

.star-btn:hover,
.star-btn:focus-visible {
    color: #f59e0b;
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

.star-btn.favorited {
    color: #f59e0b;
}

.empty-state {
    padding: 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
}
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle I: `main.js` exceeds 300 lines (~378 after this feature) | All app logic lives in a single file per the established project architecture; this feature adds ~40 lines | Splitting into modules is a separate architectural refactor. Doing it here would mix two concerns in one PR and complicate the teaching diff. A dedicated refactor should be filed as a separate feature branch. |
