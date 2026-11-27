<!-- owner: @SayidJarrah · why: CI (trace gate) and reviewers walk back from a commit to its ticket and evidence; an "AI used: yes/no" checkbox can't be audited per commit, trailers can · review-by: 2027-05-27 -->

# Commits — trailers

Every commit of a traced change ends with trailers (last paragraph, one per line):

- `Refs: <KEY>` — always, e.g. `Refs: TASK-7`. The branch is `<KEY>-<slug>`, the PR title starts with `<KEY>`.
- `Assisted-by: <tool> (<model>)` — when an agent wrote or changed any part of the commit; omit for human-only commits.
- `Evidence: docs/evidence/<KEY>/<slice>.md` — only on the evidence commit: the file with commands, outputs,
  exit codes and the SHA they ran on.

Order of work: commit the code → run `npm test` and `npm run typecheck` → write the evidence with that SHA
(`git rev-parse HEAD`) → commit only the evidence. Any later code commit makes the evidence stale.

Example:

```text
Reject fractional estimates

estimateHours must be a whole number 1..40; the API answers 422 otherwise.

Refs: TASK-7
Assisted-by: Claude Code (claude-opus-5-5)
```

Single line (git 2.32+, PowerShell, cmd and Git Bash):
`git commit -m "Reject fractional estimates" --trailer "Refs: TASK-7" --trailer "Assisted-by: Claude Code (claude-opus-5-5)"`

Check: `git log -1 --format="%(trailers)"`. Run the gate before pushing:
`node docs/ai/ci/trace-gate.mjs --base origin/main --head HEAD --title "TASK-7 <summary>" --key-pattern "TASK-[0-9]+"`
