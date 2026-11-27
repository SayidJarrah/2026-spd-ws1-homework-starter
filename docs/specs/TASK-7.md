# Spec — TASK-7 Estimates in whole hours

<!-- owner: @SayidJarrah · ticket: docs/tickets/TASK-7.md -->

- **Ticket:** [docs/tickets/TASK-7.md](../tickets/TASK-7.md)
- **Status:** approved by @SayidJarrah (Dmytro Korniichuk), 2026-11-27 · drafted by Claude Code (claude-opus-5-5)

## Behaviour

`createTask` in `lib/tasks.ts` takes `estimateHours` as `unknown`, because it comes straight from a JSON body. The
check runs before the `insert`, so a rejected value never reaches the database.

| `estimateHours` | Result |
|---|---|
| absent | created, `estimateHours: null` |
| `null` | created, `estimateHours: null` (see Decisions) |
| a `number` that is an integer, `1 <= n <= 40` | created with that value (`40.0` is `40` after `JSON.parse`) |
| anything else: `0`, `41`, `1.5`, `-1`, `NaN`, `"3"`, `"abc"`, `true`, `[]`, `{}` | `RuleViolation("estimateHours must be a whole number 1..40")`, nothing stored |

`POST /api/tasks` does not change: `RuleViolation` → **422** `{ "error": "<message>" }`, success → **201**,
no string `title` → 400.

## Acceptance criteria

1. `1` and `40` are accepted and stored as given.
2. `0`, `41`, `1.5`, `"3"` and `"abc"` each throw `RuleViolation` with exactly
   `estimateHours must be a whole number 1..40`, and no task is stored.
3. A task without `estimateHours`, or with `null`, is created with `estimateHours: null`.
4. `POST /api/tasks` returns 422 with that message for a rejected estimate and 201 for an accepted one.

## Tests

Unit, in `lib/tasks.test.ts` (`npm test`):

- accepts `1` and `40` — AC 1
- rejects `0`, `41`, `1.5`, `"3"`, `"abc"` with the exact message; `listTasks` stays empty — AC 2 (one case each)
- creates without `estimateHours` → `null`; with `null` → `null` — AC 3

Manual, against `npm run dev`, output pasted into the evidence — AC 4:

- `curl` `POST /api/tasks` with `estimateHours: 1.5` → 422 and the message
- `curl` `POST /api/tasks` with `estimateHours: 40` → 201

## Decisions the ticket leaves open

- **`null` is treated as absent.** JSON clients often send `null` for "no value"; the stored result is the same
  as omitting the field.
- **No coercion of strings**, numeric ones included: `"3"` is rejected, as the ticket says.
- **No automated route test.** The repo has no HTTP test setup and adding one means new dependencies. The route
  is unchanged; AC 4 is covered by the manual `curl` check above and listed under known gaps in the PR.

## Non-goals

- No database migration; the `check` on `estimate_hours` stays as it is.
- No UI change.
- No change to title rules or status transitions.
