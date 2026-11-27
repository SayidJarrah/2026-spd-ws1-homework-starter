# Evidence — TASK-7 whole-hours

- Revision: `3e9778b80f449ca0aad4f82292be61769f1a2cd5` (`git rev-parse HEAD`, clean working tree)
- Ran: 2026-11-27 16:05 UTC, macOS 26.6.2, Node v24.22.3, npm 11.19.1
- Who ran it: Claude Code (claude-opus-5-5), driven by @SayidJarrah
- Ticket: [docs/tickets/TASK-7.md](../../tickets/TASK-7.md) · Spec: [docs/specs/TASK-7.md](../../specs/TASK-7.md)

## `npm test -- --reporter=verbose`

```text

> ws1-homework-starter@0.1.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 /Users/d.korniichuk/ai-workshop/2026-spd-ws1-homework-starter

 ✓ lib/tasks.test.ts > tasks > creates a task in todo 3ms
 ✓ lib/tasks.test.ts > tasks > rejects an empty title 1ms
 ✓ lib/tasks.test.ts > tasks > follows todo → doing → done and keeps done final 1ms
 ✓ lib/tasks.test.ts > tasks > does not skip doing 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > accepts the boundary 1 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > accepts the boundary 40 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > rejects 0 and stores nothing 1ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > rejects 41 and stores nothing 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > rejects 1.5 and stores nothing 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > rejects "3" and stores nothing 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > rejects "abc" and stores nothing 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > stores null when estimateHours is omitted 0ms
 ✓ lib/tasks.test.ts > tasks > estimateHours (TASK-7) > treats null like an omitted estimate 1ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
   Start at  17:05:11
   Duration  273ms (tests 40%, import 33%, transform 16%, worker 11%)
```

Exit code: 0

## `npm run typecheck`

```text

> ws1-homework-starter@0.1.0 typecheck
> tsc --noEmit

```

Exit code: 0

## AC 4 — `POST /api/tasks` against `npm run dev`

Server: `DB_FILE=<temp file> npx next dev --port 3077` (fresh database, migrations applied on open).

```text
$ curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3077/api/tasks -H "Content-Type: application/json" -d '{"title":"Fractional","estimateHours":1.5}'
{"error":"estimateHours must be a whole number 1..40"}
HTTP 422
$ curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3077/api/tasks -H "Content-Type: application/json" -d '{"title":"Text","estimateHours":"abc"}'
{"error":"estimateHours must be a whole number 1..40"}
HTTP 422
$ curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3077/api/tasks -H "Content-Type: application/json" -d '{"title":"Full week","estimateHours":40}'
{"id":1,"title":"Full week","status":"todo","assignee":null,"estimateHours":40,"createdAt":"2026-11-27T16:05:23.934Z"}
HTTP 201
$ curl -s -w "\nHTTP %{http_code}\n" http://localhost:3077/api/tasks
[{"id":1,"title":"Full week","status":"todo","assignee":null,"estimateHours":40,"createdAt":"2026-11-27T16:05:23.934Z"}]
HTTP 200
```

The two rejected requests stored nothing: the list holds only the accepted task.

## Not verified

- No automated HTTP test for the route (the repo has none); AC 4 is covered by the manual `curl` run above.
- `npm run build` was not run: no build or config change in this PR.
- Only macOS / Node 24 locally; CI runs the trace gate, not the tests.
