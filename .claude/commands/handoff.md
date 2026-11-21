---
description: Save exactly ten lines of current working state for the next teammate or fresh session.
disable-model-invocation: true
---
# Handoff

Inspect Git branch, HEAD, status (including untracked files), and the task-local diff. Read the previous handoff if present, but replace stale claims with current evidence. Do not scan ignored artifacts or `.env*`. Do not rerun paid APIs or invent verification results.

Write `.claude/HANDOFF.md` as exactly ten nonempty physical lines, using these labels in this order. Keep each line short, with semicolon-separated values instead of nested lists:

1. `Updated:` UTC timestamp and task owner if known.
2. `Goal:` current user outcome.
3. `Branch / HEAD:` branch and short commit hash.
4. `State:` what works now versus what remains incomplete.
5. `Staged:` exact staged paths, or none.
6. `Modified / untracked:` exact paths, or none; include the handoff itself if changed/new.
7. `Verification:` commands actually run and their results, or not run.
8. `Demo / deploy:` verified URL and status, or unverified; label saved-example mode.
9. `Blockers:` concrete blockers or none; variable names only, no secret values.
10. `Next priority:` exactly one actionable next step, with the relevant path or command.

Use literal labels, not the numbered list above, in the generated file. Recheck status after writing so the file list is accurate. Preserve unrelated work; do not auto-stage, commit, or push. Tell the teammate to read `.claude/HANDOFF.md` after `/clear`; it is not loaded automatically. Finish with a short saved-path confirmation.
