# Data Model: Todo Favorite Star Toggle

## Modified Entity: Todo

The existing `Todo` object stored in the `todos` localStorage array is extended with one new optional field.

### Fields

| Field         | Type              | Required | Default  | Notes                                      |
|---------------|-------------------|----------|----------|--------------------------------------------|
| `id`          | `number`          | Yes      | —        | Existing. Auto-incremented integer.        |
| `text`        | `string`          | Yes      | —        | Existing. Todo description.                |
| `completed`   | `boolean`         | Yes      | `false`  | Existing.                                  |
| `completedAt` | `string \| null`  | No       | `null`   | Existing. ISO 8601 timestamp.              |
| `dueDate`     | `string \| null`  | No       | `null`   | Existing. `yyyy-MM-dd` format.             |
| `category`    | `string \| null`  | No       | `null`   | Existing.                                  |
| `priority`    | `string \| null`  | No       | `null`   | Existing. `'high'`, `'medium'`, or `'low'`.|
| `favorite`    | `boolean`         | No       | `false`  | **New.** Absent in old records = `false`.  |

### Backward Compatibility

Existing todos in localStorage that lack `favorite` are treated as `favorite: false` at read time. No migration writes are required — the default is applied only when the field is accessed (e.g., `todo.favorite ?? false`).

### State Transitions

```
not favorited (favorite: false / absent)
        │  click star
        ▼
    favorited (favorite: true)
        │  click star
        ▼
not favorited (favorite: false)
```

### Storage

Stored in the existing `'todos'` localStorage key as part of the JSON-serialized `todos` array. No new localStorage keys introduced.

## Runtime State (not persisted)

| Variable          | Type      | Default | Notes                                     |
|-------------------|-----------|---------|-------------------------------------------|
| `filterFavorites` | `boolean` | `false` | In-memory only. Resets to `false` on page reload. |
