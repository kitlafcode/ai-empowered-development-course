# Research: Todo Favorite Star Toggle

## Star Icon Representation

**Decision**: Unicode characters ★ (U+2605, filled) and ☆ (U+2606, outline) rendered inside a `<button>` element.

**Rationale**: No new dependencies. Browser-native, accessible when wrapped in a `<button>` with an `aria-label`. Matches the project's zero-new-dependency pattern established in features 1–4.

**Alternatives considered**:
- SVG icon: More control over sizing/color but adds markup complexity.
- Icon font (e.g., Font Awesome): Requires a new dependency — rejected.
- Emoji ⭐: Inconsistent rendering across platforms/browsers — rejected.

## Favorites Filter Implementation

**Decision**: In-memory boolean `let filterFavorites = false`; toggled by a new `<button id="filterFavoritesBtn">` in the existing `.filters` div, using the existing `.filter-btn` CSS class.

**Rationale**: Consistent with the existing `sortByDueDate`, `sortByCompletedAt`, `sortByPriority` boolean pattern. Reuses existing CSS — no new classes for the button itself.

**Alternatives considered**:
- Separate `<select>` like category filter: Overkill for a binary toggle — rejected.
- URL query param: No routing in this app — rejected.

## Persistence Strategy

**Decision**: `favorite` boolean stored as part of each todo object in the existing `todos` array, persisted via the existing `saveTodos()` / `loadTodos()` functions and the `STORAGE_KEY` localStorage entry.

**Rationale**: Consistent with how `priority`, `dueDate`, `category` are already stored. No second localStorage key needed.

**Alternatives considered**:
- Separate `FAVORITES_KEY` localStorage entry: Creates orphaned data on todo deletion — rejected.

## File Size Concern

**Decision**: Accept `main.js` exceeding 300 lines for this feature; document violation in Complexity Tracking.

**Rationale**: Splitting into modules is a separate architectural refactor orthogonal to this feature. Adding ~40 lines here does not materially increase comprehension difficulty for a teaching codebase. The refactor should be a dedicated task in a future feature branch.
