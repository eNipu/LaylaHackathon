---
description: Verify types and production build, fix task-local failures, then suggest one commit command.
disable-model-invocation: true
---
# Ship

1. Read Git status and the current task's diff. Preserve unrelated edits; never stage, commit, push, or deploy automatically.
2. Run `npx tsc --noEmit && npm run build` from the repo root.
3. If either fails, diagnose and make the smallest task-local fix, then rerun the full command. Do not bypass checks, weaken types, edit excluded artifacts, or alter unrelated work. If blocked by credentials, dependencies, or an out-of-scope error, report the blocker and do not claim readiness.
4. Inspect the final diff and confirm only intended files would be staged. Warn if the index already includes unrelated work.
5. On success, output exactly one shell-safe line: a `git add -- <explicit task files> && git commit -m "<accurate summary>" -m "Co-Authored-By: Warp <agent@warp.dev>"` command. Substitute real reviewed paths and a meaningful message; never use `git add .` or include secrets. Do not execute this line.
6. Do not append `git push`: the caller decides when to push. Railway deploys connected `main` after a normal push and runs its own lint/test/build gate; a local commit alone is not a deployment.
