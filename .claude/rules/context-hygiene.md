# Small context, current state

- At session start, read `.claude/HANDOFF.md` if it exists, then verify its branch, HEAD, and modified-file claims with Git. After `/clear`, do the same; the handoff is not automatically imported.
- Read only source files relevant to the task. `.claudeignore` is an inventory, not a supported Claude Code exclusion mechanism; `.claude/settings.json` supplies the file-tool deny rules.
- Do not work around excluded artifacts or `.env*` with shell readers, scripts, MCP, or subagents. Build tools may consume environment files normally, but never print their contents.
- Permission patterns are not an OS sandbox for arbitrary subprocesses. Never claim they guarantee secrecy or prevent every destructive shell spelling.
- Preserve teammates' changes. Stage named files only; commit or push only when requested. A command allow rule removes a prompt, not the need for user authorization. Never clean, stash, hide, or discard work just to report a clean tree.
