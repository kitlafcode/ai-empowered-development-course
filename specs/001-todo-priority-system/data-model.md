# Data Model: Todo Priority System

## Entity: Todo (extended)

Extends the existing Todo entity with one new optional field.

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| id | number | auto-increment | existing |
| text | string | any non-empty | existing |
| completed | boolean | true/false | existing |
| dueDate | string \| null | yyyy-MM-dd | existing |
| category | string \| null | user-defined | existing |
| completedAt | string \| null | ISO 8601 | existing |
| **priority** | string \| null | 'high', 'medium', 'low', null | **NEW** |

### Validation Rules

- `priority` is optional at creation time; omitting it or selecting "No priority" stores `null`
- Accepted values: `'high'`, `'medium'`, `'low'` or absent/null
- No other values are valid

### Backward Compatibility

Existing todos in localStorage without a `priority` field are treated as `null` priority. The sort logic uses `PRIORITY_ORDER[x] ?? 4` to handle both `null` and `undefined`.

### Sort Order

| Priority | Sort Weight |
|----------|------------|
| high | 1 |
| medium | 2 |
| low | 3 |
| null/undefined | 4 |
