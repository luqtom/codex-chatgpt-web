# Fork implementation plan — ChatGPT Projects

Goal: optionally route Codex tasks and subagents to an existing selected ChatGPT Project without cluttering personal history.

1. **Research gate — BLOCKED for live DEV**: record the actual project URL and DOM on an authorized isolated ChatGPT account, including authenticated workspace and post-send membership. Do not infer selectors.
2. **Routing policy — PARTIAL**: integrate the checked-in fail-closed policy into task-bound browser worker (not login, probes, smoke or connector verification). Reject ambiguous navigation without private-history fallback.
3. **Launcher settings — NOT RUN**: optional existing Project selection, default OFF, account binding, safe private persistence, migration and rollback; manual instructions for Zero Risk.
4. **Task/agent behavior — NOT RUN**: retained chats, exact conversation identity, compaction, cancellation, images, streaming, MCP, Browser-only, V1, Web↔Web and native↔Web.
5. **Validation — NOT RUN**: Bun frozen install (root and launcher), `bun run verify`, `bun run smoke:subagents`, `bun run app:smoke`, packaging/audit where relevant and Linux/Windows/macOS Actions jobs.
6. **Live E2E — BLOCKED**: explicit additional authorization and isolated DEV Project; ensure chats appear and remain in chosen Project, with fail-closed negative tests.
7. **Review/release — PENDING**: keep as Draft; publishing branch and Draft PR was explicitly authorized, but merge and release were not.

Invariant: Projects are an organizational context, not a security boundary. Never auto-create, move, archive or delete conversation history. No actual Project IDs, cookies, prompts or tokens in source, PR or exported logs.

Current PR: https://github.com/luqtom/codex-chatgpt-web/pull/1. Do not mark Projects production-ready without isolated live E2E evidence.
